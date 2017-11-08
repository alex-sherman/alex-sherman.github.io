---
layout: default
title: Reentrant Async Locks in C#
subtitle: Implementing TPL lock reentrancy
---

Moving to `Task` and `async`/`await` has likely made most C# developers' lives easier overall.
There are several sort of nuisances that come along with the TPL however, one of which being the following compiler error:

```C#
private object _lock = new object();
async Task Synchronized(DataType data)
{
    lock(_lock)
    {
        await DoSomeWork(data);
        await AnotherSynchronized(data);
    }
}
async Task AnotherSynchronized(DataType data)
{
    lock(_lock)
    {
        await DoWork(data);
    }
}
```

Using `await` inside a `lock` statement is strictly forbidden by the compiler.
So how do we get around this? We could implement a new `lock`, `AsyncLock` ourselves.
Let's first look at how `lock` is implemented and understand why this is a compiler error.

Monitor
=========
C#'s `lock` statement is built around the `Monitor` synchronization primitive.
A `Monitor` is mutually exclusive, except that lock acquisition is reentrant.
This means that if a thread already posses a `Monitor` lock and attempts to reacquire it, that the lock will be immediately acquired.
This reacquisiting can happen any number of times, so the `Monitor` is then only released when an equal number of releases have been called.

If we change our original code to use `Monitor` instead, we can immediately see a problem when execution occurs.

```C#
private object _lock = new object();
async Task Synchronized(DataType data)
{
    Monitor.Enter(_lock);
    await DoSomeWork(data); // If this is long running, a thread transition may occur
    await AnotherSynchronized(data);
    Monitor.Exit(_lock);
}
async Task AnotherSynchronized(DataType data)
{
    // Now we may be in a different thread, this could block causing deadlock!
    Monitor.Enter(_lock);
    await DoWork(data);
    Monitor.Exit(_lock);
}
```

When using `async`/`await`, we are not guaranteed to resume executing on the same thread as before. And more importantly, we are not gauranteed that another `Task` may not preempt our own and "acquire" any `Monitor` locks that were acquired by the previous running `Task`. An example of the second [case can be seen here](http://briandunnington.github.io/reentrant-async-locks.html). Both of these issues mean that `lock` and `Monitor` are not an appropriate solution to synchronization in TPL.

AsyncLock Implementations
========
There exist already many `AsyncLock` implementations that are meant to be used with TPL.
There's [this one by Stephen Cleary](https://github.com/StephenCleary/AsyncEx/wiki/AsyncLock), which is based off of [this one by Stephen Toub](https://blogs.msdn.microsoft.com/pfxteam/2012/02/12/building-async-coordination-primitives-part-6-asynclock/), and I'm sure many more like them.
I think these are the most convenient style `AsyncLock`, because they make use of C#'s `using` statement to behavior similarly to the original `lock` statement we're trying to replace.
They work like this:
```C#
private AsyncLock _lock = new AsyncLock();
async Task Synchronized(DataType data)
{
    using(await _lock.Acquire())
    {
        await DoSomeWork(data);
        await AnotherSynchronized(data);
    }
}
async Task AnotherSynchronized(DataType data)
{
    using(await _lock.Acquire()) // Still produces deadlock!
    {
        await DoWork(data);
    }
}
```
These locks are still explicitly not reentrant, they are documented specifically that way. Lastly I propose a new kind of lock, `REAsyncLock` that both works with `async`/`await` and is reentrant (in some way).

REAsyncLock and CallContext Reentrancy
==========
I believe we need to define a more granular scope of reentrancy in order to program with locks the same way we did before `async`/`await`. The problem we run into now is that threads are no longer the unit of execution that we must target when designing locks, but rather `Task` and even more specifically the code execution path.
I propose the following lock implementation which is capable of being reentered from the same code execution path, which need not necessarily be the same thread.
```C#
private string id;
private SemaphoreSlim sem = new SemaphoreSlim(1);
public REAsyncLock(string id = null)
{
    this.id = "REAsyncLock." + (id ?? Guid.NewGuid().ToString());
}
public async Task DoWithLock(Func<Task> body)
{
    bool acquired = false;
    if(!(((bool?)CallContext.LogicalGetData(id)) ?? false))
    {
        await sem.WaitAsync();
        CallContext.LogicalSetData(id, true);
        acquired = true;
    }
    try
    {
        await body();
    }
    finally
    {
        if (acquired)
        {
            CallContext.FreeNamedDataSlot(id);
            sem.Release();
        }
    }
}
```
The interesting mechanism in this lock is the use of `CallContext.LogicalSet/GetData`.
These functions allow us to store data in the `CallContext` that will flow with the code execution of the running task.
This means that anything called by `DoWithLock` will see that it already has acquired the lock and skip acquiring the semaphore.
Unforutantely it follows that we cannot use the nice `using` statment, since the body of the statement would be outside the code execution path we have control over.
Instead, our examples now become:
```C#
private REAsyncLock _lock = new REAsyncLock();
async Task Synchronized(DataType data)
{
    await _lock.DoWithLock(async () =>
    {
        await DoSomeWork(data);
        await AnotherSynchronized(data);
    });
}
async Task AnotherSynchronized(DataType data)
{
    await _lock.DoWithLock(async () =>
    {
        await DoWork(data);
    });
}
```
It may not look as pretty as the existing implementations of `AsyncLock`, but it certainly allows for designs that have much higher code reuse by having called functions also reenter locks.
At the very least I hope that `REAsyncLock` can be used to translate previous uses of C#'s `lock` statement into something that plays nice with TPL.
---
layout: default
title: Reentrant Async Locks in C#
subtitle: Implementing TPL lock reentrancy
priority: 1
---

Moving to `Task` and `async`/`await` has likely made most C# developers' lives easier overall.
There are several sort of nuisances that come along with the TPL however, one of which being the following compiler error:

{% highlight C# %}
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
{% endhighlight %}

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

{% highlight C# %}
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
{% endhighlight %}

When using `async`/`await`, we are not guaranteed to resume executing on the same thread as before. And more importantly, we are not gauranteed that another `Task` may not preempt our own and "acquire" any `Monitor` locks that were acquired by the previous running `Task`. An example of the second [case can be seen here](http://briandunnington.github.io/reentrant-async-locks.html). Both of these issues mean that `lock` and `Monitor` are not an appropriate solution to synchronization in TPL.

AsyncLock Implementations
========
There exist already many `AsyncLock` implementations that are meant to be used with TPL.
There's [this one by Stephen Cleary](https://github.com/StephenCleary/AsyncEx/wiki/AsyncLock), which is based off of [this one by Stephen Toub](https://blogs.msdn.microsoft.com/pfxteam/2012/02/12/building-async-coordination-primitives-part-6-asynclock/), and I'm sure many more like them.
I think these are the most convenient style `AsyncLock`, because they make use of C#'s `using` statement to behavior similarly to the original `lock` statement we're trying to replace.
They work like this:
{% highlight C# %}
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
{% endhighlight %}
These locks are still explicitly not reentrant, they are documented specifically that way. Lastly I propose a new kind of lock, `REAsyncLock` that both works with `async`/`await` and is reentrant (in some way).

REAsyncLock and Call Context Reentrancy
==========
I believe we need to define a more granular scope of reentrancy in order to program with locks the same way we did before `async`/`await`. The problem we run into now is that threads are no longer the unit of execution that we must target when designing locks, but rather `Task` and even more specifically the code execution path.
I propose the following lock implementation which is capable of being reentered from the same code execution path, which need not necessarily be the same thread.
{% highlight C# %}
class REAsyncLock
{
    private AsyncLocal<SemaphoreSlim> currentSemaphore =
        new AsyncLocal<SemaphoreSlim>() { Value = new SemaphoreSlim(1) };

    public async Task DoWithLock(Func<Task> body)
    {
        SemaphoreSlim currentSem = currentSemaphore.Value;
        await currentSem.WaitAsync();
        var nextSem = new SemaphoreSlim(1);
        currentSemaphore.Value = nextSem;
        try
        {
            await body();
        }
        finally
        {
            Debug.Assert(nextSem == currentSemaphore.Value);
            await nextSem.WaitAsync();
            currentSemaphore.Value = currentSem;
            currentSem.Release();
        }
    }
}
{% endhighlight %}
The interesting mechanism in this lock is the use of `AsyncLocal<>.Value` (suggested by Reddit user [tweq](https://www.reddit.com/user/tweq)).
This type allows us to store data that will flow with the code execution of the running task across threads.
Each successive call to `DoWithLock` produces a new semaphore for the children in the `body` function to contend over.
Unforutantely it follows that we cannot use the nice `using` statment, since the body of the statement would be outside the code execution path we have control over.
Instead, our examples now become:
{% highlight C# %}
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
{% endhighlight %}
It may not look as pretty as the existing implementations of `AsyncLock`, but it certainly allows for designs that have much higher code reuse by having called functions also reenter locks.
There is also a caveat where if a `Task` which has been started inside a `DoWithLock` body and attempts to acquire the same lock after the `DoWithLock` body has completed (meaning it was not awaited) the `Task` will deadlock.
This can be avoided by making sure all calls to `DoWithLock` are awaited all the way up the call stack.
While it's not a silver bullet, at the very least I hope that `REAsyncLock` can be used to translate some previous uses of C#'s `lock` statement into something that plays nice with TPL.
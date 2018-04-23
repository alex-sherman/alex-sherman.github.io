---
layout: default
title: Unsync
subtitle: Unsynchronizing async/await in Python 3.6
priority: 32
---

I'm going to rant a little about `async`/`await` in Python, and then describe in detail what I did to fix it.
If you would rather see documentation/examples of my solution, [unsync can be found on GitHub](https://github.com/alex-sherman/unsync/).

## What's wrong?

Python 3.5 added support for `async`/`await`, and Python 3.6 sort of wrapped up support for it
(adding things like supporting `await` in list comprehensions). Unfortunately I've been having trouble adapting
to Python's version of `async`/`await` especially coming from C#'s implementation in TPL. The two big
friction points I've had are:

- Difficult to "fire and forget" `async` calls (need to specifically run the event loop)
- Can't do blocking calls to `asyncio.Future.result()` (it throws an exception)

Python's implementation of `async`/`await` is very simple, it revolves around an event loop. All `async`
functions get executed in an event loop, and the way they get executed is really simple. Awaitable functions
get entered into an event loop, the loop gets polled for any functions that are able to run, and any that are
get executed until they encounter another `await` at which point they get queued to be run again later.
The annoying part is that very little of this is done for us, here's what it looks like in practice:
{% highlight python %}
async def sync_async():
    await asyncio.sleep(0.1)
    return 'I hate event loops'

annoying_event_loop = asyncio.get_event_loop()
future = asyncio.ensure_future(sync_async(), loop=annoying_event_loop)
annoying_event_loop.run_until_complete(future)
print(future.result())
{% endhighlight %}

We need to acquire an even loop, do some weird call to execute the `async` function in that event loop,
and then **synchronously execute the event loop ourselves**. Imagine doing this everytime you have an `async`
operation you want to perform, it's just kind of unwieldy.

## What can we do?

C# had this great idea of executing each `Task` (their version of a `Future`) first synchronously
in the main thread until an `await` is hit, and then queueing it into an ambient thread pool
to continue later *possibly in a separate thread*. Python did not take this approach and my hunch is that the
Python maintainers didn't want to add an ambient thread pool to their language (which makes sense).
I, however, am not the Python maintainers and *did* add an ambient thread (singular). I stuffed all the boiler
plate into a decorator and the result looks like this:

{% highlight python %}
@unsync
async def unsync_async():
    await asyncio.sleep(0.1)
    return 'I like decorators'

print(unsync_async().result())
{% endhighlight %}

It skips all the boiler plate, just mark `async` functions with `unsync` and everything is taken care of.

## How does unsync work?

I addressed both of my gripes with a separate solution:
- Fire and forget
  - `unsync` does all the event loop acquisition and running behind the scenes
  - The event loop it uses is **not** the usual, `unsync` makes its own in a **new thread** whose sole purpose
  is to execute `unsync` functions
- Blocking calls to `result()`
  - `unsync` functions return an `Unfuture` which is a mashup of `asyncio.Future` and `concurrent.Future`
  - Calls to `Unfuture.result()` are usually blocking, except in `unsync`'s ambient event loop thread
  where it will throw an exception to avoid deadlock

## Aren't threads in Python pointless?

Yeah more or less, but this is a case where they work quite well.
Execution is going to happen in only one thread at a time in a Python process.
That's fine though since `async` functions aren't executing when they're stuck on an `await`.
As long as the calls to `await` are IO bound, or execute in a separate process everything is fine.
To support IO bound workloads that can't be easily waited, using `@unsync` on a regular
function (not an `async` one) will cause it to be executed in a `ThreadPoolExecutor`. To support CPU bound
workloads, you can use `@unsync(cpu_bound=True)` to decorate functions which will be executed in a
`ProcessPoolExecutor`. All of these variations return an `Unfuture`, which will get handled by the
ambient `unsync.thread` in the calling proccess.

## Another Future, really?

Obviously the solution to having two separate and entirely different `Future` types is to add a third, `Unfuture`.
I wanted the best of both worlds, and the only solution I could see was to wrap both existing `Future` types
and expose only the parts I wanted out of each. The important features of `Unfuture` are:
- Blocking `result()`, except when in `unsync.thread` which will raise an exception
- Awaitable, defines an `__await__` method allowing it to be `await`ed
- Supports continuations with `then(continuation)`
  - `continuation` is a callback, which will be called when the `Unfuture` is completed
    - It can return an awaitable value, which will be `await`ed
    - It is passed the completed `Unfuture` as its only argument
  - `then(continuation)` returns an `Unfuture` whose result will be the value returned by `continuation`

These features make `Unfuture` more versatile and easy to use than either of the builtin `Future` classes.

## Further reading

To see more examples, check out the [GitHub page for unsync](https://github.com/alex-sherman/unsync/).
I'm very welcome to contributions in the form of both issues and pull requests, so please feel free to
contribute!

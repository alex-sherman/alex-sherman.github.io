---
layout: default
title: Building C# Lambda Expressions with LINQ
subtitle: Creating LINQ expressions for Entity Framework with dynamic/iterative AND/OR operations
---

This post contains a solution for a problem I often face when writing a specific class of
queries in an ORM framework. The simplest example of this class of query is: imagine
we store user date, like images, and the users can assign a set of tags to their images.
They might use tags like "Summer 2016", "Outdoors", "Friends", etc.

Now we want to implement a search functionality where the user can specify sets of tags
they wish to see photos of. For instance a user query might look like:

`("Summer 2016" AND "Outdoors") OR ("Friends")`

Let's first consider a simplified version, with the following query:

`"Outdoors" OR "Friends"`

Iterative Unions (Don't Work)
-----
In this case we can take, as input to our function, a list of the tags we want to `OR`
together. Then we could use an iterative application of `Union` to produce the desired
result set.

```csharp
IQueryable<UserImage> AllImages;
public IQueryable<UserImage> TagQuery(IEnumerable<string> tags)
{
    var result = Enumerable.Empty<UserImage>().AsQueryable();
    foreach (var tag in tags)
    {
        result = result.Union(AllImages.Where(image => image.Tags.Contains(tag)));
    }
    return result;
}
```

This technically works, but at the time of writing this EF Core currently does not support
`Union`. This will result in a query to the database for each tag a user supplies rather than
one single query which returns all of the images matching the user's input.

Expression Form
------

In an ideal solution, we would have a single `Where` expression that contains an
`Expression<Func<UserImage, bool>>` that returns `true` on images we want, and `false` on
images we don't. An `Expression<Func<,>>` can be made in one of two ways. The most common
way is off limits to us, we cannot write a compile time constant lambda expression that
will satisfy the needs of our query because the terms in the expression will vary depending
on the user's input. The expression we're aiming for looks something like:

`image => image.Tags.Contains("Outdoors") || image.Tags.Contains("Friends")`

So the next question might be, can we *construct* this expression by building it up out of
several compile time expressions? Perhaps surprisingly, the answer is yes.

LINQ Expression Solution
=======

I'd like to quickly show what the solution looks like, describe it in a little detail and
then finally show the implementation at the very bottom. Here's what the solution looks like:

```csharp
var tags = new[] { "Outdoors", "Friends" };
var exp = tags.SelectExp<string, UserImage, bool>(tag => image => image.Tags.Contains(tag))
    .BinaryCombinator(Expression.Or);
return AllImages.Where(exp);
```

The non-standard `SelectExp` and `BinaryCombinator` create the expression we're looking for.
In this example we create a subexpression for each tag in `tags` and `||` them all together.
This produces exactly the expression we were looking for in the previous section.

SelectExp
-------

This extension method is really just syntactic sugar, it makes writing a `Select` that takes
lambda expressions a little more convenient. The full body is simple:

```csharp
public static IEnumerable<Expression<Func<T, U>>> SelectExp<V, T, U>(this IEnumerable<V> vs, Func<V, Expression<Func<T, U>>> selector)
{
    return vs.Select(selector);
}
```

The import thing to note is that we're writing a `Select` which returns an `Expression<Func<T, U>>`, which means the selector is a lambda whose return value is a lambda. It's a bit
meta, but it then allows us to create an `IEnumerable<Expression<Func<T, U>>>` which contains
one expression per tag that we care about. The result of the `SelectExp` in our example looks
something like:

```csharp
[
    image => image.Tags.Contains("Outdoors"),
    image => image.Tags.Contains("Friends")
]
```

BinaryCombinator
-------

Now comes the tricky part, we have a list of lambda expressions that are pretty close to what
we want. The last problem is to just `||` all these expressions together. This is kind of
hand wavey, but the steps to do this look roughly as follows.

1. Remove the image parameter part of the lambdas
```csharp
[
    image.Tags.Contains("Outdoors"),
    image.Tags.Contains("Friends")
]
```

2. Or all the terms together
```csharp
image.Tags.Contains("Outdoors") || image.Tags.Contains("Friends")
```

3. Create a new lambda out of the result
```csharp
image => image.Tags.Contains("Outdoors") || image.Tags.Contains("Friends")
```

All these steps are done inside of `BinaryCombinator` which also generalizes step #2 to any
aggregation of expression terms, meaning it can work for `||` as well as `&&`.

Full Solution Source
==========

I've left out a few subtle details in the explanation, but for those who care I think the
source of the solution contains a better explanation than I can write out. The one really
unexplained piece is `ConstantReplacer`, which is necessary because of the way that C#
lambdas capture free variables. I would highly encourage anyone who is curious to just
debug into some of these methods, the debug view of expressions is really quite nice.

**Disclosure: use in production at your own risk, this likely contains bugs and/or security
flaws**

```csharp
public static class LINQExpressionExtensions
{
    public static Expression<Func<TElement, bool>> BinaryCombinator<TElement>(
        this IEnumerable<Expression<Func<TElement, bool>>> lambdas, Func<Expression, Expression, Expression> combinator)
    {
        var parameter = Expression.Parameter(typeof(TElement), "element");
        var constantReplacer = new ConstantReplacer();
        return Expression.Lambda<Func<TElement, bool>>(
            lambdas
            .Select(lambda => new ParameterReplacerVisitor(lambda.Parameters[0], parameter).VisitAndConvert(lambda.Body, "BinaryCombinator"))
            .Select(body => constantReplacer.VisitAndConvert(body, "BinaryCombinator"))
            .Aggregate(combinator), parameter);
    }
    class ConstantReplacer : ExpressionVisitor
    {
        protected override Expression VisitMember(MemberExpression node)
        {
            var member = node.Member;
            if (node.Expression.NodeType == ExpressionType.Constant && member.MemberType == MemberTypes.Field)
            {
                var field = member.DeclaringType.GetField(member.Name);
                return Expression.Convert(
                    Expression.Constant(field.GetValue(((ConstantExpression)node.Expression).Value)),
                    field.FieldType);
            }
            return base.VisitMember(node);
        }
    }
    class ParameterReplacerVisitor : ExpressionVisitor
    {
        ParameterExpression ReplaceWith;
        ParameterExpression ToReplace;
        public ParameterReplacerVisitor(ParameterExpression toReplace, ParameterExpression replaceWith)
        {
            ToReplace = toReplace;
            ReplaceWith = replaceWith;
        }
        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == ToReplace ? ReplaceWith : base.VisitParameter(node);
        }
    }
    public static IEnumerable<Expression<Func<T, U>>> SelectExp<V, T, U>(this IEnumerable<V> vs, Func<V, Expression<Func<T, U>>> selector)
    {
        return vs.Select(selector);
    }
}
```
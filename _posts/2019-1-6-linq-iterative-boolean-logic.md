---
layout: default
title: Iterative Boolean Operator Expressions for C# LINQ
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

Iterative Unions
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

WhereOr
------

After a bit of searching I stumbled across [this article](http://www.booden.net/MultiOr.aspx)
which was the basis for my following `WhereOr` extension method:

```csharp
public static IQueryable<TElement> WhereOr<TElement, TValue>(this IQueryable<TElement> source,
    IEnumerable<TValue> values, Expression<Func<TElement, TValue, bool>> expression)
{
    var elementParam = expression.Parameters.First();
    var equals = values.Select(value => (Expression)Expression.Invoke(expression, elementParam, Expression.Constant(value)));
    var body = equals.Aggregate((accumulate, equal) => Expression.Or(accumulate, equal));
    return source.Where(Expression.Lambda<Func<TElement, bool>>(body, elementParam));
}
```

This extension method operates on a queryable and adds a `Where` with a body that is an
aggregation of `OR`s of invocations of the provided boolean expression with each element
from the `IQueryable` and all of the provided `values`. Using it can then convert our
original code snippet into a nice one-liner:

```csharp
AllImages.WhereOr(tags, (image, tag) => image.Tags.Contains(tag));
```

Using our example, this will produce a `Where` with the following body:

```
WHERE (
    image.Tags.Contains("Outdoors") OR
    image.Tags.Contains("Friends")
)
```

WhereAggregator
-------
This can be generalized to account for iterative applications of `OR` and `AND`.

```csharp
public static IQueryable<TElement> WhereOr<TElement, TValue>(this IQueryable<TElement> source,
    IEnumerable<TValue> values, Expression<Func<TElement, TValue, bool>> expression)
    => source.WhereApplicator(values, expression, Expression.Or);
public static IQueryable<TElement> WhereAnd<TElement, TValue>(this IQueryable<TElement> source,
    IEnumerable<TValue> values, Expression<Func<TElement, TValue, bool>> expression)
    => source.WhereApplicator(values, expression, Expression.And);
static IQueryable<TElement> WhereApplicator<TElement, TValue>(this IQueryable<TElement> source,
    IEnumerable<TValue> values, Expression<Func<TElement, TValue, bool>> expression,
    Func<Expression, Expression, Expression> aggregator)
{
    if (expression == null) throw new ArgumentNullException("expression");
    var elementParam = expression.Parameters.First();
    var equals = values.Select(value => (Expression)Expression.Invoke(expression, elementParam, Expression.Constant(value)));
    var body = equals.Aggregate(aggregator);
    return source.Where(Expression.Lambda<Func<TElement, bool>>(body, elementParam));
}
```
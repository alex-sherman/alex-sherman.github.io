---
layout: default
title: Simple Computer Graphics Part 2 (Vectors and Transforms)
subtitle: Understanding how we can describe space
---

This is usually the part of computer graphics where people start talking about linear algebra and matrix transposes and inversions and people's eyes start
to glaze over. Well I have no clue what any of that is so hopefully I'll be able to cover this rather mathy faffy subject in a way that still makes sense.
Instead of messing around with a bunch of math, I'm just going to quickly walk through what will become our vector.js file and then do some example uses of vectors.

Vector.js
==========

{% include_relative graphics/vector.html %}

Let's go through this really quick and then get to some examples.
Firstly a vector is comprised of x y and z values (let's just ignore w for now it'll come up later). We allow any of these to be excluded in the constructor with that derpy ternary operator thing.
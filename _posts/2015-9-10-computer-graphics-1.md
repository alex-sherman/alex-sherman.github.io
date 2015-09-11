---
layout: default
title: Simple Computer Graphics Part 1 (Canvas)
subtitle: The first part in a short series of computer graphics introduction
---

There are tons of resources and tutorials on computer graphics, so why bother writing another? I have never found a good, simple,
computer graphics explanation. This will be a short, simple, series on graphics that doesn't have any faffy math in it because, honestly,
I don't understand it and it's not required. Basically I'm just a simple programmer, and I'm hoping to write a tutorial for the non-math major
programmers out there.

All of this tutorial will be in Javscript (I know gross), but the upside is you'll be able to edit it straight in these pages and see what happens.
Additionally I will try to limit myself to not using *any* third party libraries. The tutorial will only make use of standard Javscript functionality
like canvas and all the other work will be done by in the tutorial. I also expect people reading this to be relatively familiar with basic geomtry and math,
like how we would describe points in 2D and 3D. That's enough intro, let's get right into it and take a look at canvas.

Canvas
--------

To begin everything let's introduce ourselves to canvas. This API is well documented so I won't explain too much here other than providing an example.
The example sets the canvas size, gets a 2D context for drawing with, clears the canvas and then draws a line from the upper left corner to the lower right.
Mess around with it, try changing the color or position of the line and clicking "Run It" again.

{% include_relative graphics/canvas.html %}

Sadly I'm going to stick with lines for a while, I hope it's not too boring and I do promise to get to textured 3D objects in this tutorial. Also, if canvas doesn't
make sense to you, that's fine. As along as you figured out how to change where the line is drawn and its color that's all the functionality we need to continue on to our next topic.

Next: Vectors and Transforms
----------
---
layout: default
title: Quickly Writing Networked Applications
subtitle: Resources to get your applications working as fast as possible
---

I write a lot of networked applications for my work, research and personal projects and I've built up a few resource a long the way that allow me to get applications running as quickly as possible. I'd like to briefly share these tools for others to use in order to spend less time writing network code, and more time focusing on their application.

[Flask](http://flask.pocoo.org/)
---------

Flask is a Python web framework rather similar to Django but in my opinion much simpler to use. For web applications, Flask is my certainly my first choice. In most ways it is very well made, but it still takes a little while to get an application started. I've [created a repository](https://github.com/alex-sherman/flask-multi-site) that includes some starting template code and some much needed improvements to the Flask Jinja loading code. Peter Den Hartog helped write this and has a blog post about it [here.](http://fewstreet.com/2015/01/16/flask-blueprint-templates.html)

[Python-JRPC](http://alex.vector57.net/python-jrpc/) and [libjrpc](https://github.com/alex-sherman/libjrpc)
---------

If you'd rather not spend as much time making a rich web application, lighter RPC frameworks might be more appealing. RPC allows servers to expose public procedures that clients can call and receive data from. There are a lot of options out there, but I'll mention the ones I've written myself. JSON RPC is specification for an RPC protocol that uses JSON as its message format. I've written libraries in Python and C that implement this protocol in as simple a way as possible. The examples on the Python-JRPC page should give a pretty clear explanation as to how simple this framework is. Both of these libraries are interoperable meaning you can write Python or C code on either end of your client-server application.

[EDSM](https://github.com/alex-sherman/edsm) (work in progress)
--------

If you're writing a distributed application in C, Extendable Distributed System Manager provides some low level implementation to help get your applciation running. EDSM provides an easy way to get your application running on multiple machines and allows some simple communication interfaces. Aditionally EDSM impelements an abstraction for distributed objects, and even some synchronization primitives. If your application requires shared memory, EDSM even provides distributed shared memory! This project was written for a graduate class at UW Madison.
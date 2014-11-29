---
layout: default
title: Python-JRPC
subtitle: A simple remote procedure call framework for Python
---

{{ content }}

[Python-JRPC is available on Github](https://alex-sherman.github.io/python-jrpc) as open source software. I wrote this framework to solve
some needs we have at my work and thought it might be used else where.

Motivation
---
I aim only to provide a simple way to describe your networked applications. In this framework a server is simply a python class
exposing some public methods that proxy objects can call locally in client applications. The goal was to make network programming
like regular programming. You work only in describing your classes/logic, and throwing/handling exceptions.
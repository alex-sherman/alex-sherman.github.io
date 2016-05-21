---
layout: default
title: Python-JRPC and libjrpc
subtitle: A simple remote procedure call framework for Python and C
---

{{ content }}

[Python-JRPC](https://alex-sherman.github.io/python-jrpc) and [libjrpc](https://alex-sherman.github.io/libjrpc) are available on Github as open source software.

Overview
---
This framework can be used to provide a simple way to describe your networked applications. RPC protocols allow programs to execute code on remote machines by calling remote procedures. JRPC is a specific RPC protocol where all communication is serialized in JSON. The libraries I've written implement JRPC for Python and C. The point of these libraries is to make network application development much simpler than dealing with low level socket APIs. The goal is to allow developers to focus on adding functionality to their applications rather than worrying about defining protocols and client-server interactions.
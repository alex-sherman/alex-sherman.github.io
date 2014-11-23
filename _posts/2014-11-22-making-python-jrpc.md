---
layout: post
title: "Simplifying Python Client/Server Programs"
subtitle: "Making powerful network applications with Python-JRPC"
description: "An overview of the Python-JRPC framework and why it will save yout ime"
category: programming
tags: [python, rpc, json, programming]
---
{% include JB/setup %}

At some point in every programmer's life, they write a program that uses sockets.
Half of the time they spend writing the program is looking up socket documentation,
or coming up with some message format, or making the application thread safe.
Let's look at the client/server example on the [Python socket page:](https://docs.python.org/2/library/socket.html#example)

Server
{% highlight python %}
import socket
HOST = ''                 # Symbolic name meaning all available interfaces
PORT = 50007              # Arbitrary non-privileged port
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen(1)
conn, addr = s.accept()
print 'Connected by', addr
while 1:
    data = conn.recv(1024)
    if not data: break
    conn.sendall(data)
conn.close()
{% endhighlight %}

Client
# Echo client program
import socket

HOST = 'daring.cwi.nl'    # The remote host
PORT = 50007              # The same port as used by the server
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
s.sendall('Hello, world')
data = s.recv(1024)
s.close()
print 'Received', repr(data)
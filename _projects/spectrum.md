---
layout: default
title: Spectrum
subtitle: A game engine for Monogame/XNA
---

In my spare time I develop a game engine. The project started when I was in high school and has helped me
to become the developer I am today. The engine has changed drastically from its beginnings and is getting close
to a state where I would like to release it. Written entirely in C#, the Spectrum provides a graphics engine,
physics engine, peer-to-peer networking service and an entity management system.

Entity Management
---
Entities and game objects are the building blocks of any game and shouldn't have to be implemented by every
single person making a video game. However, Monogame and XNA have no notion of game objects. I provide extremely 
low level implementations of these objects so the game developer is writing a game, not an engine.

Networking
---
Physics and graphics are pretty standard in game engines, but Spectrum offers a networking service like
no other engine or game before it. Peer-to-peer networking offers infinite scaling but makes certain
features difficult implement or sometimes impossible. The idea of cheat prevention is especially difficult
but with some consolations, it is certainly possible.
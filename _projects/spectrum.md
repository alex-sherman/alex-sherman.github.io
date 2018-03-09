---
layout: default
title: Spectrum
subtitle: A game engine for Monogame
priority: 16
---

In my spare time I develop a game engine. The project started when I was in high school and has helped me
to become the developer I am today. The engine has changed drastically from its beginnings and is getting close
to a state where I would like to release it. Written entirely in C#, Spectrum provides a graphics engine,
physics engine, a peer-to-peer networking service and an entity management system. Spectrum is entirely open source,
and will soon be free to use.

[Example](http://defcon.faffgames.com)
---
Defense Contract is still in a very early version with place holder graphics. The core features of the engine:
graphics, networking, and physics can be seen in this simple example.

Features
=====
Spectrum provides some core components of 3D games.

Game Objects
---
Some of the hardest tasks in 3D game developement are introduced when creating the simplest unit of the game,
a game object. Game objects require 3D graphics and physics two things that Monogame does not directly supply.
Spectrum implements extensible game objects, and does some of the hard work for developers.

Networking
---
Physics and graphics are pretty standard in game engines, but Spectrum offers a networking service like
no other engine or game before it. Peer-to-peer networking comes with certain challenges, but it gives game developers
the power to connect their game's players in new and interesting ways.

Content
---
Monogame provides a rather clunky content importing pipeline which Spectrum does support. However, Spectrum provides
cleaner layers on top of Monogame's content importing, allowing developers to specify custom content importing techniques
for certain files.

Models and Animation
---
The content feature is important for certain things like 3D models with animations, something which is very
difficult to import using Monogame. Spectrum provides its own 3D model and animation importer that work with the g3dj filetype.
Converters exist for most common model types, .fbx .obj and so on. Blender even has plugins that allow exporting g3dj files directly.

Steam
---
Spectrum comes fully integrated with Steam. For most developers this integration is a small task, but for
networked games, especially peer-to-peer games, it can become rather complicated. Spectrum also fully utilizes
the peer-to-peer networking that Steam provides.
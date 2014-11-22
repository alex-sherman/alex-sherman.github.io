---
layout: page
title: Well It Works
tagline: It must be right!
---
{% include JB/setup %}

## About Me

Currently I'm a graduate student and researcher at the University of Wisconsin Madison.

## Recent Posts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
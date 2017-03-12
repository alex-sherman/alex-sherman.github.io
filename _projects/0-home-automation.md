---
layout: default
title: Home Automation
subtitle: Using MRPC and the ESP8266
---

I have for a long time wanted to be able to control my lights, TV and home appliances from my smart phone.
Finally companies are releasing products to help me achieve this science fiction reality,
but for some reason not a single one seems to be any good. The vast majority of these devices require an expensive
hub, like Alexa or Google Home. Even worse bulbs like the Phillip's Hue cost a whopping $50 at the time of writing this.
That means in order to control my tiny apartment with 6 light bulbs, and one of the new $50 Echo Dot's would cost me $350!
That's just insane, so I set out and managed to connect almost my entire apartment for around $5 per device and even
connected some things that I don't think others have been able to do yet!
Here's how:

Do It Yourself
========
I think DIY turns a lot of people off, myself included sometimes, due to the sort of hacky nature of the results.
I've seen a lot of crappy looking ESP8266/Arduino projects where the code's just a mess, the hardware is just kludged together
and the end result isn't very useable. I think I've come up with a solution that addresses all these problems, and the
end result is a rather consumer grade solution. Here's a list of the things I've automated with this system, and links to
guides on how to do these yourself.

- [Simple outlet](/haprojects/sonoff.html)
- [RGB Light Strips](/haprojects/rgb_strip.html)
- [RGB Light Bulbs](#TODO)
- [Door buzzer](#TODO)
- [TV Remote](#TODO)


Continuing on, I'll explain how this solution addresses the 3 major problems I have with
DIY projects: kludged hardware, messy code, and useability.

Un-kludging the Hardware
========
Minimize the amount you have to DIY for the hardware, buy things that require minimal hardware modifications.
I decided to go with the ESP8266 because of it's great community support and significant industry adoption.
Some great examples are like anything from [Itead](https://www.itead.cc/) who make a ton of dirt cheap ESP8266 based home automation hardware.
No hardware modifications required usually, and you can just reprogram them with a simple FTDI programmer.

If you can't find the thing you want with an ESP in it, put one in it.
The [Mi-Light](https://www.amazon.com/Milight-Changing-85-265V-Smartphone-Mi-Light/dp/B01K9GT7WQ/) has been a great target for this.
It can be a bit of a hassle and time sink, so if you're not willing to spend the time
[LYT Bulbs](https://authometion.com/shop/en/13-lyt-led-bulbs) will do it for you at a cost.

If you really do need to go from scratch, start with a good board.
The [WeMos and accompanying shields](https://www.wemos.cc/product) make a great starting point.
If you have access to a 3D printer, make an enclosure, it's so nice to
have this clean, wrapped up project that you can easily mount to something.
Having clean hardware is definitely a good start, but you still need to program it.

Cleaning up the Code
========
I wanted to use the simplest possible software libraries to keep the code on my devices easy to develop when I add something new.
I considered using MQTT, but having a broker was kind of a deal breaker. I wanted every device to stand on its own, simply connecting it
to the network should allow you to control it regardless of if I have internet currently or S3 is down.

So I made [MRPC (click for a more in depth explanation)](http://www.github.com/alex-sherman/mrpc).
It's open source, pretty minimal, has versions written in Python, Java/Android, and C/C++/ESP8266.
The idea of MRPC is simple, all I want is to be able to call certain functions (services)
on my devices like `light(true)`, or `color([0, 255, 0])`, or `get_temperature() -> 23.2`.
That way I can simplify the code I have to write on the ESP by quite a bit.
All I need is to define these services, and I can let the MRPC library do the other boring stuff like managing WiFi, routing messages etc.
As an example, a simple light service might look something like this:

    Value light(Value &arg, bool &success) {
        if(arg.isBool()) {
            light_value = arg.asBool();
            digitalWrite(LIGHT_PIN, light_value);
        }
        return light_value;     //Return the light value no matter what
    }

You can find some [more examples here](https://github.com/alex-sherman/MRPC-ESP8266/tree/master/Examples).
Now if you wanted to invoke this example light service you could use one of the following:

    light(true)                            // Over serial
    MRPC::rpc("*.light", true);            // C++/ESP8266
    MRPCActivity.mrpc("*.light", true);    // Java/Android
    mrpc.rpc("*.light", true)              // Python

OK so the code might be sort of clean, but what about actually using it?

Making it Useable
=========
MRPC on the ESP has a lot of built features to make your life easier.
It includes many built in services, like configuring wifi, naming the device, and looking up a devices services.
Also all the services on a device can be accessed over serial, just call them like `service(<json>)` with a new line at the end.
If serial won't work, the ESP automatically brings up its own AP when it fails to connect to WiFi, which you can use
along with the built in web page it hosts to configure it. Even further if you find you need to reprogram your devices
browse to `/update` and you can upload a new binary image through your web browser. You'll never need to program your devices
over serial again!

MRPC is usable on a lower level, but the end goal is to control my house from my phone, to which the natural response is to make an app.
Peter Den Hartog and I have been working an [open source Android app called Enlight](https://github.com/pddenhar/Android-Enlight).
It's also available on the [Play Store here](https://play.google.com/store/apps/details?id=com.fewsteet.enlight&hl=en).
There's also an attempt at a Python/Flask web app version [that can be found here](https://github.com/alex-sherman/enlight-python).
Not without its flaws, we hope other interested developers can help us improve it, but even as it is now it meets my needs
in controlling my house.

If Enlight doesn't meet your needs, please contribute to it, we're very open to improvements!
If you'd rather write your own app, then the [MRPC-Android library](https://github.com/alex-sherman/mrpc-android)
makes it just as easy to develop your own.
You may even find other uses than home automation in your apps. Peter recently [WiFi enabled an RC car](#TODO) to be controlled by
a smart phone, and it only took a few hours!

Now You
=========
Part of the reason I enjoy making things like this is seeing what other people can do with it.
I hope the simplicity of MRPC can inspire some people to take up a cool WiFi DIY project, and if it does I would love to hear about it!
If you encounter any problems, open an issue on the corresponding Github page and I'll try to be prompt in answering it.
If you encounter any successes, please email me! I'd love to see what you've done and put a link on this page as a success story.
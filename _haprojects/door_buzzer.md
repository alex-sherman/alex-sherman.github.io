---
layout: default
title: Hacking my Apartment's Door Buzzer
subtitle: Using MRPC to buzz myself in
---

Most apartments these days have electronic door buzzers that let you buzz
visitors into your apartment complex from the front door. I thought it would
be pretty cool to be able to let myself into my building from my smartphone,
or give access to my friends so that they can buzz themselves into the building
instead of waiting outside. The electronically controlled door buzzer was an easy
target for this and this guide will explain how I control, what I think is a common
door buzzer design, from my smartphone.

Preparing
==========
You will need just a few things to get this working:

1. WeMos D1 mini
    * [Amazon Prime $9](https://www.amazon.com/gp/product/B01N3P763C/ref=as_li_tl?ie=UTF8&tag=alexsherman04-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01N3P763C&linkId=570b4a1e461b4eeefa4a6072ad151873)
    * [Aliexpress $4 + Shipping](https://www.aliexpress.com/store/product/D1-mini-Mini-NodeMcu-4M-bytes-Lua-WIFI-Internet-of-Things-development-board-based-ESP8266/1331105_32529101036.html?spm=2114.12010612.0.0.29GMBm)
2. WeMos Relay shield
    * [Aliexpress $2.10 + Shipping](https://www.aliexpress.com/store/product/Relay-Shield-for-WeMos-D1-mini-button/1331105_32596395175.html)
3. Tools
    * Soldering iron to construct the relay shield
    * Multimeter to examine your door buzzer

Door Buzzer Circuit
=========
The door buzzer in my apartment is incredibly simple, it's just a button that momentarily
connects two terminals which signals the door to unlock. The idea is that in addition
to the button closing the circuit, I'll add a relay in parallel with the button
so that when either the button or relay closes, the circuit will be closed and the buzzer
will actuate the door lock. I measured the open circuit voltage of my circuit as 24V
and the closed circuit current around 20mA, just within the safe operating zone of
the relay shield which supports up to 28V and 10A.

![Door buzzer](http://i.imgur.com/lvc7Iwt.png)

Programming the WeMos
==========
You can program the WeMos however you like, but I used my [MRPC](https://github.com/alex-sherman/mrpc)
library to skip some of the more boring boilerplate. The idea is to expose a service like `door.buzz()`
which will close the relay for a few seconds. The sketch can be found in the MRPC library examples, 
but I'll include it in full here since it's relatively short:

    #include <mrpc.h>

    using namespace Json;
    using namespace MRPC;
    unsigned long start_buzz;

    Value buzz(Value &arg, bool &success) {
        start_buzz = millis();
        digitalWrite(D1, true);
        return true;
    }

    void setup() {
        Serial.begin(115200);
        init(50123);            //Begin MRPC on UDP port 50123
        pinMode(D1, OUTPUT);
        create_service("buzz", &buzz);
    }

    void loop() {
        poll();
        if(millis() - start_buzz > 2000) {
          digitalWrite(D1, false);
        }
    }


Connecting the Relay
==========
First attach two wires to the relay, and verify you picked the two terminals that are connected when the relay is closed and not open.
![](http://i.imgur.com/GFJZHnm.jpg)

Then find and attach the wires to the two terminals that connect to the buzzer button.
![](http://i.imgur.com/4EUrbu7.jpg)

Mine had a nice label, but you can just find them with a multimeter in connectivity mode.
![](http://i.imgur.com/jtmGt4P.jpg)

Seal it back up, and hope that management doesn't ask you where that wire is going to.
![](http://i.imgur.com/dVoMh1L.jpg)

Buzzing yourself in
============
The easiest way to use your new door buzzer is to [download the Enlight](https://play.google.com/store/apps/details?id=com.fewsteet.enlight)
app from the Play Store. Otherwise MRPC is easy enough to use so you can develop your own applications that talk to your door buzzer.
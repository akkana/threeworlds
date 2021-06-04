# ThreeWorlds

Fiddling with displaying Earth, and maybe other planets, in
various ways in [Three.js](https://threejs.org).

The original goal was to show a 3-D model of Earth and show
how the terminator progresses over the course of a day from sunrise
to sunset, and also how the angle of the terminator changes between
solstices and equinoxes, to help in visualizing the effect of
the changing sun angle over the seasons.

These are experiments, not polished webapps ready to deploy.
Some examples have values hardcoded into them. I wrote most of these
while preparing a talk for the Los Alamos Nature Center about the
summer solstice, so you may see latitude and longitude for the nature
center, or for the subsolar point at various times of day during
the northern hemisphere summer solstice.

## Dependency

Some of these examples use suncalc.js, available from my
[webapps/analemma](https://github.com/akkana/webapps/blob/master/analemma/js/suncalc.js)
project. They will look for it in ```/javascript/suncalc.js```.

## View the Examples, Live

You can view some of the examples live on
<a href="https://akkana.github.io/threeworlds/">ThreeWorlds
on GitHub Pages</a>.

## Running the Examples

Depending on your browser permissions, you may or may not be able to
load an example simply by loading its *index.html* file. The way
I run them is to make a symbolic link to the threeworlds top-level
directory into the directory my local apache2 installation uses,
then visit http://localhost/threeworlds/ and navigate from there.

If you don't normally run a web server on your local machine,
you can run a minimal one; for instance, in Python 3,
change directory to threeworlds and run ```python3 -m http.server```
after which you can navigate to http://0.0.0.0:8000/ .

## multiimages-cgi and python

My first approach was to use Python and PyEphem to generate a static
rectangular day/night image (see *python/daynightimage.py*),
then view it by borrowing some code from my
[MarsMap} in [webapps](https://github.com/akkana/threeworlds)
web app (see the [live MarsMap page](https://shallowsky.com/marsmap/))
to wrap the image around a globe (because, sadly, there's no Python
library remotely similar to Three.js). You'll find that code
in *multiimages-cgi*.

But you need to generate a lot of static images to really explore
Earth's motion that way, which takes a lot of time and disk space,
so I wanted to see if I could do the same thing all in Three.js.
(I'd still want Python for calculating times of things like sunrise
and sunset, solstices and equinoxes,
though [astro.js](http://slowe.github.io/astro.js/)
looks interesting, while Python has at least three good options.)

## directional-light

The most obvious approach is to render Earth, calculate the direction
of the sun, and define an AmbientLight from that direction, which
is what the *directional-light* example does. That works fine,
but it loses the pretty "Black Marble" image of Earth at night
that the Python script used.

## daynight-clipping and daynightglobe

One approach to getting the "black marble" imagery back is to render
two layers on the globe: one for daytime Earth, one for nighttime.
The best example of using two layers on the same sphere was in the
[gist by marcopompili](https://gist.github.com/marcopompili/082a159fcfc7c349771d10cbe991fb5d)
that uses a cloud layer on top of several Earth layers.
*daynightglobe* retains some of the structure of marcopompili's gist,
but I found myself getting crossed up trying to extend it,
and I couldn't seem to make it work without TrackballControls.js
even though I wasn't using any of those controls,
and I ended up simplifying it a bit (though also losing the nice
class structure) in *daynight-clipping*.



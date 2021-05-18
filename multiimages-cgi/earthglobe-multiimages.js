//
// Wrap a series of different rectangular maps around a globe.
//

// Get the DOM element in which you want to attach the scene
var container = document.querySelector('#planet-container');

// Create a WebGL renderer
var renderer = new THREE.WebGLRenderer();

// Set the size. I haven't found any way to do this in the HTML or CSS.
var SIZE = 500;

// The coordinates of the point under the viewer.
// three.js works in radians, so convert it now.
var lat = 35.814 * Math.PI / 180.;
var lon = -106.22 * Math.PI / 180.;


function screenWidth() {
    var w;

    try {
        w = document.getElementById("planet-container").clientWidth;
        if (w) {
            console.log("Screenwidth from planet-container", w);
            return w;
        }
    } catch (e) { console.log("container exception"); }
    try {
        w = document.documentElement.clientWidth;
        if (w) {
            console.log("Screenwidth from documentElement", w);
            return w;
        }
    } catch (e) { console.log("documentElement exception"); }
    try {
        w = document.body.clientWidth;    // For IE8
        if (w) {
            console.log("Screenwidth from body", w);
            return w;
        }
    } catch (e) { console.log("body exception"); }

    console.log("Couldn't get document width!");
    return 500;
}

var screenwidth = screenWidth();
if (screenwidth < SIZE)
    SIZE = screenwidth;
console.log("screenwidth", screenwidth, "SIZE", SIZE);

//Set the renderer size
renderer.setSize(SIZE, SIZE);

// Set camera attributes
var VIEW_ANGLE = 45;
var ASPECT = 1.0;
var NEAR = 0.1;
var FAR = 10000;

// Create the camera and scene.
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.set(0, 0, SIZE);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000);

scene.add(camera);

// Attach the renderer to the DOM element.
console.log("Container:", container);
container.appendChild(renderer.domElement);

// Set up the sphere attributes.
// You might think that to fill the available SIZE, you'd want a radius
// of SIZE / 2, but no, that comes out too small for some reason
// (camera distance?).
// On a computer display with SIZE == 500, SIZE/1.65 just about
// fills it (but not quite), SIZE/1.7 looks good; but on my phone,
// portrait size SIZE==341, // SIZE/1.2 is needed to fill most of the space.
var RADIUS = SIZE / 2;
var SEGMENTS = 50;
var RINGS = 50;

// The various rectangular maps representing day and night during
// one day's daylight hours at the target coordinates.
// I'd love to handle this part with three.js instead,
// if I could figure out how.
var mapfiles = [
    "maps/ss-sunrise.jpg",
    "maps/ss-06.jpg",
    "maps/ss-07.jpg",
    "maps/ss-08.jpg",
    "maps/ss-09.jpg",
    "maps/ss-10.jpg",
    "maps/ss-11.jpg",
    "maps/ss-12.jpg",
    "maps/ss-13.jpg",
    "maps/ss-14.jpg",
    "maps/ss-15.jpg",
    "maps/ss-16.jpg",
    "maps/ss-17.jpg",
    "maps/ss-18.jpg",
    "maps/ss-19.jpg",
    "maps/ss-sunset.jpg"
];
var mapfiles_index = 0;

// Create a group which will include our sphere and its texture meshed together
var globe = new THREE.Group();
scene.add(globe);

// Create the sphere with a texture loader.
var loader = new THREE.TextureLoader();
var sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

function wrapGlobe() {
    console.log("wrapping with", mapfiles[mapfiles_index]);
    loader.load(mapfiles[mapfiles_index], function (texture) {

        // Map the texture to the material.
        var material = new THREE.MeshBasicMaterial({ map: texture });

        // Create a new mesh with sphere geometry.
        var mesh = new THREE.Mesh(sphere, material);
        globe.add(mesh);

        drawEarthGlobe();
    });
}
wrapGlobe();

// // Move the Sphere back in Z so we
//     // can see it.
//globe.position.z = -300;
globe.position.z = -SIZE/2.8;

// create a point light
var pointLight = new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 400;

// add to the scene
scene.add(pointLight);

var firstTime = true;

function drawEarthGlobe() {
    // Rotate to where the given longitude, in radians, is centered.
    // Weirdly, globe.rotation.x is latitude, y is longitude. Go figure.
    // And longitude needs a correction of 90 degrees.
    // y = -1.6130924046734783 (-92.42338675239938),
    globe.rotation.x = lat;
    globe.rotation.y = -lon - Math.PI/2.;

    // Request a render.
    // When first setting up the page, three.js takes a while
    // before it's actually ready to render, so without a delay,
    // the screen will remain blank. Subsequently, no delay is needed.
    if (firstTime) {
        setTimeout( function() {
            renderer.render(scene, camera);
        }, 250 );
        firstTime = false;
    } else {
        renderer.render(scene, camera);
    }
}

// Set the dateChangeCallback for datetimepicker/datebuttons.js.
dateChangeCallback = drawEarthGlobe;

//
// ANIMATION
//
// Animation is needed for dragging the sphere around.
// So we start animating when the shifted left button is down,
// and stop when that ends.
//

// JavaScript mouse move events don't reliably report button state.
// So keep track of button state separately.
var leftButton = false;
var animating = false;

// Update function for animations
function animate() {
    drawEarthGlobe();

    // Schedule the next frame, but only if the mouse button is still down.
    if (animating && leftButton)
        requestAnimationFrame(animate);

    /* A way to request frames less frequently:
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 500 );
     */
}

// Hard-coded animation function based on keypress.
function animationBuilder(direction) {
    return function animateRotate() {
        switch (direction) {
            case 'up':
                lat -= 0.2;
                break;
            case 'down':
                lat += 0.2;
                break;
            case 'left':
                lon -= 0.2;
                break;
            case 'right':
                lon += 0.2;
                break;
            default:
                break;
        }
        //console.log("rotation", globe.rotation.y);
        drawEarthGlobe();
    };
}

var animateDirection = {
    up: animationBuilder('up'),
    down: animationBuilder('down'),
    left: animationBuilder('left'),
    right: animationBuilder('right')
};

function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '38') {
        animateDirection.up();
    } else if (e.keyCode == '40') {
        animateDirection.down();
    } else if (e.keyCode == '37') {
        animateDirection.left();
    } else if (e.keyCode == '39') {
        animateDirection.right();

    // seriously, JS has no callback for Enter in a text field,
    // you have to check for its key code??
    } else if (e.keyCode == 13) {
        useNewDate();

    } else if (e.keyCode == 32) {  // spacebar
        console.log("bing!");
        mapfiles_index += 1;
        if (mapfiles_index >= mapfiles.length)
            mapfiles_index = mapfiles.length - 1;
        wrapGlobe();

    } else if (e.keyCode == 8) {  // backspace
        console.log("bing!");
        mapfiles_index -= 1;
        if (mapfiles_index < 0)
            mapfiles_index = 0;
        wrapGlobe();

    } else {
        // console.log("unknown keycode:", e.keyCode);
        return true;
    }

    e.preventDefault();
    return false;
}

document.onkeydown = checkKey;

document.body.onmousedown = function(e) {
    e = e || window.event;
    if (e.button == 0) {
        leftButton = true;
        if (!animating && e.shiftKey) {
            requestAnimationFrame(animate);
            animating = true;
        }
    }
}
document.body.onmouseup = function(e) {
    e = e || window.event;
    if (e.button == 0) {
        leftButton = false;
        animating = false;
    }
}

var lastMove = [-1, -1];

// Mouse-move animation function: shift-drag
function onMouseMove(e) {
    e = e || window.event;
    if (!leftButton || ! e.shiftKey) {
        lastMove = [-1, -1];
        return;
    }
    if (lastMove[0] >= 0) {
        var dX = e.clientX - lastMove[0];
        var dY = e.clientY - lastMove[1];

        lon -= dX * .005;
        lat += dY * .005;
    }
    lastMove[0] = e.clientX;
    lastMove[1] = e.clientY;
}

document.addEventListener('mousemove', onMouseMove);

//
// Finally, draw the first Earth map.
//
var d = new Date();
drawEarthGlobe()

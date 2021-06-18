// Parse URL parameters date, lat, lon.
// Sample URL:
// http://localhost/threeworlds/daynightglobe/?date=2021-06-21+05:30&lat=35.885&lon=-106.306
var url = new URL(window.location);
console.log("URL Parameters:");
var lat = url.searchParams.get("lat") || 35.885;
var lon = url.searchParams.get("lon") || -106.306;
var date = url.searchParams.get("date");

// can't use || form for date, because Date(null) -> Dec 31 1969
if (date)
    date = new Date(date);
else
    date = new Date();
date.setSeconds(0);
console.log("lat", lat, "lon", lon, "date", date);

// How long (milliseconds) to wait between animation frames?
// Affects both dragging and the sun-motion animation.
// Small -> takes more CPU, large -> jerky if you drag it
const ANIM_TIME = 100;

// How much (in radians) to rotate the globe with each animation step.
// Positive is the right direction for earth rotation.
var rotationSpeed = 0; // 0.005;

// How much to change rotationSpeed on left/right arrows or when animating
var ROTATION_STEP_STEP = 0.015;

const RAD2DEG = Math.PI / 180.;

// Convert to radians
lat *= RAD2DEG;
lon *= RAD2DEG;

var scene = new THREE.Scene();
var ratio = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight,
    0.1, 10000);

// Set the camera position to be over the given lon, lat position.
// x, y and z are toward viewer, up, left
// but that's according to Earth's initial rotation (coords 0, 0)
// so actually, the tree coordinates are:
//     in direction of prime meridian;  up;  toward Pacific Ocean.
// Set left coordinate according to latitude:
const CAMDISTANCE = 50;
camera.position.set(Math.cos(lon) * CAMDISTANCE,
                    Math.sin(lat) * CAMDISTANCE,
                    -Math.sin(lon) * CAMDISTANCE);

var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.localClippingEnabled = true;

var canvas = renderer.domElement;
canvas.style.display = "block";

document.body.appendChild(canvas);

// Make a place to show messages
var statusdiv = document.createElement("div");
statusdiv.style.position = "absolute";
statusdiv.style.top = "1em";
statusdiv.style.left = "1em";
statusdiv.style.width = "15em";
statusdiv.style.height = "3em";
statusdiv.style.background = "black";
statusdiv.style.color = "white";
document.body.appendChild(statusdiv);
statusdiv.innerHTML = date.toLocaleString();

// Enable orbit controls
var controls = new THREE.OrbitControls(camera, canvas);
controls.enablePan = false;

// Try to constrain mouse drags so they only affect X, not Y,
// but this doesn't work, because setting min and max polar angle
// to 0 puts the camera above the north pole, while setting it to
// PI puts it above the south pole. There doesn't seem to be any way
// to keep it on the equator.
// controls.minPolarAngle = 0;
// controls.maxPolarAngle = 0;

controls.autoRotate = false;
controls.autoRotateSpeed = 0;

function adjustRotations(step) {
    rotationSpeed += step;
    if (rotationSpeed <= 0) {
        rotationSpeed = 0;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0;
    }
    else {
        controls.autoRotate = true;
        controls.autoRotateSpeed = -rotationSpeed * 560;
    }
}

window.addEventListener('keydown', function(event) {

    // The Left and Right keys speed up and slow down the globe's rotation,
    // specified by rotationSpeed (positive or zero).
    // Then the orbit controls need to have orbit speed adjusted
    // to match, so we appear to hover over the given earth coordinates.
    // The default orbit speed is 2, which equates to 30 seconds per orbit
    // at 60fps; positive makes the camera move westward.
    // autoRotate speed of -2.8 matches a rotation step of 0.005.
    if (event.keyCode == 37) {        // LEFT, slow down
        adjustRotations(-ROTATION_STEP_STEP);
    }
    else if (event.keyCode == 39) {   // RIGHT, speed up
        adjustRotations(ROTATION_STEP_STEP);
    }
    else if (event.keyCode == 38) {   // UP, nothing
    }
    else if (event.keyCode == 40) {   // DOWN, stop rotating
        adjustRotations(-rotationSpeed);
    }

    else
        console.log("keydown", event.keyCode);

    //else
    //    controls.onKeyDown(event); // orbit controls
});

// Add lighting
var light = new THREE.AmbientLight(0x888888);
light.intensity = 1.5;
scene.add(light);

/*
var light = new THREE.DirectionalLight(0xe4eef9, .7);
light.position.set(12, 12, 8);
scene.add(light);
*/

var radius = 32,
    segments = 32,
    rotation = 0;

var globe = new Globe(radius, segments, date);

scene.add(globe);

// Render the image
function render() {
    controls.update();

    if (rotationSpeed) {
        if (globe.earth) {
            globe.earth.rotation.y += rotationSpeed;

            date.setMinutes(date.getMinutes()
                            + rotationSpeed * 720. / Math.PI);
            statusdiv.innerHTML = date.toLocaleString();

            if (globe.clouds)
                globe.clouds.rotation.y += rotationSpeed;
        }
    }

    // requestAnimationFrame(render);
    // but you can be a little kinder by requesting animation frames
    // less often:
    setTimeout( function() {
        requestAnimationFrame( render );
    }, ANIM_TIME );

    renderer.render(scene, camera);
}

render();

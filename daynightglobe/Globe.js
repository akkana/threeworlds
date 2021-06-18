
class Globe extends THREE.Object3D {
    constructor(radius, segments, date) {
        super()

        this.name = "Earth";

        var that = this;

        var subsolarPoint = SunCalc.getSubsolarPoint(date);
        this.subsolar_lon = subsolarPoint['longitude'];
        this.subsolar_lat = subsolarPoint['latitude'];
        console.log("Subsolar point:", this.subsolar_lon, this.subsolar_lat);

        // instantiate a loader
        var loader = new THREE.TextureLoader();

        // earth textures
        var textures = {
            'map': {
                url: '../images/color_etopo1_ice-1600.jpg',
                val: undefined
            }
        };

        var texturePromises = [], path = './';

        for (var key in textures) {
            texturePromises.push(new Promise((resolve, reject) => {
                var entry = textures[key]
                var url = path + entry.url
                loader.load(
                    url,
                    texture => {
                        entry.val = texture;
                        if (entry.val instanceof THREE.Texture) resolve(entry);
                    },
                    xhr => {
                        console.log(url + ' '
                                    + (xhr.loaded / xhr.total * 100)
                                    + '% loaded');
                    },
                    xhr => {
                        reject(new Error(xhr +
                                         'Error loading while loading: '
                                         + entry.url));
                    }
                );
            }));
        }

        // load the geometry and the textures
        Promise.all(texturePromises).then(loadedTextures => {
            var geometry = new THREE.SphereGeometry(radius, segments, segments);
            var material = new THREE.MeshPhongMaterial({
                map: textures.map.val,
            });

            var earth = that.earth = new THREE.Mesh(geometry, material);
            that.add(earth);
        });

        // Night side, rendered as a cloud layer with a clipping plane
        //var material;
        loader.load('../images/BlackMarble-1600.jpg', map => {
            var clippingPlane = new THREE.Plane( new THREE.Vector3(
                -Math.cos(this.subsolar_lon),
                -Math.sin(this.subsolar_lat),
                Math.sin(this.subsolar_lon)), 0);

            var geometry = new THREE.SphereGeometry(radius + .05,
                                                    segments, segments);
            var material = new THREE.MeshPhongMaterial({
                map: map,
                transparent: true,
                clippingPlanes: [ clippingPlane ],
                clipShadows: true
            });

            var nightside = that.clouds = new THREE.Mesh(geometry, material);
            that.add(nightside);
        });
    }
}


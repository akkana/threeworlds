var Globe = function (radius, segments) {

    THREE.Object3D.call(this);

    // But that fails in newer three.js. There's a possible fix at
    // https://github.com/mrdoob/three.js/issues/21419 gives:
    // but it's not clear how to apply it here: trying
    // aglobe = new THREE.Object3D.call(radius, segments);
    // (plus returning aglobe at the end of the function)
    // results in: THREE.Object3D.call is not a constructor

    this.name = "Earth";

    var that = this;

    var lat = 35.885 * Math.PI / 180.;
    var lon = -106.306 * Math.PI / 180.;
    // Sunrise at summer solstice:
    this.subsolar_lon = 3.2226102170765776 * Math.PI / 180.;
    this.subsolar_lat = 23.43697580860745 * Math.PI / 180.;

    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // earth textures
    var textures = {
        'map': {
            url: '../images/color_etopo1_ice-1600.jpg',
            val: undefined
        },
        /*
        'blackMarble': {
            url: '../images/BlackMarble-1600.jpg',
            val: undefined
        }
        */
    };

    var texturePromises = [], path = './';

  for (var key in textures) {
    texturePromises.push(new Promise((resolve, reject) => {
      var entry = textures[key]
      var url = path + entry.url
      loader.load(url,
        texture => {
          entry.val = texture;
          if (entry.val instanceof THREE.Texture) resolve(entry);
        },
        xhr => {
          console.log(url + ' ' + (xhr.loaded / xhr.total * 100) +
            '% loaded');
        },
        xhr => {
          reject(new Error(xhr +
            'An error occurred loading while loading: ' +
            entry.url));
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
          Math.cos(subsolar_lon),
          Math.sin(subsolar_lat),
          -Math.sin(subsolar_lon)), 0);

      var geometry = new THREE.SphereGeometry(radius + .05, segments, segments);
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

Globe.prototype = Object.create(THREE.Object3D.prototype);
Globe.prototype.constructor = Globe;

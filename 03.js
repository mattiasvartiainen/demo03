function createCube() {
    mesh = new Mesh("Cube", 8, 12);
    mesh.vertices[0] = new Vector(-1, 1, 1);
    mesh.vertices[1] = new Vector(1, 1, 1);
    mesh.vertices[2] = new Vector(-1, -1, 1);
    mesh.vertices[3] = new Vector(1, -1, 1);
    mesh.vertices[4] = new Vector(-1, 1, -1);
    mesh.vertices[5] = new Vector(1, 1, -1);
    mesh.vertices[6] = new Vector(1, -1, -1);
    mesh.vertices[7] = new Vector(-1, -1, -1);

    mesh.faces[0] = { A: 0, B: 1, C: 2 };
    mesh.faces[1] = { A: 1, B: 2, C: 3 };
    mesh.faces[2] = { A: 1, B: 3, C: 6 };
    mesh.faces[3] = { A: 1, B: 5, C: 6 };
    mesh.faces[4] = { A: 0, B: 1, C: 4 };
    mesh.faces[5] = { A: 1, B: 4, C: 5 };

    mesh.faces[6] = { A: 2, B: 3, C: 7 };
    mesh.faces[7] = { A: 3, B: 6, C: 7 };
    mesh.faces[8] = { A: 0, B: 2, C: 7 };
    mesh.faces[9] = { A: 0, B: 4, C: 7 };
    mesh.faces[10] = { A: 4, B: 5, C: 6 };
    mesh.faces[11] = { A: 4, B: 6, C: 7 };

    return mesh;
}

c = b.getContext('2d');

H = b.height = 512;
W = b.width = 0 | H * innerWidth / innerHeight;

var screenData = c.getImageData(0, 0, b.width, b.height);

var buf = new ArrayBuffer(screenData.data.length);
var buf8 = new Uint8ClampedArray(buf);
var renderBuffer = new Uint32Array(buf);

var textureImageData;
var textureData;

var xRot = 0;
var yRot = 0;
var zRot = 0;
var pos = 0;

var texture1 = new Texture("img/texture1.png");
var quadEffect = new QuadEffect("img/paper.jpg", W, H, 12);

var scene = new Scene(W, H);
var mesh = createCube(); // new Mesh("cube", 8, 12);
mesh.position.z = 20;
scene.addMesh(mesh);

document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    //alert(charStr);
    if(charStr === 'd') {
        xRot ++;
    }
    if(charStr === 'a') {
        xRot --;
    }
    if(charStr === 'w') {
        yRot ++;
    }
    if(charStr === 'z') {
        yRot --;
    }
};

onload = function update() {
    requestAnimationFrame(update);

    if(!window.time) {
        time = 0;
        frame = 0;
        timeNextFrame = 0;
    }

    currentTime = performance.now() / 1000;
    while(time < currentTime) {
        while(time < timeNextFrame) {
            time += 1 / 16384;
        }
        frame++;
        timeNextFrame += 1/60;
    }

    // Update visuals
    c.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillStyle = 'rgba(0, 150, 255, 0.3)';
    //c.translate(0,0);

    //xRot += 0.1;
    //quadEffect.setPosition(pos++);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    quadEffect.dirLight.rotation = mesh.rotation;
 
    quadEffect.camera = scene.camera;
    quadEffect.tunnel(xRot, yRot, zRot);
    quadEffect.render(renderBuffer);

    scene.render(renderBuffer);

    screenData.data.set(buf8);
    c.putImageData(screenData, 0, 0);
}
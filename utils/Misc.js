function Color4(initialR, initialG, initialB, initialA) {
    this.r = initialR;
    this.g = initialG;
    this.b = initialB;
    this.a = initialA;
}
Color4.prototype.toString = function () {
    return "{R: " + this.r + " G:" + this.g + " B:" + this.b + " A:" + this.a + "}";
};

function Mesh(name, verticesCount, facesCount) {
    this.name = name;
    this.vertices = new Array(verticesCount);
    this.faces = new Array(facesCount);
    this.rotation = new Vector(0, 0, 0);
    this.position = new Vector(0, 0, 0);
}
Mesh.prototype = {
    doStuff: function() {
        console.log('test');
    }
};

function Camera() {
    this.position = new Vector(0,0,0);
    this.target = new Vector(0,0,0);
}
Camera.prototype = {
    doStuff: function() {
        console.log('test camera');
    }
};

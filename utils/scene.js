function Scene(width, height) {
    this.workingWidth = width;
    this.workingHeight = height;
    this.renderBuffer = null;
    var cube_center = new Vector(0,0,0);

    this.meshes = [];

    this.rotateX = 0;

    this.camera = new Camera();
    this.camera.position = new Vector(0, 0, 30);
    //this.camera.target = new Vector(0, 0, 100);
}

Scene.prototype = {
    addMesh: function(obj) {
        this.meshes.push(obj);
    },
    rotate: function(vertex, center, xAngle) {
        var x1, y1, z1, x2, y2, z2;
        var xRot = 6.283185308 / (360.0 / xAngle);
        var yRot = 6.283185308 / (360.0 / xAngle);
        var zRot = 6.283185308 / (360.0 / xAngle);
 
        //X-rotation
        z1 = ( vertex.z * Math.cos(xRot) ) - ( vertex.y * Math.sin(xRot) );
        y1 = ( vertex.z * Math.sin(xRot) ) + ( vertex.y * Math.cos(xRot) );
        //Y-rotation
        x1 = ( vertex.x * Math.cos(yRot) ) - ( z1 * Math.sin(yRot) );
        z2 = ( vertex.x * Math.sin(yRot) ) + ( z1 * Math.cos(yRot) );
        //Z-rotation
        x2 = ( x1 * Math.cos(zRot) ) - (y1 * Math.sin(zRot) );
        y2 = ( x1 * Math.sin(zRot) ) + (y1 * Math.cos(zRot) );
     
        vertex.x = x2;
        vertex.y = y2;
        vertex.z = z2;

        // Rotation matrix coefficients
        //var ct = Math.cos(theta);
        //var st = Math.sin(theta);
        //var cp = Math.cos(phi);
        //var sp = Math.sin(phi);

        // Rotation
        //var x = M.x - center.x;
        //var y = M.y - center.y;
        //var z = M.z - center.z;

        //M.x = ct * x - st * cp * y + st * sp * z + center.x;
        //M.y = st * x + ct * cp * y - ct * sp * z + center.y;
        //M.z = sp * y + cp * z + center.z;
    },
    render: function(buffer) {
        this.renderBuffer = buffer;

        var dx = this.workingWidth / 2;
        var dy = this.workingHeight / 2;

        var theta = (100) * Math.PI / 360;
        var phi = (200) * Math.PI / 180;    

        this.rotateX++;

        var viewMatrix = Matrix.LookAtLH(this.camera.position, this.camera.target, Vector.Up());
        var projectionMatrix = Matrix.PerspectiveFovLH(0.78, dx / dy, 0.01, 1.0);

        for (var i = 0, n_obj = this.meshes.length; i < n_obj; ++i) {
            var mesh = this.meshes[i];
            var worldMatrix = Matrix.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z).multiply(Matrix.Translation(mesh.position.x, mesh.position.y, mesh.position.z));
            var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

            // For each face
            for (var f=0; f<mesh.faces.length; f++) {
                // Current face
                var face = mesh.faces[f];
    
                var vertexA = mesh.vertices[face.A];
                var vertexB = mesh.vertices[face.B];
                var vertexC = mesh.vertices[face.C];

                var pixelA = this.project(vertexA, transformMatrix);
                var pixelB = this.project(vertexB, transformMatrix);
                var pixelC = this.project(vertexC, transformMatrix);

                this.drawBline(pixelA, pixelB);
                this.drawBline(pixelB, pixelC);
                this.drawBline(pixelC, pixelA);
            }
        }
    },
    putPixel: function(x, y, color) {
        //var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
        var index = (x + (y * this.workingWidth));

        renderBuffer[index] = color.r * 255 << 24 | color.g * 255 << 16 | color.b * 255 << 8 | color.a * 255;
    },
    drawPoint: function(point) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
            this.putPixel(point.x, point.y, new Color4(1, 1, 0, 1));
        }
    },
    drawBline: function(point0, point1) {
        var x0 = point0.x;
        var y0 = point0.y;
        var x1 = point1.x;
        var y1 = point1.y;
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;

        while (true) {
            this.drawPoint(new Vector2(x0, y0));

            if ((x0 == x1) && (y0 == y1))
                break;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    },
    project: function(coord, transMat) {
        var point = Vector.transformCoordinates(coord, transMat);

        var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
        var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
        return new Vertex2D(x, y);
    }
}
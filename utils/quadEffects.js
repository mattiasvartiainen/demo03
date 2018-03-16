function VectorT(x, y, z) {
    Vector.call(this, x, y, z);
    this.zLight = 0;
    this.lightAngle = 256;
}

VectorT.prototype = Object.create(Vector.prototype, {
});
VectorT.prototype.constructor = VectorT;

function QuadEffect(texturePath, width, height, polySize) {
    var self = this;
    this.texture = new Texture(texturePath);

    this.realWidth = width;
    this.realHeight = height;
    this.polySize = polySize;
    this.gridSizeX = this.realWidth/polySize;
    this.gridSizeY = this.realHeight/polySize;
    this.halfWidth = this.realWidth / 2;
    this.halfHeight = this.realHeight / 2;

    this.camera = new Camera();

    this.position = 256;
    this.radius = 280;
    this.planeOffset = 650;
    this.sphereRadius = 256;
    this.fov = 220;
    this.epsilon = 0.00000001;

    this.intersection = new Vector(0,0,0);
    this.dir = new Vector(-this.halfWidth, -this.halfHeight, this.position);
    this.origin = new Vector(0, 0, this.position);

    this.lightOrigin = new Vector(0, 0, this.position + 200);
    this.lightDir = new Vector(0, 0, 100);
    this.dirLight = new Mesh("light01", 1, 0);
    this.dirLight.vertices[0] = new Vector(0, 0, -300);
    this.dirLight.position = new Vector(0, 0, 0);

    this.tdata = Array.matrix(this.gridSizeX+1, this.gridSizeY+1, 0);
    for(var y=0; y<this.gridSizeY+1; y++) {
        for(var x=0; x<this.gridSizeX+1; x++) {
            this.tdata[x][y] = new VectorT(0,0,0);
        }
    }
}

QuadEffect.prototype = {
    fsqr: function(num)
    {
        return num * num;
    },
    setPosition: function(pos) {
        this.position = pos;
    },
    render: function(frameCount, buffer) {
      return "";
    },
    getTunnelPoint: function(xScr, yScr, xAng, yAng, zAng, origin) {
        var lfsqr = this.fsqr;

        this.dir.x = xScr - this.halfWidth;
        this.dir.y = yScr - this.halfHeight;
        this.dir.z = this.position;
        this.dir.rotate(xAng, yAng, zAng);
        this.dir.normalize();
        
        var a = lfsqr(this.dir.x) + lfsqr(this.dir.y);
        var b = 2*(origin.x * this.dir.x + origin.y * this.dir.y);
        var c = lfsqr(origin.x) + lfsqr(origin.y) - lfsqr(this.radius);

        var delta = lfsqr(b) - (4 * a * c);

        if (delta <= 0)
        {
            u = 128;
            v = 128;
            z = 128;
            return;
        }
        else {
            var t, t1, t2;

            t1 = (-b + Math.sqrt(delta))/(2*a);
            t2 = (-b - Math.sqrt(delta))/(2*a);
            t = Math.min(t1, t2);
            
            this.intersection.x = origin.x + (t * this.dir.x);
            this.intersection.y = origin.y + (t * this.dir.y);
            this.intersection.z = origin.z + (t * this.dir.z);

            u = Math.abs(this.intersection.z + this.position) * 0.2;
            v = Math.abs(Math.atan2(this.intersection.y, this.intersection.x) * 256 / Math.PI);

            z = Math.abs(this.intersection.z - origin.z) * 0.16;
            if( z >255 ) z = 255;

            var tunnelPoint = new VectorT(u, v, 255 - z);

            var tunnelVec = new Vector(this.lightOrigin.x - this.intersection.x, this.lightOrigin.y - this.intersection.y, this.lightOrigin.z - this.intersection.z);
            var angle = Vector.angleBetween(tunnelVec, this.lightDir);
            var angle2 = angle * 360.0 / (2 * Math.PI);
            tunnelPoint.lightAngle = angle2;

            return tunnelPoint;
        }
    },
    tunnel: function(xAng, yAng, zAng)
    {
        var u,v,z;
        var xScr, yScr;

        xScr = yScr = 0;

        this.dirLight.position.z = 120;
        if(this.dirLight.position.z < -300) this.dirLight.position.z = 300;
        var viewMatrix = Matrix.LookAtLH(this.camera.position, this.camera.target, Vector.Up());
        //var projectionMatrix = Matrix.PerspectiveFovLH(0.78, this.halfWidth / this.halfHeight, 0.01, 1.0);
        var worldMatrix = Matrix.RotationYawPitchRoll(this.dirLight.rotation.y, -this.dirLight.rotation.x, -this.dirLight.rotation.z).multiply(Matrix.Translation(this.dirLight.position.x, this.dirLight.position.y, this.dirLight.position.z));
        var transformMatrix = worldMatrix.multiply(viewMatrix); //.multiply(projectionMatrix);

        var lightVertex = this.dirLight.vertices[0];
        var lightPoint = Vector.transformCoordinates(lightVertex, transformMatrix);

        //this.lightDir.z = 100;
        //this.lightDir.x = 0;
        //this.lightDir.y = 0;
        //this.lightDir.rotate(xAng + 196, yAng, xAng);

        this.lightOrigin.z = this.dirLight.position.z;
        this.lightDir.z = lightPoint.z;
        this.lightDir.y = lightPoint.y;
        this.lightDir.x = lightPoint.x;

        for( var y=0; y<(this.gridSizeY+1); y++ )
        {
            xScr = 0;
            for( var x=0; x<(this.gridSizeX+1); x++ )
            {
                var point = this.getTunnelPoint(xScr, yScr, 0, 0, 0, this.origin);

                this.tdata[x][y].x = point.x;
                this.tdata[x][y].y = point.y;
                this.tdata[x][y].z = point.z;
                this.tdata[x][y].lightAngle = point.lightAngle;
    
                xScr += this.polySize;
            }

            yScr += this.polySize;
        }
    },
    getPlanePoint: function(x, y, xScr, yScr, xAng, yAng, zAng) 
    {
        var t;
        var lfsqr = this.fsqr;
        this.origin.x = 0;
        this.origin.y = -100;
        this.origin.z = this.position;

        this.dir.x = (xScr - this.halfWidth)/this.fov;
        this.dir.y = (yScr - this.halfHeight)/(this.fov-0.6);
        this.dir.z = 0.7;

        this.dir.rotate( xAng, yAng, zAng );
        this.dir.normalize();
        // Normalize our Direction Vector

        // Find t
        t = (Math.sign(this.dir.y) * this.planeOffset - this.origin.y) / this.dir.y;

        // Calculate Intersect Point (O + D*t)
        var intersect = new Vector(this.origin.x + this.dir.x * t, this.origin.y + this.dir.y * t, this.origin.z + this.dir.z * t);

        // Calculate Mapping Coordinates ( Coordiantes)
        u = (Math.abs(intersect.x)*0.05) & 0xff; //)&0xff);
        v = (Math.abs(intersect.z)*0.05) & 0xff; //&0xff);
        // Calculate Depth
        t = lfsqr(intersect.x - this.origin.x) + lfsqr(intersect.z - this.origin.z);
    
        if (t <= this.epsilon) {
            z = 0;
        }
        else {
            t = 300000.0 / Math.sqrt(t);
            z = (t > 255 ? 255 : t);
        }

        return new Vector(u, v, z);
    },
    plane: function(xAng, yAng, zAng)
    {
        var u,v,z;
        var xScr, yScr;

        xScr = yScr = 0;
    
        for( var y=0; y<(this.gridSizeY+1); y++ )
        {
            xScr = 0;
            for( var x=0; x<(this.gridSizeX+1); x++ )
            {
                var point = this.getPlanePoint(x, y, xScr, yScr, xAng, yAng, zAng);

                this.tdata[x][y].x = point.x;
                this.tdata[x][y].y = point.y;
                this.tdata[x][y].z = point.z;
    
                xScr += this.polySize;
            }

            yScr += this.polySize;
        }
    },
    getSpherePoint: function(x, y, xScr, yScr, xAng, yAng, zAng )
    {
        var lfsqr = this.fsqr;
        this.origin.x = 0;
        this.origin.y = 0;
        this.origin.z = 0;

        this.dir.x = (xScr - this.halfWidth)/this.fov;
        this.dir.y = (yScr - this.halfHeight)/(this.fov-0.4);
        this.dir.z = 0.7;

        this.dir.rotate( xAng, yAng, zAng );
        this.dir.normalize();

        var a = lfsqr(this.dir.x) + lfsqr(this.dir.y) + lfsqr(this.dir.z);
        var b = 2*(this.origin.x * this.dir.x + this.origin.y * this.dir.y + this.origin.z * this.dir.z);
        var c = lfsqr(this.origin.x) + lfsqr(this.origin.y) + lfsqr(this.origin.z) - lfsqr(this.sphereRadius);

        var delta = Math.sqrt(b * b - 4 * a *c);

        var t1 = (-b + delta) / (2*a);
        var t2 = (-b - delta) / (2*a);

        var t = t1 > 0 ? t1 : t2;
        
        var intersect = new Vector(this.origin.x + this.dir.x * t, this.origin.y + this.dir.y * t, this.origin.z + this.dir.z * t);

        var u = (Math.asin((intersect.y) / Math.sqrt(lfsqr(intersect.x) + lfsqr(intersect.y) + lfsqr(intersect.z)))*256 +256) & 0xff;
        var v = (Math.atan2(intersect.z, intersect.x) * 256 / Math.PI) &0xff;

        t = (Math.abs(intersect.z) / this.sphereRadius) * 256;
        z = (t > 255 ? 255 : t);
        //z = (u + (255-v)) & 0xff;
        //z = intersect.z;

        return new Vector(u, v, z);
    },
    sphere: function(xAng, yAng, zAng)
    {
        var u,v,z;
        var xScr, yScr;

        xScr = yScr = 0;
    
        for( var y=0; y<(this.gridSizeY+1); y++ )
        {
            xScr = 0;
            for( var x=0; x<(this.gridSizeX+1); x++ )
            {
                var point = this.getSpherePoint(x, y, xScr, yScr, xAng, yAng, zAng);

                this.tdata[x][y].x = point.x;
                this.tdata[x][y].y = point.y;
                this.tdata[x][y].z = point.z;
    
                xScr += this.polySize;
            }

            yScr += this.polySize;
        }
    },
    test: function(xAng, yAng, zAng)
    {
        var u,v,z;
        var xScr, yScr;

        xScr = yScr = 0;
    
        for( var y=0; y<(this.gridSizeY+1); y++ )
        {
            xScr = 0;
            for( var x=0; x<(this.gridSizeX+1); x++ )
            {
                var point1 = this.getTunnelPoint(x, y, xScr, yScr, xAng, yAng, zAng);
                var point2 = this.getTunnelPoint(x, y, xScr + 90, yScr + 90, zAng, xAng, yAng);
                var point = new Vector((point1.x + point2.x) / 2, (point1.y + point2.y) / 2, (point1.z + point2.z) / 2);

                this.tdata[x][y].x = point.x;
                this.tdata[x][y].y = point.y;
                this.tdata[x][y].z = point.z;
    
                xScr += this.polySize;
            }

            yScr += this.polySize;
        }
    },
    mapQuad: function(x, y, xRot, yRot, zRot, buffer, texture) {
        var textureSize = texture.width * texture.height << 2;
        var textureData = texture.data;
        var idx = (x) + ((y) * W);
        for(j=0; j<this.polySize; j++) {
            for(i=0; i<this.polySize; i++) {
                var point = this.getTunnelPoint(x + i, y + j, xRot, yRot, zRot, this.origin);
                if(point !== undefined) {
                    var offset = (Math.round(point.x) + (Math.round(point.y) * 256)) << 2;
                    
                    if(offset > textureSize) offset = textureSize -1;
                    
                    var z = point.z;
                    if(point.lightAngle < 5) {
                        z = 255;
                    }

                    buffer[idx] = z << 24 | textureData[offset] << 16 | textureData[offset+1] << 8 | textureData[offset+2];
                    idx++;
                }
            }
            idx = idx + this.realWidth - this.polySize;
        }
    },
    mapQuad2: function(x, y, t1, t2, t3, t4, buffer, texture) {
        var stepLeft  = new Vector((t3.x - t1.x)/this.polySize, (t3.y - t1.y)/this.polySize, (t3.z - t1.z)/this.polySize);
        var stepRight = new Vector((t4.x - t2.x)/this.polySize, (t4.y - t2.y)/this.polySize, (t4.z - t2.z)/this.polySize);
    
        var left = new Vector(t1.x, t1.y, t1.z);
        var right = new Vector(t2.x, t2.y, t2.z);
    
        var idx = (x) + ((y) * W);
        var textureData = texture.data;
        var textureSize = texture.width * texture.height << 2;
            
        for(j=0; j<this.polySize; j++) {
            var delta = new Vector((right.x - left.x)/this.polySize, (right.y - left.y)/this.polySize, (right.z - left.z)/this.polySize);
            var value = new Vector(left.x, left.y, left.z);
            
            for(i=0; i<this.polySize; i++) {
                var offset = (Math.round(value.x) + (Math.round(value.y) * 256)) << 2;
    
                if(value.z < 0) value.z = 0;
                if(value.z > 255) value.z = 255;

                if(offset > textureSize) offset = textureSize -1;
                buffer[idx] = value.z << 24 | textureData[offset] << 16 | textureData[offset+1] << 8 | textureData[offset+2];
    
                value.x = value.x + delta.x;
                value.y = value.y + delta.y;
                value.z = value.z + delta.z;
    
                idx++;
            }
    
            idx = idx + this.realWidth - this.polySize;
    
            left.x = left.x + stepLeft.x;
            left.y = left.y + stepLeft.y;
            left.z = left.z + stepLeft.z;
    
            right.x = right.x + stepRight.x;
            right.y = right.y + stepRight.y;
            right.z = right.z + stepRight.z;
        }
    },
    render: function(buffer, quadTexture)
    {
        var texture = quadTexture || this.texture;

        for( var y=0; y<this.gridSizeY; y++ )
        {
            xScr = 0;
            for( var x=0; x<this.gridSizeX; x++ )
            {
                var p1 = this.tdata[x][y];
                var p2 = this.tdata[x+1][y];
                var p3 = this.tdata[x][y+1];
                var p4 = this.tdata[x+1][y+1];

                var hasLight = this.hasLight(p1, p2, p3, p4);
                if(!hasLight) {
                    this.mapQuad2(x * this.polySize, y * this.polySize, p1, p2, p3, p4, buffer, texture);
                }
                else {
                    this.mapQuad(x * this.polySize, y * this.polySize, 0,0,0, buffer, texture);
                }
            }
        }
    },
    hasLight: function(p1, p2, p3, p4) {
        if(p1.lightAngle < 5) return true;
        if(p2.lightAngle < 5) return true;
        if(p3.lightAngle < 5) return true;
        if(p4.lightAngle < 5) return true;
        return false;
    }
}

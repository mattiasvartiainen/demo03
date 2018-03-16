function Vector2(initialX, initialY) {
    this.x = initialX;
    this.y = initialY;
}

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Vector.prototype = {
    negative: function() {
      return new Vector(-this.x, -this.y, -this.z);
    },
    add: function(v) {
      if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
      else return new Vector(this.x + v, this.y + v, this.z + v);
    },
    subtract: function (otherVector) {
      return new Vector(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z);
    },
    //subtract: function(v) {
    //  if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    //  else return new Vector(this.x - v, this.y - v, this.z - v);
    //},
    multiply: function(v) {
      if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
      else return new Vector(this.x * v, this.y * v, this.z * v);
    },
    divide: function(v) {
      if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
      else return new Vector(this.x / v, this.y / v, this.z / v);
    },
    equals: function(v) {
      return this.x == v.x && this.y == v.y && this.z == v.z;
    },
    dot: function(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    },
    cross: function(v) {
      return new Vector(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    },
    length: function() {
      return Math.sqrt(this.dot(this));
    },
    unit: function() {
      return this.divide(this.length());
    },
    min: function() {
      return Math.min(Math.min(this.x, this.y), this.z);
    },
    normalize: function()
    {
       var length = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
       if (length === 0) {
          return;
       }
       this.x = this.x / length;
       this.y = this.y / length;
       this.z = this.z / length;
    },
    rotate: function(xAngle, yAngle, zAngle)
    {
       var x1, y1, z1, x2, y2, z2;
       var xRot = 6.283185308 / (360.0 / xAngle);
       var yRot = 6.283185308 / (360.0 / yAngle);
       var zRot = 6.283185308 / (360.0 / zAngle);

       //X-rotation
       z1 = ( this.z * Math.cos(xRot) ) - ( this.y * Math.sin(xRot) );
       y1 = ( this.z * Math.sin(xRot) ) + ( this.y * Math.cos(xRot) );
       //Y-rotation
       x1 = ( this.x * Math.cos(yRot) ) - ( z1 * Math.sin(yRot) );
       z2 = ( this.x * Math.sin(yRot) ) + ( z1 * Math.cos(yRot) );
       //Z-rotation
       x2 = ( x1 * Math.cos(zRot) ) - (y1 * Math.sin(zRot) );
       y2 = ( x1 * Math.sin(zRot) ) + (y1 * Math.cos(zRot) );
    
       this.x = x2;
       this.y = y2;
       this.z = z2;

       return this;
    },
    max: function() {
      return Math.max(Math.max(this.x, this.y), this.z);
    },
    toAngles: function() {
      return {
        theta: Math.atan2(this.z, this.x),
        phi: Math.asin(this.y / this.length())
      };
    },
    angleTo: function(a) {
      return Math.acos(this.dot(a) / (this.length() * a.length()));
    },
    toArray: function(n) {
      return [this.x, this.y, this.z].slice(0, n || 3);
    },
    clone: function() {
      return new Vector(this.x, this.y, this.z);
    },
    init: function(x, y, z) {
      this.x = x; this.y = y; this.z = z;
      return this;
    }
  };

  Vector.negative = function(a, b) {
    b.x = -a.x; b.y = -a.y; b.z = -a.z;
    return b;
  };
  Vector.add = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
    else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
    return c;
  };
  Vector.subtract = function(otherVector) {
    return new Vector(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z);
  };
  //Vector.subtract = function(a, b, c) {
  //  if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
  //  else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
  //  return c;
  //};
  Vector.multiply = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
    else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
    return c;
  };
  Vector.divide = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
    else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
    return c;
  };
  Vector.cross = function(a, b) {
    var x = a.y * b.z - a.z * b.y;
    var y = a.z * b.x - a.x * b.z;
    var z = a.x * b.y - a.y * b.x;
    return new Vector(x, y, z);
  };
  Vector.dot = function (a, b) {
    return (a.x * b.x + a.y * b.y + a.z * b.z);
  };
  Vector.unit = function(a, b) {
    var length = a.length();
    b.x = a.x / length;
    b.y = a.y / length;
    b.z = a.z / length;
    return b;
  };
  Vector.fromAngles = function(theta, phi) {
    return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
  };
  Vector.randomDirection = function() {
    return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
  };
  Vector.min = function(a, b) {
    return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  };
  Vector.normalize = function()
  {
     var lenght = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
     x = x / lenght;
     y = y / lenght;
     z = z / lenght;
  },
  Vector.rotate = function(xAngle, yAngle, zAngle)
  {
     var x1, y1, z1, x2, y2, z2;
  
     //X-rotation
     z1 = ( this.z * Math.cos(xAngle) - this.y * Math.sin(xAngle) );
     y1 = ( this.z * Math.sin(xAngle) + this.y * Math.cos(xAngle) );
     //Y-rotation
     x1 = ( this.x * Math.cos(yAngle) - z1 * Math.sin(yAngle) );
     z2 = ( this.x * Math.sin(yAngle) + z1 * Math.cos(yAngle) );
     //Z-rotation
     x2 = ( x1 * Math.cos(zAngle) - y1 * Math.sin(zAngle) );
     y2 = ( x1 * Math.sin(zAngle) + y1 * Math.cos(zAngle) );
  
     this.x = x2;
     this.y = y2;
     this.z = z2;

     return this;
  };
  Vector.max = function(a, b) {
    return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  };
  Vector.lerp = function(a, b, fraction) {
    return b.subtract(a).multiply(fraction).add(a);
  };
  Vector.fromArray = function(a) {
    return new Vector(a[0], a[1], a[2]);
  };
  Vector.angleBetween = function(a, b) {
    return a.angleTo(b);
  };
  
Vector.transformCoordinates = function (vector, transformation) {
  var x = (vector.x * transformation.m[0]) + (vector.y * transformation.m[4]) + (vector.z * transformation.m[8]) + transformation.m[12];
  var y = (vector.x * transformation.m[1]) + (vector.y * transformation.m[5]) + (vector.z * transformation.m[9]) + transformation.m[13];
  var z = (vector.x * transformation.m[2]) + (vector.y * transformation.m[6]) + (vector.z * transformation.m[10]) + transformation.m[14];
  var w = (vector.x * transformation.m[3]) + (vector.y * transformation.m[7]) + (vector.z * transformation.m[11]) + transformation.m[15];
  return new Vector(x / w, y / w, z / w);
}

Vector.Zero = function () {
  return new Vector(0, 0, 0);
};
Vector.Up = function () {
  return new Vector(0, 1.0, 0);
};

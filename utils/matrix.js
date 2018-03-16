Array.matrix = function(numrows, numcols, initial){
    var arr = [];
    for (var i = 0; i < numrows; ++i){
       var columns = [];
       for (var j = 0; j < numcols; ++j){
          columns[j] = initial;
       }
       arr[i] = columns;
     }
     return arr;
 }

var hasFloat32Array = (typeof Float32Array != 'undefined');

function Matrix() {
    var m = Array.prototype.concat.apply([], arguments);
    if (!m.length) {
      m = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    }
    this.m = hasFloat32Array ? new Float32Array(m) : m;
}

Matrix.prototype = {
    inverse: function() {
        return Matrix.inverse(this, new Matrix());
      },
      transpose: function() {
        return Matrix.transpose(this, new Matrix());
      },
      multiply: function(matrix) {
        return Matrix.multiply(this, matrix, new Matrix());
      },
      transformPoint: function(v) {
        var m = this.m;
        return new Vector(
          m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
          m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
          m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11]
        ).divide(m[12] * v.x + m[13] * v.y + m[14] * v.z + m[15]);
      },
      transformVector: function(v) {
        var m = this.m;
        return new Vector(
          m[0] * v.x + m[1] * v.y + m[2] * v.z,
          m[4] * v.x + m[5] * v.y + m[6] * v.z,
          m[8] * v.x + m[9] * v.y + m[10] * v.z
        );
    }
};

Matrix.inverse = function(matrix, result) {
    result = result || new Matrix();
    var m = matrix.m, r = result.m;
  
    r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
    r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
    r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
    r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];
  
    r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
    r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
    r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
    r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];
  
    r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
    r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
    r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
    r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];
  
    r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
    r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
    r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
    r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];
  
    var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
    for (var i = 0; i < 16; i++) r[i] /= det;
    return result;
  };

  Matrix.transpose = function(matrix, result) {
    result = result || new Matrix();
    var m = matrix.m, r = result.m;
    r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
    r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
    r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
    r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
    return result;
  };

  Matrix.multiply = function(left, right, result) {
    result = result || new Matrix();
    var a = left.m, b = right.m, r = result.m;
  
    r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
    r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
    r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
    r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
  
    r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
    r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
    r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
    r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
  
    r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
    r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
    r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
    r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
  
    r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
    r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
    r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
    r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
  
    return result;
  };

  Matrix.identity = function(result) {
    result = result || new Matrix();
    var m = result.m;
    m[0] = m[5] = m[10] = m[15] = 1;
    m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
    return result;
  };

  Matrix.perspective = function(fov, aspect, near, far, result) {
    var y = Math.tan(fov * Math.PI / 360) * near;
    var x = y * aspect;
    return Matrix.frustum(-x, x, -y, y, near, far, result);
  };

  Matrix.frustum = function(l, r, b, t, n, f, result) {
    result = result || new Matrix();
    var m = result.m;
  
    m[0] = 2 * n / (r - l);
    m[1] = 0;
    m[2] = (r + l) / (r - l);
    m[3] = 0;
  
    m[4] = 0;
    m[5] = 2 * n / (t - b);
    m[6] = (t + b) / (t - b);
    m[7] = 0;
  
    m[8] = 0;
    m[9] = 0;
    m[10] = -(f + n) / (f - n);
    m[11] = -2 * f * n / (f - n);
  
    m[12] = 0;
    m[13] = 0;
    m[14] = -1;
    m[15] = 0;
  
    return result;
  };

  Matrix.ortho = function(l, r, b, t, n, f, result) {
    result = result || new Matrix();
    var m = result.m;
  
    m[0] = 2 / (r - l);
    m[1] = 0;
    m[2] = 0;
    m[3] = -(r + l) / (r - l);
  
    m[4] = 0;
    m[5] = 2 / (t - b);
    m[6] = 0;
    m[7] = -(t + b) / (t - b);
  
    m[8] = 0;
    m[9] = 0;
    m[10] = -2 / (f - n);
    m[11] = -(f + n) / (f - n);
  
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  
    return result;
  };

  Matrix.scale = function(x, y, z, result) {
    result = result || new Matrix();
    var m = result.m;
  
    m[0] = x;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
  
    m[4] = 0;
    m[5] = y;
    m[6] = 0;
    m[7] = 0;
  
    m[8] = 0;
    m[9] = 0;
    m[10] = z;
    m[11] = 0;
  
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  
    return result;
  };

  Matrix.translate = function(x, y, z, result) {
    result = result || new Matrix();
    var m = result.m;
  
    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = x;
  
    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = y;
  
    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = z;
  
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  
    return result;
  };

  Matrix.rotate = function(a, x, y, z, result) {
    if (!a || (!x && !y && !z)) {
      return Matrix.identity(result);
    }
  
    result = result || new Matrix();
    var m = result.m;
  
    var d = Math.sqrt(x*x + y*y + z*z);
    a *= Math.PI / 180; x /= d; y /= d; z /= d;
    var c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  
    m[0] = x * x * t + c;
    m[1] = x * y * t - z * s;
    m[2] = x * z * t + y * s;
    m[3] = 0;
  
    m[4] = y * x * t + z * s;
    m[5] = y * y * t + c;
    m[6] = y * z * t - x * s;
    m[7] = 0;
  
    m[8] = z * x * t - y * s;
    m[9] = z * y * t + x * s;
    m[10] = z * z * t + c;
    m[11] = 0;
  
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  
    return result;
};

  Matrix.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz, result) {
    result = result || new Matrix();
    var m = result.m;
  
    var e = new Vector(ex, ey, ez);
    var c = new Vector(cx, cy, cz);
    var u = new Vector(ux, uy, uz);
    var f = e.subtract(c).unit();
    var s = u.cross(f).unit();
    var t = f.cross(s).unit();
  
    m[0] = s.x;
    m[1] = s.y;
    m[2] = s.z;
    m[3] = -s.dot(e);
  
    m[4] = t.x;
    m[5] = t.y;
    m[6] = t.z;
    m[7] = -t.dot(e);
  
    m[8] = f.x;
    m[9] = f.y;
    m[10] = f.z;
    m[11] = -f.dot(e);
  
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  
    return result;
  };
  
  Matrix.LookAtLH = function (eye, target, up) {
    var zAxis = target.subtract(eye);
    zAxis.normalize();
    var xAxis = Vector.cross(up, zAxis);
    xAxis.normalize();
    var yAxis = Vector.cross(zAxis, xAxis);
    yAxis.normalize();
    var ex = -Vector.dot(xAxis, eye);
    var ey = -Vector.dot(yAxis, eye);
    var ez = -Vector.dot(zAxis, eye);
    return Matrix.FromValues(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, ex, ey, ez, 1);
};
Matrix.FromValues = function (initialM11, initialM12, initialM13, initialM14, initialM21, initialM22, initialM23, initialM24, initialM31, initialM32, initialM33, initialM34, initialM41, initialM42, initialM43, initialM44) {
  var result = new Matrix();
  result.m[0] = initialM11;
  result.m[1] = initialM12;
  result.m[2] = initialM13;
  result.m[3] = initialM14;
  result.m[4] = initialM21;
  result.m[5] = initialM22;
  result.m[6] = initialM23;
  result.m[7] = initialM24;
  result.m[8] = initialM31;
  result.m[9] = initialM32;
  result.m[10] = initialM33;
  result.m[11] = initialM34;
  result.m[12] = initialM41;
  result.m[13] = initialM42;
  result.m[14] = initialM43;
  result.m[15] = initialM44;
  return result;
};
Matrix.Identity = function () {
  return Matrix.FromValues(1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0);
};
Matrix.Zero = function () {
  return Matrix.FromValues(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
};
Matrix.PerspectiveFovLH = function (fov, aspect, znear, zfar) {
  var matrix = Matrix.Zero();
  var tan = 1.0 / (Math.tan(fov * 0.5));
  matrix.m[0] = tan / aspect;
  matrix.m[1] = matrix.m[2] = matrix.m[3] = 0.0;
  matrix.m[5] = tan;
  matrix.m[4] = matrix.m[6] = matrix.m[7] = 0.0;
  matrix.m[8] = matrix.m[9] = 0.0;
  matrix.m[10] = -zfar / (znear - zfar);
  matrix.m[11] = 1.0;
  matrix.m[12] = matrix.m[13] = matrix.m[15] = 0.0;
  matrix.m[14] = (znear * zfar) / (znear - zfar);
  return matrix;
};
Matrix.Translation = function (x, y, z) {
  var result = Matrix.Identity();
  result.m[12] = x;
  result.m[13] = y;
  result.m[14] = z;
  return result;
};
Matrix.RotationX = function (angle) {
  var result = Matrix.Zero();
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  result.m[0] = 1.0;
  result.m[15] = 1.0;
  result.m[5] = c;
  result.m[10] = c;
  result.m[9] = -s;
  result.m[6] = s;
  return result;
};
Matrix.RotationY = function (angle) {
  var result = Matrix.Zero();
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  result.m[5] = 1.0;
  result.m[15] = 1.0;
  result.m[0] = c;
  result.m[2] = -s;
  result.m[8] = s;
  result.m[10] = c;
  return result;
};
Matrix.RotationZ = function (angle) {
  var result = Matrix.Zero();
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  result.m[10] = 1.0;
  result.m[15] = 1.0;
  result.m[0] = c;
  result.m[1] = s;
  result.m[4] = -s;
  result.m[5] = c;
  return result;
};
Matrix.RotationYawPitchRoll = function (yaw, pitch, roll) {
  return Matrix.RotationZ(roll).multiply(Matrix.RotationX(pitch)).multiply(Matrix.RotationY(yaw));
};

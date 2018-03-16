function Texture(textureSrc) {
    var self = this;
    this.textureSrc = textureSrc;
    if(textureSrc === undefined) {
        this.textureSrc = "img/texture1.jpg";
    }
    this.timg = new Image();
    this.width = 0;
    this.height = 0;
    this.data = null;
    this.textureCanvas = null;

    this.timg.onload = function() {
        self.width = self.timg.width;
        self.height = self.timg.height;

        self.textureCanvas = Texture.createOffscreenCanvas(self.timg.width, self.timg.height);
        self.textureCtx = self.textureCanvas.getContext('2d');
        self.textureCtx.drawImage(self.timg, 0, 0);
        self.imgData = self.textureCtx.getImageData(0, 0, 256, 256);
        self.data = self.imgData.data;
    }
    this.timg.src = textureSrc;
}


Texture.prototype = {
    load: function() {
      return "";
    },
    data: function() {
        return this.data;
    }
}

Texture.data = function() {
    return data;
};
Texture.width = function() {
    return width;
};
Texture.height = function() {
    return height;
};
Texture.createOffscreenCanvas = function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

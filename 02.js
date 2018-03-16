function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

c = b.getContext('2d');

var screenData;
var textureData;
var pixelComponents;

var img = document.getElementById('img')
textureImage = new Image();
textureImage.crossOrigin = "Anonymous";
texture = document.createElement('canvas');
textureCtx = texture.getContext('2d');
textureImage.onload = function() {
    textureCtx.drawImage(textureImage, 0, 0);
    textureData = textureCtx.getImageData(0, 0, texture.width, texture.height);
    pixelComponents = textureData.data; // textureData.data;
    screenData = c.getImageData(0, 0, b.width, b.height);
}
textureImage.src = "img/texture1.png";

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
    H = b.height = 512;
    W = b.width = 0 | H * innerWidth / innerHeight;
    c.translate(W/2, H/2);

    for (var x = 0; x < texture.width; x++) {
        for (var y = 0; y < texture.height; y++) {
            //var idx = (x + y * texture.width);
            //setPixel(screenData, x, y, 255, 0, 127, 250);

            var pixel = textureCtx.getImageData(x, y, 1, 1);
            var data = pixel.data;
            var rgba = 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
            c.fillStyle = rgba; // "rgba("+r+","+g+","+b+","+(a/255)+")";
            c.fillRect( x, y, 1, 1 );
        }
    }    
}
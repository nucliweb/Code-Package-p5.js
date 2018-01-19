// Cover_Image_Colors
/**
 * Loads images and searches for the most saturated color. It tries to avoid 
 * the special green color that we've chosen for the book. Otherwise most of 
 * the colors would be that green.
 * Returns an array with these colors and prints them to the console.
 */

'use strict';

var imageFiles = [];
var imageSamples = [];
var imageColors = [];

var possibleImagesCount = 256;
var primaryGreen;

function preload() {
  for (var i = 1; i <= possibleImagesCount; i++) {
    imageFiles.push(loadImage('./PNG150/Seite_' + nf(i, 3) + '.png'));
  }
}

function setup() {
  createCanvas(100, 100);
  primaryGreen = color(14, 232, 117);

  // create image samples
  var n = 1;
  for (var i = 0; i < imageFiles.length; i++) {
    for (var j = 0; j < n; j++) {
      imageSamples.push(new ImageSample(imageFiles[i], i, j / n, 1 / n));
    }
  }

  for (var i = 0; i < imageSamples.length; i++) {
    var c = imageSamples[i].sampleColor;
    imageColors.push({ r: int(red(c)), g: int(green(c)), b: int(blue(c)), a: int(alpha(c)) })
  }

  console.log(imageColors.toSource());
}

function draw() {
  noLoop();
}


function ImageSample(img, index, y, h) {
  this.index = index;
  this.img = img.get(0, img.height * y, img.width, img.height * h);
  this.img.loadPixels();
  var colorCount = 100;
  var quality = 1;
  var sampledPixels = [];
  for (var i = 0, offset, r, g, b, a; i < this.img.pixels.length; i += quality) {
    offset = i * 4;
    r = this.img.pixels[offset + 0];
    g = this.img.pixels[offset + 1];
    b = this.img.pixels[offset + 2];
    a = this.img.pixels[offset + 3];
    if (a >= 125) {
      if (!(r > 250 && g > 250 && 250)) {
        sampledPixels.push([r, g, b]);
      }
    }
  }
  
  this.cmap = MMCQ.quantize(sampledPixels, colorCount);
  
  var satColor = this.cmap ? color(getMostSaturatedColor(this.cmap.palette())) : color(0);
  var satColorNotGreen = this.cmap ? color(getMostSaturatedColorNotGreen(this.cmap.palette())) : color(0);
  var satValue = saturation(satColorNotGreen);
  var bestColor = satValue > 50 ? satColorNotGreen : satColor;

  this.sampleColor = this.cmap ? whiteToAlpha(bestColor) : color(255);
}

// searches for the most saturated color in an array of colors
function getMostSaturatedColor(arr) {
  var maxSat = 0;
  var c = color(0);
  for (var i = 0; i < arr.length; i++) {
    var cc = arr[i];
    var sat = saturation(cc) + brightness(cc);
    if (sat > maxSat) {
      c = cc;
      maxSat = sat;
    }
  }
  return c;
}

// searches for the most saturated color in an array of colors avoiding green
function getMostSaturatedColorNotGreen(arr) {
  var maxSat = 0;
  var c = color(0);
  for (var i = 0; i < arr.length; i++) {
    var cc = arr[i];
    if (abs(hue(cc) - hue(primaryGreen)) < 30) {
      //console.log("similar");
      continue;
    }
    var sat = saturation(cc) + brightness(cc);
    if (sat > maxSat) {
      c = cc;
      maxSat = sat;
    }
  }
  return c;
}

// calculates an alpha value depending on how close to white the color is. 
function whiteToAlpha(col) {
  var r = red(col);
  var g = green(col);
  var b = blue(col);

  var m = min(r, g, b);
  if (m > 0) {
    var f = m / 255;

    r = (r - 255 * f) / (1 - f);
    g = (g - 255 * f) / (1 - f);
    b = (b - 255 * f) / (1 - f);
    var a = (1 - f) * 255;

    return color(r, g, b, a);
  }
  return col;
}
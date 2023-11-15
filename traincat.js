// Copied from https://gist.github.com/mjackson/5311256
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

// Show the train 
var canvas = document.querySelector('canvas');
var img = new Image();
img.src = './traincat.jpeg';

img.addEventListener('load', () => {
    canvas.height = img.height;
    canvas.width = img.width;
    canvas.style.height = (4*img.height) + 'px';
    canvas.style.width = (4*img.width) + 'px';
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var [xmin, ymin, h, w] = [5, 28, 160, 160];
    var left = ctx.getImageData(xmin, ymin, w, h);
    var right = ctx.getImageData(xmin + 163, ymin, w, h);
    var output = ctx.getImageData(xmin, ymin, w, h);

    var params = {};
    ['r', 'g', 'b', 'h', 's', 'l'].forEach(paramName => {
        params[paramName] = 0.0;

        var ipt = document.getElementById(paramName);
        var opt = document.getElementById(paramName + 'Out');

        ipt.addEventListener('input', e => {
            params[paramName] = 1*e.target.value;
            opt.textContent = params[paramName].toFixed(2);

            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    var l = {
                        r: left.data[(y*left.width+x)*4+0],
                        g: left.data[(y*left.width+x)*4+1],
                        b: left.data[(y*left.width+x)*4+2],
                    };
                    [l.h, l.s, l.l] = rgbToHsl(l.r, l.g, l.b);
                    var r = {
                        r: right.data[(y*right.width+x)*4+0],
                        g: right.data[(y*right.width+x)*4+1],
                        b: right.data[(y*right.width+x)*4+2],
                    };
                    [r.h, r.s, r.l] = rgbToHsl(r.r, r.g, r.b);

                    var diff = {
                        r: (l.r - r.r) * params.r,
                        g: (l.g - r.g) * params.g,
                        b: (l.b - r.b) * params.b,
                        h: (l.h - r.h) * params.h,
                        s: (l.s - r.s) * params.s,
                        l: (l.l - r.l) * params.l,
                    };

                    var n = {};
                    [n.r, n.g, n.b] = hslToRgb(r.h + diff.h, r.s + diff.s, r.l + diff.l);
                    var hslDiff = {
                        r: n.r - r.r,
                        g: n.g - r.g,
                        b: n.b - r.b,
                    };
                    var resRgb = {
                        r: r.r + diff.r + hslDiff.r,
                        g: r.g + diff.g + hslDiff.g,
                        b: r.b + diff.b + hslDiff.b,
                    }

                    output.data[(y*output.width+x)*4+0] = resRgb.r;
                    output.data[(y*output.width+x)*4+1] = resRgb.g;
                    output.data[(y*output.width+x)*4+2] = resRgb.b;
                }
            }
            ctx.putImageData(output, xmin, ymin);
        });
    });
});

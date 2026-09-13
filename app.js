function max(r, g, b) {
  return Math.max(r, g, b);
}

function min(r, g, b) {
  return Math.min(r, g, b);
}

// Función generadora del RGB
function rgbGenerator() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);

  return { r: r, g: g, b: b };
}

// Función para pasar RGB a HEXA
function rgbToHex(r, g, b) {
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`;
}

// Función para pasar RGB a HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const cmax = max(r, g, b);
  const cmin = min(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = (cmax + cmin) / 2;

  if (delta !== 0) {
    if (l <= 0.5) {
      s = delta / (cmax + cmin);
    } else {
      s = delta / (2 - cmax - cmin);
    }
  }

  if (delta !== 0) {
    if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }

  h = h * 60;
  if (h < 0) {
    h += 360;
  }

  s = s * 100;
  l = l * 100;

  return `hsl(${h}, ${s}%, ${l}%)`;
}

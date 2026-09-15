const colorCountSelect = document.getElementById('colorCount');
const colorFormatSelect = document.getElementById('colorFormat');
colorFormatSelect.addEventListener('change', renderPalette);

const paletteContainer = document.getElementById('paletteContainer');
const generateButton = document.getElementById('generateButton');
generateButton.addEventListener('click', generatePalette);

let paletaActual = [];

// Función generadora de paletas respetando el estado de bloqueo
function generatePalette() {
  const cantidad = Number(colorCountSelect.value);
  if (!cantidad) return;

  // Si la cantidad seleccionada cambió, reiniciamos la estructura
  if (paletaActual.length !== cantidad) {
    paletaActual = Array.from({ length: cantidad }, () => ({
      rgb: rgbGenerator(),
      locked: false,
    }));
  } else {
    // Si mantenemos la cantidad, solo generamos nuevos colores para los NO bloqueados
    paletaActual = paletaActual.map((item) => {
      if (item.locked) return item;
      return { rgb: rgbGenerator(), locked: false };
    });
  }

  renderPalette();
}

function renderPalette() {
  paletteContainer.innerHTML = '';

  paletaActual.forEach((item, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'contenedor';

    const formato = colorFormatSelect.value;
    let colorTexto;

    if (formato === 'hex') {
      colorTexto = rgbToHex(item.rgb.r, item.rgb.g, item.rgb.b);
    } else {
      colorTexto = rgbToHsl(item.rgb.r, item.rgb.g, item.rgb.b);
    }

    colorDiv.style.backgroundColor = colorTexto;

    // Determinar el ícono del candado según el estado
    const lockIcon = item.locked ? '🔒' : '🔓';
    const lockClass = item.locked ? 'lock-btn locked' : 'lock-btn';

    // Insertar el botón del candado y la etiqueta de texto
    colorDiv.innerHTML = `
      <button class="${lockClass}" data-index="${index}">${lockIcon}</button>
      <span class="color-text">${colorTexto}</span>
    `;

    paletteContainer.appendChild(colorDiv);
  });

  // Delegación de eventos para el botón de candado
  document.querySelectorAll('.lock-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita conflictos con otros clics
      const index = e.target.dataset.index;
      paletaActual[index].locked = !paletaActual[index].locked;
      renderPalette();
    });
  });
}

function max(r, g, b) {
  return Math.max(r, g, b);
}
function min(r, g, b) {
  return Math.min(r, g, b);
}

function rgbGenerator() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

function rgbToHex(r, g, b) {
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const cmax = max(r, g, b);
  const cmin = min(r, g, b);
  const delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = (cmax + cmin) / 2;

  if (delta !== 0) {
    s = l <= 0.5 ? delta / (cmax + cmin) : delta / (2 - cmax - cmin);
    if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }

  h = h * 60;
  if (h < 0) h += 360;

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

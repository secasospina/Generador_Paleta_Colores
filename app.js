const colorCountSelect = document.getElementById('colorCount');
const colorFormatSelect = document.getElementById('colorFormat');
colorFormatSelect.addEventListener('change', () => {
  const cantidad = colorCountSelect.value;
  const formato = colorFormatSelect.value;

  if (cantidad && formato && paletaActual.length > 0) {
    renderPalette();
    savePalette();
  }
});

const paletteContainer = document.getElementById('paletteContainer');
const generateButton = document.getElementById('generateButton');
generateButton.addEventListener('click', generatePalette);

const clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', clearPalette);

let paletaActual = [];

// Función generadora de paletas respetando el estado de bloqueo
function generatePalette() {
  const cantidad = Number(colorCountSelect.value);
  const formato = colorFormatSelect.value;

  if (!cantidad || !formato) {
    alert(
      'Faltan campos obligatorios. Selecciona la cantidad y el formato de color antes de generar la paleta.'
    );
    return;
  }

  paletaActual = Array.from({ length: cantidad }, (_, index) => {
    const colorAnterior = paletaActual[index];

    // Conserva el color si existía y estaba bloqueado.
    if (colorAnterior && colorAnterior.locked) {
      return colorAnterior;
    }

    // Crea un color nuevo si no existía o no está bloqueado.
    return {
      rgb: rgbGenerator(),
      locked: false,
    };
  });

  renderPalette();
  savePalette();
}

function renderPalette() {
  const cantidad = colorCountSelect.value;
  const formato = colorFormatSelect.value;

  // Evita mostrar una paleta si faltan selecciones
  // o si todavía no se han generado colores.
  if (!cantidad || !formato || paletaActual.length === 0) {
    paletteContainer.innerHTML = '';
    return;
  }

  paletteContainer.innerHTML = '';

  paletaActual.forEach((item, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'contenedor';

    let colorTexto;

    if (formato === 'hex') {
      colorTexto = rgbToHex(item.rgb.r, item.rgb.g, item.rgb.b);
    } else {
      colorTexto = rgbToHsl(item.rgb.r, item.rgb.g, item.rgb.b);
    }

    colorDiv.style.backgroundColor = colorTexto;

    const lockIcon = item.locked ? '🔒' : '🔓';
    const lockClass = item.locked ? 'lock-btn locked' : 'lock-btn';

    colorDiv.innerHTML = `
      <button class="${lockClass}" data-index="${index}">
        ${lockIcon}
      </button>
      <span class="color-text">${colorTexto}</span>
    `;

    paletteContainer.appendChild(colorDiv);
  });

  document.querySelectorAll('.lock-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const index = e.target.dataset.index;
      paletaActual[index].locked = !paletaActual[index].locked;

      renderPalette();
      savePalette(); // Guarda el nuevo estado del candado en localStorage
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

function savePalette() {
  const paletteData = {
    cantidad: colorCountSelect.value,
    formato: colorFormatSelect.value,
    colores: paletaActual,
  };

  localStorage.setItem('paletaGuardada', JSON.stringify(paletteData));
}

function loadPalette() {
  const paletteSaved = localStorage.getItem('paletaGuardada');

  if (!paletteSaved) return;

  const paletteData = JSON.parse(paletteSaved);

  colorCountSelect.value = paletteData.cantidad;
  colorFormatSelect.value = paletteData.formato;
  paletaActual = paletteData.colores;

  renderPalette();
}

function clearPalette() {
  paletaActual = [];
  paletteContainer.innerHTML = '';

  localStorage.removeItem('paletaGuardada');
}

const colorCountSelect = document.getElementById('colorCount');
const colorFormatSelect = document.getElementById('colorFormat');
const paletteContainer = document.getElementById('paletteContainer');

const generateButton = document.getElementById('generateButton');
const clearButton = document.getElementById('clearButton');
const savePaletteButton = document.getElementById('savePaletteButton');

const savedPalettesContainer = document.getElementById(
  'savedPalettesContainer'
);

let paletaActual = [];

generateButton.addEventListener('click', generatePalette);
clearButton.addEventListener('click', clearPalette);
savePaletteButton.addEventListener('click', saveFavoritePalette);

colorCountSelect.addEventListener('change', () => {
  const cantidadSeleccionada = Number(colorCountSelect.value);
  const coloresBloqueados = getLockedColorsCount();

  // No valida si todavía no existe una paleta o no se eligió cantidad.
  if (!cantidadSeleccionada || paletaActual.length === 0) {
    return;
  }

  // No permite reducir la paleta si hay más colores bloqueados
  // que la cantidad seleccionada.
  if (cantidadSeleccionada < coloresBloqueados) {
    showPaletteSizeError(coloresBloqueados, cantidadSeleccionada);

    // Regresa el selector a la cantidad actual de la paleta.
    colorCountSelect.value = paletaActual.length;
  }
});

colorFormatSelect.addEventListener('change', () => {
  const cantidad = colorCountSelect.value;
  const formato = colorFormatSelect.value;

  if (cantidad && formato && paletaActual.length > 0) {
    renderPalette();
    savePalette();
  }
});

savedPalettesContainer.addEventListener('click', handleSavedPalette);

paletteContainer.addEventListener('click', (event) => {
  // Evita copiar el código si el usuario presionó el candado.
  if (event.target.closest('.lock-btn')) return;

  const colorCard = event.target.closest('.contenedor');

  if (!colorCard) return;

  const colorCode = colorCard.dataset.color;

  navigator.clipboard
    .writeText(colorCode)
    .then(() => {
      alert(`Código copiado: ${colorCode}`);
    })
    .catch(() => {
      alert('No fue posible copiar el código. Inténtalo nuevamente.');
    });
});

function getLockedColorsCount() {
  return paletaActual.filter((color) => color.locked).length;
}

function showPaletteSizeError(coloresBloqueados, cantidadSeleccionada) {
  const cantidadPorDesbloquear = coloresBloqueados - cantidadSeleccionada;

  alert(
    `⚠️ ACCIÓN NO PERMITIDA

Actualmente tienes ${coloresBloqueados} colores bloqueados y seleccionaste una paleta de ${cantidadSeleccionada} colores.

Debes desbloquear al menos ${cantidadPorDesbloquear} color(es) antes de reducir el tamaño de la paleta.`
  );
}

// Genera una paleta y conserva los colores bloqueados.
function generatePalette() {
  const cantidad = Number(colorCountSelect.value);
  const formato = colorFormatSelect.value;
  const coloresBloqueados = getLockedColorsCount();

  if (!cantidad || !formato) {
    alert(
      'Faltan campos obligatorios. Selecciona la cantidad y el formato de color antes de generar la paleta.'
    );
    return;
  }

  // Validación adicional para impedir eliminar colores bloqueados.
  if (cantidad < coloresBloqueados) {
    showPaletteSizeError(coloresBloqueados, cantidad);

    colorCountSelect.value = paletaActual.length;
    return;
  }

  paletaActual = Array.from({ length: cantidad }, (_, index) => {
    const colorAnterior = paletaActual[index];

    // Conserva el color anterior si está bloqueado.
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

// Muestra la paleta en pantalla.
function renderPalette() {
  const cantidad = colorCountSelect.value;
  const formato = colorFormatSelect.value;

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
    colorDiv.dataset.color = colorTexto;

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
    btn.addEventListener('click', () => {
      const index = btn.dataset.index;

      paletaActual[index].locked = !paletaActual[index].locked;

      renderPalette();
      savePalette();
    });
  });
}

// Limpia la paleta actual.
function clearPalette() {
  paletaActual = [];
  paletteContainer.innerHTML = '';

  localStorage.removeItem('paletaGuardada');
}

// Guarda la paleta actual para recuperarla al recargar.
function savePalette() {
  const paletteData = {
    cantidad: colorCountSelect.value,
    formato: colorFormatSelect.value,
    colores: paletaActual,
  };

  localStorage.setItem('paletaGuardada', JSON.stringify(paletteData));
}

// Recupera la última paleta generada.
function loadPalette() {
  const paletteSaved = localStorage.getItem('paletaGuardada');

  if (!paletteSaved) return;

  const paletteData = JSON.parse(paletteSaved);

  colorCountSelect.value = paletteData.cantidad;
  colorFormatSelect.value = paletteData.formato;
  paletaActual = paletteData.colores;

  renderPalette();
}

// Obtiene las paletas favoritas guardadas.
function getSavedPalettes() {
  const savedPalettes = localStorage.getItem('paletasFavoritas');

  if (!savedPalettes) {
    return [];
  }

  return JSON.parse(savedPalettes);
}

// Guarda una copia de la paleta actual como favorita.
function saveFavoritePalette() {
  if (paletaActual.length === 0) {
    alert('Primero debes generar una paleta para poder guardarla.');
    return;
  }

  const savedPalettes = getSavedPalettes();

  const newSavedPalette = {
    id: Date.now(),
    format: colorFormatSelect.value,
    colors: paletaActual.map((color) => ({
      rgb: { ...color.rgb },
      locked: color.locked,
    })),
  };

  savedPalettes.unshift(newSavedPalette);

  localStorage.setItem('paletasFavoritas', JSON.stringify(savedPalettes));

  renderSavedPalettes();

  alert('Paleta guardada correctamente.');
}

// Muestra las miniaturas de las paletas favoritas.
function renderSavedPalettes() {
  const savedPalettes = getSavedPalettes();

  savedPalettesContainer.innerHTML = '';

  if (savedPalettes.length === 0) {
    savedPalettesContainer.innerHTML = `
      <p class="empty-saved-palettes">
        Aún no tienes paletas guardadas.
      </p>
    `;
    return;
  }

  savedPalettes.forEach((palette) => {
    const paletteCard = document.createElement('article');
    paletteCard.className = 'saved-palette-card';

    const palettePreview = document.createElement('div');
    palettePreview.className = 'saved-palette-preview';

    palette.colors.forEach((color) => {
      const miniColor = document.createElement('span');
      miniColor.className = 'mini-color';

      miniColor.style.backgroundColor = rgbToHex(
        color.rgb.r,
        color.rgb.g,
        color.rgb.b
      );

      palettePreview.appendChild(miniColor);
    });

    const paletteInfo = document.createElement('div');
    paletteInfo.className = 'saved-palette-info';

    const paletteText = document.createElement('span');
    paletteText.textContent = `${palette.colors.length} colores · ${palette.format.toUpperCase()}`;

    const loadButton = document.createElement('button');
    loadButton.className = 'saved-palette-action';
    loadButton.dataset.action = 'load';
    loadButton.dataset.id = palette.id;
    loadButton.textContent = 'Usar';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'saved-palette-delete';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = palette.id;
    deleteButton.setAttribute('aria-label', 'Eliminar paleta guardada');
    deleteButton.textContent = '×';

    paletteInfo.append(paletteText, loadButton, deleteButton);
    paletteCard.append(palettePreview, paletteInfo);

    savedPalettesContainer.appendChild(paletteCard);
  });
}

// Permite cargar o eliminar una paleta favorita.
function handleSavedPalette(event) {
  const button = event.target.closest('button[data-action]');

  if (!button) return;

  const paletteId = Number(button.dataset.id);
  const savedPalettes = getSavedPalettes();

  if (button.dataset.action === 'load') {
    const selectedPalette = savedPalettes.find(
      (palette) => palette.id === paletteId
    );

    if (!selectedPalette) return;

    paletaActual = selectedPalette.colors.map((color) => ({
      rgb: { ...color.rgb },
      locked: color.locked,
    }));

    colorCountSelect.value = selectedPalette.colors.length;
    colorFormatSelect.value = selectedPalette.format;

    renderPalette();
    savePalette();
  }

  if (button.dataset.action === 'delete') {
    const updatedPalettes = savedPalettes.filter(
      (palette) => palette.id !== paletteId
    );

    localStorage.setItem('paletasFavoritas', JSON.stringify(updatedPalettes));

    renderSavedPalettes();
  }
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

  let h = 0;
  let s = 0;
  const l = (cmax + cmin) / 2;

  if (delta !== 0) {
    s = l <= 0.5 ? delta / (cmax + cmin) : delta / (2 - cmax - cmin);

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

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
}

loadPalette();
renderSavedPalettes();

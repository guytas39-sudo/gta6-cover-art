// Vice Panels editor: wires the page to the rendering engine. It keeps the loaded photos and one
// view per panel (which photo, how far zoomed, how far panned), redraws the stage canvas on every
// change, and exports the cover as a PNG at the picked post size. A ?shot= query (./shots.js)
// instead sets up a fixed scene for screenshots, including a true export in __coverPNG.
import { POST_SIZES, drawCover, layoutPanels, panelBox } from './cover.js';
import { parseShotScene } from './shots.js';

const SAMPLES = [
  { name: 'Pier at Dusk', url: 'samples/pier.jpg' },
  { name: 'Boulevard', url: 'samples/boulevard.jpg' },
];

const state = {
  size: '1080x1080',
  template: 'grid',
  theme: 'sunset',
  title: 'Vice Heat',
  subtitle: 'Welcome back to Leonida',
  titleColor: '#ffffff',
  captionPos: 'bottom',
  gap: 10,
  photos: [], // [{ img, name }]
  views: [], // per panel: { photo: index into photos, zoom, x, y }
  selected: 0,
};

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const zoomRange = document.getElementById('zoom');
const panelLabel = document.getElementById('panelLabel');
const photoStrip = document.getElementById('photoStrip');

/** Loads an image from a URL or object URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** The panels of the current template at the current post size's aspect. */
function currentPanels() {
  const [w, h] = POST_SIZES[state.size];
  return layoutPanels(state.template, w / h);
}

/** Keeps one view per panel, defaulting new panels to the next photo, centred and unzoomed. */
function syncViews() {
  const count = currentPanels().length;
  while (state.views.length < count) {
    const i = state.views.length;
    state.views.push({ photo: state.photos.length ? i % state.photos.length : -1, zoom: 1, x: 0, y: 0 });
  }
  state.views.length = count;
  if (state.selected >= count) state.selected = count - 1;
  state.views.forEach((v) => {
    if (v.photo >= state.photos.length) v.photo = state.photos.length - 1;
  });
}

/** The render view drawCover() consumes: panel views resolved to images. */
function renderView(showSelection) {
  syncViews();
  return {
    template: state.template,
    theme: state.theme,
    title: state.title,
    subtitle: state.subtitle,
    titleColor: state.titleColor,
    captionPos: state.captionPos,
    gap: state.gap,
    selected: showSelection ? state.selected : -1,
    panels: state.views.map((v) => ({
      img: v.photo >= 0 ? state.photos[v.photo].img : null,
      zoom: v.zoom,
      x: v.x,
      y: v.y,
    })),
  };
}

/** Repaints the stage canvas at the post size's aspect, capped for snappy dragging. */
function redraw() {
  const [w, h] = POST_SIZES[state.size];
  const scale = Math.min(1, 920 / Math.max(w, h));
  stage.width = Math.round(w * scale);
  stage.height = Math.round(h * scale);
  drawCover(stage.getContext('2d'), stage.width, stage.height, renderView(true));
  panelLabel.textContent = state.views.length
    ? `Panel ${state.selected + 1} of ${state.views.length}`
    : 'No panels';
  const view = state.views[state.selected];
  if (view) zoomRange.value = String(Math.round(view.zoom * 100));
}

/** Renders the cover at full post size on an offscreen canvas: the exported file itself. */
function renderExportCanvas() {
  const [w, h] = POST_SIZES[state.size];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, renderView(false));
  return canvas;
}

/** Downloads the current cover as a PNG at the picked post size. */
function exportPNG() {
  renderExportCanvas().toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-panels-${state.size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    status.textContent = `Saved vice-panels-${state.size}.png`;
  }, 'image/png');
}

/** Adds a loaded image to the photo set and deals it into any panel still waiting for one. */
function addPhoto(img, name) {
  state.photos.push({ img, name });
  state.views.forEach((v) => {
    if (v.photo < 0) v.photo = state.photos.length - 1;
  });
  renderPhotoStrip();
  redraw();
}

/** The strip of loaded photos; clicking one deals it into the selected panel. */
function renderPhotoStrip() {
  photoStrip.replaceChildren();
  state.photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb';
    btn.title = `${photo.name} — click to put it in the selected panel`;
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      state.views[state.selected].photo = i;
      redraw();
    });
    photoStrip.appendChild(btn);
  });
}

/** Reads user-picked files into the photo set. */
async function readFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      addPhoto(await loadImage(URL.createObjectURL(file)), file.name);
      status.textContent = `Added ${file.name}`;
    } catch {
      status.textContent = `Could not read ${file.name}`;
    }
  }
}

function bindControls() {
  const fileInput = document.getElementById('fileInput');
  document.getElementById('addPhotos').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => readFiles(fileInput.files));
  const drop = document.getElementById('dropZone');
  drop.addEventListener('click', () => fileInput.click());
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.remove('over');
  }));
  drop.addEventListener('drop', (e) => readFiles(e.dataTransfer.files));
  document.getElementById('addSamples').addEventListener('click', async () => {
    for (const s of SAMPLES) {
      if (!state.photos.some((p) => p.name === s.name)) addPhoto(await loadImage(s.url), s.name);
    }
    status.textContent = 'Sample photos added';
  });

  document.querySelectorAll('[data-size]').forEach((btn) => btn.addEventListener('click', () => {
    state.size = btn.dataset.size;
    markActive('[data-size]', 'size');
    redraw();
  }));
  document.querySelectorAll('[data-template]').forEach((btn) => btn.addEventListener('click', () => {
    state.template = btn.dataset.template;
    markActive('[data-template]', 'template');
    redraw();
  }));
  document.querySelectorAll('[data-theme]').forEach((btn) => btn.addEventListener('click', () => {
    state.theme = btn.dataset.theme;
    markActive('[data-theme]', 'theme');
    redraw();
  }));
  document.querySelectorAll('[data-color]').forEach((btn) => btn.addEventListener('click', () => {
    state.titleColor = btn.dataset.color;
    markActive('[data-color]', 'titleColor');
    redraw();
  }));

  document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
  document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  document.getElementById('captionPos').addEventListener('change', (e) => { state.captionPos = e.target.value; redraw(); });
  document.getElementById('gap').addEventListener('input', (e) => { state.gap = Number(e.target.value); redraw(); });
  zoomRange.addEventListener('input', () => {
    state.views[state.selected].zoom = Number(zoomRange.value) / 100;
    redraw();
  });
  document.getElementById('prevPhoto').addEventListener('click', () => cyclePhoto(-1));
  document.getElementById('nextPhoto').addEventListener('click', () => cyclePhoto(1));
  document.getElementById('resetView').addEventListener('click', () => {
    const v = state.views[state.selected];
    v.zoom = 1; v.x = 0; v.y = 0;
    redraw();
  });
  document.getElementById('fillOne').addEventListener('click', () => {
    const v = state.views[state.selected];
    state.views.forEach((other) => { other.photo = v.photo; });
    status.textContent = 'Every panel now shows the selected photo';
    redraw();
  });
  document.getElementById('export').addEventListener('click', exportPNG);
}

/** Moves the selected panel's photo assignment through the loaded set. */
function cyclePhoto(step) {
  if (!state.photos.length) return;
  const v = state.views[state.selected];
  v.photo = (v.photo + step + state.photos.length) % state.photos.length;
  redraw();
}

/** Highlights the toggle button matching the current state value. */
function markActive(selector, key) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset[key === 'titleColor' ? 'color' : key] === state[key]);
  });
}

/** Pointer work on the stage: click selects a panel, drag pans its photo, wheel zooms it. */
function bindStage() {
  const pos = (e) => {
    const r = stage.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  const panelAt = (nx, ny) => {
    const panels = currentPanels();
    for (let i = panels.length - 1; i >= 0; i--) {
      const b = panelBox(panels[i]);
      if (nx >= b.x && nx <= b.x + b.w && ny >= b.y && ny <= b.y + b.h) return i;
    }
    return -1;
  };
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const [nx, ny] = pos(e);
    const hit = panelAt(nx, ny);
    if (hit < 0) return;
    state.selected = hit;
    drag = { x: e.clientX, y: e.clientY };
    stage.setPointerCapture(e.pointerId);
    redraw();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const view = state.views[state.selected];
    const img = state.photos[view.photo]?.img;
    const r = stage.getBoundingClientRect();
    const dxPix = (e.clientX - drag.x) * (stage.width / r.width);
    const dyPix = (e.clientY - drag.y) * (stage.height / r.height);
    drag = { x: e.clientX, y: e.clientY };
    if (img) {
      const box = panelBox(currentPanels()[state.selected]);
      const bw = box.w * stage.width;
      const bh = box.h * stage.height;
      const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * view.zoom;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      if (dw > bw) view.x = clamp(view.x + dxPix / ((dw - bw) / 2), -1, 1);
      if (dh > bh) view.y = clamp(view.y + dyPix / ((dh - bh) / 2), -1, 1);
    }
    redraw();
  });
  ['pointerup', 'pointercancel'].forEach((ev) => stage.addEventListener(ev, () => { drag = null; }));
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const view = state.views[state.selected];
    view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * 0.0012), 1, 3.5);
    redraw();
  }, { passive: false });
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Applies a screenshot scene: loads its photos, sets every field, paints, and flags readiness. */
async function applyShotScene(scene) {
  state.size = scene.size;
  state.template = scene.template;
  state.theme = scene.theme;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.gap = scene.gap;
  for (const name of scene.photos) {
    const sample = SAMPLES.find((s) => s.url.endsWith(`${name}.jpg`)) || SAMPLES[0];
    addPhoto(await loadImage(sample.url), sample.name);
  }
  syncViews();
  state.views.forEach((v, i) => { v.photo = scene.photos.length ? i % scene.photos.length : v.photo; });
  if (scene.mode === 'cover') {
    document.body.classList.add('shot-cover');
    const exported = renderExportCanvas();
    const shown = document.createElement('canvas');
    shown.width = exported.width;
    shown.height = exported.height;
    shown.getContext('2d').drawImage(exported, 0, 0);
    shown.id = 'coverFull';
    document.body.replaceChildren(shown);
    window.__coverPNG = exported.toDataURL('image/png');
  } else {
    document.getElementById('title').value = state.title;
    document.getElementById('subtitle').value = state.subtitle;
    redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

async function boot() {
  bindControls();
  bindStage();
  const scene = parseShotScene(new URLSearchParams(location.search));
  if (scene) {
    await applyShotScene(scene);
    return;
  }
  for (const s of SAMPLES) addPhoto(await loadImage(s.url), s.name);
  redraw();
  status.textContent = 'Sample photos loaded — add your own any time';
}

boot();

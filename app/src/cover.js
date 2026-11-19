// Vice Panels rendering engine: draws a GTA-style multi-panel cover onto any 2D canvas context.
// A cover is a set of polygon panels over a graded backdrop; each panel holds one photo the user
// can pan and zoom, and a bold caption block (title plus a subtitle pill) sits at the top or foot.
// The same drawCover() paints the editor preview and the exported PNG, so what you see is the file.

/** Colour grades. Each theme paints the backdrop, tints the photos and washes the finished cover. */
export const THEMES = {
  sunset: {
    label: 'Vice Sunset',
    backdrop: ['#2a0a2e', '#7b1e4f', '#c73a4e'],
    glow: 'rgba(255, 150, 80, 0.35)',
    washTop: 'rgba(255, 120, 70, 0.10)',
    washBottom: 'rgba(46, 10, 74, 0.38)',
    accent: '#ffb347',
    filter: 'saturate(1.28) contrast(1.07) brightness(1.03)',
  },
  neon: {
    label: 'Neon Night',
    backdrop: ['#040918', '#0b2447', '#3b0f4f'],
    glow: 'rgba(0, 229, 255, 0.28)',
    washTop: 'rgba(0, 229, 255, 0.10)',
    washBottom: 'rgba(255, 46, 136, 0.22)',
    accent: '#00e5ff',
    filter: 'saturate(1.32) contrast(1.12) brightness(1.0)',
  },
  gold: {
    label: 'Gold Hour',
    backdrop: ['#1c0f02', '#5a2d0c', '#8a4d0f'],
    glow: 'rgba(255, 190, 60, 0.32)',
    washTop: 'rgba(255, 176, 0, 0.12)',
    washBottom: 'rgba(30, 12, 0, 0.42)',
    accent: '#ffc233',
    filter: 'saturate(1.16) contrast(1.06) sepia(0.28)',
  },
  midnight: {
    label: 'Midnight Mono',
    backdrop: ['#04070d', '#0d1b2e', '#16324a'],
    glow: 'rgba(110, 180, 255, 0.26)',
    washTop: 'rgba(90, 160, 255, 0.10)',
    washBottom: 'rgba(0, 0, 10, 0.45)',
    accent: '#7cc4ff',
    filter: 'saturate(0.55) contrast(1.14) brightness(1.04)',
  },
};

/** The three post sizes the exporter offers, as [width, height]. */
export const POST_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** A rectangle panel as a four-point polygon (normalised coordinates). */
function rectPanel(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

/**
 * The panel polygons of a template at a given aspect ratio (width / height), in normalised
 * coordinates. Every template adapts: wide covers get a hero panel on the left, tall covers
 * stack the hero on top, square covers mix the two.
 */
export function layoutPanels(template, aspect) {
  const wide = aspect >= 1.3;
  const tall = aspect <= 0.85;
  if (template === 'strips') return stripsLayout(wide, tall);
  if (template === 'slash') return slashLayout(wide, tall);
  return gridLayout(wide, tall);
}

function gridLayout(wide, tall) {
  if (wide) {
    return [
      rectPanel(0, 0, 0.40, 1),
      rectPanel(0.40, 0, 0.60, 0.52),
      rectPanel(0.40, 0.52, 0.30, 0.48),
      rectPanel(0.70, 0.52, 0.30, 0.48),
    ];
  }
  if (tall) {
    return [
      rectPanel(0, 0, 1, 0.36),
      rectPanel(0, 0.36, 0.55, 0.36),
      rectPanel(0.55, 0.36, 0.45, 0.18),
      rectPanel(0.55, 0.54, 0.45, 0.18),
      rectPanel(0, 0.72, 1, 0.28),
    ];
  }
  return [
    rectPanel(0, 0, 1, 0.44),
    rectPanel(0, 0.44, 0.52, 0.30),
    rectPanel(0.52, 0.44, 0.48, 0.30),
    rectPanel(0, 0.74, 0.62, 0.26),
    rectPanel(0.62, 0.74, 0.38, 0.26),
  ];
}

function stripsLayout(wide, tall) {
  if (wide) {
    return [
      rectPanel(0, 0, 0.34, 1),
      rectPanel(0.34, 0, 0.24, 0.55),
      rectPanel(0.34, 0.55, 0.24, 0.45),
      rectPanel(0.58, 0, 0.21, 1),
      rectPanel(0.79, 0, 0.21, 1),
    ];
  }
  if (tall) {
    return [
      rectPanel(0, 0, 0.52, 1),
      rectPanel(0.52, 0, 0.48, 0.48),
      rectPanel(0.52, 0.48, 0.48, 0.52),
    ];
  }
  return [
    rectPanel(0, 0, 0.36, 1),
    rectPanel(0.36, 0, 0.30, 1),
    rectPanel(0.66, 0, 0.34, 0.52),
    rectPanel(0.66, 0.52, 0.34, 0.48),
  ];
}

function slashLayout(wide, tall) {
  if (wide) {
    return [
      [[0, 0], [0.42, 0], [0.34, 1], [0, 1]],
      [[0.42, 0], [1, 0], [1, 0.58], [0.378, 0.52]],
      [[0.378, 0.52], [1, 0.58], [1, 1], [0.34, 1]],
    ];
  }
  if (tall) {
    return [
      [[0, 0], [1, 0], [1, 0.33], [0, 0.39]],
      [[0, 0.39], [0.56, 0.356], [0.52, 0.71], [0, 0.74]],
      [[0.56, 0.356], [1, 0.33], [1, 0.69], [0.52, 0.71]],
      [[0, 0.74], [0.52, 0.71], [1, 0.69], [1, 1], [0, 1]],
    ];
  }
  return [
    [[0, 0], [0.46, 0], [0.36, 1], [0, 1]],
    [[0.46, 0], [1, 0], [1, 0.56], [0.41, 0.5]],
    [[0.41, 0.5], [1, 0.56], [1, 1], [0.36, 1]],
  ];
}

/** The axis-aligned box a polygon sits in (normalised coordinates). */
export function panelBox(poly) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Pulls every vertex of a polygon toward its centroid, opening the gutter between panels. */
function insetPolygon(poly, amount) {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, y]) => {
    const dx = cx - x;
    const dy = cy - y;
    const len = Math.hypot(dx, dy) || 1;
    const step = Math.min(amount, len * 0.4);
    return [x + (dx / len) * step, y + (dy / len) * step];
  });
}

/** Traces a polygon (in pixels) as the current path. */
function tracePolygon(ctx, poly, w, h) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * w, y * h);
    else ctx.lineTo(x * w, y * h);
  });
  ctx.closePath();
}

/** A rounded-rectangle path, for the subtitle pill. */
function traceRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws one panel's photo, cover-fitted into the panel's box, then panned and zoomed by the
 * panel's view ({ zoom, x, y } with x and y in -1..1 across the spare room). With no photo the
 * panel keeps a graded placeholder inviting one.
 */
function drawPanelPhoto(ctx, w, h, poly, view, theme) {
  const box = panelBox(poly);
  const bx = box.x * w;
  const by = box.y * h;
  const bw = box.w * w;
  const bh = box.h * h;
  ctx.save();
  tracePolygon(ctx, poly, w, h);
  ctx.clip();
  const img = view ? view.img : null;
  if (img) {
    const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * view.zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const left = bx + (bw - dw) / 2 + (view.x * (dw - bw)) / 2;
    const top = by + (bh - dh) / 2 + (view.y * (dh - bh)) / 2;
    ctx.filter = theme.filter;
    ctx.drawImage(img, left, top, dw, dh);
    ctx.filter = 'none';
  } else {
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    grad.addColorStop(0, theme.backdrop[1]);
    grad.addColorStop(1, theme.backdrop[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `700 ${Math.max(13, Math.min(bw, bh) * 0.09)}px "Arial Narrow", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', bx + bw / 2, by + bh / 2);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}

/** The theme's colour wash and a soft vignette over the finished panels. */
function drawGradeWash(ctx, w, h, theme) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, theme.washTop);
  wash.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  wash.addColorStop(1, theme.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** Splits a title into at most two lines that each fit the cover's width at the given font size. */
function wrapTitle(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [text];
  let best = [text];
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    if (lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
      const score = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const bestScore = Math.max(...best.map((l) => ctx.measureText(l).width));
      if (best.length < 2 || score < bestScore) best = lines;
    }
  }
  return best;
}

/**
 * The caption block: an optional subtitle in an accent pill and the title in heavy condensed
 * capitals with a dark outline, auto-fitted to the cover. Drawn at the foot by default, or at
 * the head when the view asks for it.
 */
function drawCaption(ctx, w, h, view, theme) {
  const title = (view.title || '').trim().toUpperCase();
  const subtitle = (view.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  const atTop = view.captionPos === 'top';
  const zone = atTop ? [0, h * 0.36] : [h * 0.58, h];
  const shade = ctx.createLinearGradient(0, zone[0], 0, zone[1]);
  if (atTop) {
    shade.addColorStop(0, 'rgba(5, 2, 14, 0.52)');
    shade.addColorStop(1, 'rgba(5, 2, 14, 0)');
  } else {
    shade.addColorStop(0, 'rgba(5, 2, 14, 0)');
    shade.addColorStop(1, 'rgba(5, 2, 14, 0.55)');
  }
  ctx.fillStyle = shade;
  ctx.fillRect(0, zone[0], w, zone[1] - zone[0]);
  ctx.textAlign = 'center';

  // Fit the title first: the subtitle pill is then placed clear of the whole title block,
  // however many lines the title wraps to.
  let titleSize = h * 0.118;
  const setTitleFont = () => {
    ctx.font = `900 ${titleSize}px "Arial Narrow", "Franklin Gothic Medium", Arial, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${titleSize * 0.04}px`;
  };
  let lines = [];
  if (title) {
    setTitleFont();
    lines = wrapTitle(ctx, title, w * 0.92);
    while (Math.max(...lines.map((l) => ctx.measureText(l).width)) > w * 0.92 && titleSize > 14) {
      titleSize -= 3;
      setTitleFont();
      lines = wrapTitle(ctx, title, w * 0.92);
    }
  }
  const lineHeight = titleSize * 1.02;

  // The title block's first baseline and the space the pill may occupy above it (at the foot)
  // or above the title (at the head, the pill simply comes first).
  let firstBaseline;
  let pillY = null;
  const subSize = Math.max(15, h * 0.021);
  const pillH = subSize * 2.0;
  if (atTop) {
    let cursor = h * 0.03;
    if (subtitle) {
      pillY = cursor;
      cursor += pillH + titleSize * 0.55;
    }
    firstBaseline = cursor + titleSize * 0.82;
  } else {
    const lastBaseline = h * 0.965;
    firstBaseline = lastBaseline - (lines.length - 1) * lineHeight;
    if (subtitle) {
      const titleTop = firstBaseline - titleSize * 0.82;
      pillY = (lines.length ? titleTop - titleSize * 0.22 : lastBaseline) - pillH;
    }
  }

  if (subtitle && pillY !== null) {
    ctx.font = `700 ${subSize}px "Arial Narrow", Arial, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${subSize * 0.32}px`;
    const pillW = ctx.measureText(subtitle).width + subSize * 2.4;
    ctx.fillStyle = theme.accent;
    traceRoundRect(ctx, (w - pillW) / 2, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = '#160820';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, w / 2, pillY + pillH / 2 + subSize * 0.05);
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  if (!title) return;
  setTitleFont();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8, 3, 18, 0.92)';
  ctx.lineWidth = titleSize * 0.16;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = titleSize * 0.18;
  ctx.shadowOffsetY = titleSize * 0.05;
  ctx.fillStyle = view.titleColor || '#ffffff';
  lines.forEach((line, i) => {
    const baseline = firstBaseline + i * lineHeight;
    ctx.strokeText(line, w / 2, baseline);
    ctx.fillText(line, w / 2, baseline);
  });
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

/**
 * Draws the whole cover. `view` carries the template and theme names, the caption fields, the
 * gutter width in pixels at this canvas size, one entry per panel ({ img, zoom, x, y }) and,
 * for the editor only, the selected panel index to outline (-1 for none).
 */
export function drawCover(ctx, w, h, view) {
  const theme = THEMES[view.theme] || THEMES.sunset;
  const backdrop = ctx.createLinearGradient(0, 0, 0, h);
  backdrop.addColorStop(0, theme.backdrop[0]);
  backdrop.addColorStop(0.55, theme.backdrop[1]);
  backdrop.addColorStop(1, theme.backdrop[2]);
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.8, h * 0.14, 0, w * 0.8, h * 0.14, Math.max(w, h) * 0.55);
  glow.addColorStop(0, theme.glow);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const panels = layoutPanels(view.template, w / h);
  const gap = view.gap ?? 10;
  const insetBy = gap > 0 ? gap / 2 / Math.max(w, h) : 0;
  panels.forEach((poly, i) => {
    const inset = gap > 0 ? insetPolygon(poly, insetBy) : poly;
    drawPanelPhoto(ctx, w, h, inset, view.panels[i], theme);
    ctx.save();
    tracePolygon(ctx, inset, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = Math.max(1.5, w * 0.0032);
    ctx.stroke();
    ctx.restore();
    if (view.selected === i) {
      ctx.save();
      tracePolygon(ctx, inset, w, h);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = Math.max(2.5, w * 0.005);
      ctx.setLineDash([w * 0.012, w * 0.009]);
      ctx.stroke();
      ctx.restore();
    }
  });

  drawGradeWash(ctx, w, h, theme);
  drawCaption(ctx, w, h, view, theme);
}

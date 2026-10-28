// ======================================================================
// DOTTED TEXT: headings redrawn in ink, letter by letter, exactly where the browser placed them
// ======================================================================
function layoutText(s) {
  const el = s.el, box = el.getBoundingClientRect();
  const r = { left: box.left - INK_PAD_X, top: box.top - INK_PAD_Y };   // the canvas extends a little past the element
  const w = Math.ceil(box.width) + INK_PAD_X * 2, h = Math.ceil(box.height) + INK_PAD_Y * 2;
  if (!w || !h) return;
  begin(w);
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const g = off.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000';
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), range = document.createRange();
  s.clean = []; s.dotSize = 0;                                         // small letters, drawn whole so they stay readable
  for (let node; (node = walker.nextNode());) {
    const cs = getComputedStyle(node.parentElement);
    g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    // headings marked "grain-full" are always drawn in dots, like the title page, whatever their size
    const full = !!node.parentElement.closest('.grain-full');
    const isSmall = !full && parseFloat(cs.fontSize) < SMALL_TEXT;
    if (!isSmall) s.dotSize = Math.min(s.dotSize || Infinity, parseFloat(cs.fontSize));
    const upper = cs.textTransform === 'uppercase';
    const clip = node.parentElement.getBoundingClientRect();   // skip letters cut off by overflow
    const color = /rgba\([^)]*,\s*0\)|transparent/.test(cs.color) ? null : cs.color;   // keep each word's own shade of ink
    const txt = node.textContent;
    for (let i = 0; i < txt.length; i++) {
      if (/\s/.test(txt[i])) continue;
      range.setStart(node, i); range.setEnd(node, i + 1);
      const cr = range.getClientRects()[0];
      if (!cr || cr.right > clip.right + 1 || cr.left < clip.left - 1) continue;
      const ch = upper ? txt[i].toUpperCase() : txt[i];
      const m = g.measureText(ch);
      const asc = m.fontBoundingBoxAscent || cr.height * 0.78;
      if (isSmall) s.clean.push([ch, cr.left - r.left, cr.top - r.top + asc, g.font, color]);
      else g.fillText(ch, cr.left - r.left, cr.top - r.top + asc);
    }
  }
  const img = g.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = img[(y * w + x) * 4 + 3];
    // mid-sized dotted headings get denser, finer dots so they stay crisp enough to read
    const mid = s.dotSize && s.dotSize < 30;
    if (a > 70 && Math.random() < (mid ? 0.97 : TEXT_DENSITY) * a / 255)
      put(x + Math.random() * 0.5, y + Math.random() * 0.5, (mid ? 0.44 : 0.55) + (mid ? 0.24 : 0.32) * Math.random(), 0.88 + 0.12 * Math.random());
  }
  finish(s, w, h);
  s.drawn = false;
  el.classList.add('inked');
}

// ======================================================================
// PAGE GRAIN AND SHADING, like graphite: very fine, very light dots over the whole page,
// thickening and darkening toward the edges (most at the spine). Drawn once, not every frame.
// ======================================================================
const PAPER_GRAIN = 0.07;    // fine grain across the whole page (kept very light in colour)
const SPINE_SHADE = 0.8;     // extra density at the spine
const EDGE_SHADE = 0.5;      // extra density at the outer, top and bottom edges
const GRAIN_SIZE = 0.18;     // dot radius in px: smaller = smoother, like graphite
function layoutShade(s) {
  const w = s.canvas.clientWidth, h = s.canvas.clientHeight;
  if (!w || !h) return;
  if (s.W === w && s.H === h && s.D.length) return;     // same size as last time: keep the grain already made
  begin(w);
  const stacked = window.innerWidth <= 900;             // on phones the pages stack, so there's no spine
  const spineOnRight = !!s.canvas.closest('.page.left');
  const spineW = clamp(w * 0.2, 90, 200), outerW = clamp(w * 0.12, 50, 130), capH = 70;
  const fall = (d, size) => d >= size ? 0 : Math.pow(1 - d / size, 2.2);   // 1 at the edge, 0 once `size` away
  // the shading is a sum of a part that depends only on the column and a part that depends only on the row,
  // so each is worked out once and looked up
  const colExtra = new Float32Array(w + 1), rowExtra = new Float32Array(h + 1);
  for (let x = 0; x <= w; x++) {
    const spineD = spineOnRight ? w - x : x, outerD = spineOnRight ? x : w - x;
    colExtra[x] = (stacked ? EDGE_SHADE * fall(spineD, outerW) : SPINE_SHADE * fall(spineD, spineW)) + EDGE_SHADE * fall(outerD, outerW);
  }
  for (let y = 0; y <= h; y++) rowExtra[y] = EDGE_SHADE * 0.6 * fall(Math.min(y, h - y), capH);
  const extraAt = (x, y) => colExtra[x | 0] + rowExtra[y | 0];
  const dot = (x, y, extra) => put(x, y, GRAIN_SIZE * (0.8 + 0.9 * Math.random()), clamp(extra / 0.5, 0, 1));
  // the light grain over the whole page, scattered directly
  for (let k = 0, n = Math.round(w * h * PAPER_GRAIN); k < n; k++) {
    const x = Math.random() * w, y = Math.random() * h;
    dot(x, y, extraAt(x, y));
  }
  // the extra shading: only the bands near the edges need visiting
  const sideW = Math.max(stacked ? outerW : spineW, outerW);
  for (let y = 0; y < h; y++) {
    const nearCap = y < capH || y > h - capH;
    for (let x = 0; x < w; x++) {
      if (!nearCap && x > sideW && x < w - sideW) { x = w - sideW - 1; continue; }   // skip the plain middle of the page
      const extra = extraAt(x, y);
      if (extra > 0 && Math.random() < extra) dot(x + Math.random(), y + Math.random(), extra);
    }
  }
  finish(s, w, h);
  s.drawn = false;
}
function renderShade(s) {                               // three tones of graphite: faint in the middle, deeper at the edges
  const d = s.D, ctx = s.ctx, tones = [[], [], []];
  for (let i = 0; i < d.length; i += 7) tones[d[i + 3] < 0.12 ? 0 : d[i + 3] < 0.45 ? 1 : 2].push(d[i], d[i + 1], d[i + 2]);
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, s.W, s.H);
  ctx.fillStyle = css('--graphite');
  [0.12, 0.34, 0.6].forEach((alpha, t) => {             // the middle stays faint; the edges go deeper
    const b = tones[t];
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let j = 0; j < b.length; j += 3) { ctx.moveTo(b[j] + b[j + 2], b[j + 1]); ctx.arc(b[j], b[j + 1], b[j + 2], 0, TAU); }
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ======================================================================
// DRAWING EACH FRAME
// ======================================================================
const LEVELS = [0.6, 0.82, 1];
const buckets = Array.from({ length: 12 }, () => []);   // 0-5 dark, 6-11 grey
const glow = new Float32Array(EVENTS.length);
const started = new Float64Array(EVENTS.length).fill(-1);
let clock = 0, boil = 0;

function toneAt(x, y) {                                 // drifting cloud across the whole page: 0 = dark ink, 1 = grey
  const sx = x / CLOUD_SIZE, sy = y / CLOUD_SIZE, t = clock * CLOUD_SPEED;
  const v = Math.sin(sx * 0.0042 + t * 0.15) * Math.cos(sy * 0.0051 - t * 0.11) * 0.55
          + Math.sin((sx + sy) * 0.0024 + t * 0.07) * 0.3
          + Math.sin(sx * 0.011 - sy * 0.008 + t * 0.2) * 0.15;
  return clamp(0.5 + v * 0.9 + (GRAY_AMOUNT - 0.5), 0, 1);
}
const grainTile = document.createElement('canvas');
grainTile.width = grainTile.height = 160;
{
  const g = grainTile.getContext('2d'), img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const n = Math.random(); img.data[i + 3] = n * n * 255 * INK_GRAIN; }
  g.putImageData(img, 0, 0);
}

function render(s, limit, ink, soft) {
  const d = s.D, ctx = s.ctx;
  if (s.light) { ink = css('--on-dark'); soft = css('--on-dark-soft'); }
  for (let i = 0; i < d.length; i += 7) {
    if (d[i + 6] > limit) continue;                     // not inked in yet
    let x = d[i], y = d[i + 1], r = d[i + 2], a = d[i + 3];
    const k = d[i + 4], own = d[i + 5];
    let dark = false;
    if (own >= 0 && glow[own] > 0) { r *= 1 + 0.5 * glow[own]; a = Math.max(a, 0.85); dark = true; }   // sounding note
    if (boil) { x += (hash(k, boil, 11, 0) - 0.5) * BOIL; y += (hash(k, boil, 12, 0) - 0.5) * BOIL; }
    const lvl = a < 0.55 ? 0 : a < 0.8 ? 1 : 2;
    const grey = s.kind === 'shade' ? 6 : !dark && hash(k, 5, 9, 2) < toneAt(x + s.px, y + s.py) * (s.kind === 'text' ? TEXT_GREY : 1) ? 6 : 0;
    buckets[grey + lvl * 2 + (k & 1)].push(x, y, r);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, s.W, s.H);
  ctx.globalCompositeOperation = s.light ? 'source-over' : 'multiply';   // light ink can't multiply onto a dark page
  buckets.forEach((b, i) => {
    if (!b.length) return;
    const isGrey = i >= 6;
    ctx.fillStyle = isGrey ? soft : ink;
    ctx.filter = isGrey && DIFFUSE > 0 ? `blur(${DIFFUSE}px)` : 'none';
    ctx.globalAlpha = LEVELS[(i % 6) >> 1] * (s.kind === 'shade' ? 0.5 : 1);   // shading stays light
    ctx.beginPath();
    for (let j = 0; j < b.length; j += 3) { ctx.moveTo(b[j] + b[j + 2], b[j + 1]); ctx.arc(b[j], b[j + 1], b[j + 2], 0, TAU); }
    ctx.fill();
    b.length = 0;
  });
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (INK_GRAIN > 0) {                                  // cut grain out of the ink only
    s.grain = s.grain || ctx.createPattern(grainTile, 'repeat');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.translate(boil * 37, boil * 53);
    ctx.fillStyle = s.grain;
    if (s.kind === 'text') ctx.globalAlpha = s.dotSize && s.dotSize < 30 ? 0.35 : 0.55;   // text keeps more of its ink
    ctx.fillRect(-160, -160, s.W + 320, s.H + 320);
    ctx.restore();
  }
  if (s.clean && s.clean.length) {                      // small letters: whole, softened at the edges, lightly grained
    ctx.save();
    if (limit !== Infinity) {                           // ink in from left to right with the rest of the text
      ctx.beginPath(); ctx.rect(0, 0, s.W * clamp((limit - 2500) / 1e5, 0, 1), s.H); ctx.clip();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.92;
    ctx.shadowColor = 'rgba(28, 28, 28, 0.35)'; ctx.shadowBlur = 1;   // a soft edge, like ink settling into paper
    s.clean.forEach(([ch, x, y, font, color]) => { ctx.font = font; ctx.fillStyle = color || ink; ctx.fillText(ch, x, y); });
    ctx.restore();
    if (INK_GRAIN > 0 && SMALL_GRAIN > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = SMALL_GRAIN;
      ctx.translate(boil * 37, boil * 53);
      ctx.fillStyle = s.grain;
      ctx.fillRect(-160, -160, s.W + 320, s.H + 320);
      ctx.restore();
    }
  }
}

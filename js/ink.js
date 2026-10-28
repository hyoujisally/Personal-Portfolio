// ======================================================================
// HELPERS
// ======================================================================
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const bez = (a, b, c, d, u) => { const v = 1 - u; return v*v*v*a + 3*v*v*u*b + 3*v*u*u*c + u*u*u*d; };
function mix(x) { x = Math.imul(x ^ (x >>> 16), 0x7FEB352D); x = Math.imul(x ^ (x >>> 15), 0x846CA68B); return x ^ (x >>> 16); }
function hash(a, b, c, d) {
  let h = mix((a | 0) ^ 0x9E3779B9); h = mix(h ^ (b | 0)); h = mix(h ^ (c | 0)); h = mix(h ^ (d | 0));
  return (h >>> 0) / 4294967296;
}
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const MUSIC_FONT = '80px "Noto Music", "Bravura Text", serif';
const TIME_FONT = '700 80px "Bodoni Moda", "Times New Roman", serif';
const ITALIC_FONT = 'italic 600 80px "EB Garamond", Georgia, serif';
const DYN_FONT = 'italic 700 80px "EB Garamond", Georgia, serif';
const G_CLEF = '\u{1D11E}', F_CLEF = '\u{1D122}', FLAT = '\u266D', NATURAL = '\u266E', SHARP = '\u266F';
const Q_REST = '\u{1D13D}', E_REST = '\u{1D13E}', S_REST = '\u{1D13F}';

// ======================================================================
// INK SURFACES
// Everything drawn in dots (the two score halves, the headings, the staff dividers) is a
// "surface": a canvas plus a list of dots built once. Each dot stores x, y, radius, darkness,
// an id, the note it belongs to (-1 = none), and its place in the ink-in order.
// ======================================================================
let W = 0, nSys = 1, D = [], cnt = 0, curOwner = -1, curSys = 0;
const surfaces = [];
const io = new IntersectionObserver(entries => entries.forEach(e => { e.target._surface.visible = e.isIntersecting; }));
function surface(canvas, kind, revealSeconds, extra) {
  const s = Object.assign({ canvas, ctx: canvas.getContext('2d'), kind, revealSeconds, D: [], W: 0, H: 0, nSys: 1,
                            px: 0, py: 0, visible: false, revealStart: null, grain: null }, extra);
  canvas._surface = s;
  s.inRight = !!canvas.closest('.page.right');
  surfaces.push(s);
  io.observe(canvas);
  return s;
}
function removeSurface(s) {
  io.unobserve(s.canvas);
  s.canvas.remove();
  if (s.el) s.el.classList.remove('inked');
  const i = surfaces.indexOf(s);
  if (i >= 0) surfaces.splice(i, 1);
}
function inkSurface(el, extra) {                        // give an element a dotted copy of its text
  const c = document.createElement('canvas');
  c.className = 'ink'; c.setAttribute('aria-hidden', 'true');
  el.appendChild(c);
  el.classList.add('ink-text');
  const s = surface(c, 'text', TEXT_REVEAL, Object.assign({ el }, extra));
  el._ink = s;
  return s;
}
function begin(width) { W = width; D = []; cnt = 0; curSys = 0; curOwner = -1; nSys = 1; }
function finish(s, w, h) {                              // store the dots and size the canvas
  s.D = D; s.W = w; s.H = h; s.nSys = nSys;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  s.canvas.width = Math.round(w * dpr); s.canvas.height = Math.round(h * dpr);
  if (s.kind === 'score') s.canvas.style.height = h + 'px';
  s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = s.canvas.getBoundingClientRect();
  s.px = r.left + window.scrollX; s.py = r.top + window.scrollY;   // page position, so the grey cloud lines up across surfaces
}

let sky = null;                                         // per line of music: highest and lowest ink in each 8px column
const SKY_COL = 8;
function put(x, y, r, a) {
  const order = curSys * 1e5 + clamp(x / W, 0, 1) * 1e5 + Math.random() * 2500;   // ragged ink-in edge
  D.push(x, y, r, a, cnt++, curOwner, order);
  if (sky) {
    const c = clamp(Math.floor(x / SKY_COL), 0, sky.cols - 1), k = sky.lines[curSys];
    if (y < k.top[c]) k.top[c] = y;
    if (y > k.bot[c]) k.bot[c] = y;
  }
}
function dotLine(x1, y1, x2, y2, step, r, a, jit = 0.4) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const n = Math.max(1, Math.ceil(len / step)), nx = -dy / len, ny = dx / len;
  for (let k = 0; k <= n; k++) {
    const t = k / n, j = (Math.random() - 0.5) * jit;
    put(x1 + dx * t + nx * j, y1 + dy * t + ny * j, r * (0.75 + 0.5 * Math.random()), a * (0.85 + 0.15 * Math.random()));
  }
}
function band(x1, y1, x2, y2, th, rs) {               // a solid stroke (beams, thick barline)
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const n = Math.max(6, Math.round(len * th * 0.95));
  for (let k = 0; k < n; k++) {
    const t = Math.random(), w = (Math.random() - 0.5) * th;
    put(x1 + dx * t + nx * w, y1 + dy * t + ny * w, (0.45 + 0.35 * Math.random()) * rs, 0.85 + 0.15 * Math.random());
  }
}
function cluster(x, y, rad, rs) {
  for (let k = 0; k < 9; k++) {
    const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * rad;
    put(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 0.55 * rs, 0.9);
  }
}
function staffLines(x1, x2, top, sp, rs) {           // five ruled lines, slightly wavering, pen running dry
  const seed = Math.random() * 100;
  for (let L = 0; L < 5; L++) {
    const y0 = top + L * sp, step = 2, n = Math.floor((x2 - x1) / step);
    const dryLen = 220 + Math.random() * 260, dryPh = Math.random();
    let skip = 0;
    for (let k = 0; k <= n; k++) {
      if (skip > 0) { skip--; continue; }
      if (Math.random() < 0.0025) { skip = 2 + Math.floor(Math.random() * 3); continue; }   // pen lift
      const x = x1 + k * step + (Math.random() - 0.5) * 1.2;
      const wob = Math.sin(x * 0.008 + seed + L) * 0.35 + Math.sin(x * 0.031 + seed * 2 + L * 2) * 0.18;
      const dry = 1 - ((x / dryLen + dryPh) % 1);
      put(x, y0 + wob + (Math.random() - 0.5) * 0.6,
          (0.4 + 0.4 * Math.random()) * (0.8 + 0.3 * dry) * rs, (0.5 + 0.45 * dry) * (0.75 + 0.25 * Math.random()));
    }
  }
}

// Solid shapes (clefs, accidentals, rests, numbers, the brace) are drawn once to a hidden canvas
// and then re-made out of dots: every inked pixel has a chance to become a dot.
const shapeCache = new Map();
function pixelsOf(id, w, h, draw) {
  if (shapeCache.has(id)) return shapeCache.get(id);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; draw(g);
  const img = g.getImageData(0, 0, w, h).data, pts = [];
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (img[(y * w + x) * 4 + 3] > 110) {
      pts.push(x, y);
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const res = pts.length ? { pts, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null;
  shapeCache.set(id, res);
  return res;
}
function stipple(res, ox, oy, sx, sy, rs) {
  if (!res) return;
  const keep = clamp(INK_DENSITY * sx * sy, 0, 1);
  for (let i = 0; i < res.pts.length; i += 2) {
    if (Math.random() > keep) continue;
    put(ox + (res.pts[i] - res.x0) * sx, oy + (res.pts[i + 1] - res.y0) * sy, (0.5 + 0.4 * Math.random()) * rs, 0.85 + 0.15 * Math.random());
  }
}
function glyph(text, font, x, top, h, align, rs) {   // fit a character to a height and stipple it
  const g = pixelsOf(font + '|' + text, 420, 420, c => { c.font = font; c.fillText(text, 120, 280); });
  if (!g) return 0;
  const s = h / g.h, w = g.w * s;
  stipple(g, align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, top, s, s, rs);
  return w;
}
function drawBrace(c) {
  c.beginPath();
  c.moveTo(58, 0);
  c.bezierCurveTo(8, 40, 52, 250, 0, 300);
  c.bezierCurveTo(52, 350, 8, 560, 58, 600);
  c.bezierCurveTo(30, 560, 72, 360, 20, 300);
  c.bezierCurveTo(72, 240, 30, 40, 58, 0);
  c.fill();
}

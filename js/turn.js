// ======================================================================
// THE PAGE TURN, in grain: every pixel of the right page gets a fixed random threshold and a slightly
// different shade of charcoal. As the shadow front moves from the right edge to the spine, pixels darken
// once the shadow's strength passes their threshold, so the edge dissolves like graphite instead of a
// smooth digital gradient, and the dark page itself keeps a fine grain.
// ======================================================================
const TURN_SECONDS = 0.8;    // each half of the turn: the shadow covering the page, then passing off it
const TURN_SOFTNESS = 0.9;   // width of the soft shadow front, as a share of the page (wider = more diffused)
const TURN_TILT = 0.4;       // how far the top of the shadow leads the bottom, like a lifted page corner
const TURN_CURVE = 1.8;
const TURN_RESOLUTION = 0.5; // canvas pixels per screen pixel for the shadow (soft, so it doesn't need more)      // how much the shadow's edge bends (1 = straight slant, higher = a curling page)
const tctx = document.querySelector('canvas.turn').getContext('2d');
let turnW = 0, turnH = 0, turnThresh = null, turnColor = null, turnImg = null, turnBuf = null, turnRow = null;
let turnState = { phase: 'out', dir: 'rtl', p: 1 }, turnAnim = null, turning = false;
function sizeTurn() {
  // the shadow is a soft gradient, so it's worked out at half the screen's size and smoothed up by the browser:
  // a quarter of the pixels to compute each frame, so it moves at full speed
  const c = tctx.canvas, r = c.getBoundingClientRect(), dpr = TURN_RESOLUTION;
  turnW = Math.max(1, Math.round(r.width * dpr)); turnH = Math.max(1, Math.round(r.height * dpr));
  c.width = turnW; c.height = turnH;
  turnImg = tctx.createImageData(turnW, turnH);
  turnBuf = new Uint32Array(turnImg.data.buffer);
  turnThresh = new Float32Array(turnW * turnH);
  turnColor = new Uint32Array(turnW * turnH);
  turnRow = new Float32Array(turnH);
  const tilt = turnW * TURN_TILT;
  for (let y = 0; y < turnH; y++) turnRow[y] = Math.pow(1 - y / turnH, TURN_CURVE) * tilt;   // a curved edge: the top corner leads
  const spine = Math.min(140 * dpr, turnW * 0.2), stacked = window.innerWidth <= 900;
  for (let y = 0, i = 0; y < turnH; y++) for (let x = 0; x < turnW; x++, i++) {
    turnThresh[i] = Math.random();
    let g = 30;
    const fromSpine = Math.abs(x - turnW / 2);             // the spine runs down the middle of the screen
    if (!stacked && fromSpine < spine) g -= Math.pow(1 - fromSpine / spine, 2) * 14;
    g = Math.max(0, Math.min(255, Math.round(g)));
    turnColor[i] = (g << 16) | (g << 8) | g;
  }
  drawTurn();
  buildTurnGrain();
}
const grainEl = document.querySelector('.turn-grain');
function buildTurnGrain() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3), n = 256;
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), img = g.createImageData(n, n);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() + Math.random() - 1) * 70;   // mid grey with soft variation: overlay leaves mid grey invisible
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainEl.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  grainEl.style.backgroundSize = (n / dpr) + 'px ' + (n / dpr) + 'px';   // one speck per physical screen pixel
}
// phase 'in': the shadow spreads across the page; phase 'out': it passes off the far side.
// dir 'rtl' moves right to left (turning forward), 'ltr' left to right (turning back).
function drawTurn() {
  if (!turnBuf) return;
  const { phase, dir, p } = turnState;
  if (phase === 'out' && p >= 1) { tctx.clearRect(0, 0, turnW, turnH); return; }
  const soft = turnW * TURN_SOFTNESS, front = p * (turnW + turnW * TURN_TILT + soft);
  for (let y = 0, i = 0; y < turnH; y++) {
    const off = turnRow[y];
    for (let x = 0; x < turnW; x++, i++) {
      const dist = (dir === 'rtl' ? turnW - 1 - x : x) + off;
      let v = (front - dist) / soft;
      v = v <= 0 ? 0 : v >= 1 ? 1 : v * v * v * (v * (v * 6 - 15) + 10);   // an extra-smooth ramp: no visible edge
      let cov = phase === 'in' ? v : 1 - v;
      if (cov <= 0) { turnBuf[i] = 0; continue; }
      // (the grain comes from a separate, full-resolution layer, so the shadow itself stays smooth)
      const a = cov >= 1 ? 255 : (cov * 255) | 0;
      turnBuf[i] = (a << 24) | turnColor[i];
    }
  }
  tctx.putImageData(turnImg, 0, 0);
}
// Each half follows the same eased path as always, but skips the stretch where nothing visibly changes:
// the end of the sweep in, once the whole screen already looks dark, and the start of the sweep out,
// before any of the page shows through. The moving parts keep exactly the same speed.
const COVERED_LOOK = 0.9;    // how dark counts as "fully dark" (lower trims more of the dark moment)
function animateTurn(phase, dir, done) {
  cancelAnimationFrame(turnAnim);
  const easeIn = t => 1 - Math.pow(1 - t, 2.2), easeOut = t => Math.pow(t, 1.8);
  const range = 1 + TURN_TILT + TURN_SOFTNESS;          // the shadow's travel, in page widths
  const pDark = Math.min(1, (1 + TURN_TILT + COVERED_LOOK * TURN_SOFTNESS) / range);   // every corner already dark
  const pShow = (1 - COVERED_LOOK + 0.18) * TURN_SOFTNESS / range;                     // the first corner starts to show
  const t0 = phase === 'in' ? 0 : Math.pow(pShow, 1 / 1.8);
  const t1 = phase === 'in' ? 1 - Math.pow(1 - pDark, 1 / 2.2) : 1;
  const start = performance.now(), dur = reduceMotion ? 0 : TURN_SECONDS * 1000 * (t1 - t0);
  const step = now => {
    const t = dur ? t0 + (t1 - t0) * clamp((now - start) / dur, 0, 1) : t1;
    turnState = { phase, dir, p: phase === 'in' ? easeIn(t) : easeOut(t) };
    drawTurn();
    if (t < t1) turnAnim = requestAnimationFrame(step);
    else { if (phase === 'out') { turnState = { phase, dir, p: 1 }; drawTurn(); } if (done) done(); }
  };
  turnAnim = requestAnimationFrame(step);
}

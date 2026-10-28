// ======================================================================
// LOOP AND START-UP
// ======================================================================
buildContents();
buildWorksMenu();
const scoreSurfaces = ['line1', 'line2', 'line3', 'line4'].map(id => surface(document.getElementById(id), 'score', SCORE_REVEAL));
const homeText = [...homeEl.querySelectorAll('.ink-text')].map(e => inkSurface(e));
const homeShades = [...homeEl.querySelectorAll('canvas.shade')].map(c => surface(c, 'shade', 0.001, { drawn: false }));
const projectShades = [...projectEl.querySelectorAll('canvas.shade')].map(c => surface(c, 'shade', 0.001, { drawn: false }));

function layoutAll() {                                  // lay out whichever spread is showing
  if (current) layoutProject(); else layoutHome();
  sizeTurn();
}

let last = performance.now(), acc = 0, frameNo = 0;
function loop(now) {
  requestAnimationFrame(loop);
  acc += Math.min((now - last) / 1000, 0.25);
  last = now;
  if (acc < 1 / FPS) return;
  clock += acc; acc = 0; frameNo++;
  boil = reduceMotion ? 0 : frameNo % 3;
  updateGlow();
  const ink = css('--score-ink'), soft = css('--score-soft');
  surfaces.forEach(s => {
    if (!s.visible || (!s.D.length && !(s.clean && s.clean.length))) return;
    if (s.kind === 'shade') {                           // paper grain doesn't move: draw it once
      if (!s.drawn) { renderShade(s); s.drawn = true; }
      return;
    }
    if (s.revealStart === null) s.revealStart = now;   // each surface inks in the first time it comes into view
    const p = (now - s.revealStart) / 1000 / s.revealSeconds, done = reduceMotion || p >= 1;
    if (done && s.kind === 'text' && !s.D.length) {     // small text holds still once it's inked in: draw it once
      if (!s.drawn) { render(s, Infinity, ink, soft); s.drawn = true; }
      return;
    }
    render(s, done ? Infinity : ease(clamp(p, 0, 1)) * s.nSys * 1e5 + 2500, ink, soft);
  });
}

let resizeTimer, lastW = window.innerWidth, lastH = window.innerHeight;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth === lastW && window.innerHeight === lastH) return;
    lastW = window.innerWidth; lastH = window.innerHeight;
    layoutAll();
  }, 150);
});

(async function start() {
  try {                                                 // wait for the fonts (up to 3 s)
    await Promise.race([
      Promise.all([
        document.fonts.load(MUSIC_FONT, G_CLEF + F_CLEF + FLAT + NATURAL + Q_REST),
        document.fonts.load(TIME_FONT, '24'),
        document.fonts.load(ITALIC_FONT, '56'),
        document.fonts.load(DYN_FONT, 'p'),
        document.fonts.load('500 32px "Bodoni Moda"', 'IV'),
        document.fonts.load('500 32px "EB Garamond"', 'Works'),
        document.fonts.load('italic 700 17px "EB Garamond"', 'Allegretto')
      ]),
      new Promise(r => setTimeout(r, 3000))
    ]);
  } catch (e) { /* fall back to whatever fonts are available */ }
  layoutAll();
  requestAnimationFrame(loop);
  setTimeout(preEngrave, 1500);                         // after the opening has inked in
})();

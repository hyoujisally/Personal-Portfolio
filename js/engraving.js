// ======================================================================
// ENGRAVING
// ======================================================================
function head(x, y, sp, hollow, rs) {
  const rx = sp * 0.64, ry = sp * 0.45, cr = Math.cos(-0.35), sr = Math.sin(-0.35);
  const at = (th, rr) => {
    const ex = Math.cos(th) * rr * rx, ey = Math.sin(th) * rr * ry;
    put(x + ex * cr - ey * sr, y + ex * sr + ey * cr, (0.45 + 0.4 * Math.random()) * rs, 0.85 + 0.15 * Math.random());
  };
  const ringN = Math.max(10, Math.round(TAU * Math.sqrt((rx * rx + ry * ry) / 2) / 1.1));
  for (let c = 0; c < ringN; c++) at(c / ringN * TAU + (Math.random() - 0.5) * 0.25, 0.93 + (Math.random() - 0.5) * 0.12);
  if (hollow) for (let c = 0; c < ringN; c++) at(c / ringN * TAU, 0.74 + (Math.random() - 0.5) * 0.1);
  else for (let c = 0, n = Math.round(clamp(rx * ry * 2.4, 14, 140)); c < n; c++) at(Math.random() * TAU, Math.sqrt(Math.random()) * 0.9);
}
function ledger(x, y, sp, rs) { dotLine(x - sp * 1.05, y, x + sp * 1.05, y, 1.5, 0.58 * rs, 0.92, 0.3); }
function accidental(sign, xRight, y, sp, rs) {
  if (sign === 'b') glyph(FLAT, MUSIC_FONT, xRight, y - sp * 1.79, sp * 2.3, 'right', rs);
  else glyph(sign === '#' ? SHARP : NATURAL, MUSIC_FONT, xRight, y - sp * 1.4, sp * 2.8, 'right', rs);
}
function flag(sx, ey, up, sp, rs) {
  const toHead = up ? 1 : -1;
  const q = [[sx, ey], [sx + sp * 1.1, ey + toHead * sp * 0.9], [sx + sp * 1.0, ey + toHead * sp * 1.9], [sx + sp * 0.5, ey + toHead * sp * 2.6]];
  const m = Math.max(6, Math.round(sp * 3 / 1.6));
  for (let c = 0; c <= m; c++) {
    const t = c / m, x = bez(q[0][0], q[1][0], q[2][0], q[3][0], t), y = bez(q[0][1], q[1][1], q[2][1], q[3][1], t);
    put(x, y, (0.45 + 0.35 * Math.random()) * rs, 0.85);
    if (t < 0.6) put(x + 0.7, y + toHead * 0.7, 0.45 * rs, 0.75);       // heavier near the stem
  }
}
function rest(n, top, multi, vi, sp, rs) {
  const mid = top + sp * 2 + (multi ? (vi === 0 ? -sp * 1.5 : sp * 1.5) : 0);
  if (n.beats >= 0.99) glyph(Q_REST, MUSIC_FONT, n.x, mid - sp * 1.45, sp * 2.9, 'center', rs);
  else if (n.beats >= 0.49) glyph(E_REST, MUSIC_FONT, n.x, mid - sp * 1.15, sp * 1.9, 'center', rs);
  else glyph(S_REST, MUSIC_FONT, n.x, mid - sp * 1.1, sp * 2.7, 'center', rs);
  if (n.dotted) cluster(n.x + sp * 1.1, mid - sp * 0.5, sp * 0.17, rs);
}

// stems, flags and beams for one beam group
function stems(gr, sp, rs) {
  const up = gr[0].up, d = up ? -1 : 1;
  const sxOf = n => n.x + (up ? sp * 0.6 : -sp * 0.6);
  if (gr.length === 1) {
    const n = gr[0];
    if (n.beats >= 4) return;
    curOwner = n.id;
    const sx = sxOf(n), ey = n.y + d * (sp * 3.5 + Math.max(0, n.nb - 1) * sp * 0.75);
    dotLine(sx, n.y, sx, ey, 1.3, 0.62 * rs, 0.92, 0.3);
    for (let f = 0; f < n.nb; f++) flag(sx, ey - d * f * sp * 0.8, up, sp, rs);
    n.stemEnd = ey;
    curOwner = -1;
    return;
  }
  const A = gr[0], B = gr[gr.length - 1], xa = sxOf(A), xb = sxOf(B);
  const maxNb = Math.max(...gr.map(n => n.nb));
  const minLen = sp * (3.1 + Math.max(0, maxNb - 1) * 0.75);
  let ya = A.y + d * sp * 3.5;
  const slope = clamp((B.y - A.y) / (xb - xa || 1), -0.12, 0.12);
  let push = 0;
  gr.forEach(n => {
    const by = ya + slope * (sxOf(n) - xa), len = (by - n.y) * d;
    if (len < minLen) push = Math.max(push, minLen - len);
  });
  ya += d * push;
  const beamY = x => ya + slope * (x - xa);
  gr.forEach(n => {
    curOwner = n.id;
    const sx = sxOf(n);
    dotLine(sx, n.y, sx, beamY(sx), 1.3, 0.62 * rs, 0.92, 0.3);
    n.stemEnd = beamY(sx);
  });
  curOwner = -1;
  const th = sp * 0.42;
  for (let lvl = 0; lvl < maxNb; lvl++) {
    const off = -d * lvl * sp * 0.75;
    for (let i = 0; i < gr.length; i++) {
      const n = gr[i], nx = gr[i + 1], pv = gr[i - 1];
      if (n.nb <= lvl) continue;
      if (nx && nx.nb > lvl) band(sxOf(n), beamY(sxOf(n)) + off, sxOf(nx), beamY(sxOf(nx)) + off, th, rs);
      else if (!(pv && pv.nb > lvl)) {
        const x1 = sxOf(n), x2 = x1 + (nx ? 1 : -1) * sp * 1.1;
        band(x1, beamY(x1) + off, x2, beamY(x2) + off, th, rs);
      }
    }
  }
  if (gr.some(n => n.triplet)) {
    const cx = (xa + xb) / 2, h = sp * 1.3, edge = beamY(cx) + d * sp * 0.9;
    glyph(String(gr.length), ITALIC_FONT, cx, up ? edge - h : edge, h, 'center', rs);
  }
}

function staffBar(voices, st, top, xOf, sp, rs, sys, melodyByBar, bi) {
  const base = st === 't' ? 30 : 18;
  const multi = voices.length > 1;
  voices.forEach(v => v.forEach(n => {
    n.x = xOf(n.onset);
    if (!n.rest) { n.p = n.li + n.octave * 7 - base; n.y = top + (8 - n.p) * sp / 2; }
  }));
  const state = new Map();
  voices.flat().filter(n => !n.rest).sort((a, b) => a.onset - b.onset).forEach(n => {
    const k = n.letter + n.octave;
    const expected = state.has(k) ? state.get(k) : (KEY_FLATS.includes(n.letter) ? 'b' : '');
    n.showAcc = n.acc !== expected ? (n.acc || 'n') : null;
    state.set(k, n.acc);
  });
  voices.forEach((voice, vi) => {
    const groups = []; let prev = null;
    voice.forEach(n => {
      if (n.rest) { prev = null; return; }
      const join = prev && n.beats < 0.99 && prev.beats < 0.99 && Math.floor(n.onset + 1e-6) === Math.floor(prev.onset + 1e-6);
      if (join) groups[groups.length - 1].push(n); else groups.push([n]);
      prev = n;
    });
    groups.forEach(gr => {
      const up = multi ? vi === 0 : gr.reduce((a, n) => a + n.p, 0) / gr.length < 4;
      gr.forEach(n => { n.up = up; n.multi = multi; n.nb = n.beats >= 0.99 ? 0 : n.beats > 0.25 ? 1 : n.beats > 0.125 ? 2 : 3; });
    });
    voice.forEach(n => {
      if (n.rest) { if (!n.hidden) rest(n, top, multi, vi, sp, rs); return; }
      curOwner = n.id;
      for (let lp = 10; lp <= n.p; lp += 2) ledger(n.x, top + (8 - lp) * sp / 2, sp, rs);
      for (let lp = -2; lp >= n.p; lp -= 2) ledger(n.x, top + (8 - lp) * sp / 2, sp, rs);
      head(n.x, n.y, sp, n.beats >= 2, rs);
      if (n.showAcc) accidental(n.showAcc, n.x - sp * 1.0, n.y, sp, rs);
      if (n.dotted) cluster(n.x + sp * 1.3, n.y - (n.p % 2 === 0 ? (n.multi && !n.up ? -1 : 1) * sp / 2 : 0), sp * 0.17, rs);
      curOwner = -1;
    });
    groups.forEach(gr => stems(gr, sp, rs));
    if (st === 't' && vi === 0)
      melodyByBar[bi] = voice.filter(n => !n.rest).map(n => Object.assign(n, sys));
  });
}

function slur(A, B, between, sp, rs) {
  const above = A.multi || !A.up;
  const dirY = above ? -1 : 1;
  const anchor = n => above ? (n.up ? n.stemEnd - sp * 0.7 : n.y - sp * 0.9) : (n.up ? n.y + sp * 0.9 : n.stemEnd + sp * 0.7);
  if (A.sys === B.sys) {
    arc(A.x, anchor(A), B.x, anchor(B), dirY, between.map(n => [n.x, anchor(n)]), sp, rs);
  } else {
    curSys = A.sys; arc(A.x, anchor(A), A.sysEnd, anchor(A) + dirY * sp * 0.6, dirY, [], sp, rs);
    curSys = B.sys; arc(B.sysStart, anchor(B) + dirY * sp * 0.6, B.x, anchor(B), dirY, [], sp, rs);
  }
}
function halfSlur(n, isStart, sp, rs) {
  const above = n.multi || !n.up, dirY = above ? -1 : 1;
  const y = above ? (n.up ? n.stemEnd - sp * 0.7 : n.y - sp * 0.9) : (n.up ? n.y + sp * 0.9 : n.stemEnd + sp * 0.7);
  curSys = n.sys;
  if (isStart) arc(n.x, y, n.sysEnd, y + dirY * sp * 0.6, dirY, [], sp, rs);
  else arc(n.sysStart, y + dirY * sp * 0.6, n.x, y, dirY, [], sp, rs);
}
function arc(x1, y1, x2, y2, dirY, obstacles, sp, rs) {
  const dx = x2 - x1;
  let h = clamp(Math.abs(dx) * 0.14, sp * 0.6, sp * 2.2);
  obstacles.forEach(([ox, oy]) => {
    const t = (ox - x1) / (dx || 1);
    if (t <= 0.02 || t >= 0.98) return;
    const need = (oy - (y1 + (y2 - y1) * t)) * dirY + sp * 0.4, bump = 4 * t * (1 - t);
    if (need > h * bump) h = need / bump;
  });
  h = Math.min(h, sp * 4);
  const c1y = y1 + dirY * h * 1.33, c2y = y2 + dirY * h * 1.33;
  const m = Math.max(10, Math.round(Math.abs(dx) / 1.4));
  for (let k = 0; k <= m; k++) {
    const t = k / m;
    const x = bez(x1, x1 + dx * 0.25, x2 - dx * 0.25, x2, t), y = bez(y1, c1y, c2y, y2, t);
    const th = Math.sin(Math.PI * t) * sp * 0.24;
    put(x, y, (0.45 + 0.3 * Math.random()) * rs, 0.85);
    if (th > 0.8) put(x, y + dirY * th, (0.45 + 0.3 * Math.random()) * rs, 0.85);
  }
}

// One half of the score (bars b0 to b1). Drawn once to measure each line's outline,
// then again with the lines nested as close as they go without touching.
function buildScore(sp, perSys, tops, b0, b1, endStyle) {
  const rs = Math.max(0.92, sp / 9);
  nSys = Math.ceil((b1 - b0) / perSys);
  const cols = Math.ceil(W / SKY_COL) + 1;
  sky = { cols, lines: Array.from({ length: nSys }, () => ({ top: new Float32Array(cols).fill(Infinity), bot: new Float32Array(cols).fill(-Infinity) })) };
  const tTops = tops || Array.from({ length: nSys }, (_, s) => s * sp * 40);
  D = []; cnt = 0;
  const left = sp * 2.6, right = W - sp * 0.6;
  const melodyByBar = [];
  for (let s = 0; s < nSys; s++) {
    curSys = s; curOwner = -1;
    const tTop = tTops[s], bTop = tTop + sp * 12, bBot = bTop + sp * 4;
    const yOf = (top, p) => top + (8 - p) * sp / 2;
    staffLines(left, right, tTop, sp, rs);
    staffLines(left, right, bTop, sp, rs);
    dotLine(left, tTop, left, bBot, 1.5, 0.6 * rs, 0.95, 0.3);
    const br = pixelsOf('brace', 80, 600, drawBrace);
    stipple(br, left - sp * 1.9, tTop, sp * 1.4 / br.w, (bBot - tTop) / br.h, rs);
    glyph(G_CLEF, MUSIC_FONT, left + sp * 0.6, tTop - sp * 1.6, sp * 7.2, 'left', rs);
    glyph(F_CLEF, MUSIC_FONT, left + sp * 0.6, bTop - sp * 0.05, sp * 3.25, 'left', rs);
    let x = left + sp * 3.7;
    KEY_POS.t.forEach((p, i) => glyph(FLAT, MUSIC_FONT, x + i * sp * 1.05, yOf(tTop, p) - sp * 1.79, sp * 2.3, 'left', rs));
    KEY_POS.b.forEach((p, i) => glyph(FLAT, MUSIC_FONT, x + i * sp * 1.05, yOf(bTop, p) - sp * 1.79, sp * 2.3, 'left', rs));
    x += KEY_POS.t.length * sp * 1.05 + sp * 0.7;
    const firstBar = b0 + s * perSys;
    if (firstBar === 0) {                                                             // time signature at the very start
      [tTop, bTop].forEach(top => {
        glyph(TIME_SIG[0], TIME_FONT, x + sp, top, sp * 2, 'center', rs);
        glyph(TIME_SIG[1], TIME_FONT, x + sp, top + sp * 2, sp * 2, 'center', rs);
      });
      x += sp * 2.6;
    } else {
      glyph(String(firstBar + 1), ITALIC_FONT, left, tTop - sp * 3.4, sp * 1.4, 'left', rs);   // bar number
    }
    const barsStart = x + sp * 0.4, barW = (right - barsStart) / perSys;
    const sys = { sys: s, sysStart: barsStart - sp * 0.4, sysEnd: right };
    for (let j = 0; j < perSys; j++) {
      const bi = firstBar + j;
      if (bi >= b1) break;
      const bx = barsStart + j * barW, lastOfLine = bi === b1 - 1;
      const lastOfScore = lastOfLine && endStyle === 'repeat', lastOfHalf = lastOfLine && endStyle === 'double';
      const padL = sp * 1.8, padR = lastOfScore ? sp * 2.9 : lastOfHalf ? sp * 1.8 : sp * 1.2;
      const xOf = onset => bx + padL + onset / BEATS_PER_BAR * (barW - padL - padR);
      staffBar(BARS[bi].t, 't', tTop, xOf, sp, rs, sys, melodyByBar, bi);
      staffBar(BARS[bi].b, 'b', bTop, xOf, sp, rs, sys, melodyByBar, bi);
      curOwner = -1;
      const ex = bx + barW;
      if (lastOfScore) {                                                              // end repeat: the music loops
        band(ex - sp * 0.28, tTop, ex - sp * 0.28, bBot, sp * 0.5, rs);
        dotLine(ex - sp * 1.0, tTop, ex - sp * 1.0, bBot, 1.5, 0.55 * rs, 0.95, 0.25);
        [tTop, bTop].forEach(top => [1.5, 2.5].forEach(k => cluster(ex - sp * 1.65, top + k * sp, sp * 0.22, rs)));
      } else if (lastOfHalf) {                                                        // double barline: end of a section
        dotLine(ex - sp * 0.6, tTop, ex - sp * 0.6, bBot, 1.5, 0.55 * rs, 0.95, 0.25);
        dotLine(ex, tTop, ex, bBot, 1.5, 0.55 * rs, 0.95, 0.25);
      } else {
        dotLine(ex, tTop, ex, bBot, 1.7, 0.55 * rs, 0.9, 0.3);
      }
    }
    if (firstBar === 0 && melodyByBar[0]) glyph('p', DYN_FONT, melodyByBar[0][0].x - sp * 1.6, tTop + sp * 6.8, sp * 1.8, 'left', rs);
  }

  curOwner = -1;
  const flat = melodyByBar.flat();
  SLURS.forEach(([ba, ia, bb, ib]) => {
    const inA = ba - 1 >= b0 && ba - 1 < b1, inB = bb - 1 >= b0 && bb - 1 < b1;
    const A = inA && melodyByBar[ba - 1] && melodyByBar[ba - 1][ia], B = inB && melodyByBar[bb - 1] && melodyByBar[bb - 1][ib];
    if (A && B) {
      curSys = A.sys;
      const between = flat.slice(flat.indexOf(A) + 1, flat.indexOf(B)).filter(n => n.sys === A.sys);
      slur(A, B, between, sp, rs);
    } else if (A || B) {                                // a slur that continues onto another line: draw this line's half
      halfSlur(A || B, !!A, sp, rs);
    }
  });

  const gap = sp * 1.6, pad = sp * 0.8;
  const rel = sky.lines.map((k, s) => ({ top: k.top.map(v => v - tTops[s]), bot: k.bot.map(v => v - tTops[s]) }));
  const newTops = [];
  rel.forEach((k, s) => {
    if (s === 0) { newTops.push(pad - Math.min(...k.top)); return; }
    const above = rel[s - 1];
    let need = -Infinity;
    for (let c = 0; c < cols; c++) {
      if (above.bot[c] > -Infinity && k.top[c] < Infinity) need = Math.max(need, above.bot[c] - k.top[c]);
    }
    newTops.push(newTops[s - 1] + need + gap);
  });
  sky = null;
  return { tops: newTops, heightOf: n => newTops[n - 1] + Math.max(...rel[n - 1].bot) + pad };
}

// all four lines use the same size, set by the width of a page
function layoutScores() {
  const w = scoreSurfaces[0].canvas.parentElement.clientWidth;
  const perSys = w < 560 ? 2 : 4;                       // bars per line of music (2 on narrow screens)
  const sp = clamp(w / (perSys === 4 ? 108 : 58), 5.4, 9);
  scoreSurfaces.forEach((s, i) => {
    const [b0, b1] = LINES[i];
    begin(s.canvas.parentElement.clientWidth);
    const plan = buildScore(sp, perSys, null, b0, b1, LINE_ENDS[i]);
    const final = buildScore(sp, perSys, plan.tops, b0, b1, LINE_ENDS[i]);
    finish(s, W, Math.ceil(final.heightOf(nSys)));
  });
}

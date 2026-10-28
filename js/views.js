// ======================================================================
// VIEWS: the contents page, the project spreads, the picture popup and the page turns between them
// ======================================================================
const $ = sel => document.querySelector(sel);
const homeEl = $('#home'), projectEl = $('#project'), turnEl = $('canvas.turn');
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// The Works menu on every title page, built from PROJECTS
const menus = [...document.querySelectorAll('.menu')].map(m => ({ el: m, toggle: m.querySelector('.works-toggle'), list: m.querySelector('.works-menu') }));
function buildWorksMenu() {
  menus.forEach(({ list }) => PROJECTS.filter(p => p.group === 'Works').forEach(p => {
    const b = el('button');
    b.type = 'button'; b.dataset.id = p.id;
    b.append(el('span', 'no', p.no), el('span', 't', p.title));
    const li = el('li'); li.append(b);
    list.append(li);
  }));
}
// The shading around the menu: fine graphite dots, densest right at the edge, fading out a little way
// beyond it (a soft grainy shadow) and a short way inside it. Drawn once per menu size.
const MENU_SHADE_OUT = 14, MENU_SHADE_IN = 7;
function drawMenuGrain(menu) {
  const cv = menu.el.querySelector('.menu-grain'), ul = menu.list;
  const bw = ul.offsetWidth, bh = ul.offsetHeight, M = MENU_SHADE_OUT;
  const w = bw + M * 2, h = bh + M * 2;
  Object.assign(cv.style, { left: (ul.offsetLeft - M) + 'px', top: (ul.offsetTop - M) + 'px', width: w + 'px', height: h + 'px' });
  if (cv._size === w + 'x' + h) return;
  cv._size = w + 'x' + h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2), g = cv.getContext('2d');
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  g.fillStyle = css('--graphite');
  const tones = [[], [], []];
  for (let y = 0; y < h; y += 0.5) for (let x = 0; x < w; x += 0.5) {
    // distance to the menu's edge: positive outside the box, negative inside
    const dx = Math.max(M - x, x - (M + bw), 0), dy = Math.max(M - y, y - (M + bh), 0);
    const outside = Math.hypot(dx, dy), inside = Math.min(x - M, M + bw - x, y - M, M + bh - y);
    let d;
    if (outside > 0) d = outside < M ? 0.55 * Math.pow(1 - outside / M, 2.2) : 0;
    else d = inside < MENU_SHADE_IN ? 0.4 * Math.pow(1 - inside / MENU_SHADE_IN, 2) : 0.015;   // a little paper grain inside
    if (Math.random() < d * 0.25) tones[d > 0.35 ? 2 : d > 0.12 ? 1 : 0].push(x + Math.random() * 0.5, y + Math.random() * 0.5, 0.22 + 0.22 * Math.random());
  }
  [0.18, 0.32, 0.5].forEach((alpha, t) => {
    const b = tones[t];
    g.globalAlpha = alpha;
    g.beginPath();
    for (let j = 0; j < b.length; j += 3) { g.moveTo(b[j] + b[j + 2], b[j + 1]); g.arc(b[j], b[j + 1], b[j + 2], 0, TAU); }
    g.fill();
  });
  g.globalAlpha = 1;
}
function setMenu(menu, open) {
  menu.list.hidden = !open;
  menu.el.querySelector('.menu-grain').hidden = !open;
  if (open) drawMenuGrain(menu);
  menu.toggle.setAttribute('aria-expanded', String(open));
  if (open) { const first = menu.list.querySelector('button:not([aria-current])'); if (first) first.focus({ preventScroll: true }); }
}
const closeMenus = () => menus.forEach(m => setMenu(m, false));
menus.forEach(m => {
  m.toggle.addEventListener('click', e => { e.stopPropagation(); const open = m.list.hidden; closeMenus(); setMenu(m, open); });
  m.list.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.getAttribute('aria-current') === 'page') return;
    closeMenus();
    const from = current ? PROJECTS.indexOf(current) : -1, to = PROJECTS.findIndex(p => p.id === b.dataset.id);
    goTo(b.dataset.id, to > from ? 'rtl' : 'ltr');    // turn forward or back, depending on where it is
  });
});
document.addEventListener('click', e => { if (!e.target.closest('.menu')) closeMenus(); });
document.addEventListener('keydown', e => {
  const open = menus.find(m => !m.list.hidden);
  if (e.key === 'Escape' && open) { setMenu(open, false); open.toggle.focus(); e.stopImmediatePropagation(); }
}, true);

// Previous / Next appear once you've reached the end of the description
function checkEnd() {
  if (!current) return;
  const sc = projectEl.querySelector('.page.right'), stacked = window.innerWidth <= 900;
  const atEnd = stacked
    ? window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12
    : sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 12;
  if (atEnd) projectEl.querySelector('.turn-page').classList.add('ready');
}
projectEl.querySelector('.page.right').addEventListener('scroll', checkEnd, { passive: true });
window.addEventListener('scroll', checkEnd, { passive: true });

// the contents page, built from PROJECTS
function buildContents() {
  const lists = { Works: $('#toc-works-list'), Creatives: $('#toc-creatives-list'), About: $('#toc-about-list') };
  PROJECTS.forEach(p => {
    const b = el('button', 'toc-entry ink-text');
    b.type = 'button'; b.dataset.open = p.id;
    b.append(el('span', 'no', p.no), el('span', 't', p.title), el('span', 'leader', '. '.repeat(160)), el('span', 'meta', p.group === 'About' ? '' : p.type));
    const li = el('li'); li.append(b);
    lists[p.group].append(li);
  });
}

// A panel that is only a picture (or a side-by-side pair): in the popup it belongs to the section above it.
const isPlate = b => !!(b.fig || b.figs) && !b.h && !b.lede;
const mediaItem = g => ({ src: g.src, alt: g.alt || g.fig || '', cap: g.cap != null ? g.cap : (g.fig || '') });   // cap: '' means no caption
// the pictures or website a section carries itself (its own img / src / embed; for the lede, the piece's cover and embed)
function ownMedia(b) {
  const out = [], src = b.img || b.src;
  if (b.embed) out.push({ embed: b.embed, cap: b.h || '' });              // a live site takes the place of the section's picture
  else if (src) out.push({ src, alt: b.alt || b.h || '', cap: b.h || '' });
  return out;
}
// Each section's popup: its own media, then every picture panel that follows it up to the next section.
// Returns a Map from section to { items: [...] } (or null when the section has nothing to show).
function mediaGroups(blocks) {
  const map = new Map(); let cur = null;
  blocks.forEach(b => {
    if (isPlate(b)) {
      if (!cur) return;
      if (b.figs) { const row = b.figs.filter(g => g.src).map(mediaItem); if (row.length) cur.items.push(row.length > 1 ? { row } : row[0]); }
      else if (b.src) cur.items.push(mediaItem(b));
      return;
    }
    cur = { items: ownMedia(b) };
    map.set(b, cur);
  });
  map.forEach((g, b) => { if (!g.items.length) map.set(b, null); });
  return map;
}
// narrow screens (the pages stack, so the left page is out of sight): pictures stay in the description
function inlineMedia(b, panel) {
  ownMedia(panel).forEach(it => {
    if (it.embed) {
      const a = el('a', null, 'Open the site \u2197');
      a.href = it.embed; a.target = '_blank'; a.rel = 'noopener noreferrer';
      b.append(el('p', null)); b.lastChild.append(a);
    } else {
      const f = el('figure'), im = el('img', 'plate-img');
      im.src = it.src; im.alt = it.alt; f.append(im, el('figcaption', null, it.cap));
      b.append(f);
    }
  });
}

// a block of description: a section with a heading, or (on narrow screens) an image
function blockFor(panel, inline) {
  const b = el('div', 'block');
  b.tabIndex = 0;                                           // a section can be focused, which brings its picture up
  if (panel.lede) { b.append(el('p', 'lede', panel.lede)); if (inline) inlineMedia(b, panel); return b; }
  if (panel.figs) {                                      // two or more images side by side: { figs: [{ fig, cap, src, alt }, ...] }
    const row = el('div', 'fig-row' + (panel.figs.length > 2 ? ' many' : ''));
    panel.figs.forEach(g => {
      const f = el('figure');
      if (g.src) { const im = el('img', 'plate-img'); im.src = g.src; im.alt = g.alt || g.fig; f.append(im); }
      else f.append(el('div', 'plate', g.fig));
      if (g.cap) f.append(el('figcaption', null, g.cap));
      row.append(f);
    });
    b.append(row);
    return b;
  }
  if (panel.fig) {
    const f = el('figure');
    if (panel.src) { const im = el('img', 'plate-img'); im.src = panel.src; im.alt = panel.alt || panel.fig; f.append(im); }
    else f.append(el('div', 'plate', panel.fig));
    f.append(el('figcaption', null, panel.cap || ''));
    b.append(f);
    return b;
  }
  b.append(el('h3', 'grain-full', panel.h));             // section headings carry the title page's dotted grain
  if (panel.facts) {                                     // labelled rows: [['Team', '...'], ['Role', '...']]
    const dl = el('dl', 'spec');
    panel.facts.forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
    b.append(dl);
  }
  const paras = panel.p || [];
  let k = 0;
  const facts = el('div', 'facts');
  while (k < paras.length && paras[k].length < 70 && !/[.!?]$/.test(paras[k])) facts.append(el('p', null, paras[k++]));
  if (facts.childNodes.length) b.append(facts);
  for (; k < paras.length; k++) b.append(el('p', null, paras[k]));
  if (panel.list) {                                      // bullets: ['first', 'second']
    const ul = el('ul', 'bullets');
    panel.list.forEach(s => ul.append(el('li', null, s)));
    b.append(ul);
  }
  if (inline) inlineMedia(b, panel);
  return b;
}
let builtPopup = true;                                   // which layout the description was last built for
function fillProject(p) {
  const i = PROJECTS.indexOf(p), d = DETAILS[p.id] || {};
  $('#p-title').textContent = p.title;
  $('#p-sub').textContent = '(' + p.type + ')';
  $('#p-no').textContent = p.group === 'Works' ? p.no : p.group === 'Creatives' ? 'Creatives, ' + p.no : '';
  $('#s-title').textContent = p.title + '.';
  $('#s-sub').textContent = '(' + p.type + '.)';
  $('#s-folio').textContent = String(3 + i);
  // the description, spread through the four gaps between the lines of music
  const panels = d.panels || (p.group === 'Creatives' ? CREATIVE_PANELS : WORK_PANELS);
  // open with the write-up's lede, unless it repeats a paragraph below; then use the one-line summary instead
  const repeats = d.lede && panels.some(pn => (pn.p || []).includes(d.lede));
  const blocks = [{ lede: d.lede && !repeats ? d.lede : p.summary, img: d.cover || null, embed: d.embed || null, h: p.title }, ...panels];
  const popup = builtPopup = popupMode();
  const groups = popup ? mediaGroups(blocks) : null;
  // with the popup, picture panels leave the description: they appear on the left page with the section above them
  const shown = popup ? blocks.filter(b => !isPlate(b)) : blocks;
  const slots = [...projectEl.querySelectorAll('.slot')];
  slots.forEach(sl => sl.replaceChildren());
  shown.forEach((b, k) => {
    const node = blockFor(b, !popup);
    node._group = groups ? groups.get(b) || null : null;
    slots[Math.min(slots.length - 1, Math.floor(k * slots.length / shown.length))].append(node);
  });
  resetPopup();
  projectEl.querySelector('[data-go="prev"]').hidden = i <= 0;
  projectEl.querySelector('[data-go="next"]').hidden = i >= PROJECTS.length - 1;
  $('#next-title').textContent = i < PROJECTS.length - 1 ? PROJECTS[i + 1].title : '';
  // the Works menus mark the piece you're on
  document.querySelectorAll('.works-menu button').forEach(b => {
    if (b.dataset.id === p.id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}

// ---------- the picture popup ----------
// A project's title page has no picture frame. When the description is scrolled to a section that has pictures
// (or a website), they slide up the left page from a line above its foot while the title block dissolves away in
// grain; scroll on to a section with none and they slide back down and the title returns.
// The motion borrows the page turn's timing and curves (TURN_SECONDS, the same ease in and out and the same
// extra-smooth soft front), and the dissolve is per-pixel grain, so it reads as part of the same family.
// index.html should contain the popup's elements; if it is an older copy without them, build them here so the page still loads
{
  const left = $('#project .page.left'), oldFrame = $('#project .frame');
  if (oldFrame) oldFrame.remove();
  if (!$('#project .popup-stage')) {
    const st = el('div', 'popup-stage');
    st.hidden = true; st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'Project visuals');
    st.append(el('div', 'popup'), el('canvas', 'pop-grain'));
    left.append(st);
  }
  if (!$('#project .title-grain')) $('#project .page.left .title-page').append(el('canvas', 'title-grain'));
}
// The right page's shading used to be a canvas as tall as the whole description, which some browsers can't draw
// (nothing appears). It now sits at the top of the scrolling page and stays put, one screen tall.
{ const rs = $('#project .right-inner > canvas.shade'); if (rs) $('#project .page.right').prepend(rs); }
const popStage = $('#project .popup-stage'), popCard = popStage.querySelector('.popup');
const titleHead = $('#project .page.left .title-page');
const popupMode = () => window.innerWidth > 900;        // on stacked pages the left page scrolls away, so pictures stay inline
const POP_SOFT = 0.7;          // width of the soft grain front as a share of the popup's height (wider = more diffused)
const POP_GRAIN = 0.12;        // how sharp each speck is (smaller = crisper, more like a hard dissolve)
const POP_RES = 0.75;          // grain canvas pixels per screen pixel (higher = finer grain, more work per frame)
const POP_TITLE_END = 0.62;    // the title is fully gone once the popup is this far up
const POP_MIN_SCROLL = 40;     // the popup stays away until the description has been scrolled this far
const popEaseIn = t => 1 - Math.pow(1 - t, 2.2), popEaseOut = t => Math.pow(t, 1.8);   // as in the page turn

function grainLayer(canvas) {                           // a canvas of paper-white specks, each with a fixed random threshold
  const L = { canvas, g: canvas.getContext('2d'), w: 0, h: 0, thr: null, img: null, buf: null };
  L.size = () => {
    const w = Math.round(canvas.clientWidth * POP_RES), h = Math.round(canvas.clientHeight * POP_RES);
    if (!w || !h) return !!L.buf;                       // not on screen right now
    if (w === L.w && h === L.h) return true;
    L.w = w; L.h = h; canvas.width = w; canvas.height = h;
    L.img = L.g.createImageData(w, h);
    L.buf = new Uint32Array(L.img.data.buffer);
    L.thr = new Float32Array(w * h);
    for (let i = 0; i < L.thr.length; i++) L.thr[i] = Math.random();
    return true;
  };
  return L;
}
const stageLayer = grainLayer(popStage.querySelector('.pop-grain'));
const titleLayer = grainLayer(titleHead.querySelector('.title-grain'));
const smooth5 = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * v * (v * (v * 6 - 15) + 10);   // the page turn's extra-smooth ramp

// The popup is a card that slides up (p: 0 hidden, 1 in place). White grain covers the part of it that has come
// into view and thins out from the bottom up, so its leading edge dissolves into the page. `swap` (0 to 1) covers
// the whole card in grain while one set of pictures is exchanged for another.
function drawStage(p, swap) {
  const L = stageLayer;
  if (!L.size()) return;
  const { w, h, thr, buf } = L, front = p * (1 + POP_SOFT), K = 1 + POP_GRAIN;
  for (let y = 0, i = 0; y < h; y++) {
    const dist = 1 - (y + 0.5) / h;                     // 0 at the foot of the popup, 1 at its top
    if (dist > p) { buf.fill(0, i, i + w); i += w; continue; }   // above the card's leading edge: nothing there yet
    const v = smooth5((front - dist) / POP_SOFT);
    for (let x = 0; x < w; x++, i++) {
      let cover = 1 - (v * K - thr[i]) / POP_GRAIN;
      if (swap > 0) { const c2 = (swap * K - thr[i]) / POP_GRAIN; if (c2 > cover) cover = c2; }
      buf[i] = cover <= 0 ? 0 : cover >= 1 ? 0xFFFFFFFF : (((cover * 255) | 0) << 24) | 0xFFFFFF;
    }
  }
  L.g.putImageData(L.img, 0, 0);
}
// the title block: grain gathers over it as the popup rises (a little sooner at the bottom, where the picture comes from)
function drawTitle(p) {
  const L = titleLayer;
  if (!L.size()) return;
  const { w, h, thr, buf } = L, K = 1 + POP_GRAIN, v = smooth5(p / POP_TITLE_END);
  for (let y = 0, i = 0; y < h; y++) {
    const bias = 0.2 * (1 - (y + 0.5) / h);
    for (let x = 0; x < w; x++, i++) {
      const cover = (v * K - (thr[i] * 0.8 + bias)) / POP_GRAIN;
      buf[i] = cover <= 0 ? 0 : cover >= 1 ? 0xFFFFFFFF : (((cover * 255) | 0) << 24) | 0xFFFFFF;
    }
  }
  L.g.putImageData(L.img, 0, 0);
}

let popShown = null, popTarget = null, popP = 0, popSwap = 0, popAnim = null, popBusy = false, popTok = 0;
let popEntries = [];                                    // what the popup holds: [{ figs: [figure, ...], grid: bool, rowEl }]
function popApply(p, swap) {                            // one frame of the transition
  popP = p; popSwap = swap;
  popCard.style.setProperty('--p', p.toFixed(4));
  drawStage(p, swap); drawTitle(p);
}
function popTween(seconds, step, done) {                // step(t) for t from 0 to 1; instant when motion is reduced
  cancelAnimationFrame(popAnim);
  const start = performance.now(), dur = reduceMotion ? 0 : seconds * 1000;
  const frame = now => {
    const t = dur ? clamp((now - start) / dur, 0, 1) : 1;
    step(t);
    if (t < 1) popAnim = requestAnimationFrame(frame); else { popAnim = null; if (done) done(); }
  };
  popAnim = requestAnimationFrame(frame);
}

// One picture (or website) with its caption. layoutPopup sizes it once the picture's proportions are known.
function popFigure(it) {
  const f = el('figure', 'pop-fig');
  if (it.embed) {
    const fr = el('iframe');
    fr.title = 'Embedded project website'; fr.loading = 'lazy'; fr.referrerPolicy = 'no-referrer';
    fr.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
    fr.src = it.embed;
    f.append(fr); f._media = fr; f._aspect = 1.6;       // a website has no proportions of its own
  } else {
    const im = el('img'); im.decoding = 'async'; im.src = it.src; im.alt = it.alt;
    f.append(im); f._media = f._img = im;
  }
  f._hasCap = !!(it.cap || it.embed);
  if (f._hasCap) {
    const cap = el('figcaption', null, it.cap);
    if (it.embed) {                                     // some sites refuse to be embedded, so always offer the link
      const a = el('a', null, 'Open the site \u2197');
      a.href = it.embed; a.target = '_blank'; a.rel = 'noopener noreferrer';
      cap.append(it.cap ? ' \u00b7 ' : '', a);
    }
    f.append(cap);
  }
  return f;
}
// Make the figures (kept off the page for now) and wait, briefly, for the pictures to load: their proportions decide the layout.
function buildPopup(g) {
  popEntries = g.items.map(it => ({ figs: (it.row || [it]).map(popFigure), grid: !!it.row && it.row.length > 3, rowEl: null }));
  const imgs = popEntries.flatMap(e => e.figs).map(f => f._img).filter(Boolean);
  const loaded = Promise.all(imgs.map(im => im.decode ? im.decode().catch(() => {}) : new Promise(r => { im.onload = im.onerror = r; })));
  return Promise.race([loaded, new Promise(r => setTimeout(r, 2500))]);
}

// Lay the pictures out so that nothing is left over around them: every row of pictures has one height (so pictures of
// different sizes line up), each picture keeps its own proportions, and the rows fill the popup's width, or its height
// if the pictures are tall, with no frame, background or letterboxing. A set of many photos is split into however
// many rows makes the photos largest.
const POP_GAP = 8;             // px between pictures and between rows
const POP_CAPH = 34;           // px reserved under a row for captions (two lines)
const POP_PAD = 14;            // the popup's padding (keep in step with the CSS)
function popPartition(figs, k) {                        // k rows of about equal total width, keeping the photos in order
  const asp = f => f._aspect || 1.5, total = figs.reduce((a, f) => a + asp(f), 0), target = total / k, rows = [];
  let cum = 0;
  figs.forEach(f => { const i = Math.min(k - 1, Math.floor((cum + asp(f) / 2) / target)); (rows[i] = rows[i] || []).push(f); cum += asp(f); });
  return rows.filter(Boolean);
}
function layoutPopup() {
  if (!popEntries.length) return;
  const W = popCard.clientWidth - POP_PAD * 2, H = popCard.clientHeight - POP_PAD * 2;
  if (W < 40 || H < 40) return;
  popEntries.forEach(e => e.figs.forEach(f => { if (f._img && f._img.naturalWidth) f._aspect = f._img.naturalWidth / f._img.naturalHeight; }));
  const asp = f => f._aspect || 1.5;
  const build = gridRows => popEntries.flatMap(e => e.grid ? gridRows.map(figs => ({ figs, grid: true })) : [{ figs: e.figs, grid: false, entry: e }]);
  const measure = rows => {
    const ideal = rows.map(r => (W - POP_GAP * (r.figs.length - 1)) / r.figs.reduce((a, f) => a + asp(f), 0));   // height if the row fills the width
    const fixed = POP_GAP * (rows.length - 1) + rows.filter(r => r.figs.some(f => f._hasCap)).length * POP_CAPH;
    const s = Math.max(0.05, Math.min(1, (H - fixed) / ideal.reduce((a, h) => a + h, 0)));                       // shrink to fit the height
    let area = 0;
    rows.forEach((r, i) => r.figs.forEach(f => { area += asp(f) * ideal[i] * ideal[i] * s * s; }));
    return { rows, ideal, s, area };
  };
  const gridEntry = popEntries.find(e => e.grid);
  let best = null;
  if (gridEntry) {
    for (let n = 1; n <= Math.min(gridEntry.figs.length, 8); n++) {
      const m = measure(build(popPartition(gridEntry.figs, n)));
      if (!best || m.area > best.area) best = m;
    }
  } else best = measure(build([]));
  // each picture's own row stays in place (so a website isn't reloaded); a set of many photos gets new rows
  const els = best.rows.map(r => {
    let row = r.entry ? r.entry.rowEl : null;
    if (!row) {
      row = el('div', r.grid ? 'pop-row grid' : 'pop-row');
      r.figs.forEach(f => row.append(f));
      if (r.entry) r.entry.rowEl = row;
    }
    return row;
  });
  if (!(els.length === popCard.children.length && els.every((e, i) => e === popCard.children[i]))) popCard.replaceChildren(...els);
  const gridRows = best.rows.filter(r => r.grid);
  best.rows.forEach((r, i) => {
    const h = best.ideal[i] * best.s, gi = gridRows.indexOf(r);
    els[i].style.height = (h + (r.figs.some(f => f._hasCap) ? POP_CAPH : 0)) + 'px';
    r.figs.forEach((f, j) => {
      f.style.width = (asp(f) * h) + 'px';
      f._media.style.height = h + 'px';
      if (r.grid) f.style.transformOrigin = (j === 0 ? 'left' : j === r.figs.length - 1 ? 'right' : 'center') + ' ' + (gi === 0 ? 'top' : gi === gridRows.length - 1 ? 'bottom' : 'center');   // enlarges from its own corner
    });
  });
}

function resetPopup() {                                 // a new piece opens with the title showing and no popup
  cancelAnimationFrame(popAnim); popAnim = null; popBusy = false; popTok++;
  popShown = popTarget = null; popP = popSwap = 0; popEntries = [];
  popStage.hidden = true; popCard.replaceChildren();
  titleHead.style.visibility = '';
  [stageLayer, titleLayer].forEach(L => L.g.clearRect(0, 0, L.canvas.width, L.canvas.height));
}
function pumpPop() {
  if (popBusy || popShown === popTarget) return;
  popBusy = true;
  const tok = ++popTok, g = popTarget;
  const next = () => { popBusy = false; pumpPop(); };
  if (!popShown) {                                      // slide the pictures up, the title dissolving away
    popStage.hidden = false;
    popApply(0, 0);
    buildPopup(g).then(() => {
      if (tok !== popTok) return;                       // another piece was opened while the pictures loaded
      layoutPopup(); popShown = g;
      popTween(TURN_SECONDS, t => popApply(popEaseIn(t), 0), () => { titleHead.style.visibility = 'hidden'; next(); });
    });
  } else if (!g) {                                      // slide them away, the title coming back
    titleHead.style.visibility = '';
    popTween(TURN_SECONDS, t => popApply(1 - popEaseOut(t), 0), () => {
      popShown = null; popStage.hidden = true; popCard.replaceChildren(); popEntries = []; popApply(0, 0); next();
    });
  } else {                                              // another section's pictures: dissolve one set into the other
    popTween(TURN_SECONDS * 0.45, t => popApply(1, popEaseIn(t)), () => {
      buildPopup(g).then(() => {
        if (tok !== popTok) return;
        layoutPopup(); popShown = g;
        popTween(TURN_SECONDS * 0.45, t => popApply(1, 1 - popEaseOut(t)), next);
      });
    });
  }
}
function setPopup(group) { popTarget = group; pumpPop(); }
function sizePopup() {                                  // after a layout: make the grain canvases and the pictures match their boxes
  if (!popupMode()) return;
  stageLayer.size(); titleLayer.size();
  if (popShown) { layoutPopup(); drawStage(popP, popSwap); drawTitle(popP); }
}

// The description snaps block by block (see the CSS): each time a section settles at the top of the page, the left
// page shows that section's pictures. A section with none keeps the pictures of the one before it, so the left page
// changes only when there is something new to show. Back at the very top, the title returns.
const SNAP_SETTLE = 90;        // ms after the last scroll before the left page follows (so a fast flick doesn't flicker)
let followTimer = 0;
function followScroll() {
  followTimer = 0;
  if (!current) return;
  const sc = projectEl.querySelector('.page.right');
  const blocks = [...projectEl.querySelectorAll('.slot .block')];
  blocks.forEach(b => b.classList.remove('active'));
  if (!popupMode() || !blocks.length) return;
  if (sc.scrollTop < POP_MIN_SCROLL) { setPopup(null); return; }          // the opening: just the title
  const pad = parseFloat(getComputedStyle(sc).scrollPaddingTop) || window.innerHeight * 0.07;
  const line = sc.getBoundingClientRect().top + pad + 24;                         // where a block settles when it snaps
  let at = 0;
  blocks.forEach((b, k) => { if (b.getBoundingClientRect().top <= line) at = k; });
  blocks[at].classList.add('active');                                             // the soft haze marks the block you're on
  let owner = null;
  for (let k = at; k >= 0 && !owner; k--) if (blocks[k]._group) owner = blocks[k];
  setPopup(owner ? owner._group : null);                                          // this block's pictures, or the ones before it
}
function queueFollow(delay = SNAP_SETTLE) { clearTimeout(followTimer); followTimer = setTimeout(followScroll, delay); }
{
  const sc = projectEl.querySelector('.page.right');
  sc.addEventListener('scroll', () => queueFollow(), { passive: true });
  sc.addEventListener('scrollend', () => queueFollow(0));
}

const PROJECT_TEXT = '#project h1, #project .paren, #project .opus, #project .call-number > a, #project .works-toggle, ' +
                     '#project .turn-page a:not([hidden]), ' +
                     '#project .sheet-head > *, #project .tempo, #project #play, #project .slot h3, #project .slot p, #project .slot dt, #project .slot dd, #project .slot li, ' +
                     '#project .slot figcaption, #project .slot .plate, #project .page-foot > span';
let projectText = [], current = null, lastTrigger = null, pendingGo = null;
function updatePositions() {
  surfaces.forEach(s => { const r = s.canvas.getBoundingClientRect(); s.px = r.left + window.scrollX; s.py = r.top + window.scrollY; });
}
let scoresWidth = 0;
function layoutProject() {
  if (current && builtPopup !== popupMode()) { fillProject(current); }   // crossed the stacking breakpoint: rebuild the description
  projectText.forEach(removeSurface);
  const w = scoreSurfaces[0].canvas.parentElement.clientWidth;
  if (w !== scoresWidth) { layoutScores(); scoresWidth = w; }   // same width: the engraved music is reused
  projectText = [...document.querySelectorAll(PROJECT_TEXT)].map(e => inkSurface(e));
  projectText.forEach(layoutText);
  projectShades.forEach(layoutShade);                   // after the text: needs the page's final height
  sizePopup();
  updatePositions();
  queueFollow(0);                                       // show the pictures for wherever the description is scrolled to
}
// Engrave the music ahead of time, while the opening spread is showing, so the first piece opens quickly.
// The project spread is laid out invisibly just long enough to measure and draw the four lines.
function preEngrave() {
  if (current || turning) return;
  const st = projectEl.style;
  st.position = 'fixed'; st.inset = '0'; st.visibility = 'hidden'; st.pointerEvents = 'none';
  projectEl.hidden = false;
  const w = scoreSurfaces[0].canvas.parentElement.clientWidth;
  if (w && w !== scoresWidth) { layoutScores(); scoresWidth = w; }
  projectEl.hidden = true;
  projectEl.removeAttribute('style');
}
function layoutHome() {
  homeText.forEach(s => { s.el.classList.remove('inked'); layoutText(s); });
  homeShades.forEach(layoutShade);
  updatePositions();
}
function showHome() {
  current = null;
  closeMenus();
  document.querySelectorAll('.works-menu button').forEach(b => b.removeAttribute('aria-current'));
  projectEl.hidden = true; homeEl.hidden = false;
  window.scrollTo(0, 0);
  layoutHome();
}
function showProject(id) {
  current = PROJECTS.find(p => p.id === id);
  closeMenus();
  projectEl.querySelector('.turn-page').classList.remove('ready');
  homeEl.hidden = true; projectEl.hidden = false;
  fillProject(current);
  projectEl.querySelector('.page.right').scrollTop = 0;
  window.scrollTo(0, 0);
  layoutProject();
  scoreSurfaces.forEach(s => { s.revealStart = null; });   // the music inks itself in again for each piece
  checkEnd();                                           // a short description that needs no scrolling shows them straight away
}

// The turn: a dark, curved shadow sweeps across the whole screen. While both pages are dark,
// the next spread is swapped in underneath, then the shadow passes off the other side.
// 'rtl' (right to left) turns forward; 'ltr' turns back.
function goTo(target, dir) {
  if (turning) { pendingGo = [target, dir]; return; }
  if (audio.playing) togglePlay();
  turning = true;
  turnEl.classList.add('on'); grainEl.classList.add('on');
  animateTurn('in', dir, () => {
    if (target === 'home') showHome(); else showProject(target);
    animateTurn('out', dir, () => {
      turning = false;
      turnEl.classList.remove('on'); grainEl.classList.remove('on');
      if (pendingGo) { const [t, d] = pendingGo; pendingGo = null; goTo(t, d); return; }
      if (target === 'home') { if (lastTrigger) lastTrigger.focus({ preventScroll: true }); }
      else { const c = projectEl.querySelector('[data-go="contents"]'); if (c) c.focus({ preventScroll: true }); }
    });
  });
}
document.addEventListener('click', e => {
  const open = e.target.closest('[data-open]');
  if (open) {
    e.preventDefault();
    if (current && current.id === open.dataset.open) return;   // already on that page
    lastTrigger = open;
    const from = current ? PROJECTS.indexOf(current) : -1, to = PROJECTS.findIndex(p => p.id === open.dataset.open);
    goTo(open.dataset.open, to > from ? 'rtl' : 'ltr');
    return;
  }
  const go = e.target.closest('[data-go]');
  if (go && go.dataset.go === 'contents' && !current) {  // already home: back to the top of the contents
    e.preventDefault();
    const behavior = reduceMotion ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
    homeEl.querySelector('.page.right').scrollTo({ top: 0, behavior });
    return;
  }
  if (go && current) {
    e.preventDefault();
    const i = PROJECTS.indexOf(current);
    if (go.dataset.go === 'contents') goTo('home', 'ltr');
    else if (go.dataset.go === 'prev' && i > 0) goTo(PROJECTS[i - 1].id, 'ltr');
    else if (go.dataset.go === 'next' && i < PROJECTS.length - 1) goTo(PROJECTS[i + 1].id, 'rtl');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && current) goTo('home', 'ltr'); });
// "Selected Works" returns to the start of the contents
$('.home').addEventListener('click', e => {
  e.preventDefault();
  if (current) { goTo('home', 'ltr'); return; }
  const behavior = reduceMotion ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
  homeEl.querySelector('.page.right').scrollTo({ top: 0, behavior });
});
// ======================================================================
// THE SCORE
// Each bar has a treble staff (t) and a bass staff (b); each staff holds one or two voices.
// Tokens are pitch:length. Pitch: letter, b (flat) / # (sharp) / n (natural), octave (middle C = C4).
// r = rest, R = hidden rest. Length: w h q e s t, plus . for dotted and 3 for triplet.
// Notes from Craig Stuart Sapp's digital edition of the Beethoven piano sonatas.
// ======================================================================
const KEY_FLATS = ['B', 'E', 'A', 'D'];                  // A-flat major
const KEY_POS = { t: [4, 7, 3, 6], b: [2, 5, 1, 4] };    // where the flats sit on each staff
const BEATS_PER_BAR = 2, TIME_SIG = ['2', '4'];
const SCORE = [
  { t: ["C4:q Bb3:q"], b: ["Ab3:s Eb3:s Ab3:s Eb3:s G3:s Eb3:s G3:s Eb3:s", "Ab2:q Db3:q"] },
  { t: ["Eb4:q. Db4:e"], b: ["Ab3:s Eb3:s Ab3:s Eb3:s Bb3:s Eb3:s Bb3:s Eb3:s", "C3:q G2:q"] },
  { t: ["C4:e Eb4:e Ab4:e Bb4:e"], b: ["Ab3:s Eb3:s Bb3:s Eb3:s C4:s Ab3:s Dn4:s Ab3:s", "Ab2:e G2:e F2:e F3:e"] },
  { t: ["Eb4:q. En4:e"], b: ["G3:s Bb3:s G3:s Bb3:s G3:s Bb3:s G3:s Bb3:s", "Eb3:q Eb2:q"] },
  { t: ["F4:q Bb3:e. C4:t Db4:t"], b: ["G3:s Bb3:s G3:s Bb3:s G3:s Eb3:s G3:s Eb3:s", "Db2:q Db3:q"] },
  { t: ["Eb4:q An3:q"], b: ["Ab3:s Eb3:s Ab3:s Eb3:s Eb3:s C3:s Eb3:s C3:s", "C3:q F2:q"] },
  { t: ["Db4:q C4:s Bb3:s Ab3:s G3:s"], b: ["F3:s Db3:s F3:s Db3:s Db3:s Db3:s Db3:s Db3:s", "Bb1:q Eb2:q"] },
  { t: ["Bb3:q Ab3:s3 Eb3:s3 Ab3:s3 C4:s3 Eb4:s3 Ab4:s3"], b: ["Db3:s Eb3:s Db3:s Eb3:s R:q", "Ab1:e Ab2:e Ab1:e r:e"] },
  { t: ["C5:q Bb4:q", "C4:s Eb4:s C4:s Eb4:s Bb3:s Eb4:s Bb3:s Eb4:s"], b: ["Ab3:s Eb3:s Ab3:s Eb3:s G3:s Eb3:s G3:s Eb3:s", "Ab2:q Db3:q"] },
  { t: ["Eb5:q. Db5:e", "Eb4:s Ab4:s Eb4:s Ab4:s Eb4:s Bb4:s Eb4:s Bb4:s"], b: ["Ab3:s Eb3:s Ab3:s Eb3:s G3:s Eb3:s G3:s Eb3:s", "C3:q G2:q"] },
  { t: ["C5:e Eb5:e Ab5:e Bb5:e", "Eb4:s Ab4:s Eb4:s Bb4:s Ab4:s C5:s Ab4:s Dn5:s"], b: ["Ab3:s Eb3:s G3:s Eb3:s F3:s Ab2:s F3:s Ab2:s", "Ab2:e G2:e F2:e F2:e"] },
  { t: ["Eb5:q. En5:e", "G4:s Bb4:s G4:s Bb4:s G4:s Bb4:s G4:s Bb4:s"], b: ["Eb2:s G2:s Bb2:s Eb3:s G3:s Bb3:s G3:s Bb3:s"] },
  { t: ["F5:q Bb4:e. C5:t Db5:t", "G4:s Bb4:s G4:s Bb4:s G4:s Eb4:s G4:s Eb4:s"], b: ["Db2:s G2:s Bb2:s Db3:s G3:s Bb3:s G3:s Db3:s"] },
  { t: ["Eb5:q An4:q", "Ab4:s Eb4:s Ab4:s Eb4:s Eb4:s C4:s Eb4:s C4:s"], b: ["C3:s Eb3:s C3:s Eb3:s C3:s F3:s C3:s F3:s", "C3:e C3:e F2:q"] },
  { t: ["Db5:q C5:s Bb4:s Ab4:s G4:s", "F4:s Db4:s F4:s Db4:s Db4:s Db4:s Db4:s Db4:s"], b: ["Db3:s F3:s Db3:s F3:s Bb2:s Eb3:s Bb2:s Eb3:s", "Bb2:q Eb2:q"] },
  { t: ["Bb4:q Ab4:e r:e", "Db4:s Eb4:s Db4:s Eb4:s C4:e r:e"], b: ["r:s Eb3:s G3:s Eb3:s Ab3:e r:e", "Ab2:q. r:e"] },
];
// slurs on the melody: [bar, note, bar, note] (bars from 1, notes counted from 0, rests skipped)
const SLURS_A = [[1, 0, 2, 1], [3, 0, 3, 3], [4, 0, 5, 0], [5, 1, 5, 3], [6, 0, 7, 0], [7, 1, 7, 4], [8, 0, 8, 1]];
const SLURS = SLURS_A.concat(SLURS_A.map(([a, i, b, j]) => [a + 8, i, b + 8, j]));   // bars 9-16 repeat the phrasing
const LINES = [[0, 4], [4, 8], [8, 12], [12, 16]];       // the score is shown one line (4 bars) at a time, between sections
const LINE_ENDS = ['single', 'double', 'single', 'repeat']; // how each line ends: bar 8 closes the first page, bar 16 repeats

// ======================================================================
// PARSING
// ======================================================================
const LETTERS = 'CDEFGAB';
const LEN = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25, t: 0.125 };
function lengthOf(code) {
  const m = /^([whqest])(\.?)(3?)$/.exec(code || 'q');
  if (!m) return { beats: 1, dotted: false, triplet: false };
  let beats = LEN[m[1]];
  if (m[2]) beats *= 1.5;
  if (m[3]) beats *= 2 / 3;
  return { beats, dotted: !!m[2], triplet: !!m[3] };
}
function parseVoice(str) {
  let onset = 0;
  return str.trim().split(/\s+/).map(tok => {
    const [pitch, len] = tok.split(':');
    const n = { onset, ...lengthOf(len) };
    onset += n.beats;
    if (pitch === 'r' || pitch === 'R') return Object.assign(n, { rest: true, hidden: pitch === 'R' });
    const m = /^([A-G])([#bn]?)(\d)$/.exec(pitch);
    const letter = LETTERS.indexOf(m[1]), octave = +m[3], acc = m[2] === 'n' ? '' : m[2];
    const midi = 12 * (octave + 1) + [0, 2, 4, 5, 7, 9, 11][letter] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
    return Object.assign(n, { letter: m[1], li: letter, octave, acc, freq: 440 * Math.pow(2, (midi - 69) / 12) });
  });
}
const BARS = SCORE.map(b => ({ t: b.t.map(parseVoice), b: b.b.map(parseVoice) }));

// every note becomes a playable event; the melody is louder than the accompaniment
const EVENTS = [];
BARS.forEach((bar, bi) => ['t', 'b'].forEach(st => bar[st].forEach((voice, vi) => voice.forEach(n => {
  if (n.rest) return;
  n.id = EVENTS.length;
  const melody = st === 't' && vi === 0;
  const bass = st === 'b' && bar.b.length > 1 && vi === bar.b.length - 1;
  EVENTS.push({ t: bi * BEATS_PER_BAR + n.onset, beats: n.beats, freq: n.freq, level: melody ? 1 : bass ? 0.6 : 0.38, id: n.id });
}))));
EVENTS.sort((a, b) => a.t - b.t);
const TOTAL_BEATS = BARS.length * BEATS_PER_BAR;

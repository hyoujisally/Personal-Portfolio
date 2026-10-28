// ======================================================================
// SETTINGS
// ======================================================================
const FPS = 12;              // hand-drawn timing: 12 drawings a second
const BOIL = 0.6;            // px of wobble between drawings
const SCORE_REVEAL = 2.6;    // seconds for each line of music to ink itself in
const TEXT_REVEAL = 1.4;     // seconds for a dotted heading to ink in
const RULE_REVEAL = 1.6;     // seconds for a staff divider to ink in
const INK_DENSITY = 1.15;    // dots per square pixel inside solid shapes (clefs, rests, numbers)
const TEXT_DENSITY = 0.88;   // how solid the dotted headings are (1 = nearly solid, 0.6 = airy)
const TEXT_GREY = 0.55;
const INK_PAD_X = 10, INK_PAD_Y = 6;   // room around dotted text for letters that overhang (matches the CSS)
const SMALL_TEXT = 28;       // text smaller than this (px) is kept whole, with only a light grain, so it stays readable
const SMALL_GRAIN = 0.2;     // how much grain shows on small text (0 = none, 0.55 = same as headings)      // headings use less of the grey cloud than the score, so they stay easy to read
const GRAY_AMOUNT = 0.3;     // 0 = all dark ink, 1 = all grey
const DIFFUSE = 0.75;        // blur on the grey dots, in px
const CLOUD_SIZE = 1.4;      // size of the drifting grey patches
const CLOUD_SPEED = 0.6;     // how fast they drift
const INK_GRAIN = 0.3;       // grain inside the ink
const BPM = 40;              // quarter notes per minute
const VOLUME = 0.6;
const ECHO = 0.3;            // room reverb
const BRIGHTNESS = 1;        // 0.7 = mellow, felt-like hammers; 1.3 = bright, concert-hall hammers
const RING = 1;              // how long notes ring: 0.6 = drier, 1.4 = more sustain pedal

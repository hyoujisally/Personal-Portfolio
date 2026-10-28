// ======================================================================
// SOUND (Web Audio, no libraries)
// ======================================================================
const audio = { ctx: null, playing: false, idx: 0, loop: 0, start: 0, timer: null, queue: [] };
function setupAudio() {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const master = ac.createGain(); master.gain.value = VOLUME;
  const tone = ac.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5200;   // takes the edge off, like a lid half open
  const dry = ac.createGain(); dry.gain.value = 1;
  const wet = ac.createGain(); wet.gain.value = ECHO;
  const room = ac.createConvolver();
  const len = Math.floor(ac.sampleRate * 2.8), buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  room.buffer = buf;
  const glue = ac.createDynamicsCompressor();   // keeps overlapping notes from distorting
  glue.threshold.value = -20; glue.ratio.value = 2.5; glue.attack.value = 0.005; glue.release.value = 0.25;
  tone.connect(dry).connect(master);
  tone.connect(room).connect(wet).connect(master);
  master.connect(glue).connect(ac.destination);
  // a short burst of noise, reused for the soft "thump" of the hammer hitting the string
  const nlen = Math.floor(ac.sampleRate * 0.05), noise = ac.createBuffer(1, nlen, ac.sampleRate);
  const nd = noise.getChannelData(0); for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;
  Object.assign(audio, { ctx: ac, input: tone, master, noise });
}

// A grand piano note, built from what makes a real one sound the way it does:
// - overtones at (almost) whole-number multiples of the note. Stiff piano strings stretch them
//   very slightly sharp, which is part of the piano's character (the INHARMONIC value);
// - each overtone fades faster than the one below it, so the note starts bright and mellows;
// - two strings per note, tuned a hair apart, which gives the gentle chorus of a real piano;
// - low notes ring longer than high ones;
// - a soft hammer thump at the start.
const INHARMONIC = 0.0004;
function pianoNote(freq, time, dur, level) {
  const ac = audio.ctx;
  const lowness = clamp(1 - Math.log2(freq / 65) / 5, 0, 1);       // 1 for deep bass, 0 for the top
  const ring = clamp(dur * 2.2, 0.9, 2.2) * (1 + lowness * 0.8) * RING;
  for (let n = 1; n <= 8; n++) {
    const f = freq * n * Math.sqrt(1 + INHARMONIC * n * n);
    if (f > 12000) break;
    const amp = 0.17 * level / Math.pow(n, 1.35 - 0.35 * (BRIGHTNESS - 1)) * (n === 1 ? 1 : 0.9);
    const decay = ring / (1 + 0.55 * (n - 1) / BRIGHTNESS);
    const strings = n <= 2 ? [-0.0007, 0.0007] : [0];               // unison strings on the strongest overtones
    strings.forEach(detune => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f * (1 + detune);
      const a = amp / strings.length;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(a, time + 0.005);         // hammer strike
      g.gain.exponentialRampToValueAtTime(a * 0.35, time + 0.12 + 0.1 * lowness);   // the quick first drop
      g.gain.exponentialRampToValueAtTime(0.0001, time + decay);    // the long ring
      o.connect(g).connect(audio.input);
      o.start(time); o.stop(time + decay + 0.05);
    });
  }
  // hammer thump: a few milliseconds of low, muffled noise
  const thump = ac.createBufferSource(), lp = ac.createBiquadFilter(), tg = ac.createGain();
  thump.buffer = audio.noise;
  lp.type = 'lowpass'; lp.frequency.value = Math.min(freq * 3, 2500);
  tg.gain.setValueAtTime(0.0001, time);
  tg.gain.exponentialRampToValueAtTime(0.05 * level, time + 0.002);
  tg.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
  thump.connect(lp).connect(tg).connect(audio.input);
  thump.start(time); thump.stop(time + 0.05);
}
function scheduler() {                                  // book notes due in the next 0.15 s
  const ac = audio.ctx, beat = 60 / BPM;
  for (;;) {
    const ev = EVENTS[audio.idx];
    const t = audio.start + (ev.t + audio.loop * TOTAL_BEATS) * beat;
    if (t > ac.currentTime + 0.15) break;
    pianoNote(ev.freq, t, ev.beats * beat, ev.level);
    audio.queue.push({ time: t, id: ev.id });
    if (++audio.idx >= EVENTS.length) { audio.idx = 0; audio.loop++; }   // the repeat sign
  }
}
const playBtn = document.getElementById('play');
async function togglePlay() {
  if (!audio.ctx) setupAudio();
  const ac = audio.ctx;
  if (audio.playing) {
    audio.playing = false;
    clearInterval(audio.timer);
    audio.queue = []; started.fill(-1);
    audio.master.gain.setTargetAtTime(0, ac.currentTime, 0.15);
    setTimeout(() => { if (!audio.playing) ac.suspend(); }, 700);
  } else {
    await ac.resume();
    audio.master.gain.cancelScheduledValues(ac.currentTime);
    audio.master.gain.setValueAtTime(VOLUME, ac.currentTime);
    const ev = EVENTS[audio.idx];
    audio.start = ac.currentTime + 0.12 - (ev.t + audio.loop * TOTAL_BEATS) * 60 / BPM;   // continue where it paused
    audio.playing = true;
    audio.timer = setInterval(scheduler, 25);
    scheduler();
  }
  playBtn.setAttribute('aria-pressed', audio.playing);
  playBtn.querySelector('.label').textContent = audio.playing ? 'Pause' : 'Play';
  if (playBtn._ink) { playBtn.classList.remove('inked'); layoutText(playBtn._ink); }
}
playBtn.addEventListener('click', togglePlay);

function updateGlow() {                                 // which notes are sounding, and how recently they started
  glow.fill(0);
  if (!audio.playing) return;
  const now = audio.ctx.currentTime;
  while (audio.queue.length && audio.queue[0].time <= now) { const q = audio.queue.shift(); started[q.id] = q.time; }
  for (let i = 0; i < started.length; i++) {
    if (started[i] < 0) continue;
    const g = 1 - (now - started[i]) / 0.6;
    if (g > 0) glow[i] = g; else started[i] = -1;
  }
}

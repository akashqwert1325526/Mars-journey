/* Audio engine (Web Audio API, generated sounds) */

let soundOn = false;
let audioCtx = null;
let masterGain = null;
let ambientOscs = [];
let hbInterval = null;

const sndBtn = document.getElementById('snd-btn');
const sndViz = document.getElementById('snd-viz');

/* Exposed so other modules can read state */
window.isSoundOn = () => soundOn;

function updateSoundButtonUI() {
  if (!sndBtn) return;

  if (sndViz) sndViz.classList.toggle('on', soundOn);
  sndBtn.classList.toggle('on', soundOn);
  sndBtn.dataset.state = soundOn ? 'on' : 'off';
  sndBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');

  const label = soundOn ? 'MUSIC SOUND ON' : 'MUSIC SOUND OFF';
  if (sndViz) {
    sndBtn.innerHTML = '';
    sndBtn.appendChild(sndViz);
    sndBtn.append(label);
  } else {
    sndBtn.textContent = label;
  }
}

function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundOn = true;
    updateSoundButtonUI();
    return;
  }

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioCtx.destination);
    soundOn = true;
    updateSoundButtonUI();
    playHeartbeat(64);
  } catch (e) {
    soundOn = false;
    updateSoundButtonUI();
  }
}

function stopAll() {
  if (hbInterval) {
    clearInterval(hbInterval);
    hbInterval = null;
  }
  ambientOscs.forEach(({ o }) => {
    try {
      o.stop();
    } catch (e) {}
  });
  ambientOscs = [];
}

function playHeartbeat(bpm = 64) {
  stopAll();
  if (!audioCtx || !masterGain) return;

  const interval = 60000 / bpm;
  const beat = () => {
    const t = audioCtx.currentTime;
    [[0, 0.13, 76], [0.09, 0.08, 60]].forEach(([w, d, f]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + w);
      g.gain.linearRampToValueAtTime(0.22, t + w + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, t + w + d);
      o.connect(g);
      g.connect(masterGain);
      o.start(t + w);
      o.stop(t + w + d + 0.1);
    });
  };

  beat();
  hbInterval = setInterval(beat, interval);
}

function playAmbient() {
  stopAll();
  if (!audioCtx || !masterGain) return;

  ambientOscs = [[55, 0.036, 'sine'], [110, 0.018, 'triangle'], [82, 0.013, 'sine'], [165, 0.008, 'sine']].map(([f, g, t]) => {
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.type = t;
    o.frequency.value = f;
    gn.gain.setValueAtTime(0, audioCtx.currentTime);
    gn.gain.linearRampToValueAtTime(g, audioCtx.currentTime + 2.5);
    o.connect(gn);
    gn.connect(masterGain);
    o.start();
    return { o, g: gn };
  });
}

function playMarsAtm() {
  stopAll();
  if (!audioCtx || !masterGain) return;

  ambientOscs = [[38, 0.046, 'sine'], [92, 0.026, 'triangle'], [145, 0.013, 'sine']].map(([f, g, t]) => {
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.type = t;
    o.frequency.value = f;
    gn.gain.value = g;
    o.connect(gn);
    gn.connect(masterGain);
    o.start();
    return { o, g: gn };
  });
}

function playLaunchRumble() {
  stopAll();
  if (!audioCtx || !masterGain) return;

  const t = audioCtx.currentTime;
  for (let i = 0; i < 6; i++) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(18 + i * 9, t);
    o.frequency.linearRampToValueAtTime(38 + i * 14, t + 3.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.3);
    g.gain.linearRampToValueAtTime(0, t + 3.8);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 4);
  }
}

function playImpact() {
  if (!audioCtx || !masterGain) return;

  const t = audioCtx.currentTime;
  [25, 35, 18].forEach((f) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 2, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.4);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.38, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 1.4);
  });

  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 1.5, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  const src = audioCtx.createBufferSource();
  const ng = audioCtx.createGain();
  const flt = audioCtx.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = 800;
  flt.Q.value = 0.5;
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.3, t + 0.05);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  src.buffer = buf;
  src.connect(flt);
  flt.connect(ng);
  ng.connect(masterGain);
  src.start(t);

  const cr = audioCtx.createOscillator();
  const cg = audioCtx.createGain();
  cr.type = 'sawtooth';
  cr.frequency.setValueAtTime(440, t);
  cr.frequency.exponentialRampToValueAtTime(80, t + 0.3);
  cg.gain.setValueAtTime(0, t);
  cg.gain.linearRampToValueAtTime(0.18, t + 0.01);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  cr.connect(cg);
  cg.connect(masterGain);
  cr.start(t);
  cr.stop(t + 0.45);
}

function playTransformation() {
  stopAll();
  if (!audioCtx || !masterGain) return;

  const t = audioCtx.currentTime;
  [[40, 0.055, 'sine'], [55, 0.038, 'triangle'], [80, 0.022, 'sine'], [110, 0.014, 'sine']].forEach(([f, g, tp], i) => {
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.type = tp;
    o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f * 0.65, t + 14);
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(g, t + 2 + i * 0.5);
    o.connect(gn);
    gn.connect(masterGain);
    o.start(t);
    ambientOscs.push({ o, g: gn });
  });
}

function crossfadeTo(fn) {
  if (!audioCtx || !masterGain) {
    fn();
    return;
  }

  const t = audioCtx.currentTime;
  masterGain.gain.setValueAtTime(masterGain.gain.value, t);
  masterGain.gain.linearRampToValueAtTime(0, t + 0.7);
  setTimeout(() => {
    fn();
    if (audioCtx && masterGain) {
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.2);
    }
  }, 800);
}

function turnSoundOff() {
  if (!audioCtx) return;
  stopAll();
  try {
    audioCtx.suspend();
  } catch (e) {}
  soundOn = false;
  updateSoundButtonUI();
}

function turnSoundOnForCurrentAct() {
  initAudio();
  const fns = [
    () => playHeartbeat(64),
    playAmbient,
    playMarsAtm,
    playMarsAtm,
    playMarsAtm,
    playTransformation,
  ];
  const act = window.getCurrentAct ? window.getCurrentAct() : 0;
  if (fns[act]) crossfadeTo(fns[act]);
}

const MarsAudio = {
  init: initAudio,
  crossfadeTo,
  playHeartbeat,
  playAmbient,
  playMarsAtm,
  playLaunchRumble,
  playImpact,
  playTransformation,
  turnSoundOnForCurrentAct,
  turnSoundOff,
};

window.MarsAudio = MarsAudio;
/* backward compatibility */
window.Audio = MarsAudio;

if (sndBtn) {
  updateSoundButtonUI();
  sndBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (soundOn) {
      turnSoundOff();
    } else {
      turnSoundOnForCurrentAct();
    }
  });
}

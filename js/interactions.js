/* ══════════════════════════════════════
   INTERACTIONS
   - Starfield canvas
   - Cursor
   - Breathing cycle
   - Mars globe tilt
   - Launch button
   - Stabilize button
   - Hotspot discovery
   - Finale / typewriter
══════════════════════════════════════ */
 
/* ── STATE ── */
let launched    = false;
let igniting    = false;
let stabilized  = false;
let stabRunning = false;
let finaleStarted = false;
let distInterval  = null;
let currentDist   = 78_000_000;
let scienceScore  = 24;
let survivalScore = 36;
let humanityScore = 44;
let selectedDecision = null;
let demoModeOn = false;
let demoRunToken = 0;
const scannedHotspots = new Set();
let defenseActive = false;
let defenseDone = false;
let meteorSpawnTimer = null;
let meteorEndTimer = null;
let meteorsIntercepted = 0;
let hullHits = 0;
let meteorProfile = 'untested';
let interceptAudioCtx = null;
let endingProfile = {
  title: 'Awaiting Final Evaluation',
  summary: 'Your choices across all six acts will define what kind of Martian you became.',
  tag: 'pending',
};
let victoryStingPlayed = false;
 
/* ── STARFIELD ── */
((() => {
  const c = document.getElementById('stars');
  const ctx = c.getContext('2d');
  let W = c.width = innerWidth, H = c.height = innerHeight, mr = 0;
 
  const stars = Array.from({ length: 400 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + .3,
    base: Math.random() * .65 + .35,
    spd: Math.random() * .0004 + .0001,
    ph: Math.random() * Math.PI * 2,
  }));
 
  const draw = t => {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const o = s.base * (.5 + .5 * Math.sin(t * s.spd * 1000 + s.ph));
      const r = Math.floor(232 + mr * 22);
      const g = Math.floor(224 - mr * 84);
      const b = Math.floor(208 - mr * 136);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
 
  addEventListener('resize', () => { W = c.width = innerWidth; H = c.height = innerHeight; });
 
  /* Expose tint control */
  window.setMR = v => mr = v;
}))();
 
/* ── CURSOR ── */
const cur  = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
 
addEventListener('mousemove', e => {
  cur.style.left  = e.clientX + 'px';
  cur.style.top   = e.clientY + 'px';
  setTimeout(() => {
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  }, 80);
});
 
document.querySelectorAll('button, a, .hs, .d-card, .ex-card').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('big'));
  el.addEventListener('mouseleave', () => cur.classList.remove('big'));
});
 
/* ── MARS GLOBE TILT ── */
const globe = document.getElementById('mars-globe');
if (globe) {
  addEventListener('mousemove', e => {
    const r = globe.getBoundingClientRect();
    if (!r.width) return;
    const cx = (e.clientX - r.left) / r.width  - .5;
    const cy = (e.clientY - r.top)  / r.height - .5;
    globe.style.transform = `scale(1.04) rotateY(${cx * 16}deg) rotateX(${-cy * 16}deg)`;
  });
  globe.addEventListener('mouseleave', () => {
    globe.style.transform = 'scale(1) rotateY(0) rotateX(0)';
  });
}
 
/* ── DISTANCE COUNTER ── */
function startDist() {
  distInterval = setInterval(() => {
    currentDist = Math.min(225_000_000, currentDist + 250_000);
    const pct = (currentDist - 78_000_000) / 147_000_000 * 100;
    document.getElementById('dist-fill').style.width = pct + '%';
    document.getElementById('d-ship').style.left = `calc(${pct * .88 + 6}% - 7px)`;
    document.getElementById('dist-km').textContent = Math.round(currentDist / 1_000_000) + 'M km';
    const sig = Math.round(currentDist / 300_000 / 60);
    document.getElementById('sig-delay').textContent = `⚡ ${sig}min delay`;
    if (currentDist >= 225_000_000) clearInterval(distInterval);
  }, 120);
}
 
/* Exposed so scroll.js can trigger it */
window.startDistIfNeeded = () => {
  if (!distInterval) startDist();
};
 
/* ── LAUNCH BUTTON ── */
document.getElementById('launch-btn').addEventListener('click', function() {
  if (launched || igniting) return;
  Audio.init();
  igniting = true;
  this.disabled = true;
  document.getElementById('launch-lbl').textContent = 'IGNITING…';
  document.getElementById('launch-hint').textContent = 'brace for departure';
  document.getElementById('rocket').classList.add('igniting');
  document.getElementById('ex-flame').style.opacity = '1';
  document.getElementById('ex-glow').style.opacity  = '1';
 
  if (window.isSoundOn()) Audio.playLaunchRumble();
 
  setTimeout(() => { document.body.style.animation = 'shake .08s linear infinite'; }, 1100);
 
  setTimeout(() => {
    const fl = document.getElementById('flash');
    fl.style.background   = 'rgba(240,200,0,.22)';
    fl.style.transition   = 'background .06s';
    setTimeout(() => { fl.style.background = 'transparent'; }, 220);
    document.body.style.animation = 'none';
  }, 1900);
 
  setTimeout(() => {
    launched = true; igniting = false;
    humanityScore = clampScore(humanityScore + 7);
    renderScoreHud();
    document.getElementById('rocket').classList.remove('igniting');
    document.getElementById('rocket').classList.add('launched');
    document.getElementById('launch-lbl').textContent = 'DEPARTED';
    document.getElementById('launch-hint').textContent = 'scroll to continue the journey ↓';
    document.getElementById('launch-hint').style.animation = 'none';
    document.getElementById('launch-hint').style.opacity  = '1';
  }, 2300);
});
 
/* ── STABILIZE BUTTON ── */
document.getElementById('stab-btn').addEventListener('click', function() {
  if (stabilized || stabRunning) return;
  stabRunning = true;
  Audio.init();
  if (window.isSoundOn()) Audio.playImpact();
 
  const fl = document.getElementById('flash');
  fl.style.transition = 'background .04s';
  fl.style.background = 'rgba(220,20,20,.6)';
  setTimeout(() => fl.style.background = 'transparent', 650);
 
  document.body.style.animation = 'shake .05s linear infinite';
  document.body.style.transform = 'scale(1.05)';
  document.body.style.filter = 'contrast(1.5) blur(2px)';
 
  document.getElementById('land-display').textContent = '19,000 KM/H';
  document.getElementById('land-display').style.color = 'var(--amber)';
  document.getElementById('land-sub').textContent     = '⚠ CRITICAL — BRACE FOR IMPACT';
  document.getElementById('land-sub').style.color     = 'var(--amber)';
  document.getElementById('stab-lbl').textContent     = 'STABILIZING…';
  this.disabled = true;
  document.getElementById('stab-hint').style.display  = 'none';
 
  /* Dust particles */
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'dust-p';
    const sz = 4 + Math.random() * 18;
    const x  = 20 + Math.random() * 60;
    const y  = 40 + Math.random() * 40;
    const tx = (Math.random() - .5) * 600;
    const ty = -(60 + Math.random() * 300);
    const dur = .8 + Math.random() * 1.8;
    Object.assign(p.style, {
      left: `${x}%`, bottom: `${y}px`,
      width: sz + 'px', height: sz + 'px',
      background: Math.random() > .5 ? 'rgba(193,68,14,.7)' : 'rgba(212,145,106,.6)',
      transition: `all ${dur}s ease-out`,
      transform: 'translate(0,0) scale(1)',
      opacity: '1',
    });
    document.body.appendChild(p);
    setTimeout(() => { p.style.transform = `translate(${tx}px,${ty}px) scale(.1)`; p.style.opacity = '0'; }, 20);
    setTimeout(() => p.remove(), dur * 1000 + 100);
  }
 
  /* Systems turning green */
  [0,1,2,3,4].forEach((idx, order) => {
    setTimeout(() => {
      document.getElementById('d' + idx).className  = 'sys-dot ok';
      document.getElementById('v' + idx).textContent = 'NOMINAL';
      document.getElementById('v' + idx).style.color = 'var(--green)';
    }, 400 + order * 300);
  });
 
  setTimeout(() => {
    document.body.style.animation = 'none';
    document.body.style.transform = 'scale(1)';
    document.body.style.filter = 'none';
  }, 1500);
 
  setTimeout(() => {
    stabilized = true; stabRunning = false;
    survivalScore = clampScore(survivalScore + 22);
    renderScoreHud();
    document.getElementById('land-display').textContent = 'TOUCHDOWN';
    document.getElementById('land-display').style.color = 'var(--green)';
    document.getElementById('land-sub').textContent = "We're down. We made it.";
    document.getElementById('land-sub').style.color = 'var(--green)';
    document.getElementById('stab-wrap').style.display = 'none';
    const tm = document.getElementById('touch-msg');
    tm.style.display = 'block';
    setTimeout(() => tm.style.opacity = '1', 50);
    if (window.isSoundOn()) Audio.crossfadeTo(Audio.playMarsAtm);
  }, 3200);
});

function updateDefenseHud() {
  const sc = document.getElementById('md-score');
  const hits = document.getElementById('md-hits');
  if (sc) sc.textContent = 'Intercepted ' + meteorsIntercepted;
  if (hits) hits.textContent = 'Hull Hits ' + hullHits;
}

function spawnMeteor() {
  const field = document.getElementById('meteor-field');
  if (!field || !defenseActive) return;
  const m = document.createElement('div');
  m.className = 'meteor';
  const duration = 1100 + Math.random() * 800;
  m.style.left = (5 + Math.random() * 90) + '%';
  m.style.animationDuration = duration + 'ms';

  let resolved = false;
  const playInterceptPulse = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!interceptAudioCtx) interceptAudioCtx = new Ctx();
      const t0 = interceptAudioCtx.currentTime;
      const osc = interceptAudioCtx.createOscillator();
      const gain = interceptAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, t0);
      osc.frequency.exponentialRampToValueAtTime(330, t0 + 0.09);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      osc.connect(gain);
      gain.connect(interceptAudioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.12);
    } catch (_) {}
  };

  const triggerInterceptFx = (evt) => {
    document.body.classList.add('slow-mo');
    setTimeout(() => document.body.classList.remove('slow-mo'), 130);
    playInterceptPulse();
    const rect = field.getBoundingClientRect();
    const cx = evt.clientX || (rect.left + rect.width / 2);
    const cy = evt.clientY || (rect.top + rect.height / 2);
    const pulse = document.createElement('div');
    pulse.className = 'md-pulse';
    pulse.style.left = (cx - rect.left) + 'px';
    pulse.style.top = (cy - rect.top) + 'px';
    field.appendChild(pulse);
    setTimeout(() => pulse.remove(), 240);
  };

  const intercept = (e) => {
    e.preventDefault();
    if (resolved) return;
    resolved = true;
    triggerInterceptFx(e);
    meteorsIntercepted += 1;
    updateDefenseHud();
    m.classList.add('boom');
    setTimeout(() => m.remove(), 180);
  };

  m.addEventListener('click', intercept);
  m.addEventListener('touchstart', intercept, { passive: false });
  field.appendChild(m);

  setTimeout(() => {
    if (resolved || !m.isConnected) return;
    resolved = true;
    hullHits += 1;
    updateDefenseHud();
    m.remove();
    const fl = document.getElementById('flash');
    if (fl) {
      fl.style.background = 'rgba(240,40,20,.26)';
      setTimeout(() => { fl.style.background = 'transparent'; }, 90);
    }
  }, duration + 40);
}

function endMeteorDefense() {
  if (!defenseActive) return;
  defenseActive = false;
  defenseDone = true;
  if (meteorSpawnTimer) clearInterval(meteorSpawnTimer);
  if (meteorEndTimer) clearTimeout(meteorEndTimer);
  meteorSpawnTimer = null;
  meteorEndTimer = null;
  if (window.isSoundOn && window.isSoundOn() && window.Audio && window.Audio.stopDangerLayer) {
    window.Audio.stopDangerLayer();
  }

  const status = document.getElementById('md-status');
  const btn = document.getElementById('start-defense-btn');

  if (meteorsIntercepted >= 10 && hullHits <= 2) {
    survivalScore = clampScore(survivalScore + 18);
    humanityScore = clampScore(humanityScore + 8);
    meteorProfile = 'aegis';
    if (status) status.textContent = 'Aegis Protocol - Perfect';
  } else if (meteorsIntercepted >= 6 && hullHits <= 5) {
    survivalScore = clampScore(survivalScore + 9);
    meteorProfile = 'stable';
    if (status) status.textContent = 'Defense Stable';
  } else {
    survivalScore = clampScore(survivalScore - 10);
    humanityScore = clampScore(humanityScore - 5);
    meteorProfile = 'breach';
    if (status) status.textContent = 'Hull Breach Recorded';
  }
  renderScoreHud();
  if (btn) {
    btn.disabled = true;
    btn.querySelector('span').textContent = 'DEFENSE COMPLETE';
  }
}

const defenseBtn = document.getElementById('start-defense-btn');
if (defenseBtn) {
  defenseBtn.addEventListener('click', () => {
    if (defenseActive || defenseDone) return;
    defenseActive = true;
    meteorsIntercepted = 0;
    hullHits = 0;
    meteorProfile = 'active';
    const status = document.getElementById('md-status');
    const field = document.getElementById('meteor-field');
    if (status) status.textContent = 'Active - 12s';
    if (field) field.innerHTML = '';
    defenseBtn.disabled = true;
    defenseBtn.querySelector('span').textContent = 'DEFENSE RUNNING';
    updateDefenseHud();
    if (window.isSoundOn && window.isSoundOn() && window.Audio && window.Audio.startDangerLayer) {
      window.Audio.startDangerLayer();
    }
    spawnMeteor();
    meteorSpawnTimer = setInterval(spawnMeteor, 420);
    meteorEndTimer = setTimeout(endMeteorDefense, 12000);
  });
}
 
/* ── HOTSPOTS ── */
const DISC = {
  crater: {
    icon: '💥', title: 'Impact Crater', color: '#e8621a',
    text: "Billions of years of bombardment. Every crater is a scar of something that didn't survive the universe's violence. You are standing inside geological grief.",
  },
  ice: {
    icon: '❄️', title: 'Polar Ice Caps', color: '#4fa3e0',
    text: "Frozen water. Frozen CO₂. Mars kept them hidden under red dust for billions of years — patient, waiting for someone desperate enough to come looking.",
  },
  volcano: {
    icon: '🌋', title: 'Olympus Mons', color: '#f0a500',
    text: "Three times the height of Everest. The largest volcano in the solar system. Mars doesn't do anything small. It never did. Neither do you, anymore.",
  },
};
 
function showDisc(key) {
  const d = DISC[key];
  if (!scannedHotspots.has(key)) {
    scannedHotspots.add(key);
    scienceScore = clampScore(scienceScore + 8);
    renderScoreHud();
  }
  document.querySelectorAll('.hs-ring').forEach(r => r.style.boxShadow = 'none');
  const ring = document.querySelector(`#hs-${key} .hs-ring`);
  if (ring) ring.style.boxShadow = `0 0 22px ${d.color}88, 0 0 44px ${d.color}44`;
  document.getElementById('disc-hint').style.display = 'none';
  const t  = document.getElementById('disc-title');
  const tx = document.getElementById('disc-text');
  t.style.display  = 'block';
  tx.style.display = 'block';
  t.textContent  = `${d.icon} ${d.title}`;
  t.style.color  = d.color;
  tx.textContent = d.text;
  document.getElementById('disc-box').style.borderColor = d.color + '55';
}
 
['crater', 'ice', 'volcano'].forEach(key => {
  const el = document.getElementById('hs-' + key);
  if (el) {
    el.addEventListener('click',    e => { e.stopPropagation(); showDisc(key); });
    el.addEventListener('touchend', e => { e.preventDefault();  showDisc(key); });
  }
});
 
/* ── FINALE ── */
let finaleLetter = `I tried to remember what rain smells like today. I couldn't.
 
I don't know if that's grief or evolution.
 
I came to explore Mars. I thought I'd stay exactly who I was — just relocated. I was wrong. The silence did something to me. The distance did something. Looking back at Earth as a pale blue dot, smaller than my thumbnail… it rewired something.
 
I belong to this red silence now.
 
I hope Earth can forgive me for that.`;

function buildEndingProfile() {
  const score = totalMissionScore();
  const finalRank = missionRank(score);
  const bars = {
    human: clampScore(100 - (score * 0.7)),
    martian: clampScore(score + 10),
  };

  let title = 'The Survivor';
  let summary = 'You endured Mars through grit and adaptation. You are changed, but still searching for balance.';
  let q1 = '"Mars did not welcome you...';
  let q2 = 'you earned your place anyway."';
  let tag = 'resilient';

  if (meteorProfile === 'aegis' && score >= 70) {
    title = 'The Shieldbreaker';
    summary = 'You defended the vessel under fire and kept the crew alive. Mars now treats you like a commander, not a visitor.';
    q1 = '"When the sky attacked...';
    q2 = 'you answered with precision."';
    tag = 'aegis';
  } else if (score >= 82 && oxygenLevel >= 65) {
    title = 'The Pathfinder';
    summary = 'You balanced risk, science, and humanity. Your mission becomes a blueprint for future colonies.';
    q1 = '"You crossed a dead world...';
    q2 = 'and taught it how to hope."';
    tag = 'pioneer';
  } else if (scienceScore >= 65) {
    title = 'The Scientist';
    summary = 'Your curiosity transformed danger into discovery. Mars gave up secrets because you kept asking.';
    q1 = '"You came for answers...';
    q2 = 'and left with better questions."';
    tag = 'scientist';
  }

  const outcomeTitle = document.getElementById('ending-title');
  const outcomeSummary = document.getElementById('ending-summary');
  const outcomeStats = document.getElementById('ending-stats');
  if (outcomeTitle) outcomeTitle.textContent = title + ' - Rank: ' + finalRank;
  if (outcomeSummary) outcomeSummary.textContent = summary;
  if (outcomeStats) {
    const decisionLabel = selectedDecision ? selectedDecision.toUpperCase() : 'NONE';
    outcomeStats.textContent = 'score ' + score + ' | science ' + scienceScore + ' | survival ' + survivalScore + ' | humanity ' + humanityScore + ' | decision ' + decisionLabel + ' | defense ' + meteorProfile.toUpperCase() + ' | profile ' + tag;
  }

  const q1El = document.getElementById('q1');
  const q2El = document.getElementById('q2');
  if (q1El) q1El.textContent = q1;
  if (q2El) q2El.textContent = q2;
  endingProfile = { title, summary, tag };
  if (!victoryStingPlayed && (finalRank === 'Commander' || finalRank === 'Legend')) {
    if (window.isSoundOn && window.isSoundOn() && window.Audio && window.Audio.playVictorySting) {
      window.Audio.playVictorySting();
      victoryStingPlayed = true;
    }
  }

  finaleLetter = `Earth Log:

I did not become someone else. I became someone expanded.

Mission score: ${score}. Rank: ${finalRank}.
Primary profile: ${title}. Oxygen reserve at close: ${oxygenLevel}%.

I chose ${selectedDecision || 'instinct'} when night fell.
I discovered ${scannedHotspots.size} key surface sites.

Mars did not make me less human. It made me more intentional.`;

  return bars;
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  words.forEach((w) => {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineHeight;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

function downloadMissionReport() {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#0c0604');
  g.addColorStop(1, '#1b0b05');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(232,98,26,0.2)';
  ctx.fillRect(80, 80, canvas.width - 160, canvas.height - 160);
  ctx.strokeStyle = 'rgba(232,98,26,0.65)';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  const score = totalMissionScore();
  const rank = missionRank(score);

  ctx.fillStyle = '#f0a500';
  ctx.font = '600 28px "Share Tech Mono", monospace';
  ctx.fillText('MISSION REPORT', 130, 150);

  ctx.fillStyle = '#efe8da';
  ctx.font = '700 68px "Bebas Neue", sans-serif';
  ctx.fillText('MARS JOURNEY', 130, 230);

  ctx.fillStyle = '#9acbf2';
  ctx.font = '600 26px "Share Tech Mono", monospace';
  ctx.fillText('Score: ' + score + '    Rank: ' + rank, 130, 285);

  ctx.fillStyle = '#efe8da';
  ctx.font = '700 44px "Bebas Neue", sans-serif';
  ctx.fillText(endingProfile.title, 130, 360);

  ctx.fillStyle = '#d7b8a4';
  ctx.font = '400 30px "Crimson Pro", serif';
  const lastY = wrapCanvasText(ctx, endingProfile.summary, 130, 410, 1140, 44);

  ctx.fillStyle = '#9a9386';
  ctx.font = '600 24px "Share Tech Mono", monospace';
  ctx.fillText('Science: ' + scienceScore + '    Survival: ' + survivalScore + '    Humanity: ' + humanityScore, 130, lastY + 70);
  ctx.fillText('Oxygen: ' + oxygenLevel + '%    Decision: ' + (selectedDecision || 'none').toUpperCase(), 130, lastY + 110);
  ctx.fillText('Hotspots Scanned: ' + scannedHotspots.size + '    Profile: ' + endingProfile.tag.toUpperCase(), 130, lastY + 150);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '500 20px "Share Tech Mono", monospace';
  const now = new Date();
  ctx.fillText('Generated: ' + now.toLocaleString(), 130, canvas.height - 120);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'mars-mission-report.png';
  link.click();
}

function showQuote() {
  document.getElementById('q1').style.opacity = '1';
  setTimeout(() => {
    document.getElementById('q2').style.opacity = '1';
    document.getElementById('q2').classList.add('glow');
  }, 1200);
}
 
function runFinale() {
  finaleStarted = true;
  const bars = buildEndingProfile();
 
  /* Earth fades */
  setTimeout(() => {
    document.getElementById('e-earth').style.opacity = '.04';
    document.getElementById('e-earth').style.filter  = 'grayscale(1) blur(3px)';
  }, 800);
 
  /* Mars rises */
  setTimeout(() => {
    document.getElementById('e-mars').style.opacity = '1';
    document.getElementById('e-mars').style.filter  = 'none';
  }, 2200);
 
  /* Identity bars */
  setTimeout(() => {
    document.getElementById('bar-h').style.width = bars.human + '%';
    document.getElementById('val-h').textContent = bars.human + '%';
    document.getElementById('bar-m').style.width = bars.martian + '%';
    document.getElementById('val-m').textContent = bars.martian + '%';
  }, 1400);
 
  /* Typewriter */
  setTimeout(() => {
    let i = 0;
    const tick = () => {
      if (i < finaleLetter.length) {
        const ch  = finaleLetter[i++];
        const cur = document.getElementById('letter-cursor');
        if (ch === '\n' && cur) cur.insertAdjacentHTML('beforebegin', '<br>');
        else if (cur)           cur.insertAdjacentText('beforebegin', ch);
        setTimeout(tick, 26 + Math.random() * 22);
      } else {
        const cur = document.getElementById('letter-cursor');
        if (cur) cur.remove();
        showQuote();
      }
    };
    tick();
  }, 1000);
 
  /* Red deepening */
  let red = 0;
  const rid = setInterval(() => {
    red = Math.min(1, red + .007);
    document.getElementById('red-wash').style.background = `rgba(160,8,0,${red * .7})`;
    window.setMR(red);
    document.getElementById('scanlines').style.opacity = String(red * .55);
    if (red >= 1) clearInterval(rid);
  }, 65);
}
 
/* Exposed so scroll.js can trigger finale */
window.runFinaleIfNeeded = () => {
  if (!finaleStarted) runFinale();
};
/* MISSION FLOW UPGRADE */
let oxygenLevel = 100;
let landingCountdownStarted = false;
let landingTimerId = null;
let landingSeconds = 7 * 60;

const OXY_COPY = {
  shelter: { delta: -8, text: 'Shelter online. Radiation risk down, but energy use increased.' },
  scan: { delta: -14, text: 'Terrain scan complete. You mapped hazards, but burned extra oxygen.' },
  harvest: { delta: 6, text: 'Ice extraction successful. Oxygen reserves recovered.' },
};

const CHOICE_SCORE_IMPACT = {
  shelter: { science: 0, survival: 0, humanity: 14 },
  scan: { science: 18, survival: 0, humanity: 0 },
  harvest: { science: 0, survival: 16, humanity: 0 },
};

function applyChoiceState(key, sign) {
  const oxy = OXY_COPY[key];
  const score = CHOICE_SCORE_IMPACT[key];
  if (!oxy || !score) return;
  setOxygen(oxygenLevel + (oxy.delta * sign));
  scienceScore = clampScore(scienceScore + (score.science * sign));
  survivalScore = clampScore(survivalScore + (score.survival * sign));
  humanityScore = clampScore(humanityScore + (score.humanity * sign));
}

function clampScore(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function totalMissionScore() {
  return clampScore((scienceScore + survivalScore + humanityScore + oxygenLevel) / 4);
}

function missionRank(score) {
  if (score >= 85) return 'Legend';
  if (score >= 70) return 'Commander';
  if (score >= 55) return 'Specialist';
  return 'Cadet';
}

function renderScoreHud() {
  const score = totalMissionScore();
  const scoreEl = document.getElementById('mh-score');
  const rankEl = document.getElementById('mh-rank');
  if (scoreEl) scoreEl.textContent = String(score);
  if (rankEl) rankEl.textContent = missionRank(score);
  if (window.isSoundOn && window.isSoundOn() && window.Audio && window.Audio.setMusicIntensity) {
    const intensity = 0.8 + (score / 100) * 0.45;
    window.Audio.setMusicIntensity(intensity);
  }
}

function setOxygen(next) {
  oxygenLevel = Math.max(0, Math.min(100, next));
  const oxy = document.getElementById('mh-oxy');
  const status = document.getElementById('mh-status');
  if (oxy) oxy.textContent = oxygenLevel + '%';
  if (status) {
    if (oxygenLevel >= 70) {
      status.textContent = 'Nominal';
      status.style.color = 'var(--green)';
    } else if (oxygenLevel >= 35) {
      status.textContent = 'Watch';
      status.style.color = 'var(--amber)';
    } else {
      status.textContent = 'Critical';
      status.style.color = '#ff5555';
    }
  }
  renderScoreHud();
}

function renderLandingTimer() {
  const el = document.getElementById('landing-timer');
  if (!el) return;
  const mm = String(Math.floor(landingSeconds / 60)).padStart(2, '0');
  const ss = String(landingSeconds % 60).padStart(2, '0');
  el.textContent = mm + ':' + ss;
}

window.startLandingCountdownIfNeeded = () => {
  if (landingCountdownStarted) return;
  landingCountdownStarted = true;
  renderLandingTimer();
  const landSub = document.getElementById('land-sub');

  // Accelerated countdown for demo impact.
  landingTimerId = setInterval(() => {
    if (landingSeconds > 0) landingSeconds -= 1;
    renderLandingTimer();
    if (landingSeconds <= 0) {
      clearInterval(landingTimerId);
      landingTimerId = null;
      const timer = document.getElementById('landing-timer');
      if (timer) {
        timer.textContent = '00:00';
        timer.style.color = '#ff5555';
      }
      if (landSub) {
        landSub.textContent = 'Landing window exceeded. Stabilize immediately.';
        landSub.style.color = '#ff5555';
      }
      survivalScore = clampScore(survivalScore - 12);
      renderScoreHud();
    }
  }, 250);
};

const stabBtnExtra = document.getElementById('stab-btn');
if (stabBtnExtra) {
  stabBtnExtra.addEventListener('click', () => {
    if (landingTimerId) {
      clearInterval(landingTimerId);
      landingTimerId = null;
    }
    const timer = document.getElementById('landing-timer');
    if (timer) {
      timer.textContent = 'SAFE';
      timer.style.color = 'var(--green)';
    }
  });
}

const intro = document.getElementById('mission-intro');
const startMissionBtn = document.getElementById('start-mission-btn');
const demoModeBtn = document.getElementById('demo-mode-btn');

function startMissionFlow() {
  if (!intro) return;
  intro.classList.add('hide');
  document.body.classList.remove('mission-locked');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.Audio && window.isSoundOn && window.isSoundOn()) window.Audio.playLaunchRumble();
}

function clickIfPossible(id) {
  const el = document.getElementById(id);
  if (el && !el.disabled) el.click();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEMO_FOCUS_SELECTORS = {
  act2: '#act2 .act-h',
  act3: '#act3 .act-h',
  act4: '#act4 .act-h',
  act5: '#act5 #choice-panel',
  act6: '#act6 #finale-title',
};

const DEMO_FOCUS_Y = {
  act2: 0.5,
  act3: 0.5,
  act4: 0.5,
  act5: 0.56,
  act6: 0.52,
};

async function demoScrollTo(actId, settleMs = 2600) {
  const section = document.getElementById(actId);
  if (!section) return;

  const focusSel = DEMO_FOCUS_SELECTORS[actId];
  const focusEl = (focusSel && document.querySelector(focusSel)) || section.querySelector('.act-inner') || section;

  const first = focusEl.getBoundingClientRect();
  const firstCenter = window.scrollY + first.top + (first.height / 2);
  const desiredRatio = DEMO_FOCUS_Y[actId] ?? 0.54;
  const desiredY = window.innerHeight * desiredRatio;
  let targetTop = firstCenter - desiredY;
  const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  targetTop = Math.max(0, Math.min(targetTop, maxTop));

  window.scrollTo({ top: targetTop, behavior: 'smooth' });
  await wait(settleMs);

  // Second-pass correction after reveal/animation shifts.
  const second = focusEl.getBoundingClientRect();
  const secondCenterInViewport = second.top + (second.height / 2);
  const correction = secondCenterInViewport - desiredY;
  if (Math.abs(correction) > 20) {
    window.scrollBy({ top: correction, behavior: 'smooth' });
    await wait(850);
  }
}

async function demoScrollToElement(selector, desiredRatio = 0.56, settleMs = 2200) {
  const el = document.querySelector(selector);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const center = window.scrollY + rect.top + (rect.height / 2);
  const desiredY = window.innerHeight * desiredRatio;
  const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  let targetTop = Math.max(0, Math.min(center - desiredY, maxTop));
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
  await wait(settleMs);
}

async function runDemoSequence(token) {
  const keepGoing = () => token === demoRunToken;

  await wait(1200);
  if (!keepGoing()) return;
  clickIfPossible('launch-btn');

  await wait(4200);
  if (!keepGoing()) return;
  await demoScrollTo('act2', 3000);
  if (!keepGoing()) return;

  await demoScrollTo('act3', 3200);
  if (!keepGoing()) return;

  await demoScrollTo('act4', 3400);
  if (!keepGoing()) return;
  clickIfPossible('start-defense-btn');

  // Let the defense mini-game play fully before stabilization.
  await wait(13200);
  if (!keepGoing()) return;
  clickIfPossible('stab-btn');

  await wait(3400);
  if (!keepGoing()) return;
  await demoScrollTo('act5', 3000);
  if (!keepGoing()) return;
  clickIfPossible('hs-crater');
  await wait(1000);
  if (!keepGoing()) return;
  clickIfPossible('hs-ice');
  await wait(1000);
  if (!keepGoing()) return;
  clickIfPossible('hs-volcano');

  await wait(1200);
  if (!keepGoing()) return;
  document.querySelector('[data-choice=\"harvest\"]')?.click();

  await wait(2600);
  if (!keepGoing()) return;
  await demoScrollTo('act6', 3800);
  if (!keepGoing()) return;

  // Continue through Act 6 content so demo does not feel stuck at the title.
  await demoScrollToElement('#act6 #letter-box', 0.58, 3200);
  if (!keepGoing()) return;
  await demoScrollToElement('#act6 #ending-card', 0.58, 3000);
  if (!keepGoing()) return;
  await demoScrollToElement('footer', 0.55, 2600);
}

function startDemoMode() {
  demoModeOn = true;
  startMissionFlow();
  demoRunToken += 1;
  runDemoSequence(demoRunToken);
}

if (intro && startMissionBtn) {
  document.body.classList.add('mission-locked');
  startMissionBtn.addEventListener('click', startMissionFlow);
  if (demoModeBtn) demoModeBtn.addEventListener('click', startDemoMode);
}

document.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (window.isSoundOn && window.isSoundOn() && window.Audio && window.Audio.playUIClick) {
      window.Audio.playUIClick();
    }
  });
});

const downloadReportBtn = document.getElementById('download-report-btn');
if (downloadReportBtn) {
  downloadReportBtn.addEventListener('click', downloadMissionReport);
}

document.querySelectorAll('.choice-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.choice;
    const cfg = OXY_COPY[key];
    if (!cfg) return;
    if (selectedDecision === key) return;

    if (selectedDecision) applyChoiceState(selectedDecision, -1);
    selectedDecision = key;
    applyChoiceState(selectedDecision, 1);
    document.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const out = document.getElementById('choice-outcome');
    if (out) out.textContent = cfg.text;
    renderScoreHud();
  });
});

setOxygen(100);
renderScoreHud();

/* ── DATA COUNTERS (ACT 3) ── */
window.startAct3CountersIfNeeded = () => {
  if (window.countingDone) return;
  window.countingDone = true;
  const dataVals = [
    { el: document.querySelector('.d-card:nth-child(1) .d-val'), target: -63, postfix: '°C' },
    { el: document.querySelector('.d-card:nth-child(2) .d-val'), target: 0.38, postfix: 'g', float: true },
    { el: document.querySelector('.d-card:nth-child(3) .d-val'), target: 1.88, postfix: 'yr', float: true },
    { el: document.querySelector('.d-card:nth-child(4) .d-val'), target: 0.6, postfix: '%', float: true }
  ];
  dataVals.forEach(d => {
    if (!d.el) return;
    let current = 0;
    const steps = 40;
    const dur = 1500;
    const stepDur = dur / steps;
    const inc = d.target / steps;
    let step = 0;
    const timer = setInterval(() => {
      current += inc; step++;
      let disp = d.float ? current.toFixed(2) : Math.round(current);
      d.el.textContent = disp + d.postfix;
      if (step >= steps) {
        clearInterval(timer);
        d.el.textContent = d.target + d.postfix;
        if (d.target === -63) d.el.textContent = '−63°C';
      }
    }, stepDur);
  });
};

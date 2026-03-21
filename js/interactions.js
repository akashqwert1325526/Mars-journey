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
 
/* ── BREATHING ── */
const BREATH = [
  { l: 'INHALE', t: 4000, s: 1.42 },
  { l: 'HOLD',   t: 2000, s: 1.42 },
  { l: 'EXHALE', t: 4000, s: 1    },
  { l: 'HOLD',   t: 2000, s: 1    },
];
let bIdx = 0;
 
function runBreath() {
  const st = BREATH[bIdx];
  document.getElementById('breathe-lbl').textContent = st.l;
  document.getElementById('breathe-core').style.transform = `scale(${st.s})`;
  document.getElementById('breathe-core').style.background = st.s > 1.2
    ? 'rgba(193,68,14,.32)'
    : 'rgba(193,68,14,.14)';
  bIdx = (bIdx + 1) % BREATH.length;
  setTimeout(runBreath, st.t);
}
runBreath();
 
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
 
  document.body.style.animation = 'shake .07s linear infinite';
 
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
 
  setTimeout(() => { document.body.style.animation = 'none'; }, 1500);
 
  setTimeout(() => {
    stabilized = true; stabRunning = false;
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
const LETTER = `I tried to remember what rain smells like today. I couldn't.
 
I don't know if that's grief or evolution.
 
I came to explore Mars. I thought I'd stay exactly who I was — just relocated. I was wrong. The silence did something to me. The distance did something. Looking back at Earth as a pale blue dot, smaller than my thumbnail… it rewired something.
 
I belong to this red silence now.
 
I hope Earth can forgive me for that.`;
 
function showQuote() {
  document.getElementById('q1').style.opacity = '1';
  setTimeout(() => {
    document.getElementById('q2').style.opacity = '1';
    document.getElementById('q2').classList.add('glow');
  }, 1200);
}
 
function runFinale() {
  finaleStarted = true;
 
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
    document.getElementById('bar-h').style.width = '24%';
    document.getElementById('val-h').textContent = '24%';
    document.getElementById('bar-m').style.width = '90%';
    document.getElementById('val-m').textContent = '90%';
  }, 1400);
 
  /* Typewriter */
  setTimeout(() => {
    const el = document.getElementById('letter-text');
    let i = 0;
    const tick = () => {
      if (i < LETTER.length) {
        const ch  = LETTER[i++];
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
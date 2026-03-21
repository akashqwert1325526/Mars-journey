/* ══════════════════════════════════════
   CINEMATIC — atmosphere layer
   - Particle trail cursor
   - Act title cards
   - Warp lines (Act 2)
   - Heat haze canvas (Act 3)
   - Glitch text observer
   - Scroll velocity bar
══════════════════════════════════════ */
 
const ACTS_LIST = ['act1','act2','act3','act4','act5','act6'];
 
const ACT_TITLES = [
  { act: 'ACT I',   title: 'THE DEPARTURE' },
  { act: 'ACT II',  title: 'THE VOID'       },
  { act: 'ACT III', title: 'THE APPROACH'   },
  { act: 'ACT IV',  title: 'SEVEN MINUTES'  },
  { act: 'ACT V',   title: 'THE SURFACE'    },
  { act: 'ACT VI',  title: 'THE REBIRTH'    },
];
 
/* ── PARTICLE TRAIL ── */
const trailColors = ['rgba(232,98,26,','rgba(240,165,0,','rgba(193,68,14,'];
let mouseX = 0, mouseY = 0;
 
addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
 
setInterval(() => {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  const sz  = Math.random() * 4 + 2;
  const col = trailColors[Math.floor(Math.random() * trailColors.length)];
  const op  = Math.random() * .5 + .3;
  Object.assign(dot.style, {
    left:       mouseX + 'px',
    top:        mouseY + 'px',
    width:      sz + 'px',
    height:     sz + 'px',
    background: `${col}${op})`,
    transition: 'all .6s ease-out',
    transform:  'translate(-50%,-50%) scale(1)',
    opacity:    '1',
  });
  document.body.appendChild(dot);
  setTimeout(() => { dot.style.opacity = '0'; dot.style.transform = 'translate(-50%,-50%) scale(0)'; }, 50);
  setTimeout(() => dot.remove(), 700);
}, 40);
 
/* ── ACT TITLE CARD ── */
let lastTitleAct = -1;
 
function showTitleCard(idx) {
  if (idx === lastTitleAct || !ACT_TITLES[idx]) return;
  lastTitleAct = idx;
 
  const card    = document.getElementById('title-card');
  const info    = ACT_TITLES[idx];
  const tcAct   = document.getElementById('tc-act');
  const tcTitle = document.getElementById('tc-title');
 
  if (tcAct)   tcAct.textContent   = info.act;
  if (tcTitle) tcTitle.textContent = info.title;
 
  document.body.classList.add('cinematic');
  if (card) card.classList.add('show');
 
  /* Sweep line on entering section */
  const sw = document.querySelector('#' + ACTS_LIST[idx] + ' .sweep-line');
  if (sw) { sw.classList.remove('run'); void sw.offsetWidth; sw.classList.add('run'); }
 
  setTimeout(() => { if (card) card.classList.remove('show'); }, 1400);
  setTimeout(() => document.body.classList.remove('cinematic'), 2000);
}
 
/* ── WARP LINES ── */
const wrapEl = document.getElementById('warp-wrap');
if (wrapEl) {
  for (let i = 0; i < 26; i++) {
    const ln = document.createElement('div');
    ln.className = 'warp-ln';
    ln.style.transform = `rotate(${(i / 26) * 360}deg) translateY(-50%)`;
    ln.style.height    = '60px';
    ln.style.opacity   = '.08';
    wrapEl.appendChild(ln);
  }
}
 
/* ── HEAT HAZE CANVAS ── */
const heatC = document.getElementById('heat-canvas');
if (heatC) {
  const hCtx = heatC.getContext('2d');
  let hW = 0, hH = 0, hTime = 0;
 
  const resizeHeat = () => {
    hW = heatC.width  = heatC.offsetWidth  || window.innerWidth;
    hH = heatC.height = heatC.offsetHeight || window.innerHeight;
  };
  resizeHeat();
  addEventListener('resize', resizeHeat);
 
  (function drawHeat() {
    hTime += .008;
    hCtx.clearRect(0, 0, hW, hH);
    for (let i = 0; i < 8; i++) {
      const x    = hW * (.2 + i * .08 + Math.sin(hTime + i) * .06);
      const y    = hH * (.3 + Math.cos(hTime * .7 + i) * .4);
      const r    = 60 + Math.sin(hTime + i * .5) * 30;
      const grad = hCtx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(193,68,14,0.06)');
      grad.addColorStop(1, 'rgba(193,68,14,0)');
      hCtx.beginPath();
      hCtx.arc(x, y, r, 0, Math.PI * 2);
      hCtx.fillStyle = grad;
      hCtx.fill();
    }
    requestAnimationFrame(drawHeat);
  })();
}
 
/* ── GLITCH OBSERVER ── */
const glitchObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('pop'), 400);
  });
}, { threshold: .2 });
 
document.querySelectorAll('.glitch').forEach(el => glitchObs.observe(el));
 
/* ── SCROLL VELOCITY / WARP + TITLE CARD ── */
let scrollSpd = 0, lastSY = window.scrollY, lastST = Date.now(), prevScrollAct = -1;
 
function cinematicScrollExtras() {
  const sy  = window.scrollY;
  const now = Date.now();
  const dt  = Math.max(1, now - lastST);
  scrollSpd = Math.abs(sy - lastSY) / dt;
  lastSY    = sy;
  lastST    = now;
 
  /* Warp line intensity */
  if (wrapEl) {
    const capped = Math.min(scrollSpd, 2.5);
    wrapEl.querySelectorAll('.warp-ln').forEach(ln => {
      ln.style.height  = (50 + capped * 180) + 'px';
      ln.style.opacity = String(Math.min(.55, .06 + capped * .22));
    });
  }
 
  /* Velocity bar */
  const vb = document.getElementById('vel-bar');
  if (vb) vb.style.background = `rgba(232,98,26,${Math.min(scrollSpd * 5, 1) * .4})`;
 
  /* Title card on act change */
  const act = window.getCurrentAct ? window.getCurrentAct() : 0;
  if (act !== prevScrollAct) {
    showTitleCard(act);
    prevScrollAct = act;
  }
}
 
addEventListener('scroll', cinematicScrollExtras, { passive: true });
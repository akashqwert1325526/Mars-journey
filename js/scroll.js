/* ══════════════════════════════════════
   SCROLL — master controller
   Drives: progress, act detection,
   emotion sidebar, audio crossfade,
   red tint, reveal animations
══════════════════════════════════════ */

const ACTS = ['act1','act2','act3','act4','act5','act6'];

const EMOTIONS = [
  { name: 'Attachment', color: '#4fa3e0' },
  { name: 'Isolation',  color: '#9988cc' },
  { name: 'Awe',        color: '#e8a050' },
  { name: 'Terror',     color: '#e84040' },
  { name: 'Wonder',     color: '#3ddc84' },
  { name: 'Rebirth',    color: '#c1440e' },
];

const AUDIO_FNS = [
  () => Audio.playHeartbeat(64),
  Audio.playAmbient,
  Audio.playMarsAtm,
  Audio.playMarsAtm,
  Audio.playMarsAtm,
  Audio.playTransformation,
];

const actEls = ACTS.map(id => document.getElementById(id));
const dots   = document.querySelectorAll('.s-dot');

let currentAct = 0;

/* Exposed for audio.js sound button */
window.getCurrentAct = () => currentAct;

function onScroll() {
  const sy    = window.scrollY;
  const total = document.body.scrollHeight - innerHeight;
  const pct   = Math.max(0, Math.min(1, sy / total));

  /* Progress bar */
  document.getElementById('progress').style.width = (pct * 100) + '%';

  /* Mars red tint */
  const mr = Math.max(0, Math.min(1, (pct - .2) * 2.8));
  window.setMR(mr);
  document.getElementById('red-wash').style.background  = `rgba(160,8,0,${mr * .45})`;
  document.getElementById('scanlines').style.opacity    = String(mr * .45);

  /* Active act detection */
  let newAct = 0;
  actEls.forEach((el, i) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top <= innerHeight * .5 && r.bottom >= innerHeight * .5) newAct = i;
  });

  if (newAct !== currentAct) {
    currentAct = newAct;

    /* Emotion sidebar */
    const em = EMOTIONS[newAct];
    document.getElementById('emo-name').textContent  = em.name;
    document.getElementById('emo-name').style.color  = em.color;
    document.getElementById('emo-fill').style.height = ((newAct + 1) / 6 * 100) + '%';
    document.getElementById('emo-fill').style.background = em.color;

    /* Cursor tint */
    const cur  = document.getElementById('cur');
    const ring = document.getElementById('cur-ring');
    cur.style.background      = em.color;
    ring.style.borderColor    = em.color + '55';

    /* Scroll dots */
    dots.forEach((d, i) => d.classList.toggle('on', i === newAct));

    /* Audio */
    if (window.isSoundOn()) Audio.crossfadeTo(AUDIO_FNS[newAct]);

    /* Act-specific side effects */
    if (newAct === 1) window.startDistIfNeeded();
    if (newAct === 5) window.runFinaleIfNeeded();
  }

  /* Reveal on scroll */
  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * .9) el.classList.add('visible');
  });
}

addEventListener('scroll', onScroll, { passive: true });

/* Scroll dot clicks */
dots.forEach(d => {
  d.addEventListener('click', () => {
    document.getElementById(d.dataset.act)?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* Initial run */
setTimeout(onScroll, 100);
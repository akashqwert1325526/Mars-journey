const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\akash\\OneDrive\\Desktop\\Mission mars\\mars-mission';

// 1. Patch acts.css
let actsCss = fs.readFileSync(path.join(dir, 'css', 'acts.css'), 'utf8');
actsCss = actsCss.replace(
  /\/\* ═══════ ACT 1 — LAUNCH ═══════ \*\//,
  `/* MISSION INTRO TERMINAL */
#terminal-screen {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85rem;
  color: #3ddc84;
  text-align: left;
  min-height: 180px;
  max-width: 480px;
  margin: 1.5rem auto;
  white-space: pre-wrap;
  line-height: 1.5;
  text-shadow: 0 0 5px rgba(61, 220, 132, 0.5);
  background: rgba(0, 0, 0, 0.4);
  padding: 1.2rem;
  border: 1px solid rgba(61, 220, 132, 0.4);
  border-radius: 4px;
}
#term-cursor { display: inline-block; animation: termBlink 1s step-end infinite; }
@keyframes termBlink { 50% { opacity: 0; } }

.reveal-blur {
  opacity: 0; filter: blur(12px); transform: translateY(25px) scale(0.95);
  transition: all 1.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reveal-blur.visible, .act.in-view .reveal-blur {
  opacity: 1; filter: blur(0px); transform: translateY(0) scale(1);
}

/* ═══════ ACT 1 — LAUNCH ═══════ */`
);
fs.writeFileSync(path.join(dir, 'css', 'acts.css'), actsCss);

// 2. Patch index.html
let indexHtml = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(
  /<div id="mi-kicker">Mission Omega<\/div>\s*<h2 id="mi-title">Mars Survival Simulation<\/h2>/,
  `<div id="mi-kicker">Ares OS v9.2.1</div>\n    <div id="terminal-screen"><div id="term-text"></div><div id="term-cursor">_</div></div>`
);
indexHtml = indexHtml.replace(
  /<button id="start-mission-btn">Start Mission<\/button>/,
  `<button id="start-mission-btn" style="opacity: 0; pointer-events: none; transition: opacity 1s;">Ignite</button>`
);
indexHtml = indexHtml.replace(
  /<div id="mi-instructions">\s*<span>Scroll down to move through the mission story \(keep scrolling\)<\/span>/,
  `<div id="mi-instructions" style="opacity: 0; transition: opacity 1s;">\n      <span>Headphones recommended. Scroll to start sequence.</span>`
);
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act I · The Departure<\/div>/,
  `<div class="act-tag reveal-blur">Act I · The Departure</div>`
);
indexHtml = indexHtml.replace(
  /<h1 class="act-h grad-title glitch reveal" data-text="LEAVING">/,
  `<h1 class="act-h grad-title glitch reveal-blur" data-text="LEAVING">`
);

// Act 2 reveal-blur
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act II · Orbital Isolation Phase<\/div>/,
  `<div class="act-tag reveal-blur">Act II · Orbital Isolation Phase</div>`
);
indexHtml = indexHtml.replace(
  /<h2 class="act-h reveal">Silence<br>Changes You<\/h2>/,
  `<h2 class="act-h reveal-blur">Silence<br>Changes You</h2>`
);

// Act 3 reveal-blur
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act III · Approach<\/div>/,
  `<div class="act-tag reveal-blur">Act III · Approach</div>`
);
indexHtml = indexHtml.replace(
  /<h2 class="act-h glitch reveal" data-text="IT FEELS ALIVE">It Feels<br>Alive<\/h2>/,
  `<h2 class="act-h glitch reveal-blur" data-text="IT FEELS ALIVE">It Feels<br>Alive</h2>`
);

// Act 4 reveal-blur
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act IV · Seven Minutes of Terror<\/div>/,
  `<div class="act-tag reveal-blur">Act IV · Seven Minutes of Terror</div>`
);
indexHtml = indexHtml.replace(
  /<h2 class="act-h glitch reveal" data-text="REALITY BREAKS"/,
  `<h2 class="act-h glitch reveal-blur" data-text="REALITY BREAKS"`
);

// Act 5 reveal-blur
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act V · Surface Operations<\/div>/,
  `<div class="act-tag reveal-blur">Act V · Surface Operations</div>`
);
indexHtml = indexHtml.replace(
  /<h2 class="act-h reveal" style="font-size:clamp\(3rem,8vw,6rem\)">A New World,<br>A New You<\/h2>/,
  `<h2 class="act-h reveal-blur" style="font-size:clamp(3rem,8vw,6rem)">A New World,<br>A New You</h2>`
);

// Act 6 reveal-blur
indexHtml = indexHtml.replace(
  /<div class="act-tag reveal">Act VI · Identity<\/div>/,
  `<div class="act-tag reveal-blur">Act VI · Identity</div>`
);
indexHtml = indexHtml.replace(
  /<div id="finale-title" class="glitch reveal" data-text="YOU DON'T BELONG TO EARTH ANYMORE.">You Don't<br>Belong to<br>Earth Anymore.<\/div>/,
  `<div id="finale-title" class="glitch reveal-blur" data-text="YOU DON'T BELONG TO EARTH ANYMORE.">You Don't<br>Belong to<br>Earth Anymore.</div>`
);

fs.writeFileSync(path.join(dir, 'index.html'), indexHtml);

// 3. Patch interactions.js
let intJs = fs.readFileSync(path.join(dir, 'js', 'interactions.js'), 'utf8');
intJs = intJs.replace(
  /startMissionBtn.addEventListener\('click', \(\) => \{\s*intro.classList.add\('hide'\);\s*document.body.classList.remove\('mission-locked'\);\s*window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}\);/,
  `const termText = document.getElementById('term-text');
  const termCursor = document.getElementById('term-cursor');
  const BOOT_SEQUENCE = [
    "ARES OS v9.2.1",
    "Initializing deep space protocol...",
    "Running diagnostics...",
    "Life support: STANDBY",
    "Navigation: OFFLINE",
    "Thrusters: PRIMED",
    "WARNING: Survival probability 21.4%",
    "Mars doesn't care if you survive.",
    "Initialization complete. Awaiting ignition sequence."
  ];
  let currentWord = 0; let currentChar = 0;
  const typeWriter = () => {
    if (currentWord < BOOT_SEQUENCE.length) {
      if (currentChar < BOOT_SEQUENCE[currentWord].length) {
        termText.innerHTML += BOOT_SEQUENCE[currentWord].charAt(currentChar);
        currentChar++; setTimeout(typeWriter, 15 + Math.random() * 30);
      } else {
        termText.innerHTML += "<br>"; currentWord++; currentChar = 0;
        setTimeout(typeWriter, 400 + Math.random() * 600);
      }
    } else {
      setTimeout(() => {
        startMissionBtn.style.opacity = '1';
        startMissionBtn.style.pointerEvents = 'all';
        document.getElementById('mi-instructions').style.opacity = '1';
      }, 500);
    }
  };
  if(termText) setTimeout(typeWriter, 800);

  startMissionBtn.addEventListener('click', () => {
    intro.classList.add('hide');
    document.body.classList.remove('mission-locked');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.Audio && window.isSoundOn && window.isSoundOn()) window.Audio.playLaunchRumble();
  });`
);
// add counters logic at the end
if(!intJs.includes('startAct3CountersIfNeeded')) {
  intJs += `\n/* ── DATA COUNTERS (ACT 3) ── */\nwindow.startAct3CountersIfNeeded = () => {\n  if (window.countingDone) return;\n  window.countingDone = true;\n  const dataVals = [\n    { el: document.querySelector('.d-card:nth-child(1) .d-val'), target: -63, postfix: '°C' },\n    { el: document.querySelector('.d-card:nth-child(2) .d-val'), target: 0.38, postfix: 'g', float: true },\n    { el: document.querySelector('.d-card:nth-child(3) .d-val'), target: 1.88, postfix: 'yr', float: true },\n    { el: document.querySelector('.d-card:nth-child(4) .d-val'), target: 0.6, postfix: '%', float: true }\n  ];\n  dataVals.forEach(d => {\n    if (!d.el) return;\n    let current = 0;\n    const steps = 40;\n    const dur = 1500;\n    const stepDur = dur / steps;\n    const inc = d.target / steps;\n    let step = 0;\n    const timer = setInterval(() => {\n      current += inc; step++;\n      let disp = d.float ? current.toFixed(2) : Math.round(current);\n      d.el.textContent = disp + d.postfix;\n      if (step >= steps) {\n        clearInterval(timer);\n        d.el.textContent = d.target + d.postfix;\n        if (d.target === -63) d.el.textContent = '−63°C';\n      }\n    }, stepDur);\n  });\n};\n`;
}

// Enhance landing camera shake
intJs = intJs.replace(
  /document.body.style.animation = 'shake .07s linear infinite';/,
  `document.body.style.animation = 'shake .05s linear infinite';\n  document.body.style.transform = 'scale(1.05)';\n  document.body.style.filter = 'contrast(1.5) blur(2px)';`
);
intJs = intJs.replace(
  /setTimeout\(\(\) => \{ document.body.style.animation = 'none'; \}, 1500\);/,
  `setTimeout(() => {\n    document.body.style.animation = 'none';\n    document.body.style.transform = 'scale(1)';\n    document.body.style.filter = 'none';\n  }, 1500);`
);

fs.writeFileSync(path.join(dir, 'js', 'interactions.js'), intJs);

// 4. Patch scroll.js
let scrollJs = fs.readFileSync(path.join(dir, 'js', 'scroll.js'), 'utf8');
scrollJs = scrollJs.replace(
  /if \(newAct === 3 && window.startLandingCountdownIfNeeded\) window.startLandingCountdownIfNeeded\(\);/,
  `if (newAct === 2 && window.startAct3CountersIfNeeded) window.startAct3CountersIfNeeded();\n    if (newAct === 3 && window.startLandingCountdownIfNeeded) window.startLandingCountdownIfNeeded();`
);
scrollJs = scrollJs.replace(
  /document.querySelectorAll\('\.reveal, \.reveal-l, \.reveal-r'\)/,
  `document.querySelectorAll('.reveal, .reveal-blur, .reveal-l, .reveal-r')`
);
scrollJs = scrollJs.replace(
  /\/\* Active act detection \*\//,
  `/* Parallax */\n  const rocket = document.getElementById('rocket');\n  if (rocket && pct < 0.3) {\n    rocket.style.transform = \`translateY(\${sy * 0.45}px) rotate(-5deg)\`;\n  }\n\n  /* Active act detection */`
);
fs.writeFileSync(path.join(dir, 'js', 'scroll.js'), scrollJs);

console.log('Patch complete!');

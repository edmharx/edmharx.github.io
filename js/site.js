// Edmharx Macasinag · portfolio
// Everything here is an enhancement: with JavaScript off, every section still shows its content.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reveal once, as soon as an element's top is on (or above) the screen ----------
   A scroll check instead of an observer, so jumping past a section (a nav link) still reveals it. */
(() => {
  let pending = [...document.querySelectorAll('[data-reveal]')];
  let queued = false;
  const check = () => {
    queued = false;
    const line = innerHeight * 0.92;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < line) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!pending.length) { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  check();
})();

/* ---------- job rows ---------- */
function setJob(li, state, label) {
  li.classList.remove('is-passed', 'is-failed', 'is-running', 'is-skipped');
  li.classList.add('is-' + state);
  li.querySelector('.job-state').textContent = label;
  if (!reduceMotion && state !== 'running') {
    li.classList.add('is-flash');
    setTimeout(() => li.classList.remove('is-flash'), 260);
  }
}

/* ---------- hero: replay the real pipeline (real durations, at 1/10 speed) ---------- */
(() => {
  const btn = document.getElementById('ci-run');
  const status = document.getElementById('ci-status');
  if (!btn) return;
  const jobs = [...document.querySelectorAll('#hero-ci .job')];
  const totals = status.textContent;
  btn.addEventListener('click', () => {
    btn.disabled = true;
    status.textContent = 'Running 6 jobs in parallel…';
    let left = jobs.length;
    jobs.forEach((li) => {
      const secs = Number(li.dataset.dur);
      setJob(li, 'running', 'running');
      setTimeout(() => {
        setJob(li, 'passed', secs + 's');
        if (--left === 0) {
          status.textContent = 'All 6 passed. ' + totals;
          btn.disabled = false;
        }
      }, Math.max(600, secs * 100));
    });
  });
})();

/* ---------- break the build: each switch is a real failure from 29–30 Oct ---------- */
(() => {
  const lab = document.querySelector('.lab');
  if (!lab) return;
  const switches = [...lab.querySelectorAll('.switch')];
  const rows = Object.fromEntries([...lab.querySelectorAll('.job')].map((li) => [li.dataset.job, li]));
  const code = document.querySelector('#lab-log code');
  const reset = document.getElementById('lab-reset');

  const mistakes = {
    secret:   { job: 'secrets', lines: ['gitleaks: leaks found: 1', '  Finding: WEBHOOK_SECRET=REDACTED', '  File:    netalertx-bridge/.env.example'] },
    checksum: { job: 'secrets', lines: ['gitleaks: leaks found: 1', '  Finding: docker_key_sha256=REDACTED', '  (a public checksum: fingerprint added to .gitleaksignore)'] },
    cd:       { job: 'lint',    lines: ["chat.sh: SC2164: Use 'cd ... || exit' or 'cd ... || return' in case cd fails."] },
    quote:    { job: 'lint',    lines: ["ci.yml: SC2016: Expressions don't expand in single quotes, use double quotes for that."] },
    latest:   { job: 'compose', lines: ['crafty: image is not pinned (:latest or no tag)'] },
  };

  const line = (text, cls) => {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text + '\n';
    return span;
  };

  let timer;
  function run() {
    clearTimeout(timer);
    const on = switches.filter((s) => s.getAttribute('aria-checked') === 'true').map((s) => s.dataset.break);
    Object.values(rows).forEach((li) => setJob(li, 'running', 'running'));
    code.replaceChildren(line('Running…'));

    timer = setTimeout(() => {
      code.replaceChildren();
      if (on.includes('indent')) {
        Object.values(rows).forEach((li) => setJob(li, 'skipped', 'not run'));
        code.append(line('Invalid workflow file: .github/workflows/ci.yml', 'bad'), line('YAML syntax error, so no job could start.'));
        return;
      }
      const failed = new Set(on.map((k) => mistakes[k].job));
      Object.entries(rows).forEach(([name, li]) => (failed.has(name) ? setJob(li, 'failed', 'failed') : setJob(li, 'passed', 'passed')));
      if (!on.length) { code.append(line('All 6 jobs passed. Safe to deploy.', 'ok')); return; }
      on.forEach((k) => mistakes[k].lines.forEach((t, i) => code.append(line(t, i === 0 ? 'bad' : ''))));
      code.append(line(`${failed.size} of 6 jobs failed. Nothing deploys until they pass.`));
    }, reduceMotion ? 0 : 650);
  }

  switches.forEach((s) => s.addEventListener('click', () => {
    s.setAttribute('aria-checked', s.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    run();
  }));
  reset.addEventListener('click', () => { switches.forEach((s) => s.setAttribute('aria-checked', 'false')); run(); });
})();

/* ---------- copy buttons ---------- */
document.querySelectorAll('.copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Copied'; }
    catch { btn.textContent = 'Select it'; }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  });
});

/* ---------- learning log tabs ---------- */
(() => {
  const tabs = [...document.querySelectorAll('.log-tabs [role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  panels.forEach((p) => [...p.children].forEach((li, i) => li.style.setProperty('--n', i)));

  function select(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    const p = panels[i];
    p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering');
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); select((i + keys[e.key] + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  select(tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
})();

/* ---------- charts draw their bars when they come on screen ---------- */
document.querySelectorAll('.chart').forEach((chart) => {
  if (!('IntersectionObserver' in window)) { chart.classList.add('is-in'); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { chart.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
  io.observe(chart);
});

/* ---------- the drill clip: a still with controls for reduced motion, otherwise plays only while on screen ---------- */
document.querySelectorAll('video.sense-video').forEach((video) => {
  if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); video.controls = true; }
  else if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: 0.2 }).observe(video);
  }
});

/* ---------- contact: open the visitor's email app with the message ---------- */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('contact-msg').value.trim();
    const subject = encodeURIComponent('Hello from your portfolio');
    const body = encodeURIComponent(msg || 'Hi Edmharx,\n\n');
    location.href = `mailto:edmharxx@gmail.com?subject=${subject}&body=${body}`;
  });
})();

/* ---------- Manila clock in the footer ---------- */
(() => {
  const el = document.getElementById('clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', weekday: 'short', hour: '2-digit', minute: '2-digit' });
  const tick = () => { el.textContent = fmt.format(new Date()).replace(',', ''); };
  tick();
  setInterval(tick, 30000);
})();

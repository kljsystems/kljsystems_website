/* KLJ Systems — shared page behaviour.
   Everything here only adds motion or builds decorative pieces; the content is already in the HTML. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- reveals: once, as each part enters ---------- */
  const reveal = (els, cls = 'is-in') => {
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add(cls)); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  };
  reveal([...document.querySelectorAll('[data-reveal], [data-reveal-group]')]);

  /* ---------- headings whose lines rise from behind a mask ---------- */
  (() => {
    const els = [...document.querySelectorAll('[data-lines]')];
    if (!els.length || !('IntersectionObserver' in window) || reduce.matches) return;
    const restore = (el) => { el.textContent = el.dataset.text; el.classList.remove('is-split', 'is-in'); };
    const split = (el) => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.dataset.text = text;
      el.textContent = '';
      const words = text.split(' ').map((word) => {
        const s = document.createElement('span');
        s.style.display = 'inline-block';
        s.textContent = word;
        el.append(s, ' ');
        return s;
      });
      const lines = [];
      for (const w of words) {
        const last = lines.at(-1);
        if (last && Math.abs(last.top - w.offsetTop) < 4) last.words.push(w.textContent);
        else lines.push({ top: w.offsetTop, words: [w.textContent] });
      }
      el.textContent = '';
      lines.forEach((line, i) => {
        const mask = document.createElement('span');
        const inner = document.createElement('span');
        mask.className = 'line';
        inner.style.setProperty('--i', i);
        inner.textContent = line.words.join(' ');
        mask.append(inner);
        el.append(mask, ' ');
      });
      el.classList.add('is-split');
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
        const last = e.target.querySelector('.line:last-of-type > span');
        if (last) last.addEventListener('transitionend', () => restore(e.target), { once: true });
        else restore(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    document.fonts.ready.then(() => els.forEach((el) => { split(el); io.observe(el); }));
    let width = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === width) return;
      width = innerWidth;
      els.filter((el) => el.matches('.is-split:not(.is-in)')).forEach((el) => { io.unobserve(el); restore(el); });
    });
  })();

  /* ---------- menu bar: hides while scrolling down, comes back on any scroll up ---------- */
  const bar = document.querySelector('.bar');
  if (bar) {
    let lastY = scrollY, ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY, dy = y - lastY;
      if (y < bar.offsetHeight * 2 || bar.contains(document.activeElement)) bar.classList.remove('is-hidden');
      else if (dy > 6) bar.classList.add('is-hidden');
      else if (dy < -6) bar.classList.remove('is-hidden');
      if (Math.abs(dy) > 6) lastY = y;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    bar.addEventListener('focusin', () => bar.classList.remove('is-hidden'));
  }

  /* ---------- small things ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  const syncVideos = () => document.querySelectorAll('video[autoplay]').forEach((v) => { if (reduce.matches) v.pause(); else v.play().catch(() => {}); });
  syncVideos();
  reduce.addEventListener('change', syncVideos);
})();

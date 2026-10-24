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

  /* ---------- mosaic: one picture cut across the tiles of a board ---------- */
  document.querySelectorAll('.mosaic').forEach((board) => {
    const small = matchMedia('(max-width: 860px)');
    const build = () => {
      board.querySelectorAll('.mtile').forEach((t) => t.remove());
      const sm = small.matches;
      const cols = sm ? 3 : 6;
      const rows = sm ? 5 : 4;
      const img = sm ? board.dataset.imgSm : board.dataset.img;
      board.style.setProperty('--img', `url("${new URL(img, location.href).href}")`);
      const taken = new Set();
      board.querySelectorAll('.mcolor').forEach((tile) => {
        if (sm && tile.classList.contains('hide-sm')) return;
        const c = parseInt(tile.style.getPropertyValue(sm ? '--pc' : '--dc'), 10) - 1;
        const r = parseInt(tile.style.getPropertyValue(sm ? '--pr' : '--dr'), 10) - 1;
        taken.add(`${r}:${c}`);
        if (tile.classList.contains("mcolor--head") || (sm && tile.classList.contains("mcolor--act"))) taken.add(`${r}:${c + 1}`);
      });
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (taken.has(`${r}:${c}`)) continue;
          const tile = document.createElement('div');
          tile.className = 'mtile';
          tile.setAttribute('aria-hidden', 'true');
          tile.style.setProperty('--c', c);
          tile.style.setProperty('--r', r);
          const piece = document.createElement('span');
          piece.className = 'mtile__piece';
          tile.append(piece);
          frag.append(tile);
        }
      }
      board.append(frag);
      board.classList.add('is-built');
    };
    build();
    small.addEventListener('change', build);
  });

  /* ---------- process diagram: scattered squares, squeezed into a ribbon, set out in rows ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const square = (svg, x, y, s, fill, spread) => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x.toFixed(1));
    r.setAttribute('y', y.toFixed(1));
    r.setAttribute('width', s);
    r.setAttribute('height', s);
    r.setAttribute('fill', fill);
    r.setAttribute('class', 'm');
    r.style.setProperty('--dx', `${((rand() - 0.5) * spread).toFixed(0)}px`);
    r.style.setProperty('--dy', `${((rand() - 0.5) * spread * 0.7).toFixed(0)}px`);
    r.style.setProperty('--rot', `${((rand() - 0.5) * 90).toFixed(0)}deg`);
    svg.append(r);
  };
  const pale = ['#a29fab', '#5a5466'];
  const wide = document.getElementById('flow-wide');
  if (wide) {
    const s = 12;
    for (let i = 0; i < 40; i++) square(wide, 10 + rand() * 400, 20 + rand() * 250, s, pale[i % 2], 220);
    for (let c = 0; c < 32; c++) for (let r = 0; r < 3; r++) square(wide, 455 + c * 14, 129 + r * 14, s, '#ffffff', 160);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) square(wide, 960 + c * 42, 40 + r * 52, s + 6, '#b794ff', 120);
  }
  const tall = document.getElementById('flow-tall');
  if (tall) {
    const s = 10;
    for (let i = 0; i < 30; i++) square(tall, 20 + rand() * 250, 6 + rand() * 110, s, pale[i % 2], 120);
    for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) square(tall, 129 + c * 12, 135 + r * 12, s, '#ffffff', 80);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) square(tall, 22 + c * 40, 300 + r * 25, s + 4, '#b794ff', 60);
  }

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

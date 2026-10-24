/* KLJ Systems — the hero: a PC that takes itself apart as you scroll.
   Plays a pre-rendered image sequence (assets/pc/d for wide screens, assets/pc/m for phones) on a canvas,
   so there is no live 3D on the page. Hotspots on the exploded view explain each part. */
(() => {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const spotLayer = document.getElementById('hero-spots');
  const card = document.getElementById('spot-card');
  const captions = [...hero.querySelectorAll('.hero__caption')];
  const small = matchMedia('(max-width: 860px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const N = 64;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  let set = '', frames = [], spots = [], frameW = 1600, frameH = 1000, anchorY = 0.62;
  let shown = -1, progress = 0, queued = false;

  /* ---------- loading: first and last frame, then progressively finer ---------- */
  function load() {
    set = small.matches ? 'm' : 'd';
    [frameW, frameH, anchorY] = set === 'm' ? [900, 1200, 0.7] : [1600, 1000, 0.62];
    frames = new Array(N).fill(null);
    shown = -1;
    const order = [0, N - 1];
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
    let next = 0;
    const pump = () => {
      if (next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.src = `assets/pc/${set}/${String(i).padStart(3, '0')}.webp`;
      img.onload = () => { frames[i] = img; if (i === 0 || Math.abs(i - target()) < 3) schedule(true); pump(); };
      img.onerror = pump;
    };
    for (let k = 0; k < 4; k++) pump(); // four at a time
    fetch(`assets/pc/${set}/hotspots.json`).then((r) => r.json()).then(buildSpots).catch(() => {});
  }

  /* ---------- drawing ---------- */
  // where the picture sits: small and low under the headline at the start, larger once the PC is apart
  let cw = 1, ch = 1, scale = 1, dx = 0, dy = 0, endScale = 1, endDx = 0, endDy = 0;
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  function layout(a) {
    const fit = Math.min(cw / frameW, ch / frameH);
    const phone = set === 'm';
    const z0 = phone ? 0.92 : 0.78, z1 = phone ? 1 : 0.82;
    const s = fit * (z0 + (z1 - z0) * a);
    const h = frameH * s;
    const startY = phone ? ch - h - 0.01 * ch : 0.34 * ch;   // low, below the call to action
    const endY = phone ? (ch - h) * 0.62 : ch - h - 0.078 * ch; // clear of the captions and the price bar
    return [s, (cw - frameW * s) / 2, startY + (endY - startY) * a];
  }
  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cw = Math.max(1, r.width); ch = Math.max(1, r.height);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    [endScale, endDx, endDy] = layout(1);
    shown = -1;
    placeSpots();
  }
  const target = () => (reduce.matches ? 0 : Math.round(clamp01((progress - 0.06) / 0.6) * (N - 1)));
  function nearest(i) {
    for (let d = 0; d < N; d++) { if (frames[i - d]) return i - d; if (frames[i + d]) return i + d; }
    return -1;
  }
  let lastA = -1;
  function draw(force) {
    const i = nearest(target());
    const a = reduce.matches ? 0 : ease(clamp01((progress - 0.04) / 0.3));
    if (i < 0 || (i === shown && a === lastA && !force)) return;
    [scale, dx, dy] = layout(a);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(frames[i], dx, dy, frameW * scale, frameH * scale);
    shown = i; lastA = a;
    hero.classList.add('is-live');
  }

  /* ---------- the scroll story ---------- */
  function update(force) {
    queued = false;
    const total = hero.offsetHeight - innerHeight;
    progress = reduce.matches ? 0 : clamp01(-hero.getBoundingClientRect().top / Math.max(1, total));
    const intro = clamp01(progress / 0.14);
    hero.style.setProperty('--intro-o', (1 - intro).toFixed(3));
    hero.style.setProperty('--intro-y', `${(-48 * intro).toFixed(1)}px`);
    hero.style.setProperty('--intro-s', (1 - 0.04 * intro).toFixed(4));
    hero.style.setProperty('--glow', (0.55 + 0.45 * clamp01((progress - 0.06) / 0.6)).toFixed(3));
    hero.classList.toggle('show-bar', progress > 0.08);
    for (const c of captions) c.classList.toggle('is-on', progress >= +c.dataset.from && progress < +c.dataset.to);
    const apart = !reduce.matches && progress > 0.64;
    if (apart !== hero.classList.contains('show-spots')) {
      hero.classList.toggle('show-spots', apart);
      spotLayer.querySelectorAll('.spot').forEach((s) => { s.tabIndex = apart ? 0 : -1; });
      if (!apart) hideCard();
    }
    draw(force);
  }
  const schedule = (force) => { if (!queued) { queued = true; requestAnimationFrame(() => update(force)); } };

  /* ---------- hotspots ---------- */
  function buildSpots(list) {
    spots = list;
    spotLayer.replaceChildren(...list.map((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'spot';
      b.textContent = s.title;
      b.tabIndex = -1;
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', `${s.title}: ${s.text}`);
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showCard(b, s); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hideCard(); });
      b.addEventListener('focus', () => showCard(b, s));
      b.addEventListener('blur', hideCard);
      b.addEventListener('click', () => (b.getAttribute('aria-expanded') === 'true' ? hideCard() : showCard(b, s)));
      return b;
    }));
    placeSpots();
  }
  function placeSpots() {
    const pad = 12;
    [...spotLayer.children].forEach((b, k) => {
      const s = spots[k];
      if (!s) return;
      const half = (b.offsetWidth || 120) / 2 + pad;
      const x = Math.min(cw - half, Math.max(half, endDx + s.x * frameW * endScale));
      const y = Math.min(ch - 90, Math.max(110, endDy + s.y * frameH * endScale));
      b.style.left = `${x.toFixed(1)}px`;
      b.style.top = `${y.toFixed(1)}px`;
    });
    // nudge apart any labels that land on top of each other
    const btns = [...spotLayer.children].sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top));
    for (let i = 0; i < btns.length; i++) for (let j = 0; j < i; j++) {
      const a = btns[j], b = btns[i];
      const ax = parseFloat(a.style.left), ay = parseFloat(a.style.top), bx = parseFloat(b.style.left), by = parseFloat(b.style.top);
      const overlapX = Math.abs(ax - bx) < (a.offsetWidth + b.offsetWidth) / 2 + 6;
      const gap = (a.offsetHeight + b.offsetHeight) / 2 + 6;
      if (overlapX && by - ay < gap) b.style.top = `${(ay + gap).toFixed(1)}px`;
    }
  }
  function showCard(btn, s) {
    spotLayer.querySelectorAll('.spot').forEach((o) => o.setAttribute('aria-expanded', String(o === btn)));
    card.querySelector('strong').textContent = s.title;
    card.querySelector('p').textContent = s.text;
    const st = hero.querySelector('.hero__stage').getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const w = card.offsetWidth || 300, h = card.offsetHeight || 140;
    let x = r.right - st.left + 12;
    if (x + w > cw - 12) x = r.left - st.left - w - 12;
    x = Math.min(cw - w - 12, Math.max(12, x));
    const y = Math.min(ch - h - 90, Math.max(64, r.top - st.top - h / 2 + r.height / 2));
    card.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
    card.classList.add('is-on');
  }
  function hideCard() {
    card.classList.remove('is-on');
    spotLayer.querySelectorAll('.spot').forEach((o) => o.setAttribute('aria-expanded', 'false'));
  }

  addEventListener('scroll', () => schedule(false), { passive: true });
  addEventListener('resize', () => { size(); schedule(true); });
  small.addEventListener('change', () => { load(); size(); schedule(true); });
  reduce.addEventListener('change', () => schedule(true));
  load();
  size();
  update(true);
})();

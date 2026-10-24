/* KLJ Systems — the build sheet.
   Pick a use and a budget; the sheet shows the largest sample build that fits.
   Prices are rough street prices in USD and should be reviewed regularly (see README). */
(() => {
  const form = document.getElementById('builder-form');
  if (!form) return;

  const FEE = 150;
  const WINDOWS = ['Windows', 'Windows 11 Home licence', 120];
  const p = (part, pick, price) => [part, pick, price];

  const BUILDS = {
    gaming: {
      label: 'Gaming',
      tiers: [
        { fit: 'Aimed at 1080p with high settings in most current games.', parts: [
          p('Processor', 'AMD Ryzen 5 7600', 190), p('Graphics', 'NVIDIA GeForce RTX 5060, 8 GB', 300),
          p('Memory', '32 GB DDR5-6000', 140), p('Storage', '1 TB NVMe SSD', 80), p('Motherboard', 'B650 micro-ATX, Wi-Fi', 140),
          p('Power', '650 W, 80+ Gold', 80), p('Case and cooling', 'Airflow case, tower cooler', 110)] },
        { fit: 'Aimed at 1440p with high settings and a high-refresh monitor.', parts: [
          p('Processor', 'AMD Ryzen 7 9700X', 300), p('Graphics', 'NVIDIA GeForce RTX 5070, 12 GB', 560),
          p('Memory', '32 GB DDR5-6000', 140), p('Storage', '2 TB NVMe SSD', 140), p('Motherboard', 'B650 ATX, Wi-Fi', 160),
          p('Power', '750 W, 80+ Gold', 100), p('Case and cooling', 'Airflow case, tower cooler', 150)] },
        { fit: 'Aimed at 1440p at the highest settings, or 4K with upscaling.', parts: [
          p('Processor', 'AMD Ryzen 7 9800X3D', 470), p('Graphics', 'NVIDIA GeForce RTX 5080, 16 GB', 1050),
          p('Memory', '32 GB DDR5-6000 CL30', 150), p('Storage', '2 TB NVMe SSD, Gen 4', 150), p('Motherboard', 'X870 ATX, Wi-Fi 7', 250),
          p('Power', '850 W, 80+ Gold', 130), p('Case and cooling', 'Glass case, 240 mm liquid cooler', 220)] },
        { fit: 'Aimed at 4K at the highest settings, with headroom for years.', parts: [
          p('Processor', 'AMD Ryzen 7 9800X3D', 470), p('Graphics', 'NVIDIA GeForce RTX 5090, 32 GB', 2400),
          p('Memory', '64 GB DDR5-6000 CL30', 260), p('Storage', '4 TB NVMe SSD, Gen 4', 280), p('Motherboard', 'X870E ATX, Wi-Fi 7', 350),
          p('Power', '1000 W, 80+ Gold, ATX 3.1', 200), p('Case and cooling', 'Dual-chamber case, 360 mm liquid cooler', 300)] },
      ],
    },
    creator: {
      label: 'Streaming and editing',
      tiers: [
        { fit: 'Streams and edits 1080p video smoothly, with room for 4K timelines.', parts: [
          p('Processor', 'AMD Ryzen 7 7700', 230), p('Graphics', 'NVIDIA GeForce RTX 5060 Ti, 16 GB', 430),
          p('Memory', '32 GB DDR5-6000', 140), p('Storage', '2 TB NVMe SSD', 140), p('Motherboard', 'B650 ATX, Wi-Fi', 140),
          p('Power', '750 W, 80+ Gold', 100), p('Case and cooling', 'Quiet case, tower cooler', 110)] },
        { fit: 'Edits 4K comfortably and streams while gaming on one machine.', parts: [
          p('Processor', 'AMD Ryzen 9 9900X', 380), p('Graphics', 'NVIDIA GeForce RTX 5070, 12 GB', 560),
          p('Memory', '64 GB DDR5-6000', 260), p('Storage', '2 TB NVMe SSD + 4 TB hard drive', 240), p('Motherboard', 'B650E ATX, Wi-Fi', 200),
          p('Power', '850 W, 80+ Gold', 130), p('Case and cooling', 'Quiet case, 240 mm liquid cooler', 200)] },
        { fit: 'Heavy 4K and 6K editing, effects and colour work without waiting.', parts: [
          p('Processor', 'AMD Ryzen 9 9950X', 560), p('Graphics', 'NVIDIA GeForce RTX 5080, 16 GB', 1050),
          p('Memory', '64 GB DDR5-6000', 260), p('Storage', '4 TB NVMe SSD, Gen 4', 280), p('Motherboard', 'X870E ATX, Wi-Fi 7', 350),
          p('Power', '1000 W, 80+ Gold', 200), p('Case and cooling', 'Quiet case, 360 mm liquid cooler', 300)] },
      ],
    },
    workstation: {
      label: 'Workstation',
      tiers: [
        { fit: 'Code, CAD and light 3D, with enough memory for many open projects.', parts: [
          p('Processor', 'AMD Ryzen 9 9900X', 380), p('Graphics', 'NVIDIA GeForce RTX 5060 Ti, 16 GB', 430),
          p('Memory', '64 GB DDR5-6000', 260), p('Storage', '2 TB NVMe SSD', 140), p('Motherboard', 'B650 ATX, Wi-Fi', 160),
          p('Power', '750 W, 80+ Gold', 100), p('Case and cooling', 'Quiet case, tower cooler', 130)] },
        { fit: 'Rendering, simulation and running local AI models up to mid size.', parts: [
          p('Processor', 'AMD Ryzen 9 9950X', 560), p('Graphics', 'NVIDIA GeForce RTX 5080, 16 GB', 1050),
          p('Memory', '128 GB DDR5-5600', 520), p('Storage', '4 TB NVMe SSD, Gen 4', 280), p('Motherboard', 'X870E ATX, Wi-Fi 7', 350),
          p('Power', '1000 W, 80+ Gold', 200), p('Case and cooling', 'Quiet case, 360 mm liquid cooler', 300)] },
        { fit: 'Large local AI models, heavy renders and long simulations.', parts: [
          p('Processor', 'AMD Ryzen 9 9950X', 560), p('Graphics', 'NVIDIA GeForce RTX 5090, 32 GB', 2400),
          p('Memory', '128 GB DDR5-5600', 520), p('Storage', '2 × 4 TB NVMe SSD', 560), p('Motherboard', 'X870E ATX, Wi-Fi 7', 350),
          p('Power', '1200 W, 80+ Platinum', 280), p('Case and cooling', 'Full-tower case, 360 mm liquid cooler', 320)] },
      ],
    },
    office: {
      label: 'Home and office',
      tiers: [
        { fit: 'Fast and silent for email, documents, video calls and school work.', parts: [
          p('Processor', 'AMD Ryzen 5 8600G, with graphics', 200), p('Graphics', 'Built into the processor', 0),
          p('Memory', '16 GB DDR5', 70), p('Storage', '1 TB NVMe SSD', 80), p('Motherboard', 'B650 micro-ATX, Wi-Fi', 120),
          p('Power', '550 W, 80+ Bronze', 60), p('Case and cooling', 'Compact case, stock cooler', 80)] },
        { fit: 'Big spreadsheets, photo edits and many tabs, still near silent.', parts: [
          p('Processor', 'AMD Ryzen 7 8700G, with graphics', 300), p('Graphics', 'Built into the processor', 0),
          p('Memory', '32 GB DDR5-6000', 140), p('Storage', '2 TB NVMe SSD', 140), p('Motherboard', 'B650 micro-ATX, Wi-Fi', 140),
          p('Power', '650 W, 80+ Gold', 80), p('Case and cooling', 'Compact quiet case, tower cooler', 120)] },
      ],
    },
  };

  const money = (n) => `$${n.toLocaleString('en-US')}`;
  const total = (tier) => tier.parts.reduce((s, x) => s + x[2], 0) + WINDOWS[2] + FEE;

  const $ = (id) => document.getElementById(id);
  const range = $('budget');
  const out = $('budget-out');
  const table = $('parts');
  const body = table.querySelector('tbody');
  const send = $('send-build');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let first = true;

  const render = () => {
    const use = form.elements.use.value;
    const budget = Number(range.value);
    const build = BUILDS[use];
    let index = -1;
    build.tiers.forEach((t, i) => { if (total(t) <= budget) index = i; });
    const under = index === -1;
    const tier = build.tiers[Math.max(0, index)];
    const parts = [...tier.parts, WINDOWS];
    const partsSum = parts.reduce((s, x) => s + x[2], 0);

    out.value = money(budget);
    out.textContent = money(budget);
    range.parentElement.style.setProperty('--p', ((budget - range.min) / (range.max - range.min)).toFixed(4));

    const fill = () => {
      body.replaceChildren(...parts.map(([part, pick, price]) => {
        const tr = document.createElement('tr');
        for (const v of [part, pick, price === 0 ? 'Included' : money(price)]) {
          const td = document.createElement('td');
          td.textContent = v;
          tr.append(td);
        }
        return tr;
      }));
      $('sheet-use').textContent = build.label;
      $('sheet-tier').textContent = `Tier ${Math.max(0, index) + 1} of ${build.tiers.length}`;
      $('sheet-fit').textContent = tier.fit;
      $('t-parts').textContent = money(partsSum);
      $('t-fee').textContent = money(FEE);
      $('t-total').textContent = money(partsSum + FEE);
      $('sheet-note').textContent = under
        ? `The smallest sensible ${build.label.toLowerCase()} build comes to about ${money(total(tier))}. Tell us your limit and we'll look at used or carried-over parts.`
        : 'Part prices move every week. This sheet is a starting point; your quote is written and fixed before we order anything.';

      const summary = [
        `${build.label} build, budget ${money(budget)}, estimate ${money(partsSum + FEE)}`,
        ...parts.map(([part, pick]) => `${part}: ${pick}`),
      ].join('\n');
      const q = new URLSearchParams({ service: 'Custom PC build', budget: money(budget), build: summary });
      send.href = `contact.html?${q.toString()}`;
    };

    if (first || reduce.matches) { fill(); first = false; return; }
    table.classList.add('is-swapping');
    clearTimeout(render.t);
    render.t = setTimeout(() => { fill(); requestAnimationFrame(() => table.classList.remove('is-swapping')); }, 180);
  };

  form.addEventListener('input', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  render();
})();

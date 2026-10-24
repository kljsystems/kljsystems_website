/* Renders the hero's image sequence from tools/pc3d.js.
   Needs the site served locally (python -m http.server 5317) and the design skill's headless-Chrome helper.
   Usage: node tools/render-frames.mjs
   Writes PNG frames to .frames/, then convert to WebP with ffmpeg (see README). */
import { Browser, sleep } from 'file:///C:/Users/kydan/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const FRAMES = 64;
const SETS = [
  { name: 'desktop', w: 1600, h: 1000 },
  { name: 'mobile', w: 900, h: 1200 },
];

const b = await Browser.launch({ extraArgs: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const set of SETS) {
  const dir = `.frames/${set.name}`;
  mkdirSync(dir, { recursive: true });
  const p = await b.newPage({ width: set.w, height: set.h });
  await p.goto(`http://localhost:5317/tools/render.html?w=${set.w}&h=${set.h}`, { settleMs: 2000 });
  for (let tries = 0; tries < 40 && !(await p.eval(() => !!window.__klj)); tries++) await sleep(250);
  for (let i = 0; i < FRAMES; i++) {
    const t = i / (FRAMES - 1);
    const yaw = -0.22 + 0.36 * t; // a slow quarter-turn while it comes apart
    const url = await p.eval(`window.__klj.frame(${t}, ${yaw})`);
    writeFileSync(`${dir}/${String(i).padStart(3, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
    if (i % 8 === 0) console.log(set.name, i);
  }
  const anchors = await p.eval('window.__klj.anchors()');
  writeFileSync(`${dir}/hotspots.json`, JSON.stringify(anchors, null, 2));
  await p.close();
}
await b.close();
console.log('done');

/* KLJ Systems — the exploded PC on the first screen.
   A mid-tower modelled part by part in Three.js: painted steel case, perforated mesh, glass, a motherboard with
   its components, tower cooler, memory, M.2 drive, graphics card, power supply with sleeved cables, and fans.
   It comes apart into labelled parts, holds, and goes back together. Point at a part to read what it does,
   drag to turn it. Units are centimetres. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('pc3d');
const labelLayer = document.getElementById('pc3d-labels');
const toggle = document.getElementById('pc3d-toggle');
if (stage && canvas) start();

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the photograph underneath stays
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 860px)');
  let pixelRatio = Math.min(devicePixelRatio, small.matches ? 1.5 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1d1828); // the stage colour, so the canvas sits flush
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 1000);

  /* ---------- light: a key that casts soft shadows, a cool fill, a purple rim and a glow from below ---------- */
  scene.add(new THREE.HemisphereLight(0xe9e4f5, 0x120e18, 0.35));
  const key = new THREE.DirectionalLight(0xfff8f0, 2.2);
  key.position.set(35, 70, 60);
  key.castShadow = true;
  key.shadow.mapSize.set(small.matches ? 1024 : 2048, small.matches ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 260 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.55);
  fill.position.set(70, -5, 40);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xb794ff, 2.4);
  rim.position.set(-70, 30, -60);
  scene.add(rim);
  const under = new THREE.PointLight(0x8b5cf6, 700, 130, 2);
  under.position.set(0, -14, 26);
  scene.add(under);

  // a floor that only shows shadows
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.ShadowMaterial({ opacity: 0.3 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -50;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ---------- textures drawn on canvases ---------- */
  function tex(w, h, draw, { srgb = true, repeat = null } = {}) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
    return t;
  }
  const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

  // brushed metal: fine streaks in the roughness
  const brushed = tex(256, 256, (x, w, h) => {
    x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const g = 90 + rnd() * 90; x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(0, rnd() * h, w, 0.6 + rnd()); }
  }, { srgb: false, repeat: [2, 2] });
  // painted steel: a faint orange-peel speckle
  const speckle = tex(256, 256, (x, w, h) => {
    x.fillStyle = '#8a8a8a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) { const g = 110 + rnd() * 60; x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(rnd() * w, rnd() * h, 1.2, 1.2); }
  }, { srgb: false, repeat: [4, 4] });
  // perforated mesh: round holes in a staggered grid (white = solid)
  const holes = tex(128, 128, (x, w, h) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.arc(c * 16 + (r % 2) * 8 + 8, r * 16 + 8, 5.6, 0, Math.PI * 2); x.fill(); }
  }, { srgb: false, repeat: [10, 22] });
  // sleeved cable braid
  const braid = tex(64, 64, (x, w, h) => {
    x.fillStyle = '#16131c'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#3a3346'; x.lineWidth = 3;
    for (let i = -64; i < 128; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); }
    x.strokeStyle = '#6b4fb8'; x.lineWidth = 1.5;
    for (let i = -64; i < 128; i += 16) { x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); }
  }, { repeat: [1, 30] });

  // the motherboard: matte black PCB, copper traces, silkscreen and pads
  const boardMap = tex(1024, 1280, (x, w, h) => {
    x.fillStyle = '#121016'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(160,130,220,0.16)'; x.lineWidth = 2;
    for (let i = 0; i < 260; i++) {
      x.beginPath();
      let px = rnd() * w, py = rnd() * h;
      x.moveTo(px, py);
      for (let k = 0; k < 4; k++) { if (k % 2) px += (rnd() - 0.5) * 260; else py += (rnd() - 0.5) * 260; x.lineTo(px, py); }
      x.stroke();
    }
    x.fillStyle = 'rgba(214,180,90,0.55)';
    for (let i = 0; i < 900; i++) x.fillRect(rnd() * w, rnd() * h, 3, 3);   // solder pads
    x.fillStyle = 'rgba(235,230,245,0.55)'; x.font = '600 22px sans-serif';
    x.fillText('KLJ-B650', 600, 1180); x.fillText('PCIE_1', 120, 905); x.fillText('M2_1', 360, 1010);
    x.fillText('DDR5_A1  A2  B1  B2', 620, 70); x.fillText('ATX_24P', 880, 520);
    x.strokeStyle = 'rgba(235,230,245,0.4)'; x.lineWidth = 2;
    x.strokeRect(300, 170, 230, 230);                                           // socket outline
  });
  const cpuMap = tex(256, 256, (x, w, h) => {
    x.fillStyle = '#c9c7cf'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(40,36,50,0.75)'; x.font = '700 30px sans-serif'; x.fillText('KLJ', 22, 60);
    x.font = '500 18px sans-serif'; x.fillText('8-CORE  4.6 GHz', 22, 100); x.fillText('2026  QS-0417', 22, 128);
    x.fillRect(22, 200, 40, 6);
  });
  const psuLabel = tex(512, 320, (x, w, h) => {
    x.fillStyle = '#f2f0f5'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0e0c12'; x.font = '800 64px sans-serif'; x.fillText('850W', 28, 90);
    x.font = '600 26px sans-serif'; x.fillText('80 PLUS GOLD  ·  FULLY MODULAR', 28, 140);
    x.fillStyle = '#7c4dff'; x.fillRect(28, 170, 456, 8);
    x.fillStyle = '#4a4655'; x.font = '500 18px sans-serif';
    ['+3.3V 20A   +5V 20A   +12V 70.8A', 'AC INPUT 100-240V ~ 12-6A 50/60Hz', 'KLJ SYSTEMS  ·  TESTED 24H'].forEach((t, i) => x.fillText(t, 28, 215 + i * 30));
  });
  const ssdLabel = tex(256, 72, (x, w, h) => {
    x.fillStyle = '#efedf3'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0e0c12'; x.font = '800 26px sans-serif'; x.fillText('2TB', 12, 34);
    x.font = '500 14px sans-serif'; x.fillText('NVMe PCIe 4.0  M.2 2280', 12, 58);
    x.fillStyle = '#7c4dff'; x.fillRect(190, 14, 50, 22);
  });
  const hubSticker = tex(128, 128, (x, w, h) => {
    x.fillStyle = '#16131c'; x.beginPath(); x.arc(64, 64, 64, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#b794ff'; x.font = '800 34px sans-serif'; x.textAlign = 'center'; x.fillText('KLJ', 64, 76);
  });
  const backplateMap = tex(1024, 400, (x, w, h) => {
    x.fillStyle = '#2b2833'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#121016';
    for (let i = 0; i < 26; i++) x.fillRect(620 + (i % 13) * 28, 110 + Math.floor(i / 13) * 120, 12, 90); // vents
    x.fillStyle = 'rgba(205,180,255,0.9)'; x.font = '800 70px sans-serif'; x.fillText('KLJ', 90, 230);
    x.font = '600 26px sans-serif'; x.fillStyle = 'rgba(220,215,230,0.55)'; x.fillText('GAMING  ·  BUILT AND TESTED BY HAND', 90, 280);
  });
  const ramMap = tex(512, 128, (x, w, h) => {
    x.fillStyle = '#2b2833'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#16131c';
    for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(40 + i * 50, 0); x.lineTo(70 + i * 50, 0); x.lineTo(55 + i * 50, 40); x.fill(); }
    x.fillStyle = 'rgba(220,215,230,0.8)'; x.font = '700 22px sans-serif'; x.fillText('KLJ  DDR5-6000', 30, 100);
  });

  /* ---------- materials ---------- */
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const M = {
    steel: new THREE.MeshPhysicalMaterial({ color: 0x17151c, metalness: 0.55, roughness: 0.42, roughnessMap: speckle, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    steelInner: std({ color: 0x1d1a24, metalness: 0.5, roughness: 0.55, roughnessMap: speckle }),
    mesh: std({ color: 0x141218, metalness: 0.6, roughness: 0.45, alphaMap: holes, alphaTest: 0.5, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0c0a10, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 0.55, side: THREE.DoubleSide, depthWrite: false }), // smoked
    alu: std({ color: 0xd2d0d8, metalness: 1, roughness: 0.34, roughnessMap: brushed }),
    nickel: std({ color: 0xdcdce2, metalness: 1, roughness: 0.16 }),
    copper: std({ color: 0xc27a45, metalness: 1, roughness: 0.26 }),
    gunmetal: std({ color: 0x2c2933, metalness: 0.85, roughness: 0.32, roughnessMap: brushed }),
    plastic: std({ color: 0x111015, metalness: 0, roughness: 0.55 }),
    bladePlastic: std({ color: 0x1a1720, metalness: 0, roughness: 0.4, side: THREE.DoubleSide }),
    rubber: std({ color: 0x08080a, metalness: 0, roughness: 0.92 }),
    pcb: std({ color: 0x15121a, metalness: 0.15, roughness: 0.5 }),
    board: std({ map: boardMap, metalness: 0.2, roughness: 0.55 }),
    chip: std({ color: 0x0c0b0e, metalness: 0.2, roughness: 0.35 }),
    gold: std({ color: 0xd9b45a, metalness: 1, roughness: 0.22 }),
    cap: std({ color: 0x1b1922, metalness: 0.7, roughness: 0.3 }),
    led: std({ color: 0xc9b0ff, emissive: 0xa77bff, emissiveIntensity: 3.2, roughness: 0.4 }),
    ledSoft: std({ color: 0xb79cff, emissive: 0x8b5cf6, emissiveIntensity: 2.2, roughness: 0.4 }),
    cable: std({ map: braid, metalness: 0.1, roughness: 0.75 }),
    cpuTop: std({ map: cpuMap, metalness: 0.95, roughness: 0.3 }),
    psuLabel: std({ map: psuLabel, roughness: 0.7 }),
    ssdLabel: std({ map: ssdLabel, roughness: 0.7 }),
    hub: std({ map: hubSticker, roughness: 0.5 }),
    backplate: std({ map: backplateMap, metalness: 0.8, roughness: 0.35 }),
    ram: std({ map: ramMap, metalness: 0.85, roughness: 0.32 }),
  };

  const rbox = (w, h, d, mat, r = 0.3) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999), mat);
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (rt, rb, h, mat, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const at = (obj, x, y, z) => { obj.position.set(x, y, z); return obj; };

  /* A fan facing +z: square frame with a round throat, nine swept blades, a hub sticker and a lit ring. */
  const rotors = [];
  function fan(size = 12, { frame = true, lit = true, grill = false } = {}) {
    const g = new THREE.Group();
    const k = size / 12, depth = 2.5 * k;
    if (frame) {
      const s = new THREE.Shape(), r = 0.9 * k, h = size / 2;
      s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
      s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
      const hole = new THREE.Path(); hole.absarc(0, 0, size * 0.475, 0, Math.PI * 2, true); s.holes.push(hole);
      const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2, curveSegments: 48 });
      geo.translate(0, 0, -depth / 2);
      g.add(new THREE.Mesh(geo, M.plastic));
    }
    if (lit) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(size * 0.47, 0.14 * k, 10, 96), M.led);
      ring.position.z = depth / 2 + 0.05;
      g.add(ring);
    }
    const rotor = new THREE.Group();
    const rh = size * 0.16, rt = size * 0.455;
    const hub = cyl(rh, rh, 1.4 * k, M.plastic, 40);
    hub.rotation.x = Math.PI / 2;
    rotor.add(hub);
    const sticker = new THREE.Mesh(new THREE.CircleGeometry(rh * 0.92, 40), M.hub);
    sticker.position.z = 0.71 * k;
    rotor.add(sticker);
    const blade = new THREE.Shape();
    blade.moveTo(rh * 0.9, -0.7 * k);
    blade.quadraticCurveTo(rh + (rt - rh) * 0.5, -1.7 * k, rt, -0.5 * k);
    blade.quadraticCurveTo(rt + 0.25 * k, 0.9 * k, rt - 0.7 * k, 1.5 * k);
    blade.quadraticCurveTo(rh + (rt - rh) * 0.45, 1.4 * k, rh * 0.9, 0.8 * k);
    const bladeGeo = new THREE.ExtrudeGeometry(blade, { depth: 0.12 * k, bevelEnabled: false, curveSegments: 16 });
    for (let i = 0; i < 9; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / 9) * Math.PI * 2;
      const b = new THREE.Mesh(bladeGeo, M.bladePlastic);
      b.rotation.x = 0.5;
      pivot.add(b);
      rotor.add(pivot);
    }
    g.add(rotor);
    rotors.push(rotor);
    if (grill) {
      for (const rr of [0.18, 0.28, 0.38, 0.47]) {
        const ringG = new THREE.Mesh(new THREE.TorusGeometry(size * rr, 0.06 * k, 6, 64), M.nickel);
        ringG.position.z = depth / 2 + 0.3;
        g.add(ringG);
      }
      for (const a of [0, Math.PI / 2]) {
        const bar = box(size * 0.95, 0.12 * k, 0.12 * k, M.nickel);
        bar.rotation.z = a; bar.position.z = depth / 2 + 0.3;
        g.add(bar);
      }
    }
    return g;
  }

  /* A sleeved cable bundle along a path, with a connector at the far end. */
  function cable(points, { count = 4, gap = 0.62, radius = 0.28, dir = [1, 0, 0], plug = [2.2, 1.2, 1.2] } = {}) {
    const g = new THREE.Group();
    const off = new THREE.Vector3(...dir).normalize();
    for (let i = 0; i < count; i++) {
      const d = (i - (count - 1) / 2) * gap;
      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p).addScaledVector(off, d)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), M.cable));
    }
    const end = new THREE.Vector3(...points[points.length - 1]);
    g.add(at(box(...plug, M.plastic), end.x, end.y, end.z));
    return g;
  }

  /* ---------- the build ---------- */
  const pc = new THREE.Group();
  scene.add(pc);
  const parts = [];
  function part(obj, x, y, z, out, opts = {}) {
    obj.position.set(x, y, z);
    pc.add(obj);
    const id = opts.id || 'case';
    obj.traverse((m) => { m.userData.id = id; });
    parts.push({ obj, id, home: obj.position.clone(), out: new THREE.Vector3(...out), rot: opts.rot || null, at: opts.at || 0, label: opts.label || null, anchor: opts.anchor || [0, 0, 0] });
    return obj;
  }

  const W = 45, H = 46, D = 21, T = 0.8;

  // case: motherboard tray with rubber grommets
  const tray = new THREE.Group();
  tray.add(rbox(W, H, T, M.steel, 0.4));
  for (const gy of [9, 0, -9]) tray.add(at(rbox(1.4, 5.5, 0.4, M.rubber, 0.6), 7.5, gy, T / 2 + 0.1));
  part(tray, 0, 0, -D / 2, [0, 0, -14], { at: 0.05 });
  // top with a perforated dust filter
  const top = new THREE.Group();
  top.add(rbox(W, T, D, M.steel, 0.4));
  top.add(at(box(W - 8, 0.12, D - 6, M.mesh), 0, T / 2 + 0.06, 0));
  part(top, 0, H / 2, 0, [0, 15, 0], { at: 0.1 });
  // bottom with feet
  const bottom = new THREE.Group();
  bottom.add(rbox(W, T, D, M.steel, 0.4));
  for (const [fx, fz] of [[-18, -7], [18, -7], [-18, 7], [18, 7]]) bottom.add(at(cyl(1.6, 1.8, 1.4, M.rubber), fx, -1.1, fz));
  part(bottom, 0, -H / 2, 0, [0, -12, 0], { at: 0.1 });
  // front: perforated mesh in a solid frame, with a light strip
  const front = new THREE.Group();
  front.add(box(T * 0.6, H - 4, D - 4, M.mesh));
  for (const [y, h] of [[H / 2 - 1, 2], [-H / 2 + 1, 2]]) front.add(at(rbox(T, h, D, M.steel, 0.3), 0, y, 0));
  for (const z of [D / 2 - 1, -D / 2 + 1]) front.add(at(rbox(T, H, 2, M.steel, 0.3), 0, 0, z));
  front.add(at(box(0.3, H * 0.8, 0.5, M.led), T / 2 + 0.1, 0, D / 2 - 1.1));
  part(front, W / 2, 0, 0, [20, 0, 0], { at: 0.08 });
  // rear: exhaust mesh, I/O cut-out and expansion-slot covers
  const rearP = new THREE.Group();
  rearP.add(rbox(T, H, D, M.steel, 0.3));
  rearP.add(at(box(0.2, 12, 12, M.mesh), T / 2 + 0.05, 13, 0));
  rearP.add(at(box(0.2, 4.4, 15.6, M.plastic), T / 2 + 0.05, 2, -2));
  for (let i = 0; i < 7; i++) rearP.add(at(box(0.25, 1.5, 11.5, M.alu), T / 2 + 0.08, -4.5 - i * 2.03, 0.5));
  part(rearP, -W / 2, 0, 0, [-16, 0, 0], { at: 0.08 });
  // glass side
  const glass = new THREE.Mesh(new RoundedBoxGeometry(W - 0.4, H - 0.4, 0.5, 2, 0.24), M.glass);
  part(glass, 0, 0, D / 2, [-4, 0, 24], { id: 'glass', at: 0, label: 'Glass side panel', anchor: [-W / 2 + 10, H / 2 - 4, 0] });

  // fans: three intakes behind the front mesh, one exhaust at the back
  for (const y of [13, 0, -13]) {
    const f = fan(12);
    f.rotation.y = Math.PI / 2;
    part(f, W / 2 - 2.2, y, 0, [11, 0, 0], { id: 'fans', at: 0.15, label: y === 13 ? 'Case fans' : null, anchor: [0, 7, 0] });
  }
  const rearFan = fan(12);
  rearFan.rotation.y = -Math.PI / 2;
  part(rearFan, -W / 2 + 2.2, 13, 0, [-9, 0, 0], { id: 'fans', at: 0.15 });

  // motherboard and what is soldered to it
  const bx = -W / 2 + 2 + 12.2, by = H / 2 - 2.5 - 15.25, bz = -D / 2 + 1.2;
  const board = new THREE.Group();
  board.add(new THREE.Mesh(new THREE.BoxGeometry(24.4, 30.5, 0.16), [M.pcb, M.pcb, M.pcb, M.pcb, M.board, M.pcb]));
  // VRM heatsinks around the socket, finned
  const vrmTop = new THREE.Group();
  vrmTop.add(rbox(10.5, 2.2, 2.2, M.gunmetal, 0.2));
  for (let i = 0; i < 12; i++) vrmTop.add(at(box(0.2, 2.25, 0.9, M.alu), -4.8 + i * 0.87, 0, 1));
  board.add(at(vrmTop, -3.5, 8.6, 1.2));
  board.add(at(rbox(2.4, 9.5, 2.6, M.gunmetal, 0.2), -9.4, 3, 1.4));
  board.add(at(rbox(2.6, 9.6, 3.2, M.gunmetal, 0.3), -10.6, 10.2, 1.7)); // I/O shroud
  board.add(at(box(0.3, 9, 0.5, M.ledSoft), -9.25, 10.2, 3.35));
  // capacitors and chokes
  const capGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.9, 16);
  capGeo.rotateX(Math.PI / 2);
  const caps = new THREE.InstancedMesh(capGeo, M.cap, 18);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 18; i++) { mtx.makeTranslation(i < 10 ? -8 + i * 1.05 : -7.3, i < 10 ? 6.6 : 5.5 - (i - 10) * 1.05, 0.5); caps.setMatrixAt(i, mtx); }
  board.add(caps);
  // socket frame
  board.add(at(box(5.6, 5.6, 0.25, M.alu), -3, 4, 0.2));
  // memory slots and the 24-pin power socket
  for (let i = 0; i < 4; i++) board.add(at(box(0.55, 13.6, 0.9, i % 2 ? M.plastic : M.gunmetal), 5 + i * 1.3, 3, 0.5));
  board.add(at(rbox(1.3, 5.6, 1.5, M.plastic, 0.15), 11.2, 3, 0.8));
  // PCIe slots with steel armour
  for (const sy of [-8.3, -13]) board.add(at(rbox(9.2, 0.75, 1.1, M.alu, 0.12), -6.5, sy, 0.6));
  // chipset heatsink, battery, SATA ports
  board.add(at(rbox(4.6, 4.6, 0.9, M.gunmetal, 0.25), 6, -9.5, 0.55));
  board.add(at(box(2.2, 0.35, 0.95, M.ledSoft), 6, -11.6, 0.55));
  const battery = cyl(1, 1, 0.3, M.nickel, 32);
  battery.rotation.x = Math.PI / 2;
  board.add(at(battery, 1.5, -12.6, 0.25));
  for (let i = 0; i < 4; i++) board.add(at(box(0.9, 1.2, 0.8, M.plastic), 11.4, -6 - i * 1.5, 0.5));
  part(board, bx, by, bz, [0, 0, 2], { id: 'board', at: 0.2, label: 'Motherboard', anchor: [12.5, 1, 0] });

  // processor: substrate with gold pads, nickel lid with laser marking
  const cpu = new THREE.Group();
  cpu.add(at(box(4.5, 4.5, 0.12, M.gold), 0, 0, -0.2));
  cpu.add(at(box(4.4, 4.4, 0.16, M.pcb), 0, 0, -0.06));
  cpu.add(at(new THREE.Mesh(new RoundedBoxGeometry(3.8, 3.8, 0.4, 2, 0.12), [M.alu, M.alu, M.alu, M.alu, M.cpuTop, M.alu]), 0, 0, 0.22));
  part(cpu, bx - 3, by + 4, bz + 0.4, [-2, 1, 9], { id: 'cpu', at: 0.3, label: 'Processor', anchor: [0, -3.5, 0] });

  // tower cooler: copper base, nickel heat pipes through a stack of brushed fins, a capped top and its own fan
  const cooler = new THREE.Group();
  cooler.add(at(rbox(4.4, 4.4, 1, M.copper, 0.2), 0, 0, 0.5));
  for (let i = 0; i < 4; i++) {
    const x = -2.1 + i * 1.4;
    const curve = new THREE.CatmullRomCurve3([[x, -3.8, 11.6], [x, -3.8, 3.4], [x, -1.2, 1.1], [x, 1.2, 1.1], [x, 3.8, 3.4], [x, 3.8, 11.6]].map((p) => new THREE.Vector3(...p)));
    cooler.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.32, 12, false), M.nickel));
  }
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(12, 12, 0.09), M.alu, 30);
  for (let i = 0; i < 30; i++) { mtx.makeTranslation(0, 0, 2.8 + i * 0.3); fins.setMatrixAt(i, mtx); }
  cooler.add(fins);
  const cap = new THREE.Group();
  cap.add(rbox(12.4, 12.4, 0.6, M.gunmetal, 0.25));
  cap.add(at(box(12.4, 0.4, 0.3, M.led), 0, -6.1, 0.2));
  cooler.add(at(cap, 0, 0, 12.2));
  const coolerFan = fan(12);
  coolerFan.rotation.y = Math.PI / 2;
  coolerFan.position.set(7.3, 0, 7.2);
  cooler.add(coolerFan);
  part(cooler, bx - 3, by + 4, bz + 0.6, [-9, 13, 18], { id: 'cooler', at: 0.32, label: 'CPU cooler', anchor: [-4, 7, 7] });

  // memory: PCB with chips, gold contacts, aluminium spreaders, a lit diffuser on top
  const chipGeo = new THREE.BoxGeometry(0.1, 1.15, 0.95);
  for (let i = 0; i < 4; i++) {
    const stick = new THREE.Group();
    stick.add(box(0.12, 13.3, 3.1, M.pcb));
    const chips = new THREE.InstancedMesh(chipGeo, M.chip, 16);
    for (let c = 0; c < 16; c++) { mtx.makeTranslation(c < 8 ? 0.11 : -0.11, -5.4 + (c % 8) * 1.55, 0.1); chips.setMatrixAt(c, mtx); }
    stick.add(chips);
    stick.add(at(box(0.14, 12.8, 0.5, M.gold), 0, 0, -1.6));
    for (const sx of [0.32, -0.32]) stick.add(at(rbox(0.16, 13.4, 3.1, M.ram, 0.06), sx, 0, 0.3));
    stick.add(at(rbox(0.8, 13.4, 0.55, i % 2 ? M.led : M.ledSoft, 0.15), 0, 0, 2.05));
    part(stick, bx + 5 + i * 1.3, by + 3, bz + 1.9, [7 + i * 2.2, 15, 8], { id: 'memory', at: 0.36 + i * 0.03, label: i === 3 ? 'Memory' : null, anchor: [0, 8, 0] });
  }

  // M.2 drive: controller, two NAND packages, a label
  const ssd = new THREE.Group();
  ssd.add(box(8, 2.2, 0.08, M.pcb));
  ssd.add(at(box(0.6, 1.9, 0.09, M.gold), -3.9, 0, 0));
  ssd.add(at(box(1.5, 1.5, 0.18, M.chip), -2.6, 0, 0.12));
  ssd.add(at(box(2, 1.6, 0.16, M.chip), -0.5, 0, 0.12));
  ssd.add(at(box(2, 1.6, 0.16, M.chip), 1.7, 0, 0.12));
  ssd.add(at(new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.85), M.ssdLabel), 0.3, 0, 0.215));
  part(ssd, bx - 1, by - 4, bz + 0.3, [6, -3, 11], { id: 'storage', at: 0.4, label: 'Storage', anchor: [4, -2, 0] });

  // graphics card: fan plate with three fans, a visible fin stack, PCB, backplate, bracket, power socket
  const gpu = new THREE.Group();
  const plateShape = new THREE.Shape();
  plateShape.moveTo(-15, -6); plateShape.lineTo(15, -6); plateShape.lineTo(15, 6); plateShape.lineTo(-15, 6); plateShape.lineTo(-15, -6);
  const fanXs = [-9.6, 0, 9.6];
  for (const fx of fanXs) { const hp = new THREE.Path(); hp.absarc(fx, 0, 4.5, 0, Math.PI * 2, true); plateShape.holes.push(hp); }
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.8, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2, curveSegments: 48 });
  plateGeo.rotateX(Math.PI / 2);
  gpu.add(at(new THREE.Mesh(plateGeo, M.gunmetal), 0, -1.3, 0));
  for (const fx of fanXs) {
    const f = fan(9.2, { frame: false });
    f.rotation.x = Math.PI / 2;
    gpu.add(at(f, fx, -1.9, 0));
  }
  const gfins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 2.4, 11.2), M.alu, 88);
  for (let i = 0; i < 88; i++) { mtx.makeTranslation(-14 + i * 0.32, 0.05, 0); gfins.setMatrixAt(i, mtx); }
  gpu.add(gfins);
  for (const hz of [-2, 0, 2]) {
    const hp = cyl(0.3, 0.3, 28, M.nickel, 12);
    hp.rotation.z = Math.PI / 2;
    gpu.add(at(hp, 0, 0.1, hz));
  }
  gpu.add(at(box(28.5, 0.14, 11, M.pcb), 0, 1.45, -0.3));
  gpu.add(at(box(8, 0.15, 0.9, M.gold), -6, 1.45, -6.1));
  gpu.add(at(rbox(30, 0.3, 11.8, M.backplate, 0.12), 0, 1.75, 0));
  gpu.add(at(rbox(0.5, 4.2, 12, M.gunmetal, 0.15), 15, 0.2, 0));
  gpu.add(at(box(0.25, 4.6, 12.6, M.alu), -15.2, 0.1, 0));
  gpu.add(at(box(26, 0.45, 0.25, M.led), 1, -1.2, 6.15));
  gpu.add(at(rbox(2.4, 1.1, 1, M.plastic, 0.12), 9, 2.4, 4.4));
  part(gpu, -W / 2 + 15.8, by - 8.5, bz + 6.4, [-3, -11, 20], { id: 'gpu', at: 0.25, rot: [-0.75, 0, 0], label: 'Graphics card', anchor: [13, -4, 0] });

  // power supply: matte case, grilled fan underneath, a spec label, modular sleeved cables
  const psu = new THREE.Group();
  psu.add(rbox(16, 8.6, 15, M.steelInner, 0.5));
  const psuFan = fan(12, { frame: false, lit: false, grill: true });
  psuFan.rotation.x = Math.PI / 2;
  psu.add(at(psuFan, 0, -4.1, 0));
  psu.add(at(new THREE.Mesh(new THREE.PlaneGeometry(10.5, 6.5), M.psuLabel), 0, 0.2, 7.52));
  for (let i = 0; i < 6; i++) psu.add(at(box(0.3, 1.4, 1.8, M.plastic), 8.05, 2.2 - Math.floor(i / 3) * 2, -4.5 + (i % 3) * 3));
  psu.add(cable([[6, 4.3, -3], [8, 9, -4], [12, 18, -7], [16.4, 23.8, -8.6]], { count: 6, dir: [0, 0, 1], plug: [1.4, 5.4, 1.6] }));
  psu.add(cable([[4, 4.3, 3], [6, 9, 3], [9, 14, 1.5], [11.4, 16.9, -0.4]], { count: 3, dir: [0, 0, 1], plug: [2.4, 1.2, 1.1] }));
  part(psu, -W / 2 + 9.2, -H / 2 + 5.2, 0, [-12, -19, 10], { id: 'psu', at: 0.2, label: 'Power supply', anchor: [-6, -5, 0] });

  // everything casts and catches shadows, except the glass
  pc.traverse((m) => { if (m.isMesh) { m.castShadow = m.material !== M.glass; m.receiveShadow = true; } });
  pc.rotation.set(0.18, -0.55, 0);

  /* ---------- what each part does ---------- */
  const INFO = {
    glass: ['Glass side panel', 'Tempered glass so the build is on show. We route every cable behind the tray, so the view stays clean.'],
    case: ['Case', 'The frame that holds it all. We choose cases for airflow first and looks second, with room to upgrade later.'],
    fans: ['Case fans', 'Pull cool air in at the front and push warm air out the back. We tune the fan curves so it stays quiet at your desk.'],
    board: ['Motherboard', 'The board every part plugs into. We pick one with the ports, Wi-Fi and upgrade room you will actually use.'],
    cpu: ['Processor', 'The CPU runs everything you do. Gaming builds favour fast cores; editing and workstation builds favour more of them.'],
    cooler: ['CPU cooler', 'Keeps the processor cool and quiet under load. Every build runs a 24-hour stress test before it leaves the shop.'],
    memory: ['Memory', 'RAM holds what you are working on right now. 32 GB covers most people; video editing and 3D want 64 GB or more.'],
    storage: ['Storage', 'The NVMe SSD where Windows, games and files live. It boots in seconds, and we set up backups so nothing is lost.'],
    gpu: ['Graphics card', 'Draws every frame in games and speeds up video and AI work. Usually the biggest single part of the budget.'],
    psu: ['Power supply', 'Feeds steady power to every part. We size it with headroom and fit 80+ Gold or better, never a no-name unit.'],
  };

  /* ---------- labels: buttons, so the parts can be reached with a keyboard too ---------- */
  const labels = parts.filter((p) => p.label).map((p) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'stage__label';
    el.textContent = p.label;
    el.setAttribute('aria-label', `${INFO[p.id][0]}: ${INFO[p.id][1]}`);
    el.addEventListener('pointerenter', () => { if (!pinned) showPart(p.id, el); });
    el.addEventListener('focus', () => { holding = true; showPart(p.id, el); kick(); });
    el.addEventListener('blur', () => { if (!pointerInside) { holding = false; pinned = null; showPart(null); resumeFromHold(); } });
    el.addEventListener('click', () => { pinned = pinned === p.id ? null : p.id; holding = true; showPart(p.id, el); kick(); });
    labelLayer.append(el);
    return { p, el };
  });

  const card = document.createElement('div');
  card.className = 'stage__card';
  card.setAttribute('aria-hidden', 'true');
  card.innerHTML = '<strong></strong><p></p>';
  stage.append(card);

  /* ---------- highlight: the part under the pointer glows purple ---------- */
  const glowCache = new WeakMap();
  const glow = (m) => {
    if (!glowCache.has(m)) {
      const g = m.clone();
      if (g.emissive && g.emissive.getHex() === 0) { g.emissive = new THREE.Color(0x7c4dff); g.emissiveIntensity = 0.5; } // leave the lights alone
      if (g.transparent) g.opacity = 0.3;
      glowCache.set(m, g);
    }
    return glowCache.get(m);
  };
  let hovered = null;
  function highlight(id) {
    pc.traverse((m) => {
      if (!m.isMesh) return;
      if (!m.userData.base) m.userData.base = m.material;
      const base = m.userData.base;
      m.material = m.userData.id === id ? (Array.isArray(base) ? base.map(glow) : glow(base)) : base;
    });
  }
  let cardX = 0, cardY = 0;
  function showPart(id, near) {
    if (id !== hovered) { hovered = id; highlight(id); }
    if (!id) { card.classList.remove('is-on'); if (!running) draw(); return; }
    card.querySelector('strong').textContent = INFO[id][0];
    card.querySelector('p').textContent = INFO[id][1];
    if (near) {
      const r = near.getBoundingClientRect(), st = stage.getBoundingClientRect();
      cardX = r.left - st.left;
      cardY = r.bottom - st.top + 8;
    }
    placeCard();
    card.classList.add('is-on');
    if (!running) draw();
  }
  function placeCard() {
    const w = card.offsetWidth || 300, h = card.offsetHeight || 120;
    const x = Math.min(width - w - 12, Math.max(12, cardX));
    const y = Math.min(height - h - 64, Math.max(12, cardY));
    card.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
  }

  /* ---------- rendering: the scene, then a soft glow on anything lit ---------- */
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.1, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- sizing ---------- */
  let width = 1, height = 1;
  const fit = () => {
    const r = stage.getBoundingClientRect();
    width = Math.max(1, r.width);
    height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    camera.aspect = width / height;
    // keep the fully exploded build in frame whatever the shape of the stage
    const radius = 56;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distV = radius / Math.tan(vFov / 2);
    const distH = radius / (Math.tan(vFov / 2) * camera.aspect);
    const dist = Math.max(distV, distH) * 0.98;
    camera.position.set(0, 6, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    draw();
  };
  new ResizeObserver(fit).observe(stage);

  /* ---------- the cycle: together, apart, hold, together ---------- */
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const CYCLE = 11; // seconds
  const phase = (time) => {
    const u = (time % CYCLE) / CYCLE;
    if (u < 0.12) return 0;                     // assembled
    if (u < 0.42) return (u - 0.12) / 0.3;      // coming apart
    if (u < 0.74) return 1;                     // apart, labelled
    if (u < 0.96) return 1 - (u - 0.74) / 0.22; // going back
    return 0;
  };

  let explode = 0;
  const tmp = new THREE.Vector3();
  function applyExplode(t) {
    for (const p of parts) {
      const s = p.at * 0.6; // later parts start a little later
      const local = ease(clamp01((t - s) / (1 - s)));
      p.obj.position.copy(p.home).addScaledVector(p.out, local);
      if (p.rot) p.obj.rotation.set(p.rot[0] * local, p.rot[1] * local, p.rot[2] * local);
    }
    M.glass.opacity = 0.2 - 0.08 * t;
  }

  function placeLabels(t) {
    const show = width > 700;
    for (const { p, el } of labels) {
      const local = clamp01((t - 0.75) / 0.25);
      if (!show || local <= 0) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; continue; }
      tmp.set(...p.anchor);
      p.obj.localToWorld(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      const half = el.offsetWidth / 2 + 10, halfH = el.offsetHeight / 2 + 10; // keep labels inside the stage
      const cx = Math.min(width - half, Math.max(half, x)), cy = Math.min(height - halfH - 56, Math.max(halfH, y));
      el.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      el.style.opacity = String(local);
      el.style.pointerEvents = local > 0.5 ? 'auto' : 'none';
    }
  }

  /* ---------- pointing at parts ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(pc, true);
    const solid = hits.find((h) => h.object.userData.id !== 'glass'); // look through the glass to what is behind it
    return (solid || hits[0])?.object.userData.id || null;
  }
  let holding = false, pointerInside = false, pinned = null;
  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { pointerInside = true; holding = true; kick(); } });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { pointerInside = false; holding = false; pinned = null; showPart(null); resumeFromHold(); } });

  /* ---------- turning it by hand ---------- */
  let yaw = 0, pitch = 0, vYaw = 0, dragging = false, moved = 0, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) {
      if (e.pointerType !== 'mouse' || pinned) return;
      const id = pick(e.clientX, e.clientY);
      const st = stage.getBoundingClientRect();
      cardX = e.clientX - st.left + 18; cardY = e.clientY - st.top + 18;
      showPart(id);
      canvas.style.cursor = id ? 'pointer' : '';
      return;
    }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    vYaw = dx * 0.008;
    yaw += vYaw;
    pitch = Math.max(-0.35, Math.min(0.45, pitch + dy * 0.004));
    if (!running) draw();
  });
  const release = (e) => {
    dragging = false; stage.classList.remove('is-dragging');
    if (e.type !== 'pointerup' || moved > 8) return;
    // a click or tap without dragging pins that part's card; tapping empty space lets go
    const id = pick(e.clientX, e.clientY);
    const st = stage.getBoundingClientRect();
    cardX = e.clientX - st.left + 18; cardY = e.clientY - st.top + 18;
    pinned = id;
    holding = !!id || pointerInside;
    showPart(id);
    if (!holding) resumeFromHold();
    kick();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  /* ---------- play, pause, and only run while on screen ---------- */
  let paused = reduce.matches;
  let visible = true;
  let running = false;
  let clock = 0, last = 0;
  const setToggle = () => { toggle.textContent = paused ? 'Play' : 'Pause'; toggle.setAttribute('aria-pressed', String(paused)); };
  setToggle();
  toggle.addEventListener('click', () => { paused = !paused; setToggle(); kick(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; setToggle(); kick(); });
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; kick(); }).observe(stage);
  document.addEventListener('visibilitychange', kick);

  function draw() {
    applyExplode(explode);
    pc.rotation.y = -0.55 + yaw + (paused ? 0 : Math.sin(clock * 0.25) * 0.18);
    pc.rotation.x = 0.18 + pitch;
    composer.render();
    placeLabels(explode);
  }

  // after a hover, carry on from wherever the build is: apart → hold, half apart → keep opening
  function resumeFromHold() {
    clock = (explode >= 1 ? 0.5 : 0.12 + 0.3 * explode) * CYCLE;
    kick();
  }

  // if frames are slow, drop resolution once, then the glow, so the page stays smooth
  let slowFrames = 0, degraded = 0;
  function watchSpeed(dt) {
    if (dt > 0.034) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames < 45 || degraded > 1) return;
    slowFrames = 0;
    degraded++;
    if (degraded === 1) { pixelRatio = 1; renderer.setPixelRatio(1); fit(); }
    else { bloom.enabled = false; }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    watchSpeed(dt);
    if (holding) {
      explode = reduce.matches ? 1 : Math.min(1, explode + dt * 1.1); // open up while someone is looking
    } else if (!paused) {
      clock += dt;
      explode = phase(clock);
    }
    if (!paused) for (const r of rotors) r.rotation.z += dt * 6;
    if (!dragging && Math.abs(vYaw) > 0.0001) { yaw += vYaw; vYaw *= 0.92; }
    draw();
    const settling = holding && explode < 1;
    if (paused && !dragging && !settling && Math.abs(vYaw) < 0.0001) { running = false; return; }
    requestAnimationFrame(frame);
  }

  function kick() {
    const should = visible && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!should) running = false;
    if (should && paused) draw();
  }

  // reduced motion: show it apart and labelled, still. ?pc=apart or ?pc=together freezes a pose (handy for screenshots).
  const pose = new URLSearchParams(location.search).get('pc');
  if (pose) { paused = true; setToggle(); }
  if (pose === 'together') { explode = 0; }
  else if (paused) { clock = CYCLE * 0.6; explode = 1; }
  else { clock = CYCLE * 0.05; }
  fit();
  stage.classList.add('is-live');
  kick();
}

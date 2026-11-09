// ═════════════ SOLAR · how a home solar system works, as a blueprint that builds itself and then runs ═════════════
// One persistent world (house in section + roof panels + carport + utility pole), vector geometry in WORLD px, a camera that
// travels between stations, energy as beads (amber direct current: one way · cyan alternating current: oscillates), white
// chevrons for the DIRECTION power travels on the grid line, time of day (day · noon · night · blackout day) on the background.
// Every time comes from a word index of build/words.json (kit/solar/tiempos.json).
(() => {
  const wi = i => (WORDS[i] ? WORDS[i].s : 0);
  const INK = '#E6F6FF', DC = '255,176,32', AC = '63,213,255', DIM = 'rgba(230,246,255,0.5)', ACCENT = '#2BD9A0', RED = '255,84,72';
  // ── story times ──
  const T = {
    hookQ: wi(10), sun: wi(14), dcLab: wi(24), wired: wi(26), cable: wi(35) - 0.1, single: wi(38),
    acLab: wi(45), invBuild: wi(53) - 0.1, invLab: wi(53), conv: wi(57), dcac: wi(58),
    acOut: wi(63), breaker: wi(71) - 0.1, lights: wi(78), fridge: wi(80), aircon: wi(83),
    plug: wi(85), aircon2: wi(91), cantKeep: wi(98), grid: wi(102), morePanels: wi(114) - 0.1, bigger: wi(120), limit: wi(125),
    noon: wi(134), more: wi(138), out: wi(145), meter: wi(155) - 0.1,
    night: wi(160), stop: wi(162), battery: wi(174), stores: wi(177), without: wi(183), pull: wi(186),
    blackout: wi(193), shuts: wi(193) + 0.35, workers: wi(204), only: wi(208), hybrid: wi(212), keep: wi(214), know: wi(218), send: wi(223),
  };
  const isNight = t => t >= T.night && t < T.blackout - 0.6;
  const nightK = t => clamp((t - T.night + 0.2) / 0.8) * (1 - clamp((t - T.blackout + 0.6) / 0.6));

  // ── geometry (world) ──
  const ROOF = { tl: [270, 830], tr: [810, 830], br: [935, 1040], bl: [145, 1040] };
  const rp = (u, v) => { const L = [lerp(ROOF.tl[0], ROOF.bl[0], v), lerp(ROOF.tl[1], ROOF.bl[1], v)], R = [lerp(ROOF.tr[0], ROOF.br[0], v), lerp(ROOF.tr[1], ROOF.br[1], v)]; return [lerp(L[0], R[0], u), lerp(L[1], R[1], u)]; };
  const INV = { cx: 760, cy: 1220, w: 120, h: 180 };
  const BRK = { x: 560, y: 1180, w: 80, h: 120 };
  const JBOX = [885, 1006], POLE = [1040, 870];
  const BATT = { x: 700, y: 1385, w: 160, h: 85 };
  const METER = { x: 912, y: 1128, w: 42, h: 56 };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  const DC_MAIN = [JBOX, [885, 1090], [760, 1090], [760, 1105]];
  const DC_JOIN = [[760, 1105], [760, 1130]];
  const DC_CARPORT = [[125, 1166], [200, 1166], [200, 1098], [745, 1098], [752, 1092]];
  const AC_INV_BRK = [[700, 1220], [640, 1220]];
  const C_LAMP = [[600, 1180], [600, 1075], [520, 1075], [520, 1092]];
  const C_AIR1 = [[520, 1075], [275, 1075], [275, 1098]];
  const C_AIR2 = [[420, 1075], [420, 1098]];
  const C_FRIDGE = [[560, 1285], [345, 1285]];
  const GRID_IN = [[905, 1156], [930, 1156], [930, 1495], [600, 1495], [600, 1300]];      // meter → under the floor → breaker
  const SERVICE = [[POLE[0], POLE[1] + 40], [985, 1000], [930, 1128]];                        // pole → house
  const BATT_LINK = [[760, 1310], [760, 1385]];

  // ── strokes ──
  const S = [];
  const add = (pts, t0, dur, o = {}) => S.push(Object.assign({ pts, t0, dur }, o));
  // hook: house, roof, panels, pole drawn fast
  add([ROOF.bl, ROOF.tl, ROOF.tr, ROOF.br, ROOF.bl], 0.0, 0.5, { lw: 4 });
  add([[ROOF.bl[0], ROOF.bl[1] + 14], [ROOF.br[0], ROOF.br[1] + 14]], 0.25, 0.3, { lw: 3 });
  const PANELS = [];
  [[0.12, 0.47], [0.54, 0.89]].forEach(([v0, v1], r) => {
    for (let c = 0; c < 4; c++) {
      const u0 = 0.08 + c * 0.21, u1 = u0 + 0.19, k = r * 4 + c, t0 = 0.35 + k * 0.07;
      const q = [rp(u0, v0), rp(u1, v0), rp(u1, v1), rp(u0, v1)]; PANELS.push(q);
      add([...q, q[0]], t0, 0.3, { lw: 3.2 });
      for (let j = 1; j < 4; j++) add([rp(lerp(u0, u1, j / 4), v0), rp(lerp(u0, u1, j / 4), v1)], t0 + 0.2, 0.15, { lw: 1.3, col: DIM });
      add([rp(u0, (v0 + v1) / 2), rp(u1, (v0 + v1) / 2)], t0 + 0.25, 0.15, { lw: 1.3, col: DIM });
    }
  });
  add([[0, 1480], [1120, 1480]], 0.6, 0.6, { lw: 3, col: DIM });
  add([[175, 1480], [175, 1046], [905, 1046], [905, 1480]], 0.7, 0.8, { lw: 4 });
  add([[195, 1480], [195, 1066], [885, 1066], [885, 1480]], 0.85, 0.7, { lw: 2, col: DIM });
  add([[175, 1500], [905, 1500]], 1.0, 0.4, { lw: 3 });
  add([[POLE[0], 1480], POLE], 1.1, 0.5, { lw: 5 });
  add([[POLE[0] - 50, POLE[1] + 20], [POLE[0] + 50, POLE[1] + 20]], 1.4, 0.25, { lw: 4 });
  add([[POLE[0] + 50, POLE[1] + 20], [1180, POLE[1] + 40]], 1.6, 0.3, { lw: 2, col: DIM });
  add(SERVICE, 1.6, 0.5, { lw: 2.5 });
  // wiring between panels ("wired together")
  for (let r = 0; r < 2; r++) { const v = r ? 0.89 : 0.47; add([rp(0.08, v + 0.015), rp(0.92, v + 0.015)], T.wired + r * 0.15, 0.6, { lw: 2.6, col: `rgb(${DC})` }); }
  add([rp(0.92, 0.485), rp(0.95, 0.485), rp(0.95, 0.905), JBOX], T.wired + 0.5, 0.4, { lw: 2.6, col: `rgb(${DC})` });
  add(rect(JBOX[0] - 14, JBOX[1] - 12, 28, 24), T.wired + 0.7, 0.2, { lw: 3 });
  add(DC_MAIN, T.cable, 0.9, { lw: 5, col: `rgb(${DC})`, glow: `rgba(${DC},0.9)` });
  add(DC_JOIN, T.conv - 0.25, 0.2, { lw: 5, col: `rgb(${DC})`, glow: `rgba(${DC},0.9)` });
  add(AC_INV_BRK, T.acOut, 0.35, { lw: 5, col: `rgb(${AC})`, glow: `rgba(${AC},0.9)` });
  add(rect(BRK.x, BRK.y, BRK.w, BRK.h), T.breaker, 0.45, { lw: 3.4 });
  for (let k = 0; k < 4; k++) add([[BRK.x + 16, BRK.y + 22 + k * 24], [BRK.x + BRK.w - 16, BRK.y + 22 + k * 24]], T.breaker + 0.3 + k * 0.06, 0.12, { lw: 2.4, col: DIM });
  // lamp
  add(C_LAMP, T.lights - 0.35, 0.35, { lw: 4, col: `rgb(${AC})`, glow: `rgba(${AC},0.8)` });
  add([[520, 1092], [520, 1120]], T.lights - 0.05, 0.1, { lw: 2.4 });
  add([[490, 1120], [550, 1120], [570, 1156], [470, 1156], [490, 1120]], T.lights, 0.25, { lw: 3 });
  // fridge
  add(C_FRIDGE, T.fridge - 0.3, 0.3, { lw: 4, col: `rgb(${AC})`, glow: `rgba(${AC},0.8)` });
  add(rect(230, 1250, 112, 228), T.fridge, 0.35, { lw: 3.2 });
  add([[230, 1320], [342, 1320]], T.fridge + 0.2, 0.12, { lw: 2.2 });
  // air conditioner 1 (wall split unit)
  add(C_AIR1, T.aircon - 0.35, 0.35, { lw: 4, col: `rgb(${AC})`, glow: `rgba(${AC},0.8)` });
  add(rect(215, 1098, 120, 46), T.aircon, 0.35, { lw: 3.2 });
  add([[228, 1132], [322, 1132]], T.aircon + 0.25, 0.12, { lw: 2, col: DIM });
  // air conditioner 2
  add(C_AIR2, T.aircon2 - 0.3, 0.3, { lw: 4, col: `rgb(${AC})`, glow: `rgba(${AC},0.8)` });
  add(rect(360, 1098, 120, 46), T.aircon2, 0.35, { lw: 3.2 });
  add([[373, 1132], [467, 1132]], T.aircon2 + 0.25, 0.12, { lw: 2, col: DIM });
  // grid inside the house
  add(GRID_IN, T.grid - 0.15, 0.8, { lw: 4, col: `rgb(${AC})`, glow: `rgba(${AC},0.8)` });
  // carport + 4 more panels
  add([[-200, 1480], [-200, 1185]], T.morePanels, 0.3, { lw: 3.4 }); add([[120, 1480], [120, 1185]], T.morePanels + 0.05, 0.3, { lw: 3.4 });
  add([[-220, 1185], [140, 1185]], T.morePanels + 0.2, 0.3, { lw: 3.4 });
  for (let k = 0; k < 4; k++) { const x0 = -205 + k * 85; add([[x0, 1176], [x0 + 75, 1176], [x0 + 85, 1150], [x0 + 10, 1150], [x0, 1176]], T.morePanels + 0.35 + k * 0.1, 0.25, { lw: 3 }); }
  add(DC_CARPORT, T.morePanels + 0.75, 0.6, { lw: 4, col: `rgb(${DC})`, glow: `rgba(${DC},0.8)` });
  // meter
  add(rect(METER.x, METER.y, METER.w, METER.h), T.meter, 0.35, { lw: 3 });
  // battery bank
  add(BATT_LINK, T.battery - 0.2, 0.25, { lw: 4.5, col: `rgb(${DC})`, glow: `rgba(${DC},0.8)`, batt: true });
  add(rect(BATT.x, BATT.y, BATT.w, BATT.h), T.battery, 0.4, { lw: 3.4, batt: true });
  for (let k = 1; k < 3; k++) add([[BATT.x + k * BATT.w / 3, BATT.y], [BATT.x + k * BATT.w / 3, BATT.y + BATT.h]], T.battery + 0.3, 0.12, { lw: 2.2, col: DIM, batt: true });

  // ── sound ──
  cue(0.05, 'swoosh', -12); cue(T.sun, 'shimmer', -10); cue(T.wired, 'tick', -12); cue(T.cable, 'swoosh', -12);
  cue(T.invBuild, 'tick', -10); cue(T.conv, 'shimmer', -6); cue(T.breaker, 'click', -8); cue(T.lights, 'pop', -10); cue(T.fridge, 'pop', -12); cue(T.aircon, 'pop', -12);
  cue(T.aircon2, 'pop', -8); cue(T.grid, 'whoosh', -10); cue(T.morePanels, 'tick', -10); cue(T.bigger, 'pop', -8); cue(T.limit, 'ding', -10);
  cue(T.noon, 'shimmer', -8); cue(T.out, 'whoosh', -10); cue(T.meter, 'click', -8); cue(T.night, 'whoosh', -10);
  cue(T.battery, 'pop', -6); cue(T.without, 'thud', -10); cue(T.blackout, 'thud', -4); cue(T.shuts, 'click', -6); cue(wi(198), 'thud', -12); cue(T.workers, 'pop', -10);
  cue(T.only, 'riser', -10); cue(T.keep, 'shimmer', -4); cue(T.send, 'pop', -8);

  // ── camera keys [t, x, y, z] ──
  const K0 = [540, 1090, 0.85];
  const KEYS = [[0, ...K0], [4.6, 540, 1090, 0.88], [5.4, 560, 960, 1.25], [13.6, 590, 990, 1.22], [14.6, 690, 1180, 1.3], [18.2, 640, 1150, 1.18], [19.9, 740, 1210, 1.45], [22.6, 700, 1195, 1.38],
    [23.4, 560, 1220, 1.25], [26.9, 470, 1190, 1.15], [29.6, 400, 1190, 1.2], [30.4, 430, 1140, 1.1], [33.4, 520, 1120, 0.98], [36.2, 640, 1150, 0.95], [38.3, 560, 1120, 0.9], [39.0, 430, 1060, 0.8], [40.8, 430, 1060, 0.8],
    [41.4, 720, 1220, 1.3], [45.8, 720, 1220, 1.32], [46.6, 600, 1090, 0.85], [49.6, 520, 1000, 1.0], [52.4, 820, 1130, 1.1], [54.4, 640, 1090, 0.9], [58.4, 600, 1100, 0.87], [59.1, 700, 1300, 1.15],
    [61.9, 700, 1300, 1.17], [62.6, 600, 1090, 0.85], [64.2, 600, 1090, 0.85], [64.8, 620, 1060, 0.85], [67.2, 760, 1200, 1.2], [69.3, 860, 1020, 1.0], [70.8, 700, 1080, 0.9], [71.5, 690, 1260, 1.08],
    [74.4, 690, 1260, 1.1], [75.4, 520, 1090, 0.8], [99, 520, 1090, 0.78]];
  const PUNCH = [T.hookQ, T.sun, T.dcLab, T.wired, T.single, T.acLab, T.invLab, T.conv, T.breaker, T.lights, T.fridge, T.aircon, T.aircon2, T.cantKeep, T.grid, T.morePanels + 0.4, T.bigger, T.limit + 0.3, T.noon, T.out, T.meter + 0.2, T.night, T.stop, T.battery, T.without, T.pull, T.blackout, T.shuts, T.workers, T.only, T.hybrid, T.keep, T.send];
  function cam(t) {
    let i = 0; while (i + 1 < KEYS.length && t >= KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)], u = E.inOutCubic(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
    let z = lerp(a[3], b[3], u), x = lerp(a[1], b[1], u), y = lerp(a[2], b[2], u);
    for (const p of PUNCH) { const d = t - p; if (d >= 0 && d < 0.9) z *= 1 + 0.09 * Math.exp(-d * 5) * Math.sin(d * 18 + 1.2); }
    x += 14 * Math.sin(t * 0.55) + 6 * Math.sin(t * 1.7); y += 10 * Math.cos(t * 0.43) + 5 * Math.sin(t * 1.3); z *= 1 + 0.018 * Math.sin(t * 0.37);
    return { x, y, z };
  }

  // ── helpers ──
  function lens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
  function at(P, L, d) { d = clamp(d, 0, L[L.length - 1]); for (let i = 1; i < P.length; i++) if (d <= L[i]) { const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; } const n = P.length - 1; return [P[n][0], P[n][1], 0]; }
  function partial(K, s, p) {
    const L = s._L || (s._L = lens(s.pts)), d = L[L.length - 1] * p;
    K.beginPath(); K.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) { if (L[i] <= d) K.lineTo(s.pts[i][0], s.pts[i][1]); else { const q = at(s.pts, L, d); K.lineTo(q[0], q[1]); break; } }
    K.lineWidth = s.lw || 3; K.strokeStyle = s.col || INK; K.lineCap = 'round'; K.lineJoin = 'round';
    K.shadowColor = s.glow || 'rgba(170,225,255,0.75)'; K.shadowBlur = s.glow ? 16 : 9; K.stroke(); K.shadowBlur = 0;
    return p < 1 ? at(s.pts, L, d) : null;
  }
  function tip(K, x, y, z) { const r = 22 / z, g = K.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,240,255,0.8)'); g.addColorStop(1, 'rgba(160,220,255,0)'); K.fillStyle = g; K.beginPath(); K.arc(x, y, r, 0, TAU); K.fill(); }
  function bead(K, x, y, col, r, a = 1) {
    if (a <= 0.01) return;
    const g = K.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, `rgba(255,255,240,${0.95 * a})`); g.addColorStop(0.3, `rgba(${col},${0.85 * a})`); g.addColorStop(1, `rgba(${col},0)`);
    K.fillStyle = g; K.beginPath(); K.arc(x, y, r * 2.4, 0, TAU); K.fill();
  }
  const PL = new Map(); const pl = P => { if (!PL.has(P)) PL.set(P, lens(P)); return PL.get(P); };
  function dcBeads(K, P, t, a, sp = 190, gap = 70) { if (a <= 0) return; const L = pl(P), tot = L[L.length - 1]; for (let d = (t * sp) % gap; d < tot; d += gap) { const q = at(P, L, d); bead(K, q[0], q[1], DC, 7, a * clamp((tot - d) / 25)); } }
  function acBeads(K, P, t, a, amp = 14) { if (a <= 0) return; const L = pl(P), tot = L[L.length - 1], off = amp * Math.sin(t * TAU * 1.3); for (let d = 26; d < tot - 16; d += 58) { const q = at(P, L, d + off); bead(K, q[0], q[1], AC, 6.5, a); } }
  function chevrons(K, P, t, a, dir = 1, col = '#FFFFFF') {          // direction of power along P (dir 1 = P order, -1 = reverse)
    if (a <= 0) return; const L = pl(P), tot = L[L.length - 1];
    for (let d = (t * 120) % 90; d < tot; d += 90) {
      const dd = dir > 0 ? d : tot - d, q = at(P, L, dd);
      K.save(); K.translate(q[0], q[1]); K.rotate(q[2] + (dir > 0 ? 0 : Math.PI)); K.globalAlpha = a; K.strokeStyle = col; K.lineWidth = 5; K.lineCap = 'round'; K.lineJoin = 'round';
      K.beginPath(); K.moveTo(-9, -13); K.lineTo(5, 0); K.lineTo(-9, 13); K.stroke(); K.restore();
    }
  }
  const win = (t, a, b, f = 0.3) => clamp((t - a) / f) * (1 - clamp((t - b) / f));

  // ── inverter (blueprint build → materialize; scales up on "bigger"; screen state) ──
  function inverter(K, t, z) {
    if (t < T.invBuild) return;
    const sc = lerp(1, 1.25, E.outBack ? E.outBack(clamp((t - T.bigger) / 0.5)) : E.outCubic(clamp((t - T.bigger) / 0.5)));
    const w = INV.w * sc, h = INV.h * sc, x = INV.cx - w / 2, y = INV.cy - h / 2;
    const pb = E.outCubic(clamp((t - T.invBuild) / 0.5));
    const m = clamp((t - T.conv + 0.05) / 0.45);
    if (m < 1) { K.save(); K.globalAlpha = 1; partial(K, { pts: rect(x, y, w, h), lw: 4 }, pb); K.restore(); }
    if (m > 0) {
      const front = y + h * E.outCubic(m);
      K.save(); K.beginPath(); K.rect(x - 10, y - 10, w + 20, front - y + 10); K.clip();
      K.shadowColor = 'rgba(0,0,0,0.45)'; K.shadowBlur = 24; K.shadowOffsetY = 10;
      const g = K.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#F7FAFC'); g.addColorStop(1, '#C9D4DE'); fillRR(K, x, y, w, h, 12, g);
      K.shadowBlur = 0; K.shadowOffsetY = 0; strokeRR(K, x, y, w, h, 12, '#8FA3B5', 2.5);
      const off = t >= T.shuts && t < T.only + 0.3;
      fillRR(K, x + w * 0.17, y + h * 0.16, w * 0.66, h * 0.26, 6, off ? '#3A0F12' : '#0E1B2A');
      if (off) text(K, 'OFF', x + w / 2, y + h * 0.16 + h * 0.18, { font: F.grot, weight: 700, size: 26 * sc, color: `rgb(${RED})` });
      else { K.strokeStyle = `rgb(${AC})`; K.lineWidth = 3; K.beginPath(); for (let i = 0; i <= 30; i++) { const xx = x + w * 0.23 + i * w * 0.0177, yy = y + h * 0.29 - 10 * sc * Math.sin(i / 30 * TAU * 1.5 - t * 5); i ? K.lineTo(xx, yy) : K.moveTo(xx, yy); } K.stroke(); }
      circle(K, x + w * 0.35, y + h * 0.56, 6, off ? `rgb(${RED})` : '#46E08A'); circle(K, x + w * 0.52, y + h * 0.56, 6, '#2F3B48');
      fillRR(K, x, y + h - 34, w, 12, 0, ACCENT);
      K.restore();
      if (m < 1) { const gr = K.createLinearGradient(0, front - 14, 0, front + 6); gr.addColorStop(0, 'rgba(230,246,255,0)'); gr.addColorStop(1, 'rgba(230,246,255,0.95)'); K.fillStyle = gr; K.fillRect(x - 16, front - 14, w + 32, 20); }
      const fl = t - T.conv; if (fl > 0 && fl < 0.7) { K.save(); K.globalAlpha = 1 - fl / 0.7; K.strokeStyle = INK; K.lineWidth = 4 / z; K.beginPath(); K.arc(INV.cx, INV.cy, 60 + fl * 260, 0, TAU); K.stroke(); K.restore(); }
    }
    // power-limit gauge
    const lg = win(t, T.limit - 0.1, T.noon - 0.4);
    if (lg > 0) {
      const gx = INV.cx + w / 2 + 26, gy = INV.cy - h / 2, gh = h, f = clamp((t - T.limit) / 1.4);
      K.save(); K.globalAlpha = lg; strokeRR(K, gx, gy, 26, gh, 8, INK, 3);
      const lvl = Math.min(0.82, f * 1.1) + (f >= 0.75 ? 0.01 * Math.sin(t * 30) : 0);
      fillRR(K, gx + 4, gy + gh - 4 - (gh - 8) * lvl, 18, (gh - 8) * lvl, 5, f >= 0.74 ? `rgb(${RED})` : `rgb(${AC})`);
      line(K, gx - 8, gy + gh * 0.18, gx + 34, gy + gh * 0.18, `rgb(${RED})`, 4); K.restore();
    }
  }

  // ── loads: on/off glow ──
  function loadsOn(t) { return !(t >= T.shuts && t < T.keep); }
  function loads(K, t) {
    const on = loadsOn(t) ? 1 : 0.15;
    if (t >= T.lights) { const a = clamp((t - T.lights) / 0.3) * on; const g = K.createRadialGradient(520, 1160, 4, 520, 1200, 150); g.addColorStop(0, `rgba(255,226,140,${0.55 * a})`); g.addColorStop(1, 'rgba(255,226,140,0)'); K.fillStyle = g; K.beginPath(); K.moveTo(470, 1156); K.lineTo(570, 1156); K.lineTo(640, 1330); K.lineTo(400, 1330); K.closePath(); K.fill(); circle(K, 520, 1162, 9, `rgba(255,236,170,${0.4 + 0.6 * a})`); }
    if (t >= T.fridge) { const a = clamp((t - T.fridge) / 0.3) * on; circle(K, 252, 1270, 6, `rgba(70,224,138,${a})`); }
    const air = (x, t0) => { if (t < t0) return; const a = clamp((t - t0) / 0.3) * on; K.save(); K.globalAlpha = a; K.strokeStyle = `rgba(${AC},0.8)`; K.lineWidth = 2.5; for (let k = 0; k < 3; k++) { const yy = 1158 + k * 14, ph = (t * 1.2 + k * 0.3) % 1; K.beginPath(); K.moveTo(x + 20, yy + ph * 30); K.quadraticCurveTo(x + 60, yy + 8 + ph * 30, x + 100, yy + ph * 30); K.globalAlpha = a * (1 - ph); K.stroke(); } K.restore(); };
    air(215, T.aircon); air(360, T.aircon2);
  }

  // ── energy flows by phase ──
  const dayK = t => 1 - nightK(t);
  function flows(K, t) {
    const sunUp = dayK(t);
    const invOn = t >= T.conv && !(t >= T.shuts && t < T.only + 0.6);
    const bOn = t >= T.battery && t < T.without - 0.1 || t >= T.only + 0.3;
    // direct current from the panels
    let dcA = clamp((t - T.single + 0.9) / 0.4) * sunUp * (invOn || t < T.conv ? 1 : 0);
    if (t >= T.stop - 0.4 && t < T.blackout) dcA *= 1 - clamp((t - T.stop + 0.4) / 0.6);
    if (t >= T.shuts - 0.1 && t < T.only + 0.6) dcA = 0;
    if (t >= T.only + 0.6) dcA = clamp((t - T.only - 0.6) / 0.4);
    const toInv = t >= T.conv - 0.1 ? DC_MAIN.concat([[760, 1130]]) : DC_MAIN;
    dcBeads(K, toInv, t, dcA);
    if (t >= T.wired + 0.8) for (let r = 0; r < 2; r++) { const v = r ? 0.89 : 0.47; dcBeads(K, [rp(0.08, v + 0.015), rp(0.92, v + 0.015), rp(0.95, v + 0.015), JBOX], t, dcA * clamp((t - T.wired - 0.8) / 0.4), 150, 64); }
    if (t >= T.morePanels + 1.2) dcBeads(K, DC_CARPORT, t, dcA * clamp((t - T.morePanels - 1.2) / 0.4));
    // inverter → breaker → loads (alternating)
    const acA = invOn || bOn ? 1 : 0, gridIn = t >= T.grid && t < T.morePanels + 1.4 || t >= T.pull - 0.3 && t < T.blackout - 0.3;
    const homeA = (acA || gridIn) && loadsOn(t) ? 1 : 0;
    if (t >= T.acOut + 0.35) acBeads(K, AC_INV_BRK, t, (invOn || (bOn && t >= T.battery)) ? clamp((t - T.acOut - 0.35) / 0.3) : 0);
    if (t >= T.lights) acBeads(K, C_LAMP, t, homeA);
    if (t >= T.aircon) acBeads(K, C_AIR1, t, homeA);
    if (t >= T.aircon2) acBeads(K, C_AIR2, t, homeA);
    if (t >= T.fridge) acBeads(K, C_FRIDGE, t, homeA);
    // grid line: power in (grid covers the difference / night without battery) or out (noon extra)
    const gOut = t >= T.out - 0.2 && t < T.night;
    const gA = (gridIn || gOut) ? 1 : 0;
    if (t >= T.grid) { acBeads(K, GRID_IN, t, gA * clamp((t - T.grid) / 0.4)); acBeads(K, SERVICE, t, gA); }
    chevrons(K, GRID_IN, t, gridIn ? 0.9 : 0, -1); chevrons(K, SERVICE, t, gridIn ? 0.9 : 0, 1);
    chevrons(K, GRID_IN, t, gOut ? 0.9 : 0, 1); chevrons(K, SERVICE, t, gOut ? 0.9 : 0, -1);
    // battery (direct current) ↔ inverter
    if (bOn && t >= T.battery + 0.2) dcBeads(K, BATT_LINK.slice().reverse(), t, t < T.without ? clamp((t - T.battery - 0.2) / 0.3) : clamp((t - T.only - 0.4) / 0.3), 140, 34);
  }

  // ── backgrounds / sky ──
  function sky(K, t) {
    const n = nightK(t), noon = win(t, T.noon - 0.2, T.night - 0.2, 0.6);
    const top = [lerp(lerp(18, 26, noon), 6, n), lerp(lerp(62, 80, noon), 18, n), lerp(lerp(122, 150, noon), 48, n)];
    const bot = [lerp(11, 4, n), lerp(42, 12, n), lerp(85, 34, n)];
    const bg = K.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, `rgb(${top.map(Math.round)})`); bg.addColorStop(1, `rgb(${bot.map(Math.round)})`);
    K.fillStyle = bg; K.fillRect(0, 0, W, H);
  }
  function sunMoon(K, t) {   // screen space, upper right under captions
    const n = nightK(t), noon = win(t, T.noon - 0.2, T.night - 0.2, 0.6), sx = 950, sy = 610;
    const sa = clamp((t - T.sun + 0.3) / 0.4) * (1 - n);
    if (sa > 0) {
      const r = 36 + 10 * noon; K.save(); K.globalAlpha = sa;
      const g = K.createRadialGradient(sx, sy, 0, sx, sy, r * 3); g.addColorStop(0, 'rgba(255,214,90,0.55)'); g.addColorStop(1, 'rgba(255,214,90,0)'); K.fillStyle = g; K.beginPath(); K.arc(sx, sy, r * 3, 0, TAU); K.fill();
      circle(K, sx, sy, r, '#FFD45A'); K.strokeStyle = '#FFD45A'; K.lineWidth = 4; K.lineCap = 'round';
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * 0.4; K.beginPath(); K.moveTo(sx + Math.cos(a) * (r + 10), sy + Math.sin(a) * (r + 10)); K.lineTo(sx + Math.cos(a) * (r + 24 + 8 * noon), sy + Math.sin(a) * (r + 24 + 8 * noon)); K.stroke(); }
      K.restore();
    }
    if (n > 0) { K.save(); K.globalAlpha = n; circle(K, sx, sy, 34, '#E8EEF8'); circle(K, sx + 16, sy - 10, 32, `rgb(6,18,48)`); for (let k = 0; k < 14; k++) circle(K, (hash(k) * 1000 + 40) % 1040, 560 + hash(k + 3) * 200, 2 + hash(k + 5) * 2, `rgba(230,246,255,${0.5 + 0.5 * Math.sin(t * 2 + k)})`); K.restore(); }
  }
  // sun rays onto the panels (world)
  function rays(K, t) {
    const a = win(t, T.sun, T.cable + 0.6, 0.4) + win(t, T.noon, T.noon + 2.2, 0.4) * 0.8;
    if (a <= 0) return;
    K.save(); K.globalAlpha = a * 0.8; K.strokeStyle = 'rgba(255,212,90,0.9)'; K.lineWidth = 4; K.setLineDash([18, 14]); K.lineDashOffset = -t * 80;
    for (let k = 0; k < 5; k++) { const p = rp(0.15 + k * 0.17, 0.4); K.beginPath(); K.moveTo(p[0] + 260, p[1] - 330); K.lineTo(p[0], p[1]); K.stroke(); }
    K.restore();
  }

  // ── grid widget: pole, blackout X, line worker, meter dial ──
  function gridWidgets(K, t) {
    const bo = t >= T.blackout && t < T.know + 0.6;
    if (bo) {   // dead grid: red dashed over the service line + X on the pole
      const a = clamp((t - T.blackout) / 0.25);
      K.save(); K.globalAlpha = a; K.setLineDash([10, 10]); K.strokeStyle = `rgb(${RED})`; K.lineWidth = 5;
      K.beginPath(); K.moveTo(SERVICE[0][0], SERVICE[0][1]); for (const p of SERVICE.slice(1)) K.lineTo(p[0], p[1]); K.stroke(); K.setLineDash([]);
      const s = 26; line(K, POLE[0] - s, POLE[1] - 60 - s, POLE[0] + s, POLE[1] - 60 + s, `rgb(${RED})`, 7); line(K, POLE[0] + s, POLE[1] - 60 - s, POLE[0] - s, POLE[1] - 60 + s, `rgb(${RED})`, 7);
      K.restore();
    }
    if (t >= T.workers) {   // line worker on the pole (helmet + body + ladder-ish legs)
      const a = clamp((t - T.workers) / 0.3), x = POLE[0] + 26, y = POLE[1] + 120;
      K.save(); K.globalAlpha = a; K.strokeStyle = INK; K.lineWidth = 4; K.lineCap = 'round';
      circle(K, x, y - 40, 13, null, INK, 4); fillRR(K, x - 16, y - 58, 32, 10, 5, '#FFD45A');
      line(K, x, y - 27, x, y + 20, INK, 4); line(K, x, y - 15, x - 24, y - 2, INK, 4); line(K, x, y - 15, x + 16, y - 34, INK, 4);
      line(K, x, y + 20, x - 14, y + 50, INK, 4); line(K, x, y + 20, x + 12, y + 50, INK, 4);
      const ok = clamp((t - T.workers - 0.4) / 0.3); circle(K, x + 38, y - 50, 16 * ok, '#46E08A'); if (ok > 0.5) { K.strokeStyle = '#0B2A55'; K.lineWidth = 4; K.beginPath(); K.moveTo(x + 30, y - 50); K.lineTo(x + 36, y - 43); K.lineTo(x + 47, y - 57); K.stroke(); }
      K.restore();
    }
    if (t >= T.meter + 0.2) {   // two-way meter: dial turns backwards while exporting
      const a = clamp((t - T.meter - 0.2) / 0.3), cx = METER.x + METER.w / 2, cy = METER.y + 24;
      K.save(); K.globalAlpha = a; circle(K, cx, cy, 14, '#0E1B2A', INK, 2.5);
      const exporting = t >= T.out - 0.2 && t < T.night, ang = (exporting ? -1 : 1) * t * 3;
      line(K, cx, cy, cx + Math.cos(ang) * 11, cy + Math.sin(ang) * 11, exporting ? `rgb(${AC})` : INK, 3);
      K.restore();
    }
    if (t >= T.only + 0.5 && t < T.know + 0.6) {   // hybrid: house isolated from the dead grid (open switch at the meter)
      const a = clamp((t - T.only - 0.5) / 0.3); K.save(); K.globalAlpha = a; line(K, 930, 1110, 960, 1088, '#FFFFFF', 5); circle(K, 930, 1110, 5, '#FFFFFF'); K.restore();
    }
  }

  // ── battery bank fill (charge) ──
  function battery(K, t) {
    if (t < T.battery + 0.3) return;
    const ghost = t >= T.without && t < T.only;
    const a = ghost ? 1 - 0.7 * clamp((t - T.without) / 0.3) : 1;
    let lvl = clamp((t - T.stores) / 1.0) * 0.9;
    if (t >= T.stores + 1.0) lvl = 0.9 - 0.06 * clamp((t - T.stores - 1.0) / 2);
    if (t >= T.only) lvl = 0.84;
    K.save(); K.globalAlpha = a;
    for (let k = 0; k < 3; k++) { const x = BATT.x + 10 + k * BATT.w / 3, w = BATT.w / 3 - 20, hh = (BATT.h - 20) * lvl; fillRR(K, x, BATT.y + BATT.h - 10 - hh, w, hh, 4, `rgba(${DC},0.75)`); }
    text(K, '+', BATT.x + 26, BATT.y - 8, { font: F.grot, weight: 700, size: 26, color: INK });
    K.restore();
    if (ghost) { const g = clamp((t - T.without) / 0.3); K.save(); K.globalAlpha = g; line(K, BATT.x - 10, BATT.y - 10, BATT.x + BATT.w + 10, BATT.y + BATT.h + 10, `rgb(${RED})`, 6); line(K, BATT.x + BATT.w + 10, BATT.y - 10, BATT.x - 10, BATT.y + BATT.h + 10, `rgb(${RED})`, 6); K.restore(); }
  }

  // ── screen-space tags & HUD ──
  function w2s(c, x, y) { return [(x - c.x) * c.z + W / 2, (y - c.y) * c.z + H / 2]; }
  function pill(K, str, x, y, col, s, o = {}) {
    const f = { font: F.grot, weight: 700, size: o.size || 40, ls: 1 };
    K.save(); K.translate(x, y); K.scale(s, s);
    const w = measure(K, str, f) + 34, h = f.size * 1.4;
    fillRR(K, -w / 2 + 5, -h / 2 + 6, w, h, h / 2, 'rgba(0,0,0,0.3)');
    fillRR(K, -w / 2, -h / 2, w, h, h / 2, col); text(K, str, 0, f.size * 0.36, Object.assign({}, f, { color: o.ink || '#0B2A55' }));
    K.restore();
  }
  // [text, t0, t1, world x, world y, colour, dx, dy]
  const TAGS = [
    ['Direct current (DC)', T.dcLab, T.acLab - 0.3, 885, 1050, `rgb(${DC})`, 0, -150],
    ['Alternating current (AC)', T.acLab, T.acOut - 0.2, 520, 1300, `rgb(${AC})`, 0, 0],
    ['Inverter', T.invLab + 0.5, T.breaker - 0.3, 760, 1310, INK, 0, 70],
    ['Breaker panel', T.breaker + 0.1, T.plug - 0.2, 600, 1300, INK, 0, 55],
    ['Lights', T.lights, T.plug - 0.2, 520, 1156, '#FFE28C', 0, 60],
    ['Fridge', T.fridge, T.plug - 0.2, 286, 1360, INK, 0, 0],
    ['Air conditioner', T.aircon, T.plug - 0.2, 275, 1098, `rgb(${AC})`, 0, -60],
    ['2nd air conditioner', T.aircon2, T.morePanels - 0.2, 420, 1098, `rgb(${AC})`, 0, -70],
    ['Grid', T.grid, T.morePanels - 0.2, 985, 1000, INK, -30, -60],
    ['More panels', T.morePanels + 0.4, T.bigger - 0.3, -40, 1150, `rgb(${DC})`, 0, -80],
    ['Bigger inverter', T.bigger, T.limit - 0.1, 760, 1340, INK, 0, 60],
    ['Max power at once', T.limit + 0.3, T.noon - 0.4, 760, 1340, `rgb(${RED})`, 0, 60, '#FFFFFF'],
    ['Extra → grid', T.out, T.meter - 0.1, 1040, 1180, `rgb(${AC})`, -40, 0],
    ['Two-way meter', T.meter + 0.2, T.night - 0.1, 933, 1184, INK, -40, 70],
    ['Battery bank', T.battery + 0.2, T.without - 0.1, 780, 1470, `rgb(${DC})`, 0, 55],
    ['No battery? Grid power', T.without + 0.3, T.blackout - 0.4, 780, 1470, INK, -40, 55],
    ['Blackout', T.blackout, T.workers - 0.2, 1040, 900, `rgb(${RED})`, -60, -80, '#FFFFFF'],
    ['Line workers stay safe', T.workers + 0.2, T.only - 0.1, 1040, 900, '#46E08A', -150, -80],
    ['Hybrid inverter + batteries', T.hybrid - 0.1, T.know - 0.2, 760, 1310, '#FFFFFF', -40, 0],
  ];
  function hud(K, t) {
    const a = win(t, T.plug, T.battery - 0.4, 0.4); if (a <= 0) return;
    let sun = 0.62, use = 0.45;
    use = lerp(use, 0.9, E.outCubic(clamp((t - T.aircon2) / 0.5)));
    sun = lerp(sun, 0.96, E.outCubic(clamp((t - T.morePanels - 0.4) / 0.8)));
    use = lerp(use, 0.55, clamp((t - T.noon) / 0.6)); sun = lerp(sun, 1.0, clamp((t - T.noon) / 0.6));
    sun *= 1 - clamp((t - T.stop + 0.4) / 0.6);
    const grid = Math.max(0, use - sun);
    const x = 70, y = 600, w = 560, bh = 28;
    K.save(); K.globalAlpha = a;
    fillRR(K, x - 22, y - 34, w + 220, 132, 22, 'rgba(4,14,36,0.62)');
    text(K, 'SUN', x, y + 9, { font: F.mono, weight: 700, size: 24, color: `rgb(${DC})`, align: 'left' });
    text(K, 'HOME', x, y + 57, { font: F.mono, weight: 700, size: 24, color: INK, align: 'left' });
    const bx = x + 110, bw = w;
    fillRR(K, bx, y - 10, bw, bh, 8, 'rgba(255,255,255,0.08)'); fillRR(K, bx, y - 10, bw * sun, bh, 8, `rgb(${DC})`);
    fillRR(K, bx, y + 38, bw, bh, 8, 'rgba(255,255,255,0.08)'); fillRR(K, bx, y + 38, bw * Math.min(use, sun), bh, 8, INK);
    if (grid > 0.01) { fillRR(K, bx + bw * sun, y + 38, bw * grid, bh, 8, `rgb(${AC})`); text(K, 'GRID', bx + bw * (sun + grid / 2), y + 60, { font: F.mono, weight: 700, size: 20, color: '#0B2A55' }); }
    if (sun - use > 0.15 && t >= T.more) text(K, 'EXTRA', bx + bw * (use + (sun - use) / 2), y + 12, { font: F.mono, weight: 700, size: 20, color: '#0B2A55' });
    K.restore();
  }

  SC.solar = {
    label: '// solar',
    noChrome: true,
    cam: t => ({ z: 1, x: 0, y: 0 }),
    draw(Tl, K, t) {
      K.save(); Tl.save(); K.setTransform(1, 0, 0, 1, 0, 0); Tl.setTransform(1, 0, 0, 1, 0, 0);
      Tl.fillStyle = '#FFFFFF'; Tl.fillRect(0, 0, W, H);
      sky(K, t); CAP.color = '#FFFFFF';
      const c = cam(t);
      K.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z);
      // grid paper (world)
      { const x0 = c.x - W / 2 / c.z - 60, x1 = c.x + W / 2 / c.z + 60, y0 = c.y - H / 2 / c.z - 60, y1 = c.y + H / 2 / c.z + 60;
        K.globalAlpha = clamp(t / 0.3); K.lineWidth = 1 / c.z; K.strokeStyle = 'rgba(230,246,255,0.08)'; K.beginPath();
        for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { K.moveTo(x, y0); K.lineTo(x, y1); } for (let y = Math.floor(y0 / 30) * 30; y < y1; y += 30) { K.moveTo(x0, y); K.lineTo(x1, y); } K.stroke();
        K.lineWidth = 2 / c.z; K.strokeStyle = 'rgba(230,246,255,0.14)'; K.beginPath();
        for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) { K.moveTo(x, y0); K.lineTo(x, y1); } for (let y = Math.floor(y0 / 150) * 150; y < y1; y += 150) { K.moveTo(x0, y); K.lineTo(x1, y); } K.stroke(); K.globalAlpha = 1; }
      // panels glow in sun (fill), dim at night
      const pg = clamp((t - T.sun) / 0.5) * (1 - nightK(t)) * (t >= T.shuts && t < T.only + 0.6 ? 0.35 : 1);
      if (pg > 0) for (const q of PANELS.concat(t >= T.morePanels + 0.6 ? [0, 1, 2, 3].map(k => { const x0 = -205 + k * 85; return [[x0, 1176], [x0 + 75, 1176], [x0 + 85, 1150], [x0 + 10, 1150]]; }) : [])) {
        K.save(); K.globalAlpha = 0.35 * pg; K.fillStyle = '#2E6BD8'; K.beginPath(); K.moveTo(q[0][0], q[0][1]); for (const p of q.slice(1)) K.lineTo(p[0], p[1]); K.closePath(); K.fill(); K.restore();
      }
      rays(K, t); loads(K, t);
      const tips = [];
      for (const s of S) {
        const p = E.outCubic(clamp((t - s.t0) / s.dur)); if (p <= 0) continue;
        K.save(); if (s.batt && t >= T.without && t < T.only) K.globalAlpha = 1 - 0.7 * clamp((t - T.without) / 0.3);
        const q = partial(K, s, p); K.restore(); if (q) tips.push(q);
      }
      for (const q of tips) tip(K, q[0], q[1], c.z);
      inverter(K, t, c.z); battery(K, t); flows(K, t); gridWidgets(K, t);
      if (t > T.cable + 0.8 && t < T.conv - 0.2) circle(K, 760, 1105, 7, null, `rgb(${DC})`, 3);
      // hook question mark over the panels
      const hq = win(t, T.hookQ - 0.6, T.sun - 0.1, 0.25);
      if (hq > 0) { const p = rp(0.5, 0.5); K.save(); K.globalAlpha = hq; circle(K, p[0], p[1] - 120, 46, ACCENT); text(K, '?', p[0], p[1] - 98, { font: F.grot, weight: 700, size: 64, color: '#FFFFFF' }); K.restore(); }
      // screen-space overlays
      K.setTransform(1, 0, 0, 1, 0, 0);
      sunMoon(K, t);
      for (const [str, t0, t1, x, y, col, dx, dy, ink] of TAGS) {
        if (t < t0 || t > t1 + 0.3) continue;
        const s = clamp(pop(t - t0, 2.6, 0.5), 0, 1.15) * (1 - clamp((t - t1) / 0.3)); if (s <= 0) continue;
        const [sx, sy] = w2s(c, x, y), hw = (measure(K, str, { font: F.grot, weight: 700, size: 40, ls: 1 }) + 34) / 2; pill(K, str, clamp(sx + dx, hw + 40, W - hw - 130), clamp(sy + dy, 560, 1360), col, s, { ink });
      }
      hud(K, t);
      // closing share card
      if (t >= T.send - 0.1) { const s = clamp(pop(t - T.send + 0.1, 2.6, 0.5), 0, 1.15); X([K], W / 2, 1330, s, -2, () => { fillRR(K, -230, -50, 460, 100, 50, ACCENT); text(K, 'Send them this  ↗', 0, 13, { font: F.grot, weight: 700, size: 38, color: '#FFFFFF' }); }); }
      const vg = K.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,25,0.45)'); K.fillStyle = vg; K.fillRect(0, 0, W, H);
      K.restore(); Tl.restore();
    },
    guy: t => ({ hide: true }),
  };
})();

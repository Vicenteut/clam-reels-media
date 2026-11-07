// ═════════════ PLANO · blueprint that draws itself: panels → DC cable → house (AC) → the inverter is built, joins both, materializes ═════════════
// Everything is vector geometry in WORLD coordinates (px at zoom 1); a camera maps world → screen. Times come from word indices
// of build/words.json (kit/tiempos.json). reel.json "variant": "v2" applies the correction test (cable route, +0.5 s, label).
(() => {
  const V2 = REEL.variant === 'v2';
  const wi = i => (WORDS[i] ? WORDS[i].s : 0);
  const INK = '#E6F6FF', DC = '255,176,32', AC = '63,213,255', DIM = 'rgba(230,246,255,0.55)';
  const SHIFT = V2 ? 0.5 : 0;                         // correction 2: the inverter starts 0.5 s later
  const TM = {
    roof: 0.0, panels: wi(1) - 0.15, jbox: 1.0, dc: wi(3) - 0.1, dcLab: wi(3), oneWay: wi(8),
    house: wi(12) - 0.1, ac: wi(15) - 0.1, acLab: wi(15), bf: wi(19),
    gap: wi(26) + 0.05, inv: wi(30) - 0.1 + SHIFT, flips: wi(32) + SHIFT, mat: wi(38),
  };
  const LABEL = V2 ? 'INVERTER · DC → AC' : 'INVERTER';   // correction 3

  // ── geometry (world) ──
  const ROOF = { tl: [270, 830], tr: [810, 830], br: [935, 1040], bl: [145, 1040] };
  const rp = (u, v) => { const L = [lerp(ROOF.tl[0], ROOF.bl[0], v), lerp(ROOF.tl[1], ROOF.bl[1], v)], R = [lerp(ROOF.tr[0], ROOF.br[0], v), lerp(ROOF.tr[1], ROOF.br[1], v)]; return [lerp(L[0], R[0], u), lerp(L[1], R[1], u)]; };
  const INV = { x: 700, y: 1130, w: 120, h: 180 }, DCIN = [740, 1130], ACOUT = [780, 1310];
  const JBOX = [885, 1006];
  const CABLE = V2 ? [JBOX, [952, 1006], [952, 1095], [740, 1095], [740, 1105]]     // correction 1: down the outside wall
                   : [JBOX, [885, 1075], [740, 1075], [740, 1105]];
  const CABLE_JOIN = [[740, 1105], DCIN];
  const AC_MAIN = [[780, 1335], [780, 1440], [410, 1440], [410, 1413]], AC_LAMP = [[640, 1440], [640, 1066], [520, 1066]];
  const AC_JOIN = [ACOUT, [780, 1335]];

  // ── strokes (each draws itself progressively) ──
  const S = [];
  const add = (pts, t0, dur, o = {}) => S.push(Object.assign({ pts, t0, dur }, o));
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  // roof face
  add([ROOF.bl, ROOF.tl, ROOF.tr, ROOF.br, ROOF.bl], TM.roof, 0.55, { lw: 4 });
  add([[ROOF.bl[0], ROOF.bl[1] + 14], [ROOF.br[0], ROOF.br[1] + 14]], TM.roof + 0.3, 0.3, { lw: 3 });
  // 8 panels (2 rows × 4), outline then cells
  const PANELS = [];
  [[0.12, 0.47], [0.54, 0.89]].forEach(([v0, v1], r) => {
    for (let c = 0; c < 4; c++) {
      const u0 = 0.08 + c * 0.21, u1 = u0 + 0.19, k = r * 4 + c, t0 = TM.panels + k * 0.09;
      const q = [rp(u0, v0), rp(u1, v0), rp(u1, v1), rp(u0, v1)]; PANELS.push(q);
      add([...q, q[0]], t0, 0.32, { lw: 3.2 });
      for (let j = 1; j < 4; j++) add([rp(lerp(u0, u1, j / 4), v0), rp(lerp(u0, u1, j / 4), v1)], t0 + 0.25, 0.18, { lw: 1.4, col: DIM });
      add([rp(u0, (v0 + v1) / 2), rp(u1, (v0 + v1) / 2)], t0 + 0.3, 0.18, { lw: 1.4, col: DIM });
    }
  });
  add([rp(0.92, 0.89), JBOX], TM.jbox - 0.1, 0.15, { lw: 3 });
  add(rect(JBOX[0] - 14, JBOX[1] - 12, 28, 24), TM.jbox, 0.25, { lw: 3 });
  add(CABLE, TM.dc, 1.0, { lw: 5, col: `rgb(${DC})`, glow: `rgba(${DC},0.9)` });
  // house (section view)
  add([[40, 1480], [1040, 1480]], TM.house - 0.05, 0.5, { lw: 3, col: DIM });
  add([[175, 1480], [175, 1046], [905, 1046], [905, 1480]], TM.house, 0.75, { lw: 4 });
  add([[195, 1480], [195, 1066], [885, 1066], [885, 1480]], TM.house + 0.15, 0.7, { lw: 2, col: DIM });
  add([[175, 1500], [905, 1500]], TM.house + 0.3, 0.4, { lw: 3 });
  add(rect(230, 1110, 100, 90), TM.house + 0.45, 0.35, { lw: 2.6 });
  add([[280, 1110], [280, 1200]], TM.house + 0.7, 0.12, { lw: 1.6, col: DIM }); add([[230, 1155], [330, 1155]], TM.house + 0.75, 0.12, { lw: 1.6, col: DIM });
  add(rect(240, 1250, 120, 228), TM.house + 0.55, 0.45, { lw: 3.2 });               // fridge
  add([[240, 1322], [360, 1322]], TM.house + 0.85, 0.15, { lw: 2.4 }); add([[346, 1270], [346, 1305]], TM.house + 0.9, 0.1, { lw: 3 }); add([[346, 1340], [346, 1395]], TM.house + 0.95, 0.1, { lw: 3 });
  add([[360, 1420], [385, 1420], [400, 1413]], TM.house + 1.0, 0.15, { lw: 2.4 });
  add(rect(401, 1400, 18, 26), TM.house + 1.05, 0.15, { lw: 2.4 });                  // outlet
  add([[520, 1066], [520, 1140]], TM.house + 0.6, 0.2, { lw: 2.4 });                 // lamp
  add([[485, 1140], [555, 1140], [578, 1182], [462, 1182], [485, 1140]], TM.house + 0.75, 0.3, { lw: 3 });
  add(AC_MAIN, TM.ac, 0.8, { lw: 5, col: `rgb(${AC})`, glow: `rgba(${AC},0.9)` });
  add(AC_LAMP, TM.ac + 0.25, 0.6, { lw: 5, col: `rgb(${AC})`, glow: `rgba(${AC},0.9)` });
  // inverter (blueprint), dims, symbol, then the two joins
  add(rect(INV.x, INV.y, INV.w, INV.h), TM.inv, 0.5, { lw: 4, inv: 'outline' });
  add(rect(INV.x + 20, INV.y + 30, 80, 46), TM.inv + 0.3, 0.25, { lw: 2, col: DIM, inv: 'inner' });
  add([[678, INV.y], [678, INV.y + INV.h]], TM.inv + 0.35, 0.3, { lw: 1.6, col: DIM });
  add([[670, INV.y], [686, INV.y]], TM.inv + 0.35, 0.08, { lw: 1.6, col: DIM }); add([[670, INV.y + INV.h], [686, INV.y + INV.h]], TM.inv + 0.6, 0.08, { lw: 1.6, col: DIM });
  add([[INV.x + 12, 1220], [INV.x + 48, 1220]], TM.inv + 0.45, 0.2, { lw: 3.5, col: `rgb(${DC})`, inv: 'inner' });
  const SINE = []; for (let i = 0; i <= 24; i++) SINE.push([INV.x + 66 + i * 1.8, 1220 - 12 * Math.sin(i / 24 * TAU * 1.5)]);
  add(SINE, TM.inv + 0.6, 0.3, { lw: 3.5, col: `rgb(${AC})`, inv: 'inner' });
  add(CABLE_JOIN, TM.flips, 0.22, { lw: 5, col: `rgb(${DC})`, glow: `rgba(${DC},0.9)` });
  add(AC_JOIN, TM.flips + 0.15, 0.22, { lw: 5, col: `rgb(${AC})`, glow: `rgba(${AC},0.9)` });

  // ── sound + punch ──
  cue(TM.panels, 'tick', -12); cue(TM.panels + 0.36, 'tick', -14); cue(TM.dc, 'swoosh', -12);
  cue(3.9, 'whoosh', -10); cue(TM.house, 'tick', -12); cue(TM.ac, 'swoosh', -12); cue(9.4, 'whoosh', -10);
  cue(TM.inv, 'tick', -10); cue(TM.flips, 'click', -6); cue(TM.flips + 0.15, 'click', -8);
  cue(TM.mat, 'shimmer', -4); cue(TM.mat + 0.05, 'pop', -6); kick(TM.mat + 0.05, 0.5, 0.3);

  // ── camera (world centre + zoom), eased between keys ──
  const KEYS = [[0, 540, 1000, 1.2], [3.9, 540, 1000, 1.24], [4.8, 540, 1180, 1.08], [9.3, 540, 1180, 1.1],
    [10.2, 720, 1215, 1.6], [12.5, 725, 1215, 1.62], [13.1, 700, 1150, 1.45], [99, 700, 1150, 1.43]];
  function cam(t) {
    let i = 0; while (i + 1 < KEYS.length && t >= KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)], u = E.inOutCubic(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u) };
  }

  // ── helpers ──
  function lens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
  function at(P, L, d) { d = clamp(d, 0, L[L.length - 1]); for (let i = 1; i < P.length; i++) if (d <= L[i]) { const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; } const n = P.length - 1; return [P[n][0], P[n][1], 0]; }
  function partial(K, s, p, z) {
    const L = s._L || (s._L = lens(s.pts)), d = L[L.length - 1] * p;
    K.beginPath(); K.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) { if (L[i] <= d) K.lineTo(s.pts[i][0], s.pts[i][1]); else { const q = at(s.pts, L, d); K.lineTo(q[0], q[1]); break; } }
    K.lineWidth = s.lw || 3; K.strokeStyle = s.col || INK; K.lineCap = 'round'; K.lineJoin = 'round';
    K.shadowColor = s.glow || 'rgba(170,225,255,0.75)'; K.shadowBlur = (s.glow ? 16 : 9);
    K.stroke(); K.shadowBlur = 0;
    return p < 1 ? at(s.pts, L, d) : null;
  }
  function tip(K, x, y, z) {
    const r = 22 / z, g = K.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,240,255,0.8)'); g.addColorStop(1, 'rgba(160,220,255,0)');
    K.fillStyle = g; K.beginPath(); K.arc(x, y, r, 0, TAU); K.fill();
  }
  function bead(K, x, y, col, r, a = 1) {
    const g = K.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, `rgba(255,255,240,${0.95 * a})`); g.addColorStop(0.3, `rgba(${col},${0.85 * a})`); g.addColorStop(1, `rgba(${col},0)`);
    K.fillStyle = g; K.beginPath(); K.arc(x, y, r * 2.4, 0, TAU); K.fill();
  }
  function tag(K, str, x, y, col, t0, t, o = {}) {      // pill tag in world space (pops in)
    const dt = t - t0; if (dt < 0) return;
    const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2), f = { font: o.font || F.grot, weight: 700, size: o.size || 40, ls: o.ls || 2 };
    K.save(); K.translate(x, y); K.scale(s, s);
    const w = measure(K, str, f) + 34, h = f.size * 1.35;
    fillRR(K, -w / 2, -h / 2, w, h, h / 2, col); text(K, str, 0, f.size * 0.36, Object.assign({}, f, { color: '#0B2A55' }));
    K.restore();
  }
  function grid(K, c) {
    const x0 = c.x - W / 2 / c.z - 60, x1 = c.x + W / 2 / c.z + 60, y0 = c.y - H / 2 / c.z - 60, y1 = c.y + H / 2 / c.z + 60;
    K.lineWidth = 1 / c.z; K.strokeStyle = 'rgba(230,246,255,0.09)'; K.beginPath();
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { K.moveTo(x, y0); K.lineTo(x, y1); }
    for (let y = Math.floor(y0 / 30) * 30; y < y1; y += 30) { K.moveTo(x0, y); K.lineTo(x1, y); }
    K.stroke();
    K.lineWidth = 2 / c.z; K.strokeStyle = 'rgba(230,246,255,0.16)'; K.beginPath();
    for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) { K.moveTo(x, y0); K.lineTo(x, y1); }
    for (let y = Math.floor(y0 / 150) * 150; y < y1; y += 150) { K.moveTo(x0, y); K.lineTo(x1, y); }
    K.stroke();
  }

  // ── energy ──
  const CAB_FULL = CABLE.concat([DCIN, [DCIN[0], INV.y + 60]]), CF_L = lens(CAB_FULL), CAB_L = lens(CABLE);
  function dcFlow(K, t, z) {
    if (t < TM.dc + 0.7) return;
    const joined = t >= TM.flips + 0.22, P = joined ? CAB_FULL : CABLE, L = joined ? CF_L : CAB_L, tot = L[L.length - 1];
    const a0 = clamp((t - TM.dc - 0.7) / 0.4);
    for (let d = ((t - TM.dc) * 190) % 70; d < tot; d += 70) {
      const q = at(P, L, d), fade = joined ? clamp((tot - d) / 30) : clamp((tot - d) / 120);
      bead(K, q[0], q[1], DC, 7, a0 * fade);
    }
    if (t >= TM.oneWay && t < TM.house) {                 // "one way": chevrons along the cable
      const a = clamp((t - TM.oneWay) / 0.25) * (1 - clamp((t - TM.house + 0.4) / 0.4));
      for (let k = 0; k < 3; k++) {
        const q = at(CABLE, CAB_L, CAB_L[CAB_L.length - 1] * (0.28 + k * 0.2) + ((t * 60) % 30));
        K.save(); K.translate(q[0], q[1]); K.rotate(q[2]); K.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 8 - k));
        K.strokeStyle = `rgb(${DC})`; K.lineWidth = 5; K.lineCap = 'round'; K.lineJoin = 'round';
        K.beginPath(); K.moveTo(-10, -16); K.lineTo(6, 0); K.lineTo(-10, 16); K.stroke(); K.restore();
      }
    }
  }
  const ACP = [[AC_MAIN, lens(AC_MAIN)], [AC_LAMP, lens(AC_LAMP)]], ACJ = [AC_JOIN, lens(AC_JOIN)];
  function acFlow(K, t) {
    if (t < TM.ac + 0.5) return;
    const a0 = clamp((t - TM.ac - 0.5) / 0.4), amp = lerp(12, 24, clamp((t - TM.bf) / 0.4)), off = amp * Math.sin(t * TAU * 1.3);
    for (const [P, L] of ACP) { const tot = L[L.length - 1]; for (let d = 30; d < tot - 20; d += 62) bead(K, ...at(P, L, d + off).slice(0, 2), AC, 6.5, a0); }
    if (t > TM.flips + 0.4) { const [P, L] = ACJ; bead(K, ...at(P, L, L[1] / 2 + off * 0.4).slice(0, 2), AC, 6.5, clamp((t - TM.flips - 0.4) / 0.3)); }
    if (t >= TM.bf && t < TM.gap + 0.3) {                 // ↔ on "back and forth"
      const a = clamp((t - TM.bf) / 0.25) * (1 - clamp((t - TM.gap) / 0.3)), y = 1462, cx = 520 + off * 0.8;
      K.save(); K.globalAlpha = a; K.strokeStyle = `rgb(${AC})`; K.lineWidth = 4; K.lineCap = 'round'; K.lineJoin = 'round';
      K.beginPath(); K.moveTo(cx - 60, y); K.lineTo(cx + 60, y); K.moveTo(cx - 46, y - 12); K.lineTo(cx - 60, y); K.lineTo(cx - 46, y + 12);
      K.moveTo(cx + 46, y - 12); K.lineTo(cx + 60, y); K.lineTo(cx + 46, y + 12); K.stroke(); K.restore();
    }
  }
  function acGlyph(K, t) {                                // the sine next to the AC tag (scrolls)
    if (t < TM.acLab + 0.1) return;
    const p = clamp((t - TM.acLab - 0.1) / 0.5);
    K.save(); K.strokeStyle = `rgb(${AC})`; K.lineWidth = 4; K.shadowColor = `rgba(${AC},0.9)`; K.shadowBlur = 12; K.beginPath();
    for (let i = 0; i <= 40 * p; i++) { const x = 515 + i * 2.2, y = 1340 - 14 * Math.sin(i / 40 * TAU * 2 - t * 6); i ? K.lineTo(x, y) : K.moveTo(x, y); }
    K.stroke(); K.restore();
  }

  // ── materialize the inverter ──
  function solidInverter(K, t, z) {
    const m = clamp((t - TM.mat + 0.08) / 0.45); if (m <= 0) return;
    const { x, y, w, h } = INV, front = y + h * E.outCubic(m);
    K.save(); K.beginPath(); K.rect(x - 10, y - 10, w + 20, front - y + 10); K.clip();
    K.shadowColor = 'rgba(0,0,0,0.45)'; K.shadowBlur = 24; K.shadowOffsetY = 10;
    const g = K.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#F7FAFC'); g.addColorStop(1, '#C9D4DE');
    fillRR(K, x, y, w, h, 12, g); K.shadowBlur = 0; K.shadowOffsetY = 0;
    strokeRR(K, x, y, w, h, 12, '#8FA3B5', 2.5);
    fillRR(K, x + 20, y + 30, 80, 46, 6, '#0E1B2A');
    K.strokeStyle = `rgb(${AC})`; K.lineWidth = 3; K.beginPath();
    for (let i = 0; i <= 30; i++) { const xx = x + 28 + i * 2.13, yy = y + 53 - 11 * Math.sin(i / 30 * TAU * 1.5 - t * 5); i ? K.lineTo(xx, yy) : K.moveTo(xx, yy); } K.stroke();
    circle(K, x + 42, y + 100, 6, '#46E08A'); circle(K, x + 62, y + 100, 6, '#2F3B48');
    fillRR(K, x, y + h - 34, w, 12, 0, '#FF7A1A');
    fillRR(K, DCIN[0] - 9, y - 8, 18, 12, 3, '#2F3B48'); fillRR(K, ACOUT[0] - 9, y + h - 4, 18, 12, 3, '#2F3B48');
    K.restore();
    if (m < 1) { const gr = K.createLinearGradient(0, front - 14, 0, front + 6); gr.addColorStop(0, 'rgba(230,246,255,0)'); gr.addColorStop(1, 'rgba(230,246,255,0.95)');
      K.fillStyle = gr; K.fillRect(x - 16, front - 14, w + 32, 20); }
    const fl = t - TM.mat; if (fl > 0 && fl < 0.7) { K.save(); K.globalAlpha = 1 - fl / 0.7; K.strokeStyle = INK; K.lineWidth = 4 / z;
      K.beginPath(); K.arc(x + w / 2, y + h / 2, 60 + fl * 260, 0, TAU); K.stroke(); K.restore(); }
  }

  SC.plano = {
    label: '// plano',
    noChrome: true,
    cam: t => ({ z: 1, x: 0, y: 0 }),
    draw(T, K, t) {
      K.save(); T.save(); K.setTransform(1, 0, 0, 1, 0, 0); T.setTransform(1, 0, 0, 1, 0, 0);
      T.fillStyle = '#FFFFFF'; T.fillRect(0, 0, W, H);
      const bg = K.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#123E7A'); bg.addColorStop(1, '#0B2A55');
      K.fillStyle = bg; K.fillRect(0, 0, W, H);
      CAP.color = '#FFFFFF';
      const c = cam(t);
      K.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z);
      K.globalAlpha = clamp(t / 0.3); grid(K, c); K.globalAlpha = 1;
      // placeholder for the missing piece
      if (t >= TM.gap && t < TM.inv + 0.3) {
        K.save(); K.setLineDash([12, 10]); K.lineDashOffset = -t * 30; K.globalAlpha = (0.55 + 0.45 * Math.sin(t * 7)) * clamp((t - TM.gap) / 0.3) * (1 - clamp((t - TM.inv) / 0.3));
        strokeRR(K, INV.x, INV.y, INV.w, INV.h, 6, INK, 3); K.setLineDash([]); K.restore();
      }
      solidInverter(K, t, c.z);
      const tips = [];
      for (const s of S) {
        const p = E.outCubic(clamp((t - s.t0) / s.dur)); if (p <= 0) continue;
        K.save(); if (t > TM.mat - 0.08 && s.inv) K.globalAlpha = 1 - (s.inv === 'inner' ? 1 : 0.55) * clamp((t - TM.mat + 0.08) / 0.3);
        const q = partial(K, s, p, c.z); K.restore(); if (q) tips.push(q);
      }
      for (const q of tips) tip(K, q[0], q[1], c.z);
      // open terminal at the cable end before the inverter exists
      if (t > TM.dc + 0.9 && t < TM.flips + 0.2) circle(K, 740, 1105, 7, null, `rgb(${DC})`, 3);
      dcFlow(K, t, c.z); acFlow(K, t); acGlyph(K, t);
      if (t < TM.inv + 0.3) { K.save(); K.globalAlpha = 1 - clamp((t - TM.inv + 0.1) / 0.3); tag(K, 'DC', 800, 1150, `rgb(${DC})`, TM.dcLab, t, { size: 44 }); K.restore(); }   // gives way to "DC IN"
      tag(K, 'AC', 470, 1340, `rgb(${AC})`, TM.acLab, t, { size: 44 });
      if (t >= TM.flips) {
        text(K, 'DC IN', DCIN[0] - 12, DCIN[1] - 10, { font: F.mono, weight: 700, size: 22, color: `rgb(${DC})`, align: 'right' });
        if (t >= TM.flips + 0.15) text(K, 'AC OUT', ACOUT[0] + 12, ACOUT[1] + 38, { font: F.mono, weight: 700, size: 22, color: `rgb(${AC})`, align: 'left' });
      }
      // label in screen space
      K.setTransform(1, 0, 0, 1, 0, 0);
      const dl = t - TM.mat;
      if (dl >= 0) {
        const s = clamp(pop(dl, 2.6, 0.5), 0, 1.2), f = { font: F.grot, weight: 700, size: V2 ? 58 : 72, ls: 3 };
        X([K], W / 2, 640, s, -2, () => {
          const w = measure(K, LABEL, f) + 80;
          fillRR(K, -w / 2 + 8, -58 + 10, w, 116, 58, 'rgba(0,0,0,0.3)');
          fillRR(K, -w / 2, -58, w, 116, 58, INK); strokeRR(K, -w / 2, -58, w, 116, 58, '#FF7A1A', 6);
          text(K, LABEL, 0, f.size * 0.35, Object.assign({}, f, { color: '#0B2A55' }));
        });
      }
      // vignette
      const vg = K.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,25,0.45)');
      K.fillStyle = vg; K.fillRect(0, 0, W, H);
      K.restore(); T.restore();
    },
    guy: t => ({ hide: true }),
  };
})();

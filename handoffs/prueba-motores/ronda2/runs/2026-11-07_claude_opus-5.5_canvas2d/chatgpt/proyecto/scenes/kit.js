// ═════════════ shared props for this reel (prefixed gp*): token chips, chat cards, the model box, the weighted wheel ═════════════
const GP_COLS = ['#FFD9A0', '#C9E4FF', '#D8F2C2', '#F6C9E6', '#E7DCFF', '#FFE6C7'];
const GP_BLUE = '#2F6FE0', GP_GREY = '#CFCBC2';

// a token chip (local or absolute), returns its width
function gpChip(T, K, str, x, y, o = {}) {
  const { size = 44, fill = GP_COLS[0], col = C.ink, s = 1, r = 0, hot = false, shadow = true } = o;
  const f = { font: F.mono, weight: 700, size }, w = measure(K, str.replace(/ /g, '·'), f) + 36, h = size * 1.55;
  X(shadow ? [T, K] : [K], x, y, s, r, () => {
    if (shadow) fillRR(T, -w / 2 + 6, -h / 2 + 8, w, h, 14, C.k40);
    fillRR(K, -w / 2, -h / 2, w, h, 14, hot ? C.red : fill); strokeRR(K, -w / 2, -h / 2, w, h, 14, C.ink, 4);
    text(K, str.replace(/ /g, '·'), 0, size * 0.35, Object.assign({ color: hot ? '#FFFFFF' : col }, f));
  });
  return w;
}
function gpChipW(K, str, size = 44) { return measure(K, str.replace(/ /g, '·'), { font: F.mono, weight: 700, size }) + 36; }
// chat card: header + bubbles [{me, txt, t0, cps}]
function gpChat(T, K, x, y, w, h, t, title, bubbles) {
  uiCard(T, K, x, y, w, h, { r: 28, border: C.ink, lw: 4 });
  fillRR(K, x + 2, y + 2, w - 4, 64, 26, '#F3F1EC'); line(K, x, y + 66, x + w, y + 66, HAIR, 3);
  circle(K, x + 32, y + 33, 10, C.red); text(K, title, x + 54, y + 42, { font: F.mono, weight: 700, size: 24, color: C.ink, align: 'left' });
  let by = y + 100;
  for (const b of bubbles) {
    if (t < b.t0) continue;
    const s = typedStr(b.txt, t, b.t0, b.cps || 22), f = { font: F.grot, weight: 500, size: 34 };
    const lines = wrapText(b.txt, f, w - 120), lw = Math.min(w - 80, Math.max(...lines.map(l => measure(K, l, f))) + 44), bh = lines.length * 44 + 30;
    const bx = b.me ? x + w - 24 - lw : x + 24, a = clamp(pop(t - b.t0, 3, 0.5), 0, 1.15);
    X([K], bx + lw / 2, by + bh / 2, a, 0, () => {
      fillRR(K, -lw / 2, -bh / 2, lw, bh, 22, b.me ? C.ink : '#F3F1EC');
      let shown = s.length;
      lines.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, shown)); shown -= ln.length + 1;
        text(K, part, -lw / 2 + 22, -bh / 2 + 46 + i * 44, Object.assign({ color: b.me ? '#FFFFFF' : C.ink, align: 'left' }, f)); });
    });
    by += bh + 22;
  }
}
// the model: a machine card with blinking lights and a slot on top
function gpModel(T, K, x, y, w, h, t, busy = 0) {
  uiCard(T, K, x - w / 2, y - h / 2, w, h, { r: 30, border: C.ink, lw: 5, fill: '#15161A' });
  text(K, 'MODEL', x, y + 18, { font: F.grot, weight: 700, size: 56, color: '#FFFFFF', ls: 4 });
  for (let i = 0; i < 6; i++) { const on = busy > 0 && Math.sin(t * 14 + i * 1.7) > 0; circle(K, x - w / 2 + 40 + i * 28, y + h / 2 - 32, 8, on ? C.red : '#3A3B40'); }
  fillRR(K, x - 90, y - h / 2 - 10, 180, 20, 8, '#3A3B40');
}
// weighted wheel: segs [{p, label, fill}], rot in radians; pointer at the top
function gpWheel(T, K, cx, cy, r, segs, rot) {
  circle(T, cx + 10, cy + 14, r + 8, C.k40);
  let a0 = -Math.PI / 2 + rot;
  for (const s of segs) {
    const a1 = a0 + s.p * TAU;
    K.beginPath(); K.moveTo(cx, cy); K.arc(cx, cy, r, a0, a1); K.closePath(); K.fillStyle = s.fill; K.fill(); K.lineWidth = 4; K.strokeStyle = C.ink; K.stroke();
    if (s.p > 0.08) { const am = (a0 + a1) / 2; text(K, s.label, cx + Math.cos(am) * r * 0.6, cy + Math.sin(am) * r * 0.6 + 12, { font: F.grot, weight: 700, size: 32, color: s.ink || C.ink }); }
    a0 = a1;
  }
  circle(K, cx, cy, r, null, C.ink, 7); circle(K, cx, cy, 16, '#FFFFFF', C.ink, 5);
  K.beginPath(); K.moveTo(cx - 22, cy - r - 30); K.lineTo(cx + 22, cy - r - 30); K.lineTo(cx, cy - r + 12); K.closePath(); K.fillStyle = C.ink; K.fill();
}
// rotation for a spin that starts at t0 and lands (after dur) so that `target` fraction (0..1 of the wheel) is under the pointer
function gpSpinRot(t, spins) {
  let rot = 0;
  for (const s of spins) {
    if (t < s.t0) break;
    const u = clamp((t - s.t0) / s.dur), land = -s.target * TAU, from = s.from || 0, tot = land - from - TAU * (s.turns || 4);
    rot = from + tot * E.outCubic(u);
  }
  return rot;
}
function gpCam(t, FOCUS, S0, S1, o = {}) {
  const { k = 0.24, ky = 0.17, z = 0.08 } = o;
  const rel = E.inOutCubic(clamp((t - S0) / 0.5)) * (1 - E.inOutCubic(clamp((t - S1 + 0.35) / 0.35)));
  const f = focusTrack(t, FOCUS, 0.45), fx = Array.isArray(f) ? f[0] : 540, fy = Array.isArray(f) ? f[1] : 960;
  return { x: ((540 - fx) * k + 22 * Math.sin(t * 1.3)) * rel, y: ((960 - fy) * ky + 14 * Math.cos(t * 1.1)) * rel, z: 1 + (z + 0.02 * Math.sin(t * 1.2)) * rel, r: 0.008 * Math.sin(t * 0.9) * rel };
}
function gpKicks(times, amp = 0.45) { for (const t of times) kick(t + 0.02, amp, 0.45, 0.6); }
function gpPlane(K, t, t0, x0, y0, x1, y1) {
  const dt = t - t0; if (dt < 0) return;
  const u = E.inOutCubic(clamp(dt / 0.9)), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 120;
  X([K], x, y, 1, -35 + u * 10, () => { K.beginPath(); K.moveTo(-60, 0); K.lineTo(60, -30); K.lineTo(-20, 30); K.closePath(); K.fillStyle = '#FFFFFF'; K.fill(); K.lineWidth = 5; K.strokeStyle = C.ink; K.stroke(); line(K, -20, 30, -10, 8, C.ink, 5); });
}

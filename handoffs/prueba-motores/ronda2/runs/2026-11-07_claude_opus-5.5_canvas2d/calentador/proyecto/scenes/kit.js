// ═════════════ shared props for this reel (prefixed ch*): the heater, its pipes, the water, a thermometer, small icons ═════════════
const CH_COLD = '#2F6FE0', CH_COPPER = '#C8743A', CH_SUN = '#FFB423';
const chHot = () => C.red;                                   // accent = hot water (theme.accent in reel.json)

function chLens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
function chAt(P, L, d) {
  d = clamp(d, 0, L[L.length - 1]);
  for (let i = 1; i < P.length; i++) if (d <= L[i]) { const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; }
  return P[P.length - 1];
}
// a pipe drawn on progressively (p 0..1): ink outline + coloured core
function chPipe(K, P, p, col = '#FFFFFF', lw = 22) {
  if (p <= 0) return;
  const L = chLens(P), d = L[L.length - 1] * clamp(p);
  const path = c => { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) { if (L[i] <= d) c.lineTo(P[i][0], P[i][1]); else { const q = chAt(P, L, d); c.lineTo(q[0], q[1]); break; } } };
  K.save(); K.lineCap = 'round'; K.lineJoin = 'round';
  path(K); K.lineWidth = lw + 10; K.strokeStyle = C.ink; K.stroke();
  path(K); K.lineWidth = lw; K.strokeStyle = col; K.stroke(); K.restore();
}
// water drops travelling along a path: colour(u) by position, a = alpha, from t0
function chFlow(K, P, t, t0, o = {}) {
  if (t < t0) return;
  const { speed = 150, gap = 46, r = 9, col = () => chHot(), a = 1, back = false } = o;
  const L = chLens(P), tot = L[L.length - 1], reach = tot * E.outCubic(clamp((t - t0) / 0.6));
  K.save(); K.globalAlpha *= a;
  for (let d = ((t - t0) * speed) % gap; d < reach; d += gap) {
    const dd = back ? tot - d : d, q = chAt(P, L, dd), u = dd / tot;
    circle(K, q[0], q[1], r, col(u), C.ink, 3);
  }
  K.restore();
}
// thermometer: x, y = bulb centre, h = tube height, lvl 0..1
function chThermo(T, K, x, y, h, lvl, col) {
  fillRR(T, x - 22 + 8, y - h + 10, 44, h, 22, C.k30);
  fillRR(K, x - 22, y - h, 44, h, 22, '#FFFFFF'); strokeRR(K, x - 22, y - h, 44, h, 22, C.ink, 5);
  const lh = (h - 40) * clamp(lvl);
  fillRR(K, x - 10, y - 20 - lh, 20, lh + 20, 10, col);
  circle(K, x, y + 6, 34, col, C.ink, 5);
  for (let i = 1; i < 5; i++) line(K, x + 22, y - h * i / 5, x + 36, y - h * i / 5, C.ink, 4);
}
// horizontal storage tank (rounded), strat = 0..1 how much of it is hot (top part red, bottom blue)
function chTank(T, K, x, y, w, h, o = {}) {
  const { strat = 0.55, ins = 0, t = 0, warm = 1 } = o;
  fillRR(T, x + 14, y + 18, w, h, h / 2, C.k40);
  if (ins > 0) {                                              // insulation jacket: a thick hatched layer that wraps on
    const g = 26 * E.outBack(clamp(ins));
    fillRR(K, x - g, y - g, w + 2 * g, h + 2 * g, (h + 2 * g) / 2, '#F2D9A8'); strokeRR(K, x - g, y - g, w + 2 * g, h + 2 * g, (h + 2 * g) / 2, C.ink, 5);
    K.save(); rr(K, x - g, y - g, w + 2 * g, h + 2 * g, (h + 2 * g) / 2); K.clip(); K.strokeStyle = '#C9A866'; K.lineWidth = 4;
    for (let i = -h; i < w + h; i += 22) { K.beginPath(); K.moveTo(x + i, y - g); K.lineTo(x + i - 40, y + h + g); K.stroke(); }
    K.restore();
  }
  K.save(); rr(K, x, y, w, h, h / 2); K.clip();
  K.fillStyle = CH_COLD; K.fillRect(x, y, w, h);
  const hy = y + h * (1 - strat) + Math.sin(t * 2) * 3;
  const gr = K.createLinearGradient(0, hy - 30, 0, hy + 30); gr.addColorStop(0, chHot()); gr.addColorStop(1, CH_COLD);
  K.fillStyle = chHot(); K.fillRect(x, y, w, hy - y - 30); K.fillStyle = gr; K.fillRect(x, hy - 30, w, 60);
  K.globalAlpha = 0.25 * warm; for (let i = 0; i < 6; i++) { const bx = x + w * ((i * 0.17 + t * 0.05) % 1), by = y + 18 + 10 * Math.sin(t * 3 + i); circle(K, bx, by, 6, '#FFFFFF'); }
  K.restore();
  strokeRR(K, x, y, w, h, h / 2, C.ink, 6);
  line(K, x + 30, y + 16, x + w * 0.6, y + 16, 'rgba(255,255,255,0.7)', 6);
}
// the flat collector seen from the front: frame, black plate, copper harp, glass (each 0..1)
function chCollector(T, K, x, y, w, h, o = {}) {
  const { plate = 1, tubes = 1, glass = 1, heat = 0, t = 0 } = o;
  fillRR(T, x + 16, y + 20, w, h, 18, C.k40);
  fillRR(K, x, y, w, h, 18, '#E6E3DC'); strokeRR(K, x, y, w, h, 18, C.ink, 6);
  const ix = x + 24, iy = y + 24, iw = w - 48, ih = h - 48;
  if (plate > 0) { K.save(); K.globalAlpha = clamp(plate); fillRR(K, ix, iy, iw, ih, 8, '#1C1C1E');
    if (heat > 0) { const g = K.createRadialGradient(ix + iw / 2, iy + ih / 2, 10, ix + iw / 2, iy + ih / 2, iw * 0.7); g.addColorStop(0, `rgba(255,70,30,${0.55 * heat})`); g.addColorStop(1, 'rgba(255,70,30,0)'); K.fillStyle = g; K.fillRect(ix, iy, iw, ih); }
    K.restore(); }
  if (tubes > 0) {                                            // harp: top + bottom headers, 7 risers, drawn on staggered
    const n = 7, hp = clamp(tubes * 1.6), col = heat > 0.5 ? '#E0743C' : CH_COPPER;
    strokeP(K, c => { c.beginPath(); c.moveTo(ix + 10, iy + 26); c.lineTo(ix + iw - 10, iy + 26); }, iw, hp, col, 12);
    strokeP(K, c => { c.beginPath(); c.moveTo(ix + 10, iy + ih - 26); c.lineTo(ix + iw - 10, iy + ih - 26); }, iw, hp, col, 12);
    for (let i = 0; i < n; i++) { const rx = ix + 40 + i * (iw - 80) / (n - 1), rp = clamp(tubes * 1.8 - 0.4 - i * 0.06);
      strokeP(K, c => { c.beginPath(); c.moveTo(rx, iy + ih - 26); c.lineTo(rx, iy + 26); }, ih, rp, col, 9); }
  }
  if (glass > 0) {                                            // glass slides down onto the frame
    const gy = y - (1 - E.outCubic(clamp(glass))) * 520, a = clamp(glass * 2);
    K.save(); K.globalAlpha = a; fillRR(K, x - 6, gy - 6, w + 12, h + 12, 20, 'rgba(190,225,240,0.28)'); strokeRR(K, x - 6, gy - 6, w + 12, h + 12, 20, '#7FB3CC', 5);
    K.strokeStyle = 'rgba(255,255,255,0.75)'; K.lineWidth = 8;
    for (const f of [0.18, 0.26, 0.62]) { K.beginPath(); K.moveTo(x + w * f, gy + 10); K.lineTo(x + w * f - 90, gy + h - 10); K.stroke(); }
    K.restore();
  }
}
// small icons
function chPlug(K, x, y, s, col = C.ink) {
  X([K], x, y, s, 0, () => { fillRR(K, -40, -30, 80, 70, 14, '#FFFFFF'); strokeRR(K, -40, -30, 80, 70, 14, col, 6);
    line(K, -16, -30, -16, -60, col, 8); line(K, 16, -30, 16, -60, col, 8);
    K.beginPath(); K.moveTo(0, 40); K.bezierCurveTo(0, 90, -70, 80, -80, 130); K.lineWidth = 8; K.strokeStyle = col; K.stroke(); });
}
function chPump(K, x, y, s, t, col = C.ink) {
  X([K], x, y, s, 0, () => { circle(K, 0, 0, 52, '#FFFFFF', col, 7);
    K.save(); K.translate(0, 0); K.rotate(t * 6); for (let i = 0; i < 4; i++) { K.rotate(Math.PI / 2); fillRR(K, -6, -44, 12, 40, 6, col); } K.restore();
    circle(K, 0, 0, 10, col); fillRR(K, 40, -16, 46, 32, 6, '#FFFFFF'); strokeRR(K, 40, -16, 46, 32, 6, col, 6); });
}
function chSun(T, K, x, y, r, t, a = 1) {
  if (a <= 0) return;
  glow(T, x, y, r * 2.2, r * 2.2, 0.5 * a);
  K.save(); K.globalAlpha = a; K.translate(x, y); K.rotate(t * 0.6);
  for (let i = 0; i < 12; i++) { K.rotate(TAU / 12); fillRR(K, r + 10, -7, r * 0.55 + 8 * Math.sin(t * 4 + i), 14, 7, CH_SUN); }
  K.restore(); circle(K, x, y, r * a, CH_SUN, C.ink, 6);
}
// a little car with heat shimmer (for "like a car parked in the sun")
function chCar(T, K, x, y, s, t) {
  X([T, K], x, y, s, 0, () => {
    fillRR(T, -150 + 10, -40 + 12, 300, 90, 30, C.k40);
    K.beginPath(); K.moveTo(-90, -40); K.lineTo(-50, -100); K.lineTo(60, -100); K.lineTo(100, -40); K.closePath(); K.fillStyle = '#9CC9E8'; K.fill(); K.lineWidth = 6; K.strokeStyle = C.ink; K.stroke();
    fillRR(K, -150, -40, 300, 90, 30, C.red); strokeRR(K, -150, -40, 300, 90, 30, C.ink, 6);
    circle(K, -85, 52, 30, '#2A2A2E', C.ink, 6); circle(K, 85, 52, 30, '#2A2A2E', C.ink, 6);
    for (let i = 0; i < 3; i++) { const ox = -50 + i * 50; K.beginPath(); for (let k = 0; k <= 20; k++) { const yy = -120 - k * 4, xx = ox + 8 * Math.sin(k * 0.6 + t * 6 + i); k ? K.lineTo(xx, yy) : K.moveTo(xx, yy); } K.lineWidth = 5; K.strokeStyle = C.red; K.stroke(); }
  });
}
// label pill with an arrow (↑ / ↓)
function chTagArrow(T, K, str, x, y, dir, dt, col) {
  if (dt < 0) return;
  const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2);
  X([T, K], x, y, s, dir < 0 ? -3 : 3, () => {
    const f = { font: F.grot, weight: 700, size: 44, ls: 1 }, w = measure(K, str, f) + 110;
    fillRR(T, -w / 2 + 8, -38 + 10, w, 76, 38, C.k40); fillRR(K, -w / 2, -38, w, 76, 38, col); strokeRR(K, -w / 2, -38, w, 76, 38, C.ink, 5);
    text(K, str, -18, 16, Object.assign({ color: '#FFFFFF', align: 'center' }, f));
    const ax = w / 2 - 40, bob = Math.sin(dt * 6) * 5 * dir;
    K.save(); K.translate(ax, bob); K.rotate(dir < 0 ? 0 : Math.PI); K.fillStyle = '#FFFFFF';
    K.beginPath(); K.moveTo(0, -24); K.lineTo(18, 2); K.lineTo(6, 2); K.lineTo(6, 22); K.lineTo(-6, 22); K.lineTo(-6, 2); K.lineTo(-18, 2); K.closePath(); K.fill(); K.restore();
  });
}
// camera that follows the presenter's focus (lean + zoom), releases to identity at the scene end; small kicks on every event
function chCam(t, FOCUS, S0, S1, o = {}) {
  const { k = 0.2, ky = 0.14, z = 0.07 } = o;
  const rel = E.inOutCubic(clamp((t - S0) / 0.5)) * (1 - E.inOutCubic(clamp((t - S1 + 0.35) / 0.35)));
  const f = focusTrack(t, FOCUS, 0.45), fx = Array.isArray(f) ? f[0] : 540, fy = Array.isArray(f) ? f[1] : 960;
  return { x: (540 - fx) * k * rel, y: (960 - fy) * ky * rel, z: 1 + (z + 0.015 * Math.sin(t * 0.9)) * rel, r: 0.006 * Math.sin(t * 0.7) * rel };
}
function chKicks(times, amp = 0.32) { for (const t of times) kick(t + 0.02, amp, 0.35, 0.6); }

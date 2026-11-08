// ═════════════ 02 · PANEL [CUT_PANEL → CUT_LOOP] ═════════════
// "The flat PANEL is a BLACK metal PLATE with COPPER TUBES, under a sheet of GLASS. SUNLIGHT PASSES through the glass and HEATS the
//  plate, and the glass TRAPS that heat, like a CAR parked in the sun."
// The collector builds itself layer by layer on its words (frame → black plate slams → copper harp draws on → glass slides down),
// then the sun's rays pass through the glass, the plate glows and a thermometer climbs; heat waves bounce back off the glass; a hot car.
(() => {
  const S0 = CUT_PANEL, S1 = CUT_LOOP;
  const T_PANEL = wi(28), T_BLACK = wi(31), T_COPPER = wi(35), T_GLASS = wi(41), T_SUN = wi(42), T_PASS = wi(43), T_HEATS = wi(48),
    T_TRAPS = wi(54), T_CAR = wi(59);
  const R = { x: 80, y: 600, w: 780, h: 520 };
  const SUN = [940, 520], TH = [965, 1120];
  kick(T_BLACK + 0.03, 0.5, 0.5); cue(T_BLACK, 'thud', -4); cue(T_COPPER, 'swoosh', -10); cue(T_GLASS, 'swoosh', -6);
  cue(T_SUN, 'shimmer', -6); cue(T_HEATS, 'riser', -12); cue(T_TRAPS, 'pop', -8); cue(T_CAR, 'pop', -4); kick(T_CAR + 0.03, 0.5, 0.4);

  const LABELS = [[T_PANEL, 'COLLECTOR'], [T_BLACK, 'BLACK PLATE'], [T_COPPER, 'COPPER TUBES'], [T_GLASS, 'GLASS'], [T_HEATS, 'HOT PLATE'], [T_TRAPS, 'HEAT TRAPPED']];
  function label(T, K, t) {
    let k = -1; for (let i = 0; i < LABELS.length; i++) if (t >= LABELS[i][0]) k = i;
    if (k < 0) return;
    const [t0, str] = LABELS[k], s = clamp(pop(t - t0, 2.8, 0.45), 0, 1.2);
    X([T, K], R.x + 210, R.y - 50, s, -2, () => { const f = { font: F.grot, weight: 700, size: 40, ls: 1 }, w = measure(K, str, f) + 60;
      fillRR(T, -w / 2 + 8, -34 + 10, w, 68, 34, C.k40); fillRR(K, -w / 2, -34, w, 68, 34, C.ink); text(K, str, 0, 14, Object.assign({ color: '#FFFFFF' }, f)); });
  }
  const rays = [[R.x + 180, R.y + 300], [R.x + 380, R.y + 220], [R.x + 560, R.y + 330]];
  function sunRays(K, t) {
    const p = clamp((t - T_PASS) / 0.6); if (p <= 0) return;
    for (let i = 0; i < rays.length; i++) {
      const [ex, ey] = rays[i], q = clamp(p * 1.3 - i * 0.15);
      K.save(); K.globalAlpha = 0.9; arrow(K, SUN[0] - 40, SUN[1] + 30, lerp(SUN[0] - 40, ex, q), lerp(SUN[1] + 30, ey, q), q > 0 ? 1 : 0, { col: CH_SUN, lw: 12, bend: 0, head: 30 }); K.restore();
      if (q >= 1 && t > T_HEATS - 0.2) shock(K, ex, ey, (t - T_PASS - 0.6) % 0.9, { r: 50, color: chHot(), lw: 4, dur: 0.6 });
    }
  }
  // heat waves rise from the plate, hit the glass and bounce back down (trapped)
  function trapped(K, t) {
    const a = clamp((t - T_TRAPS + 0.1) / 0.3); if (a <= 0) return;
    for (let i = 0; i < 3; i++) {
      const x0 = R.x + 160 + i * 190, ph = ((t - T_TRAPS) * 0.9 + i * 0.33) % 1, gy = R.y + 26, py = R.y + R.h - 60;
      const up = ph < 0.5, u = up ? ph / 0.5 : (ph - 0.5) / 0.5, y = up ? lerp(py, gy + 20, u) : lerp(gy + 20, py - 80, u);
      K.save(); K.globalAlpha = a; K.strokeStyle = chHot(); K.lineWidth = 7; K.lineCap = 'round'; K.beginPath();
      for (let k = 0; k <= 14; k++) { const yy = y + (up ? 1 : -1) * k * 6, xx = x0 + (up ? 0 : 30) + 10 * Math.sin(k * 0.9 + t * 8); k ? K.lineTo(xx, yy) : K.moveTo(xx, yy); }
      K.stroke(); K.restore();
      if (!up && u < 0.25) shock(K, x0 + 15, gy + 22, u * 0.4, { r: 30, color: '#7FB3CC', lw: 4, dur: 0.1 });
    }
  }
  chKicks([T_PANEL, T_COPPER, T_GLASS, T_SUN, T_HEATS, T_TRAPS]);
  const FOCUS = [[S0 + 0.1, R.x + R.w / 2, R.y + R.h / 2], [T_BLACK, R.x + R.w / 2, R.y + R.h / 2], [T_GLASS, R.x + R.w / 2, R.y + 60],
    [T_SUN, SUN[0] - 60, SUN[1] + 40], [T_HEATS, TH[0] - 40, TH[1] - 200], [T_TRAPS, R.x + R.w / 2, R.y + 80], [T_CAR, 300, 1180]];
  const MOODS = [['lean', T_GLASS, T_GLASS + 0.6], ['thumbs', T_CAR + 0.2, S1 - 0.25]];
  SC.panel = {
    label: '// 02 — the collector',
    readout: t => ({ k: 'PLATE', v: Math.round(lerp(28, 72, springTo(t, [[0, 0], [T_HEATS, 0.4], [T_HEATS + 0.8, 1]], 1.6, 0.5))) + '°C', hot: t > T_HEATS }),
    cam: t => chCam(t, FOCUS, S0, S1),
    draw(T, K, t) {
      moodFx(T, K, t, MOODS);
      const fa = clamp(pop(t - S0 - 0.02, 2.4, 0.55), 0, 1.15), sl = ring(t - T_BLACK, 4, 9) * 0.03;
      const heat = springTo(t, [[0, 0], [T_HEATS, 0.6], [T_HEATS + 0.6, 1]], 1.6, 0.5);
      X([T, K], R.x + R.w / 2, R.y + R.h / 2, fa * (1 + sl), 0, () => chCollector(T, K, -R.w / 2, -R.h / 2, R.w, R.h, {
        plate: clamp((t - T_BLACK + 0.1) / 0.2), tubes: clamp((t - T_COPPER + 0.05) / 0.9), glass: clamp((t - T_GLASS + 0.35) / 0.45), heat, t }));
      if (t >= T_BLACK && t < T_BLACK + 0.4) impact(T, K, R.x + R.w / 2, R.y + R.h / 2, t - T_BLACK, 0.8, 3);
      trapped(K, t);
      chSun(T, K, SUN[0], SUN[1], 56, t, clamp(pop(t - T_SUN, 2.4, 0.5), 0, 1.1));
      sunRays(K, t);
      if (t >= T_HEATS - 0.3) { const tp = clamp(pop(t - T_HEATS + 0.3, 2.4, 0.5), 0, 1.15);
        X([T, K], TH[0], TH[1], tp, 0, () => chThermo(T, K, 0, 0, 360, springTo(t, [[0, 0.15], [T_HEATS, 0.55], [T_HEATS + 0.7, 0.88]], 1.6, 0.35), chHot())); }
      if (t >= T_CAR - 0.05) chCar(T, K, 300, 1250, clamp(pop(t - T_CAR + 0.05, 2.6, 0.45), 0, 1.2) * 0.85, t);
      label(T, K, t);
    },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

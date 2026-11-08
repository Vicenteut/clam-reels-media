// ═════════════ 01 · HOOK [0 → CUT_PANEL] ═════════════
// "How does that BOX on your neighbor's roof give hot SHOWERS without a single WIRE or PUMP? It runs on one simple RULE: HOT water RISES."
// Stage: a house drops in at frame 0, the heater box slams onto its roof on "box", a shower runs inside on "showers", WIRE and PUMP
// badges land and get crossed out; on "rule" the house stage falls away and a beaker of water shows hot water rising (stamp on "rises").
(() => {
  const S0 = 0, S1 = CUT_PANEL;
  const T_BOX = wi(3), T_SHOWER = wi(9), T_WIRE = wi(14), T_PUMP = wi(16), T_RULE = wi(22), T_HOT = wi(23), T_RISES = wi(25);
  const OUT = T_RULE - 0.05;                                    // the house stage leaves here
  kick(T_BOX + 0.03, 0.6, 0.6); cue(T_BOX, 'thud', -4); cue(T_SHOWER, 'swoosh', -10);
  cue(T_WIRE + 0.15, 'stamp', -6); cue(T_PUMP + 0.3, 'stamp', -4); kick(T_PUMP + 0.3, 0.5, 0.5);
  cue(OUT, 'whoosh', -8); cue(T_RISES + 0.02, 'stamp', -2); kick(T_RISES + 0.05, 0.9, 0.8);

  const fallAt = (t, seed) => t < OUT ? { dx: 0, dy: 0, r: 0 } : gravityFall(t, OUT, (hash(seed) - 0.5) * 500, -500, (hash(seed + 3) - 0.5) * 140);

  function house(T, K, t) {
    const a = clamp(pop(t + 0.05, 2.4, 0.5), 0, 1.15), f = fallAt(t, 1);
    if (f.dy > 1600) return;
    X([T, K], 350 + f.dx, 1290 + f.dy + (1 - a) * -700, 1.18, f.r, () => {
      fillRR(T, -240 + 16, -390 + 20, 480, 390, 10, C.k40);
      fillRR(K, -240, -390, 480, 390, 10, '#FFFFFF'); strokeRR(K, -240, -390, 480, 390, 10, C.ink, 6);
      fillRR(K, -270, -420, 540, 40, 8, '#E6E3DC'); strokeRR(K, -270, -420, 540, 40, 8, C.ink, 6);   // flat roof slab
      // cutaway bathroom window
      fillRR(K, -190, -330, 260, 290, 14, '#EEF4F7'); strokeRR(K, -190, -330, 260, 290, 14, C.ink, 5);
      fillRR(K, 120, -260, 80, 260, 8, '#E6E3DC'); strokeRR(K, 120, -260, 80, 260, 8, C.ink, 5);   // door
      // shower: head + drops + steam (from "showers")
      line(K, -60, -330, -60, -290, C.ink, 8); fillRR(K, -100, -296, 80, 22, 10, '#B9B5AC'); strokeRR(K, -100, -296, 80, 22, 10, C.ink, 4);
      const sp = clamp((t - T_SHOWER + 0.1) / 0.3);
      if (sp > 0) {
        for (let i = 0; i < 9; i++) { const ox = -92 + (i % 5) * 16, ph = ((t * 1.6 + hash(i) ) % 1); circle(K, ox + ph * (i - 4) * 6, -268 + ph * 220, 5, CH_COLD, null); }
        K.save(); K.globalAlpha = 0.55 * sp; for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; circle(K, -120 + i * 45 + Math.sin(t * 2 + i) * 10, -90 - ph * 160, 22 + ph * 20, '#FFFFFF', '#CFCBC2', 3); } K.restore();
        if (t > T_SHOWER) X([K], 30, -200, clamp(pop(t - T_SHOWER, 2.6, 0.45), 0, 1.2), 6, () => { fillRR(K, -50, -26, 100, 52, 26, C.red); text(K, 'HOT', 0, 14, { font: F.grot, weight: 700, size: 34, color: '#FFFFFF' }); });
      }
    });
  }
  // the heater on the roof: slams on "box", then a "?" pulses next to it
  function heater(T, K, t) {
    const dt = t - T_BOX; if (dt < -0.25) return null;
    const f = fallAt(t, 2); if (f.dy > 1600) return null;
    const drop = dt < 0 ? -(1 - E.inCubic((dt + 0.25) / 0.25)) * 600 : 0, sq = dt >= 0 ? ring(dt, 4, 10) * 0.12 : 0;
    const x = 350 + f.dx, y = 794 + f.dy + drop;
    X([T, K], x, y, 1.18, f.r, () => {
      for (const c of [T, K]) { c.save(); c.scale(1 + sq, 1 - sq); }
      K.save(); K.translate(-40, -10); K.rotate(-0.42); fillRR(K, -150, -34, 300, 68, 8, '#1C1C1E'); strokeRR(K, -150, -34, 300, 68, 8, C.ink, 5);
      for (let i = 1; i < 6; i++) line(K, -150 + i * 50, -30, -150 + i * 50, 30, CH_COPPER, 4); K.restore();
      chTank(T, K, -10, -230, 230, 86, { strat: 0.5, t });
      line(K, 20, -144, -60, -40, C.ink, 6); line(K, 180, -144, 150, -10, C.ink, 6);
      for (const c of [T, K]) c.restore();
    });
    if (dt > 0.2 && t < OUT) X([K], x + 230, y - 250, 1 + ring(dt - 0.2, 3, 6) * 0.2 + 0.04 * Math.sin(t * 5), 8, () => {
      circle(K, 0, 0, 52, C.red, C.ink, 5); text(K, '?', 0, 26, { font: F.grot, weight: 700, size: 76, color: '#FFFFFF' }); });
    return [x, y - 120];
  }
  // WIRE / PUMP badges (right column), crossed out on their words
  function badge(T, K, t, i, y, tIn, tX, label) {
    const dt = t - tIn; if (dt < 0) return;
    const f = fallAt(t, 5 + i); if (f.dy > 1600) return;
    const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2), id = idleSway(t, i * 3, 0.5);
    X([T, K], 840 + f.dx + id.dx, y + f.dy + id.dy, s * 1.1, f.r + id.r, () => {
      uiCard(T, K, -160, -110, 320, 220, { r: 26, border: C.ink, lw: 4 });
      if (i === 0) chPlug(K, -10, -30, 0.85); else chPump(K, -20, -20, 0.85, t < tX ? t : tX);
      text(K, label, 0, 88, { font: F.grot, weight: 700, size: 40, color: C.ink });
      cross(K, 0, -10, 150, clamp((t - tX) / 0.22), C.red, 16);
    });
  }
  // the rule: a beaker of water over a flame, hot (red) blobs rise in the middle, cool (blue) ones sink at the sides
  function beaker(T, K, t) {
    const dt = t - T_RULE; if (dt < 0) return;
    const s = clamp(pop(dt, 2.2, 0.55), 0, 1.15);
    X([T, K], 470, 960, s * 1.15, 0, () => {
      uiCard(T, K, -260, -380, 520, 600, { r: 30, border: C.ink, lw: 5 });
      text(K, '// one rule', -230, -330, { font: F.mono, weight: 700, size: 24, color: '#8a8780', align: 'left' });
      // beaker
      const bx = -170, by = -280, bw = 340, bh = 380;
      K.save(); rr(K, bx, by + 40, bw, bh - 40, 24); K.clip(); K.fillStyle = '#DCEBF5'; K.fillRect(bx, by, bw, bh);
      const on = clamp((t - T_HOT) / 0.4);
      for (let i = 0; i < 10; i++) {                                    // convection: up the middle (hot), down the sides (cold)
        const ph = (t * 0.35 + i / 10) % 1, side = i % 2 ? 1 : -1;
        const up = [lerp(0, side * 30, Math.sin(ph * Math.PI)), by + bh - 30 - ph * (bh - 90)];
        circle(K, up[0], up[1], 14, on > 0 ? chHot() : '#9DB8CC', C.ink, 3);
        const dn = [side * (bw / 2 - 40), by + 70 + ph * (bh - 120)];
        circle(K, dn[0], dn[1], 11, on > 0 ? CH_COLD : '#9DB8CC', C.ink, 3);
      }
      K.restore();
      strokeRR(K, bx, by + 40, bw, bh - 40, 24, C.ink, 6);
      // flame
      for (let i = 0; i < 3; i++) { const fx = -40 + i * 40, fl = 40 + 10 * Math.sin(t * 9 + i * 2);
        K.beginPath(); K.moveTo(fx - 16, by + bh + 60); K.quadraticCurveTo(fx, by + bh + 60 - fl * 2, fx + 16, by + bh + 60); K.closePath(); K.fillStyle = CH_SUN; K.fill(); K.lineWidth = 4; K.strokeStyle = C.ink; K.stroke(); }
      if (on > 0) arrow(K, 0, by + bh - 60, 0, by + 70, clamp((t - T_HOT) / 0.5), { col: C.red, lw: 10, bend: 0, head: 34 });
    });
    if (t >= T_RISES) X([T, K], 560, 640, 1, 0, () => stamp(K, T, 'HOT WATER RISES', 0, 0, t - T_RISES, { size: 74, rot: -6 }));
  }

  chKicks([T_SHOWER, T_WIRE + 0.15, T_RULE]);
  const FOCUS = [[0.15, 350, 980], [T_BOX, 350, 780], [T_SHOWER, 300, 1040], [T_WIRE - 0.2, 840, 640], [T_PUMP - 0.15, 840, 900], [T_RULE, 470, 900], [T_RISES, 560, 660]];
  const MOODS = [['thinking', 0.15, T_SHOWER - 0.1], ['shock', T_PUMP + 0.3, T_PUMP + 1.0], ['lean', T_RISES, T_RISES + 0.6]];
  SC.hook = {
    label: '// 01 — solar water heater',
    cam: t => chCam(t, FOCUS, S0, S1),
    draw(T, K, t) {
      moodFx(T, K, t, MOODS);
      house(T, K, t); heater(T, K, t);
      badge(T, K, t, 0, 650, T_WIRE - 0.3, T_WIRE + 0.15, 'WIRE');
      badge(T, K, t, 1, 910, T_PUMP - 0.25, T_PUMP + 0.3, 'PUMP');
      beaker(T, K, t);
    },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

// ═════════════ 03 · LOOP [CUT_LOOP → CUT_NIGHT] ═════════════
// "So the WATER in the tubes WARMS up, gets LIGHTER, and RISES into the TANK sitting ABOVE the panel. COLDER, HEAVIER water SINKS from the
//  bottom of the tank into the PANEL to take its place. That LOOP keeps turning ALL DAY with NO PUMP. It's called a THERMOSIPHON."
// Side view of the system: collector tilted low-left, tank higher up-right. Drops in the collector turn red as they warm and climb; the
// hot pipe draws on and red drops ride up into the tank (which drops in on "tank"); a dimension marks "above"; blue drops sink down the
// cold pipe into the collector's bottom; on "loop" a turning loop arrow; "no pump" = crossed pump; THERMOSIPHON stamp.
(() => {
  const S0 = CUT_LOOP, S1 = CUT_NIGHT;
  const T_WATER = wi(66), T_WARMS = wi(70), T_LIGHT = wi(73), T_RISES = wi(75), T_TANK = wi(78), T_ABOVE = wi(80), T_COLD = wi(83),
    T_HEAVY = wi(84), T_SINKS = wi(86), T_INTO = wi(95), T_LOOPW = wi(101), T_DAY = wi(104), T_NO = wi(107), T_PUMPX = wi(108),
    T_THERMO = wi(112) + THERMO_DELAY;
  const CB = [160, 1210], CT = [500, 900];                                   // collector bottom / top ends
  const COLL = [[185, 1186], [478, 920]];
  const TANK = { x: 600, y: 590, w: 380, h: 150 };
  const HOT = [[505, 893], [562, 842], [562, 640], [600, 640]];
  const COLD = [[662, 740], [662, 1265], [112, 1265], [112, 1215], [152, 1212]];
  const LOOPC = [535, 1125];
  kick(T_TANK + 0.03, 0.6, 0.6); cue(T_TANK, 'thud', -4); cue(T_RISES, 'swoosh', -8); cue(T_SINKS, 'swoosh', -8); cue(T_LIGHT, 'pop', -8);
  cue(T_HEAVY, 'pop', -8); cue(T_LOOPW, 'riser', -10); cue(T_PUMPX, 'stamp', -6); cue(T_THERMO, 'stamp', -2); kick(T_THERMO + 0.04, 1, 0.8);

  function collector(T, K, t) {
    const a = clamp(pop(t - S0 - 0.02, 2.4, 0.55), 0, 1.15), ang = Math.atan2(CT[1] - CB[1], CT[0] - CB[0]), len = Math.hypot(CT[0] - CB[0], CT[1] - CB[1]);
    X([T, K], (CB[0] + CT[0]) / 2, (CB[1] + CT[1]) / 2, a, ang / D2R, () => {
      fillRR(T, -len / 2 + 10, -44 + 14, len, 88, 14, C.k40);
      fillRR(K, -len / 2, -44, len, 88, 14, '#1C1C1E'); strokeRR(K, -len / 2, -44, len, 88, 14, C.ink, 6);
      fillRR(K, -len / 2 + 6, -48, len - 12, 14, 7, 'rgba(190,225,240,0.6)');           // glass edge on the sunny side
      for (let i = -2; i <= 2; i++) line(K, -len / 2 + 30, i * 14, len / 2 - 30, i * 14, CH_COPPER, 3);
    });
    // stand + roof line
    line(K, 120, 1290, 560, 1290, '#B9B5AC', 6); line(K, CT[0] - 10, CT[1] + 40, CT[0] - 10, 1290, C.ink, 6);
    // water climbing inside, blue → red once it warms
    const warm = clamp((t - T_WARMS) / 0.8);
    chFlow(K, COLL, t, T_WATER - 0.2, { speed: t > T_LOOPW ? 95 : 60, gap: 44, r: 9, col: u => (u * warm > 0.35 ? chHot() : CH_COLD) });
  }
  function tank(T, K, t) {
    const dt = t - T_TANK; if (dt < -0.25) return;
    const drop = dt < 0 ? -(1 - E.inCubic((dt + 0.25) / 0.25)) * 700 : 0, sq = dt >= 0 ? ring(dt, 4, 10) * 0.1 : 0;
    X([T, K], TANK.x + TANK.w / 2, TANK.y + TANK.h + drop, 1, 0, () => {
      for (const c of [T, K]) { c.save(); c.scale(1 + sq, 1 - sq); }
      chTank(T, K, -TANK.w / 2, -TANK.h, TANK.w, TANK.h, { strat: lerp(0.3, 0.72, clamp((t - T_TANK) / 10)), t });
      for (const c of [T, K]) c.restore();
    });
    line(K, TANK.x + 60, TANK.y + TANK.h + 4, TANK.x + 60, 1290, '#B9B5AC', 6); line(K, TANK.x + TANK.w - 60, TANK.y + TANK.h + 4, TANK.x + TANK.w - 60, 1290, '#B9B5AC', 6);
  }
  function above(K, t) {
    const p = clamp((t - T_ABOVE) / 0.35); if (p <= 0) return;
    const x = 800, y0 = CT[1], y1 = TANK.y + TANK.h + 6;
    K.save(); K.setLineDash([10, 10]); line(K, CT[0] + 20, y0, x + 30, y0, '#8a8780', 3); K.restore();
    arrow(K, x, y0, x, lerp(y0, y1, p), 1, { col: C.ink, lw: 6, bend: 0, head: 22 });
    if (p >= 1) X([K], x + 90, (y0 + y1) / 2, clamp(pop(t - T_ABOVE - 0.35, 2.6, 0.5), 0, 1.2), 0, () => text(K, 'HIGHER', 0, 12, { font: F.mono, weight: 700, size: 30, color: C.ink }));
  }
  function loopIcon(T, K, t) {
    const dt = t - T_LOOPW; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15);
    X([T, K], LOOPC[0], LOOPC[1], s, (t - T_LOOPW) * 120, () => {
      K.save(); K.lineWidth = 16; K.lineCap = 'round'; K.strokeStyle = chHot(); K.beginPath(); K.arc(0, 0, 70, 0.3, Math.PI); K.stroke();
      K.strokeStyle = CH_COLD; K.beginPath(); K.arc(0, 0, 70, Math.PI + 0.3, TAU); K.stroke();
      for (const [a, col] of [[Math.PI, chHot()], [TAU, CH_COLD]]) { K.save(); K.rotate(a); K.translate(70, 0); K.fillStyle = col; K.beginPath(); K.moveTo(-22, 0); K.lineTo(22, 0); K.lineTo(0, 30); K.closePath(); K.fill(); K.restore(); }
      K.restore();
    });
    X([K], LOOPC[0], LOOPC[1] + 6, s, 0, () => text(K, 'LOOP', 0, 12, { font: F.grot, weight: 700, size: 34, color: C.ink }));
  }
  function dayArc(T, K, t) {
    const a = clamp((t - T_DAY + 0.2) / 0.3) * (1 - clamp((t - T_THERMO + 0.2) / 0.3)); if (a <= 0) return;
    const u = clamp((t - T_DAY + 0.2) / 2.2), x = lerp(110, 470, u), y = 600 - Math.sin(u * Math.PI) * 60;
    chSun(T, K, x, y, 32, t, a);
  }
  function pump(T, K, t) {
    const dt = t - T_NO + 0.15; if (dt < 0) return;
    const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2), id = idleSway(t, 4, 0.5);
    X([T, K], 850 + id.dx, 1135 + id.dy, s * 0.78, id.r, () => { uiCard(T, K, -120, -110, 240, 220, { r: 26, border: C.ink, lw: 4 }); chPump(K, -12, -14, 0.9, Math.min(t, T_PUMPX)); cross(K, 0, -10, 150, clamp((t - T_PUMPX) / 0.22), C.red, 16); });
  }

  chKicks([T_WATER, T_LIGHT, T_RISES, T_ABOVE, T_HEAVY, T_SINKS, T_LOOPW, T_PUMPX]);
  const FOCUS = [[S0 + 0.1, 330, 1050], [T_LIGHT, 300, 820], [T_RISES, 562, 760], [T_TANK, TANK.x + TANK.w / 2, TANK.y + 70], [T_ABOVE, 800, 820],
    [T_COLD, 662, 760], [T_HEAVY, 850, 930], [T_SINKS, 662, 1100], [T_INTO, CB[0] + 20, CB[1] - 10], [T_LOOPW, LOOPC[0], LOOPC[1]], [T_NO, 850, 1120], [T_THERMO, 330, 600]];
  const MOODS = [['lean', T_RISES, T_RISES + 0.6], ['nod', T_SINKS, T_SINKS + 0.8], ['celebrate', T_THERMO + 0.1, S1 - 0.3]];
  SC.loop = {
    label: '// 03 — the loop',
    readout: t => ({ k: 'PUMPS', v: '0', hot: t > T_NO }),
    cam: t => chCam(t, FOCUS, S0, S1, { k: 0.1, ky: 0.1, z: 0.05 }),
    draw(T, K, t) {
      moodFx(T, K, t, MOODS);
      dayArc(T, K, t);
      chPipe(K, COLD, clamp((t - T_SINKS + 0.15) / 0.9), '#DCE8FA', 20);
      chPipe(K, HOT, clamp((t - T_RISES + 0.1) / 0.7), '#FBE3DC', 20);
      collector(T, K, t);
      tank(T, K, t);
      chFlow(K, HOT, t, T_RISES + 0.3, { speed: t > T_LOOPW ? 200 : 140, gap: 48, r: 10, col: () => chHot() });
      chFlow(K, COLD, t, T_SINKS + 0.4, { speed: t > T_LOOPW ? 200 : 140, gap: 52, r: 10, col: () => CH_COLD });
      if (t > T_INTO && t < T_INTO + 0.6) shock(K, CB[0], CB[1], t - T_INTO, { r: 70, color: CH_COLD, lw: 6, dur: 0.5 });
      above(K, t);
      chTagArrow(T, K, 'LIGHTER', 290, 800, -1, t - T_LIGHT, chHot());
      chTagArrow(T, K, 'HEAVIER', 860, 930, 1, t - T_HEAVY, CH_COLD);
      loopIcon(T, K, t);
      pump(T, K, t);
      if (t >= T_THERMO) X([T, K], 330, 590, 1, 0, () => stamp(K, T, 'THERMOSIPHON', 0, 0, t - T_THERMO, { size: 78, rot: -6 }));
    },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

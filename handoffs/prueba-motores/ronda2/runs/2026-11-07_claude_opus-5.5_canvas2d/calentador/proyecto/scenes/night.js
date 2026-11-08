// ═════════════ 04 · NIGHT [CUT_NIGHT → end] ═════════════
// "And because the TANK is INSULATED, the water STAYS HOT into the NIGHT. Know someone PAYING for an ELECTRIC HEATER? SEND them this."
// The tank comes back big; an insulation jacket wraps it on "insulated"; on "night" the page floods dark (moon, stars) while the
// thermometer holds high and a STILL HOT pill pops; an electric bill rolls up on "paying… electric heater"; a paper plane on "send".
(() => {
  const S0 = CUT_NIGHT, S1 = END_AT;
  const T_TANK = wi(116), T_INS = wi(118), T_HOT = wi(122), T_NIGHT = wi(125), T_PAY = wi(128), T_ELEC = wi(131), T_SEND = wi(133);
  const TK = { x: 110, y: 650, w: 660, h: 250 }, TH = [915, 1080], FLOOD = { col: '#141B2E', x: 860, y: 520 };
  cue(T_INS, 'swoosh', -6); kick(T_INS + 0.05, 0.4, 0.4); cue(T_NIGHT - 0.1, 'whoosh', -6); cue(T_HOT, 'pop', -8); cue(T_ELEC, 'cash', -6); cue(T_SEND, 'swoosh', -4);
  const dark = t => paletteOn(t, T_NIGHT - 0.1);

  function stars(K, t) {
    const a = dark(t); if (a <= 0) return;
    K.save(); K.globalAlpha = a;
    for (let i = 0; i < 26; i++) { const x = hash(i * 7) * W, y = 420 + hash(i * 13) * 560, tw = 0.5 + 0.5 * Math.sin(t * 3 + i); circle(K, x, y, 2 + 3 * tw * hash(i), '#FFF6D8'); }
    circle(K, FLOOD.x, FLOOD.y, 60, '#FFF1C4'); circle(K, FLOOD.x + 26, FLOOD.y - 18, 52, FLOOD.col);
    K.restore();
  }
  function bill(T, K, t) {
    const dt = t - T_PAY; if (dt < 0) return;
    const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2), id = idleSway(t, 9, 0.5), v = Math.round(lerp(0, 86, E.outCubic(clamp((t - T_ELEC) / 1.0))));
    X([T, K], 330 + id.dx, 1150 + id.dy, s, -4 + id.r, () => {
      uiCard(T, K, -220, -120, 440, 240, { r: 24, border: C.ink, lw: 4 });
      text(K, '// electric heater', -190, -72, { font: F.mono, weight: 700, size: 24, color: '#8a8780', align: 'left' });
      chPlug(K, -140, 20, 0.7);
      text(K, '$' + v, 150, 50, { font: F.grot, weight: 700, size: 92, color: C.red, align: 'right' });
      text(K, '/month', 190, 92, { font: F.mono, weight: 700, size: 22, color: '#8a8780', align: 'right' });
    });
  }
  function plane(K, t) {
    const dt = t - T_SEND; if (dt < 0) return;
    const u = E.inOutCubic(clamp(dt / 0.9)), x = lerp(640, 980, u), y = lerp(1180, 520, u) - Math.sin(u * Math.PI) * 120;
    X([K], x, y, 1, -35 + u * 10, () => { K.beginPath(); K.moveTo(-60, 0); K.lineTo(60, -30); K.lineTo(-20, 30); K.closePath(); K.fillStyle = '#FFFFFF'; K.fill(); K.lineWidth = 5; K.strokeStyle = C.ink; K.stroke();
      line(K, -20, 30, -10, 8, C.ink, 5); });
    K.save(); K.globalAlpha = 0.6; K.setLineDash([10, 14]); K.beginPath(); for (let k = 0; k <= 20; k++) { const uu = u * k / 20, xx = lerp(640, 980, uu), yy = lerp(1180, 520, uu) - Math.sin(uu * Math.PI) * 120; k ? K.lineTo(xx, yy) : K.moveTo(xx, yy); }
    K.lineWidth = 4; K.strokeStyle = dark(t) > 0.5 ? '#FFFFFF' : C.ink; K.stroke(); K.restore();
  }
  chKicks([T_HOT, T_NIGHT, T_ELEC, T_SEND]);
  const FOCUS = [[S0 + 0.1, TK.x + TK.w / 2, TK.y + 120], [T_INS, TK.x + TK.w / 2, TK.y], [T_HOT, TH[0] - 40, TH[1] - 220], [T_NIGHT, FLOOD.x - 40, FLOOD.y + 40],
    [T_PAY, 330, 1150], [T_SEND, 900, 600]];
  const MOODS = [['thumbs', T_HOT, T_NIGHT - 0.1], ['shrug', T_ELEC, T_SEND - 0.1], ['wave', T_SEND + 0.1, S1]];
  SC.night = {
    label: '// 04 — overnight',
    readout: t => ({ k: 'TANK', v: Math.round(lerp(62, 58, clamp((t - T_NIGHT) / 3))) + '°C', hot: true }),
    back: (T, K, t) => paletteFlood(T, K, t, T_NIGHT - 0.1, 1e9, FLOOD),
    hl: t => (dark(t) > 0.5 ? { color: '#FFFFFF' } : {}),
    cam: t => chCam(t, FOCUS, S0, S1),
    draw(T, K, t) {
      moodFx(T, K, t, MOODS);
      stars(K, t);
      const a = clamp(pop(t - S0 - 0.02, 2.2, 0.55), 0, 1.15), ins = clamp((t - T_INS + 0.05) / 0.45);
      X([T, K], TK.x + TK.w / 2, TK.y + TK.h / 2, a * (1 + ring(t - T_INS, 4, 9) * 0.03), 0, () => chTank(T, K, -TK.w / 2, -TK.h / 2, TK.w, TK.h, { strat: 0.75, ins, t }));
      if (ins > 0 && ins < 1) burst(K, TK.x + TK.w / 2, TK.y + TK.h / 2, t - T_INS, { n: 14, r0: 360, r1: 460, color: C.red, lw: 7, dur: 0.4 });
      if (ins > 0) X([K], TK.x + 150, TK.y - 50, clamp(pop(t - T_INS, 2.6, 0.45), 0, 1.2), -3, () => { fillRR(K, -130, -30, 260, 60, 30, '#F2D9A8'); strokeRR(K, -130, -30, 260, 60, 30, C.ink, 4); text(K, 'INSULATION', 0, 12, { font: F.mono, weight: 700, size: 26, color: C.ink }); });
      X([T, K], TH[0], TH[1], clamp(pop(t - S0 - 0.15, 2.4, 0.5), 0, 1.15), 0, () => chThermo(T, K, 0, 0, 380, 0.86 - 0.04 * clamp((t - T_NIGHT) / 3), chHot()));
      if (t >= T_HOT) X([T, K], TK.x + TK.w / 2, TK.y + TK.h + 80, clamp(pop(t - T_HOT, 2.6, 0.45), 0, 1.2), 3, () => { fillRR(K, -150, -36, 300, 72, 36, C.red); strokeRR(K, -150, -36, 300, 72, 36, C.ink, 4); text(K, 'STILL HOT', 0, 15, { font: F.grot, weight: 700, size: 42, color: '#FFFFFF' }); });
      bill(T, K, t);
      plane(K, t);
    },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

// ═════════════ 03 · ROLL [CUT_ROLL → CUT_REPEAT] ═════════════
// "After 'The sky is', BLUE might get SIXTY percent, CLEAR TWENTY, and FALLING almost ZERO. But it doesn't ALWAYS pick the TOP one.
//  It ROLLS WEIGHTED DICE, so likely words usually WIN, and SOMETIMES a less likely one SNEAKS in."
// "The sky is ___" types in; a probability card grows a bar per word (blue 60 %, clear 20 %, falling ≈0 %, all others 20 % → 100 %);
// a crown on the top bar gets a NOT ALWAYS stamp; a weighted wheel (slices = the same %) spins and lands on blue ("win" → blue drops into
// the blank), spins again on "sometimes" and lands on clear: a second version of the sentence sneaks in.
(() => {
  const S0 = CUT_ROLL, S1 = CUT_REPEAT;
  const T_THE = wi(63), T_SKY = wi(64), T_IS = wi(65), T_BLUE = wi(66), T_SIXTY = wi(69), T_CLEAR = wi(71), T_TWENTY = wi(72), T_FALL = wi(74),
    T_ZERO = wi(76), T_ALWAYS = wi(80), T_TOP = wi(83), T_ROLLS = wi(86), T_WIN = wi(93), T_SOME = wi(95), T_SNEAK = wi(100);
  const ROWS = [['blue', 60, T_BLUE, T_SIXTY], ['clear', 20, T_CLEAR, T_TWENTY], ['falling', 0.1, T_FALL, T_ZERO], ['all others', 20, T_ZERO + 0.25, T_ZERO + 0.25]];
  const CARD = { x: 70, y: 700, w: 520, h: 470 }, WH = [815, 1000, 165];
  const SEGS = [{ p: 0.6, label: 'blue', fill: C.red, ink: '#FFFFFF' }, { p: 0.2, label: 'clear', fill: GP_BLUE, ink: '#FFFFFF' }, { p: 0.198, label: 'others', fill: GP_GREY }, { p: 0.002, label: '', fill: '#8a8780' }];
  const SP1 = { t0: T_ROLLS + 0.05, dur: 1.6, target: 0.3, turns: 4 };
  const SP2 = { t0: T_SOME + 0.03, dur: Math.max(0.8, T_SNEAK - T_SOME - 0.05), target: 0.7, turns: 3, from: -0.3 * TAU - 4 * TAU };
  cue(T_BLUE, 'pop', -6); cue(T_CLEAR, 'pop', -8); cue(T_FALL, 'pop', -10); cue(T_ALWAYS, 'stamp', -4); cue(T_ROLLS, 'riser', -8); cue(SP1.t0 + SP1.dur, 'tick', -4);
  cue(T_WIN, 'ding', -6); cue(T_SOME, 'riser', -10); cue(T_SNEAK, 'pop', -4);
  gpKicks([T_THE, T_BLUE, T_CLEAR, T_FALL, T_ROLLS, SP1.t0 + SP1.dur, T_SOME]); kick(T_WIN + 0.04, 0.8, 0.6); kick(T_SNEAK + 0.04, 0.6, 0.5);

  function prompt(T, K, t) {
    const a = clamp(pop(t - S0 - 0.02, 2.4, 0.55), 0, 1.15);
    X([T, K], 535, 580, a, 0, () => {
      uiCard(T, K, -465, -70, 930, 140, { r: 30, border: C.ink, lw: 4 });
      const words = [['The', T_THE], [' sky', T_SKY], [' is', T_IS]].filter(w => t >= w[1] - 0.05).map(w => w[0]).join('');
      const f = { font: F.grot, weight: 700, size: 64 }, w = measure(K, words, f);
      text(K, words, -420, 22, Object.assign({ color: C.ink, align: 'left' }, f));
      const sx = -420 + w + 24;
      if (t < T_WIN + 0.35) { K.save(); K.setLineDash([12, 10]); strokeRR(K, sx, -40, 190, 80, 14, Math.sin(t * 6) > 0 ? C.red : C.ink, 4); K.restore();
        text(K, '?', sx + 95, 22, { font: F.grot, weight: 700, size: 56, color: C.red }); }
      else { const s = clamp(pop(t - T_WIN - 0.35, 2.8, 0.45), 0, 1.2); gpChip(T, K, ' blue', sx + 95, 0, { size: 50, hot: true, s }); check(K, 400, 0, 60, clamp((t - T_WIN - 0.45) / 0.25), C.red, 10); }
    });
  }
  function probs(T, K, t) {
    const dt = t - T_BLUE + 0.25; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), id = idleSway(t, 5, 0.4);
    X([T, K], CARD.x + CARD.w / 2 + id.dx, CARD.y + CARD.h / 2 + id.dy, s, id.r, () => {
      const x0 = -CARD.w / 2, y0 = -CARD.h / 2;
      uiCard(T, K, x0, y0, CARD.w, CARD.h, { r: 24, border: C.ink, lw: 4 });
      text(K, '// next token after "The sky is"', x0 + 26, y0 + 44, { font: F.mono, weight: 700, size: 20, color: '#8a8780', align: 'left' });
      ROWS.forEach(([w, p, tIn, tNum], k) => {
        if (t < tIn - 0.05) return;
        const ry = y0 + 108 + k * 80, a = clamp(pop(t - tIn + 0.05, 2.6, 0.5), 0, 1.15), v = p * E.outCubic(clamp((t - tNum + 0.1) / 0.5));
        const col = k === 0 ? C.red : k === 1 ? GP_BLUE : GP_GREY;
        X([K], 0, ry, a, 0, () => {
          text(K, w, x0 + 26, 12, { font: F.mono, weight: 700, size: 32, color: C.ink, align: 'left' });
          fillRR(K, x0 + 200, -16, 190, 32, 16, '#F3F1EC'); fillRR(K, x0 + 200, -16, Math.max(6, 190 * v / 60), 32, 16, col);
          text(K, p < 1 ? (t > T_ZERO ? '≈0%' : v.toFixed(1) + '%') : Math.round(v) + '%', CARD.w / 2 - 20, 12, { font: F.mono, weight: 700, size: 32, color: C.ink, align: 'right' });
        });
      });
      if (t > T_ZERO + 0.5) { line(K, x0 + 26, y0 + 402, CARD.w / 2 - 20, y0 + 402, HAIR, 3); text(K, 'total 100%', CARD.w / 2 - 20, y0 + 440, { font: F.mono, weight: 700, size: 26, color: '#8a8780', align: 'right' }); }
      if (t > T_TOP - 0.1) X([K], x0 + 200 + 190 - 10, y0 + 110 - 40, clamp(pop(t - T_TOP + 0.1, 2.6, 0.45), 0, 1.2), -8, () => {
        K.beginPath(); K.moveTo(-26, 12); K.lineTo(-26, -10); K.lineTo(-13, 2); K.lineTo(0, -18); K.lineTo(13, 2); K.lineTo(26, -10); K.lineTo(26, 12); K.closePath(); K.fillStyle = '#FFC23D'; K.fill(); K.lineWidth = 4; K.strokeStyle = C.ink; K.stroke(); });
    });
    if (t >= T_ALWAYS) X([T, K], 360, 1250, 1, 0, () => stamp(K, T, 'NOT ALWAYS', 0, 0, t - T_ALWAYS, { size: 66, rot: -5, sub: 'the top one' }));
  }
  function wheel(T, K, t) {
    const dt = t - T_ROLLS + 0.2; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), rot = gpSpinRot(t, [SP1, SP2]);
    X([T, K], WH[0], WH[1], s, 0, () => gpWheel(T, K, 0, 0, WH[2], SEGS, rot));
    text(K, '// weighted dice', WH[0], WH[1] + WH[2] + 50, { font: F.mono, weight: 700, size: 24, color: '#8a8780' });
    const l1 = SP1.t0 + SP1.dur; if (t > l1 && t < l1 + 0.6) shock(K, WH[0], WH[1] - WH[2] - 10, t - l1, { r: 60, color: C.red, lw: 6, dur: 0.5 });
    if (t > T_WIN && t < T_WIN + 0.5) { const u = E.inOutCubic(clamp((t - T_WIN) / 0.4)); gpChip(T, K, ' blue', lerp(WH[0], 700, u), lerp(WH[1] - 120, 580, u) - Math.sin(u * Math.PI) * 80, { size: 44, hot: true }); }
    const l2 = SP2.t0 + SP2.dur;
    if (t > l2 - 0.05) X([T, K], 790, 748, clamp(pop(t - l2 + 0.05, 2.6, 0.45), 0, 1.2), 3, () => {
      uiCard(T, K, -230, -50, 460, 100, { r: 22, border: GP_BLUE, lw: 4 });
      text(K, 'The sky is', -200, 16, { font: F.grot, weight: 700, size: 40, color: C.ink, align: 'left' });
      gpChip(T, K, ' clear', 140, 0, { size: 38, fill: GP_BLUE, col: '#FFFFFF', shadow: false });
      fillRR(K, -230, -84, 200, 34, 17, GP_BLUE); text(K, 'another roll', -130, -60, { font: F.mono, weight: 700, size: 20, color: '#FFFFFF' }); });
  }
  gpKicks([T_SKY, T_TWENTY, T_ZERO, wi(77), wi(88), wi(90), wi(92)]);
  const FOCUS = [[S0 + 0.1, 400, 600], [T_BLUE, CARD.x + 260, CARD.y + 110], [T_CLEAR, CARD.x + 260, CARD.y + 200], [T_FALL, CARD.x + 260, CARD.y + 290],
    [T_ALWAYS, 360, 1100], [T_ROLLS, WH[0], WH[1]], [T_WIN, 600, 580], [T_SOME, WH[0], WH[1]], [T_SNEAK, 790, 748], [wi(73), CARD.x + 260, CARD.y + 360], [wi(85), WH[0], WH[1] - 80], [wi(88), WH[0] + 60, WH[1] + 60], [wi(90), CARD.x + 260, CARD.y + 108], [wi(98), CARD.x + 260, CARD.y + 188]];
  FOCUS.sort((a, b) => a[0] - b[0]);
  const MOODS = [['lean', T_SIXTY, T_SIXTY + 0.6], ['no', T_ALWAYS, T_TOP + 0.4], ['celebrate', T_WIN + 0.1, T_WIN + 0.8], ['shock', T_SNEAK, S1 - 0.25]];
  SC.roll = {
    label: '// 03 — the roll',
    readout: t => ({ k: 'PICK', v: t < SP1.t0 + SP1.dur ? '…' : t < SP2.t0 + SP2.dur ? 'blue' : 'clear', hot: t > SP1.t0 + SP1.dur }),
    cam: t => gpCam(t, FOCUS, S0, S1),
    draw(T, K, t) { moodFx(T, K, t, MOODS); probs(T, K, t); wheel(T, K, t); prompt(T, K, t); },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

// ═════════════ 02 · TOKENS [CUT_TOKENS → CUT_ROLL] ═════════════
// "First, your MESSAGE is CUT into small PIECES called TOKENS. Then the MODEL SCORES EVERY token it knows, over a HUNDRED THOUSAND of them,
//  and gives each one a PROBABILITY of coming next."
// A message types into an input bar, scissors run along it on "cut" and it splits into chips (pieces of words, not whole words); TOKENS
// label; the chips drop into the MODEL; a vocabulary list scrolls fast while an odometer rolls past 100,000; on "probability" the list
// brakes and every row shows its % of coming next.
(() => {
  const S0 = CUT_TOKENS, S1 = CUT_ROLL;
  const T_MSG = wi(31), T_CUT = wi(33), T_PIECES = wi(36), T_TOK = wi(38) + TOKENS_DELAY, T_THEN = wi(39), T_MODEL = wi(41), T_SCORES = wi(42),
    T_EVERY = wi(43), T_OVER = wi(47), T_THOUS = wi(50), T_PROB = wi(58);
  const MSG = 'Unbelievably blue sky', CH = ['Un', 'believ', 'ably', ' blue', ' sky'];
  const BAR = { x: 70, y: 580, w: 920, h: 120 }, MOD = [330, 1020], VOC = { x: 590, y: 770, w: 420, h: 420 };
  const VOCAB = [' the', ' a', 'ing', ' is', ' cat', ' blue', ' was', 'ly', ' sky', ' of', ' and', ' to', ' code', 'un', ' looks', ' seems', ' red', ' it', '.', ','];
  const ROWS = [[' is', 41], [' was', 18], [' looks', 9], [' seems', 6], [' cat', 0.01]];
  cue(T_MSG, 'type', -10); cue(T_CUT, 'swoosh', -4); cue(T_TOK, 'stamp', -4); cue(T_THEN + 0.1, 'thud', -6); cue(T_EVERY, 'riser', -12); cue(T_PROB, 'ding', -8);
  gpKicks([T_CUT + 0.35, T_MODEL, T_EVERY, T_THOUS, T_PROB]); kick(T_TOK + 0.04, 0.7, 0.6);

  const chipX = (K, i) => { let x = 95; for (let k = 0; k < i; k++) x += gpChipW(K, CH[k], 50) + 18; return x + gpChipW(K, CH[i], 50) / 2; };
  function bar(T, K, t) {
    const split = t > T_CUT + 0.35, a = clamp(pop(t - S0 - 0.02, 2.4, 0.55), 0, 1.15);
    if (!split) X([T, K], BAR.x + BAR.w / 2, BAR.y + BAR.h / 2, a, 0, () => {
      uiCard(T, K, -BAR.w / 2, -BAR.h / 2, BAR.w, BAR.h, { r: 60, border: C.ink, lw: 4 });
      const s = typedStr(MSG, t, S0 + 0.15, 26);
      text(K, s, -BAR.w / 2 + 50, 16, { font: F.grot, weight: 500, size: 50, color: C.ink, align: 'left' });
      if (s.length < MSG.length || t < T_CUT) caretAt(K, -BAR.w / 2 + 56 + measure(K, s, { font: F.grot, weight: 500, size: 50 }), -28, 58, t, C.red);
      const sp = clamp((t - T_CUT) / 0.35); if (sp > 0) {                // scissors run along the bar
        const sx = -BAR.w / 2 + 40 + sp * (BAR.w - 80), op = Math.sin(t * 40) * 0.35;
        K.save(); K.translate(sx, 64); K.strokeStyle = C.red; K.lineWidth = 7; K.lineCap = 'round';
        for (const sgn of [-1, 1]) { K.save(); K.rotate(sgn * op); K.beginPath(); K.moveTo(0, 0); K.lineTo(-60, sgn * 10); K.stroke(); circle(K, 18, sgn * 14, 14, null, C.red, 6); K.restore(); }
        K.restore(); K.save(); K.setLineDash([12, 10]); line(K, -BAR.w / 2 + 40, 60, sx, 60, C.red, 4); K.restore();
      }
    });
    if (!split) return;
    CH.forEach((c, i) => {                                                // chips: split, bounce on "pieces", then drop into the model
      const dt = t - T_CUT - 0.35, cx = chipX(K, i), drop = t - T_THEN - i * 0.09;
      let x = cx, y = BAR.y + BAR.h / 2, r = (i - 2) * 4 * clamp(pop(dt, 2.6, 0.4), 0, 1.2), s = 1 + ring(t - T_PIECES - i * 0.06, 4, 8) * 0.15;
      if (drop > 0) { const u = E.inCubic(clamp(drop / 0.45)); x = lerp(cx, MOD[0], u); y = lerp(y, MOD[1] - 120, u) - Math.sin(u * Math.PI) * 120; s *= 1 - 0.6 * u; r += u * 200; if (u >= 1) return; }
      gpChip(T, K, c, x, y, { size: 50, fill: GP_COLS[i], s, r });
    });
    if (t >= T_TOK && t < T_THEN + 0.3) X([T, K], 540, BAR.y + 170, 1 - clamp((t - T_THEN) / 0.3), 0, () => stamp(K, T, 'TOKENS', 0, 0, t - T_TOK, { size: 80, rot: -4, sub: 'pieces of words' }));
  }
  function vocab(T, K, t) {
    const dt = t - T_EVERY + 0.1; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), id = idleSway(t, 7, 0.4);
    const speed = phaseAt(t, [[T_EVERY, 9], [T_PROB - 0.3, 9], [T_PROB + 0.2, 0]]);
    X([T, K], VOC.x + VOC.w / 2 + id.dx, VOC.y + VOC.h / 2 + id.dy, s, id.r, () => {
      const x0 = -VOC.w / 2, y0 = -VOC.h / 2;
      uiCard(T, K, x0, y0, VOC.w, VOC.h, { r: 24, border: C.ink, lw: 4 });
      const n = Math.round(lerp(0, 100000, E.outCubic(clamp((t - T_OVER) / (T_THOUS + 0.5 - T_OVER)))));
      text(K, n.toLocaleString('en-US') + (n >= 100000 ? '+' : ''), 0, y0 + 64, { font: F.grot, weight: 700, size: 50, color: t > T_OVER ? C.red : C.ink });
      text(K, '// tokens it knows', 0, y0 + 96, { font: F.mono, weight: 700, size: 20, color: '#8a8780' });
      K.save(); rr(K, x0 + 10, y0 + 118, VOC.w - 20, VOC.h - 128, 14); K.clip();
      const probOn = clamp((t - T_PROB + 0.1) / 0.4);
      if (probOn < 1) {
        const off = (speed * 52) % 52, base = Math.floor(speed);
        for (let k = -1; k < 6; k++) { const ry = y0 + 162 + k * 52 + off, w = VOCAB[(base * 7 + k * 3 + 400) % VOCAB.length];
          text(K, w.replace(/ /g, '·'), x0 + 40, ry, { font: F.mono, weight: 700, size: 30, color: C.ink, align: 'left' });
          fillRR(K, x0 + 200, ry - 20, 150 * hash(k + base), 18, 9, GP_GREY); }
      } else {
        ROWS.forEach(([w, p], k) => { const ry = y0 + 166 + k * 52, a = clamp(pop(t - T_PROB - k * 0.08, 2.6, 0.5), 0, 1.15);
          text(K, w.replace(/ /g, '·'), x0 + 30, ry, { font: F.mono, weight: 700, size: 30, color: C.ink, align: 'left' });
          fillRR(K, x0 + 150, ry - 22, Math.max(4, 150 * p / 41 * a), 22, 11, k === 0 ? C.red : GP_BLUE);
          text(K, (p < 1 ? '<1' : p) + '%', VOC.w / 2 - 22, ry, { font: F.mono, weight: 700, size: 26, color: C.ink, align: 'right' }); });
      }
      K.restore();
    });
  }
  function model(T, K, t) {
    const dt = t - T_THEN; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), busy = t > T_SCORES ? 1 : 0, sh = busy ? Math.sin(t * 40) * 2 : 0;
    X([T, K], MOD[0] + sh, MOD[1], s * 1.12, 0, () => gpModel(T, K, 0, 0, 440, 230, t, busy));
    if (t > T_SCORES) arrow(K, MOD[0] + 230, MOD[1] - 30, VOC.x - 10, VOC.y + 160, clamp((t - T_SCORES) / 0.4), { col: C.red, lw: 8, bend: -60 });
    if (t > T_PROB) X([K], MOD[0], MOD[1] + 170, clamp(pop(t - T_PROB, 2.6, 0.5), 0, 1.2), -2, () => { fillRR(K, -200, -32, 400, 64, 32, C.ink); text(K, '% chance of coming next', 0, 11, { font: F.grot, weight: 700, size: 30, color: '#FFFFFF' }); });
  }
  gpKicks([T_MSG, T_PIECES, wi(44), wi(52), wi(54), wi(61)]);
  const FOCUS = [[S0 + 0.1, 400, 640], [T_CUT, 540, 640], [T_TOK, 540, 750], [T_THEN, MOD[0], MOD[1]], [T_EVERY, VOC.x + 200, VOC.y + 60], [T_PROB, VOC.x + 150, VOC.y + 200], [wi(35), 200, 640], [wi(37), 820, 640], [wi(44), VOC.x + 300, VOC.y + 250], [wi(47), VOC.x + 200, VOC.y + 40], [wi(52), MOD[0], MOD[1]], [wi(55), VOC.x + 150, VOC.y + 160], [wi(60), VOC.x + 150, VOC.y + 320]];
  FOCUS.sort((a, b) => a[0] - b[0]);
  const MOODS = [['lean', T_CUT, T_CUT + 0.6], ['shock', T_THOUS, T_THOUS + 0.7]];
  SC.tokens = {
    label: '// 02 — tokens',
    readout: t => ({ k: 'TOKENS', v: String(t < T_CUT + 0.35 ? 0 : CH.length), hot: t > T_TOK }),
    cam: t => gpCam(t, FOCUS, S0, S1),
    draw(T, K, t) { moodFx(T, K, t, MOODS); model(T, K, t); vocab(T, K, t); bar(T, K, t); },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

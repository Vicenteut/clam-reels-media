// ═════════════ 04 · REPEAT [CUT_REPEAT → end] ═════════════
// "The CHOSEN token is ADDED to the text, and the whole PROCESS REPEATS until the answer is DONE. So one DIFFERENT ROLL early on, and the
//  two answers DRIFT APART. Know someone who thinks ChatGPT COPIES answers from somewhere? SEND them this."
// The chosen chip flies into the sentence; a 4-step loop (text → model → % → roll) turns and every lap adds a chip until DONE; then a
// tree: the same start splits on one different roll into two answers that drift apart; a copy icon gets crossed; a paper plane.
(() => {
  const S0 = CUT_REPEAT, S1 = END_AT;
  const T_CHOSEN = wi(103), T_ADDED = wi(106), T_PROC = wi(113), T_REP = wi(114), T_DONE = wi(119), T_SO = wi(120), T_DIFF = wi(122), T_ROLL = wi(123),
    T_DRIFT = wi(130), T_COPIES = wi(137), T_SEND = wi(141);
  const OUT = T_SO - 0.15;
  const BASE = ['The', ' sky', ' is', ' blue'], MORE = [' today', ',', ' with', ' no', ' clouds', '.'];
  const MT = MORE.map((_, i) => T_REP + 0.05 + i * (T_DONE - T_REP - 0.1) / MORE.length);
  const LC = [540, 990], LR = 190;
  const NODES = [['TEXT', -Math.PI / 2], ['MODEL', 0], ['%', Math.PI / 2], ['ROLL', Math.PI]];
  cue(T_ADDED, 'pop', -6); cue(T_REP, 'riser', -10); MT.forEach((x, i) => { if (i % 2 === 0) cue(x, 'click', -12); }); cue(T_DONE, 'ding', -6);
  cue(OUT, 'whoosh', -6); cue(T_ROLL, 'swoosh', -6); cue(T_DRIFT, 'swoosh', -8); cue(T_COPIES + 0.2, 'stamp', -4); cue(T_SEND, 'swoosh', -4);
  gpKicks([T_CHOSEN, T_PROC, T_DONE, T_DIFF, T_DRIFT, T_SEND]); kick(T_ROLL + 0.04, 0.8, 0.6); kick(T_COPIES + 0.24, 0.7, 0.6);

  function sentence(T, K, t) {
    const out = t > OUT ? exitY(t, OUT, 0.4, 1500) : 0; if (out < -1400) return;
    const a = clamp(pop(t - S0 - 0.02, 2.4, 0.55), 0, 1.15);
    X([T, K], 0, out, 1, 0, () => {
      X([T, K], 535, 620, a, 0, () => uiCard(T, K, -470, -110, 940, 220, { r: 28, border: C.ink, lw: 4 }));
      let x = 100, y = 580;
      const all = BASE.concat(MORE), at = [S0, S0, S0, T_ADDED].concat(MT);
      all.forEach((c, i) => { if (t < at[i]) return; const w = gpChipW(K, c, 38); if (x + w > 990) { x = 100; y += 76; }
        let px = x + w / 2, py = y; const fly = i === 3 ? E.inOutCubic(clamp((t - T_CHOSEN) / (T_ADDED - T_CHOSEN))) : 1;
        if (fly < 1) { px = lerp(900, px, fly); py = lerp(900, py, fly) - Math.sin(fly * Math.PI) * 100; }
        const newest = i === all.filter((_, k) => t >= at[k]).length - 1;
        gpChip(T, K, c, px, py, { size: 38, fill: GP_COLS[i % GP_COLS.length], hot: newest && t < T_DONE, s: clamp(pop(t - at[i], 3, 0.45), 0, 1.2) || 1 }); x += w + 8; });
      if (t >= T_DONE) X([T, K], 900, 690, clamp(pop(t - T_DONE, 2.6, 0.45), 0, 1.2), -6, () => { fillRR(K, -90, -30, 180, 60, 30, C.red); text(K, 'DONE', 0, 12, { font: F.grot, weight: 700, size: 34, color: '#FFFFFF' }); });
    });
  }
  function loop(T, K, t) {
    const dt = t - T_PROC + 0.15; if (dt < 0) return;
    const out = t > OUT ? exitY(t, OUT, 0.4, 1500) : 0; if (out < -1400) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15);
    X([T, K], LC[0], LC[1] + out, s, 0, () => {
      K.save(); K.lineWidth = 10; K.strokeStyle = C.ink; K.setLineDash([4, 18]); K.lineCap = 'round'; K.beginPath(); K.arc(0, 0, LR, 0, TAU); K.stroke(); K.restore();
      const ph = phaseAt(t, [[T_PROC, 0.6], [T_REP, 4.2], [T_DONE, 0.4]]), ang = -Math.PI / 2 + ph * TAU;
      circle(K, Math.cos(ang) * LR, Math.sin(ang) * LR, 18, C.red, C.ink, 4);
      NODES.forEach(([lab, a], i) => { const nx = Math.cos(a) * LR, ny = Math.sin(a) * LR, hot = Math.abs(((ang - a) % TAU + TAU) % TAU) < 0.5;
        const w = lab.length > 2 ? 170 : 90; fillRR(T, nx - w / 2 + 6, ny - 36 + 8, w, 72, 20, C.k40);
        fillRR(K, nx - w / 2, ny - 36, w, 72, 20, hot ? C.red : '#FFFFFF'); strokeRR(K, nx - w / 2, ny - 36, w, 72, 20, C.ink, 4);
        text(K, lab, nx, ny + 13, { font: F.grot, weight: 700, size: 36, color: hot ? '#FFFFFF' : C.ink }); });
      text(K, 'repeat', 0, 14, { font: F.serif, italic: true, weight: 400, size: 64, color: C.red });
      const laps = MT.filter(x => t >= x).length; text(K, `${laps}×`, 0, 70, { font: F.mono, weight: 700, size: 30, color: '#8a8780' });
    });
  }
  function tree(T, K, t) {
    const dt = t - T_SO + 0.05; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), root = [220, 840];
    const spread = lerp(0, 1, E.outCubic(clamp((t - T_ROLL) / 0.5))) + 0.35 * E.inOutCubic(clamp((t - T_DRIFT) / 0.8));
    const A = [640, 840 - 150 * spread], B = [640, 840 + 150 * spread];
    X([T, K], root[0], root[1], s, 0, () => { uiCard(T, K, -170, -50, 340, 100, { r: 24, border: C.ink, lw: 4 }); text(K, 'The sky is', 0, 16, { font: F.grot, weight: 700, size: 44, color: C.ink }); });
    if (t < T_ROLL - 0.05) return;
    for (const [P, lab, rest, col, k] of [[A, ' blue', 'today, with no clouds.', C.red, 0], [B, ' clear', 'tonight, so look up.', GP_BLUE, 1]]) {
      const p = clamp((t - T_ROLL + 0.05 - k * 0.15) / 0.4);
      K.save(); K.lineWidth = 8; K.strokeStyle = col; K.lineCap = 'round'; K.beginPath(); K.moveTo(root[0] + 170, root[1]);
      K.bezierCurveTo(root[0] + 260, root[1], P[0] - 200, P[1], lerp(root[0] + 170, P[0] - 110, p), lerp(root[1], P[1], p)); K.stroke(); K.restore();
      if (p < 1) continue;
      gpChip(T, K, lab, P[0] - 40, P[1], { size: 40, fill: col, col: '#FFFFFF', s: clamp(pop(t - T_ROLL - 0.35 - k * 0.15, 2.8, 0.45), 0, 1.2) });
      const tx = typedStr(rest, t, T_DRIFT - 0.4 + k * 0.2, 30);
      text(K, tx, P[0] + 40, P[1] + 60, { font: F.grot, weight: 500, size: 34, color: C.ink, align: 'left' });
    }
    if (t > T_DRIFT) X([K], 600, 840, 1, 0, () => { K.save(); K.globalAlpha = clamp((t - T_DRIFT) / 0.3); K.setLineDash([10, 10]); line(K, 0, -120 * spread + 40, 0, 120 * spread - 40, '#8a8780', 4); K.restore();
      text(K, '≠', -40, 18, { font: F.grot, weight: 700, size: 64, color: C.red }); });
  }
  function copies(T, K, t) {
    const dt = t - T_COPIES + 0.1; if (dt < 0) return;
    const s = clamp(pop(dt, 2.6, 0.45), 0, 1.2), sh = ring(t - T_COPIES - 0.2, 5, 9) * 8;
    X([T, K], 240 + sh, 1250, s * 0.8, -4, () => {
      for (const [ox, oy] of [[-30, -30], [0, 0]]) { fillRR(T, ox - 80 + 8, oy - 100 + 10, 160, 200, 14, C.k40); fillRR(K, ox - 80, oy - 100, 160, 200, 14, '#FFFFFF'); strokeRR(K, ox - 80, oy - 100, 160, 200, 14, C.ink, 5);
        for (let i = 0; i < 4; i++) line(K, ox - 50, oy - 60 + i * 34, ox + 50, oy - 60 + i * 34, GP_GREY, 8); }
      cross(K, 0, -10, 220, clamp((t - T_COPIES - 0.2) / 0.25), C.red, 18);
    });
    if (t > T_COPIES + 0.2) X([T, K], 560, 1290, 1, 0, () => stamp(K, T, 'NOT COPIED', 0, 0, t - T_COPIES - 0.2, { size: 60, rot: 5, sub: 'written fresh' }));
  }
  gpKicks([wi(109), MT[2], MT[4], wi(124), wi(128), wi(133), wi(136)]);
  const FOCUS = [[S0 + 0.1, 500, 620], [T_CHOSEN, 700, 640], [T_PROC, LC[0], LC[1]], [T_DONE, 900, 690], [T_SO, 220, 840], [T_ROLL, 600, 840],
    [T_DRIFT, 700, 980], [T_COPIES, 300, 1230], [T_SEND, 900, 600], [wi(105), 300, 580], [wi(110), LC[0] + LR, LC[1]], [wi(112), LC[0] - LR, LC[1]], [wi(126), 640, 680], [wi(128), 640, 1000], [wi(133), 400, 1100], [wi(135), 640, 700]];
  FOCUS.sort((a, b) => a[0] - b[0]);
  const MOODS = [['lean', T_REP, T_REP + 0.6], ['celebrate', T_DONE, T_DONE + 0.7], ['shrug', T_DRIFT, T_DRIFT + 0.8], ['no', T_COPIES, T_COPIES + 0.9], ['wave', T_SEND + 0.1, S1]];
  SC.repeat = {
    label: '// 04 — again and again',
    cam: t => gpCam(t, FOCUS, S0, S1),
    draw(T, K, t) { moodFx(T, K, t, MOODS); loop(T, K, t); sentence(T, K, t); tree(T, K, t); copies(T, K, t); gpPlane(K, t, T_SEND, 640, 1150, 980, 520); },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

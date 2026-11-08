// ═════════════ 01 · HOOK [0 → CUT_TOKENS] ═════════════
// "Why does ChatGPT give a DIFFERENT answer when you ask the exact SAME question TWICE? Because it NEVER LOOKS UP an answer.
//  It WRITES one PIECE at a TIME."
// Two generic chat windows slide in at frame 0 with the same question; the two answers type out differently; "=" on "same", a
// DIFFERENT stamp on "twice". Then the chats fly up, a cabinet of "saved answers" gets crossed out, and the answer re-appears chip by chip.
(() => {
  const S0 = 0, S1 = CUT_TOKENS;
  const T_DIFF = wi(5), T_SAME = wi(12), T_TWICE = wi(14), T_NEVER = wi(17), T_UP = wi(19), T_WRITES = wi(23), T_ONE = wi(24), T_PIECE = wi(25), T_TIME = wi(28);
  const OUT = T_NEVER - 0.25;
  const PIECES = ['How', ' about', ' Bean', ' There', '?'], PT = [T_ONE, T_PIECE, wi(26), wi(27), T_TIME].map(x => x - 0.02);
  cue(T_DIFF, 'type', -10); cue(T_SAME, 'pop', -6); cue(T_TWICE + 0.05, 'stamp', -4); cue(OUT, 'whoosh', -6); cue(T_UP, 'stamp', -4);
  PT.forEach((x, i) => { if (i % 2 === 0) cue(x, 'click', -10); });
  gpKicks([T_DIFF, T_SAME, T_UP, T_WRITES]); kick(T_TWICE + 0.06, 0.8, 0.7);

  function chats(T, K, t) {
    const out = t > OUT ? exitY(t, OUT, 0.45, 1500) : 0;
    if (out < -1400) return;
    const inL = (1 - clamp(pop(t + 0.1, 2.4, 0.55), 0, 1.1)) * -700, inR = (1 - clamp(pop(t - 0.05, 2.4, 0.55), 0, 1.1)) * 700;
    const q = 'Name my new café?';
    X([T, K], inL, out, 1, -1.5, () => gpChat(T, K, 60, 560, 450, 520, t, 'AI chat · try 1', [{ me: true, txt: q, t0: 0.05, cps: 40 }, { txt: 'How about "Bean There"?', t0: T_DIFF, cps: 24 }]));
    X([T, K], inR, out, 1, 1.5, () => gpChat(T, K, 570, 560, 450, 520, t, 'AI chat · try 2', [{ me: true, txt: q, t0: 0.15, cps: 40 }, { txt: 'Try "Morning Ritual".', t0: T_DIFF + 0.35, cps: 24 }]));
    if (t >= T_SAME) X([T, K], 540, 700 + out, clamp(pop(t - T_SAME, 2.8, 0.45), 0, 1.2), 0, () => { circle(K, 0, 0, 44, C.ink); text(K, '=', 0, 20, { font: F.grot, weight: 700, size: 64, color: '#FFFFFF' }); });
    if (t >= T_TWICE) X([T, K], 540, 940 + out, 1, 0, () => stamp(K, T, 'DIFFERENT', 0, 0, t - T_TWICE - 0.05, { size: 80, rot: -7 }));
  }
  function cabinet(T, K, t) {
    const dt = t - OUT - 0.1; if (dt < 0) return;
    const s = clamp(pop(dt, 2.4, 0.5), 0, 1.15), id = idleSway(t, 3, 0.6), shake = ring(t - T_UP, 5, 9) * 8;
    X([T, K], 330 + id.dx + shake, 800 + id.dy, s, id.r, () => {
      uiCard(T, K, -190, -230, 380, 460, { r: 22, border: C.ink, lw: 5, fill: '#E6E3DC' });
      for (let i = 0; i < 3; i++) { const dy = -200 + i * 145, open = i === 1 ? 20 * Math.max(0, Math.sin(t * 3)) : 0;
        fillRR(K, -160, dy + open * 0, 320, 120, 12, '#FFFFFF'); strokeRR(K, -160, dy, 320, 120, 12, C.ink, 4); fillRR(K, -40, dy + 50, 80, 18, 9, C.ink); }
      text(K, '// saved answers', 0, 280, { font: F.mono, weight: 700, size: 26, color: '#8a8780' });
      cross(K, 0, 0, 360, clamp((t - T_UP) / 0.25), C.red, 22);
    });
    if (t >= T_UP + 0.1) X([T, K], 760, 720, 1, 0, () => stamp(K, T, 'NO LOOKUP', 0, 0, t - T_UP - 0.1, { size: 70, rot: 6 }));
  }
  function writing(T, K, t) {
    const dt = t - T_WRITES + 0.1; if (dt < 0) return;
    const y = 1180 + (1 - clamp(pop(dt, 2.2, 0.55), 0, 1.1)) * 600;
    uiCard(T, K, 70, y - 90, 900, 180, { r: 26, border: C.ink, lw: 4 });
    text(K, '// answer, written piece by piece', 100, y - 52, { font: F.mono, weight: 700, size: 22, color: '#8a8780', align: 'left' });
    let x = 110;
    PIECES.forEach((p, i) => { if (t < PT[i]) return; const w = gpChipW(K, p, 40), s = clamp(pop(t - PT[i], 3, 0.45), 0, 1.2);
      gpChip(T, K, p, x + w / 2, y + 22, { size: 40, fill: GP_COLS[i % GP_COLS.length], s, hot: i === PT.filter(z => t >= z).length - 1 }); x += w + 10; });
    if (t > T_ONE) { const k = PT.filter(z => t >= z).length; if (k < PIECES.length) caretAt(K, x + 6, y - 6, 56, t, C.red); }
  }
  gpKicks([wi(3), wi(9), wi(12) + 0.4, wi(22)]);
  const FOCUS = [[0.1, 285, 760], [T_DIFF, 285, 900], [T_SAME, 540, 700], [T_TWICE, 540, 940], [OUT + 0.1, 330, 800], [T_UP, 330, 800], [T_WRITES, 400, 1180], [wi(3), 285, 760], [wi(6), 795, 900], [wi(9), 285, 700], [wi(11), 795, 700], [wi(26), 600, 1180], [wi(27), 800, 1180]];
  FOCUS.sort((a, b) => a[0] - b[0]);
  const MOODS = [['thinking', 0.2, T_DIFF - 0.1, { bubble: [770, 470] }], ['shrug', T_TWICE + 0.1, T_TWICE + 0.9], ['no', T_NEVER, T_UP + 0.6]];
  SC.hook = {
    label: '// 01 — same question',
    cam: t => gpCam(t, FOCUS, S0, S1),
    draw(T, K, t) { moodFx(T, K, t, MOODS); chats(T, K, t); cabinet(T, K, t); writing(T, K, t); },
    guy: t => act(t, mood(t, MOODS, { focus: t => focusTrack(t, FOCUS) })),
  };
})();

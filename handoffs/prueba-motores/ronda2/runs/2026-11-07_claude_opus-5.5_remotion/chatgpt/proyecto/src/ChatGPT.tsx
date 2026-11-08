// CHATGPT · kinetic dark-UI explainer (HTML/CSS + SVG in React). A generic chat app (no brand marks), token chips,
// a model box scoring a wall of tokens, a live probability chart, a weighted "dice" strip, the append loop, and a branching tree.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, CL, Word, at, k, lerp, phrases, pop, useFonts, win} from './lib';
import WORDS_JSON from './words-chatgpt.json';

const WORDS = WORDS_JSON as Word[];
const wi = at(WORDS);
const PH = phrases(WORDS, 6);
const EMPH = new Set(['different', 'never', 'tokens', 'probability', 'sixty', 'twenty', 'zero', 'top', 'weighted', 'dice', 'sometimes', 'repeats', 'drift', 'apart', 'copies']);

// ── design tokens ──
const ACCENT = '#8B7CFF';                       // main accent
const BG = '#0D1016', PANEL = '#161B24', LINE = '#2A3242', TEXT = '#E9EDF5', MUTED = '#8B95A7';
const CHIP = ['#3A86FF', '#FF6B9A', '#FFB347', '#3DDC97', '#C77DFF', '#5BC0EB'];
const MONO = 'JetBrains Mono', UI = 'Inter';

const T = {
  q: wi(2), ans: wi(6), twice: wi(14), never: wi(17), lookup: wi(18), writes: wi(23), first: wi(29), cut: wi(33), tokens: wi(38),
  model: wi(41), every: wi(43), hundred: wi(49), them: wi(52), prob: wi(58), after: wi(62), blue: wi(66), sixty: wi(69), clear: wi(71), falling: wi(74), zero: wi(76),
  but: wi(77), top: wi(83), rolls: wi(86), dice: wi(88), win: wi(93), sometimes: wi(95), sneaks: wi(100), chosen: wi(103), added: wi(106), repeats: wi(114), done: wi(119),
  so: wi(120), roll: wi(123), two: wi(128), drift: wi(130), know: wi(132), copies: wi(137), send: wi(141),
};
const TK_LABEL = T.tokens;                      // when the TOKENS label appears
const SCN = {hook: [0, T.never - 0.5], lookup: [T.never - 0.5, T.first - 0.2], cut: [T.first - 0.2, wi(39) - 0.1], model: [wi(39) - 0.1, T.after - 0.2],
  chart: [T.after - 0.2, T.chosen - 0.3], loop: [T.chosen - 0.3, T.so - 0.1], tree: [T.so - 0.1, T.know - 0.1], end: [T.know - 0.1, 99]};

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});
const Chip: React.FC<{s: string; i: number; size?: number; a?: number; y?: number; glow?: boolean}> = ({s, i, size = 40, a = 1, y = 0, glow}) => (
  <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: size, color: '#0D1016', background: CHIP[i % CHIP.length],
    borderRadius: size * 0.3, padding: `${size * 0.12}px ${size * 0.28}px`, margin: `0 ${size * 0.12}px`, opacity: a, transform: `translateY(${y}px)`,
    whiteSpace: 'pre', boxShadow: glow ? `0 0 28px ${ACCENT}` : 'none'}}>{s}</span>
);

// typed text: reveals tokens of `parts` between t0 and t1
const typed = (parts: string[], t: number, t0: number, t1: number) => parts.slice(0, Math.floor(parts.length * k(t, t0, t1, Easing.linear) + 1e-6)).join('');

const Pane: React.FC<{x: number; t: number; answer: string[]; frame: number; fps: number}> = ({x, t, answer, frame, fps}) => (
  <div style={abs(x, 600, {width: 440, height: 700, background: PANEL, borderRadius: 40, border: `3px solid ${LINE}`, padding: 28, boxSizing: 'border-box',
    fontFamily: UI, color: TEXT})}>
    <div style={{display: 'flex', gap: 10, marginBottom: 34}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: LINE}} />)}</div>
    <div style={{display: 'flex', justifyContent: 'flex-end', transform: `scale(${pop(frame, fps, T.q - 0.2)})`, transformOrigin: 'right'}}>
      <div style={{background: '#2F3747', borderRadius: 26, padding: '18px 24px', fontSize: 38, fontWeight: 600}}>Name my new cat?</div>
    </div>
    <div style={{marginTop: 36, fontSize: 38, lineHeight: 1.3, fontWeight: 500, minHeight: 200, border: t > T.twice ? `3px solid ${ACCENT}` : '3px solid transparent',
      borderRadius: 22, padding: 14}}>
      {typed(answer, t, T.ans - 0.2, T.twice - 0.2)}<span style={{opacity: t < T.twice && Math.floor(t * 4) % 2 ? 1 : 0}}>▍</span>
    </div>
  </div>
);

export const ChatGPT: React.FC = () => {
  useFonts([['Inter', 'fonts/Inter-Medium.ttf', {weight: '500'}], ['Inter', 'fonts/Inter-SemiBold.ttf', {weight: '600'}], ['Inter', 'fonts/Inter-Bold.ttf', {weight: '700'}],
    ['Inter', 'fonts/Inter-ExtraBold.ttf', {weight: '800'}], ['JetBrains Mono', 'fonts/JetBrainsMono-700-normal.woff2', {weight: '700'}], ['JetBrains Mono', 'fonts/JetBrainsMono-500-normal.woff2', {weight: '500'}]]);
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const vis = (s: number[]) => win(t, s[0], s[1], 0.3);
  const enter = (s: number[]) => (1 - k(t, s[0], s[0] + 0.45)) * 80;      // slide up on entry

  // ── scene: hook ──
  const hook = vis(SCN.hook);
  // ── scene: never looks up ──
  const lk = vis(SCN.lookup);
  const pieces = ['The', ' sky', ' is', ' clear', ' today', '.'];
  // ── scene: cut into tokens ──
  const ct = vis(SCN.cut), split = k(t, T.cut - 0.1, T.cut + 0.5, Easing.out(Easing.back(1.6)));
  const TOK = ['The', ' sky', ' is', ' breath', 'taking'];
  // ── scene: model scores every token ──
  const md = vis(SCN.model);
  const VOCAB = ['the', ' cat', ' blue', 'ing', ' sky', ' run', ' of', ' clear', ' dark', 'tion', ' red', ' is', ' and', ' gray', ' to', ' fall', ' sun', 'er', ' a', ' moon', ' big', ' up', ' so', 'ly'];
  const counter = Math.round(lerp(0, 100000, k(t, T.every, T.them, Easing.inOut(Easing.cubic))));
  // ── scene: chart ──
  const ch = vis(SCN.chart);
  const ROWS: [string, number, number, boolean][] = [[' blue', 60, T.blue, true], [' clear', 20, T.clear, true], [' gray', 9, T.falling - 0.4, false], [' dark', 7, T.falling - 0.3, false],
    [' …others', 4, T.falling - 0.2, false], [' falling', 0.01, T.falling, true]];
  const strip = k(t, T.rolls - 0.2, T.rolls + 0.5);                 // chart -> weighted strip
  // the rolls: [time it lands, row index]
  const ROLLS: [number, number][] = [[T.dice + 0.55, 0], [T.win - 0.45, 0], [T.win + 0.1, 0], [T.sneaks - 0.1, 1]];
  // ── scene: append loop ──
  const lp = vis(SCN.loop);
  const MORE = [' today', ',', ' with', ' a', ' soft', ' breeze', '.'];
  const nMore = Math.floor(MORE.length * k(t, T.repeats - 0.6, T.done, Easing.linear) + 1e-6);
  // ── scene: tree ──
  const tr = vis(SCN.tree), br = k(t, T.roll - 0.2, T.roll + 0.5), spread = lerp(70, 300, k(t, T.two - 0.2, T.drift + 0.6, Easing.inOut(Easing.cubic)));
  const end = vis(SCN.end);

  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 1400px at 50% 40%, #151B27 0%, ${BG} 70%)`}}>
      <Audio src={staticFile('chatgpt/voz.wav')} />
      {/* faint grid */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.35}}>
        {Array.from({length: 19}, (_, i) => <line key={'v' + i} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="#1C2230" strokeWidth={2} />)}
        {Array.from({length: 33}, (_, i) => <line key={'h' + i} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="#1C2230" strokeWidth={2} />)}
      </svg>

      {/* ── HOOK: same question, two answers ── */}
      {hook > 0 && <div style={{position: 'absolute', inset: 0, opacity: hook, transform: `translateY(${enter(SCN.hook)}px)`}}>
        <Pane x={70} t={t} answer={['How', ' about', ' Luna', '?', ' Calm', ' and', ' elegant', '.']} frame={frame} fps={fps} />
        <Pane x={570} t={t} answer={['Try', ' Pickles', '!', ' Fun', ' and', ' a', ' bit', ' silly', '.']} frame={frame} fps={fps} />
        {t > T.twice - 0.1 && <div style={abs(540, 1370, {transform: `translateX(-50%) scale(${pop(frame, fps, T.twice - 0.1)})`, background: ACCENT, color: '#fff', fontFamily: UI,
          fontWeight: 800, fontSize: 46, padding: '16px 34px', borderRadius: 50, whiteSpace: 'nowrap'})}>SAME QUESTION · 2 ANSWERS</div>}
      </div>}

      {/* ── NEVER LOOKS UP · WRITES ONE PIECE AT A TIME ── */}
      {lk > 0 && <div style={{position: 'absolute', inset: 0, opacity: lk, transform: `translateY(${enter(SCN.lookup)}px)`}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`translate(540,760) scale(${pop(frame, fps, T.never - 0.2)})`} opacity={1 - 0.6 * k(t, T.writes - 0.3, T.writes + 0.2)}>
            <ellipse cx={0} cy={-90} rx={150} ry={40} fill="#232B3A" stroke={MUTED} strokeWidth={6} />
            <path d="M -150 -90 L -150 90 A 150 40 0 0 0 150 90 L 150 -90" fill="#1A2030" stroke={MUTED} strokeWidth={6} />
            <path d="M -150 -30 A 150 40 0 0 0 150 -30 M -150 30 A 150 40 0 0 0 150 30" fill="none" stroke={MUTED} strokeWidth={5} />
            <text y={190} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={MUTED}>STORED ANSWERS</text>
            {(() => { const p = k(t, T.lookup + 0.2, T.lookup + 0.55); return <g stroke="#FF4D5E" strokeWidth={22} strokeLinecap="round">
              <line x1={-190} y1={-170} x2={-190 + 380 * p} y2={-170 + 380 * p} /><line x1={190} y1={-170} x2={190 - 380 * p} y2={-170 + 380 * p} opacity={p > 0.5 ? 1 : 0} /></g>; })()}
          </g>
        </svg>
        <div style={abs(80, 1180, {width: 920, minHeight: 150, background: PANEL, border: `3px solid ${LINE}`, borderRadius: 36, padding: '30px 30px', boxSizing: 'border-box',
          opacity: k(t, T.writes - 0.3, T.writes)})}>
          {pieces.map((p, i) => { const t0 = T.writes + 0.25 + i * 0.3; return t >= t0 ? <Chip key={i} s={p} i={i} size={46} y={(1 - k(t, t0, t0 + 0.2)) * -30} glow={t < t0 + 0.25} /> : null; })}
          <span style={{display: 'inline-block', width: 22, height: 54, background: ACCENT, verticalAlign: 'middle', marginLeft: 8, opacity: Math.floor(t * 4) % 2}} />
        </div>
      </div>}

      {/* ── CUT INTO TOKENS ── */}
      {ct > 0 && <div style={{position: 'absolute', inset: 0, opacity: ct, transform: `translateY(${enter(SCN.cut)}px)`}}>
        <div style={abs(540, 640, {transform: 'translateX(-50%)', fontFamily: UI, fontWeight: 600, fontSize: 34, color: MUTED, letterSpacing: 3})}>YOUR MESSAGE</div>
        <div style={abs(80, 720, {width: 920, height: 170, background: '#2F3747', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO, fontWeight: 700, fontSize: 58, color: TEXT, opacity: 1 - k(t, T.cut, T.cut + 0.3)})}>The sky is breathtaking</div>
        {/* scissor sweep */}
        {t > T.cut - 0.2 && t < T.cut + 0.5 && <div style={abs(lerp(80, 1000, k(t, T.cut - 0.2, T.cut + 0.3)), 700, {width: 8, height: 210, background: ACCENT, boxShadow: `0 0 30px ${ACCENT}`})} />}
        <div style={abs(0, 760, {width: 1080, display: 'flex', justifyContent: 'center', opacity: k(t, T.cut, T.cut + 0.25)})}>
          {TOK.map((s, i) => <span key={i} style={{display: 'inline-block', margin: `0 ${split * 6}px`, transform: `translateY(${Math.sin(i * 1.7) * 18 * split}px)`}}><Chip s={s} i={i} size={44} /></span>)}
        </div>
        {/* "pieces of words" note */}
        <div style={abs(540, 960, {transform: 'translateX(-50%)', fontFamily: UI, fontWeight: 600, fontSize: 36, color: MUTED, opacity: k(t, wi(36), wi(36) + 0.3), whiteSpace: 'nowrap'})}>
          "breathtaking" → <span style={{color: TEXT}}>breath</span> + <span style={{color: TEXT}}>taking</span>
        </div>
        {t > TK_LABEL - 0.05 && <div style={abs(540, 1120, {transform: `translateX(-50%) scale(${pop(frame, fps, TK_LABEL - 0.05, 9)})`, background: ACCENT, color: '#fff',
          fontFamily: UI, fontWeight: 800, fontSize: 64, letterSpacing: 6, padding: '18px 48px', borderRadius: 60})}>TOKENS</div>}
      </div>}

      {/* ── MODEL SCORES EVERY TOKEN ── */}
      {md > 0 && <div style={{position: 'absolute', inset: 0, opacity: md, transform: `translateY(${enter(SCN.model)}px)`}}>
        {/* tokens fly in */}
        <div style={abs(0, lerp(560, 760, k(t, T.model - 0.6, T.model)), {width: 1080, display: 'flex', justifyContent: 'center', opacity: 1 - k(t, T.model - 0.1, T.model + 0.2)})}>
          {TOK.map((s, i) => <Chip key={i} s={s} i={i} size={40} />)}</div>
        <div style={abs(240, 600, {width: 600, height: 300, borderRadius: 50, background: 'linear-gradient(135deg,#1E2433,#252C3F)', border: `4px solid ${ACCENT}`,
          boxShadow: `0 0 ${30 + 20 * Math.sin(t * 5)}px ${ACCENT}66`, transform: `scale(${pop(frame, fps, T.model - 0.3)})`})}>
          <svg width={600} height={300} style={{position: 'absolute'}}>
            {Array.from({length: 4}, (_, c) => Array.from({length: 4}, (_, r) => <circle key={c + '-' + r} cx={120 + c * 120} cy={70 + r * 52} r={12}
              fill={ACCENT} opacity={0.35 + 0.65 * Math.abs(Math.sin(t * 4 + c * 1.3 + r))} />))}
          </svg>
          <div style={abs(0, 255, {width: 600, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: TEXT, letterSpacing: 6})}>MODEL</div>
        </div>
        {/* the vocabulary wall */}
        <div style={abs(60, 960, {width: 960, height: 520, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 10,
          opacity: k(t, T.every - 0.2, T.every + 0.3)})}>
          {Array.from({length: 84}, (_, i) => { const show = t > T.every - 0.2 + i * 0.012; const h = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
            return show ? <div key={i} style={{width: 106, height: 54, borderRadius: 12, background: '#1B2130', border: `2px solid ${LINE}`, position: 'relative',
              fontFamily: MONO, fontWeight: 500, fontSize: 22, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre'}}>
              {VOCAB[i % VOCAB.length]}
              <div style={{position: 'absolute', left: 8, bottom: 5, height: 5, borderRadius: 3, width: 90 * Math.pow(h, 3) * k(t, T.prob - 0.2 + (i % 12) * 0.03, T.prob + 0.4), background: ACCENT}} />
            </div> : null; })}
        </div>
        <div style={abs(540, 1500, {transform: 'translateX(-50%)', fontFamily: MONO, fontWeight: 700, fontSize: 72, color: TEXT, opacity: k(t, T.every, T.every + 0.3), whiteSpace: 'nowrap'})}>
          {counter.toLocaleString('en-US')}{counter >= 100000 ? '+' : ''} <span style={{fontSize: 40, color: MUTED}}>tokens scored</span></div>
      </div>}

      {/* ── THE CHART / THE WEIGHTED DICE ── */}
      {ch > 0 && <div style={{position: 'absolute', inset: 0, opacity: ch, transform: `translateY(${enter(SCN.chart)}px)`}}>
        <div style={abs(80, 590, {width: 920, height: 130, background: '#2F3747', borderRadius: 34, display: 'flex', alignItems: 'center', padding: '0 34px', boxSizing: 'border-box',
          fontFamily: MONO, fontWeight: 700, fontSize: 56, color: TEXT})}>
          {typed(['The', ' sky', ' is'], t, T.after, wi(65) + 0.2)}<span style={{color: ACCENT, marginLeft: 16, opacity: Math.floor(t * 3) % 2 ? 1 : 0.3}}>___</span></div>
        {/* bars */}
        <div style={abs(80, 780, {width: 920, opacity: 1 - strip})}>
          {ROWS.map(([s, p, t0, said], i) => { const g = k(t, t0 - 0.1, t0 + 0.7); const show = t > t0 - 0.15; const top = i === 0 && t > T.top - 0.2;
            return <div key={i} style={{display: 'flex', alignItems: 'center', height: 92, opacity: show ? (said ? 1 : 0.55) : 0}}>
              <div style={{width: 230, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: said ? TEXT : MUTED, whiteSpace: 'pre'}}>{s.trim()}</div>
              <div style={{width: Math.max(6, 560 * p / 60 * g), height: 52, borderRadius: 14, background: said ? CHIP[i % CHIP.length] : '#3A4356', boxShadow: top ? `0 0 26px ${ACCENT}` : 'none'}} />
              <div style={{marginLeft: 18, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: said ? TEXT : MUTED}}>{p < 1 ? '≈0%' : Math.round(p * g) + '%'}</div>
            </div>; })}
          <div style={{marginTop: 14, fontFamily: UI, fontWeight: 700, fontSize: 36, color: MUTED, opacity: k(t, T.zero, T.zero + 0.3)}}>all together = 100%</div>
          {t > T.top - 0.2 && <div style={abs(250, -62, {transform: `scale(${pop(frame, fps, T.top - 0.2)})`, background: '#FF4D5E', color: '#fff', fontFamily: UI, fontWeight: 800,
            fontSize: 34, padding: '8px 22px', borderRadius: 30, whiteSpace: 'nowrap'})}>not always #1</div>}
        </div>
        {/* weighted strip + dice */}
        {strip > 0 && (() => {
          const segs: [number, number, number][] = []; let x0 = 0; ROWS.forEach(([, p], i) => { const w = Math.max(p, 0.6) / 100.6 * 920; segs.push([x0, w, i]); x0 += w; });
          let last: [number, number] | null = null; for (const r of ROLLS) if (t >= r[0] - 0.9) last = r;
          const landing = last ? k(t, last[0] - 0.9, last[0], Easing.out(Easing.cubic)) : 0;
          const target = last ? segs[last[1]][0] + segs[last[1]][1] * (last[1] === 0 ? 0.35 + 0.1 * ROLLS.indexOf(last) : 0.5) : 0;
          const bx = 80 + lerp(target + 920 * 1.5, target, landing) % 920;
          return <div style={{opacity: strip}}>
            <div style={abs(80, 1010, {width: 920, height: 110, display: 'flex', borderRadius: 26, overflow: 'hidden', border: `3px solid ${LINE}`})}>
              {segs.map(([, w, i]) => <div key={i} style={{width: w, height: 110, background: i < 2 || i === 5 ? CHIP[i % CHIP.length] : '#3A4356', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#0D1016', borderRight: '2px solid #0D1016', boxSizing: 'border-box'}}>{w > 120 ? ROWS[i][0].trim() : ''}</div>)}
            </div>
            {last && <div style={abs(bx - 22, 960, {width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: `0 0 24px ${ACCENT}`})} />}
            {/* the die */}
            <svg width={200} height={200} style={abs(440, 760)}>
              <g transform={`translate(100,100) rotate(${t > T.rolls - 0.2 ? (t * 400) % 360 * (landing < 1 ? 1 : 0) : 0}) scale(${pop(frame, fps, T.rolls - 0.2)})`}>
                <rect x={-60} y={-60} width={120} height={120} rx={24} fill="#fff" />
                {[[-28, -28], [28, 28], [0, 0], [28, -28], [-28, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={ACCENT} />)}
              </g>
            </svg>
            <div style={abs(80, 1180, {fontFamily: UI, fontWeight: 700, fontSize: 34, color: MUTED})}>weighted: bigger slice = more likely</div>
            {/* results */}
            <div style={abs(80, 1260, {width: 920, display: 'flex', gap: 16, flexWrap: 'wrap'})}>
              {ROLLS.map(([tl, ri], i) => t >= tl ? <div key={i} style={{transform: `scale(${pop(frame, fps, tl)})`}}>
                <Chip s={ROWS[ri][0].trim() + (ri === 0 ? ' ✓' : ' ★')} i={ri} size={44} glow={ri !== 0} /></div> : null)}
            </div>
            {t > T.sneaks - 0.05 && <div style={abs(540, 1390, {transform: `translateX(-50%) scale(${pop(frame, fps, T.sneaks - 0.05)})`, fontFamily: UI, fontWeight: 800, fontSize: 44,
              color: ACCENT, whiteSpace: 'nowrap'})}>a less likely one sneaks in</div>}
          </div>; })()}
      </div>}

      {/* ── APPEND AND REPEAT ── */}
      {lp > 0 && <div style={{position: 'absolute', inset: 0, opacity: lp, transform: `translateY(${enter(SCN.loop)}px)`}}>
        <div style={abs(80, 620, {width: 920, minHeight: 240, background: PANEL, border: `3px solid ${LINE}`, borderRadius: 36, padding: 30, boxSizing: 'border-box', lineHeight: 1.9})}>
          {['The', ' sky', ' is'].map((s, i) => <Chip key={i} s={s} i={i} size={44} />)}
          {t > T.added - 0.1 && <span style={{display: 'inline-block', transform: `translateY(${(1 - k(t, T.added - 0.1, T.added + 0.3)) * 260}px)`}}><Chip s=" clear" i={1} size={44} glow /></span>}
          {MORE.slice(0, nMore).map((s, i) => <Chip key={i} s={s} i={i + 4} size={44} />)}
          {t > T.done && <span style={{marginLeft: 12, fontFamily: UI, fontWeight: 800, fontSize: 50, color: '#3DDC97'}}>✓ done</span>}
        </div>
        {/* chosen token rising from below */}
        {t < T.added + 0.3 && <div style={abs(540, lerp(1300, 1080, k(t, T.chosen - 0.3, T.chosen + 0.2)), {transform: 'translateX(-50%)', opacity: 1 - k(t, T.added, T.added + 0.25)})}>
          <Chip s=" clear" i={1} size={56} glow /></div>}
        {/* the loop */}
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: k(t, T.added + 0.4, T.added + 0.8)}}>
          <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={ACCENT} /></marker></defs>
          <path d="M 300 900 C 120 1080, 180 1330, 420 1330 M 660 1330 C 900 1330, 960 1080, 780 900" fill="none" stroke={ACCENT} strokeWidth={8} strokeDasharray="22 14"
            strokeDashoffset={-t * 90} markerEnd="url(#ah)" />
          <g transform={`translate(540,1330) scale(${1 + 0.05 * Math.sin(t * 8)})`}>
            <rect x={-130} y={-60} width={260} height={120} rx={30} fill="#1E2433" stroke={ACCENT} strokeWidth={5} />
            <text y={14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={38} fill={TEXT}>MODEL</text>
          </g>
          <text x={540} y={1480} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={42} fill={MUTED} opacity={k(t, T.repeats - 0.2, T.repeats + 0.2)}>score → roll → add → repeat</text>
        </svg>
      </div>}

      {/* ── TWO ANSWERS DRIFT APART ── */}
      {tr > 0 && <div style={{position: 'absolute', inset: 0, opacity: tr, transform: `translateY(${enter(SCN.tree)}px)`}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d={`M 330 1000 C 420 1000, 420 ${1000 - spread * br}, 520 ${1000 - spread * br}`} stroke={CHIP[0]} strokeWidth={8} fill="none" opacity={br} />
          <path d={`M 330 1000 C 420 1000, 420 ${1000 + spread * br}, 520 ${1000 + spread * br}`} stroke={CHIP[1]} strokeWidth={8} fill="none" opacity={br} />
        </svg>
        <div style={abs(60, 970, {})}>{['The', ' sky', ' is'].map((s, i) => <Chip key={i} s={s} i={i} size={34} />)}</div>
        <div style={abs(530, 1000 - spread * br - 34, {opacity: br})}>{[' blue', ' and', ' calm'].slice(0, 1 + Math.floor(2.99 * k(t, T.roll + 0.3, T.drift + 0.4))).map((s, i) => <Chip key={i} s={s} i={0} size={38} />)}</div>
        <div style={abs(530, 1000 + spread * br - 34, {opacity: br})}>{[' clear', ' tonight', ','].slice(0, 1 + Math.floor(2.99 * k(t, T.roll + 0.3, T.drift + 0.4))).map((s, i) => <Chip key={i} s={s} i={1} size={38} />)}</div>
        {t > T.roll - 0.1 && <div style={abs(60, 1060, {transform: `scale(${pop(frame, fps, T.roll - 0.1)})`, fontFamily: UI, fontWeight: 800, fontSize: 34, color: ACCENT, whiteSpace: 'nowrap'})}>1 different roll</div>}
      </div>}

      {/* ── END: not copied · send ── */}
      {end > 0 && <div style={{position: 'absolute', inset: 0, opacity: end, transform: `translateY(${enter(SCN.end)}px)`}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`translate(540,900) scale(${pop(frame, fps, T.copies - 0.3)})`}>
            <rect x={-150} y={-180} width={220} height={280} rx={24} fill="#232B3A" stroke={MUTED} strokeWidth={6} />
            <rect x={-70} y={-110} width={220} height={280} rx={24} fill="#1A2030" stroke={MUTED} strokeWidth={6} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={-40} y1={-60 + i * 50} x2={110} y2={-60 + i * 50} stroke={MUTED} strokeWidth={8} strokeLinecap="round" />)}
            {(() => { const p = k(t, T.copies + 0.3, T.copies + 0.65); return <g stroke="#FF4D5E" strokeWidth={22} strokeLinecap="round">
              <line x1={-200} y1={-220} x2={-200 + 400 * p} y2={-220 + 400 * p} /><line x1={200} y1={-220} x2={200 - 400 * p} y2={-220 + 400 * p} opacity={p > 0.5 ? 1 : 0} /></g>; })()}
          </g>
          {t > T.send - 0.1 && (() => { const u = k(t, T.send - 0.1, T.send + 0.9, Easing.inOut(Easing.cubic)); return (
            <g transform={`translate(${lerp(-80, 1160, u)},${lerp(1350, 1150, u)}) rotate(-14)`}>
              <path d="M -70 0 L 70 -36 L 12 48 Z" fill="#fff" /><path d="M -70 0 L 12 12 L 12 48" fill="#C9D1DE" /></g>); })()}
        </svg>
      </div>}

      <Captions t={t} ph={PH} emph={EMPH} accent={ACCENT} font="Inter" weight={800} size={70} top={220} />
    </AbsoluteFill>
  );
};

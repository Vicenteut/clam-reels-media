// CALENTADOR SOLAR · warm flat-illustration explainer (SVG + React).
// A house with a thermosiphon on the roof; two "cards" (the rule, the panel cross-section) slide over it; then the camera
// pushes in on the roof and the water itself shows the loop: hot rises into the tank, cold sinks back into the panel.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, CL, H, W, Word, at, k, lerp, pat, phrases, pop, poly, useFonts, win} from './lib';
import WORDS_JSON from './words-calentador.json';

const WORDS = WORDS_JSON as Word[];
const wi = at(WORDS);
const PH = phrases(WORDS, 6);
const EMPH = new Set(['hot', 'rises', 'black', 'copper', 'glass', 'lighter', 'above', 'heavier', 'sinks', 'thermosiphon', 'insulated', 'night', 'pump']);

// ── design tokens ──
const ACCENT = '#14B8A6';            // main accent (labels, emphasis, loop)
const HOT = '#FF5A36', COLD = '#2F8FE0', INK = '#2B2420', CREAM = '#FFF8EC';
// ── key times (word anchored) ──
const T = {
  roof: wi(7), hot: wi(9), wire: wi(14), pump: wi(16), rule: wi(17), rises: wi(23),
  sec: wi(26) - 0.15, panel: wi(28), black: wi(31), copper: wi(35), glass: wi(39), sun: wi(42), passes: wi(43), heats: wi(48), traps: wi(54), car: wi(57),
  back: wi(64) - 0.15, warms: wi(70), lighter: wi(73), rise: wi(75), above: wi(80), colder: wi(83), sinks: wi(86), panel2: wi(95),
  loop: wi(101), nopump: wi(107), thermo: wi(112), insul: wi(118), night: wi(123), elec: wi(128), send: wi(133),
};
const TH_LABEL = T.thermo + 0.5;           // when the THERMOSIPHON label appears

// ── world geometry (house side view) ──
const COL = {cx: 430, cy: 970, len: 296, th: 34, ang: -28.3};
const COL_LOW: [number, number] = [300, 1040], COL_HIGH: [number, number] = [560, 900];
const TANK = {x: 545, y: 735, w: 230, h: 110};
const HOT_PIPE = poly([[562, 898], [590, 872], [590, 768], [552, 768]]);
const COLD_PIPE = poly([[722, 843], [722, 1028], [290, 1028], [298, 1040]]);
const COL_FLOW = poly([COL_LOW, COL_HIGH]);
const KEYS: [number, number, number, number][] = [[0, 545, 1000, 1.12], [5.2, 560, 970, 1.25], [9.0, 560, 910, 1.85], [33.9, 560, 910, 1.85],
  [34.7, 560, 950, 1.55], [39.7, 560, 950, 1.55], [40.7, 540, 1010, 1.0], [99, 540, 1010, 1.03]];

function cam(t: number) {
  let i = 0; while (i + 1 < KEYS.length && t >= KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const u = interpolate(t, [a[0], b[0]], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  return {x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u)};
}
const mix = (c1: string, c2: string, u: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;
};

// particles running along a path; colour may depend on position
const Flow: React.FC<{d: string; t: number; t0: number; speed: number; n: number; col: (u: number) => string; r?: number; a?: number}> = ({d, t, t0, speed, n, col, r = 9, a = 1}) => {
  if (t < t0) return null;
  const fade = k(t, t0, t0 + 0.4) * a;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const u = (((t - t0) * speed + i / n) % 1 + 1) % 1, p = pat(d, u);
        return <circle key={i} cx={p.x} cy={p.y} r={r} fill={col(u)} opacity={fade * Math.min(1, u * 8, (1 - u) * 8)} />;
      })}
    </g>
  );
};

const Strike: React.FC<{x: number; y: number; s: number; p: number}> = ({x, y, s, p}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={70} fill="#fff" stroke={INK} strokeWidth={6} />
    <line x1={-52} y1={-52} x2={-52 + 104 * p} y2={-52 + 104 * p} stroke="#E8402A" strokeWidth={12} strokeLinecap="round" />
  </g>
);
const PlugIcon = () => (<g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round"><rect x={-22} y={-30} width={44} height={40} rx={8} fill="#FFD166" /><line x1={-10} y1={-30} x2={-10} y2={-46} /><line x1={10} y1={-30} x2={10} y2={-46} /><path d="M0 10 C 0 30, 20 32, 26 46" /></g>);
const PumpIcon = () => (<g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round"><circle r={26} fill="#9AD1F5" /><path d="M-8 -12 L 14 0 L -8 12 Z" fill={INK} /><line x1={-46} y1={0} x2={-26} y2={0} /><line x1={26} y1={0} x2={46} y2={0} /><rect x={-18} y={26} width={36} height={12} fill="#ccc" /></g>);

export const Calentador: React.FC = () => {
  useFonts([['Nunito', 'fonts/Nunito-var.ttf', {weight: '200 1000'}]]);
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const c = cam(t);
  const night = k(t, T.night - 1.0, T.night + 0.5, Easing.inOut(Easing.quad));
  const skyTop = mix('#7CC6F0', '#0B1D3A', night), skyBot = mix('#E3F5FF', '#2A3F68', night);
  // water temperature states
  const colWarm = k(t, T.warms - 0.2, T.lighter + 0.4);            // water in the panel warms
  const tankHot = k(t, T.rise + 0.6, T.colder + 1.5);               // hot layer builds at the top of the tank
  const loopOn = t >= T.panel2;
  const ruleCard = win(t, T.rule - 0.2, T.sec + 0.05, 0.4), secCard = win(t, T.sec, T.back + 0.1, 0.4);
  const cardShift = (a: number) => (1 - a) * 140;

  return (
    <AbsoluteFill style={{background: skyBot}}>
      <Audio src={staticFile('calentador/voz.wav')} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyBot} /></linearGradient>
          <linearGradient id="tankWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mix('#7FC4F2', HOT, tankHot)} /><stop offset={0.15 + 0.4 * tankHot} stopColor={mix('#7FC4F2', '#FF8A4C', tankHot)} />
            <stop offset={Math.min(0.95, 0.35 + 0.45 * tankHot)} stopColor="#7FC4F2" /><stop offset="1" stopColor={COLD} />
          </linearGradient>
          <linearGradient id="colWater" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={COLD} /><stop offset="1" stopColor={mix(COLD, HOT, colWarm)} /></linearGradient>
          <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#F2D49B" /><line x1="0" y1="0" x2="0" y2="14" stroke="#C9A35E" strokeWidth="5" /></pattern>
          <radialGradient id="sunG"><stop offset="0" stopColor="#FFF4B0" /><stop offset="0.6" stopColor="#FFD23F" /><stop offset="1" stopColor="#FFB000" /></radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        {/* stars + moon */}
        <g opacity={night}>{Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 263) % 1080} cy={480 + ((i * 137) % 420)} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
          <circle cx={860} cy={600} r={58} fill="#F4F1DE" /><circle cx={884} cy={584} r={52} fill={skyTop} /></g>
        {/* sun (day) */}
        <g transform={`translate(880,610) rotate(${t * 12})`} opacity={1 - night}>
          {Array.from({length: 12}, (_, i) => <rect key={i} x={-6} y={-112} width={12} height={34} rx={6} fill="#FFC531" transform={`rotate(${i * 30})`} />)}
          <circle r={62} fill="url(#sunG)" />
        </g>

        {/* ── WORLD (camera) ── */}
        <g transform={`translate(${W / 2 - c.x * c.z},${H / 2 - c.y * c.z}) scale(${c.z})`}>
          {/* neighbours */}
          <g opacity={0.55}>
            <rect x={-260} y={1250} width={300} height={250} fill="#E9D7B5" /><rect x={-275} y={1230} width={330} height={24} fill="#CDB892" />
            <rect x={1000} y={1270} width={320} height={230} fill="#E2CFAE" /><rect x={985} y={1250} width={350} height={24} fill="#C8B38D" />
            <rect x={1090} y={1180} width={90} height={70} rx={10} fill="#DDE3E8" />
          </g>
          <rect x={-800} y={1500} width={2700} height={900} fill={mix('#86C06C', '#2E4A33', night)} />
          <rect x={-800} y={1560} width={2700} height={90} fill={mix('#9AA0A6', '#3B4048', night)} />
          {/* house */}
          <rect x={250} y={1080} width={580} height={420} fill={mix('#F6E6C6', '#8D8573', night)} stroke={INK} strokeWidth={6} />
          <rect x={230} y={1050} width={620} height={34} fill="#D8C4A0" stroke={INK} strokeWidth={6} />
          {/* bathroom cutaway with shower */}
          <rect x={300} y={1170} width={230} height={280} fill={mix('#CDEBF6', '#3E5878', night)} stroke={INK} strokeWidth={5} />
          <path d="M 470 1170 L 470 1205 L 440 1205" stroke="#8A8F96" strokeWidth={8} fill="none" />
          <rect x={410} y={1198} width={40} height={14} rx={6} fill="#8A8F96" />
          {t > T.hot - 0.2 && Array.from({length: 10}, (_, i) => { const u = ((t * 1.6 + i / 10) % 1); return <line key={i} x1={414 + (i % 5) * 8} y1={1216 + u * 200} x2={412 + (i % 5) * 8} y2={1232 + u * 200} stroke="#3C9BE0" strokeWidth={4} strokeLinecap="round" opacity={k(t, T.hot - 0.2, T.hot + 0.2)} />; })}
          {t > T.hot + 0.3 && Array.from({length: 5}, (_, i) => { const u = ((t * 0.45 + i / 5) % 1); return <circle key={i} cx={400 + i * 20 + Math.sin(t * 2 + i) * 10} cy={1400 - u * 210} r={16 + u * 18} fill="#fff" opacity={(1 - u) * 0.7 * k(t, T.hot + 0.3, T.hot + 0.8)} />; })}
          <rect x={640} y={1320} width={95} height={180} fill="#B5835A" stroke={INK} strokeWidth={5} />
          {/* tank legs + collector legs */}
          <g stroke="#6B6F76" strokeWidth={8}><line x1={585} y1={845} x2={585} y2={1050} /><line x1={740} y1={845} x2={740} y2={1050} /><line x1={500} y1={930} x2={500} y2={1050} /><line x1={400} y1={985} x2={400} y2={1050} /></g>
          {/* pipes */}
          <path d={COLD_PIPE} stroke={INK} strokeWidth={18} fill="none" strokeLinejoin="round" />
          <path d={COLD_PIPE} stroke={mix('#9DB7CC', COLD, k(t, T.sinks - 0.3, T.sinks + 0.3))} strokeWidth={10} fill="none" strokeLinejoin="round" />
          <path d={HOT_PIPE} stroke={INK} strokeWidth={18} fill="none" strokeLinejoin="round" />
          <path d={HOT_PIPE} stroke={mix('#9DB7CC', HOT, k(t, T.rise - 0.2, T.rise + 0.4))} strokeWidth={10} fill="none" strokeLinejoin="round" />
          {/* collector (tilted panel) */}
          <g transform={`translate(${COL.cx},${COL.cy}) rotate(${COL.ang})`}>
            <rect x={-COL.len / 2} y={-COL.th / 2} width={COL.len} height={COL.th} rx={4} fill="#23272E" stroke={INK} strokeWidth={6} />
            <rect x={-COL.len / 2 + 8} y={-3} width={COL.len - 16} height={10} rx={5} fill="url(#colWater)" />
            <rect x={-COL.len / 2 + 6} y={-COL.th / 2 + 3} width={COL.len - 12} height={6} fill="#BDE7F7" opacity={0.7} />
          </g>
          {/* tank */}
          <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={TANK.h / 2} fill="url(#tankWater)" stroke={INK} strokeWidth={6} />
          {/* insulation cut-away */}
          {t > T.insul - 0.3 && (() => { const a = k(t, T.insul - 0.3, T.insul + 0.3); return (
            <g opacity={a}>
              <rect x={TANK.x - 14} y={TANK.y - 14} width={TANK.w + 28} height={TANK.h + 28} rx={(TANK.h + 28) / 2} fill="none" stroke="url(#hatch)" strokeWidth={22} />
              <rect x={TANK.x - 25} y={TANK.y - 25} width={TANK.w + 50} height={TANK.h + 50} rx={(TANK.h + 50) / 2} fill="none" stroke={INK} strokeWidth={4} />
            </g>); })()}
          {/* "that box on your neighbor's roof" */}
          {t > wi(3) - 0.1 && t < wi(11) && <ellipse cx={560} cy={860} rx={300 + 10 * Math.sin(t * 6)} ry={190 + 8 * Math.sin(t * 6)} fill="none" stroke={ACCENT} strokeWidth={8}
            strokeDasharray="30 16" strokeDashoffset={-t * 60} opacity={win(t, wi(3) - 0.1, wi(11), 0.3)} />}
          {/* water flows */}
          <Flow d={COL_FLOW} t={t} t0={T.warms - 0.2} speed={loopOn ? 0.5 : 0.22} n={6} r={7} col={(u) => mix(COLD, HOT, Math.min(1, u * 1.2) * colWarm)} />
          <Flow d={HOT_PIPE} t={t} t0={T.rise - 0.1} speed={0.7} n={4} r={8} col={() => HOT} />
          <Flow d={COLD_PIPE} t={t} t0={T.sinks - 0.1} speed={0.32} n={9} r={8} col={() => COLD} />
          {/* "above the panel": height marker (panel top level -> tank bottom) */}
          {t > T.above - 0.2 && t < T.loop + 0.4 && (() => { const a = win(t, T.above - 0.2, T.loop + 0.4, 0.3), g = k(t, T.above - 0.2, T.above + 0.4), yy = lerp(900, 852, g); return (
            <g opacity={a}>
              <line x1={560} y1={900} x2={700} y2={900} stroke={ACCENT} strokeWidth={4} strokeDasharray="8 6" />
              <line x1={660} y1={900} x2={660} y2={yy} stroke={ACCENT} strokeWidth={6} />
              <path d={'M 648 ' + (yy + 14) + ' L 660 ' + yy + ' L 672 ' + (yy + 14)} stroke={ACCENT} strokeWidth={6} fill="none" />
              <text x={672} y={892} fontFamily="Nunito" fontWeight={900} fontSize={24} fill={ACCENT}>HIGHER</text>
            </g>); })()}
          {/* the loop */}
          {t > T.loop - 0.2 && (() => { const a = win(t, T.loop - 0.2, T.insul, 0.4); const d = 'M 285 1062 L 578 905 L 608 718 L 792 718 L 768 1048 L 285 1048';
            return <path d={d} fill="none" stroke={ACCENT} strokeWidth={7} strokeDasharray="26 18" strokeDashoffset={-t * 80} opacity={a * 0.9} strokeLinejoin="round" />; })()}
          {/* thermometer by the tank */}
          {t > T.insul && (() => { const a = k(t, T.insul, T.insul + 0.4); return (
            <g opacity={a} transform="translate(830,700)">
              <rect x={-12} y={-70} width={24} height={110} rx={12} fill="#fff" stroke={INK} strokeWidth={5} />
              <circle cy={52} r={22} fill={HOT} stroke={INK} strokeWidth={5} /><rect x={-6} y={-50} width={12} height={100} fill={HOT} />
            </g>); })()}
        </g>

        {/* hook icons: no wire, no pump */}
        {t > T.wire - 0.15 && t < T.rule + 0.2 && (() => { const a = win(t, T.wire - 0.15, T.rule + 0.2, 0.25); return (
          <g opacity={a}>
            <g transform="translate(380,640)"><Strike x={0} y={0} s={pop(frame, fps, T.wire - 0.1)} p={k(t, T.wire + 0.1, T.wire + 0.35)} /><g transform={`scale(${pop(frame, fps, T.wire - 0.1)})`}><PlugIcon /></g></g>
            {t > T.pump - 0.1 && <g transform="translate(640,640)"><Strike x={0} y={0} s={pop(frame, fps, T.pump - 0.1)} p={k(t, T.pump + 0.1, T.pump + 0.35)} /><g transform={`scale(${pop(frame, fps, T.pump - 0.1)})`}><PumpIcon /></g></g>}
          </g>); })()}
        {/* "no pump" again during the loop */}
        {t > T.nopump - 0.1 && t < T.insul && <g opacity={win(t, T.nopump - 0.1, T.insul, 0.3)} transform="translate(150,760)"><Strike x={0} y={0} s={0.8 * pop(frame, fps, T.nopump - 0.1)} p={k(t, T.nopump + 0.1, T.nopump + 0.35)} /><g transform={`scale(${0.8 * pop(frame, fps, T.nopump - 0.1)})`}><PumpIcon /></g></g>}

        {/* ── CARD 1: the rule (convection in a beaker) ── */}
        {ruleCard > 0 && (
          <g opacity={ruleCard} transform={`translate(0,${cardShift(ruleCard)})`}>
            <rect x={60} y={520} width={960} height={1060} rx={46} fill={CREAM} stroke={INK} strokeWidth={6} />
            <text x={540} y={640} textAnchor="middle" fontFamily="Nunito" fontWeight={900} fontSize={44} fill={INK} letterSpacing={4} opacity={k(t, T.rule, T.rule + 0.3)}>ONE SIMPLE RULE</text>
            <path d="M 360 820 L 360 1320 Q 360 1350 390 1350 L 690 1350 Q 720 1350 720 1320 L 720 820" fill="#D6EEFB" stroke={INK} strokeWidth={8} />
            <rect x={360} y={1370} width={360} height={26} rx={13} fill={HOT} opacity={0.6 + 0.4 * Math.sin(t * 8)} />
            {Array.from({length: 18}, (_, i) => {   // convection: up the middle (hot), out at the top, down the sides (cold)
              const side = i % 2 ? 1 : -1, u = ((t * 0.32 + i / 18) % 1);
              let x, y, col;
              if (u < 0.45) { const v = u / 0.45; x = 540 + side * 25; y = 1310 - v * 420; col = HOT; }
              else if (u < 0.55) { const v = (u - 0.45) / 0.1; x = 540 + side * (25 + v * 115); y = 890; col = mix(HOT, COLD, v); }
              else if (u < 0.9) { const v = (u - 0.55) / 0.35; x = 540 + side * 140; y = 890 + v * 420; col = COLD; }
              else { const v = (u - 0.9) / 0.1; x = 540 + side * (140 - v * 115); y = 1310; col = mix(COLD, HOT, v); }
              return <circle key={i} cx={x} cy={y} r={13} fill={col} opacity={k(t, T.rule, T.rule + 0.5)} />;
            })}
            <g opacity={k(t, T.rises - 0.1, T.rises + 0.25)} transform={`translate(540,${760 - 20 * k(t, T.rises - 0.1, T.rises + 0.5)})`}>
              <text textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={78} fill={HOT}>HOT WATER RISES</text>
            </g>
            <g opacity={k(t, T.rises + 0.3, T.rises + 0.6)} fontFamily="Nunito" fontWeight={900} fontSize={34}>
              <text x={540} y={1460} textAnchor="middle" fill={HOT}>↑ warm = lighter</text>
              <text x={540} y={1510} textAnchor="middle" fill={COLD}>↓ cold = heavier</text>
            </g>
          </g>
        )}

        {/* ── CARD 2: the panel, cross-section ── */}
        {secCard > 0 && (() => {
          const heat = k(t, T.heats - 0.1, T.heats + 0.7);
          return (
          <g opacity={secCard} transform={`translate(0,${cardShift(secCard)})`}>
            <rect x={60} y={520} width={960} height={1060} rx={46} fill={CREAM} stroke={INK} strokeWidth={6} />
            <text x={540} y={630} textAnchor="middle" fontFamily="Nunito" fontWeight={900} fontSize={40} fill={INK} letterSpacing={3} opacity={k(t, T.panel - 0.1, T.panel + 0.3)}>FLAT PANEL · CROSS-SECTION</text>
            {/* tray */}
            <path d="M 190 1000 L 190 1290 L 890 1290 L 890 1000" fill="#EDE6D8" stroke="#8A8F96" strokeWidth={14} opacity={k(t, T.panel - 0.1, T.panel + 0.4)} />
            {/* black plate */}
            <rect x={lerp(-700, 220, k(t, T.black - 0.1, T.black + 0.45))} y={1150} width={640} height={26} fill={mix('#1C1C1C', '#7A1E12', heat)} stroke={INK} strokeWidth={4} />
            {heat > 0 && <rect x={220} y={1140} width={640} height={46} fill={HOT} opacity={0.35 * heat * (0.8 + 0.2 * Math.sin(t * 6))} filter="url(#soft)" />}
            {/* copper tubes */}
            {[290, 420, 540, 660, 790].map((x, i) => { const s = pop(frame, fps, T.copper - 0.1 + i * 0.08); return (
              <g key={i} transform={`translate(${x},1206) scale(${s})`}><circle r={26} fill="#C8763B" stroke={INK} strokeWidth={4} /><circle r={15} fill="#7FC4F2" /></g>); })}
            {/* glass */}
            <rect x={200} y={lerp(860, 1030, k(t, T.glass - 0.1, T.glass + 0.4, Easing.out(Easing.back(1.4))))} width={680} height={20} rx={4}
              fill="#BDE7F7" opacity={0.85 * k(t, T.glass - 0.1, T.glass + 0.2)} stroke="#7FB3CF" strokeWidth={3} />
            {/* labels */}
            {[['GLASS', T.glass + 0.3, 210, 1012], ['BLACK PLATE', T.black + 0.3, 230, 1134], ['COPPER TUBES', T.copper + 0.4, 230, 1276]].map(([str, t0, x, y], i) => (
              <text key={i} x={x as number} y={y as number} fontFamily="Nunito" fontWeight={1000} fontSize={30} fill={ACCENT} letterSpacing={2}
                opacity={k(t, t0 as number, (t0 as number) + 0.25)}>{str}</text>))}
            {/* sun + rays through the glass */}
            <g transform={`translate(230,790) scale(${0.75 * pop(frame, fps, T.sun - 0.1)}) rotate(${t * 15})`}>
              {Array.from({length: 10}, (_, i) => <rect key={i} x={-5} y={-92} width={10} height={26} rx={5} fill="#FFC531" transform={`rotate(${i * 36})`} />)}
              <circle r={52} fill="url(#sunG)" />
            </g>
            {[0, 1, 2].map((i) => { const p = k(t, T.passes + i * 0.12, T.passes + 0.7 + i * 0.12); const x0 = 300 + i * 70, y0 = 860, x1 = 470 + i * 150, y1 = 1150;
              return <line key={i} x1={x0} y1={y0} x2={lerp(x0, x1, p)} y2={lerp(y0, y1, p)} stroke="#FFC531" strokeWidth={10} strokeLinecap="round" opacity={p > 0 ? 1 : 0} />; })}
            {/* trapped heat: wavy arrows bounce between plate and glass */}
            {t > T.traps - 0.2 && [0, 1, 2, 3].map((i) => { const u = ((t - T.traps) * 0.9 + i / 4) % 1, y = u < 0.5 ? lerp(1140, 1056, u * 2) : lerp(1056, 1140, (u - 0.5) * 2);
              return <path key={i} d={`M ${330 + i * 150} ${y} q 12 -10 0 -20 q -12 -10 0 -20`} stroke={HOT} strokeWidth={6} fill="none" opacity={k(t, T.traps - 0.2, T.traps + 0.3)} />; })}
            {/* car parked in the sun */}
            {t > T.car - 0.1 && (() => { const s = pop(frame, fps, T.car - 0.1); return (
              <g transform={`translate(800,1430) scale(${s})`}>
                <rect x={-170} y={-95} width={340} height={190} rx={30} fill="#fff" stroke={INK} strokeWidth={5} />
                <path d="M -120 30 L -95 -20 L 60 -20 L 100 30 Z" fill="#FFB4A2" stroke={INK} strokeWidth={5} />
                <rect x={-140} y={28} width={270} height={40} rx={14} fill="#E8402A" stroke={INK} strokeWidth={5} />
                <circle cx={-80} cy={70} r={18} fill={INK} /><circle cx={70} cy={70} r={18} fill={INK} />
                {[0, 1, 2].map((i) => <path key={i} d={`M ${-60 + i * 40} ${12 - ((t * 30 + i * 10) % 20)} q 6 -6 0 -12 q -6 -6 0 -12`} stroke={HOT} strokeWidth={4} fill="none" />)}
              </g>); })()}
          </g>); })()}

        {/* THERMOSIPHON label */}
        {t > TH_LABEL - 0.05 && t < T.insul + 0.4 && (() => { const s = pop(frame, fps, TH_LABEL - 0.05, 9), a = 1 - k(t, T.insul, T.insul + 0.4); return (
          <g transform={`translate(540,545) scale(${s})`} opacity={a}>
            <rect x={-300} y={-62} width={600} height={124} rx={62} fill={ACCENT} stroke={INK} strokeWidth={6} />
            <text y={22} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={62} fill="#fff" letterSpacing={3}>THERMOSIPHON</text>
          </g>); })()}
        {/* INSULATED tag */}
        {t > T.insul && t < T.elec && <g opacity={win(t, T.insul, T.elec, 0.3)} transform={`translate(540,640) scale(${pop(frame, fps, T.insul)})`}>
          <rect x={-200} y={-46} width={400} height={92} rx={46} fill="#F2D49B" stroke={INK} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={46} fill={INK}>INSULATED</text></g>}

        {/* electric heater bill + send */}
        {t > T.elec - 0.2 && (() => { const a = k(t, T.elec - 0.2, T.elec + 0.2); const n = 1 + Math.floor(3 * k(t, T.elec, T.send - 0.3, Easing.linear) - 1e-6); return (
          <g opacity={a} transform={`translate(540,660) scale(${pop(frame, fps, T.elec - 0.2)})`}>
            <rect x={-260} y={-80} width={520} height={160} rx={36} fill="#fff" stroke={INK} strokeWidth={6} />
            <path d="M -170 -40 L -200 10 L -172 10 L -190 52 L -140 -6 L -168 -6 L -150 -40 Z" fill="#FFD166" stroke={INK} strokeWidth={5} />
            <text x={40} y={26} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={80} fill="#E8402A" letterSpacing={6}>{'$'.repeat(Math.max(1, n))}</text>
          </g>); })()}
        {t > T.send - 0.1 && (() => { const u = k(t, T.send - 0.1, T.send + 0.9, Easing.inOut(Easing.cubic)); return (
          <g transform={`translate(${lerp(-80, 1160, u)},${lerp(900, 760, u)}) rotate(-12)`}>
            <path d="M -60 0 L 60 -30 L 10 40 Z" fill="#fff" stroke={INK} strokeWidth={5} /><path d="M -60 0 L 10 10 L 10 40" fill="#DDE3E8" stroke={INK} strokeWidth={5} />
          </g>); })()}
      </svg>
      <Captions t={t} ph={PH} emph={EMPH} accent={ACCENT} font="Nunito" weight={900} size={74} top={220} />
    </AbsoluteFill>
  );
};

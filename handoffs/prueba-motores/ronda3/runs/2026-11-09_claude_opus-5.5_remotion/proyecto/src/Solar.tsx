// RONDA 3 · How a residential solar system works — isometric "living cutaway" (SVG + React, Remotion).
// One persistent 3D-looking world (isometric house with the front walls cut away, lifted roof with panels, inverter, breaker panel,
// loads, meter, grid pole, battery bank) and a camera that travels between stations. Energy is shown as beads on the wires:
// direct current = amber beads moving one way; alternating current = teal beads oscillating. A live power HUD at the bottom
// (SOLAR / HOME / GRID / BATTERY) explains who supplies whom at every moment. All times are anchored to word indices.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CL, Word, at, k, lerp, phrases, pop, useFonts, win} from './lib';
import WORDS_JSON from './words-solar.json';

const WORDS = WORDS_JSON as Word[];
const wi = at(WORDS);
const PH = phrases(WORDS, 6);

// ── design tokens ──
const ACCENT = '#FF6B35';                 // main accent: labels, emphasis, highlights
const DC = '#FFB020', AC = '#18C3B0', GRIDC = '#7A8BA8', BAD = '#E8402A';
const INK = '#1E2433', FONT = 'Inter';
const EMPH = new Set(['direct', 'alternating', 'inverter', 'breaker', 'grid', 'battery', 'bank', 'blackout', 'hybrid', 'noon', 'night', 'meter', 'two-way', 'second', 'bigger', 'limits']);

// ── key times (word anchored) ──
const T = {
  hook: 0, follow: wi(11), sun: wi(14), panels: wi(17), dc: wi(24), wired: wi(27), adds: wi(32), cable: wi(38),
  house: wi(42), altc: wi(45), inv: wi(53), box: wi(55), converts: wi(57), acout: wi(61),
  from: wi(63), breaker: wi(71), lights: wi(78), fridge: wi(80), aircon: wi(83),
  plug: wi(85), second: wi(91), cant: wi(98), grid1: wi(102), covers: wi(104), runsun: wi(108), morepanels: wi(115), bigger: wi(120), limits: wi(125), once: wi(132),
  noon: wi(134), extra: wi(144), out: wi(145), meter: wi(155), counts: wi(157),
  night: wi(160), stop: wi(163), keep: wi(165), battery: wi(174), stores: wi(177), without: wi(183), pull: wi(186),
  blackout: wi(193), normal: wi(195), shuts: wi(198), workers: wi(204), only: wi(208), batteries: wi(209), hybrid: wi(212), lightson: wi(216),
  know: wi(218), send: wi(223),
};
const INV_LABEL = T.inv;                  // when the "Inverter" label appears

// ── isometric projection ──
const S = 46, X0 = 444, Y0 = 950;
type V3 = [number, number, number];
const P = (x: number, y: number, z: number): [number, number] => [X0 + (x - y) * 0.866 * S, Y0 + (x + y) * 0.5 * S - z * S];
const pts = (a: V3[]) => a.map((v) => P(...v).join(',')).join(' ');
const path3 = (a: V3[]) => 'M' + a.map((v) => P(...v).join(' ')).join(' L ');

// ── camera: [time, target x, target y (base-layout screen coords), zoom] ──
const WIDE: [number, number] = [575, 960];
const ROOF: [number, number] = P(5, 4, 10.2), INVP: [number, number] = P(8.6, 0, 3.4), BRK: [number, number] = P(4.2, 0.6, 3.6);
const EXP: [number, number] = P(9.8, 0, 3.8), BAT: [number, number] = P(8.4, 1, 2.0), POLE: [number, number] = P(10.8, 0, 4.2);
const KEYS: [number, number, number, number][] = [
  [0, ...WIDE, 1.0], [T.follow + 0.4, ...WIDE, 1.06], [T.sun + 0.5, ...ROOF, 1.55], [T.cable - 0.1, ...ROOF, 1.6],
  [T.house + 0.2, ...INVP, 1.75], [T.from - 0.3, ...INVP, 1.75], [T.breaker - 0.4, ...BRK, 1.2], [T.plug - 0.3, ...BRK, 1.2],
  [T.second, ...WIDE, 1.02], [T.runsun - 0.2, ...WIDE, 1.02], [T.morepanels - 0.6, ...ROOF, 1.4], [T.bigger - 0.6, ...ROOF, 1.4],
  [T.bigger, ...INVP, 1.6], [T.once + 0.3, ...INVP, 1.6], [T.noon + 0.6, ...EXP, 1.12], [T.night - 0.4, ...EXP, 1.12],
  [T.keep, ...BAT, 1.35], [T.pull + 0.5, ...BAT, 1.35], [T.blackout + 0.3, ...POLE, 1.15], [T.only - 0.4, ...POLE, 1.15],
  [T.hybrid - 0.3, ...BAT, 1.35], [T.know - 0.2, ...BAT, 1.35], [T.send - 0.4, ...WIDE, 0.98], [99, ...WIDE, 1.0],
];
function cam(t: number) {
  let i = 0; while (i + 1 < KEYS.length && t >= KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const u = interpolate(t, [a[0], b[0]], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  return {x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u)};
}
const CY = 980;   // screen y where the camera target sits
const toScreen = (c: {x: number; y: number; z: number}, p: [number, number]): [number, number] => [540 + (p[0] - c.x) * c.z, CY + (p[1] - c.y) * c.z];

const mix = (c1: string, c2: string, u: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;
};

// ── wires (3D polylines) ──
const W_DC: V3[] = [[9.9, 0.25, 10.15], [9.7, 0.25, 4.9], [8.6, 0.25, 4.9], [8.6, 0.25, 4.45]];
const W_INV_BRK: V3[] = [[8.6, 0.25, 2.55], [8.6, 0.25, 2.0], [6.45, 0.25, 2.0], [6.45, 0.25, 2.4]];
const W_LIGHTS: V3[] = [[6.3, 0.25, 3.85], [6.3, 0.25, 5.5], [0.25, 0.25, 5.5], [0.25, 6.8, 5.5], [0.25, 6.8, 5.05]];
const W_FRIDGE: V3[] = [[6.1, 0.25, 2.4], [6.1, 0.25, 0.6], [0.8, 0.25, 0.6], [0.8, 1.0, 0.6]];
const W_AC1: V3[] = [[0.25, 0.25, 5.5], [0.25, 4.2, 5.5], [0.25, 4.2, 5.05]];
const W_AC2: V3[] = [[2.3, 0.25, 5.5], [2.3, 0.25, 5.05]];
const W_GRID: V3[] = [[6.9, 0.25, 3.1], [10.0, 0.25, 3.1], [10.75, 0.0, 3.1]];
const W_POLE: V3[] = [[11.25, 0.0, 3.1], [12.6, 0.0, 3.1], [12.8, 0.0, 3.1], [12.8, 0.0, 7.4]];
const W_BAT: V3[] = [[9.1, 0.9, 1.6], [9.1, 0.25, 1.6], [9.1, 0.25, 2.55]];

// polyline helpers in screen space (base layout)
type Pl = {p: [number, number][]; L: number[]; tot: number};
const mk = (a: V3[]): Pl => { const p = a.map((v) => P(...v)); const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return {p, L, tot: L[L.length - 1]}; };
const ptAt = (pl: Pl, d: number): [number, number] => { d = Math.max(0, Math.min(pl.tot, d)); for (let i = 1; i < pl.p.length; i++) if (d <= pl.L[i]) { const f = (d - pl.L[i - 1]) / Math.max(1e-6, pl.L[i] - pl.L[i - 1]); return [lerp(pl.p[i - 1][0], pl.p[i][0], f), lerp(pl.p[i - 1][1], pl.p[i][1], f)]; } return pl.p[pl.p.length - 1]; };
const PL = {dc: mk(W_DC), ib: mk(W_INV_BRK), li: mk(W_LIGHTS), fr: mk(W_FRIDGE), a1: mk(W_AC1), a2: mk(W_AC2), gr: mk(W_GRID), po: mk(W_POLE), ba: mk(W_BAT)};
const dOf = (pl: Pl) => 'M' + pl.p.map((q) => q.join(' ')).join(' L ');

// one-way beads (direct current) — dir 1 = along the path, -1 = against it
const OneWay: React.FC<{pl: Pl; t: number; a: number; col: string; dir?: number; speed?: number}> = ({pl, t, a, col, dir = 1, speed = 120}) => {
  if (a <= 0) return null;
  const gap = 34, out = [];
  for (let d = (((t * speed) % gap) + gap) % gap; d < pl.tot; d += gap) {
    const dd = dir > 0 ? d : pl.tot - d, q = ptAt(pl, dd);
    out.push(<circle key={d} cx={q[0]} cy={q[1]} r={5.2} fill={col} opacity={a * Math.min(1, d / 18, (pl.tot - d) / 18)} />);
  }
  return <g filter="url(#glow)">{out}</g>;
};
// oscillating beads (alternating current)
const Osc: React.FC<{pl: Pl; t: number; a: number; col: string}> = ({pl, t, a, col}) => {
  if (a <= 0) return null;
  const gap = 34, off = 9 * Math.sin(t * Math.PI * 2 * 1.4), out = [];
  for (let d = 10; d < pl.tot - 6; d += gap) { const q = ptAt(pl, d + off); out.push(<circle key={d} cx={q[0]} cy={q[1]} r={5.2} fill={col} opacity={a} />); }
  return <g filter="url(#glow)">{out}</g>;
};

// iso box: visible faces = top, +x side, +y side
const Box: React.FC<{a: V3; b: V3; top: string; sx: string; sy: string; stroke?: string; op?: number}> = ({a, b, top, sx, sy, stroke = INK, op = 1}) => {
  const [x0, y0, z0] = a, [x1, y1, z1] = b;
  return (
    <g opacity={op} stroke={stroke} strokeWidth={1.6} strokeLinejoin="round">
      <polygon points={pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])} fill={sx} />
      <polygon points={pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])} fill={sy} />
      <polygon points={pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={top} />
    </g>
  );
};

// roof surface (lifted, sloped toward +y) and panel grid on it
const RZ0 = 10.6, RZ1 = 9.8;
const roofPt = (u: number, v: number, dz = 0): V3 => [lerp(-0.4, 10.4, u), lerp(-0.4, 8.4, v), lerp(RZ0, RZ1, v) + dz];
const PANEL = (col: number, row: number): V3[] => {
  const u0 = 0.06 + col * 0.148, u1 = u0 + 0.135, v0 = 0.12 + row * 0.4, v1 = v0 + 0.34;
  return [roofPt(u0, v0, 0.12), roofPt(u1, v0, 0.12), roofPt(u1, v1, 0.12), roofPt(u0, v1, 0.12)];
};

// callout label in SCREEN space, anchored to a base-layout point
const Callout: React.FC<{c: any; anchor: [number, number]; dx: number; dy: number; text: string; a: number; col?: string; fg?: string; size?: number}> = ({c, anchor, dx, dy, text, a, col = '#FFFFFF', fg = INK, size = 40}) => {
  if (a <= 0) return null;
  const [ax, ay] = toScreen(c, anchor), lx = Math.max(70, Math.min(910, ax + dx)), ly = ay + dy;
  const w = text.length * size * 0.56 + 44, h = size * 1.55, s = 0.85 + 0.15 * a;
  return (
    <g opacity={a}>
      <line x1={ax} y1={ay} x2={lx} y2={ly} stroke="#FFFFFF" strokeWidth={4} />
      <line x1={ax} y1={ay} x2={lx} y2={ly} stroke={INK} strokeWidth={2} />
      <circle cx={ax} cy={ay} r={7} fill={col === '#FFFFFF' ? ACCENT : col} stroke="#fff" strokeWidth={3} />
      <g transform={`translate(${Math.min(1010 - w / 2, Math.max(40 + w / 2, lx))},${ly}) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={col} stroke={INK} strokeWidth={3} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={fg}>{text}</text>
      </g>
    </g>
  );
};

// HUD bar
const Bar: React.FC<{y: number; label: string; v: number; col: string; note?: string; a?: number}> = ({y, label, v, col, note, a = 1}) => (
  <g transform={`translate(70,${y})`} opacity={a}>
    <text x={0} y={30} fontFamily={FONT} fontWeight={800} fontSize={36} fill="#FFFFFF">{label}</text>
    <rect x={250} y={2} width={430} height={38} rx={19} fill="rgba(255,255,255,0.14)" />
    <rect x={250} y={2} width={Math.max(0, 430 * Math.min(1, v))} height={38} rx={19} fill={col} />
    {note ? <text x={700} y={31} fontFamily={FONT} fontWeight={800} fontSize={32} fill={col}>{note}</text> : null}
  </g>
);

export const Solar: React.FC = () => {
  useFonts([['Inter', 'fonts/Inter-ExtraBold.ttf', {weight: '800'}]]);
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const c = cam(t);

  // ── world states ──
  const night = Math.min(k(t, T.night - 0.6, T.night + 0.6, Easing.inOut(Easing.quad)), 1 - k(t, T.blackout - 0.6, T.blackout + 0.2));
  const dark = k(t, T.blackout, T.blackout + 0.4) * (1 - k(t, T.lightson - 0.1, T.lightson + 0.3));   // blackout: interior dark
  const gridDown = t >= T.blackout;
  const sysOff = t >= T.shuts && t < T.hybrid + 0.2;                      // grid-tied inverter switched itself off
  const hybridOn = t >= T.hybrid;
  const sunUp = night < 0.5;
  const panelsLit = k(t, T.panels - 0.3, T.panels + 0.3) * (1 - night);
  const moreP = k(t, T.morepanels - 0.25, T.morepanels + 0.35);
  const invScale = 1 + 0.32 * k(t, T.bigger - 0.2, T.bigger + 0.4, Easing.out(Easing.back(1.6)));
  const batA = Math.max(win(t, T.battery - 0.3, T.without + 0.2, 0.35) * 1, 0.25 * k(t, T.without, T.without + 0.4) * (1 - k(t, T.only, T.only + 0.2)), k(t, T.batteries - 0.2, T.batteries + 0.3));
  const batGhost = t >= T.without + 0.2 && t < T.batteries - 0.2;
  const ac2 = k(t, T.second - 0.2, T.second + 0.3, Easing.out(Easing.back(1.8)));
  const meterA = k(t, T.meter - 0.2, T.meter + 0.3);
  const load = (t0: number) => k(t, t0 - 0.1, t0 + 0.3) * (1 - dark);
  const lightsOn = Math.max(load(T.lights), hybridOn ? k(t, T.lightson - 0.1, T.lightson + 0.3) : 0);

  // flows
  const dcA = k(t, T.dc - 0.1, T.dc + 0.4) * (1 - night) * (sysOff ? 0 : 1);
  const invBrkA = k(t, T.acout - 0.2, T.acout + 0.3) * (sysOff ? 0 : 1) * (t >= T.without + 0.2 && t < T.blackout ? 0 : 1) * (t > T.blackout && !hybridOn ? 0 : 1);
  const loadsA = (t0: number) => Math.min(invBrkA + (t >= T.cant && t < T.morepanels ? 0 : 0) + (t >= T.pull - 0.4 && t < T.blackout ? 1 : 0), 1) * k(t, t0 - 0.1, t0 + 0.3);
  const importA = Math.max(win(t, T.grid1 - 0.2, T.runsun + 0.8), win(t, T.pull - 0.4, T.blackout, 0.3));
  const exportA = win(t, T.out - 0.3, T.night - 0.2);
  const batFlow = (t >= T.stores && t < T.without) || (hybridOn && t >= T.batteries);

  // HUD values
  const solarV = (sunUp && !sysOff ? 1 : 0) * Math.max(0.6 * k(t, T.panels, T.adds + 0.5), 0.95 * moreP) * (1 - night) * (gridDown && !hybridOn ? 0 : 1) * (hybridOn ? 0.7 : 1);
  const homeV = gridDown && !hybridOn ? 0 : hybridOn ? 0.15 * k(t, T.lightson - 0.1, T.lightson + 0.3) :
    night > 0.5 ? 0.45 : Math.min(1, 0.1 * load(T.lights) + 0.15 * load(T.fridge) + 0.3 * load(T.aircon) + 0.3 * ac2 - (t >= T.noon && t < T.night ? 0.25 : 0));
  const gridNote = gridDown ? 'DOWN' : exportA > 0.5 ? 'SENDING →' : importA > 0.5 ? '← SUPPLYING' : '';
  const gridV = gridDown ? 0 : exportA > 0.5 ? 0.4 : importA > 0.5 ? (night > 0.5 ? 0.45 : 0.25) : 0;
  const hudA = k(t, T.panels, T.panels + 0.5);

  // ── sky ──
  const skyTop = mix('#5DB7EE', '#081A36', night), skyBot = mix('#DFF3FF', '#22355E', night);
  const groundC = mix('#9BD07A', '#2C4A3A', night), groundD = mix('#7FB861', '#22392D', night);
  const par = (f: number) => `translate(${-(c.x - WIDE[0]) * f},${-(c.y - WIDE[1]) * f})`;
  const sunP = night < 1 ? [860 - 120 * k(t, T.noon - 1, T.noon + 1), interpolate(t, [0, T.noon, T.night], [330, 250, 520], CL)] : [0, 0];

  // inverter geometry (scales up for the "bigger inverter")
  const IV = {x0: 8.0, x1: 9.2, z0: 2.55, z1: 4.45};
  const ivCx = 8.6, ivCz = 3.5, sc = invScale;
  const ivA: V3 = [ivCx - (ivCx - IV.x0) * sc, 0.0, ivCz - (ivCz - IV.z0) * sc], ivB: V3 = [ivCx + (IV.x1 - ivCx) * sc, 0.38 * sc, ivCz + (IV.z1 - ivCz) * sc];

  const roofA = 1 - 0.7 * Math.max(win(t, T.breaker - 0.6, T.runsun - 0.3, 0.5), 0.7 * k(t, T.lightson - 0.6, T.lightson + 0.2));
  const panelFill = (col: number) => mix('#1B2F5E', '#2E5CC9', panelsLit * (0.8 + 0.2 * Math.sin(t * 2 + col)));

  return (
    <AbsoluteFill style={{background: skyTop}}>
      <Audio src={staticFile('solar/voz.wav')} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyBot} /></linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="sunG"><stop offset="0" stopColor="#FFF6C8" /><stop offset="0.5" stopColor="#FFD24A" /><stop offset="1" stopColor="rgba(255,210,74,0)" /></radialGradient>
          <linearGradient id="hud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(14,20,36,0.0)" /><stop offset="0.25" stopColor="rgba(14,20,36,0.86)" /><stop offset="1" stopColor="rgba(14,20,36,0.92)" /></linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#sky)" />
        {/* stars */}
        {night > 0 ? Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 263) % 1080} cy={60 + ((i * 137) % 700)} r={1.5 + (i % 3)} fill="#fff" opacity={night * (0.5 + 0.5 * Math.sin(t * 2 + i))} />) : null}
        {/* sun / moon */}
        {night < 1 ? <g opacity={1 - night}><circle cx={sunP[0]} cy={sunP[1]} r={130} fill="url(#sunG)" /><circle cx={sunP[0]} cy={sunP[1]} r={52} fill="#FFE27A" stroke="#FFC233" strokeWidth={6} /></g> : null}
        {night > 0 ? <g opacity={night}><circle cx={840} cy={300} r={48} fill="#F2F0E6" /><circle cx={862} cy={286} r={44} fill={skyTop} /></g> : null}
        {/* far hills (parallax) */}
        <g transform={par(0.25)}>
          <path d="M -200 1120 Q 150 980 420 1090 T 980 1060 T 1400 1100 L 1400 1500 L -200 1500 Z" fill={mix('#8CC7A0', '#1D3B44', night)} />
        </g>
        <g transform={par(0.5)}>
          <path d="M -200 1190 Q 260 1080 560 1170 T 1300 1150 L 1300 1600 L -200 1600 Z" fill={mix('#A8D98C', '#244638', night)} />
        </g>

        {/* ── WORLD ── */}
        <g transform={`translate(540,${CY}) scale(${c.z}) translate(${-c.x},${-c.y})`}>
          {/* ground */}
          <polygon points={pts([[-8, -6, 0], [20, -6, 0], [20, 16, 0], [-8, 16, 0]])} fill={groundC} />
          <polygon points={pts([[-0.6, -0.6, 0], [10.6, -0.6, 0], [10.6, 8.6, 0], [-0.6, 8.6, 0]])} fill={groundD} />
          {/* path to door */}
          <polygon points={pts([[3.5, 8.6, 0], [5, 8.6, 0], [5, 14, 0], [3.5, 14, 0]])} fill={mix('#E8DCC4', '#4A4A44', night)} />
          {/* grid pole + line to the street */}
          <g opacity={1}>
            <polygon points={pts([[12.7, -0.1, 0], [12.9, -0.1, 0], [12.9, -0.1, 8], [12.7, -0.1, 8]])} fill="#8A6A4A" stroke={INK} strokeWidth={1.5} />
            <path d={path3([[12.1, 0, 7.6], [13.5, 0, 7.6]])} stroke={INK} strokeWidth={6} />
            <path d={path3([[12.8, 0, 7.4], [12.8, 6, 7.8], [12.8, 14, 7.4]])} stroke={gridDown ? '#555' : INK} strokeWidth={3} fill="none" />
            {gridDown ? <g>{[[12.8, 3, 7.6]].map((v, i) => { const q = P(...(v as V3)); return <g key={i} transform={`translate(${q[0]},${q[1]})`}><circle r={26} fill={BAD} stroke="#fff" strokeWidth={4} /><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>; })}</g> : null}
          </g>
          {/* floor + back walls */}
          <polygon points={pts([[0, 0, 0], [10, 0, 0], [10, 8, 0], [0, 8, 0]])} fill={mix('#E9D8BC', '#5A5040', night * 0.6 + dark * 0.4)} stroke={INK} strokeWidth={2} />
          {Array.from({length: 9}, (_, i) => <path key={i} d={path3([[i + 1, 0, 0], [i + 1, 8, 0]])} stroke="rgba(30,36,51,0.12)" strokeWidth={2} />)}
          <polygon points={pts([[0, 0, 0], [0, 8, 0], [0, 8, 6], [0, 0, 6]])} fill={mix('#F4E9D6', '#3E3A44', Math.max(night * 0.55, dark * 0.75))} stroke={INK} strokeWidth={2} />
          <polygon points={pts([[0, 0, 0], [10, 0, 0], [10, 0, 6], [0, 0, 6]])} fill={mix('#FBF3E4', '#46424C', Math.max(night * 0.55, dark * 0.75))} stroke={INK} strokeWidth={2} />
          {/* wall caps (thickness) */}
          <polygon points={pts([[-0.3, -0.3, 6], [10, -0.3, 6], [10, 0, 6], [0, 0, 6], [0, 8, 6], [-0.3, 8, 6]])} fill="#D9C7A8" stroke={INK} strokeWidth={2} />
          {/* window on the left wall */}
          <polygon points={pts([[0.02, 1.0, 2.6], [0.02, 2.4, 2.6], [0.02, 2.4, 4.0], [0.02, 1.0, 4.0]])} fill={mix('#BFE6FF', '#1B2A4C', night)} stroke={INK} strokeWidth={2} />
          {/* cutaway stubs of the front walls */}
          <polygon points={pts([[10, 0, 0], [10.3, 0, 0], [10.3, 8, 0], [10, 8, 0]])} fill="#D9C7A8" />
          <Box a={[10, -0.3, 0]} b={[10.3, 8.3, 0.7]} top="#D9C7A8" sx="#C7B392" sy="#BBA684" />
          <Box a={[-0.3, 8, 0]} b={[10, 8.3, 0.7]} top="#D9C7A8" sx="#C7B392" sy="#BBA684" />

          {/* breaker panel */}
          <Box a={[6.0, 0.0, 2.4]} b={[6.9, 0.22, 3.85]} top="#C9CED8" sx="#AEB4C2" sy="#E2E6EE" />
          {[0, 1, 2].map((i) => <path key={i} d={path3([[6.15, 0.23, 3.5 - i * 0.35], [6.75, 0.23, 3.5 - i * 0.35]])} stroke={INK} strokeWidth={3} />)}
          {/* inverter */}
          <Box a={ivA} b={ivB} top="#E9EEF4" sx="#C6CFDA" sy={sysOff ? '#F6D6D2' : '#F7FAFC'} />
          {(() => { const q = P(ivCx, ivB[1] + 0.01, ivCz + 0.35 * sc); return (
            <g transform={`translate(${q[0]},${q[1]}) scale(${sc})`}>
              <rect x={-20} y={-12} width={40} height={22} rx={4} fill="#0E1B2A" />
              <path d={`M -15 0 ${Array.from({length: 13}, (_, i) => `L ${-15 + i * 2.5} ${-7 * Math.sin(i / 12 * Math.PI * 3 - t * 6)}`).join(' ')}`} stroke={sysOff ? BAD : AC} strokeWidth={2.5} fill="none" />
              <circle cx={-6} cy={22} r={4} fill={sysOff ? BAD : '#46E08A'} />
            </g>); })()}
          {/* fridge */}
          <Box a={[0.05, 1.0, 0]} b={[1.4, 2.6, 3.2]} top="#EEF2F6" sx="#D4DCE5" sy="#F8FAFC" />
          <path d={path3([[0.4, 2.61, 2.2], [1.3, 2.61, 2.2]])} stroke={INK} strokeWidth={2} />
          <path d={path3([[1.2, 2.61, 2.4], [1.2, 2.61, 2.9]])} stroke={INK} strokeWidth={4} />
          {/* air conditioner 1 (left wall) */}
          <Box a={[0.05, 3.3, 4.4]} b={[0.55, 5.1, 5.05]} top="#FFFFFF" sx="#F2F4F8" sy="#E6EAF0" />
          <path d={path3([[0.56, 3.5, 4.55], [0.56, 4.9, 4.55]])} stroke="#8A93A6" strokeWidth={3} />
          {load(T.aircon) > 0 ? [0, 1, 2].map((i) => { const q = P(0.9, 4.2, 4.3 - ((t * 0.8 + i / 3) % 1) * 1.2); return <path key={i} d={`M ${q[0] - 14} ${q[1]} q 7 -6 14 0 t 14 0`} stroke="#8FD3FF" strokeWidth={3} fill="none" opacity={load(T.aircon) * 0.8} />; }) : null}
          {/* air conditioner 2 (back wall) */}
          {ac2 > 0 ? <g transform={`translate(${P(2.3, 0, 4.7)[0]},${P(2.3, 0, 4.7)[1]}) scale(${ac2}) translate(${-P(2.3, 0, 4.7)[0]},${-P(2.3, 0, 4.7)[1]})`}>
            <Box a={[1.4, 0.0, 4.4]} b={[3.2, 0.5, 5.05]} top="#FFFFFF" sx="#F2F4F8" sy="#E6EAF0" />
            {[0, 1, 2].map((i) => { const q = P(2.3, 0.9, 4.3 - ((t * 0.8 + i / 3) % 1) * 1.2); return <path key={i} d={`M ${q[0] - 14} ${q[1]} q 7 -6 14 0 t 14 0`} stroke="#8FD3FF" strokeWidth={3} fill="none" opacity={0.8 * (1 - dark)} />; })}
          </g> : null}
          {/* lamps */}
          {[[4.2, 0.05, 5.0], [0.05, 6.8, 5.0]].map((v, i) => { const q = P(...(v as V3)); return (
            <g key={i}>
              <circle cx={q[0]} cy={q[1] + 24} r={60} fill="#FFE9A8" opacity={0.35 * lightsOn} />
              <path d={`M ${q[0] - 16} ${q[1]} L ${q[0] + 16} ${q[1]} L ${q[0] + 24} ${q[1] + 22} L ${q[0] - 24} ${q[1] + 22} Z`} fill="#6B7280" stroke={INK} strokeWidth={2} />
              <circle cx={q[0]} cy={q[1] + 26} r={8} fill={lightsOn > 0.5 ? '#FFE27A' : '#9AA3B2'} />
            </g>); })}
          {/* battery bank */}
          {batA > 0 ? <g opacity={batGhost ? 0.25 : batA} strokeDasharray={batGhost ? '8 6' : undefined}>
            <Box a={[7.7, 0.35, 0]} b={[9.6, 1.4, 1.6]} top="#3A4152" sx="#2A3040" sy="#323A4C" />
            {[0, 1, 2].map((i) => <polygon key={i} points={pts([[8.0 + i * 0.5, 1.41, 0.3], [8.35 + i * 0.5, 1.41, 0.3], [8.35 + i * 0.5, 1.41, 0.3 + 1.0 * (t < T.without ? k(t, T.stores - 0.5, T.stores + 1.0) : 1)], [8.0 + i * 0.5, 1.41, 0.3 + 1.0 * (t < T.without ? k(t, T.stores - 0.5, T.stores + 1.0) : 1)]])} fill="#46E08A" />)}
          </g> : null}
          {/* meter (outside, by the wall) */}
          {meterA > 0 ? <g opacity={meterA}>
            <Box a={[10.35, -0.2, 2.7]} b={[11.2, 0.2, 3.5]} top="#E9EEF4" sx="#C6CFDA" sy="#F7FAFC" />
            {(() => { const q = P(10.8, 0.21, 3.1); return <g transform={`translate(${q[0]},${q[1]})`}><circle r={14} fill="#fff" stroke={INK} strokeWidth={2} /><line x1={0} y1={0} x2={11 * Math.cos(t * 4)} y2={11 * Math.sin(t * 4)} stroke={BAD} strokeWidth={3} /></g>; })()}
          </g> : null}

          {/* lifted roof with panels */}
          <g opacity={roofA}>
          {[[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v], i) => <path key={i} d={path3([roofPt(u, v, 0), [u ? 10 : 0, v ? 8 : 0, 6]])} stroke="rgba(30,36,51,0.35)" strokeWidth={2} strokeDasharray="6 8" />)}
          <polygon points={pts([roofPt(0, 1, -0.35), roofPt(1, 1, -0.35), roofPt(1, 1, 0), roofPt(0, 1, 0)])} fill="#8E4B3A" stroke={INK} strokeWidth={2} />
          <polygon points={pts([roofPt(1, 0, -0.35), roofPt(1, 1, -0.35), roofPt(1, 1, 0), roofPt(1, 0, 0)])} fill="#A3584A" stroke={INK} strokeWidth={2} />
          <polygon points={pts([roofPt(0, 0), roofPt(1, 0), roofPt(1, 1), roofPt(0, 1)])} fill={mix('#C8705A', '#5A3430', night)} stroke={INK} strokeWidth={2} />
          {Array.from({length: 6}, (_, col) => [0, 1].map((row) => {
            const extra = col >= 4, a = extra ? moreP : 1;
            if (a <= 0) return null;
            const q = PANEL(col, row);
            return (
              <g key={`${col}-${row}`} opacity={a} transform={extra ? `translate(0,${(1 - a) * -60})` : undefined}>
                <polygon points={pts(q)} fill={panelFill(col)} stroke="#D7E3F6" strokeWidth={2.5} />
                {[1, 2].map((j) => <path key={j} d={path3([[lerp(q[0][0], q[1][0], j / 3), lerp(q[0][1], q[1][1], j / 3), lerp(q[0][2], q[1][2], j / 3)], [lerp(q[3][0], q[2][0], j / 3), lerp(q[3][1], q[2][1], j / 3), lerp(q[3][2], q[2][2], j / 3)]])} stroke="rgba(215,227,246,0.55)" strokeWidth={1.5} />)}
              </g>);
          }))}
          {/* string wire on the roof joining the panels into the single cable */}
          {(() => { const wired = k(t, T.wired - 0.1, T.adds + 0.4); if (wired <= 0) return null; const a: V3[] = [roofPt(0.06, 0.92, 0.14), roofPt(0.94, 0.92, 0.14), [9.9, 0.25, 10.15]]; return <path d={path3(a)} stroke={DC} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - wired} />; })()}
          </g>
          {/* sunlight rays on panels */}
          {sunUp && t >= T.sun - 0.2 && t < T.dc + 1.5 ? [0, 1, 2, 3].map((i) => { const q = P(...PANEL(i, 0)[0]); const u = ((t * 1.2 + i * 0.25) % 1); return <line key={i} x1={q[0] + 220 - u * 200} y1={q[1] - 320 + u * 290} x2={q[0] + 200 - u * 200} y2={q[1] - 300 + u * 290} stroke="#FFD24A" strokeWidth={6} strokeLinecap="round" opacity={0.85 * (1 - u)} />; }) : null}

          {/* ── wires ── */}
          {[PL.dc].map((pl, i) => <path key={i} d={dOf(pl)} stroke={DC} strokeWidth={5} fill="none" opacity={k(t, T.cable - 0.4, T.cable + 0.2) * 0.9 + 0.1} />)}
          {[PL.ib, PL.li, PL.fr, PL.a1, PL.gr].map((pl, i) => <path key={i} d={dOf(pl)} stroke={dark > 0.5 ? '#555' : AC} strokeWidth={4} fill="none" opacity={0.85} />)}
          {ac2 > 0 ? <path d={dOf(PL.a2)} stroke={AC} strokeWidth={4} fill="none" opacity={ac2} /> : null}
          <path d={dOf(PL.po)} stroke={gridDown ? '#555' : GRIDC} strokeWidth={4} fill="none" />
          {batA > 0 && !batGhost ? <path d={dOf(PL.ba)} stroke={DC} strokeWidth={4} fill="none" opacity={batA} /> : null}

          {/* ── energy ── */}
          <OneWay pl={PL.dc} t={t} a={dcA} col={DC} />
          <Osc pl={PL.ib} t={t} a={Math.max(invBrkA, batFlow ? 1 : 0)} col={AC} />
          <Osc pl={PL.li} t={t} a={loadsA(T.lights) * (1 - dark) + (hybridOn ? k(t, T.lightson - 0.1, T.lightson + 0.3) : 0)} col={AC} />
          <Osc pl={PL.fr} t={t} a={loadsA(T.fridge) * (1 - dark)} col={AC} />
          <Osc pl={PL.a1} t={t} a={loadsA(T.aircon) * (1 - dark)} col={AC} />
          <Osc pl={PL.a2} t={t} a={ac2 * (1 - dark) * (t > T.second + 0.3 ? 1 : 0)} col={AC} />
          <Osc pl={PL.gr} t={t} a={Math.max(importA, exportA)} col={AC} />
          <Osc pl={PL.po} t={t} a={Math.max(importA, exportA) * (gridDown ? 0 : 1)} col={AC} />
          {batFlow ? <OneWay pl={PL.ba} t={t} a={1} col={DC} /> : null}
          {/* direction chevrons on the grid wire (import / export) */}
          {[importA, exportA].map((a, j) => a > 0 ? [0.3, 0.6].map((f) => { const q = ptAt(PL.gr, PL.gr.tot * f); return <path key={`${j}${f}`} transform={`translate(${q[0]},${q[1]}) rotate(${j === 0 ? 207 : 27})`} d="M -9 -11 L 7 0 L -9 11" stroke={AC} strokeWidth={5} fill="none" strokeLinecap="round" opacity={a} />; }) : null)}
          {/* the inverter's "limit": a throttle ring */}
          {(() => { const a = win(t, T.limits - 0.2, T.once + 0.8); if (a <= 0) return null; const q = P(ivCx, 0.4, ivCz); return (
            <g opacity={a} transform={`translate(${q[0]},${q[1]})`}>
              <circle r={70 * sc} fill="none" stroke={ACCENT} strokeWidth={5} strokeDasharray="10 10" transform={`rotate(${t * 40})`} />
            </g>); })()}
          {/* line worker on the pole */}
          {(() => { const a = k(t, T.workers - 0.3, T.workers + 0.2); if (a <= 0) return null; const q = P(12.8, 0, 5.2); return (
            <g opacity={a} transform={`translate(${q[0] + 26},${q[1]})`}>
              <circle cx={0} cy={-34} r={13} fill="#F2C49B" stroke={INK} strokeWidth={2} />
              <path d="M -16 -42 Q 0 -60 16 -42 Z" fill="#FFC233" stroke={INK} strokeWidth={2} />
              <rect x={-12} y={-20} width={24} height={34} rx={6} fill="#FF7A1A" stroke={INK} strokeWidth={2} />
              <path d="M -8 14 L -10 40 M 8 14 L 10 40" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            </g>); })()}
        </g>

        {/* blackout tint */}
        <rect width={1080} height={1920} fill="#000" opacity={0.25 * dark} />

        {/* ── callouts (screen space, readable size) ── */}
        <Callout c={c} anchor={P(...PANEL(1, 0)[0])} dx={-40} dy={-170} text="Solar panels" a={win(t, T.panels - 0.1, T.house)} />
        <Callout c={c} anchor={ptAt(PL.dc, PL.dc.tot * 0.25)} dx={-60} dy={190} text="Direct current (DC)" a={win(t, T.dc - 0.05, T.inv - 0.3)} col={DC} />
        <Callout c={c} anchor={ptAt(PL.dc, PL.dc.tot * 0.55)} dx={-140} dy={-120} text="One cable" a={win(t, T.cable - 0.2, T.house + 0.6)} />
        <Callout c={c} anchor={P(ivCx, 0.3, ivCz + 0.6 * sc)} dx={-180} dy={-150} text={hybridOn ? 'Hybrid inverter' : sysOff ? 'Inverter: OFF' : 'Inverter'} a={Math.max(win(t, INV_LABEL - 0.05, T.breaker - 0.3), win(t, T.bigger - 0.2, T.noon), win(t, T.shuts - 0.1, 99))} col={sysOff ? BAD : ACCENT} fg="#FFFFFF" />
        <Callout c={c} anchor={P(ivCx, 0.3, ivCz - 0.4)} dx={-170} dy={170} text="Direct → Alternating" a={win(t, T.converts - 0.1, T.from - 0.1)} col="#FFFFFF" />
        <Callout c={c} anchor={ptAt(PL.ib, PL.ib.tot * 0.5)} dx={-120} dy={230} text="Alternating current (AC)" a={win(t, T.acout - 0.1, T.breaker - 0.3)} col={AC} fg="#FFFFFF" />
        <Callout c={c} anchor={P(6.45, 0.2, 3.9)} dx={60} dy={-170} text="Breaker panel" a={win(t, T.breaker - 0.1, T.plug)} />
        <Callout c={c} anchor={P(4.2, 0.05, 5.0)} dx={60} dy={-250} text="Lights" a={win(t, T.lights - 0.1, T.plug)} />
        <Callout c={c} anchor={P(0.7, 1.8, 3.2)} dx={-10} dy={-150} text="Fridge" a={win(t, T.fridge - 0.1, T.plug)} />
        <Callout c={c} anchor={P(0.3, 4.2, 5.05)} dx={40} dy={-200} text="Air conditioner" a={win(t, T.aircon - 0.1, T.plug + 0.6)} />
        <Callout c={c} anchor={P(2.3, 0.2, 5.05)} dx={80} dy={-190} text="2nd air conditioner" a={win(t, T.second - 0.1, T.runsun)} col={ACCENT} fg="#FFFFFF" />
        <Callout c={c} anchor={ptAt(PL.po, PL.po.tot * 0.2)} dx={-60} dy={200} text="Grid fills the gap" a={win(t, T.grid1 - 0.1, T.runsun + 0.6)} col={GRIDC} fg="#FFFFFF" />
        <Callout c={c} anchor={P(...PANEL(5, 0)[1])} dx={-60} dy={-160} text="+ More panels" a={win(t, T.morepanels - 0.1, T.bigger)} col={ACCENT} fg="#FFFFFF" />
        <Callout c={c} anchor={P(ivCx, 0.3, ivCz - 0.9 * sc)} dx={-150} dy={210} text="Limit: power at once" a={win(t, T.limits - 0.1, T.noon)} />
        <Callout c={c} anchor={ptAt(PL.gr, PL.gr.tot * 0.6)} dx={-80} dy={210} text="Extra → grid" a={win(t, T.extra - 0.1, T.night - 0.2)} col={AC} fg="#FFFFFF" />
        <Callout c={c} anchor={P(10.8, 0.2, 3.5)} dx={30} dy={-200} text="Two-way meter" a={win(t, T.meter - 0.1, T.night - 0.2)} />
        <Callout c={c} anchor={P(...PANEL(2, 1)[2])} dx={-60} dy={-170} text="Panels: off at night" a={win(t, T.stop - 0.2, T.keep + 0.6)} col="#2A3550" fg="#FFFFFF" />
        <Callout c={c} anchor={P(8.6, 0.9, 1.6)} dx={-170} dy={190} text="Battery bank" a={win(t, T.battery - 0.1, T.without + 0.2)} col={DC} />
        <Callout c={c} anchor={ptAt(PL.gr, PL.gr.tot * 0.7)} dx={-120} dy={-220} text="No battery: from the grid" a={win(t, T.without - 0.1, T.blackout - 0.1)} col={GRIDC} fg="#FFFFFF" />
        <Callout c={c} anchor={P(12.8, 3, 7.6)} dx={20} dy={-250} text="Blackout" a={win(t, T.blackout - 0.1, T.only)} /* moved */ col={BAD} fg="#FFFFFF" />
        <Callout c={c} anchor={P(12.8, 0, 5.0)} dx={-170} dy={180} text="Workers stay safe" a={win(t, T.workers - 0.1, T.only)} />
        <Callout c={c} anchor={P(8.6, 0.9, 1.6)} dx={-160} dy={190} text="Batteries power the house" a={win(t, T.batteries - 0.1, 99)} col={DC} />

        {/* ── HUD: who supplies whom ── */}
        {hudA > 0 ? <g opacity={hudA}>
          <rect x={0} y={1400} width={1080} height={340} fill="url(#hud)" />
          <Bar y={1450} label="SOLAR" v={solarV} col={DC} note={sysOff ? 'OFF' : night > 0.5 ? 'NIGHT' : ''} />
          <Bar y={1510} label="HOME" v={homeV} col={ACCENT} note={dark > 0.5 && !hybridOn ? 'DARK' : ''} />
          <Bar y={1570} label="GRID" v={gridV} col={gridDown ? BAD : AC} note={gridNote} />
          <Bar y={1630} label="BATTERY" v={batFlow ? 0.45 : batA > 0 && !batGhost ? 0.9 : 0} col="#46E08A" a={k(t, T.battery - 0.2, T.battery + 0.3)} note={batGhost ? 'NONE' : batFlow ? 'SUPPLYING' : ''} />
        </g> : null}

        {/* title card on the hook */}
        {(() => { const a = win(t, 0, T.sun - 0.3, 0.3); if (a <= 0) return null; return (
          <g opacity={a} transform={`translate(540,1530) scale(${0.9 + 0.1 * a})`}>
            <rect x={-410} y={-70} width={820} height={140} rx={36} fill={INK} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#FFFFFF">Where does the power go?</text>
          </g>); })()}
        {/* closing card */}
        {(() => { const a = k(t, T.send - 0.2, T.send + 0.3); if (a <= 0) return null; return (
          <g opacity={a} transform={`translate(540,1300) scale(${pop(frame, fps, T.send - 0.2, 12) * 0.2 + 0.8})`}>
            <rect x={-400} y={-80} width={800} height={160} rx={40} fill={ACCENT} stroke={INK} strokeWidth={4} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#FFFFFF">Send this to a friend ↗</text>
          </g>); })()}
      </svg>

      {/* captions */}
      <CaptionsBox t={t} />
    </AbsoluteFill>
  );
};

// captions: phrase by phrase on a dark rounded box, top third, words pop in on their own start time
const CaptionsBox: React.FC<{t: number}> = ({t}) => {
  let p = null as null | {words: Word[]; s: number; end: number};
  for (const x of PH) if (t >= x.s - 0.12) p = x;
  if (!p || t > p.end + 0.8) return null;
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, '');
  return (
    <div style={{position: 'absolute', left: 80, right: 140, top: 190, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'inline-block', textAlign: 'center', padding: '20px 32px 26px', borderRadius: 32, background: 'rgba(14,20,36,0.82)',
        fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.14, color: '#FFFFFF'}}>
        {p.words.map((w, i) => {
          const a = k(t, w.s - 0.12, w.s + 0.05), em = EMPH.has(clean(w.w));
          return <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: 0.25 + 0.75 * a, transform: `translateY(${(1 - a) * 10}px)`, color: em ? ACCENT : undefined}}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};


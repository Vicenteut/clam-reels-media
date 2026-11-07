// The blueprint built the Remotion way: SVG elements in a camera <g>, strokes drawn with evolvePath, motion with
// interpolate/spring/Easing, HTML for the label and captions, <Audio> for the fixed voice.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {AC, AC_JOIN, AC_LAMP, AC_MAIN, CABLE, CABLE_JOIN, DC, DCIN, ACOUT, DIM, INK, INV, KEYS, LABEL, STROKES, TM, d, Pt} from './geometry';
import {Captions} from './Captions';

const W = 1080, H = 1920;
const clamp01 = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LEN = new Map<string, number>();
const len = (p: string) => { let v = LEN.get(p); if (v == null) { v = getLength(p); LEN.set(p, v); } return v; };

function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const list: [string, string, FontFaceDescriptors][] = [
      ['Space Grotesk', 'fonts/SpaceGrotesk-500-normal.woff2', {weight: '500'}],
      ['Space Grotesk', 'fonts/SpaceGrotesk-700-normal.woff2', {weight: '700'}],
      ['Instrument Serif', 'fonts/InstrumentSerif-400-italic.woff2', {style: 'italic'}],
      ['JetBrains Mono', 'fonts/JetBrainsMono-700-normal.woff2', {weight: '700'}],
    ];
    Promise.all(list.map(([fam, src, desc]) => new FontFace(fam, `url(${staticFile(src)})`, desc).load().then((f) => (document.fonts as any).add(f))))
      .then(() => continueRender(handle));
  }, [handle]);
}

function camera(t: number) {
  let i = 0;
  while (i + 1 < KEYS.length && t >= KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const u = interpolate(t, [a[0], b[0]], [0, 1], {...clamp01, easing: Easing.inOut(Easing.cubic)});
  return {x: a[1] + (b[1] - a[1]) * u, y: a[2] + (b[2] - a[2]) * u, z: a[3] + (b[3] - a[3]) * u};
}

// a stroke that draws itself, with a glowing pen tip while it is moving
const Draw: React.FC<{s: (typeof STROKES)[number]; t: number; z: number; opacity?: number}> = ({s, t, z, opacity = 1}) => {
  const p = interpolate(t, [s.t0, s.t0 + s.dur], [0, 1], {...clamp01, easing: Easing.out(Easing.cubic)});
  if (p <= 0 || opacity <= 0) return null;
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, s.d);
  const tip = p < 1 ? getPointAtLength(s.d, len(s.d) * p) : null;
  return (
    <g opacity={opacity}>
      <path d={s.d} fill="none" stroke={s.col || INK} strokeWidth={s.w || 3} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} filter={s.glow ? 'url(#glowStrong)' : 'url(#glow)'} />
      {tip && <circle cx={tip.x} cy={tip.y} r={22 / z} fill="url(#tip)" />}
    </g>
  );
};

const Bead: React.FC<{x: number; y: number; col: 'dc' | 'ac'; r: number; a?: number}> = ({x, y, col, r, a = 1}) =>
  a > 0 ? <circle cx={x} cy={y} r={r * 2.4} fill={`url(#bead-${col})`} opacity={a} /> : null;

function along(pts: Pt[], dist: number) { const p = d(pts); return getPointAtLength(p, Math.max(0, Math.min(len(p), dist))); }

// world-space pill tag that springs in
const Tag: React.FC<{str: string; x: number; y: number; col: string; t0: number; frame: number; fps: number; size?: number}> = ({str, x, y, col, t0, frame, fps, size = 44}) => {
  if (frame < t0 * fps) return null;
  const s = spring({frame: frame - Math.round(t0 * fps), fps, config: {damping: 9, stiffness: 180}});
  const w = str.length * size * 0.68 + 34, h = size * 1.35;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={col} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={size} letterSpacing={2} fill="#0B2A55">{str}</text>
    </g>
  );
};

function sinePath(x0: number, y0: number, n: number, dx: number, amp: number, cycles: number, phase: number) {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x0 + i * dx, y0 - amp * Math.sin((i / n) * Math.PI * 2 * cycles - phase)]);
  return d(pts);
}

export const Plano: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const c = camera(t);
  const fadeIn = (t0: number, dur = 0.3) => interpolate(t, [t0, t0 + dur], [0, 1], clamp01);

  // energy
  const joined = t >= TM.flips + 0.22;
  const dcPts = joined ? [...CABLE, DCIN, [DCIN[0], INV.y + 60] as Pt] : CABLE, dcLen = len(d(dcPts));
  const dcBeads: React.ReactNode[] = [];
  if (t >= TM.dc + 0.7) {
    const a0 = fadeIn(TM.dc + 0.7, 0.4);
    for (let s = ((t - TM.dc) * 190) % 70; s < dcLen; s += 70) {
      const q = along(dcPts, s), fade = joined ? Math.min(1, (dcLen - s) / 30) : Math.min(1, (dcLen - s) / 120);
      dcBeads.push(<Bead key={s} x={q.x} y={q.y} col="dc" r={7} a={a0 * fade} />);
    }
  }
  const acBeads: React.ReactNode[] = [];
  if (t >= TM.ac + 0.5) {
    const a0 = fadeIn(TM.ac + 0.5, 0.4), amp = interpolate(t, [TM.bf, TM.bf + 0.4], [12, 24], clamp01), off = amp * Math.sin(t * Math.PI * 2 * 1.3);
    for (const P of [AC_MAIN, AC_LAMP]) {
      const L = len(d(P));
      for (let s = 30; s < L - 20; s += 62) { const q = along(P, s + off); acBeads.push(<Bead key={`${P[0]}-${s}`} x={q.x} y={q.y} col="ac" r={6.5} a={a0} />); }
    }
    if (t > TM.flips + 0.4) { const q = along(AC_JOIN, 12.5 + off * 0.4); acBeads.push(<Bead key="j" x={q.x} y={q.y} col="ac" r={6.5} a={fadeIn(TM.flips + 0.4)} />); }
  }
  // "one way" chevrons
  const chevA = t >= TM.oneWay && t < TM.house ? fadeIn(TM.oneWay, 0.25) * (1 - fadeIn(TM.house - 0.4, 0.4)) : 0;
  const cabD = d(CABLE), cabL = len(cabD);
  // inverter materialize
  const m = interpolate(t, [TM.mat - 0.08, TM.mat + 0.37], [0, 1], {...clamp01, easing: Easing.out(Easing.cubic)});
  const front = INV.y + INV.h * m;
  const fl = t - TM.mat;
  const invFade = (kind?: string) => (kind ? 1 - (kind === 'inner' ? 1 : 0.55) * fadeIn(TM.mat - 0.08, 0.3) : 1);
  const labelS = frame >= Math.round(TM.mat * fps) ? spring({frame: frame - Math.round(TM.mat * fps), fps, config: {damping: 9, stiffness: 160}}) : 0;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#123E7A, #0B2A55)'}}>
      <Audio src={staticFile('voz.wav')} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <pattern id="gMinor" width={30} height={30} patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(230,246,255,0.09)" strokeWidth={1} /></pattern>
          <pattern id="gMajor" width={150} height={150} patternUnits="userSpaceOnUse"><path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(230,246,255,0.16)" strokeWidth={2} /></pattern>
          <filter id="glow" filterUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
            <feGaussianBlur stdDeviation={3} result="b" /><feFlood floodColor="rgb(170,225,255)" floodOpacity={0.75} /><feComposite in2="b" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowStrong" filterUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
            <feGaussianBlur stdDeviation={6} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="tip"><stop offset="0" stopColor="#fff" /><stop offset="0.25" stopColor="rgb(200,240,255)" stopOpacity={0.8} /><stop offset="1" stopColor="rgb(160,220,255)" stopOpacity={0} /></radialGradient>
          <radialGradient id="bead-dc"><stop offset="0" stopColor="rgb(255,255,240)" /><stop offset="0.3" stopColor={`rgb(${DC})`} stopOpacity={0.85} /><stop offset="1" stopColor={`rgb(${DC})`} stopOpacity={0} /></radialGradient>
          <radialGradient id="bead-ac"><stop offset="0" stopColor="rgb(255,255,240)" /><stop offset="0.3" stopColor={`rgb(${AC})`} stopOpacity={0.85} /><stop offset="1" stopColor={`rgb(${AC})`} stopOpacity={0} /></radialGradient>
          <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7FAFC" /><stop offset="1" stopColor="#C9D4DE" /></linearGradient>
          <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(230,246,255)" stopOpacity={0} /><stop offset="1" stopColor="rgb(230,246,255)" stopOpacity={0.95} /></linearGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.4" stopColor="rgb(0,8,25)" stopOpacity={0} /><stop offset="1" stopColor="rgb(0,8,25)" stopOpacity={0.45} /></radialGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx={0} dy={10} stdDeviation={12} floodColor="#000" floodOpacity={0.45} /></filter>
          <clipPath id="invClip"><rect x={INV.x - 10} y={INV.y - 10} width={INV.w + 20} height={front - INV.y + 10 + 30 * m} /></clipPath>
        </defs>

        <g transform={`translate(${W / 2 - c.x * c.z} ${H / 2 - c.y * c.z}) scale(${c.z})`}>
          <g opacity={fadeIn(0)}>
            <rect x={-1500} y={-1000} width={4500} height={4500} fill="url(#gMinor)" />
            <rect x={-1500} y={-1000} width={4500} height={4500} fill="url(#gMajor)" />
          </g>

          {/* dashed placeholder where the missing piece goes */}
          {t >= TM.gap && t < TM.inv + 0.3 && (
            <rect x={INV.x} y={INV.y} width={INV.w} height={INV.h} rx={6} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="12 10"
              strokeDashoffset={-t * 30} opacity={(0.55 + 0.45 * Math.sin(t * 7)) * fadeIn(TM.gap) * (1 - fadeIn(TM.inv))} />
          )}

          {/* the inverter, materialized */}
          {m > 0 && (
            <g clipPath="url(#invClip)">
              <rect x={INV.x} y={INV.y} width={INV.w} height={INV.h} rx={12} fill="url(#body)" stroke="#8FA3B5" strokeWidth={2.5} filter="url(#shadow)" />
              <rect x={INV.x + 20} y={INV.y + 30} width={80} height={46} rx={6} fill="#0E1B2A" />
              <path d={sinePath(INV.x + 28, INV.y + 53, 30, 2.13, 11, 1.5, t * 5)} fill="none" stroke={`rgb(${AC})`} strokeWidth={3} />
              <circle cx={INV.x + 42} cy={INV.y + 100} r={6} fill="#46E08A" />
              <circle cx={INV.x + 62} cy={INV.y + 100} r={6} fill="#2F3B48" />
              <rect x={INV.x} y={INV.y + INV.h - 34} width={INV.w} height={12} fill="#FF7A1A" />
              <rect x={DCIN[0] - 9} y={INV.y - 8} width={18} height={12} rx={3} fill="#2F3B48" />
              <rect x={ACOUT[0] - 9} y={INV.y + INV.h - 4} width={18} height={12} rx={3} fill="#2F3B48" />
            </g>
          )}
          {m > 0 && m < 1 && <rect x={INV.x - 16} y={front - 14} width={INV.w + 32} height={20} fill="url(#scan)" />}
          {fl > 0 && fl < 0.7 && <circle cx={INV.x + INV.w / 2} cy={INV.y + INV.h / 2} r={60 + fl * 260} fill="none" stroke={INK} strokeWidth={4 / c.z} opacity={1 - fl / 0.7} />}

          {STROKES.map((s, k) => <Draw key={k} s={s} t={t} z={c.z} opacity={invFade(s.inv)} />)}

          {t > TM.dc + 0.9 && t < TM.flips + 0.2 && <circle cx={740} cy={1105} r={7} fill="none" stroke={`rgb(${DC})`} strokeWidth={3} />}
          {dcBeads}
          {chevA > 0 && [0, 1, 2].map((k) => {
            const s = cabL * (0.28 + k * 0.2) + ((t * 60) % 30), p = getPointAtLength(cabD, s), p2 = getPointAtLength(cabD, Math.min(cabL, s + 1));
            const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
            return <path key={k} d="M -10 -16 L 6 0 L -10 16" transform={`translate(${p.x} ${p.y}) rotate(${ang})`} fill="none" stroke={`rgb(${DC})`}
              strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={chevA * (0.6 + 0.4 * Math.sin(t * 8 - k))} />;
          })}
          {acBeads}
          {t >= TM.bf && t < TM.gap + 0.3 && (() => {
            const a = fadeIn(TM.bf, 0.25) * (1 - fadeIn(TM.gap, 0.3)), off = interpolate(t, [TM.bf, TM.bf + 0.4], [12, 24], clamp01) * Math.sin(t * Math.PI * 2 * 1.3), cx = 520 + off * 0.8;
            return <path d={`M ${cx - 60} 1462 L ${cx + 60} 1462 M ${cx - 46} 1450 L ${cx - 60} 1462 L ${cx - 46} 1474 M ${cx + 46} 1450 L ${cx + 60} 1462 L ${cx + 46} 1474`}
              fill="none" stroke={`rgb(${AC})`} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={a} />;
          })()}
          {t >= TM.acLab + 0.1 && (() => {
            const p = interpolate(t, [TM.acLab + 0.1, TM.acLab + 0.6], [0, 1], clamp01), n = Math.max(1, Math.floor(40 * p));
            return <path d={sinePath(515, 1340, n, 2.2, 14, 2 * (n / 40), t * 6)} fill="none" stroke={`rgb(${AC})`} strokeWidth={4} filter="url(#glowStrong)" />;
          })()}

          {t < TM.inv + 0.3 && (
            <g opacity={1 - fadeIn(TM.inv - 0.1, 0.3)}><Tag str="DC" x={800} y={1150} col={`rgb(${DC})`} t0={TM.dcLab} frame={frame} fps={fps} /></g>
          )}
          <Tag str="AC" x={470} y={1340} col={`rgb(${AC})`} t0={TM.acLab} frame={frame} fps={fps} />
          {t >= TM.flips && <text x={DCIN[0] - 12} y={DCIN[1] - 10} textAnchor="end" fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill={`rgb(${DC})`}>DC IN</text>}
          {t >= TM.flips + 0.15 && <text x={ACOUT[0] + 12} y={ACOUT[1] + 38} fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill={`rgb(${AC})`}>AC OUT</text>}
        </g>
        <rect x={0} y={0} width={W} height={H} fill="url(#vig)" />
      </svg>

      {labelS > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 640 - 58, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${labelS}) rotate(-2deg)`, background: INK, border: '6px solid #FF7A1A', borderRadius: 58, height: 104,
            padding: '0 40px', display: 'flex', alignItems: 'center', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: LABEL.length > 10 ? 58 : 72, letterSpacing: 3,
            color: '#0B2A55', boxShadow: '8px 10px 0 rgba(0,0,0,0.3)'}}>{LABEL}</div>
        </div>
      )}
      <Captions t={t} />
    </AbsoluteFill>
  );
};

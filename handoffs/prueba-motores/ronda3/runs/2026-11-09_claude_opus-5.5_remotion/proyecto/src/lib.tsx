// Shared bits for both round-2 reels: font loading, easing helpers, word lookup, captions, path helpers.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';

export type Word = {w: string; s: number; e: number};
export const W = 1080, H = 1920;
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 between a and b (eased), clamped
export const k = (t: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...CL, easing: ease});
// fade in at a, fade out at b (both with duration d)
export const win = (t: number, a: number, b: number, d = 0.35) => Math.min(k(t, a, a + d), 1 - k(t, b - d, b));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const pop = (frame: number, fps: number, t0: number, damping = 10) =>
  frame < t0 * fps ? 0 : spring({frame: frame - Math.round(t0 * fps), fps, config: {damping, stiffness: 170}});

const LEN = new Map<string, number>();
export const plen = (d: string) => { let v = LEN.get(d); if (v == null) { v = getLength(d); LEN.set(d, v); } return v; };
export const pat = (d: string, u: number) => getPointAtLength(d, Math.max(0, Math.min(1, u)) * plen(d));
export const poly = (pts: [number, number][]) => 'M' + pts.map((p) => p.join(' ')).join(' L ');

export function useFonts(list: [string, string, FontFaceDescriptors][]) {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(list.map(([fam, src, desc]) => new FontFace(fam, `url(${staticFile(src)})`, desc).load().then((f) => (document.fonts as any).add(f))))
      .then(() => continueRender(handle));
  }, [handle]);
}

// time of the n-th word index (start)
export const at = (words: Word[]) => (i: number) => (words[i] ? words[i].s : 0);

type Phrase = {words: Word[]; s: number; end: number};
export function phrases(words: Word[], max = 6): Phrase[] {
  const raw: Word[][] = []; let cur: Word[] = [];
  for (const w of words) { cur.push(w); if (/[.,;:?!]$/.test(w.w)) { raw.push(cur); cur = []; } }
  if (cur.length) raw.push(cur);
  const out: Word[][] = [];
  for (const p of raw) { if (p.length <= max) out.push(p); else { const n = Math.ceil(p.length / max), sz = Math.ceil(p.length / n); for (let i = 0; i < p.length; i += sz) out.push(p.slice(i, i + sz)); } }
  return out.map((ws) => ({words: ws, s: ws[0].s, end: ws[ws.length - 1].e}));
}

// phrase-by-phrase captions, words rise in on their own start time; emphasised words take the accent colour
export const Captions: React.FC<{t: number; ph: Phrase[]; emph: Set<string>; accent: string; font: string; weight?: number; size?: number;
  color?: string; top?: number; box?: string}> = ({t, ph, emph, accent, font, weight = 800, size = 78, color = '#FFFFFF', top = 230, box}) => {
  let p: Phrase | null = null;
  for (const x of ph) if (t >= x.s - 0.12) p = x;
  if (!p || t > p.end + 0.9) return null;
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  return (
    <div style={{position: 'absolute', left: 90, right: 150, top, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'inline-block', textAlign: 'center', padding: box ? '18px 30px 24px' : 0, borderRadius: 34, background: box,
        fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.12, color, textShadow: box ? 'none' : '0 4px 16px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.6)'}}>
        {p.words.map((w, i) => {
          const a = k(t, w.s - 0.12, w.s + 0.05);
          const em = emph.has(clean(w.w));
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: a, transform: `translateY(${(1 - a) * 16}px) scale(${em ? 1 + 0.08 * (1 - k(t, w.s, w.s + 0.35)) : 1})`,
              color: em ? accent : undefined}}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};

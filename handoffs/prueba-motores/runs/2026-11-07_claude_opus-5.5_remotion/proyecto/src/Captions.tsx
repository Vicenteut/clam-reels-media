// Word-by-word captions (top third), phrases split on punctuation, long phrases halved. Emphasis = serif italic.
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {WORDS} from './geometry';

const EMPH = new Set(['direct', 'alternating', 'inverter']);
const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '');

type Phrase = {words: typeof WORDS; s: number; end: number};
const PHRASES: Phrase[] = (() => {
  const raw: (typeof WORDS)[] = [];
  let cur: typeof WORDS = [];
  for (const w of WORDS) { cur.push(w); if (/[.,;:?!]$/.test(w.w)) { raw.push(cur); cur = []; } }
  if (cur.length) raw.push(cur);
  const out: (typeof WORDS)[] = [];
  for (const p of raw) {
    if (p.length <= 7) out.push(p);
    else { const h = Math.ceil(p.length / 2); out.push(p.slice(0, h), p.slice(h)); }
  }
  return out.map((words) => ({words, s: words[0].s, end: words[words.length - 1].e}));
})();

export const Captions: React.FC<{t: number}> = ({t}) => {
  let ph: Phrase | null = null;
  for (const p of PHRASES) if (t >= p.s - 0.15) ph = p;
  if (!ph) return null;
  return (
    <div style={{position: 'absolute', left: 130, top: 250, width: 820, fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 84,
      lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 4px 18px rgba(0,10,40,0.55)'}}>
      {ph.words.map((w, k) => {
        const dt = t - w.s + 0.15;
        if (dt < 0) return null;
        const a = interpolate(dt, [0, 0.12], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        const em = EMPH.has(clean(w.w));
        return (
          <span key={k} style={{display: 'inline-block', marginRight: 22, opacity: a, transform: `translateY(${(1 - a) * 18}px)`,
            fontFamily: em ? 'Instrument Serif' : 'Space Grotesk', fontStyle: em ? 'italic' : 'normal', fontWeight: em ? 400 : 500,
            fontSize: em ? 92 : 84}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

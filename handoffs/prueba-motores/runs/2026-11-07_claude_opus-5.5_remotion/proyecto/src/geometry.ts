// World geometry of the blueprint (px at zoom 1) and the timing of every event, from word indices of tiempos.json.
import tiempos from './tiempos.json';

export type Pt = [number, number];
export const WORDS: {i: number; w: string; s: number; e: number}[] = (tiempos as any).palabras;
const wi = (i: number) => (WORDS[i] ? WORDS[i].s : 0);

export const TM = {
  roof: 0.0, panels: wi(1) - 0.15, jbox: 1.0, dc: wi(3) - 0.1, dcLab: wi(3), oneWay: wi(8),
  house: wi(12) - 0.1, ac: wi(15) - 0.1, acLab: wi(15), bf: wi(19),
  gap: wi(26) + 0.05, inv: wi(30) - 0.1, flips: wi(32), mat: wi(38),
};
export const LABEL = 'INVERTER';

export const INK = '#E6F6FF', DC = '255,176,32', AC = '63,213,255', DIM = 'rgba(230,246,255,0.55)';

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const ROOF = {tl: [270, 830] as Pt, tr: [810, 830] as Pt, br: [935, 1040] as Pt, bl: [145, 1040] as Pt};
export const rp = (u: number, v: number): Pt => {
  const L: Pt = [lerp(ROOF.tl[0], ROOF.bl[0], v), lerp(ROOF.tl[1], ROOF.bl[1], v)];
  const R: Pt = [lerp(ROOF.tr[0], ROOF.br[0], v), lerp(ROOF.tr[1], ROOF.br[1], v)];
  return [lerp(L[0], R[0], u), lerp(L[1], R[1], u)];
};
export const INV = {x: 700, y: 1130, w: 120, h: 180};
export const DCIN: Pt = [740, 1130], ACOUT: Pt = [780, 1310], JBOX: Pt = [885, 1006];
export const CABLE: Pt[] = [JBOX, [885, 1075], [740, 1075], [740, 1105]];
export const CABLE_JOIN: Pt[] = [[740, 1105], DCIN];
export const AC_MAIN: Pt[] = [[780, 1335], [780, 1440], [410, 1440], [410, 1413]];
export const AC_LAMP: Pt[] = [[640, 1440], [640, 1066], [520, 1066]];
export const AC_JOIN: Pt[] = [ACOUT, [780, 1335]];

export const d = (pts: Pt[], close = false) => 'M ' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L ') + (close ? ' Z' : '');
export const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

// every self-drawing stroke: path, start, duration, style
export type Stroke = {d: string; t0: number; dur: number; w?: number; col?: string; glow?: boolean; inv?: 'outline' | 'inner'};
export const STROKES: Stroke[] = [];
const add = (pts: Pt[], t0: number, dur: number, o: Partial<Stroke> = {}) => STROKES.push({d: d(pts), t0, dur, ...o});

add([ROOF.bl, ROOF.tl, ROOF.tr, ROOF.br, ROOF.bl], TM.roof, 0.55, {w: 4});
add([[ROOF.bl[0], ROOF.bl[1] + 14], [ROOF.br[0], ROOF.br[1] + 14]], TM.roof + 0.3, 0.3, {w: 3});
[[0.12, 0.47], [0.54, 0.89]].forEach(([v0, v1], r) => {
  for (let c = 0; c < 4; c++) {
    const u0 = 0.08 + c * 0.21, u1 = u0 + 0.19, t0 = TM.panels + (r * 4 + c) * 0.09;
    const q = [rp(u0, v0), rp(u1, v0), rp(u1, v1), rp(u0, v1)];
    add([...q, q[0]], t0, 0.32, {w: 3.2});
    for (let j = 1; j < 4; j++) add([rp(lerp(u0, u1, j / 4), v0), rp(lerp(u0, u1, j / 4), v1)], t0 + 0.25, 0.18, {w: 1.4, col: DIM});
    add([rp(u0, (v0 + v1) / 2), rp(u1, (v0 + v1) / 2)], t0 + 0.3, 0.18, {w: 1.4, col: DIM});
  }
});
add([rp(0.92, 0.89), JBOX], TM.jbox - 0.1, 0.15, {w: 3});
add(rect(JBOX[0] - 14, JBOX[1] - 12, 28, 24), TM.jbox, 0.25, {w: 3});
add(CABLE, TM.dc, 1.0, {w: 5, col: `rgb(${DC})`, glow: true});
// house
add([[40, 1480], [1040, 1480]], TM.house - 0.05, 0.5, {w: 3, col: DIM});
add([[175, 1480], [175, 1046], [905, 1046], [905, 1480]], TM.house, 0.75, {w: 4});
add([[195, 1480], [195, 1066], [885, 1066], [885, 1480]], TM.house + 0.15, 0.7, {w: 2, col: DIM});
add([[175, 1500], [905, 1500]], TM.house + 0.3, 0.4, {w: 3});
add(rect(230, 1110, 100, 90), TM.house + 0.45, 0.35, {w: 2.6});
add([[280, 1110], [280, 1200]], TM.house + 0.7, 0.12, {w: 1.6, col: DIM});
add([[230, 1155], [330, 1155]], TM.house + 0.75, 0.12, {w: 1.6, col: DIM});
add(rect(240, 1250, 120, 228), TM.house + 0.55, 0.45, {w: 3.2});
add([[240, 1322], [360, 1322]], TM.house + 0.85, 0.15, {w: 2.4});
add([[346, 1270], [346, 1305]], TM.house + 0.9, 0.1, {w: 3});
add([[346, 1340], [346, 1395]], TM.house + 0.95, 0.1, {w: 3});
add([[360, 1420], [385, 1420], [400, 1413]], TM.house + 1.0, 0.15, {w: 2.4});
add(rect(401, 1400, 18, 26), TM.house + 1.05, 0.15, {w: 2.4});
add([[520, 1066], [520, 1140]], TM.house + 0.6, 0.2, {w: 2.4});
add([[485, 1140], [555, 1140], [578, 1182], [462, 1182], [485, 1140]], TM.house + 0.75, 0.3, {w: 3});
add(AC_MAIN, TM.ac, 0.8, {w: 5, col: `rgb(${AC})`, glow: true});
add(AC_LAMP, TM.ac + 0.25, 0.6, {w: 5, col: `rgb(${AC})`, glow: true});
// inverter (blueprint) + joins
add(rect(INV.x, INV.y, INV.w, INV.h), TM.inv, 0.5, {w: 4, inv: 'outline'});
add(rect(INV.x + 20, INV.y + 30, 80, 46), TM.inv + 0.3, 0.25, {w: 2, col: DIM, inv: 'inner'});
add([[678, INV.y], [678, INV.y + INV.h]], TM.inv + 0.35, 0.3, {w: 1.6, col: DIM});
add([[670, INV.y], [686, INV.y]], TM.inv + 0.35, 0.08, {w: 1.6, col: DIM});
add([[670, INV.y + INV.h], [686, INV.y + INV.h]], TM.inv + 0.6, 0.08, {w: 1.6, col: DIM});
add([[INV.x + 12, 1220], [INV.x + 48, 1220]], TM.inv + 0.45, 0.2, {w: 3.5, col: `rgb(${DC})`, inv: 'inner'});
const SINE: Pt[] = [];
for (let i = 0; i <= 24; i++) SINE.push([INV.x + 66 + i * 1.8, 1220 - 12 * Math.sin((i / 24) * Math.PI * 3)]);
add(SINE, TM.inv + 0.6, 0.3, {w: 3.5, col: `rgb(${AC})`, inv: 'inner'});
add(CABLE_JOIN, TM.flips, 0.22, {w: 5, col: `rgb(${DC})`, glow: true});
add(AC_JOIN, TM.flips + 0.15, 0.22, {w: 5, col: `rgb(${AC})`, glow: true});

// camera keys: [t, centre x, centre y, zoom]
export const KEYS: [number, number, number, number][] = [[0, 540, 1000, 1.2], [3.9, 540, 1000, 1.24], [4.8, 540, 1180, 1.08], [9.3, 540, 1180, 1.1],
  [10.2, 720, 1215, 1.6], [12.5, 725, 1215, 1.62], [13.1, 700, 1150, 1.45], [99, 700, 1150, 1.43]];

#!/usr/bin/env python3
# Generates the HyperFrames project for the round-3 solar reel from kit timings.
#   python3 gen.py  -> index.html, compositions/world.html, compositions/captions.html
# Author-time generation only: every timed element is written into the HTML with a stable id;
# at render time HyperFrames seeks the paused GSAP timelines frame by frame.
import json, math, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = json.load(open(os.path.join(HERE, 'assets', 'tiempos.json')))
WORDS = KIT['palabras']
DUR = 77.78

# ---- look ----
ACCENT = '#7C5CFF'          # main accent: caption emphasis, label underline, end card
DC = '#FFB020'              # direct current: moves one way
AC = '#2EC4F1'              # alternating current: oscillates
INK = '#14213D'

def W(i):
    return WORDS[i]['s']

def We(i):
    return WORDS[i]['e']

# ---------------- world geometry (world px; camera maps world -> screen) ----------------
ROOF = dict(tl=(230, 470), tr=(760, 470), br=(860, 640), bl=(130, 640))
def rp(u, v):
    L = (ROOF['tl'][0] + (ROOF['bl'][0] - ROOF['tl'][0]) * v, ROOF['tl'][1] + (ROOF['bl'][1] - ROOF['tl'][1]) * v)
    R = (ROOF['tr'][0] + (ROOF['br'][0] - ROOF['tr'][0]) * v, ROOF['tr'][1] + (ROOF['br'][1] - ROOF['tr'][1]) * v)
    return (L[0] + (R[0] - L[0]) * u, L[1] + (R[1] - L[1]) * u)

def plen(pts):
    return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))

def pstr(pts):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)

INV = (650, 700, 110, 150)       # x, y, w, h
BRK = (650, 890, 110, 140)
BAT = (775, 960, 60, 135)
METER = (880, 930)
POLE_X = 990
JUNC = rp(0.68, 0.95)

P_DC = [JUNC, (JUNC[0], 662), (705, 662), (705, 700)]
P_ROW = [rp(0.06, 0.97), rp(0.68, 0.97)]
P_INV_BRK = [(705, 850), (705, 890)]
P_LAMP = [(650, 915), (560, 915), (560, 678), (260, 678)]
P_AC1 = [(405, 678), (405, 715)]
P_AC2 = [(560, 835), (482, 835)]
P_FRIDGE = [(650, 1010), (292, 1010)]
P_BRK_METER = [(760, 930), (854, 930)]
P_GRID = [(880, 904), (880, 612), (POLE_X - 6, 594)]
P_BATT = [(805, 960), (805, 780), (760, 780)]
P_NEWROW = [rp(0.70, 0.97), rp(0.94, 0.97)]

# ---------------- camera keys: (time, focus x, focus y, zoom) ----------------
CAM = [
    (0.0, 545, 770, 1.0), (4.3, 545, 770, 1.06),
    (5.0, 545, 770, 1.06), (5.9, 420, 560, 1.7), (12.2, 430, 565, 1.75), (13.6, 640, 690, 1.6),
    (14.3, 640, 690, 1.6), (15.2, 470, 860, 1.2),
    (17.0, 470, 860, 1.2), (17.9, 705, 775, 2.0), (22.6, 705, 775, 2.05), (23.5, 700, 880, 1.7),
    (26.0, 700, 880, 1.7), (26.9, 470, 860, 1.2),
    (29.8, 470, 860, 1.2), (30.7, 545, 800, 1.0),
    (52.2, 545, 800, 1.0), (53.0, 860, 880, 1.8), (54.2, 860, 880, 1.8), (55.0, 545, 800, 1.0),
    (58.5, 545, 800, 1.0), (59.3, 720, 960, 1.5), (61.8, 720, 960, 1.5), (62.6, 545, 790, 1.0),
    (69.1, 545, 790, 1.0), (69.9, 930, 700, 1.6), (71.0, 930, 700, 1.6), (71.9, 690, 870, 1.4),
    (74.6, 690, 870, 1.4), (75.5, 545, 780, 0.95), (DUR, 545, 780, 0.97),
]
SCREEN_CY = 700

def cam_xy(fx, fy, z):
    return 540 - fx * z, SCREEN_CY - fy * z

# ---------------- labels: (id, text, x, y, show_t, hide_t, color) in world coords ----------------
LABELS = [
    ('lb-dc', 'Direct current (DC)', 420, 430, W(24), W(40), DC),
    ('lb-acm', 'Alternating current (AC)', 470, 760, W(45), W(53) - 0.4, AC),
    ('lb-inv', 'Inverter', 575, 720, W(53) + 0.5, W(63), None),
    ('lb-brk', 'Breaker panel', 560, 960, W(71), W(85) - 0.3, None),
    ('lb-lamp', 'Lights', 205, 800, W(78), W(85), None),
    ('lb-fridge', 'Fridge', 231, 875, W(80), W(85), None),
    ('lb-ac', 'Air conditioner', 445, 800, W(83), W(85) + 0.6, None),
    ('lb-ac2', '2nd air conditioner', 405, 885, W(91), W(97), None),
    ('lb-grid', 'Grid', 905, 548, W(102), W(107), None),
    ('lb-more', 'More panels', 690, 430, W(115), W(117) + 0.5, None),
    ('lb-big', 'Bigger inverter', 575, 720, W(120), W(122), None),
    ('lb-meter', 'Two-way meter', 860, 1000, W(155), W(159), None),
    ('lb-bat', 'Battery bank', 690, 1070, W(174), W(183), None),
    ('lb-worker', 'Line worker', 875, 700, W(204), W(208), None),
    ('lb-hyb', 'Hybrid inverter', 560, 720, W(212), DUR - 2.2, None),
]

# ---------------- flows (energy dots) ----------------
# kind dc: dots travel one way; kind ac: dots oscillate (+ slow drift = net direction)
FLOWS = [
    dict(id='f-row', pts=P_ROW, kind='dc', n=8, on=[[W(27), W(40)]]),
    dict(id='f-dc', pts=P_DC, kind='dc', n=6, on=[[W(35), W(160) + 0.9], [W(208) + 0.4, DUR]]),
    dict(id='f-newrow', pts=P_NEWROW, kind='dc', n=4, on=[[W(116) + 0.3, W(160) + 0.9]]),
    dict(id='f-invbrk', pts=P_INV_BRK, kind='ac', n=2, drift=1, on=[[W(68), W(160) + 0.9], [W(176), W(183)], [W(214), DUR]]),
    dict(id='f-lamp', pts=P_LAMP, kind='ac', n=12, drift=1, on=[[W(78) - 0.3, W(194)], [W(215), DUR]]),
    dict(id='f-ac1', pts=P_AC1, kind='ac', n=1, drift=1, on=[[W(83), W(194)], [W(215), DUR]]),
    dict(id='f-ac2', pts=P_AC2, kind='ac', n=2, drift=1, on=[[W(92), W(194)]]),
    dict(id='f-fridge', pts=P_FRIDGE, kind='ac', n=9, drift=1, on=[[W(80) - 0.3, W(194)], [W(215), DUR]]),
    dict(id='f-grid-in', pts=list(reversed(P_GRID)), kind='ac', n=9, drift=1, on=[[W(102), W(107)], [W(162) + 0.3, W(174)], [W(186), W(190) + 0.6]]),
    dict(id='f-meter-in', pts=list(reversed(P_BRK_METER)), kind='ac', n=2, drift=1, on=[[W(102), W(107)], [W(162) + 0.3, W(174)], [W(186), W(190) + 0.6]]),
    dict(id='f-grid-out', pts=P_GRID, kind='ac', n=9, drift=1, on=[[W(144), W(159)]]),
    dict(id='f-meter-out', pts=P_BRK_METER, kind='ac', n=2, drift=1, on=[[W(144), W(159)]]),
    dict(id='f-batt', pts=P_BATT, kind='dc', n=5, on=[[W(176), W(183)], [W(209) + 0.3, DUR]]),
]

def flow_svg():
    out = []
    for f in FLOWS:
        col = DC if f['kind'] == 'dc' else AC
        for k in range(f['n']):
            out.append(f'<circle id="{f["id"]}-{k}" r="7" fill="{col}" opacity="0" filter="url(#glow)"/>')
    return '\n'.join(out)

def label_svg(lid, text, x, y, color):
    w = len(text) * 17.5 + 44
    fill = color or '#FFFFFF'
    tc = INK
    return (f'<g id="{lid}" opacity="0" transform="translate({x},{y})">'
            f'<g class="lbl-in"><rect x="{-w/2:.0f}" y="-26" width="{w:.0f}" height="52" rx="26" fill="{fill}" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="{-w/2+20:.0f}" y="14" width="{w-40:.0f}" height="4" rx="2" fill="var(--accent)" class="lbl-ul"/>'
            f'<text x="0" y="9" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" fill="{tc}">{html.escape(text)}</text></g></g>')

def poly(id_, pts, stroke, width, extra=''):
    L = plen(pts)
    return (f'<polyline id="{id_}" points="{pstr(pts)}" fill="none" stroke="{stroke}" stroke-width="{width}" '
            f'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="{L:.1f}" stroke-dashoffset="{L:.1f}" {extra}/>'), L

DRAWN = []   # (id, length, t0, dur)
def drawn(id_, pts, stroke, width, t0, dur, extra=''):
    s, L = poly(id_, pts, stroke, width, extra)
    DRAWN.append((id_, L, t0, dur))
    return s

def panels_svg(cols, prefix, v0=0.08, v1=0.92):
    out = []
    rows = [(v0, 0.48), (0.52, v1)]
    k = 0
    for c, (u0, u1) in enumerate(cols):
        for r, (a, b) in enumerate(rows):
            q = [rp(u0, a), rp(u1, a), rp(u1, b), rp(u0, b)]
            cx = sum(p[0] for p in q) / 4; cy = sum(p[1] for p in q) / 4
            out.append(f'<g id="{prefix}-{k}" class="panel" opacity="0" style="transform-origin:{cx:.0f}px {cy:.0f}px">'
                       f'<polygon points="{pstr(q)}" fill="#1E4FA3" stroke="#0B1F45" stroke-width="3" class="pfill"/>'
                       + ''.join(f'<line x1="{rp(u0+(u1-u0)*j/3, a)[0]:.1f}" y1="{rp(u0+(u1-u0)*j/3, a)[1]:.1f}" x2="{rp(u0+(u1-u0)*j/3, b)[0]:.1f}" y2="{rp(u0+(u1-u0)*j/3, b)[1]:.1f}" stroke="#7FA8E8" stroke-width="1.5" opacity="0.7"/>' for j in (1, 2))
                       + f'<line x1="{rp(u0,(a+b)/2)[0]:.1f}" y1="{rp(u0,(a+b)/2)[1]:.1f}" x2="{rp(u1,(a+b)/2)[0]:.1f}" y2="{rp(u1,(a+b)/2)[1]:.1f}" stroke="#7FA8E8" stroke-width="1.5" opacity="0.7"/>'
                       + f'<polygon class="pglint" points="{pstr(q)}" fill="#FFFFFF" opacity="0"/></g>')
            k += 1
    return '\n'.join(out)

COLS = [(0.06, 0.25), (0.27, 0.46), (0.48, 0.67)]
NEWCOLS = [(0.70, 0.89)]

def world_html():
    ix, iy, iw, ih = INV; bx, by, bw, bh = BRK; ax, ay, aw, ah = BAT; mx, my = METER
    stars = ''.join(f'<circle cx="{(i*137)%1400-160}" cy="{(i*89)%420+120}" r="{2+(i%3)}" fill="#FFFFFF"/>' for i in range(40))
    svg = f'''
<svg id="w-svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">
  <defs>
    <filter id="glow" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="lampglow"><stop offset="0" stop-color="#FFE7A3" stop-opacity="0.85"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#FFB02055"/><line x1="0" y1="0" x2="0" y2="14" stroke="#B87400" stroke-width="5"/></pattern>
  </defs>
  <rect id="w-sky" x="-2000" y="-2000" width="5080" height="3100" fill="#8FD0F7"/>
  <g id="w-stars" opacity="0">{stars}</g>
  <g id="w-sun"><circle r="70" fill="#FFD84D" opacity="0.35"/><circle r="48" fill="#FFD23F" stroke="#F2A900" stroke-width="4"/></g>
  <g id="w-moon" opacity="0" transform="translate(860,300)"><circle r="40" fill="#F4F1DE"/><circle cx="18" cy="-10" r="36" fill="#0D1B3D" class="moonbite"/></g>
  <g id="w-rays" opacity="0" stroke="#FFD23F" stroke-width="6" stroke-linecap="round" stroke-dasharray="18 22">
    <line x1="180" y1="330" x2="{rp(0.15,0.5)[0]:.0f}" y2="{rp(0.15,0.5)[1]:.0f}"/><line x1="180" y1="330" x2="{rp(0.37,0.5)[0]:.0f}" y2="{rp(0.37,0.5)[1]:.0f}"/><line x1="180" y1="330" x2="{rp(0.58,0.5)[0]:.0f}" y2="{rp(0.58,0.5)[1]:.0f}"/>
  </g>
  <!-- ground -->
  <rect x="-2000" y="1100" width="5080" height="2000" fill="#3E7D4E"/>
  <rect x="-2000" y="1100" width="5080" height="14" fill="#2F6440"/>
  <!-- pole + worker -->
  <g id="w-pole"><rect x="{POLE_X-9}" y="560" width="18" height="540" fill="#8A6A4A"/><rect x="{POLE_X-60}" y="584" width="120" height="12" fill="#8A6A4A"/>
    <circle cx="{POLE_X-50}" cy="580" r="7" fill="#C9D2DC"/><circle cx="{POLE_X+50}" cy="580" r="7" fill="#C9D2DC"/>
    <line x1="{POLE_X+50}" y1="586" x2="1600" y2="560" stroke="#2B2D42" stroke-width="4"/></g>
  <g id="w-worker" opacity="0" transform="translate({POLE_X+26},720)">
    <rect x="-14" y="-20" width="28" height="44" rx="6" fill="#FF8C00"/><circle cy="-34" r="14" fill="#E0AC69"/>
    <path d="M -17 -38 Q 0 -60 17 -38 Z" fill="#FFD23F" stroke="#B38600" stroke-width="2"/>
    <line x1="-14" y1="-10" x2="-30" y2="-40" stroke="#FF8C00" stroke-width="8" stroke-linecap="round"/>
    <rect x="-12" y="24" width="10" height="34" fill="#2B4C7E"/><rect x="2" y="24" width="10" height="34" fill="#2B4C7E"/>
  </g>
  <g id="w-shield" opacity="0" transform="translate({POLE_X-70},700)"><path d="M0,-34 L28,-24 L28,4 Q28,26 0,38 Q-28,26 -28,4 L-28,-24 Z" fill="#2ECC71" stroke="{INK}" stroke-width="3"/><path d="M-12,2 L-3,12 L14,-10" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
  <!-- grid service drop (drawn line), meter -->
  {drawn('w-drop', P_GRID, '#2B2D42', 5, 0.2, 1.2)}
  <g id="w-meter"><circle cx="{mx}" cy="{my}" r="28" fill="#E9EEF3" stroke="{INK}" stroke-width="4"/><circle cx="{mx}" cy="{my}" r="17" fill="#FFFFFF" stroke="#9AA8B6" stroke-width="2"/>
    <line id="w-meter-needle" x1="{mx}" y1="{my}" x2="{mx}" y2="{my-14}" stroke="{ACCENT}" stroke-width="4" stroke-linecap="round" style="transform-origin:{mx}px {my}px" class="needle"/></g>
  <g id="w-meter-arrows" opacity="0"><text x="{mx}" y="{my-40}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="{INK}">⇄</text></g>
  <!-- house body: cutaway room -->
  <rect x="150" y="640" width="690" height="460" fill="#F6EBDD"/>
  <rect id="w-roomdark" x="150" y="640" width="690" height="460" fill="#0A1230" opacity="0"/>
  <rect x="150" y="640" width="690" height="460" fill="none" stroke="{INK}" stroke-width="8"/>
  <rect x="150" y="1092" width="690" height="14" fill="#C9B79C"/>
  <!-- roof face -->
  <polygon points="{pstr([ROOF['tl'],ROOF['tr'],ROOF['br'],ROOF['bl']])}" fill="#C0533A" stroke="{INK}" stroke-width="6"/>
  {panels_svg(COLS, 'w-p')}
  {panels_svg(NEWCOLS, 'w-pn')}
  {drawn('w-row', P_ROW, '#0B1F45', 4, W(27), 0.9)}
  {drawn('w-newrow', P_NEWROW, '#0B1F45', 4, W(116), 0.4)}
  <rect id="w-junc" x="{JUNC[0]-12:.0f}" y="{JUNC[1]-10:.0f}" width="24" height="20" rx="4" fill="#2B2D42" opacity="0"/>
  <!-- wires (drawn when named) -->
  {drawn('w-dc', P_DC, '#2B2D42', 6, W(35), 1.1)}
  {drawn('w-invbrk', P_INV_BRK, '#2B2D42', 6, W(68) - 0.2, 0.4)}
  {drawn('w-lamp', P_LAMP, '#2B2D42', 5, W(76) - 0.2, 0.7)}
  {drawn('w-ac1', P_AC1, '#2B2D42', 5, W(83) - 0.3, 0.3)}
  {drawn('w-ac2', P_AC2, '#2B2D42', 5, W(91), 0.35)}
  {drawn('w-fridge', P_FRIDGE, '#2B2D42', 5, W(79) - 0.2, 0.6)}
  {drawn('w-brkmeter', P_BRK_METER, '#2B2D42', 5, 0.2, 1.0)}
  {drawn('w-batt', P_BATT, '#2B2D42', 6, W(174) + 0.2, 0.6)}
  <!-- lamp -->
  <g id="w-lampg"><line x1="260" y1="678" x2="260" y2="730" stroke="{INK}" stroke-width="4"/>
    <path d="M 228 760 L 292 760 L 278 730 L 242 730 Z" fill="#E9EEF3" stroke="{INK}" stroke-width="4"/>
    <circle id="w-bulb" cx="260" cy="768" r="12" fill="#9AA8B6" stroke="{INK}" stroke-width="3"/>
    <circle id="w-lampglow" cx="260" cy="780" r="140" fill="url(#lampglow)" opacity="0"/></g>
  <!-- fridge -->
  <g id="w-fridgeg" opacity="0"><rect x="172" y="900" width="120" height="196" rx="10" fill="#FFFFFF" stroke="{INK}" stroke-width="5"/>
    <line x1="172" y1="962" x2="292" y2="962" stroke="{INK}" stroke-width="4"/><rect x="272" y="918" width="7" height="30" rx="3" fill="{INK}"/><rect x="272" y="980" width="7" height="44" rx="3" fill="{INK}"/>
    <circle id="w-fridge-led" cx="190" cy="1078" r="6" fill="#9AA8B6"/></g>
  <!-- air conditioners (wall units) -->
  <g id="w-ac1g" opacity="0"><rect x="330" y="715" width="150" height="48" rx="12" fill="#FFFFFF" stroke="{INK}" stroke-width="5"/><line x1="346" y1="750" x2="464" y2="750" stroke="#9AA8B6" stroke-width="3"/>
    <g id="w-ac1air" opacity="0" stroke="{AC}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M360 774 q 8 14 0 28"/><path d="M405 774 q 8 14 0 28"/><path d="M450 774 q 8 14 0 28"/></g></g>
  <g id="w-ac2g" opacity="0"><rect x="330" y="811" width="150" height="48" rx="12" fill="#FFFFFF" stroke="{INK}" stroke-width="5"/><line x1="346" y1="846" x2="464" y2="846" stroke="#9AA8B6" stroke-width="3"/>
    <g id="w-ac2air" opacity="0" stroke="{AC}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M360 870 q 8 14 0 28"/><path d="M405 870 q 8 14 0 28"/><path d="M450 870 q 8 14 0 28"/></g></g>
  <!-- battery bank -->
  <g id="w-batg" opacity="0"><rect x="{ax}" y="{ay}" width="{aw}" height="{ah}" rx="8" fill="#3D405B" stroke="{INK}" stroke-width="4"/>
    <rect x="{ax+18}" y="{ay-8}" width="24" height="10" rx="3" fill="{INK}"/>
    <rect id="w-batlevel" x="{ax+8}" y="{ay+8}" width="{aw-16}" height="{ah-16}" rx="4" fill="#2ECC71"/>
    <text x="{ax+aw/2}" y="{ay+ah/2+12}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="{INK}">+</text></g>
  <g id="w-batx" opacity="0"><line x1="{ax-10}" y1="{ay-10}" x2="{ax+aw+10}" y2="{ay+ah+10}" stroke="#E63946" stroke-width="9" stroke-linecap="round"/><line x1="{ax+aw+10}" y1="{ay-10}" x2="{ax-10}" y2="{ay+ah+10}" stroke="#E63946" stroke-width="9" stroke-linecap="round"/></g>
  <!-- breaker panel -->
  <g id="w-brkg" opacity="0"><rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="8" fill="#DDE3EA" stroke="{INK}" stroke-width="5"/>
    {''.join(f'<rect x="{bx+18+(j%2)*42}" y="{by+18+(j//2)*28}" width="32" height="18" rx="3" fill="#5C6B7A"/>' for j in range(8))}</g>
  <!-- inverter -->
  <g id="w-invg" style="transform-origin:{ix+iw/2}px {iy+ih}px">
    <rect id="w-inv-outline" x="{ix}" y="{iy}" width="{iw}" height="{ih}" rx="12" fill="#FFFFFF" stroke="{INK}" stroke-width="5" opacity="0"/>
    <g id="w-inv-in" opacity="0"><rect x="{ix+14}" y="{iy+18}" width="{iw-28}" height="54" rx="6" fill="#0E1B2A"/>
      <line id="w-inv-dcline" x1="{ix+22}" y1="{iy+45}" x2="{ix+50}" y2="{iy+45}" stroke="{DC}" stroke-width="5" stroke-linecap="round"/>
      <path id="w-inv-sine" d="M {ix+58} {iy+45} q 7 -18 14 0 t 14 0 t 14 0" fill="none" stroke="{AC}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="{ix+30}" cy="{iy+100}" r="7" id="w-inv-led" fill="#2ECC71"/>
      <rect x="{ix}" y="{iy+ih-22}" width="{iw}" height="10" fill="var(--accent)"/></g>
    <g id="w-inv-off" opacity="0"><rect x="{ix+10}" y="{iy+56}" width="{iw-20}" height="44" rx="8" fill="#E63946"/><text x="{ix+iw/2}" y="{iy+88}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#FFFFFF">OFF</text></g>
  </g>
  <!-- question mark for the hook -->
  <g id="w-q" opacity="0" transform="translate(470,420)"><circle r="44" fill="var(--accent)" stroke="{INK}" stroke-width="5"/><text y="18" text-anchor="middle" font-family="Inter" font-weight="900" font-size="56" fill="#FFFFFF">?</text></g>
  <g id="w-spark" opacity="0"><circle r="16" fill="{DC}" filter="url(#glow)"/></g>
  <!-- blackout: grid line X -->
  <g id="w-gridx" opacity="0" transform="translate(935,600)"><circle r="30" fill="#E63946" stroke="{INK}" stroke-width="4"/><path d="M-12,-12 L12,12 M12,-12 L-12,12" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/></g>
  <g id="w-switch" opacity="0" transform="translate(867,930)"><circle r="9" fill="{INK}"/><line x1="0" y1="0" x2="-4" y2="-30" stroke="{INK}" stroke-width="6" stroke-linecap="round"/></g>
  <!-- AC sine badge in the room -->
  <g id="w-acsine" opacity="0" transform="translate(470,840)"><path id="w-acsine-p" d="M -120 0 q 20 -40 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke="{AC}" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/></g>
  {flow_svg()}
  {''.join(label_svg(*[l[0], l[1], l[2], l[3], l[6]]) for l in LABELS)}
</svg>'''

    # ---- HUD (screen space) ----
    hud = f'''
<div id="w-hud" style="position:absolute;left:60px;top:190px;width:960px;height:178px;opacity:0">
  <svg width="960" height="178" viewBox="0 0 960 178" style="overflow:visible">
    <rect x="0" y="0" width="960" height="178" rx="24" fill="#FFFFFFEE" stroke="{INK}" stroke-width="4"/>
    <text x="28" y="66" font-family="Inter" font-weight="900" font-size="30" fill="{INK}">Power in</text>
    <text x="28" y="140" font-family="Inter" font-weight="900" font-size="30" fill="{INK}">Home use</text>
    <rect x="200" y="38" width="720" height="40" rx="10" fill="#E9EEF3"/>
    <rect x="200" y="112" width="720" height="40" rx="10" fill="#E9EEF3"/>
    <rect id="h-sun" x="200" y="38" width="0" height="40" rx="10" fill="{DC}"/>
    <rect id="h-clip" x="200" y="38" width="0" height="40" fill="url(#hatchh)"/>
    <rect id="h-grid" x="200" y="38" width="0" height="40" fill="#8D99AE"/>
    <rect id="h-bat" x="200" y="38" width="0" height="40" rx="10" fill="#2ECC71"/>
    <text id="h-suntext" x="220" y="66" opacity="0" font-family="Inter" font-weight="900" font-size="28" fill="{INK}">Sun</text>
    <rect id="h-use" x="200" y="112" width="0" height="40" rx="10" fill="{AC}"/>
    <g id="h-limit" opacity="0"><line id="h-limitline" x1="0" y1="26" x2="0" y2="90" stroke="#E63946" stroke-width="6" stroke-dasharray="8 6"/><text id="h-limittext" x="-10" y="27" text-anchor="end" font-family="Inter" font-weight="900" font-size="28" fill="#E63946">Inverter limit</text></g>
    <text id="h-gridtext" x="0" y="66" opacity="0" font-family="Inter" font-weight="900" font-size="28" fill="{INK}">Grid</text>
    <text id="h-battext" x="0" y="66" opacity="0" font-family="Inter" font-weight="900" font-size="28" fill="{INK}">Battery</text>
    <text id="h-extratext" x="0" y="66" opacity="0" font-family="Inter" font-weight="900" font-size="28" fill="{INK}">Extra → grid</text>
    <defs><pattern id="hatchh" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#FFE0A0"/><line x1="0" y1="0" x2="0" y2="12" stroke="#C98A00" stroke-width="4"/></pattern></defs>
  </svg>
</div>
<div id="w-end" style="position:absolute;left:0;top:250px;width:1080px;text-align:center;opacity:0">
  <div style="display:inline-block;padding:18px 34px;border-radius:24px;background:#FFFFFF;border:4px solid {INK};font-family:Inter;font-weight:900;font-size:40px;color:{INK}">
    <span style="color:{DC}">Panels</span> → <span>Inverter</span> → <span style="color:var(--accent)">Your home</span></div></div>
'''
    js = build_js()
    return f'''<template>
<style>
  #root {{ position:absolute; inset:0; overflow:hidden; --accent:{ACCENT}; }}
  #w-cam {{ position:absolute; left:0; top:0; width:1080px; height:1920px; transform-origin:0 0; }}
</style>
<div id="root" data-composition-id="world" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
  <div id="w-cam" data-layout-allow-overflow data-layout-allow-overlap>{svg}</div>
  {hud}
</div>
<script>
{js}
</script>
</template>'''

def build_js():
    flows = json.dumps(FLOWS)
    drawn_l = json.dumps(DRAWN)
    labels = json.dumps([[l[0], l[4], l[5]] for l in LABELS])
    cams = json.dumps([[t, *cam_xy(fx, fy, z), z] for t, fx, fy, z in CAM])
    T = {k: round(v, 3) for k, v in dict(
        q=W(2), spark=W(12), sun=W(14), panels=W(15), dc=W(24), wired=W(27), adds=W(32),
        acm=W(45), invdraw=W(53) - 0.5, invlbl=W(53), converts=W(57), sine=W(61), brk=W(71),
        lamp=W(78), fridge=W(80), ac1=W(83), plug=W(85), ac2=W(91), cant=W(98), grid=W(102),
        sunrun=W(107), addp=W(114), bigger=W(120), limits=W(125), noon=W(134), extra=W(144),
        meter=W(155), night=W(160), stop=W(162), bat=W(174), stores=W(177), without=W(183),
        pull=W(186), blackout=W(193), shuts=W(198), workers=W(204), only=W(208), hybrid=W(212),
        keep=W(214), know=W(218), send=W(223)).items()}
    return f'''
(function () {{
  const DUR = {DUR};
  const T = {json.dumps(T)};
  const FLOWS = {flows};
  const DRAWN = {drawn_l};
  const LABELS = {labels};
  const CAMS = {cams};
  const $ = (s) => document.querySelector(s);
  const tl = gsap.timeline({{ paused: true }});

  // ---------- camera ----------
  gsap.set('#w-cam', {{ x: CAMS[0][1], y: CAMS[0][2], scale: CAMS[0][3] }});
  for (let i = 1; i < CAMS.length; i++) {{
    const a = CAMS[i - 1], b = CAMS[i];
    if (a[1] === b[1] && a[2] === b[2] && a[3] === b[3]) continue;
    tl.fromTo('#w-cam', {{ x: a[1], y: a[2], scale: a[3] }}, {{ x: b[1], y: b[2], scale: b[3], duration: b[0] - a[0], ease: (b[0] - a[0]) > 2 ? 'none' : 'power2.inOut', immediateRender: false }}, a[0]);
  }}

  // ---------- drawn wires ----------
  for (const [id, L, t0, d] of DRAWN) tl.fromTo('#' + id, {{ attr: {{ 'stroke-dashoffset': L }} }}, {{ attr: {{ 'stroke-dashoffset': 0 }}, duration: d, ease: 'power2.inOut', immediateRender: false }}, t0);

  // ---------- labels (pop in, fade out) ----------
  for (const [id, t0, t1] of LABELS) {{
    tl.fromTo('#' + id, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15, ease: 'none', immediateRender: false }}, t0);
    tl.fromTo('#' + id + ' .lbl-in', {{ scale: 0.6, transformOrigin: '50% 50%' }}, {{ scale: 1, duration: 0.45, ease: 'back.out(1.6)', immediateRender: false }}, t0);
    tl.fromTo('#' + id, {{ opacity: 1 }}, {{ opacity: 0, duration: 0.2, ease: 'power2.in', immediateRender: false }}, Math.max(t0 + 0.6, t1 - 0.2));
  }}

  // ---------- sky / time of day ----------
  const sky = (t, c, d) => tl.to('#w-sky', {{ attr: {{ fill: c }}, duration: d, ease: 'power2.inOut' }}, t);
  sky(T.noon - 0.1, '#4FB8FF', 0.6); sky(T.night - 0.2, '#0D1B3D', 0.8); sky(T.blackout - 0.4, '#7D8A99', 0.6);
  gsap.set('#w-sun', {{ x: 180, y: 330 }});
  tl.fromTo('#w-sun', {{ x: 180, y: 330 }}, {{ x: 230, y: 300, duration: T.noon - 0.2, ease: 'none', immediateRender: false }}, 0);
  tl.fromTo('#w-sun', {{ x: 230, y: 300 }}, {{ x: 540, y: 240, duration: 0.9, ease: 'power2.inOut', immediateRender: false }}, T.noon - 0.2);
  tl.fromTo('#w-sun', {{ x: 540, y: 240 }}, {{ x: 1050, y: 760, duration: 1.0, ease: 'power2.in', immediateRender: false }}, T.night - 0.3);
  tl.fromTo('#w-sun', {{ x: 160, y: 760, opacity: 0.55 }}, {{ x: 230, y: 320, opacity: 0.55, duration: 0.9, ease: 'power2.out', immediateRender: false }}, T.blackout - 0.4);
  tl.fromTo('#w-sun', {{ opacity: 0.55 }}, {{ opacity: 1, duration: 0.5, immediateRender: false }}, T.only);
  tl.to('#w-sun', {{ opacity: 0, duration: 0.3 }}, T.night + 0.6);
  tl.fromTo('#w-stars', {{ opacity: 0 }}, {{ opacity: 0.9, duration: 0.8, immediateRender: false }}, T.night);
  tl.fromTo('#w-moon', {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.8, immediateRender: false }}, T.night);
  tl.to('#w-stars', {{ opacity: 0, duration: 0.5 }}, T.blackout - 0.4);
  tl.to('#w-moon', {{ opacity: 0, duration: 0.5 }}, T.blackout - 0.4);
  tl.fromTo('#w-roomdark', {{ opacity: 0 }}, {{ opacity: 0.55, duration: 0.8, immediateRender: false }}, T.night);
  tl.to('#w-roomdark', {{ opacity: 0.25, duration: 0.6 }}, T.blackout - 0.4);
  tl.to('#w-roomdark', {{ opacity: 0.0, duration: 0.6 }}, T.keep);

  // ---------- hook ----------
  tl.fromTo('#w-q', {{ opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }}, T.q);
  tl.to('#w-q', {{ y: -14, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 3 }}, T.q + 0.5);
  tl.to('#w-q', {{ opacity: 0, scale: 0.4, duration: 0.25, ease: 'power3.in' }}, T.spark - 0.1);
  tl.fromTo('#w-spark', {{ opacity: 0, x: 420, y: 560, scale: 0.2 }}, {{ opacity: 1, scale: 1.4, duration: 0.3, ease: 'back.out(3)', immediateRender: false }}, T.spark);
  tl.to('#w-spark', {{ opacity: 0, scale: 0.4, duration: 0.3 }}, T.sun);

  // ---------- panels ----------
  const pan = gsap.utils.toArray('[id^="w-p-"]');
  pan.forEach((p, k) => tl.fromTo(p, {{ opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)', immediateRender: false }}, 0.15 + k * 0.08));
  tl.fromTo('#w-junc', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, immediateRender: false }}, 0.8);
  tl.fromTo('#w-rays', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.sun);
  tl.fromTo('#w-rays', {{ attr: {{ 'stroke-dashoffset': 0 }} }}, {{ attr: {{ 'stroke-dashoffset': -400 }}, duration: T.wired - T.sun, ease: 'none', immediateRender: false }}, T.sun);
  tl.to('#w-rays', {{ opacity: 0, duration: 0.4 }}, T.wired);
  pan.forEach((p, k) => tl.fromTo(p.querySelector('.pglint'), {{ opacity: 0 }}, {{ opacity: 0.55, duration: 0.18, yoyo: true, repeat: 1, immediateRender: false }}, T.panels + k * 0.12));
  const panN = gsap.utils.toArray('[id^="w-pn-"]');
  panN.forEach((p, k) => tl.fromTo(p, {{ opacity: 0, scale: 0.3, y: -60, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', immediateRender: false }}, T.addp + 0.2 + k * 0.12));
  [...pan, ...panN].forEach((p) => tl.to(p.querySelector('.pfill'), {{ attr: {{ fill: '#0C1E40' }}, duration: 0.6 }}, T.stop));
  [...pan, ...panN].forEach((p) => tl.to(p.querySelector('.pfill'), {{ attr: {{ fill: '#1E4FA3' }}, duration: 0.6 }}, T.blackout - 0.3));

  // ---------- house: AC badge, inverter, breaker, loads ----------
  tl.fromTo('#w-acsine', {{ opacity: 0, scale: 0.5, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)', immediateRender: false }}, T.acm - 0.1);
  tl.fromTo('#w-acsine-p', {{ x: 0 }}, {{ x: -80, duration: 2.4, ease: 'none', immediateRender: false }}, T.acm);
  tl.to('#w-acsine', {{ opacity: 0, duration: 0.3 }}, T.invdraw);
  tl.fromTo('#w-inv-outline', {{ opacity: 0, scaleY: 0, transformOrigin: '50% 100%' }}, {{ opacity: 1, scaleY: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }}, T.invdraw);
  tl.fromTo('#w-inv-in', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.invdraw + 0.4);
  tl.fromTo('#w-inv-dcline', {{ opacity: 1 }}, {{ opacity: 0.25, duration: 0.4, immediateRender: false }}, T.converts);
  tl.fromTo('#w-inv-sine', {{ scale: 0.4, transformOrigin: '0% 50%' }}, {{ scale: 1.25, duration: 0.6, ease: 'back.out(2)', immediateRender: false }}, T.sine);
  tl.to('#w-inv-dcline', {{ opacity: 1, duration: 0.3 }}, T.sine + 1.0);
  tl.to('#w-inv-sine', {{ scale: 1, duration: 0.3 }}, T.sine + 1.0);
  tl.fromTo('#w-brkg', {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', immediateRender: false }}, T.brk - 0.3);
  tl.fromTo('#w-lampglow', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.lamp);
  tl.fromTo('#w-bulb', {{ attr: {{ fill: '#9AA8B6' }} }}, {{ attr: {{ fill: '#FFE066' }}, duration: 0.2, immediateRender: false }}, T.lamp);
  tl.fromTo('#w-fridgeg', {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)', immediateRender: false }}, T.fridge - 0.5);
  tl.fromTo('#w-fridge-led', {{ attr: {{ fill: '#9AA8B6' }} }}, {{ attr: {{ fill: '#2ECC71' }}, duration: 0.2, immediateRender: false }}, T.fridge);
  tl.fromTo('#w-ac1g', {{ opacity: 0, x: -30 }}, {{ opacity: 1, x: 0, duration: 0.4, ease: 'back.out(1.5)', immediateRender: false }}, T.ac1 - 0.5);
  tl.fromTo('#w-ac1air', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.ac1 + 0.2);
  tl.fromTo('#w-ac2g', {{ opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }}, T.ac2 - 0.2);
  tl.fromTo('#w-ac2air', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.ac2 + 0.4);
  // bigger inverter
  tl.fromTo('#w-invg', {{ scale: 1, svgOrigin: '705 850' }}, {{ scale: 1.22, svgOrigin: '705 850', duration: 0.5, ease: 'back.out(2)', immediateRender: false }}, T.bigger);
  // night lighting: lamp keeps on (grid/battery), AC units idle at night
  tl.to('#w-ac2air', {{ opacity: 0, duration: 0.3 }}, T.noon);
  tl.to('#w-ac2g', {{ opacity: 0.35, duration: 0.3 }}, T.noon);
  // battery bank
  tl.fromTo('#w-batg', {{ opacity: 0, y: 60 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)', immediateRender: false }}, T.bat - 0.1);
  tl.fromTo('#w-batlevel', {{ scaleY: 1, transformOrigin: '50% 100%' }}, {{ scaleY: 0.55, duration: T.without - T.stores, ease: 'none', immediateRender: false }}, T.stores);
  tl.to('#w-batg', {{ opacity: 0.25, duration: 0.3 }}, T.without);
  tl.fromTo('#w-batx', {{ opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', immediateRender: false }}, T.without);
  tl.to('#w-batx', {{ opacity: 0, duration: 0.2 }}, T.blackout - 0.4);
  tl.to('#w-batg', {{ opacity: 0, duration: 0.2 }}, T.blackout - 0.4);
  tl.to('#w-batlevel', {{ scaleY: 1, duration: 0.01 }}, T.blackout - 0.2);
  tl.to('#w-batg', {{ opacity: 1, duration: 0.4 }}, T.only + 0.2);
  // meter
  tl.fromTo('.needle', {{ rotation: 0 }}, {{ rotation: 720, duration: T.extra - T.grid, ease: 'none', immediateRender: false }}, T.grid);
  tl.fromTo('.needle', {{ rotation: 720 }}, {{ rotation: 0, duration: T.night - T.extra, ease: 'none', immediateRender: false }}, T.extra);
  tl.fromTo('.needle', {{ rotation: 0 }}, {{ rotation: 360, duration: T.blackout - T.pull, ease: 'none', immediateRender: false }}, T.pull);
  tl.fromTo('#w-meter-arrows', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.meter);
  tl.to('#w-meter-arrows', {{ opacity: 0, duration: 0.3 }}, T.night);
  // blackout
  tl.fromTo('#w-gridx', {{ opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)', immediateRender: false }}, T.blackout);
  tl.to('#w-drop', {{ attr: {{ stroke: '#E63946' }}, duration: 0.3 }}, T.blackout);
  tl.to('#w-lampglow', {{ opacity: 0, duration: 0.15 }}, T.blackout + 0.4);
  tl.to('#w-bulb', {{ attr: {{ fill: '#9AA8B6' }}, duration: 0.15 }}, T.blackout + 0.4);
  tl.to('#w-fridge-led', {{ attr: {{ fill: '#9AA8B6' }}, duration: 0.15 }}, T.blackout + 0.4);
  tl.to('#w-ac1air', {{ opacity: 0, duration: 0.15 }}, T.blackout + 0.4);
  tl.fromTo('#w-inv-off', {{ opacity: 0, scale: 0.5, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', immediateRender: false }}, T.shuts);
  tl.to('#w-inv-led', {{ attr: {{ fill: '#E63946' }}, duration: 0.1 }}, T.shuts);
  tl.fromTo('#w-worker', {{ opacity: 0, y: 140 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }}, T.workers - 0.6);
  tl.fromTo('#w-shield', {{ opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)', immediateRender: false }}, T.workers);
  tl.to(['#w-shield'], {{ opacity: 0, duration: 0.3 }}, T.only + 1.0);
  // hybrid: house islands from the grid (switch opens), inverter back on, lights on
  tl.fromTo('#w-switch', {{ opacity: 0, rotation: 0 }}, {{ opacity: 1, rotation: -55, duration: 0.4, ease: 'back.out(2)', immediateRender: false }}, T.hybrid);
  tl.to('#w-inv-off', {{ opacity: 0, duration: 0.2 }}, T.hybrid);
  tl.to('#w-inv-led', {{ attr: {{ fill: '#2ECC71' }}, duration: 0.1 }}, T.hybrid);
  tl.to('#w-lampglow', {{ opacity: 1, duration: 0.3 }}, T.keep + 0.4);
  tl.to('#w-bulb', {{ attr: {{ fill: '#FFE066' }}, duration: 0.2 }}, T.keep + 0.4);
  tl.to('#w-fridge-led', {{ attr: {{ fill: '#2ECC71' }}, duration: 0.2 }}, T.keep + 0.4);
  tl.to('#w-ac1air', {{ opacity: 1, duration: 0.3 }}, T.keep + 0.4);
  tl.to('#w-worker', {{ opacity: 0, duration: 0.3 }}, T.know);
  tl.fromTo('#w-end', {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', immediateRender: false }}, T.know);

  // ---------- HUD bars (fractions of 720 px) ----------
  const BAR = 720, X0 = 200;
  tl.fromTo('#w-hud', {{ opacity: 0, y: -40 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', immediateRender: false }}, T.plug);
  const bar = (id, t, f, d = 0.5) => tl.to(id, {{ attr: {{ width: BAR * f }}, duration: d, ease: 'power2.inOut' }}, t);
  const at = (id, t, x0f, f, d = 0.5) => tl.to(id, {{ attr: {{ x: X0 + BAR * x0f, width: BAR * f }}, duration: d, ease: 'power2.inOut' }}, t);
  bar('#h-sun', T.plug + 0.2, 0.55); tl.fromTo('#h-suntext', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.plug + 0.5); bar('#h-use', T.plug + 0.3, 0.45);
  bar('#h-use', T.ac2, 0.75);
  at('#h-grid', T.grid - 0.2, 0.55, 0.0, 0.01); at('#h-grid', T.grid, 0.55, 0.20, 0.6);
  tl.fromTo('#h-gridtext', {{ opacity: 0, attr: {{ x: X0 + BAR * 0.57 }} }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.grid + 0.3);
  // more panels: sun wants 0.9 but the inverter caps it at 0.65
  tl.set('#h-limit', {{ attr: {{ transform: `translate(${{X0 + BAR * 0.65}},0)` }} }}, T.addp);
  tl.fromTo('#h-limit', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.addp + 0.4);
  bar('#h-sun', T.addp + 0.4, 0.65);
  at('#h-clip', T.addp + 0.4, 0.65, 0.0, 0.01); at('#h-clip', T.addp + 0.5, 0.65, 0.25, 0.5);
  at('#h-grid', T.addp + 0.4, 0.65, 0.10, 0.5);
  tl.to('#h-gridtext', {{ opacity: 0, duration: 0.2 }}, T.addp + 0.4);
  // bigger inverter: the limit moves up, the cap disappears, no grid needed
  tl.to('#h-limit', {{ attr: {{ transform: `translate(${{X0 + BAR * 0.93}},0)` }}, duration: 0.6, ease: 'power2.inOut' }}, T.bigger);
  at('#h-clip', T.bigger, 0.9, 0.0, 0.6); bar('#h-sun', T.bigger, 0.9, 0.6); at('#h-grid', T.bigger, 0.9, 0.0, 0.4);
  tl.to('#h-limittext', {{ scale: 1.25, transformOrigin: '50% 100%', duration: 0.25, yoyo: true, repeat: 3 }}, T.limits);
  // noon: use drops, extra goes to the grid
  bar('#h-use', T.noon + 0.2, 0.45);
  tl.fromTo('#h-extratext', {{ opacity: 0, attr: {{ x: X0 + BAR * 0.47 }} }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.extra);
  tl.to('#h-extratext', {{ opacity: 0, duration: 0.2 }}, T.night);
  tl.to('#w-hud', {{ opacity: 0, duration: 0.3 }}, T.meter - 0.6);
  tl.to('#w-hud', {{ opacity: 1, duration: 0.3 }}, T.night + 0.3);
  // night: sun 0; battery covers, then grid
  bar('#h-sun', T.stop, 0.0, 0.6); tl.to('#h-suntext', {{ opacity: 0, duration: 0.2 }}, T.stop); tl.to('#h-limit', {{ opacity: 0, duration: 0.3 }}, T.stop);
  at('#h-grid', T.stop, 0, 0.0, 0.01); at('#h-grid', T.stop + 0.05, 0, 0.45, 0.5);
  tl.to('#h-gridtext', {{ opacity: 1, attr: {{ x: X0 + 20 }}, duration: 0.3 }}, T.stop + 0.4);
  at('#h-grid', T.bat, 0, 0.0, 0.4); tl.to('#h-gridtext', {{ opacity: 0, duration: 0.2 }}, T.bat);
  at('#h-bat', T.bat, 0, 0.45, 0.6);
  tl.fromTo('#h-battext', {{ opacity: 0, attr: {{ x: X0 + 20 }} }}, {{ opacity: 1, duration: 0.3, immediateRender: false }}, T.bat + 0.4);
  at('#h-bat', T.without, 0, 0.0, 0.4); tl.to('#h-battext', {{ opacity: 0, duration: 0.2 }}, T.without);
  at('#h-grid', T.pull - 0.05, 0, 0.0, 0.01); at('#h-grid', T.pull, 0, 0.45, 0.5);
  tl.to('#h-gridtext', {{ opacity: 1, attr: {{ x: X0 + 20 }}, duration: 0.3 }}, T.pull + 0.3);
  tl.to('#w-hud', {{ opacity: 0, y: -40, duration: 0.3, ease: 'power3.in' }}, T.blackout - 0.4);

  // ---------- energy dots: one proxy tween drives every dot from timeline time ----------
  const geo = FLOWS.map((f) => {{
    const P = f.pts, L = [0];
    for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const els = []; for (let k = 0; k < f.n; k++) els.push(document.getElementById(f.id + '-' + k));
    return {{ f, P, L, tot: L[L.length - 1], els }};
  }});
  const pointAt = (g, d) => {{
    d = Math.max(0, Math.min(g.tot, d));
    for (let i = 1; i < g.P.length; i++) if (d <= g.L[i]) {{ const q = (d - g.L[i - 1]) / Math.max(1e-6, g.L[i] - g.L[i - 1]); return [g.P[i - 1][0] + (g.P[i][0] - g.P[i - 1][0]) * q, g.P[i - 1][1] + (g.P[i][1] - g.P[i - 1][1]) * q]; }}
    return g.P[g.P.length - 1];
  }};
  const env = (t, on) => {{ let a = 0; for (const [t0, t1] of on) a = Math.max(a, Math.min(1, (t - t0) / 0.3, (t1 - t) / 0.3)); return Math.max(0, a); }};
  function drawDots(t) {{
    for (const g of geo) {{
      const a = env(t, g.f.on);
      g.els.forEach((el, k) => {{
        if (a <= 0) {{ el.setAttribute('opacity', 0); return; }}
        let d;
        if (g.f.kind === 'dc') d = ((t * 120 + k * g.tot / g.f.n) % g.tot);
        else {{ const sp = g.tot / g.f.n; d = ((k + 0.5) * sp + (g.f.drift ? (t * 22) % sp : 0)) % g.tot + 11 * Math.sin(t * Math.PI * 2 * 1.6); }}
        const [x, y] = pointAt(g, d);
        const edge = Math.min(1, d / 18, (g.tot - d) / 18);
        el.setAttribute('cx', x.toFixed(1)); el.setAttribute('cy', y.toFixed(1)); el.setAttribute('opacity', (a * Math.max(0, edge)).toFixed(3));
      }});
    }}
  }}
  const proxy = {{ t: 0 }};
  tl.fromTo(proxy, {{ t: 0 }}, {{ t: DUR, duration: DUR, ease: 'none', immediateRender: false, onUpdate: () => drawDots(proxy.t) }}, 0);
  drawDots(0);
  window.__timelines['world'] = tl;
}})();
'''

def caption_groups():
    groups, cur = [], []
    for k, w in enumerate(WORDS):
        cur.append(w)
        nxt = WORDS[k + 1] if k + 1 < len(WORDS) else None
        end_sent = w['w'][-1] in '.?!,'
        gap = (nxt['s'] - w['e']) if nxt else 1
        if end_sent or gap >= 0.15 or len(cur) >= 5 or nxt is None:
            if len(cur) == 1 and groups and not end_sent and nxt is not None:
                continue
            groups.append(cur); cur = []
    if cur: groups.append(cur)
    return groups

EMPH = {'panels', 'direct', 'alternating', 'inverter', 'inverter,', 'breaker', 'grid', 'grid,', 'grid.', 'battery', 'blackout?', 'hybrid', 'two-way', 'meter', 'night'}

def captions_html():
    gs = caption_groups()
    parts, js = [], []
    for gi, g in enumerate(gs):
        t0 = max(0.15, g[0]['s'] - 0.05)
        t1 = gs[gi + 1][0]['s'] - 0.05 if gi + 1 < len(gs) else DUR - 0.05
        t1 = min(t1, g[-1]['e'] + 0.9)
        spans = []
        for wi, w in enumerate(g):
            word = html.escape(w['w'])
            core = w['w'].lower().strip('.,?!')
            em = core in {e.strip('.,?!') for e in EMPH}
            style = 'color:var(--accent)' if em else ''
            spans.append(f'<span class="cw" id="cw-{gi}-{wi}" style="{style}">{word}</span>')
        parts.append(f'<div id="cg-{gi}" class="clip cgroup" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}"><div class="cin" id="cgi-{gi}">{" ".join(spans)}</div></div>')
        js.append(f"tl.fromTo('#cgi-{gi}', {{opacity:0, y:14}}, {{opacity:1, y:0, duration:0.14, ease:'power3.out', immediateRender:false}}, {t0:.3f});")
        for wi, w in enumerate(g):
            js.append(f"tl.fromTo('#cw-{gi}-{wi}', {{opacity:0.62}}, {{opacity:1, duration:0.08, immediateRender:false}}, {max(t0, w['s']):.3f});")
        js.append(f"tl.to('#cgi-{gi}', {{opacity:0, duration:0.1, ease:'power2.in'}}, {t1 - 0.1:.3f});")
    return f'''<template>
<style>
  #root {{ position:absolute; inset:0; --accent:{ACCENT}; }}
  .cgroup {{ position:absolute; left:0; top:1165px; width:1080px; height:170px; display:flex; align-items:center; justify-content:center; overflow:visible; }}
  .cin {{ max-width:900px; text-align:center; font-family:Inter; font-weight:900; font-size:62px; line-height:1.12; color:#FFFFFF;
         padding:14px 28px; border-radius:22px; background:rgba(12,18,40,0.72); }}
  .cw {{ display:inline-block; }}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-layout-allow-overlap>
{chr(10).join(parts)}
</div>
<script>
  const tl = gsap.timeline({{ paused: true }});
  {chr(10).join(js)}
  window.__timelines['captions'] = tl;
</script>
</template>'''

def index_html():
    return f'''<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0D1B3D; }}
      body {{ font-family: "Inter", sans-serif; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
      <div id="world" data-composition-id="world" data-composition-src="compositions/world.html" data-start="0" data-duration="{DUR}"
           data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{DUR}"
           data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:5"></div>
      <audio id="a-roll-audio" src="assets/voz.wav" data-start="0" data-duration="{DUR}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'compositions'), exist_ok=True)
    w = world_html()
    open(os.path.join(HERE, 'compositions', 'world.html'), 'w').write(w)
    open(os.path.join(HERE, 'compositions', 'captions.html'), 'w').write(captions_html())
    open(os.path.join(HERE, 'index.html'), 'w').write(index_html())
    print('ok', len(caption_groups()), 'caption groups')

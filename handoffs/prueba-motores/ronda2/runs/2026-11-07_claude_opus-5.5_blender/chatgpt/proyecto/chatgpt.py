# Ronda 2 · tema 2: cómo ChatGPT elige la siguiente palabra. Estudio 3D oscuro con fichas de token, «ciudad» de probabilidades,
# gráfico de barras, dado con peso y frase que se construye y se bifurca. La cámara viaja entre estaciones.
# Uso: Blender -b -P chatgpt.py -- [--stills ...] [--anim] [--out DIR] [--save x.blend]
import bpy, json, math, os, sys, random
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lib3d import *

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
KIT = os.path.join(HERE, 'kit', 'chatgpt')
WD = json.load(open(os.path.join(KIT, 'tiempos.json'))); W = WD['palabras']
NF = int(math.ceil(WD['duracion_s'] * FPS - 1e-6))
wi = lambda i: W[i]['s']
TM = dict(different=wi(5), twice=wi(14), never=wi(17), looks=wi(18), writes=wi(23), one=wi(24), piece=wi(25), at=wi(26), a=wi(27), time=wi(28),
          first=wi(29), message=wi(31), cut=wi(33), tokens=wi(38), model=wi(41), scores=wi(42), every=wi(43), over=wi(47), probability=wi(58),
          after=wi(62), sky=wi(64), blue=wi(66), clear=wi(71), falling=wi(74), zero=wi(76), but=wi(77), top=wi(83), rolls=wi(86), dice=wi(88),
          likely=wi(90), win=wi(93), sometimes=wi(95), sneaks=wi(100), chosen=wi(103), added=wi(106), text=wi(109), repeats=wi(114),
          done=wi(119), so=wi(120), roll=wi(123), drift=wi(130), apart=wi(131), know=wi(132), end=WD['duracion_s'])
sc = setup(NF, samples=10)
random.seed(7)

# ── look: dark studio ──
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True; nt = world.node_tree; nt.nodes.clear(); N = nt.nodes.new; Lk = nt.links.new
out = N('ShaderNodeOutputWorld'); bg = N('ShaderNodeBackground'); tc = N('ShaderNodeTexCoord'); sep = N('ShaderNodeSeparateXYZ'); ramp = N('ShaderNodeValToRGB')
Lk(tc.outputs['Generated'], sep.inputs[0]); Lk(sep.outputs['Z'], ramp.inputs[0]); Lk(ramp.outputs[0], bg.inputs[0]); Lk(bg.outputs[0], out.inputs[0])
ramp.color_ramp.elements[0].color = (*srgb('#1A1F4D'), 1); ramp.color_ramp.elements[1].color = (*srgb('#05060F'), 1)
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[1].position = 0.8; bg.inputs[1].default_value = 1.0
key_l = bpy.data.lights.new('key', 'AREA'); key_l.energy = 900; key_l.size = 8; ko = bpy.data.objects.new('key', key_l); sc.collection.objects.link(ko)
ko.location = (6, -10, 12); ko.rotation_euler = (math.radians(45), 0, math.radians(30))
key_l2 = bpy.data.lights.new('rim', 'SUN'); key_l2.energy = 1.4; key_l2.color = srgb('#9AA8FF'); r2 = bpy.data.objects.new('rim', key_l2); sc.collection.objects.link(r2)
r2.rotation_euler = (math.radians(60), 0, math.radians(-140))
floor = box('floor', (-30, -30, -0.2), (90, 40, 0.0), mat('floor', srgb('#0E1230'), 0.95, spec=0.03))

PAL = [srgb(h) for h in ('#9B7BFF', '#2EC4B6', '#FF9F45', '#FF6FA8', '#7BD389', '#4D9DFF')]
WHITE, INK = srgb('#F4F6FB'), srgb('#0C1220')
TXTW, TXTD = mat('txtw', WHITE, 0.4, emit=0.4), mat('txtd', INK, 0.5)

def tile(name, txt, pos, color, size=0.42, depth=0.22, pad=0.22, tm=None):
    """rounded token tile in the XZ plane (faces -Y) with its text; returns (tile, text, width)"""
    t = text3d(name + '_t', txt, size=size, extrude=0.015, m=tm or TXTD, loc=(0, 0, 0)); bpy.context.view_layer.update()
    w = max(t.dimensions.x + pad * 2, size * 1.6); h = size * 1.75
    o = bbox(name, (w, depth, h), mat(name + 'M', color, 0.35, emit=0.15), bevel=0.08)
    o.location = pos; t.parent = o; t.location = (0, -depth / 2 - 0.02, -size * 0.05); return o, t, w

def pop(o, t0, s1=1.0, dur=0.35):                  # scale 0 → overshoot → 1 at t0
    o.scale = (0, 0, 0); o.keyframe_insert('scale', frame=1); o.keyframe_insert('scale', frame=max(1, F(t0)))
    o.scale = (s1 * 1.15,) * 3; o.keyframe_insert('scale', frame=F(t0 + dur * 0.6)); o.scale = (s1,) * 3; o.keyframe_insert('scale', frame=F(t0 + dur))
def drop(o, t0, s0=1.0, dur=0.3):
    o.keyframe_insert('scale', frame=F(t0)); o.scale = (0, 0, 0); o.keyframe_insert('scale', frame=F(t0 + dur))

# ════ STATION 1 (x≈0): the same question twice, two different answers, built token by token ════
PANEL = mat('panel', srgb('#1C2244'), 0.4, emit=0.05); BUB = srgb('#E9ECF5')
for k, z in enumerate((5.0, 1.9)):
    p = bbox(f'chat{k}', (4.0, 0.25, 2.5), PANEL, bevel=0.15); p.location = (0, 0.33, z)
    q, _, _ = tile(f'q{k}', 'Name my bakery', (0.6, 0, z + 0.62), BUB, size=0.36)
    pop(q, 0.2 + k * 0.25)
    toks = (['Golden', ' Crust'], ['Rise', ' &', ' Shine'])[k]; x = -1.65
    for j, tk in enumerate(toks):
        o, t, w = tile(f'a{k}{j}', tk.strip(), (0, 0, z - 0.4), PAL[(j + 2 * k) % 6], size=0.42)
        o.location.x = x + w / 2; x += w + 0.08
        pop(o, TM['different'] - 0.1 + j * 0.28 + k * 0.12)
    drop(p, TM['never'] - 0.3, dur=0.35); drop(q, TM['never'] - 0.4)
    for j in range(len(toks)): drop(bpy.data.objects[f'a{k}{j}'], TM['never'] - 0.4)

# ── "never looks up an answer": a database stack (gets crossed in 2D), then "one piece at a time" ──
DB = mat('db', srgb('#6C7393'), 0.4, metal=0.3, emit=0.1)
db = bpy.data.objects.new('db', None); link(db); db.location = (0, 0, 3.6)
for k in range(3):
    c = cyl(f'db{k}', 0.95, 0.42, (0, 0, -0.55 + k * 0.55), m=DB); c.parent = db
pop(db, TM['never'] - 0.1); drop(db, TM['writes'] - 0.1)
x = -2.1
for j, (tk, tt) in enumerate((('one', TM['one']), ('piece', TM['piece']), ('at', TM['at']), ('a', TM['a']), ('time', TM['time']))):
    o, t, w = tile(f'p{j}', tk, (0, 0, 3.4), PAL[j % 6], size=0.36); o.location.x = x + w / 2; x += w + 0.1
    pop(o, tt - 0.05); drop(o, TM['first'] + 0.4)

# ════ STATION 2 (x≈10): the message is cut into tokens ════
SX = 10.0
MSG = ['Why', ' is', ' the', ' sky', ' blue', '?']
msg_tiles = []; widths = []
for j, tk in enumerate(MSG):
    o, t, w = tile(f'm{j}', tk.strip(), (0, 0, 3.6), WHITE, size=0.4, pad=0.12); msg_tiles.append(o); widths.append(w)
tot = sum(widths); x = SX - tot / 2
for j, o in enumerate(msg_tiles):          # joined (one slab) → cut apart (gaps) + coloured
    xj = x + widths[j] / 2; x += widths[j]
    o.location.x = xj; o.keyframe_insert('location', frame=F(TM['cut'] - 0.05))
    o.location.x = SX + (xj - SX) * 1.0 + (j - (len(MSG) - 1) / 2) * 0.28; o.keyframe_insert('location', frame=F(TM['cut'] + 0.45))
    pop(o, TM['message'] - 0.25 + j * 0.03)
    m = o.data.materials[0]; key_input(m, 'Base Color', [(TM['cut'] + 0.1, WHITE), (TM['cut'] + 0.5 + j * 0.05, PAL[j % 6])])
laser = bbox('laser', (0.03, 0.03, 1.9), mat_emit('laserM', srgb('#FF3B6B'), 8)); laser.location = (SX, -0.4, 3.6)
for j, t in enumerate((TM['cut'] - 0.05, TM['cut'] + 0.45)):
    laser.location.x = (SX - tot / 2 - 0.3) if j == 0 else (SX + tot / 2 + 0.3); laser.keyframe_insert('location', frame=F(t))
vis(laser, [(TM['cut'] - 0.05, TM['cut'] + 0.5)])

# ════ STATION 3 (x≈10, behind, on the floor): every token it knows gets a score ════
CITY = (SX, 9.0); NXY = 26; GAP = 0.42
cm = [mat(f'city{k}', PAL[k], 0.4, emit=0.25) for k in range(6)]
base_me = None; city = []
for ix in range(NXY):
    for iy in range(NXY):
        x = CITY[0] + (ix - NXY / 2) * GAP; y = CITY[1] + (iy - NXY / 2) * GAP
        if base_me is None:
            o = bbox('cell', (0.34, 0.34, 1.0), cm[0], origin='bottom'); base_me = o.data; o.location = (x, y, 0)
        else:
            o = bpy.data.objects.new(f'cell{ix}_{iy}', base_me); link(o); o.location = (x, y, 0)
        o.material_slots[0].link = 'OBJECT'; o.material_slots[0].material = cm[(ix * 7 + iy * 3) % 6]
        r1, r2 = random.random(), random.random() ** 6
        o.scale = (1, 1, 0.001); o.keyframe_insert('scale', frame=1); o.keyframe_insert('scale', frame=F(TM['scores'] - 0.1 + random.random() * 0.6))
        o.scale = (1, 1, 0.15 + 1.6 * r1); o.keyframe_insert('scale', frame=F(TM['every'] + 0.5 + random.random() * 0.3))
        o.scale = (1, 1, 0.04 + 2.6 * r2); o.keyframe_insert('scale', frame=F(TM['probability'] + 0.1 + random.random() * 0.3))
        city.append(o)

# ════ STATION 4 (x≈22): "The sky is" → blue 60 %, clear 20 %, falling ≈ 0 %, others 20 % ════
BX = 22.0
ctx_tiles = []; x = BX - 2.3
for j, tk in enumerate(('The', 'sky', 'is')):
    o, t, w = tile(f'c{j}', tk, (0, 0, 4.9), PAL[j], size=0.42); o.location.x = x + w / 2; x += w + 0.1
    pop(o, (TM['after'], TM['sky'] - 0.25, TM['sky'] + 0.25)[j]); ctx_tiles.append(o)
CTX_END = x
BARS = [('blue', 0.60, srgb('#4D9DFF'), TM['blue']), ('clear', 0.20, srgb('#9FE3FF'), TM['clear']),
        ('falling', 0.004, srgb('#FF6F61'), TM['falling']), ('others', 0.20, srgb('#6C7393'), TM['zero'] + 0.2)]
BAR_H = 6.0; bars = []
for j, (nm, p, colr, tt) in enumerate(BARS):
    bx = BX - 1.95 + j * 1.3
    m = mat(f'bar{nm}', colr, 0.3, emit=0.3, emit_col=colr)
    b = bbox(f'bar_{nm}', (1.0, 1.0, 1.0), m, origin='bottom'); b.location = (bx, 0.6, 0.0)
    h = max(0.05, BAR_H * p)
    b.scale = (1, 1, 0.001); b.keyframe_insert('scale', frame=1); b.keyframe_insert('scale', frame=F(tt - 0.1))
    b.scale = (1, 1, h); b.keyframe_insert('scale', frame=F(tt + 0.45))
    lab, _, _ = tile(f'bl_{nm}', nm, (bx, -0.1, -0.0), colr, size=0.3, depth=0.12, pad=0.08); lab.location.z = 0.32; lab.location.y = -0.05
    pop(lab, tt - 0.1)
    bars.append((b, m, bx, h))
# selection: "doesn't always pick the top one" → weighted dice → blue wins, then clear sneaks in
blue_m, clear_m = bars[0][1], bars[1][1]
key_input(blue_m, 'Emission Strength', [(TM['likely'], 0.3), (TM['likely'] + 0.3, 2.5), (TM['sometimes'] - 0.2, 2.5), (TM['sometimes'] + 0.1, 0.3)])
key_input(clear_m, 'Emission Strength', [(TM['sneaks'] - 0.3, 0.3), (TM['sneaks'] + 0.1, 1.6), (TM['chosen'] + 0.6, 1.6), (TM['chosen'] + 0.9, 0.3)])
# the weighted die (two rolls): tumbles in front of the chart
DIE = mat('die', srgb('#F7F7F2'), 0.3); PIP = mat('pip', srgb('#E8402A'), 0.4)
die = bbox('die', (1.1, 1.1, 1.1), DIE, bevel=0.14)
pips = {(0, 0, 1): [(0, 0)], (0, 0, -1): [(-.25, -.25), (.25, .25), (-.25, .25), (.25, -.25), (0, 0), (0, .25)], (1, 0, 0): [(-.22, -.22), (.22, .22)],
        (-1, 0, 0): [(-.22, -.22), (0, 0), (.22, .22)], (0, 1, 0): [(-.22, -.22), (.22, .22), (-.22, .22), (.22, -.22)], (0, -1, 0): [(-.22, -.22), (.22, .22), (-.22, .22), (.22, -.22), (0, 0)]}
for (nx, ny, nz), pts in pips.items():
    for (a, b) in pts:
        if nz: p = (a, b, 0.56 * nz)
        elif nx: p = (0.56 * nx, a, b)
        else: p = (a, 0.56 * ny, b)
        s = sphere(f'pip{nx}{ny}{nz}{a}{b}', 0.085, p, PIP, seg=12); s.parent = die
DX, DY = BX - 3.0, -1.6
rolls = [(TM['rolls'] - 0.1, TM['dice'] + 0.55), (TM['sometimes'] - 0.35, TM['sometimes'] + 0.6)]
die.location = (DX, DY, -2); die.keyframe_insert('location', frame=1)
for k, (t0, t1) in enumerate(rolls):
    die.location = (DX - 2.0, DY, 3.2); die.keyframe_insert('location', frame=F(t0))
    die.rotation_euler = (0, 0, 0); die.keyframe_insert('rotation_euler', frame=F(t0))
    die.location = (DX - 0.6, DY, 0.6); die.keyframe_insert('location', frame=F(t0 + (t1 - t0) * 0.45))
    die.location = (DX + 0.1, DY, 1.0); die.keyframe_insert('location', frame=F(t0 + (t1 - t0) * 0.7))
    die.location = (DX + 0.4, DY, 0.56); die.keyframe_insert('location', frame=F(t1))
    die.rotation_euler = (math.radians(450 + 90 * k), math.radians(270), math.radians(180)); die.keyframe_insert('rotation_euler', frame=F(t1))
    die.keyframe_insert('location', frame=F(t1 + (0.5 if k == 0 else 0.3)))
die.location = (DX + 0.4, DY, -2); die.keyframe_insert('location', frame=F(TM['chosen'] + 0.3))

# ════ STATION 5 (x≈34): the chosen token is added, the process repeats, then two answers drift apart ════
SX5 = 34.0
row = []; x = SX5 - 3.4
for j, tk in enumerate(('The', 'sky', 'is')):
    o, t, w = tile(f's{j}', tk, (0, 0, 5.6), PAL[j], size=0.42); o.location.x = x + w / 2; x += w + 0.1; pop(o, TM['chosen'] - 0.4); row.append(o)
X_AFTER_IS = x
# answer 1 (top): clear → today → .  (the "repeat" loop, one token at a time)
seq1 = [('clear', TM['added'] - 0.15, srgb('#9FE3FF')), ('today', TM['repeats'] + 0.05, PAL[4]), ('.', TM['done'] - 0.1, PAL[2])]
x = X_AFTER_IS
for j, (tk, tt, colr) in enumerate(seq1):
    o, t, w = tile(f'r1_{j}', tk, (0, 0, 5.6), colr, size=0.42); xe = x + w / 2; x += w + 0.1
    o.location = (xe, -1.5, 7.5); o.keyframe_insert('location', frame=F(tt - 0.2)); o.location = (xe, 0, 5.6); o.keyframe_insert('location', frame=F(tt + 0.25)); pop(o, tt - 0.2)
    # drift: the first answer rises
    o.keyframe_insert('location', frame=F(TM['so'])); o.location = (xe, 0, 6.6); o.keyframe_insert('location', frame=F(TM['apart'] + 0.2))
# mini candidate bars for the repeat (quick, small)
for k, (tt, cands) in enumerate(((TM['text'] + 0.1, (0.45, 0.3, 0.15)), (TM['repeats'] + 0.45, (0.7, 0.2, 0.1)))):
    for j, p in enumerate(cands):
        b = bbox(f'mini{k}{j}', (0.4, 0.4, 1.0), mat(f'mini{k}{j}M', PAL[(j + 3) % 6], 0.4, emit=0.4), origin='bottom')
        b.location = (SX5 + 2.2 + j * 0.55, 0.4, 2.6); b.scale = (1, 1, 0.001); b.keyframe_insert('scale', frame=1); b.keyframe_insert('scale', frame=F(tt))
        b.scale = (1, 1, 2.2 * p); b.keyframe_insert('scale', frame=F(tt + 0.3)); b.keyframe_insert('scale', frame=F(tt + 1.0)); b.scale = (1, 1, 0.001); b.keyframe_insert('scale', frame=F(tt + 1.3))
# answer 2 (bottom): one different roll early on → blue → and → bright
seq2 = [('blue', TM['different'] + 0, srgb('#4D9DFF')), ('and', 0, PAL[0]), ('bright', 0, PAL[3]), ('.', 0, PAL[2])]
x = X_AFTER_IS
for j, (tk, _, colr) in enumerate(seq2):
    o, t, w = tile(f'r2_{j}', tk, (0, 0, 5.6), colr, size=0.42); xe = x + w / 2; x += w + 0.1
    tt = TM['roll'] - 0.1 + j * 0.35; o.location = (xe, 0, 5.6); pop(o, tt)
    o.keyframe_insert('location', frame=F(tt)); o.location = (xe, 0, 4.5); o.keyframe_insert('location', frame=F(TM['apart'] + 0.2))
# ghost copy of "The sky is" for the second branch (the two answers share the start)
for j, src in enumerate(row):
    g = src.copy(); g.data = src.data; g.name = f'g{j}'; link(g)
    for ch in src.children:
        c2 = ch.copy(); c2.data = ch.data; c2.parent = g; link(c2)
    g.animation_data_clear(); g.location = src.location.copy(); g.scale = (0, 0, 0); g.keyframe_insert('scale', frame=1); g.keyframe_insert('scale', frame=F(TM['so']))
    g.scale = (1, 1, 1); g.keyframe_insert('scale', frame=F(TM['so'] + 0.3)); g.keyframe_insert('location', frame=F(TM['so']))
    g.location.z = 4.5; g.keyframe_insert('location', frame=F(TM['apart'] + 0.2))
    src.keyframe_insert('location', frame=F(TM['so'])); src.location.z = 6.6; src.keyframe_insert('location', frame=F(TM['apart'] + 0.2))
# branch rails (fork line)
RAIL = mat_emit('rail', srgb('#FFD23F'), 3.0)
# (the split is drawn in the 2D layer: fork arrow + ANSWER 1 / ANSWER 2)

# ── camera ──
CAM = [(0.0, (0.2, -7.6, 3.5), (0, 0, 3.45)), (TM['twice'], (-0.5, -7.2, 3.7), (0, 0, 3.45)),
       (TM['never'] + 0.2, (0.5, -7.4, 3.7), (0, 0, 3.5)), (TM['time'] + 0.3, (-0.2, -7.0, 3.6), (0, 0, 3.45)),
       (TM['first'] + 0.4, (SX - 0.4, -10.4, 4.1), (SX, 0, 3.6)), (TM['tokens'] + 0.3, (SX + 0.5, -10.0, 3.9), (SX, 0, 3.6)),
       (TM['scores'] + 0.2, (SX + 4.5, -1.8, 9.6), (SX, 8.0, 0.4)), (TM['probability'] + 0.6, (SX - 4.0, -1.0, 8.8), (SX, 8.6, 0.6)),
       (TM['after'] + 0.2, (BX + 0.1, -9.4, 3.1), (BX + 0.2, 0, 2.6)), (TM['zero'] + 0.3, (BX + 0.4, -9.2, 3.0), (BX + 0.2, 0, 2.5)),
       (TM['rolls'] - 0.2, (BX - 0.4, -10.0, 2.8), (BX - 0.55, -0.6, 2.2)), (TM['sneaks'] + 0.4, (BX - 0.8, -10.2, 3.0), (BX - 0.55, -0.6, 2.3)),
       (TM['chosen'] + 0.1, (SX5 - 0.4, -9.4, 5.6), (SX5 - 0.4, 0, 5.4)), (TM['done'] + 0.2, (SX5 + 0.2, -9.2, 5.6), (SX5 - 0.2, 0, 5.4)),
       (TM['apart'] + 0.4, (SX5 + 0.4, -12.6, 5.6), (SX5 + 0.2, 0, 5.5)), (TM['end'] + 0.1, (SX5 + 0.9, -13.2, 5.7), (SX5 + 0.2, 0, 5.5))]
camera(CAM, lens=30)

# ── anchors for the 2D layer ──
ANCH = {'db': (0, -0.9, 3.6), 'msg': (SX, -0.2, 3.6), 'city': (CITY[0], CITY[1], 1.5)}
for b, m, bx, h in bars: ANCH['bar_' + b.name[4:]] = (bx, 0.1, h + 0.25)
ANCH['row1'] = (SX5 + 1.6, 0, 6.6); ANCH['row2'] = (SX5 + 1.8, 0, 4.5); ANCH['die'] = (DX + 0.4, DY, 0.56)
project_anchors(ANCH, NF, os.path.join(HERE, 'proj_chatgpt.json'))
json.dump({'TM': TM, 'NF': NF}, open(os.path.join(HERE, 'tm_chatgpt.json'), 'w'))
render(HERE, argv, NF)

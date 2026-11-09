# Ronda 3 · cómo funciona un sistema solar residencial. Diorama 3D de juguete con la casa en corte (la mitad frontal derecha abierta),
# la energía como cuentas de colores (ámbar = corriente continua, en un sentido; cian = corriente alterna, oscila mientras avanza),
# día → mediodía → noche → apagón. Uso: Blender -b -P solar.py -- [--stills 1,2,...] [--scale 50] [--anim] [--out DIR] [--save x.blend]
import bpy, json, math, os, sys, bmesh
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lib3d import *

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
KIT = os.path.join(HERE, 'kit', 'solar')
WD = json.load(open(os.path.join(KIT, 'tiempos.json'))); W = WD['palabras']
NF = int(math.ceil(WD['duracion_s'] * FPS - 1e-6))
wi = lambda i: W[i]['s']
TM = dict(goes=wi(10), sunlight=wi(14), panels=wi(17), makes=wi(21), direct=wi(24), wired=wi(27), adds=wi(32), single=wi(38),
          house=wi(42), alternating=wi(45), cable2=wi(49), inverter=wi(53), converts=wi(57), dc2=wi(58), ac2=wi(61),
          from_=wi(63), breaker=wi(71), lights=wi(78), fridge=wi(80), aircon=wi(83), plug=wi(85), second=wi(91), aircon2=wi(92),
          cant=wi(98), grid=wi(102), covers=wi(104), runsun=wi(107), add=wi(114), morepanels=wi(116), bigger=wi(120), inv2=wi(121),
          limits=wi(125), once=wi(132), noon=wi(134), extra=wi(144), flowsout=wi(145), grid2=wi(149), twoway=wi(155), counts=wi(157),
          night=wi(160), stop=wi(163), own=wi(169), battery=wi(174), stores=wi(177), day=wi(182), without=wi(183), pull=wi(186),
          grid3=wi(189), blackout=wi(193), gridtied=wi(196), shuts=wi(198), protect=wi(202), workers=wi(204), only=wi(208),
          batteries=wi(209), hybrid=wi(212), inv3=wi(213), lightson=wi(216), know=wi(218), send=wi(223), end=WD['duracion_s'])
T = TM
sc = setup(NF, samples=8)
sc.eevee.use_shadows = True

C = {k: srgb(v) for k, v in dict(grass='#8DC27E', soil='#B98B5E', wall='#F4E6C8', wallin='#FBF3E2', floor='#D9C7A6', roof='#C9C2B8',
     trim='#C96F4A', door='#7A4E33', glassw='#2E4A66', alu='#C9CED6', panel='#1E3F8F', cellline='#D8E2F0', dark='#2A2F38',
     white='#F4F5F2', grey='#9AA3AD', wood='#8A6A48', trunk='#7B5A3C', leaf='#5FAE5A', leaf2='#78C26A', path='#E9DCC2',
     dc='#FFB020', ac='#3FD5FF', sun='#FFD54A', batt='#5A667E', green='#46E08A', red='#FF3B30', orange='#FF7A1A',
     hat='#FFD23F', vest='#FF8A1F', skin='#E7B892').items()}

# ── world (day / night / day) ──
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True; nt = world.node_tree; nt.nodes.clear(); N = nt.nodes.new; Lk = nt.links.new
out = N('ShaderNodeOutputWorld'); bg = N('ShaderNodeBackground'); tc = N('ShaderNodeTexCoord'); sep = N('ShaderNodeSeparateXYZ'); ramp = N('ShaderNodeValToRGB')
Lk(tc.outputs['Generated'], sep.inputs[0]); Lk(sep.outputs['Z'], ramp.inputs[0]); Lk(ramp.outputs[0], bg.inputs[0])
bgc = N('ShaderNodeBackground'); Lk(ramp.outputs[0], bgc.inputs[0]); bgc.inputs[1].default_value = 1.05
lp = N('ShaderNodeLightPath'); ms = N('ShaderNodeMixShader'); Lk(lp.outputs['Is Camera Ray'], ms.inputs[0]); Lk(bg.outputs[0], ms.inputs[1]); Lk(bgc.outputs[0], ms.inputs[2]); Lk(ms.outputs[0], out.inputs[0])
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[1].position = 0.85
SKY = {'day': (srgb('#BFE6FF'), srgb('#3F94E0')), 'noon': (srgb('#D8F1FF'), srgb('#2F86E0')), 'night': (srgb('#3A5288'), srgb('#121C3E')),
       'storm': (srgb('#C9D2DC'), srgb('#6D7F96'))}
def key_sky(t, which):
    for el, c in zip(ramp.color_ramp.elements, SKY[which]): el.color = (*c, 1); el.keyframe_insert('color', frame=F(t))
for t, w in ((0, 'day'), (T['noon'] - 0.4, 'day'), (T['noon'] + 0.4, 'noon'), (T['night'] - 0.5, 'noon'), (T['night'] + 0.5, 'night'),
             (T['blackout'] - 0.6, 'night'), (T['blackout'] + 0.1, 'storm')):
    key_sky(t, w)
for t, v in ((0, 0.55), (T['night'] - 0.5, 0.55), (T['night'] + 0.5, 0.35), (T['blackout'] - 0.6, 0.35), (T['blackout'] + 0.1, 0.5)):
    bg.inputs[1].default_value = v; bg.inputs[1].keyframe_insert('default_value', frame=F(t))

# ── lights ──
sunL = bpy.data.lights.new('sunL', 'SUN'); sunL.angle = math.radians(3); sunO = bpy.data.objects.new('sunL', sunL); sc.collection.objects.link(sunO)
def sun_rot(az, el): return (math.radians(90 - el), 0, math.radians(az))
for t, az, el in ((0, -35, 45), (T['noon'] - 0.4, -30, 50), (T['noon'] + 0.6, -10, 80), (T['night'] - 0.5, 20, 70), (T['night'] + 0.4, 60, 5),
                  (T['blackout'] - 0.6, 60, 5), (T['blackout'] + 0.1, -35, 45)):
    sunO.rotation_euler = sun_rot(az, el); sunO.keyframe_insert('rotation_euler', frame=F(t))
for t, e in ((0, 2.4), (T['noon'] - 0.4, 2.4), (T['noon'] + 0.6, 3.0), (T['night'] - 0.5, 2.8), (T['night'] + 0.4, 0.0),
             (T['blackout'] - 0.6, 0.0), (T['blackout'] + 0.1, 2.0)):
    sunL.energy = e; sunL.keyframe_insert('energy', frame=F(t))
moonL = bpy.data.lights.new('moonL', 'SUN'); moonL.color = srgb('#9DB8FF'); moonO = bpy.data.objects.new('moonL', moonL); sc.collection.objects.link(moonO)
moonO.rotation_euler = sun_rot(-50, 40)
for t, e in ((T['night'] - 0.3, 0.0), (T['night'] + 0.5, 2.0), (T['blackout'] - 0.6, 2.0), (T['blackout'] + 0.1, 0.0)):
    moonL.energy = e; moonL.keyframe_insert('energy', frame=F(t))
fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 110; fill.size = 12; fo = bpy.data.objects.new('fill', fill); sc.collection.objects.link(fo)
fo.location = (8, -12, 9); fo.rotation_euler = (math.radians(55), 0, math.radians(35))
for t, e in ((T['night'] - 0.3, 110), (T['night'] + 0.5, 75), (T['blackout'] - 0.6, 75), (T['blackout'] + 0.1, 110)):
    fill.energy = e; fill.keyframe_insert('energy', frame=F(t))
# warm interior light (follows whether the house has power)
room = bpy.data.lights.new('room', 'POINT'); room.color = srgb('#FFD9A0'); room.shadow_soft_size = 0.6; ro = bpy.data.objects.new('room', room)
sc.collection.objects.link(ro); ro.location = (1.2, -0.2, 2.5)
POWER_ON = [(T['lights'], T['blackout'] + 0.15), (T['hybrid'] + 0.2, T['end'] + 1)]
def key_power(setter, on_v, off_v):
    setter(off_v, 1)
    for a, b in POWER_ON: setter(off_v, F(a) - 1); setter(on_v, F(a) + 4); setter(on_v, F(b)); setter(off_v, F(b) + 3)
def set_room(v, f): room.energy = v; room.keyframe_insert('energy', frame=max(1, f))
key_power(set_room, 260, 0)

# ── diorama base ──
cyl('base', 18.0, 0.8, (1.5, 2, -0.4), m=mat('grass', C['grass'], 0.9), verts=96)
cyl('soil', 18.05, 1.6, (1.5, 2, -1.2), m=mat('soil', C['soil'], 0.95), verts=96)
box('path', (-1.6, -16, 0.0), (-0.9, -2.6, 0.03), mat('path', C['path'], 0.9))
for i, (x, y, s) in enumerate(((-6.5, 1.5, 1.2), (-5.0, -6.0, 0.85), (8.5, -6.0, 0.8), (-2.0, 6.5, 1.1), (9.0, 5.5, 1.0))):
    cyl(f'trunk{i}', 0.16 * s, 1.6 * s, (x, y, 0.8 * s), m=mat(f'tr{i}', C['trunk'], 0.9), verts=16)
    ico(f'leaf{i}', 1.15 * s, (x, y, 2.1 * s), m=mat(f'lf{i}', C['leaf'] if i % 2 else C['leaf2'], 0.85), sub=2)

# ── house (section view: front-right open) ──
WALL = mat('wall', C['wall'], 0.85); WIN = mat('wallin', C['wallin'], 0.9); TRIM = mat('trim', C['trim'], 0.7)
WINM = mat('win', C['glassw'], 0.2, emit=0.0, emit_col=srgb('#FFC66B'))
box('floor', (-3, -2.5, 0), (3, 2.5, 0.08), mat('floor', C['floor'], 0.8))
box('backwall', (-3, 2.35, 0), (3, 2.5, 3.0), WIN)
box('leftwall', (-3, -2.5, 0), (-2.85, 2.5, 3.0), WALL)
box('rightwall', (2.88, -2.5, 0), (3.03, 2.5, 3.0), WIN)
box('frontL', (-3, -2.5, 0), (-0.2, -2.35, 3.0), WALL)
box('ceiling', (-3, -2.5, 3.0), (3.03, 2.5, 3.1), WALL)
box('cuttrimV', (-0.22, -2.53, 0), (-0.14, -2.33, 3.1), TRIM)                     # orange edge where the house is "cut"
box('cuttrimH', (-0.22, -2.53, 3.02), (3.05, -2.4, 3.12), TRIM)
box('door', (-1.9, -2.53, 0), (-1.0, -2.48, 2.1), mat('door', C['door'], 0.7))
box('win0', (-2.7, -2.53, 1.2), (-2.1, -2.48, 2.2), WINM)
box('winR', (3.03, 0.6, 1.4), (3.06, 1.2, 2.3), WINM)
key_input(WINM, 'Emission Strength', [(0, 0.0), (T['night'] - 0.2, 0.0), (T['night'] + 0.5, 3.0), (T['blackout'] - 0.2, 3.0), (T['blackout'] + 0.1, 0.0),
                                      (T['hybrid'] + 0.2, 0.0), (T['hybrid'] + 0.6, 1.2)])
# gable wedge (roof rises toward the back)
def prism(name, poly_yz, x0, x1, m):
    bm = bmesh.new(); vs0 = [bm.verts.new((x0, y, z)) for y, z in poly_yz]; vs1 = [bm.verts.new((x1, y, z)) for y, z in poly_yz]
    bm.faces.new(vs0[::-1]); bm.faces.new(vs1)
    n = len(poly_yz)
    for i in range(n): bm.faces.new((vs0[i], vs0[(i + 1) % n], vs1[(i + 1) % n], vs1[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); link(o); o.data.materials.append(m); return o
prism('gable', [(-2.5, 3.1), (2.5, 3.1), (2.5, 4.5)], -3.0, 3.03, WALL)

# roof frame: origin at front edge, x across, y up the slope, z = roof normal
R0 = Vector((0, -2.75, 3.12)); SLOPE = math.atan2(1.55, 5.5); RM = Matrix.Rotation(SLOPE, 3, 'X')
def rw(x, y, z): return R0 + RM @ Vector((x, y, z))
roofE = bpy.data.objects.new('roofE', None); link(roofE); roofE.location = R0; roofE.rotation_euler = (SLOPE, 0, 0)
def rbox(name, lo, hi, m, bevel=0.0):
    o = box(name, lo, hi, m, bevel); o.parent = roofE; return o
ROOFM = mat('roofm', C['roof'], 0.8); ALU = mat('alu', C['alu'], 0.35, metal=0.8)
rbox('roofslab', (-3.3, -0.05, -0.18), (3.35, 5.75, 0.0), ROOFM, 0.02)
rbox('roofedge', (-3.3, -0.12, -0.2), (3.35, 0.0, 0.04), TRIM)

# panels (2 rows × 4, plus a third row that appears on "add more panels")
PANM = mat('panel', C['panel'], 0.25, metal=0.3, emit=0.0, emit_col=srgb('#5FA8FF'))
LINEM = mat('cells', C['cellline'], 0.5)
PROD = [(T['sunlight'] + 0.5, T['night'] - 0.2), (T['blackout'] + 0.2, T['end'] + 1)]     # panels in sun
key_input(PANM, 'Emission Strength', [(0, 0.0), (T['sunlight'], 0.0), (T['sunlight'] + 0.8, 0.35), (T['night'] - 0.3, 0.35), (T['night'] + 0.4, 0.0),
                                      (T['blackout'], 0.0), (T['blackout'] + 0.4, 0.3)])
COLX = [-2.1, -0.7, 0.7, 2.1]; ROWY = [(0.35, 1.45), (1.6, 2.7), (2.85, 3.95)]
PANEL_OBJ = []
def make_panel(name, cx, y0, y1):
    e = bpy.data.objects.new(name, None); link(e); e.parent = roofE; e.location = (cx, (y0 + y1) / 2, 0.14)
    def pb(n, lo, hi, m):
        o = box(n, lo, hi, m); o.parent = e; return o
    pb(name + 'b', (-0.62, -(y1 - y0) / 2, -0.03), (0.62, (y1 - y0) / 2, 0.03), PANM)
    for k in (-0.31, 0.0, 0.31): pb(name + f'v{k}', (k - 0.008, -(y1 - y0) / 2, 0.03), (k + 0.008, (y1 - y0) / 2, 0.036), LINEM)
    for k in (-(y1 - y0) / 6, (y1 - y0) / 6): pb(name + f'h{k:.2f}', (-0.62, k - 0.008, 0.03), (0.62, k + 0.008, 0.036), LINEM)
    pb(name + 'fr', (-0.64, -(y1 - y0) / 2 - 0.02, -0.04), (0.64, -(y1 - y0) / 2 + 0.02, 0.04), ALU)
    pb(name + 'leg', (-0.5, -0.05, -0.14), (0.5, 0.05, -0.03), ALU)
    return e
def grow(o, t0, dur=0.35, to=1.0):
    o.scale = (0.001, 0.001, 0.001); o.keyframe_insert('scale', frame=1); o.keyframe_insert('scale', frame=max(1, F(t0)))
    o.scale = (to * 1.12,) * 3; o.keyframe_insert('scale', frame=F(t0 + dur * 0.7))
    o.scale = (to,) * 3; o.keyframe_insert('scale', frame=F(t0 + dur))
for r, (y0, y1) in enumerate(ROWY):
    for c_, cx in enumerate(COLX):
        p = make_panel(f'pan{r}{c_}', cx, y0, y1); PANEL_OBJ.append(p)
        if r == 2: grow(p, T['add'] + 0.05 + c_ * 0.12, 0.4)
        else: grow(p, T['panels'] - 0.9 + (r * 4 + c_) * 0.07, 0.35)
# string wiring on the roof (row bottoms → right edge → junction)
WIREM = mat('wire', C['dark'], 0.5)
JUN = rw(3.0, 0.22, 0.06)
STR = [[rw(-2.75, y0 - 0.06, 0.06), rw(3.0, y0 - 0.06, 0.06), JUN] for (y0, y1) in ROWY]
for k, s in enumerate(STR):
    o = tube(f'string{k}', [tuple(v) for v in s], 0.03, WIREM)
    cu = o.data; t0 = T['wired'] if k < 2 else T['add'] + 0.5
    cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=1); cu.keyframe_insert('bevel_factor_end', frame=F(t0))
    cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(t0 + 0.8))
box('jbox', tuple(JUN - Vector((0.1, 0.1, 0.05))), tuple(JUN + Vector((0.1, 0.1, 0.08))), mat('jbm', C['dark'], 0.5))

# ── inverter on the right exterior wall ──
INVC = Vector((3.10, -0.6, 1.65))
invE = bpy.data.objects.new('invE', None); link(invE); invE.location = INVC
def ib(n, size, off, m, bevel=0.0):
    o = bbox(n, size, m, bevel=bevel); o.parent = invE; o.location = off; return o
ib('invBody', (0.14, 0.72, 0.92), (0, 0, 0), mat('invm', C['white'], 0.4), bevel=0.03)
SCRM = mat_emit('scr', C['ac'], 2.2)
ib('invScr', (0.02, 0.4, 0.22), (0.075, 0, 0.2), SCRM)
ib('invStripe', (0.02, 0.72, 0.07), (0.075, 0, -0.33), mat('stripe', C['orange'], 0.5))
LEDM = bpy.data.materials.new('led'); LEDM.use_nodes = True; ln = LEDM.node_tree; ln.nodes.clear()
lo_ = ln.nodes.new('ShaderNodeOutputMaterial'); le = ln.nodes.new('ShaderNodeEmission'); ln.links.new(le.outputs[0], lo_.inputs[0]); le.inputs[1].default_value = 4
def led(v, f): le.inputs[0].default_value = (*(C['green'] if v else C['red']), 1); le.inputs[0].keyframe_insert('default_value', frame=max(1, f))
led(1, 1); led(1, F(T['shuts']) - 1); led(0, F(T['shuts']) + 2); led(0, F(T['hybrid'])); led(1, F(T['hybrid']) + 3)
led_o = sphere('invLed', 0.045, (0, 0, 0), LEDM, seg=12); led_o.parent = invE; led_o.location = (0.08, -0.2, -0.1)
grow(invE, T['inverter'] - 0.15, 0.4)
invE.scale = (1, 1, 1); invE.keyframe_insert('scale', frame=F(T['bigger']))
invE.scale = (1.42, 1.42, 1.42); invE.keyframe_insert('scale', frame=F(T['bigger'] + 0.3)); invE.scale = (1.35, 1.35, 1.35); invE.keyframe_insert('scale', frame=F(T['bigger'] + 0.45))

# DC down-cable: junction → front-right roof corner → down the right wall → inverter top
DCDOWN = [JUN, rw(3.18, 0.05, 0.06), Vector((3.12, -2.6, 2.75)), Vector((3.12, -2.6, 2.45)), Vector((3.12, -0.6, 2.45)), Vector((3.12, -0.6, 2.12))]
o = tube('dccable', [tuple(v) for v in DCDOWN], 0.04, WIREM); cu = o.data
cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=1); cu.keyframe_insert('bevel_factor_end', frame=F(T['flows'] if 'flows' in T else T['single'] - 1.0))
cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(T['single'] + 0.6))

# ── breaker panel (inside, right wall) + loads ──
BRK = Vector((2.84, 1.2, 1.6))
brkE = bpy.data.objects.new('brkE', None); link(brkE); brkE.location = BRK
o = bbox('brk', (0.08, 0.52, 0.66), mat('brkm', C['grey'], 0.4, metal=0.5), bevel=0.02); o.parent = brkE
for k in range(4):
    s = bbox(f'brkSw{k}', (0.02, 0.32, 0.06), mat_emit(f'sw{k}', C['ac'], 1.2)); s.parent = brkE; s.location = (-0.05, 0, 0.22 - k * 0.14)
grow(brkE, T['breaker'] - 0.15, 0.4)
AC1W = [INVC + Vector((-0.08, 0, -0.1)), Vector((2.95, -0.6, 1.55)), Vector((2.84, -0.6, 1.55)), Vector((2.84, 0.94, 1.55))]
o = tube('ac1w', [tuple(v) for v in AC1W], 0.03, WIREM); cu = o.data
cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=1); cu.keyframe_insert('bevel_factor_end', frame=F(T['from_']))
cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(T['from_'] + 0.8))
# lamp
lampE = bpy.data.objects.new('lampE', None); link(lampE); lampE.location = (1.2, -0.4, 3.0)
o = tube('cord', [(0, 0, 0), (0, 0, -0.45)], 0.012, WIREM); o.parent = lampE
sh = cyl('shade', 0.28, 0.2, (0, 0, -0.55), m=mat('shadem', C['white'], 0.6), verts=24); sh.parent = lampE; sh.location = (0, 0, -0.55)
BULBM = bpy.data.materials.new('bulb'); BULBM.use_nodes = True; bn = BULBM.node_tree; bn.nodes.clear()
bo = bn.nodes.new('ShaderNodeOutputMaterial'); be = bn.nodes.new('ShaderNodeEmission'); be.inputs[0].default_value = (*srgb('#FFE7A8'), 1); bn.links.new(be.outputs[0], bo.inputs[0])
def set_bulb(v, f): be.inputs[1].default_value = v; be.inputs[1].keyframe_insert('default_value', frame=max(1, f))
key_power(set_bulb, 9.0, 0.15)
bulb = sphere('bulb', 0.12, (0, 0, -0.7), BULBM); bulb.parent = lampE; bulb.location = (0, 0, -0.7)
grow(lampE, T['lights'] - 0.2, 0.35)
# fridge
frE = bpy.data.objects.new('frE', None); link(frE); frE.location = (2.2, 1.95, 0.08)
o = bbox('fridge', (0.72, 0.7, 1.9), mat('frm', C['white'], 0.35), bevel=0.05, origin='bottom'); o.parent = frE
o = bbox('frline', (0.73, 0.02, 0.02), mat('frl', C['grey'], 0.5)); o.parent = frE; o.location = (0, -0.36, 1.25)
o = bbox('frh', (0.04, 0.04, 0.35), mat('frh', C['grey'], 0.3, metal=0.7)); o.parent = frE; o.location = (-0.28, -0.37, 1.55)
grow(frE, T['fridge'] - 0.2, 0.35)
# air conditioners (split units on the back wall)
def aircon(name, x, t0):
    e = bpy.data.objects.new(name, None); link(e); e.location = (x, 2.22, 2.5)
    o = bbox(name + 'b', (1.0, 0.24, 0.34), mat(name + 'm', C['white'], 0.35), bevel=0.05); o.parent = e
    v = bbox(name + 'v', (0.8, 0.02, 0.04), mat_emit(name + 'vm', srgb('#9FE8FF'), 1.5)); v.parent = e; v.location = (0, -0.13, -0.1)
    grow(e, t0, 0.4); return e
aircon('ac1', 0.55, T['aircon'] - 0.2)
aircon('ac2', 1.85, T['aircon2'] - 0.2)
LOADS = {'lamp': [BRK + Vector((0, 0, 0.33)), Vector((2.84, 1.2, 2.96)), Vector((1.2, -0.4, 2.96))],
         'fridge': [BRK + Vector((0, 0, -0.33)), Vector((2.84, 1.2, 0.5)), Vector((2.84, 2.0, 0.5)), Vector((2.58, 2.0, 0.5))],
         'ac1': [BRK + Vector((0, 0.26, 0.1)), Vector((2.84, 2.2, 1.7)), Vector((2.84, 2.2, 2.2)), Vector((0.55, 2.2, 2.2)), Vector((0.55, 2.2, 2.33))],
         'ac2': [Vector((2.84, 2.2, 2.2)), Vector((2.84, 2.2, 2.8)), Vector((1.85, 2.2, 2.8)), Vector((1.85, 2.2, 2.67))]}
LOAD_T = {'lamp': T['lights'], 'fridge': T['fridge'], 'ac1': T['aircon'], 'ac2': T['aircon2']}
for k, P in LOADS.items():
    o = tube('w_' + k, [tuple(v) for v in P], 0.025, WIREM); cu = o.data; t0 = LOAD_T[k] - 0.25
    cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=1); cu.keyframe_insert('bevel_factor_end', frame=F(t0))
    cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(t0 + 0.5))

# ── grid: pole, lines, service drop, two-way meter ──
WOOD = mat('wood', C['wood'], 0.85)
POLE = Vector((5.4, 3.3, 0))
cyl('pole', 0.15, 6.4, (POLE.x, POLE.y, 3.2), m=WOOD, verts=16)
box('crossarm', (POLE.x - 1.1, POLE.y - 0.08, 5.9), (POLE.x + 1.1, POLE.y + 0.08, 6.05), WOOD)
LINEM2 = mat('gridline', C['dark'], 0.5)
for dx in (-0.9, 0.0, 0.9):
    cyl(f'ins{dx}', 0.06, 0.18, (POLE.x + dx, POLE.y, 6.14), m=mat(f'insm{dx}', srgb('#7FB2C9'), 0.2), verts=12)
    tube(f'line{dx}', [(POLE.x + dx, -3.5, 6.2), (POLE.x + dx, 12.0, 6.2)], 0.025, LINEM2)
METER = Vector((3.12, 1.95, 2.0))
cyl('meter', 0.16, 0.12, tuple(METER), rot=(0, math.radians(90), 0), m=mat('meterm', C['white'], 0.4), verts=24)
cyl('meterface', 0.12, 0.02, tuple(METER + Vector((0.07, 0, 0))), rot=(0, math.radians(90), 0), m=mat_emit('mface', srgb('#DFF7FF'), 0.6), verts=24)
GRIDP = [Vector((POLE.x - 0.9, POLE.y, 6.2)), Vector((4.1, 2.8, 4.9)), Vector((3.6, 2.35, 3.6)), Vector((3.2, 1.95, 2.25)), Vector((3.18, 1.95, 2.1)),
         Vector((2.92, 1.95, 2.0)), Vector((2.86, 1.5, 1.8))]
tube('drop', [tuple(v) for v in GRIDP[:5]], 0.03, LINEM2); tube('meter2brk', [tuple(v) for v in GRIDP[4:]], 0.025, WIREM)

# ── battery bank (outside, next to the inverter) ──
BAT = Vector((3.95, -0.75, 0.0))
batE = bpy.data.objects.new('batE', None); link(batE); batE.location = BAT
o = bbox('rack', (0.75, 1.05, 1.2), mat('batm', C['batt'], 0.5), bevel=0.03, origin='bottom'); o.parent = batE
CHG = bpy.data.materials.new('chg'); CHG.use_nodes = True; cn = CHG.node_tree; cn.nodes.clear()
co_ = cn.nodes.new('ShaderNodeOutputMaterial'); ce = cn.nodes.new('ShaderNodeEmission'); ce.inputs[0].default_value = (*C['green'], 1); cn.links.new(ce.outputs[0], co_.inputs[0])
ce.inputs[1].default_value = 3.0
for k in range(3):
    s = bbox(f'cell{k}', (0.02, 0.8, 0.22), CHG); s.parent = batE; s.location = (-0.385, 0, 0.25 + k * 0.33)
    m = bbox(f'cellf{k}', (0.76, 1.06, 0.03), mat(f'cf{k}', C['dark'], 0.5)); m.parent = batE; m.location = (0, 0, 0.12 + k * 0.33)
def bat_vis(ranges):
    batE.scale = (0.001,) * 3; batE.keyframe_insert('scale', frame=1)
    for a, b in ranges:
        batE.scale = (0.001,) * 3; batE.keyframe_insert('scale', frame=F(a)); batE.scale = (1.1,) * 3; batE.keyframe_insert('scale', frame=F(a + 0.25))
        batE.scale = (1,) * 3; batE.keyframe_insert('scale', frame=F(a + 0.4)); batE.keyframe_insert('scale', frame=F(b))
        batE.scale = (0.001,) * 3; batE.keyframe_insert('scale', frame=F(b + 0.35))
BAT_ON = [(T['battery'] - 0.2, T['without'] + 0.2), (T['batteries'] - 0.2, T['end'] + 1)]
bat_vis(BAT_ON)
BATW = [BAT + Vector((-0.2, 0.3, 1.2)), Vector((3.75, -0.45, 1.35)), Vector((3.2, -0.45, 1.35))]
bw = tube('batw', [tuple(v) for v in BATW], 0.03, WIREM)
bw.hide_render = True; bw.keyframe_insert('hide_render', frame=1)
for a, b in BAT_ON: bw.hide_render = False; bw.keyframe_insert('hide_render', frame=F(a + 0.3)); bw.hide_render = True; bw.keyframe_insert('hide_render', frame=F(b + 0.2))

# ── line worker on the pole (appears on "workers") ──
wkE = bpy.data.objects.new('wkE', None); link(wkE); wkE.location = (POLE.x + 0.32, POLE.y - 0.1, 4.6)
o = cyl('wkBody', 0.15, 0.62, (0, 0, 0), m=mat('vest', C['vest'], 0.6), verts=16); o.parent = wkE; o.location = (0, 0, 0)
o = sphere('wkHead', 0.12, (0, 0, 0), mat('skin', C['skin'], 0.7)); o.parent = wkE; o.location = (0, 0, 0.45)
o = sphere('wkHat', 0.14, (0, 0, 0), mat('hat', C['hat'], 0.4)); o.parent = wkE; o.location = (0, 0, 0.53); o.scale = (1, 1, 0.6)
o = tube('wkArm', [(0, 0, 0.15), (-0.25, 0, 0.55), (-0.3, 0, 0.85)], 0.04, mat('vest2', C['vest'], 0.6)); o.parent = wkE
grow(wkE, T['workers'] - 0.2, 0.4)

# ── sun disc + rays ──
SUNPOS = Vector((-6.5, -9.0, 12.0))
sunball = sphere('sunball', 1.0, SUNPOS, mat_emit('sunM', C['sun'], 6.0), seg=32); sunball.visible_shadow = False
key(sunball, 'location', [(0, SUNPOS), (T['noon'] - 0.4, SUNPOS), (T['noon'] + 0.6, Vector((-1.0, -4.0, 16.0))), (T['night'] - 0.5, Vector((-1.0, -4.0, 16.0))),
                          (T['night'] + 0.4, Vector((10.0, 4.0, -4.0))), (T['blackout'] - 0.6, Vector((10.0, 4.0, -4.0))), (T['blackout'] + 0.1, SUNPOS)])
RAYM = mat_emit('rayM', srgb('#FFE27A'), 3.0)
for k, (x, y) in enumerate(((-2.1, 0.9), (-0.7, 2.15), (0.7, 0.9), (2.1, 2.15), (0.0, 1.5))):
    tg = rw(x, y, 0.2); d = (tg - SUNPOS).normalized(); st = tg - d * 9.0
    r = tube(f'ray{k}', [tuple(st), tuple(tg)], 0.035, RAYM); r.visible_shadow = False; cu = r.data
    cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=F(T['sunlight'] - 0.1 + k * 0.07))
    cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(T['sunlight'] + 0.6 + k * 0.07))
    vis(r, [(T['sunlight'] - 0.1, T['makes'] + 1.0)])

# ── energy beads ──
def mixc(a, b, u): return tuple(a[i] + (b[i] - a[i]) * u for i in range(3))
DCc, ACc = C['dc'], C['ac']
def stream(P, t, t0, t1, kind, direction=1, spd=0.9, gap=0.42, reveal=True):
    """beads along polyline P while t in [t0, t1]. kind 'dc': steady one-way. 'ac': drifts in `direction` and oscillates."""
    out = []
    if t < t0 or t > t1 + 0.4: return out
    L = plen(P); tot = L[-1]; fade = 1 - max(0.0, min(1.0, (t - t1) / 0.4))
    rv = (t - t0) * spd * 2.0 if reveal else 1e9
    if kind == 'dc':
        d0 = ((t - t0) * spd) % gap
        dd = d0
        while dd < tot:
            if dd <= rv: out.append((pat(P, L, dd), fade, DCc))
            dd += gap
    else:
        osc = 0.11 * math.sin(t * 2 * math.pi * 1.1); drift = ((t - t0) * spd * 0.45) % gap
        dd = (drift if direction > 0 else gap - drift) + 0.0
        while dd < tot:
            q = dd + osc
            if 0 <= q <= tot and (dd <= rv if direction > 0 else (tot - dd) <= rv): out.append((pat(P, L, q), fade, ACc))
            dd += gap
    return out
PANEL_PTS = [rw(cx, (y0 + y1) / 2, 0.22) for (y0, y1) in ROWY[:2] for cx in COLX]
PANEL_PTS3 = [rw(cx, (ROWY[2][0] + ROWY[2][1]) / 2, 0.22) for cx in COLX]
GRID_IN = GRIDP; GRID_OUT = list(reversed(GRIDP))
LOADP = {k: v for k, v in LOADS.items()}
AC1P = AC1W + [BRK + Vector((0, -0.26, 0))]
BATP = BATW
DCP = DCDOWN + [INVC + Vector((0.0, 0, 0.3))]
def flow(t):
    out = []
    prod = any(a <= t <= b for a, b in [(T['makes'], T['night'] - 0.2), (T['hybrid'] + 0.2, T['end'] + 1)])
    # each panel makes a little DC: a pulse on every panel
    if T['makes'] - 0.1 <= t <= T['wired'] + 0.6 or (prod and t > T['wired'] + 0.6):
        pts = PANEL_PTS + (PANEL_PTS3 if t > T['add'] + 0.4 else [])
        for k, p in enumerate(pts):
            s = 0.75 + 0.35 * math.sin(t * 5 + k)
            if T['makes'] - 0.1 <= t <= T['wired'] + 0.6: s *= min(1.0, (t - T['makes'] + 0.1) / 0.3)
            elif T['wired'] + 0.6 < t: s *= 0.55
            if prod or t <= T['wired'] + 0.6: out.append((p, s * 1.3, DCc))
    # strings + down cable (DC, one way)
    for k, S in enumerate(STR):
        a = T['wired'] + 0.3 if k < 2 else T['add'] + 0.9
        for (x0, x1) in [(a, T['night'] - 0.2), (max(a, T['hybrid'] + 0.2), T['end'] + 1)]:
            out += stream(S, t, x0, x1, 'dc', spd=1.0)
    for (x0, x1) in [(T['adds'], T['night'] - 0.2), (T['hybrid'] + 0.2, T['end'] + 1)]:
        out += stream(DCP if t > T['inverter'] + 0.3 else DCDOWN, t, x0, x1, 'dc', spd=1.0)
    # inverter → breaker (AC)
    for (x0, x1) in [(T['from_'] + 0.3, T['night'] - 0.2), (T['stores'], T['without']), (T['hybrid'] + 0.2, T['end'] + 1)]:
        out += stream(AC1P, t, x0, x1, 'ac')
    # breaker → loads (AC)
    for k, P in LOADP.items():
        a = LOAD_T[k] + 0.2
        for (x0, x1) in [(a, T['blackout'] + 0.15), (max(a, T['hybrid'] + 0.2), T['end'] + 1)]:
            out += stream(P, t, x0, x1, 'ac', gap=0.36)
    # grid: imports (second air conditioner; night without batteries), export at noon
    for (x0, x1) in [(T['grid'], T['add'] + 0.2), (T['pull'], T['blackout'] + 0.15)]:
        out += stream(GRID_IN, t, x0, x1, 'ac', 1, spd=1.0)
    out += stream(GRID_OUT, t, T['extra'] + 0.3, T['night'] - 0.3, 'ac', 1, spd=1.0)
    # battery (DC) into the inverter at night and during the blackout with a hybrid inverter
    for (x0, x1) in [(T['stores'], T['without']), (T['hybrid'] + 0.1, T['end'] + 1)]:
        out += stream(BATP, t, x0, x1, 'dc', spd=0.8, gap=0.32)
    return out
animate_beads('flow', 150, 0.065, NF, flow, step=2)

# ── camera ──
CAM = [(0.0, (7.6, -11.8, 7.0), (1.0, 0.5, 2.5)), (T['goes'], (6.6, -10.6, 7.2), (0.9, 0.6, 2.8)), (T['sunlight'] - 0.3, (6.2, -10.0, 7.6), (0.8, 0.6, 3.0)),
       (T['panels'] + 0.4, (3.4, -6.9, 8.6), (0.2, 0.3, 3.9)), (T['wired'] + 1.0, (2.8, -6.5, 8.4), (0.4, 0.3, 3.8)),
       (T['single'] - 0.4, (6.0, -6.6, 6.4), (2.6, -1.2, 3.0)), (T['house'] + 0.4, (7.6, -7.4, 4.8), (1.8, 0.0, 2.1)),
       (T['cable2'], (7.4, -6.6, 4.4), (2.3, -0.3, 1.9)), (T['inverter'] + 0.3, (6.3, -3.0, 2.9), (3.0, -0.6, 1.75)),
       (T['from_'] - 0.2, (6.5, -3.4, 3.0), (3.0, -0.4, 1.75)),
       (T['breaker'] - 0.3, (1.3, -7.6, 3.3), (1.5, 0.8, 1.6)), (T['plug'] - 0.3, (1.0, -7.8, 3.3), (1.3, 0.9, 1.7)),
       (T['aircon2'] + 0.6, (1.1, -7.9, 3.5), (1.3, 1.0, 1.9)), (T['grid'] - 0.3, (7.4, -10.5, 6.2), (2.4, 0.9, 2.8)),
       (T['covers'] + 1.0, (7.6, -10.2, 6.4), (2.5, 1.0, 2.9)), (T['runsun'] + 0.3, (3.0, -7.2, 9.4), (0.2, 0.9, 4.0)),
       (T['morepanels'] + 0.6, (2.6, -7.0, 9.3), (0.2, 1.0, 4.0)), (T['bigger'] - 0.2, (6.6, -3.4, 3.1), (3.0, -0.6, 1.8)),
       (T['once'] + 0.4, (6.9, -3.7, 3.2), (3.0, -0.6, 1.8)), (T['noon'] + 0.3, (7.8, -11.0, 7.2), (2.4, 1.0, 3.0)),
       (T['twoway'] - 0.3, (7.4, -5.0, 3.6), (3.6, 1.9, 2.6)), (T['counts'] + 0.6, (7.2, -4.8, 3.6), (3.6, 1.9, 2.5)),
       (T['night'] + 0.3, (7.8, -11.0, 6.8), (2.2, 0.6, 2.5)), (T['own'], (7.4, -10.4, 6.4), (2.4, 0.4, 2.3)),
       (T['battery'] + 0.1, (7.2, -5.4, 3.5), (3.6, -0.5, 1.2)), (T['without'] - 0.2, (7.4, -5.6, 3.6), (3.6, -0.4, 1.3)),
       (T['pull'] + 0.2, (8.0, -8.8, 5.6), (3.4, 1.5, 2.8)), (T['blackout'] - 0.2, (7.8, -11.0, 7.0), (2.6, 0.9, 3.0)),
       (T['protect'] - 0.6, (7.6, -10.4, 7.0), (2.8, 1.0, 3.2)), (T['workers'] - 0.2, (8.4, -3.6, 5.4), (5.2, 3.0, 4.6)),
       (T['only'] - 0.3, (8.2, -3.8, 5.2), (5.2, 3.0, 4.5)), (T['batteries'] + 0.1, (7.4, -5.6, 3.6), (3.4, -0.4, 1.4)),
       (T['lightson'] - 0.3, (6.4, -7.0, 4.0), (2.4, 0.0, 1.7)), (T['know'] + 0.6, (7.8, -11.8, 7.4), (1.2, 0.6, 2.6)),
       (T['end'] + 0.1, (8.6, -11.2, 7.4), (1.2, 0.6, 2.6))]
camera(CAM, lens=28)

# ── 2D anchors ──
ANCH = {'panels': tuple(rw(0.0, 1.5, 0.2)), 'panel1': tuple(rw(-2.1, 0.9, 0.2)), 'row3': tuple(rw(0.7, 3.4, 0.2)), 'jun': tuple(JUN),
        'cable': tuple(Vector((3.12, -1.6, 2.45))), 'inv': tuple(INVC + Vector((0.1, 0, 0.1))), 'brk': tuple(BRK), 'lamp': (1.2, -0.4, 2.3),
        'fridge': (2.2, 1.6, 1.3), 'ac1': (0.55, 2.1, 2.5), 'ac2': (1.85, 2.1, 2.5), 'meter': tuple(METER + Vector((0.1, 0, 0))),
        'pole': (POLE.x, POLE.y, 6.1), 'drop': tuple(GRIDP[2]), 'bat': tuple(BAT + Vector((0, 0, 0.9))), 'worker': (POLE.x + 0.32, POLE.y - 0.1, 5.2),
        'house': (0.5, -2.5, 1.6), 'ac1w': tuple(AC1W[2])}
project_anchors(ANCH, NF, os.path.join(HERE, 'proj_solar.json'))
json.dump({'TM': TM, 'NF': NF}, open(os.path.join(HERE, 'tm_solar.json'), 'w'))
render(HERE, argv, NF)

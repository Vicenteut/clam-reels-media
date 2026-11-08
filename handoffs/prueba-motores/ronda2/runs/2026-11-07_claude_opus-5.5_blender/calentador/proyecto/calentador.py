# Ronda 2 · tema 1: calentador solar de agua (termosifón). Diorama 3D en corte, luz de día → noche.
# Uso: Blender -b -P calentador.py -- [--stills 1,2,...] [--scale 50] [--anim] [--out DIR] [--save x.blend] [--v2]
import bpy, json, math, os, sys
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lib3d import *

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
KIT = os.path.join(HERE, 'kit', 'calentador')
WD = json.load(open(os.path.join(KIT, 'tiempos.json'))); W = WD['palabras']
NF = int(math.ceil(WD['duracion_s'] * FPS - 1e-6))
wi = lambda i: W[i]['s']
TM = dict(box=wi(3), wire=wi(14), pump=wi(16), rises0=wi(23), panel=wi(28), black=wi(31), copper=wi(35), glass=wi(39), sunlight=wi(42),
          heats=wi(48), traps=wi(54), car=wi(59), water=wi(66), warms=wi(70), rises=wi(75), tank=wi(78), above=wi(80), colder=wi(83),
          sinks=wi(86), loop=wi(101), allday=wi(104), nopump=wi(107), thermo=wi(112), insul=wi(118), night=wi(125), send=wi(126), end=WD['duracion_s'])
sc = setup(NF, samples=10)
sc.eevee.use_shadows = True

# ── palette ──
C = {k: srgb(v) for k, v in dict(grass='#8DC27E', soil='#B98B5E', wall='#F4E6C8', roof='#D9D4CC', trim='#C96F4A', door='#7A4E33',
     glassw='#2E4A66', alu='#C9CED6', black='#16181C', copper='#C8743A', tankw='#F2F2F0', foam='#F5C542', steel='#9AA3AD',
     trunk='#7B5A3C', leaf='#5FAE5A', leaf2='#78C26A', path='#E9DCC2', hot='#FF4A1C', cold='#2E8BFF', sun='#FFD54A', glass='#BFE6FF').items()}

# ── world: sky gradient (day → night) ──
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True; nt = world.node_tree; nt.nodes.clear(); N = nt.nodes.new; Lk = nt.links.new
out = N('ShaderNodeOutputWorld'); bg = N('ShaderNodeBackground'); tc = N('ShaderNodeTexCoord'); sep = N('ShaderNodeSeparateXYZ'); ramp = N('ShaderNodeValToRGB')
Lk(tc.outputs['Generated'], sep.inputs[0]); Lk(sep.outputs['Z'], ramp.inputs[0]); Lk(ramp.outputs[0], bg.inputs[0])
bgc = N('ShaderNodeBackground'); Lk(ramp.outputs[0], bgc.inputs[0]); bgc.inputs[1].default_value = 1.05   # what the camera sees (bright sky)
lp = N('ShaderNodeLightPath'); ms = N('ShaderNodeMixShader'); Lk(lp.outputs['Is Camera Ray'], ms.inputs[0]); Lk(bg.outputs[0], ms.inputs[1]); Lk(bgc.outputs[0], ms.inputs[2]); Lk(ms.outputs[0], out.inputs[0])
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[1].position = 0.85
SKY = {'day': (srgb('#BFE6FF'), srgb('#3F94E0')), 'night': (srgb('#24345C'), srgb('#070B1A'))}
def key_sky(t, which):
    for el, c in zip(ramp.color_ramp.elements, SKY[which]): el.color = (*c, 1); el.keyframe_insert('color', frame=F(t))
key_sky(0, 'day'); key_sky(TM['insul'] - 1.1, 'day'); key_sky(TM['insul'] - 0.1, 'night')
bg.inputs[1].default_value = 0.55; bg.inputs[1].keyframe_insert('default_value', frame=F(TM['insul'] - 1.1)); bg.inputs[1].default_value = 0.45; bg.inputs[1].keyframe_insert('default_value', frame=F(TM['insul'] - 0.1))

# ── lights ──
sunL = bpy.data.lights.new('sunL', 'SUN'); sunL.energy = 2.4; sunL.angle = math.radians(3); sunO = bpy.data.objects.new('sunL', sunL); sc.collection.objects.link(sunO)
def sun_rot(az, el): return (math.radians(90 - el), 0, math.radians(az))
SUNPATH = [(0, -35, 50), (TM['loop'], -35, 50), (TM['nopump'] + 0.6, 30, 46), (TM['insul'] - 1.2, 60, 18), (TM['insul'] - 0.1, 70, 2)]
for t, az, el in SUNPATH: sunO.rotation_euler = sun_rot(az, el); sunO.keyframe_insert('rotation_euler', frame=F(t))
for t, e in ((0, 2.4), (TM['insul'] - 1.2, 1.8), (TM['insul'] - 0.1, 0.0)): sunL.energy = e; sunL.keyframe_insert('energy', frame=F(t))
moonL = bpy.data.lights.new('moonL', 'SUN'); moonL.color = srgb('#9DB8FF'); moonO = bpy.data.objects.new('moonL', moonL); sc.collection.objects.link(moonO)
moonO.rotation_euler = sun_rot(-60, 40)
for t, e in ((TM['insul'] - 1.0, 0.0), (TM['insul'], 1.1)): moonL.energy = e; moonL.keyframe_insert('energy', frame=F(t))
fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 90; fill.size = 10; fo = bpy.data.objects.new('fill', fill); sc.collection.objects.link(fo)
fo.location = (6, -10, 8); fo.rotation_euler = (math.radians(55), 0, math.radians(30))
for t, e in ((TM['insul'] - 1.0, 90), (TM['insul'], 30)): fill.energy = e; fill.keyframe_insert('energy', frame=F(t))

# ── diorama base, path, trees ──
cyl('base', 11.0, 0.8, (0, 0, -0.4), m=mat('grass', C['grass'], 0.9), verts=96)
cyl('soil', 11.05, 1.6, (0, 0, -1.2), m=mat('soil', C['soil'], 0.95), verts=96)
box('path', (-0.55, -11, 0.0), (0.55, -2.6, 0.03), mat('path', C['path'], 0.9))
for i, (x, y, s) in enumerate(((-6.2, 1.5, 1.2), (5.8, 2.8, 1.0), (-4.8, -5.5, 0.8), (7.0, -3.5, 0.75))):
    cyl(f'trunk{i}', 0.16 * s, 1.6 * s, (x, y, 0.8 * s), m=mat(f'tr{i}', C['trunk'], 0.9), verts=16)
    ico(f'leaf{i}', 1.15 * s, (x, y, 2.1 * s), m=mat(f'lf{i}', C['leaf'] if i % 2 else C['leaf2'], 0.85), sub=2)

# ── house ──
WALL = mat('wall', C['wall'], 0.85); ROOF = mat('roofm', C['roof'], 0.8); TRIM = mat('trim', C['trim'], 0.7)
box('house', (-3, -2.5, 0), (3, 2.5, 3), WALL, bevel=0.03)
box('roofslab', (-3.25, -2.75, 3.0), (3.25, 2.75, 3.22), ROOF, bevel=0.03)
box('parapet', (-3.25, -2.75, 3.22), (3.25, -2.6, 3.4), TRIM)
box('door', (-0.5, -2.53, 0), (0.5, -2.48, 2.1), mat('door', C['door'], 0.7))
WINM = mat('win', C['glassw'], 0.2, emit=0.0, emit_col=srgb('#FFC66B'))
key_input(WINM, 'Emission Strength', [(TM['insul'] - 0.8, 0.0), (TM['insul'] + 0.2, 3.5)])
for i, x in enumerate((-2.0, 2.0)):
    box(f'win{i}', (x - 0.6, -2.53, 1.1), (x + 0.6, -2.48, 2.2), WINM); box(f'sill{i}', (x - 0.7, -2.62, 1.0), (x + 0.7, -2.48, 1.1), TRIM)

# ── collector (tilted 25°, faces -Y). Local frame: x width, y up the slope, z normal ──
TILT = math.radians(25); P0 = Vector((0, -0.6, 3.42))
RM = Matrix.Rotation(TILT, 3, 'X')
def cw(x, y, z): return P0 + RM @ Vector((x, y, z))
coll = bpy.data.objects.new('collector', None); link(coll); coll.location = P0; coll.rotation_euler = (TILT, 0, 0)
def cbox(name, lo, hi, m, bevel=0.0):
    o = box(name, lo, hi, m, bevel); o.parent = coll; return o
ALU = mat('alu', C['alu'], 0.35, metal=0.8)
PLATE = mat('plate', C['black'], 0.5, emit=0.0, emit_col=srgb('#E8360F'))
key_input(PLATE, 'Emission Strength', [(TM['heats'] - 0.1, 0.0), (TM['heats'] + 0.6, 0.7), (TM['warms'] + 2, 0.7), (TM['insul'] - 1.0, 0.15)])
COPPER = mat('copper', C['copper'], 0.5, metal=0.6, emit=0.0, emit_col=srgb('#FF9A4A'))
key_input(COPPER, 'Emission Strength', [(TM['copper'] - 0.1, 0.0), (TM['copper'] + 0.2, 1.2), (TM['copper'] + 1.2, 0.0)])
cbox('tray', (-1.08, -0.03, -0.20), (1.08, 1.43, -0.17), ALU)
for nm, lo, hi in (('wallL', (-1.08, -0.03, -0.20), (-1.03, 1.43, 0.05)), ('wallR', (1.03, -0.03, -0.20), (1.08, 1.43, 0.05)),
                   ('wallB', (-1.08, -0.03, -0.20), (1.08, 0.02, 0.05)), ('wallT', (-1.08, 1.38, -0.20), (1.08, 1.43, 0.05))):
    cbox(nm, lo, hi, ALU)
cbox('plate', (-1.02, 0.03, -0.15), (1.02, 1.37, -0.13), PLATE)
RX = [-0.75 + 0.3 * k for k in range(6)]
def ctube(name, pts_local, r, m):
    o = tube(name, pts_local, r, m); o.parent = coll; return o
for k, x in enumerate(RX): ctube(f'riser{k}', [(x, 0.12, -0.10), (x, 1.28, -0.10)], 0.028, COPPER)
ctube('hdrB', [(-1.2, 0.12, -0.10), (0.9, 0.12, -0.10)], 0.04, COPPER); ctube('hdrT', [(-0.9, 1.28, -0.10), (1.2, 1.28, -0.10)], 0.04, COPPER)
GLASS = mat('glass', C['glass'], 0.05, alpha=0.13, spec=0.9)
glass = cbox('glass', (-1.06, 0.0, 0.03), (1.06, 1.40, 0.045), GLASS)
glass.location.z = 0.0375; glass.keyframe_insert('location', frame=1); glass.keyframe_insert('location', frame=F(TM['panel'] - 0.1))   # exploded view: lifts off, comes back on "glass"
glass.location.z = 0.0375 + 1.7; glass.keyframe_insert('location', frame=F(TM['panel'] + 0.5)); glass.keyframe_insert('location', frame=F(TM['glass'] - 0.15))
glass.location.z = 0.0375; glass.keyframe_insert('location', frame=F(TM['glass'] + 0.45))
# legs under the tilted collector
for x in (-0.9, 0.9):
    a = cw(x, 1.3, -0.2); box(f'leg{x}', (a.x - 0.04, a.y - 0.04, 3.22), (a.x + 0.04, a.y + 0.04, a.z), ALU)

# ── tank (horizontal, above the collector) with a cutaway that opens when the water starts to move ──
TC = Vector((0, 1.3, 4.6)); TR = 0.42
TANKW = mat('tankw', C['tankw'], 0.35, metal=0.1); FOAM = mat('foam', C['foam'], 0.9, emit=0.35); STEEL = mat('steel', C['steel'], 0.3, metal=0.9)
rotx = (0, math.radians(90), 0)
shell = cyl('tank_shell', TR, 2.0, TC, rotx, TANKW); foam = cyl('tank_foam', TR - 0.015, 1.97, TC, rotx, FOAM)
liner = cyl('tank_liner', TR - 0.1, 1.9, TC, rotx, STEEL)
WATER = bpy.data.materials.new('water'); WATER.use_nodes = True; wn = WATER.node_tree; wn.nodes.clear()
wo = wn.nodes.new('ShaderNodeOutputMaterial'); we = wn.nodes.new('ShaderNodeEmission'); wtc = wn.nodes.new('ShaderNodeTexCoord'); wsep = wn.nodes.new('ShaderNodeSeparateXYZ')
wr = wn.nodes.new('ShaderNodeValToRGB'); wmix = wn.nodes.new('ShaderNodeMix'); wmix.data_type = 'RGBA'
wn.links.new(wtc.outputs['Generated'], wsep.inputs[0]); wn.links.new(wsep.outputs['X'], wr.inputs[0])    # cylinder rotated: generated X ~ world Z
wr.color_ramp.elements[0].color = (*C['hot'], 1); wr.color_ramp.elements[1].color = (*C['cold'], 1); wr.color_ramp.elements[0].position = 0.3; wr.color_ramp.elements[1].position = 0.72   # generated X grows DOWNWARD here
wmix.inputs['A'].default_value = (*C['cold'], 1); wn.links.new(wr.outputs[0], wmix.inputs['B']); wn.links.new(wmix.outputs['Result'], we.inputs[0])
we.inputs[1].default_value = 1.0; wn.links.new(we.outputs[0], wo.inputs[0])
for t, v in ((0, 0.0), (TM['tank'] - 0.2, 0.0), (TM['above'] + 0.6, 1.0)): wmix.inputs['Factor'].default_value = v; wmix.inputs['Factor'].keyframe_insert('default_value', frame=F(t))
water = cyl('tank_water', TR - 0.11, 1.88, TC, rotx, WATER)
# cutter: front-top quadrant (y < centre, z > centre), x inside the end caps; parked far away until the reveal
# (booleans are APPLIED at build time: a live, animated boolean re-evaluates every frame and made renders ~5x slower)
cut = box('cutter', (-0.85, TC.y - 1.0, TC.z), (0.85, TC.y, TC.z + 1.0)); cut.hide_render = True; cut.display_type = 'WIRE'
closed = shell.copy(); closed.data = shell.data.copy(); closed.name = 'tank_closed'; link(closed); closed.scale = (1.002, 1.002, 1.002)
for o in (shell, foam, liner):
    md = o.modifiers.new('cut', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = cut; md.solver = 'EXACT'; md.material_mode = 'INDEX'
    bpy.context.view_layer.objects.active = o
    with bpy.context.temp_override(object=o, active_object=o): bpy.ops.object.modifier_apply(modifier='cut')
bpy.data.objects.remove(cut)
vis(closed, [(0, TM['water'] - 0.1)])        # the closed tank until the water starts moving, then the cutaway
# stand
for x in (-0.75, 0.75):
    for y in (TC.y - 0.3, TC.y + 0.3): box(f'tl{x}{y}', (x - 0.035, y - 0.035, 3.22), (x + 0.035, y + 0.035, TC.z - TR + 0.05), ALU)
    box(f'saddle{x}', (x - 0.06, TC.y - 0.36, TC.z - TR - 0.02), (x + 0.06, TC.y + 0.36, TC.z - TR + 0.08), ALU)

# ── pipes ──
H0, C0 = cw(1.2, 1.28, -0.10), cw(-1.2, 0.12, -0.10)
HOTP = [tuple(H0), (1.35, H0.y, H0.z), (1.35, TC.y, TC.z + 0.17), (0.98, TC.y, TC.z + 0.17)]
COLDP = [(-0.98, TC.y, TC.z - 0.22), (-1.35, TC.y, TC.z - 0.22), (-1.35, C0.y, C0.z), tuple(C0)]
PIPE = mat('pipe', C['copper'], 0.35, metal=0.9)
tube('hotpipe', HOTP, 0.045, PIPE); tube('coldpipe', COLDP, 0.045, PIPE)

# ── sun (visible disc) + rays that draw toward the plate ──
SUNPOS = Vector((-5.5, -7.5, 11.0))
sunball = sphere('sunball', 0.9, SUNPOS, mat_emit('sunM', C['sun'], 6.0), seg=32)
key(sunball, 'location', [(0, SUNPOS), (TM['loop'], SUNPOS), (TM['nopump'] + 0.6, Vector((6.5, -6.0, 10.0))), (TM['insul'] - 1.2, Vector((9, -4, 3.5))), (TM['insul'] - 0.1, Vector((10, -3, -2.0)))])
RAYM = mat_emit('rayM', srgb('#FFE27A'), 3.0)
for k, (x, y) in enumerate(((-0.7, 0.3), (0.0, 0.7), (0.7, 0.4), (-0.3, 1.1), (0.45, 1.05))):
    tgtp = cw(x, y, -0.13); d = (tgtp - SUNPOS).normalized(); start = tgtp - d * 7.5
    r = tube(f'ray{k}', [tuple(start), tuple(tgtp)], 0.03, RAYM)
    cu = r.data; cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=F(TM['sunlight'] - 0.1 + k * 0.08))
    cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(TM['sunlight'] + 0.7 + k * 0.08))
    vis(r, [(TM['sunlight'] - 0.1, TM['water'] + 0.3)])
# trapped heat: wavy orange strokes bouncing between plate and glass
HEATM = mat_emit('heatM', srgb('#FF7A2A'), 3.5)
for k, x in enumerate((-0.6, -0.1, 0.4, 0.85)):
    pts = [(x + 0.012 * math.sin(i * 1.4) * 8, 0.3 + 0.9 * i / 12, -0.07) for i in range(13)]
    hw = ctube(f'heat{k}', [(px, py, pz) for px, py, pz in pts], 0.012, HEATM)
    vis(hw, [(TM['traps'] - 0.1, TM['water'] + 0.2)])
    for f in range(F(TM['traps'] - 0.1), F(TM['water'] + 0.3), 2):
        t = (f - 1) / FPS; hw.location = (0, 0.05 * math.sin(t * 3 + k), 0.055 * math.sin(t * 5.5 + k * 1.7)); hw.keyframe_insert('location', frame=f)

# ── water flow beads (temperature colour) ──
def mixc(a, b, u): return tuple(a[i] + (b[i] - a[i]) * u for i in range(3))
RISERS = [[tuple(cw(x, 0.12, -0.10)), tuple(cw(x, 1.28, -0.10))] for x in RX]
HOTFULL = [tuple(cw(1.2, 1.28, -0.10))] + HOTP[1:] + [(0.55, TC.y, TC.z + 0.17)]
COLDFULL = COLDP + [tuple(cw(0.9, 0.12, -0.10))]
SPD, GAP = 0.32, 0.3
WARM = srgb('#FFB347')
def flow(t):
    out = []
    t_hot, t_pipe, t_cold = TM['warms'] - 0.2, TM['rises'] - 0.3, TM['colder'] + 0.2
    if t >= t_hot:                                   # risers: cold at the bottom → hot at the top
        for P in RISERS:
            L = plen(P); d = ((t - t_hot) * SPD) % GAP; reveal = (t - t_hot) * SPD * 1.4
            while d < L[-1]:
                if d <= reveal: u = d / L[-1]; out.append((pat(P, L, d), 1.0, mixc(C['cold'], WARM, u / 0.5) if u < 0.5 else mixc(WARM, C['hot'], (u - 0.5) / 0.5)))
                d += GAP
    if t >= t_pipe:                                  # hot pipe up into the tank
        L = plen(HOTFULL); d = ((t - t_pipe) * SPD) % GAP; reveal = (t - t_pipe) * SPD * 1.4
        while d < L[-1]:
            if d <= reveal: out.append((pat(HOTFULL, L, d), 1.15, C['hot']))
            d += GAP
    if t >= t_cold:                                  # cold return from the tank bottom down to the bottom header
        L = plen(COLDFULL); d = ((t - t_cold) * SPD) % GAP; reveal = (t - t_cold) * SPD * 1.4
        while d < L[-1]:
            if d <= reveal: out.append((pat(COLDFULL, L, d), 1.15, C['cold']))
            d += GAP
    if t > TM['insul'] - 1.0:                        # night: no sun, flow slows to a stop
        k = max(0.0, 1 - (t - TM['insul'] + 1.0) / 1.5); out = [(p, s * k, c) for p, s, c in out]
    return out
animate_beads('flow', 64, 0.058, NF, flow, step=2)

# ── camera ──
CAM = [(0.0, (6.8, -12.5, 6.6), (0, 0.4, 2.8)), (TM['wire'], (5.0, -11.8, 7.0), (0, 0.5, 3.0)),
       (TM['rises0'] - 0.6, (3.1, -5.4, 6.1), (0, 0.5, 4.05)), (TM['rises0'] + 1.2, (2.7, -5.0, 6.0), (0, 0.5, 4.05)),
       (TM['panel'] - 0.2, (1.0, -3.4, 5.4), (0, -0.05, 3.7)), (TM['glass'] + 0.6, (0.6, -3.1, 5.6), (0, 0.0, 3.7)),
       (TM['sunlight'] + 0.2, (2.4, -5.6, 5.6), (-0.3, 0.2, 4.1)), (TM['car'], (2.0, -5.2, 5.3), (-0.2, 0.2, 4.0)),
       (TM['water'] + 0.2, (3.3, -3.1, 5.7), (0, 0.45, 4.15)), (TM['colder'], (3.0, -3.4, 5.3), (0, 0.45, 4.1)),
       (TM['loop'] - 0.2, (2.9, -3.6, 5.4), (0, 0.45, 4.1)), (TM['nopump'] + 0.6, (-3.4, -3.6, 5.8), (0, 0.45, 4.1)),
       (TM['thermo'] + 0.9, (-4.6, -7.6, 6.6), (0, 0.5, 3.8)),
       (TM['insul'] - 0.3, (2.9, -1.7, 6.2), (0.1, TC.y - 0.1, TC.z)), (TM['night'], (2.6, -1.5, 6.1), (0.1, TC.y - 0.1, TC.z)),
       (TM['send'] + 0.8, (7.5, -13.5, 6.5), (0, 0.4, 2.6)), (TM['end'] + 0.1, (7.8, -14.0, 6.6), (0, 0.4, 2.6))]
camera(CAM, lens=28)

# ── anchors for the 2D layer ──
ANCH = {'plate': tuple(cw(0.55, 0.45, -0.14)), 'tubes': tuple(cw(-0.45, 0.75, -0.10)), 'glass': tuple(cw(-0.75, 1.15, 0.04)),
        'hot': (1.35, (H0.y + TC.y) / 2, (H0.z + TC.z + 0.17) / 2), 'cold': (-1.35, (C0.y + TC.y) / 2, (C0.z + TC.z - 0.22) / 2),
        'tank': (0, TC.y, TC.z + TR), 'foam': (0.3, TC.y, TC.z + TR - 0.05), 'collector': tuple(cw(0, 0.7, 0)),
        'house': (0, -2.5, 1.6)}
project_anchors(ANCH, NF, os.path.join(HERE, 'proj_calentador.json'))
json.dump({'TM': TM, 'NF': NF}, open(os.path.join(HERE, 'tm_calentador.json'), 'w'))
render(HERE, argv, NF)

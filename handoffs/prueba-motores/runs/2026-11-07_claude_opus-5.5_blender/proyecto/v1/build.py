# Prueba de motores · corrida Blender. Construye la escena 3D del tramo «inversor» en estilo plano azul y la renderiza.
# Uso:  Blender -b -P build.py -- [--stills 1.1,3.4,...] [--scale 50] [--out DIR] [--save scene.blend]
# Todo es geometría hecha por script. Líneas = Grease Pencil Line Art por grupos, cada grupo con un Build (porcentaje animado).
import bpy, bmesh, json, math, os, sys
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return argv[argv.index(k) + 1] if k in argv else d
STILLS = [float(x) for x in arg('--stills', '').split(',') if x]
SCALE = int(arg('--scale', '100'))
OUT = arg('--out', os.path.join(HERE, 'frames'))
FPS, NF = 30, 413
W = json.load(open(os.path.join(HERE, 'tiempos.json')))['palabras']
wi = lambda i: W[i]['s']
F = lambda t: int(round(t * FPS)) + 1          # time (s) -> frame number (frame 1 = t 0)

# ── timing (same anchors as the 2D run) ──
TM = dict(roof=0.0, panels=wi(1) - 0.15, jbox=1.0, dc=wi(3) - 0.1, dcLab=wi(3), oneWay=wi(8), house=wi(12) - 0.1,
          ac=wi(15) - 0.1, acLab=wi(15), bf=wi(19), gap=wi(26) + 0.05, inv=wi(30) - 0.1, flips=wi(32), mat=wi(38))

# ── reset scene ──
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, SCALE
sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, NF
sc.view_settings.view_transform = 'Standard'
sc.eevee.taa_render_samples = 16
sc.render.image_settings.file_format = 'PNG'
sc.render.film_transparent = False

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
BLUE, BLUE2, INK, DCC, ACC = srgb('#123E7A'), srgb('#0B2A55'), srgb('#E6F6FF'), srgb('#FFB020'), srgb('#3FD5FF')

world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (*BLUE2, 1); world.node_tree.nodes['Background'].inputs[1].default_value = 1.0

# ── materials ──
def mat_transparent(name='Invisible'):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); tr = nt.nodes.new('ShaderNodeBsdfTransparent'); nt.links.new(tr.outputs[0], o.inputs[0])
    return m
def mat_emit(name, col, strength=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*col, 1); e.inputs[1].default_value = strength; nt.links.new(e.outputs[0], o.inputs[0]); return m
def mat_grid(name, axes):                       # emission grid in world space; axes e.g. ('X','Y')
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); N = nt.nodes.new; L = nt.links.new
    o = N('ShaderNodeOutputMaterial'); e = N('ShaderNodeEmission'); L(e.outputs[0], o.inputs[0])
    geo = N('ShaderNodeNewGeometry'); sep = N('ShaderNodeSeparateXYZ'); L(geo.outputs['Position'], sep.inputs[0])
    def lines(cell, width):
        acc = None
        for a in axes:
            d = N('ShaderNodeMath'); d.operation = 'DIVIDE'; L(sep.outputs[a], d.inputs[0]); d.inputs[1].default_value = cell
            fr = N('ShaderNodeMath'); fr.operation = 'FRACT'; L(d.outputs[0], fr.inputs[0])
            lt = N('ShaderNodeMath'); lt.operation = 'LESS_THAN'; L(fr.outputs[0], lt.inputs[0]); lt.inputs[1].default_value = width / cell
            if acc is None: acc = lt
            else: mx = N('ShaderNodeMath'); mx.operation = 'MAXIMUM'; L(acc.outputs[0], mx.inputs[0]); L(lt.outputs[0], mx.inputs[1]); acc = mx
        return acc
    minor, major = lines(1.0, 0.012), lines(5.0, 0.03)
    mm = N('ShaderNodeMath'); mm.operation = 'MULTIPLY_ADD'; L(major.outputs[0], mm.inputs[0]); mm.inputs[1].default_value = 0.6; L(minor.outputs[0], mm.inputs[2])
    cl = N('ShaderNodeMath'); cl.operation = 'MINIMUM'; L(mm.outputs[0], cl.inputs[0]); cl.inputs[1].default_value = 1.0
    mix = N('ShaderNodeMix'); mix.data_type = 'RGBA'; L(cl.outputs[0], mix.inputs['Factor'])
    mix.inputs['A'].default_value = (*BLUE, 1); mix.inputs['B'].default_value = (0.13, 0.22, 0.4, 1)
    L(mix.outputs['Result'], e.inputs[0]); return m
def mat_sweep(name, col, emit=0.25, thr_key=None):   # solid material revealed where world Z > threshold (animated)
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); N = nt.nodes.new; L = nt.links.new
    o = N('ShaderNodeOutputMaterial'); p = N('ShaderNodeBsdfPrincipled'); p.inputs['Base Color'].default_value = (*col, 1)
    p.inputs['Roughness'].default_value = 0.45; p.inputs['Emission Color'].default_value = (*col, 1); p.inputs['Emission Strength'].default_value = emit
    tr = N('ShaderNodeBsdfTransparent'); mix = N('ShaderNodeMixShader')
    geo = N('ShaderNodeNewGeometry'); sep = N('ShaderNodeSeparateXYZ'); L(geo.outputs['Position'], sep.inputs[0])
    val = N('ShaderNodeValue'); val.name = 'THR'; val.outputs[0].default_value = 99.0
    gt = N('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; L(sep.outputs['Z'], gt.inputs[0]); L(val.outputs[0], gt.inputs[1])
    L(gt.outputs[0], mix.inputs[0]); L(tr.outputs[0], mix.inputs[1]); L(p.outputs[0], mix.inputs[2]); L(mix.outputs[0], o.inputs[0])
    SWEEP_MATS.append(m); return m
SWEEP_MATS = []

# ── geometry helpers ──
COLS = {}
def col(name):
    if name not in COLS: c = bpy.data.collections.new(name); sc.collection.children.link(c); COLS[name] = c
    return COLS[name]
def box(name, c, lo, hi, mat=None, bevel=0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); col(c).objects.link(o)
    o.location = [(a + b) / 2 for a, b in zip(lo, hi)]; o.scale = [b - a for a, b in zip(lo, hi)]
    o.data.materials.append(mat or mat_transparent())
    if bevel: md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = 3
    return o
def edges(name, c, segs):                        # loose edges (drawn by Line Art as "loose")
    me = bpy.data.meshes.new(name); vs, es = [], []
    for a, b in segs: vs += [a, b]; es.append((len(vs) - 2, len(vs) - 1))
    me.from_pydata(vs, es, []); o = bpy.data.objects.new(name, me); col(c).objects.link(o); return o
def tube(name, pts, color, r=0.035, strength=1.0):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 3; cu.use_fill_caps = True
    cu.bevel_factor_mapping_start = cu.bevel_factor_mapping_end = 'SPLINE'
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    o = bpy.data.objects.new(name, cu); col('energy').objects.link(o); o.data.materials.append(mat_emit(name + 'M', color, strength)); return o
def key_draw(o, t0, dur):                        # progressive draw of a tube via bevel_factor_end
    cu = o.data; cu.bevel_factor_end = 0.0; cu.keyframe_insert('bevel_factor_end', frame=F(t0)); cu.bevel_factor_end = 1.0; cu.keyframe_insert('bevel_factor_end', frame=F(t0 + dur))
    o.hide_render = True; o.keyframe_insert('hide_render', frame=1); o.hide_render = False; o.keyframe_insert('hide_render', frame=max(1, F(t0)))

# ── world geometry (metres). House: x -4..4, y 0..6 (front open toward the camera at -y), z 0..3; roof slopes up to the back ──
zr = lambda y: 3.0 + (y + 0.3) * (1.4 / 6.6)      # roof surface height
G = mat_grid('Grid', ('X', 'Y')); G2 = mat_grid('GridBack', ('X', 'Z'))
gnd = box('ground', 'stage', (-40, -40, -0.32), (40, 40, -0.3), G); back = box('backdrop', 'stage', (-40, 22, -1), (40, 22.2, 40), G2)
for o in (gnd, back): o.visible_shadow = False

# roof slab (a sloped box): build as a mesh with 8 verts
def slab(name, c, y0, y1, x0, x1, th):
    vs = []
    for (x, y) in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)): vs.append((x, y, zr(y)))
    for (x, y) in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)): vs.append((x, y, zr(y) - th))
    fs = [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    me = bpy.data.meshes.new(name); me.from_pydata(vs, [], fs); o = bpy.data.objects.new(name, me); col(c).objects.link(o); o.data.materials.append(mat_transparent()); return o
slab('roof', 'g_roof', -0.3, 6.3, -4.35, 4.35, 0.22)
# 8 panels (2 rows along y, 4 columns along x), raised 0.12 above the roof, plus cell lines
cells = []
for r, (ya, yb) in enumerate(((0.4, 2.75), (3.15, 5.5))):
    for c_ in range(4):
        xa = -3.5 + c_ * 1.75; xb = xa + 1.6
        vs = [(x, y, zr(y) + 0.12) for (x, y) in ((xa, ya), (xb, ya), (xb, yb), (xa, yb))] + [(x, y, zr(y) + 0.05) for (x, y) in ((xa, ya), (xb, ya), (xb, yb), (xa, yb))]
        fs = [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
        me = bpy.data.meshes.new(f'panel{r}{c_}'); me.from_pydata(vs, [], fs); o = bpy.data.objects.new(me.name, me); col('g_panels').objects.link(o); o.data.materials.append(mat_transparent())
        for k in (1, 2, 3):
            x = xa + (xb - xa) * k / 4; cells.append(((x, ya, zr(ya) + 0.125), (x, yb, zr(yb) + 0.125)))
        ym = (ya + yb) / 2; cells.append(((xa, ym, zr(ym) + 0.125), (xb, ym, zr(ym) + 0.125)))
edges('cells', 'g_cells', cells)
JB = (3.7, 3.0, zr(3.0) + 0.1)
box('jbox', 'g_jbox', (JB[0] - 0.15, JB[1] - 0.12, JB[2] - 0.08), (JB[0] + 0.15, JB[1] + 0.12, JB[2] + 0.08))
# house shell (cutaway: no front wall)
box('backwall', 'g_house', (-4.1, 5.9, 0), (4.1, 6.1, 3.0)); box('lwall', 'g_house', (-4.1, 0, 0), (-3.9, 6.1, 3.0)); box('rwall', 'g_house', (3.9, 0, 0), (4.1, 6.1, 3.0))
box('floor', 'g_house', (-4.1, 0, -0.25), (4.1, 6.1, 0))
box('win', 'g_house', (-4.12, 2.2, 1.2), (-3.88, 3.8, 2.2)); edges('winx', 'g_house', [((-3.87, 3.0, 1.2), (-3.87, 3.0, 2.2)), ((-3.87, 2.2, 1.7), (-3.87, 3.8, 1.7))])
# fridge, lamp, outlet
box('fridge', 'g_things', (-2.7, 4.9, 0), (-1.7, 5.8, 1.95), bevel=0.04); edges('fridgel', 'g_things', [((-2.7, 4.88, 1.3), (-1.7, 4.88, 1.3)), ((-1.85, 4.86, 1.4), (-1.85, 4.86, 1.75)), ((-1.85, 4.86, 0.5), (-1.85, 4.86, 1.15))])
box('outlet', 'g_things', (-1.12, 5.85, 0.32), (-0.88, 5.9, 0.55))
edges('cord', 'g_things', [((0.2, 3.0, 2.95), (0.2, 3.0, 2.45))])
bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.42, radius2=0.12, depth=0.35, location=(0.2, 3.0, 2.28)); sh = bpy.context.object; sh.name = 'shade'
for c in sh.users_collection: c.objects.unlink(sh)
col('g_things').objects.link(sh); sh.data.materials.append(mat_transparent())
# inverter (blueprint box) + its solid version
INV_LO, INV_HI = (1.85, 5.6, 1.3), (2.55, 5.9, 2.3)
box('inv_bp', 'g_inv', INV_LO, INV_HI); edges('inv_scr', 'g_inv', [((1.95, 5.58, 1.95), (2.45, 5.58, 1.95)), ((2.45, 5.58, 1.95), (2.45, 5.58, 2.2)), ((2.45, 5.58, 2.2), (1.95, 5.58, 2.2)), ((1.95, 5.58, 2.2), (1.95, 5.58, 1.95))])
solid = col('inv_solid')
box('inv_body', 'inv_solid', INV_LO, INV_HI, mat_sweep('InvBody', srgb('#EEF3F7'), 0.15), bevel=0.04)
box('inv_screen', 'inv_solid', (1.95, 5.585, 1.95), (2.45, 5.6, 2.2), mat_sweep('InvScreen', srgb('#0E1B2A'), 0.0))
box('inv_stripe', 'inv_solid', (1.85, 5.585, 1.42), (2.55, 5.6, 1.48), mat_sweep('InvStripe', srgb('#FF7A1A'), 0.6))
for i, cc in enumerate(('#46E08A', '#2F3B48')): box(f'inv_led{i}', 'inv_solid', (2.02 + i * 0.12, 5.585, 1.7), (2.08 + i * 0.12, 5.6, 1.76), mat_sweep(f'Led{i}', srgb(cc), 1.0))
sine = [(1.99 + 0.42 * k / 40, 5.58, 2.075 + 0.07 * math.sin(k / 40 * math.tau * 1.5)) for k in range(41)]
so = tube('inv_sine', sine, ACC, r=0.012, strength=4); so.data.materials[0] = mat_sweep('InvSine', ACC, 4.0)
for o in solid.objects: o.visible_shadow = False
# placeholder (blinking wire box where the inverter will go)
ph = box('placeholder', 'energy', INV_LO, INV_HI, mat_emit('PH', INK, 2.0)); wf = ph.modifiers.new('wf', 'WIREFRAME'); wf.thickness = 0.02

# ── cables (emissive tubes that draw themselves) ──
CABLE = [JB, (3.7, 3.0, 2.85), (3.7, 5.75, 2.85), (2.2, 5.75, 2.85), (2.2, 5.75, 2.5)]
DCIN, CABLE_JOIN = (2.2, 5.75, 2.3), [(2.2, 5.75, 2.5), (2.2, 5.75, 2.3)]
AC_MAIN = [(2.35, 5.75, 1.15), (2.35, 5.75, 0.15), (-1.0, 5.75, 0.15), (-1.0, 5.75, 0.42)]
AC_LAMP = [(0.8, 5.75, 0.15), (0.8, 5.75, 2.85), (0.8, 3.0, 2.85), (0.2, 3.0, 2.85)]
ACOUT, AC_JOIN = (2.35, 5.75, 1.3), [(2.35, 5.75, 1.3), (2.35, 5.75, 1.15)]
key_draw(tube('dc', CABLE, DCC), TM['dc'], 1.0)
key_draw(tube('acm', AC_MAIN, ACC), TM['ac'], 0.8); key_draw(tube('acl', AC_LAMP, ACC), TM['ac'] + 0.25, 0.6)
key_draw(tube('dcj', CABLE_JOIN, DCC), TM['flips'], 0.22); key_draw(tube('acj', AC_JOIN, ACC), TM['flips'] + 0.15, 0.22)

# ── Line Art: one Grease Pencil object per group, each grows with a Build modifier (percentage keyed) ──
def gp_mat(name, color, alpha=1.0):
    m = bpy.data.materials.new(name); bpy.data.materials.create_gpencil_data(m); m.grease_pencil.color = (*color, alpha); return m
def lineart(group, t0, dur, mode='CONCURRENT', radius=0.026, color=INK):
    bpy.ops.object.grease_pencil_add(type='EMPTY'); o = bpy.context.object; o.name = 'LA_' + group
    for c in o.users_collection: c.objects.unlink(o)
    col('lines').objects.link(o)
    o.data.layers.new('Lines'); m = gp_mat('GP_' + group, color); o.data.materials.append(m)
    la = o.modifiers.new('la', 'LINEART'); la.source_type = 'COLLECTION'; la.source_collection = col(group)
    la.target_layer = 'Lines'; la.target_material = m; la.radius = radius; la.use_loose = True; la.use_crease = True; la.crease_threshold = math.radians(140)
    la.use_intersection = False; la.stroke_depth_offset = 0.05
    b = o.modifiers.new('build', 'GREASE_PENCIL_BUILD'); b.mode = mode; b.transition = 'GROW'; b.time_mode = 'PERCENTAGE'; b.use_percentage = True
    b.percentage_factor = 0.0; b.keyframe_insert('percentage_factor', frame=1); b.keyframe_insert('percentage_factor', frame=F(t0))
    b.percentage_factor = 1.0; b.keyframe_insert('percentage_factor', frame=F(t0 + dur))
    return o, m
lineart('g_roof', TM['roof'], 0.55)
lineart('g_panels', TM['panels'], 0.8, 'SEQUENTIAL')
lineart('g_cells', TM['panels'] + 0.3, 0.7, radius=0.012, color=(0.55, 0.75, 0.9))
lineart('g_jbox', TM['jbox'], 0.25)
lineart('g_house', TM['house'], 0.8)
lineart('g_things', TM['house'] + 0.55, 0.6)
_, INV_GPM = lineart('g_inv', TM['inv'], 0.5)
INV_GPM.grease_pencil.keyframe_insert('color', frame=F(TM['mat'] - 0.05))
INV_GPM.grease_pencil.color = (*INK, 0.35); INV_GPM.grease_pencil.keyframe_insert('color', frame=F(TM['mat'] + 0.35))
# placeholder blinking between gap and inverter
last = None
for f in range(1, NF + 1):
    t = (f - 1) / FPS; vis = TM['gap'] <= t < TM['inv'] + 0.25 and math.sin(t * 7) > -0.3
    if vis != last:
        ph.hide_render = not vis; ph.keyframe_insert('hide_render', frame=f); last = vis
# sweep reveal of the solid inverter
for m in SWEEP_MATS:
    v = m.node_tree.nodes['THR'].outputs[0]
    v.default_value = 99.0; v.keyframe_insert('default_value', frame=F(TM['mat'] - 0.08))
    v.default_value = 2.32; v.keyframe_insert('default_value', frame=F(TM['mat'] - 0.07))
    v.default_value = 1.25; v.keyframe_insert('default_value', frame=F(TM['mat'] + 0.4))

# ── energy beads (keyframed per frame) ──
def plen(P): L = [0.0]; [L.append(L[-1] + (Vector(P[i]) - Vector(P[i - 1])).length) for i in range(1, len(P))]; return L
def pat(P, L, d):
    d = max(0.0, min(d, L[-1]))
    for i in range(1, len(P)):
        if d <= L[i] + 1e-9: f = (d - L[i - 1]) / max(1e-9, L[i] - L[i - 1]); return Vector(P[i - 1]).lerp(Vector(P[i]), f)
    return Vector(P[-1])
def beads(name, n, color, r, posfn):
    m = mat_emit(name, color, 1.0); obs = []
    for i in range(n):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r); o = bpy.context.object; o.name = f'{name}{i}'
        for c in o.users_collection: c.objects.unlink(o)
        col('energy').objects.link(o); o.data.materials.append(m); o.visible_shadow = False; obs.append(o)
    for f in range(1, NF + 1):
        t = (f - 1) / FPS; ps = posfn(t)
        for i, o in enumerate(obs):
            p, s = ps[i] if i < len(ps) else (Vector((0, 0, -50)), 0.0)
            o.location = p; o.scale = (s, s, s); o.keyframe_insert('location', frame=f); o.keyframe_insert('scale', frame=f)
CF = CABLE + [DCIN, (2.2, 5.75, 1.85)]; CFL, CBL = plen(CF), plen(CABLE)
def dc_pos(t):
    if t < TM['dc'] + 0.7: return []
    joined = t >= TM['flips'] + 0.22; P, L = (CF, CFL) if joined else (CABLE, CBL); out = []
    a0 = min(1, (t - TM['dc'] - 0.7) / 0.4); d = ((t - TM['dc']) * 1.3) % 0.45
    while d < L[-1]:
        fade = min(1, (L[-1] - d) / (0.12 if joined else 0.6)); out.append((pat(P, L, d), a0 * fade)); d += 0.45
    return out
AML, ALL = plen(AC_MAIN), plen(AC_LAMP); AJL = plen(AC_JOIN)
def ac_pos(t):
    if t < TM['ac'] + 0.5: return []
    a0 = min(1, (t - TM['ac'] - 0.5) / 0.4); amp = 0.1 + 0.1 * min(1, max(0, (t - TM['bf']) / 0.4)); off = amp * math.sin(t * math.tau * 1.3); out = []
    for P, L in ((AC_MAIN, AML), (AC_LAMP, ALL)):
        d = 0.25
        while d < L[-1] - 0.15: out.append((pat(P, L, d + off), a0)); d += 0.5
    if t > TM['flips'] + 0.4: out.append((pat(AC_JOIN, AJL, AJL[-1] / 2 + off * 0.4), min(1, (t - TM['flips'] - 0.4) / 0.3)))
    return out
beads('dcb', 16, DCC, 0.055, dc_pos); beads('acb', 26, ACC, 0.05, ac_pos)

# ── lights for the solid inverter ──
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.0; so_ = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so_); so_.rotation_euler = (math.radians(55), 0, math.radians(-25))

# ── camera (keys: time, location, target) ──
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 22; cam.data.sensor_fit = 'VERTICAL'; cam.data.sensor_height = 36
tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt)
tc = cam.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
CAM = [(0.0, (1.9, -3.0, 9.2), (0.2, 3.0, 3.2)), (3.9, (1.2, -3.4, 9.0), (0.2, 3.1, 3.1)),
       (4.8, (1.7, -5.2, 2.35), (0.1, 4.0, 1.45)), (9.3, (1.3, -4.9, 2.3), (0.1, 4.0, 1.45)),
       (10.2, (2.25, 3.0, 2.05), (2.2, 5.75, 1.85)), (12.5, (2.2, 3.3, 2.0), (2.2, 5.75, 1.85)),
       (13.1, (1.9, 2.0, 2.35), (2.05, 5.75, 1.8)), (13.75, (1.85, 1.85, 2.38), (2.05, 5.75, 1.8))]
for t, p, q in CAM:
    cam.location = p; cam.keyframe_insert('location', frame=F(t)); tgt.location = q; tgt.keyframe_insert('location', frame=F(t))

# ── export projected anchors per frame (for the 2D overlay: captions, tags, chevrons, ring) ──
ANCH = {'dc_tag': (3.0, 4.2, 2.35), 'ac_tag': (-0.3, 5.75, 0.75), 'dcin': DCIN, 'acout': ACOUT, 'inv': (2.2, 5.6, 1.8), 'jbox': JB}
proj = []
for f in range(1, NF + 1):
    sc.frame_set(f); d = {}
    for k, p in ANCH.items(): v = world_to_camera_view(sc, cam, Vector(p)); d[k] = [v.x * 1080, (1 - v.y) * 1920]
    d['cable'] = [[v.x * 1080, (1 - v.y) * 1920] for v in (world_to_camera_view(sc, cam, Vector(p)) for p in CABLE)]
    proj.append(d)
json.dump({'TM': TM, 'proj': proj}, open(os.path.join(HERE, 'proj.json'), 'w'))

if arg('--save'): bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, arg('--save')))
os.makedirs(OUT, exist_ok=True)
if STILLS:
    for t in STILLS:
        sc.frame_set(F(t)); sc.render.filepath = os.path.join(OUT, f'still_{t:05.2f}.png'); bpy.ops.render.render(write_still=True)
elif '--anim' in argv:
    sc.render.filepath = os.path.join(OUT, 'f_'); bpy.ops.render.render(animation=True)

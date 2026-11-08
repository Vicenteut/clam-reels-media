# Ronda 2 · helpers comunes para las escenas de Blender (materiales, primitivas, texto 3D, cámara por claves, cuentas animadas).
import bpy, bmesh, math, os
from mathutils import Vector

FONTS = '/Users/ashleyarriaga/Desktop/Reels: AI Videos/skill/fonts/'
FPS = 30
F = lambda t: int(round(t * FPS)) + 1            # time (s) -> frame (frame 1 = t 0)

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

def setup(nframes, samples=16):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = 720, 1280      # rendered at 2/3 and upscaled in the 2D pass (text is drawn at full 1080x1920)
    for k, v in (('shadow_resolution_scale', 0.5), ('shadow_step_count', 2), ('shadow_ray_count', 1)):
        try: setattr(sc.eevee, k, v)
        except Exception: pass
    sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, nframes
    sc.view_settings.view_transform = 'Standard'
    sc.eevee.taa_render_samples = samples
    sc.render.image_settings.file_format = 'PNG'
    return sc

COLS = {}
def col(name):
    sc = bpy.context.scene
    if name not in COLS: c = bpy.data.collections.new(name); sc.collection.children.link(c); COLS[name] = c
    return COLS[name]
def link(o, c='main'):
    for cc in list(o.users_collection): cc.objects.unlink(o)
    col(c).objects.link(o); return o

# ── materials ──
def mat(name, color, rough=0.55, metal=0.0, emit=0.0, emit_col=None, alpha=1.0, spec=0.3):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal
    p.inputs['Specular IOR Level'].default_value = spec
    p.inputs['Emission Color'].default_value = (*(emit_col or color), 1); p.inputs['Emission Strength'].default_value = emit
    if alpha < 1:
        p.inputs['Alpha'].default_value = alpha; m.surface_render_method = 'BLENDED'; m.use_transparency_overlap = True
    return m
def mat_emit(name, color, strength=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = strength; nt.links.new(e.outputs[0], o.inputs[0]); return m
def mat_objcolor_emit(name, strength=3.0):        # emission colour from the object's colour (animatable per object)
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); oi = nt.nodes.new('ShaderNodeObjectInfo')
    nt.links.new(oi.outputs['Color'], e.inputs[0]); e.inputs[1].default_value = strength; nt.links.new(e.outputs[0], o.inputs[0]); return m
def key_input(m, inp, frames_vals):               # keyframe a Principled input: [(t, value)]
    p = m.node_tree.nodes['Principled BSDF'].inputs[inp]
    for t, v in frames_vals:
        p.default_value = v if not isinstance(v, tuple) else (*v, 1) if len(v) == 3 else v
        p.keyframe_insert('default_value', frame=F(t))

# ── primitives ──
def box(name, lo, hi, m=None, bevel=0.0, c='main'):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); link(o, c)
    o.location = [(a + b) / 2 for a, b in zip(lo, hi)]; o.scale = [b - a for a, b in zip(lo, hi)]
    if m: o.data.materials.append(m)
    if bevel: md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = 3; md.affect = 'EDGES'
    return o
def cyl(name, r, depth, loc, rot=(0, 0, 0), m=None, verts=48, c='main'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot); o = bpy.context.object; o.name = name
    link(o, c)
    if m: o.data.materials.append(m)
    bpy.ops.object.shade_smooth(); return o
def sphere(name, r, loc, m=None, c='main', seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc); o = bpy.context.object; o.name = name
    link(o, c)
    if m: o.data.materials.append(m)
    bpy.ops.object.shade_smooth(); return o
def ico(name, r, loc, m=None, c='main', sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc); o = bpy.context.object; o.name = name; link(o, c)
    if m: o.data.materials.append(m)
    return o
def tube(name, pts, r, m, c='main', res=4):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = res; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    o = bpy.data.objects.new(name, cu); link(o, c); o.data.materials.append(m); return o
def text3d(name, s, size=0.5, extrude=0.05, m=None, loc=(0, 0, 0), rot=(math.radians(90), 0, 0), align='CENTER', font='Inter-ExtraBold.ttf', c='main'):
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = s; cu.size = size; cu.extrude = extrude; cu.align_x = align; cu.align_y = 'CENTER'
    cu.font = bpy.data.fonts.load(FONTS + font, check_existing=True)
    o = bpy.data.objects.new(name, cu); link(o, c); o.location = loc; o.rotation_euler = rot
    if m: o.data.materials.append(m)
    return o

def vis(o, ranges):                                # visible only inside [(t0, t1), ...]; others hidden (render + viewport)
    o.hide_render = True; o.keyframe_insert('hide_render', frame=1)
    for t0, t1 in ranges:
        o.hide_render = False; o.keyframe_insert('hide_render', frame=max(1, F(t0)))
        o.hide_render = True; o.keyframe_insert('hide_render', frame=F(t1))
def key(o, path, kv, interp='BEZIER'):              # kv: [(t, value)]
    for t, v in kv:
        setattr(o, path, v); o.keyframe_insert(path, frame=F(t))
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves if hasattr(o.animation_data.action, 'fcurves') else []:
            if fc.data_path == path:
                for k in fc.keyframe_points: k.interpolation = interp

def camera(keys, lens=28):
    sc = bpy.context.scene
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_fit = 'VERTICAL'; cam.data.sensor_height = 36; cam.data.clip_end = 400
    tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt)
    tc = cam.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
    for t, p, q in keys:
        cam.location = p; cam.keyframe_insert('location', frame=F(t)); tgt.location = q; tgt.keyframe_insert('location', frame=F(t))
    return cam

# polyline helpers
def plen(P): L = [0.0]; [L.append(L[-1] + (Vector(P[i]) - Vector(P[i - 1])).length) for i in range(1, len(P))]; return L
def pat(P, L, d):
    d = max(0.0, min(d, L[-1]))
    for i in range(1, len(P)):
        if d <= L[i] + 1e-9: f = (d - L[i - 1]) / max(1e-9, L[i] - L[i - 1]); return Vector(P[i - 1]).lerp(Vector(P[i]), f)
    return Vector(P[-1])

def animate_beads(name, n, r, nframes, fn, c='beads', step=1):
    """fn(t) -> list of (pos Vector, scale, (r,g,b)) ; beads beyond the list are hidden. Keys every `step` frames."""
    m = mat_objcolor_emit(name + 'M', 1.4); obs = []
    for i in range(n):
        o = sphere(f'{name}{i}', r, (0, 0, -50), m, c, seg=12); o.visible_shadow = False; obs.append(o)
    for f in range(1, nframes + 1, step):
        t = (f - 1) / FPS; ps = fn(t)
        for i, o in enumerate(obs):
            if i < len(ps): p, s, colr = ps[i]
            else: p, s, colr = Vector((0, 0, -50)), 0.0, (0, 0, 0)
            o.location = p; o.scale = (s, s, s); o.color = (*colr, 1)
            o.keyframe_insert('location', frame=f); o.keyframe_insert('scale', frame=f); o.keyframe_insert('color', frame=f)
    return obs

def project_anchors(anchors, nframes, path_json):
    import json
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene; cam = sc.camera; out = []
    for f in range(1, nframes + 1):
        sc.frame_set(f); d = {}
        for k, p in anchors.items():
            v = world_to_camera_view(sc, cam, Vector(p)); d[k] = [round(v.x * 1080, 1), round((1 - v.y) * 1920, 1), round(v.z, 2)]
        out.append(d)
    json.dump(out, open(path_json, 'w'))

def render(here, argv, nframes):
    def arg(k, d=None): return argv[argv.index(k) + 1] if k in argv else d
    sc = bpy.context.scene
    out = arg('--out', os.path.join(here, 'frames'))
    stills = [float(x) for x in arg('--stills', '').split(',') if x]
    if arg('--scale'): sc.render.resolution_percentage = int(arg('--scale'))
    if arg('--save'): bpy.ops.wm.save_as_mainfile(filepath=os.path.join(here, arg('--save')))
    os.makedirs(out, exist_ok=True)
    if stills:
        for t in stills:
            sc.frame_set(F(t)); sc.render.filepath = os.path.join(out, f'still_{t:05.2f}.png'); bpy.ops.render.render(write_still=True)
    elif '--anim' in argv:
        sc.render.filepath = os.path.join(out, 'f_'); bpy.ops.render.render(animation=True)

def bbox(name, size, m=None, bevel=0.0, origin='center', c='main', seg=3):
    """box whose mesh has the real size (object scale stays 1, so scale animations and children behave). origin: 'center' | 'bottom'"""
    sx, sy, sz = size; bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z = v.co.z * sz + (sz / 2 if origin == 'bottom' else 0)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); link(o, c)
    if m: o.data.materials.append(m)
    if bevel: md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'NONE'
    return o

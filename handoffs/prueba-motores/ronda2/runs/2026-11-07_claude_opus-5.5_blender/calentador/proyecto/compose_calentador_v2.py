# Ronda 2 · calentador: capa 2D (subtítulos, rótulos con línea guía, títulos) sobre los fotogramas de Blender y codificación.
# Uso: python compose_calentador.py <frames_dir> <salida.mp4> [--stills t1,t2,... <dir>]
import sys, os, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from compose_lib import *

FR, OUT = sys.argv[1], sys.argv[2]
KIT = os.path.join(HERE, 'kit', 'calentador'); words = json.load(open(os.path.join(KIT, 'tiempos.json')))['palabras']
TM = json.load(open(os.path.join(HERE, 'tm_calentador.json')))['TM']; PROJ = json.load(open(os.path.join(HERE, 'proj_calentador.json')))
PH = phrases(words)
ACCENT = hexc('#2EE6A8')   # v2: accent changed (was #FFD23F)
EMPH = {'hot', 'pump', 'rises', 'black', 'copper', 'glass', 'traps', 'lighter', 'tank', 'above', 'colder', 'heavier', 'sinks', 'thermosiphon', 'insulated', 'night'}
HOT, COLD, RED = hexc('#FF4A1C'), hexc('#2E8BFF'), hexc('#E8402A')

def frame(i):
    t = i / FPS; pr = PROJ[min(i, len(PROJ) - 1)]
    im = load(FR, i); ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    # hook: no wires, no pump
    for k, (tt, txt, cx) in enumerate(((TM['wire'], '× NO WIRES', 330), (TM['pump'], '× NO PUMP', 750))):
        if tt <= t < TM['rises0'] - 0.6 + 0.35:
            a = int(255 * (1 - clamp((t - TM['rises0'] + 0.6) / 0.35))); pill(d, cx, 1330, txt, back((t - tt) / 0.35), RED, (255, 255, 255), 50, a)
    # hot water rises
    if TM['rises0'] - 0.1 <= t < TM['panel'] - 0.2:
        title(d, 'HOT WATER RISES ↑', t, TM['rises0'] - 0.1, TM['panel'] - 0.55, 1330, HOT, (255, 255, 255), 70)
    # panel anatomy
    label(d, pr['plate'], (20, 330), 'BLACK PLATE', t, TM['black'], TM['sunlight'] - 0.4, border=ACCENT)
    label(d, pr['tubes'], (-120, 420), 'COPPER TUBES', t, TM['copper'], TM['sunlight'] - 0.4, border=ACCENT)
    label(d, pr['glass'], (60, -200), 'GLASS', t, TM['glass'], TM['sunlight'] + 0.2, border=ACCENT)
    label(d, pr['plate'], (0, 360), 'HEAT TRAPPED', t, TM['traps'], TM['water'] - 0.2, bg=hexc('#FF7A2A'), fg=(255, 255, 255))
    # the loop
    label(d, pr['hot'], (-90, 430), 'HOT ↑', t, TM['rises'], TM['loop'] - 0.3, bg=HOT, fg=(255, 255, 255), size=50)
    label(d, pr['tank'], (-40, -170), 'TANK ABOVE PANEL', t, TM['above'], TM['colder'] + 0.6, border=ACCENT)
    label(d, pr['cold'], (-140, 420), 'COLD ↓', t, TM['sinks'], TM['loop'] - 0.3, bg=COLD, fg=(255, 255, 255), size=50)
    title(d, 'NO PUMP', t, TM['nopump'], TM['thermo'] - 0.3, 1380, RED, (255, 255, 255), 74)
    title(d, 'THERMOSIPHON', t, TM['thermo'] + 0.5, TM['insul'] - 0.9, 1330, ACCENT, size=88, sub='hot rises · cold sinks · no pump')
    label(d, pr['foam'], (40, 470), 'INSULATION', t, TM['insul'], TM['send'] - 0.3, border=ACCENT)
    captions(d, t, words, PH, EMPH, ACCENT)
    return Image.alpha_composite(im, ov).convert('RGB')

if __name__ == '__main__':
    if '--stills' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]; od = sys.argv[sys.argv.index('--stills') + 2]; os.makedirs(od, exist_ok=True)
        for t in ts: frame(int(round(t * FPS))).save(os.path.join(od, f't{t:05.2f}.jpg'), quality=90)
    else:
        n = len([f for f in os.listdir(FR) if f.startswith('f_')]); encode(frame, n, os.path.join(KIT, 'voz.wav'), OUT); print(OUT, n)

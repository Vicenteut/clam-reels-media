# Ronda 3 · sistema solar residencial: capa 2D (subtítulos, rótulos con línea guía, títulos) sobre los fotogramas de Blender + voz.
# Uso: python compose_solar.py <frames_dir> <salida.mp4> [--stills t1,t2,... <dir>]
# Todos los textos con Inter (tiene ↑ ↓ → ← ↔ × ·). Rótulos con nombre completo + abreviatura; el aire acondicionado nunca es "AC".
import sys, os, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from compose_lib import *

FR, OUT = sys.argv[1], sys.argv[2]
KIT = os.path.join(HERE, 'kit', 'solar'); words = json.load(open(os.path.join(KIT, 'tiempos.json')))['palabras']
T = json.load(open(os.path.join(HERE, 'tm_solar.json')))['TM']; PROJ = json.load(open(os.path.join(HERE, 'proj_solar.json')))
PH = phrases(words)
ACCENT = hexc('#FF5FA2')   # v2: accent changed (was #FFD23F)
INV_LABEL_DELAY = 0.5   # v2: inverter label 0.5 s later
EMPH = {'panels', 'direct', 'alternating', 'inverter', 'breaker', 'lights', 'fridge', 'grid', 'noon', 'extra', 'two-way', 'meter',
        'night', 'battery', 'bank', 'blackout', 'grid-tied', 'workers', 'batteries', 'hybrid', 'solar'}
DC, AC, RED, DARK = hexc('#FFB020'), hexc('#3FD5FF'), hexc('#E8402A'), (12, 18, 32)
W_TXT = (255, 255, 255)

def label(d, anchor, offset, txt, t, t0, t1, bg=(255, 255, 255), fg=(12, 18, 32), size=44, border=None):
    """like compose_lib.label but keeps the pill inside the frame (x 40..1040)"""
    if t < t0 or t > t1 + 0.3 or anchor[2] <= 0: return
    a = int(255 * (1 - clamp((t - t1) / 0.3))); s = back((t - t0) / 0.35)
    ax, ay = anchor[0], anchor[1]; px, py = ax + offset[0], ay + offset[1]
    w = d.textlength(txt, font=font(size)) + 44
    px = max(40 + w / 2, min(1040 - w / 2, px)); py = max(560, min(1560, py))
    k = ease((t - t0) / 0.25)
    d.line([(ax, ay), (ax + (px - ax) * k, ay + (py - ay) * k)], fill=(255, 255, 255, a), width=5)
    d.ellipse([ax - 10, ay - 10, ax + 10, ay + 10], fill=(255, 255, 255, a), outline=(12, 18, 32, a), width=3)
    pill(d, px, py, txt, s, bg, fg, size, a, border)

def frame(i):
    t = i / FPS; pr = PROJ[min(i, len(PROJ) - 1)]
    im = load(FR, i); ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    title(d, 'WHERE DOES THE POWER GO?', t, 0.05, T['sunlight'] - 0.4, 1360, ACCENT, size=64)
    # 2 · panels
    label(d, pr['panels'], (-60, -300), 'SOLAR PANELS', t, T['panels'] - 0.1, T['direct'] - 0.2, border=ACCENT)
    title(d, 'DIRECT CURRENT (DC)', t, T['direct'], T['adds'] - 0.3, 1360, DC, DARK, 62, sub='flows one way →')
    label(d, pr['jun'], (-220, 260), 'POWER ADDS UP', t, T['adds'], T['single'] - 0.2, border=DC)
    label(d, pr['cable'], (-260, -160), 'ONE CABLE', t, T['single'], T['house'] - 0.1, bg=DC, fg=DARK)
    # 3 · house wants AC → inverter
    title(d, 'HOUSE: ALTERNATING CURRENT (AC)', t, T['alternating'] - 0.1, T['inverter'] - 0.3, 1360, AC, DARK, 42, sub='back and forth ↔')
    ti = T['inverter'] + INV_LABEL_DELAY
    label(d, pr['inv'], (-300, -260), 'INVERTER', t, ti, T['from_'] - 0.2, bg=ACCENT, fg=DARK, size=56)
    if t >= T['converts'] - 0.05:
        title(d, 'DC → AC', t, T['converts'] - 0.05, T['from_'] - 0.2, 1360, (255, 255, 255), DARK, 72, sub='direct current → alternating current')
    # 4 · breaker panel → loads
    label(d, pr['brk'], (-60, -330), 'BREAKER PANEL', t, T['breaker'], T['plug'] - 0.2, border=AC)
    label(d, pr['lamp'], (-200, -170), 'LIGHTS', t, T['lights'], T['plug'] - 0.2, border=AC, size=40)
    label(d, pr['fridge'], (90, 260), 'FRIDGE', t, T['fridge'], T['plug'] - 0.2, border=AC, size=40)
    label(d, pr['ac1'], (-140, -250), 'AIR CONDITIONER', t, T['aircon'], T['plug'] - 0.2, border=AC, size=40)
    # 5 · more things: the grid covers the difference; more panels; bigger inverter; the inverter limit
    label(d, pr['ac2'], (60, -280), '+ SECOND AIR CONDITIONER', t, T['second'], T['cant'] - 0.1, bg=ACCENT, fg=DARK, size=40)
    title(d, "PANELS CAN'T KEEP UP", t, T['cant'], T['grid'] - 0.1, 1360, RED, W_TXT, 62)
    label(d, pr['drop'], (-330, -200), 'GRID COVERS THE DIFFERENCE', t, T['grid'], T['runsun'] - 0.2, bg=AC, fg=DARK, size=40)
    label(d, pr['row3'], (0, -300), '+ MORE PANELS', t, T['add'], T['bigger'] - 0.5, bg=ACCENT, fg=DARK)
    label(d, pr['inv'], (-280, -300), 'BIGGER INVERTER', t, T['bigger'], T['limits'] - 0.2, bg=ACCENT, fg=DARK, size=50)
    if T['limits'] - 0.1 <= t <= T['noon']:
        title(d, 'MAX POWER AT ONCE', t, T['limits'] - 0.1, T['noon'] - 0.35, 1340, (255, 255, 255), DARK, 60, sub='the inverter sets the limit')
        k = clamp((t - T['limits']) / 1.2); bx, by, bw = 290, 1530, 500           # gauge filling up to the limit
        a = int(255 * (1 - clamp((t - T['noon'] + 0.35) / 0.35)))
        d.rounded_rectangle([bx, by, bx + bw, by + 44], radius=22, fill=(8, 14, 28, int(a * 0.8)), outline=(255, 255, 255, a), width=4)
        d.rounded_rectangle([bx + 6, by + 6, bx + 6 + (bw - 12) * k, by + 38], radius=16, fill=DC + (a,))
        d.line([(bx + bw - 30, by - 14), (bx + bw - 30, by + 58)], fill=RED + (a,), width=6)
        d.text((bx + bw - 30, by - 22), 'MAX', font=font(30), fill=RED + (a,), anchor='md')
    # 6 · noon: extra out to the grid, two-way meter
    title(d, 'NOON: YOU MAKE MORE THAN YOU USE', t, T['noon'], T['extra'] - 0.3, 1360, ACCENT, DARK, 42)
    label(d, pr['drop'], (-300, -220), 'EXTRA → TO THE GRID', t, T['extra'], T['twoway'] - 0.2, bg=AC, fg=DARK, size=42)
    label(d, pr['meter'], (-300, 230), 'TWO-WAY METER  ↔', t, T['twoway'], T['night'] - 0.2, bg=(255, 255, 255), fg=DARK, size=44, border=AC)
    # 7 · night: battery bank or the grid
    title(d, 'NIGHT: THE PANELS STOP', t, T['night'], T['battery'] - 0.4, 1360, (40, 60, 110), W_TXT, 54)
    label(d, pr['bat'], (-280, -260), 'BATTERY BANK', t, T['battery'], T['without'] - 0.1, bg=hexc('#46E08A'), fg=DARK, size=50)
    if T['stores'] <= t <= T['without']: pill(d, 540, 1480, 'charged with the extra from the day', back((t - T['stores']) / 0.35), (8, 14, 28), W_TXT, 38)
    title(d, 'NO BATTERY? POWER FROM THE GRID', t, T['without'], T['blackout'] - 0.3, 1360, AC, DARK, 42)
    # 8 · blackout
    title(d, 'BLACKOUT', t, T['blackout'] - 0.1, T['gridtied'] + 0.6, 1360, RED, W_TXT, 80)
    label(d, pr['pole'], (-280, 250), '× GRID DOWN', t, T['blackout'], T['only'] - 0.2, bg=RED, fg=W_TXT, size=46)
    label(d, pr['inv'], (-320, -260), 'GRID-TIED SYSTEM: OFF', t, T['shuts'], T['protect'] - 0.2, bg=RED, fg=W_TXT, size=44)
    label(d, pr['worker'], (-330, 230), 'KEEPS LINE WORKERS SAFE', t, T['workers'], T['only'] - 0.2, bg=ACCENT, fg=DARK, size=40)
    label(d, pr['bat'], (-300, -300), 'BATTERIES', t, T['batteries'], T['know'] - 0.1, bg=hexc('#46E08A'), fg=DARK, size=48)
    label(d, pr['inv'], (-330, -190), 'HYBRID INVERTER', t, T['hybrid'], T['know'] - 0.1, bg=ACCENT, fg=DARK, size=46)
    if t >= T['lightson'] - 0.1: title(d, 'LIGHTS STAY ON', t, T['lightson'] - 0.1, T['know'] - 0.2, 1360, hexc('#46E08A'), DARK, 64)
    # 9 · close
    title(d, 'SEND THIS TO SOMEONE', t, T['send'] - 0.2, T['end'] + 1, 1360, ACCENT, DARK, 64, sub='thinking about solar')
    captions(d, t, words, PH, EMPH, ACCENT)
    return Image.alpha_composite(im, ov).convert('RGB')

if __name__ == '__main__':
    if '--stills' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]; od = sys.argv[sys.argv.index('--stills') + 2]; os.makedirs(od, exist_ok=True)
        for t in ts: frame(int(round(t * FPS))).save(os.path.join(od, f't{t:05.2f}.jpg'), quality=90)
    else:
        n = len([f for f in os.listdir(FR) if f.startswith('f_')]); encode(frame, n, os.path.join(KIT, 'voz.wav'), OUT); print(OUT, n)

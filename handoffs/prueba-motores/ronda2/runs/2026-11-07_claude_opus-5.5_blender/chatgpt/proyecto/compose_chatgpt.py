# Ronda 2 · ChatGPT: capa 2D (subtítulos, porcentajes, rótulos, títulos) sobre los fotogramas de Blender y codificación.
# Uso: python compose_chatgpt.py <frames_dir> <salida.mp4> [--stills t1,t2,... <dir>]
import sys, os, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from compose_lib import *

FR, OUT = sys.argv[1], sys.argv[2]
KIT = os.path.join(HERE, 'kit', 'chatgpt'); words = json.load(open(os.path.join(KIT, 'tiempos.json')))['palabras']
TM = json.load(open(os.path.join(HERE, 'tm_chatgpt.json')))['TM']; PROJ = json.load(open(os.path.join(HERE, 'proj_chatgpt.json')))
PH = phrases(words)
ACCENT = hexc('#FFD23F')
EMPH = {'different', 'never', 'piece', 'tokens', 'every', 'probability', 'blue', 'clear', 'falling', 'top', 'dice', 'usually', 'sometimes', 'chosen', 'repeats', 'roll', 'apart'}
RED, BLUE, CLEAR, FALL, GREY = hexc('#E8402A'), hexc('#4D9DFF'), hexc('#9FE3FF'), hexc('#FF6F61'), hexc('#6C7393')
WHITE, DARK = (255, 255, 255), (12, 18, 32)

def pct(d, anchor, txt, t, t0, t1, bg, dy=-40, size=44):
    if t < t0 or t > t1 + 0.3 or anchor[2] <= 0: return
    f = font(size); half = (d.textlength(txt, font=f) + 44) / 2
    cx = min(max(anchor[0], 40 + half), 1000 - half)            # keep the pill inside the safe area
    a = int(255 * (1 - clamp((t - t1) / 0.3))); pill(d, cx, anchor[1] + dy, txt, back((t - t0) / 0.35), bg, DARK, size, a)

def frame(i):
    t = i / FPS; pr = PROJ[min(i, len(PROJ) - 1)]
    im = load(FR, i); ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    title(d, 'SAME QUESTION', t, 0.6, TM['different'] - 0.1, 1610, WHITE, DARK, 58)
    title(d, 'DIFFERENT ANSWERS', t, TM['different'], TM['never'] - 0.5, 1610, ACCENT, DARK, 58)
    # "never looks up an answer": cross over the database
    if TM['looks'] <= t < TM['writes'] + 0.2:
        a = int(255 * (1 - clamp((t - TM['writes']) / 0.2))); x, y = pr['db'][0], pr['db'][1]; k = ease((t - TM['looks']) / 0.3) * 190
        d.line([(x - k, y - k), (x + k, y + k)], fill=RED + (a,), width=26); d.line([(x - k, y + k), (x + k, y - k)], fill=RED + (a,), width=26)
        title(d, 'NO STORED ANSWER', t, TM['looks'] + 0.2, TM['writes'], 1440, RED, WHITE, 56)
    title(d, 'ONE PIECE AT A TIME', t, TM['one'], TM['first'] + 0.3, 1440, WHITE, DARK, 56)
    title(d, 'TOKENS', t, TM['tokens'], TM['model'] + 0.4, 1350, ACCENT, DARK, 96, sub='pieces of words')
    title(d, '100,000+ TOKENS', t, TM['over'], TM['probability'] - 0.3, 1460, WHITE, DARK, 60)
    title(d, 'EACH GETS A PROBABILITY', t, TM['probability'], TM['after'] - 0.2, 1460, ACCENT, DARK, 52)
    # the example
    pct(d, pr['bar_blue'], 'blue 60%', t, TM['blue'], TM['chosen'] - 0.3, BLUE, size=54)
    pct(d, pr['bar_clear'], 'clear 20%', t, TM['clear'], TM['chosen'] - 0.3, CLEAR)
    pct(d, pr['bar_falling'], 'falling ≈0%', t, TM['falling'], TM['chosen'] - 0.3, FALL, dy=75)
    pct(d, pr['bar_others'], 'others 20%', t, TM['zero'] + 0.2, TM['chosen'] - 0.3, GREY)
    title(d, 'ALL TOGETHER = 100%', t, TM['zero'] + 0.5, TM['but'] - 0.1, 1500, WHITE, DARK, 50)
    title(d, 'NOT ALWAYS THE TOP ONE', t, TM['but'], TM['rolls'] - 0.1, 1500, RED, WHITE, 52)
    label(d, pr['die'], (60, 300), 'WEIGHTED DICE', t, TM['rolls'], TM['likely'] - 0.2, border=ACCENT)
    title(d, 'PICKED: blue', t, TM['win'] - 0.2, TM['sometimes'] - 0.2, 1500, BLUE, DARK, 56)
    title(d, 'PICKED: clear', t, TM['sneaks'] - 0.1, TM['chosen'] - 0.1, 1500, CLEAR, DARK, 56)
    title(d, 'ADD IT → REPEAT', t, TM['repeats'] - 0.4, TM['so'] - 0.2, 1450, ACCENT, DARK, 56)
    for k, (key, dy, t0) in enumerate((('row1', -105, TM['drift'] - 0.3), ('row2', 110, TM['drift'] - 0.1))):
        if t >= t0 and pr[key][2] > 0: pill(d, 250, pr[key][1] + dy, f'ANSWER {k + 1}', back((t - t0) / 0.35), WHITE, DARK, 44, 255, ACCENT)
    captions(d, t, words, PH, EMPH, ACCENT)
    return Image.alpha_composite(im, ov).convert('RGB')

if __name__ == '__main__':
    if '--stills' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]; od = sys.argv[sys.argv.index('--stills') + 2]; os.makedirs(od, exist_ok=True)
        for t in ts: frame(int(round(t * FPS))).save(os.path.join(od, f't{t:05.2f}.jpg'), quality=90)
    else:
        n = len([f for f in os.listdir(FR) if f.startswith('f_')]); encode(frame, n, os.path.join(KIT, 'voz.wav'), OUT); print(OUT, n)

# Prueba de motores · corrida Blender, paso 2: capa 2D sobre los fotogramas de Blender.
# Brillo (glow) de la energía, subtítulos por frases, rótulos DC/AC/DC IN/AC OUT/INVERTER, chevrones «one way», anillo de
# destello y viñeta; luego codifica con la voz del kit.  Uso:  python compose.py <frames_dir> <salida.mp4> [rotulo_inversor]
import sys, os, json, math, subprocess, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FR, OUT = sys.argv[1], sys.argv[2]
LABEL = sys.argv[3] if len(sys.argv) > 3 else 'INVERTER'
FONTS = '/Users/ashleyarriaga/Desktop/Reels: AI Videos/skill/fonts/'
def fG(s):
    f = ImageFont.truetype(FONTS + 'SpaceGrotesk-700-normal.woff2', s); f.set_variation_by_axes([700]); return f   # variable font: force Bold
fS = lambda s: ImageFont.truetype(FONTS + 'InstrumentSerif-400-italic.woff2', s)
fM = lambda s: ImageFont.truetype(FONTS + 'JetBrainsMono-700-normal.woff2', s)
W_, H_, FPS = 1080, 1920, 30
words = json.load(open(os.path.join(HERE, 'tiempos.json')))['palabras']
P = json.load(open(os.path.join(HERE, 'proj.json'))); TM, PROJ = P['TM'], P['proj']
PHRASES = [(0, 4), (5, 9), (10, 14), (15, 16), (17, 21), (22, 25), (26, 30), (31, 35), (36, 38)]
EMPH = {3, 15, 38}
DC, AC, INK, NAVY = (255, 176, 32), (63, 213, 255), (230, 246, 255), (11, 42, 85)

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def back(u):                                   # ease-out-back 0..1 (pop)
    u = clamp(u); c = 1.70158; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2

def captions(d, t):
    cur = None
    for k, (a, b) in enumerate(PHRASES):
        if t >= words[a]['s'] - 0.12: cur = (a, b)
    if not cur: return
    a, b = cur; x, y, maxw, lh = 110, 300, 860, 96
    for i in range(a, b + 1):
        w = words[i]; f = fS(92) if i in EMPH else fG(76)
        token = w['w'] + ' '; tw = d.textlength(token, font=f)
        if x + tw - 110 > maxw: x, y = 110, y + lh
        if t >= w['s'] - 0.06:
            al = int(255 * clamp((t - w['s'] + 0.06) / 0.12))
            d.text((x + 3, y + 4), token, font=f, fill=(0, 10, 30, int(al * 0.5)))
            d.text((x, y), token, font=f, fill=(255, 255, 255, al))
        x += tw

def pill(d, cx, cy, s, txt, col, size=60, alpha=255):
    if s <= 0.01: return
    f = fG(int(size * s)); tw = d.textlength(txt, font=f); h = size * 1.35 * s; w = tw + 34 * s
    d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h / 2, fill=col + (alpha,))
    d.text((cx, cy + 1), txt, font=f, fill=NAVY + (alpha,), anchor='mm')

def along(pts, d):
    L = [0.0]
    for i in range(1, len(pts)): L.append(L[-1] + math.dist(pts[i - 1], pts[i]))
    d = clamp(d, 0, L[-1])
    for i in range(1, len(pts)):
        if d <= L[i]:
            f = (d - L[i - 1]) / max(1e-6, L[i] - L[i - 1]); a, b = pts[i - 1], pts[i]
            return a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, math.atan2(b[1] - a[1], b[0] - a[0]), L[-1]
    return pts[-1][0], pts[-1][1], 0, L[-1]

X, Y = np.meshgrid(np.linspace(-1, 1, W_), np.linspace(-1, 1, H_))
VIG = (1 - 0.32 * np.clip(X ** 2 + Y ** 2 - 0.35, 0, 1.3))[..., None].astype(np.float32)

def frame(i):
    t = i / FPS; pr = PROJ[i]
    img = cv2.imread(os.path.join(FR, f'f_{i + 1:04d}.png')).astype(np.float32)
    # glow on the saturated emissive energy (amber / cyan)
    hsv = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 1] > 120) & (hsv[..., 2] > 170)).astype(np.float32)
    glow = np.clip(cv2.GaussianBlur(img * m[..., None], (0, 0), 16) * 0.9 + cv2.GaussianBlur(img * m[..., None], (0, 0), 5) * 0.35, 0, 255)
    img = (255 - (255 - img) * (255 - glow) / 255) * VIG          # screen blend keeps amber amber
    im = Image.fromarray(cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    # chevrons on "one way" along the projected DC cable
    if TM['oneWay'] <= t < TM['house']:
        a = clamp((t - TM['oneWay']) / 0.25) * (1 - clamp((t - TM['house'] + 0.4) / 0.4)); pts = pr['cable']
        tot = along(pts, 0)[3]
        for k in range(3):
            x, y, ang, _ = along(pts, tot * (0.25 + 0.22 * k) + (t * 60) % 30)
            c, s_ = math.cos(ang), math.sin(ang); al = int(255 * a * (0.6 + 0.4 * math.sin(t * 8 - k)))
            p1 = (x - 12 * c + 18 * s_, y - 12 * s_ - 18 * c); p2 = (x + 8 * c, y + 8 * s_); p3 = (x - 12 * c - 18 * s_, y - 12 * s_ + 18 * c)
            d.line([p1, p2, p3], fill=DC + (al,), width=7, joint='curve')
    # tags
    if t < TM['inv'] + 0.3:
        dt = t - TM['dcLab']
        if dt >= 0: x, y = pr['dc_tag']; pill(d, x, y, back(dt / 0.35), 'DC', DC, alpha=int(255 * (1 - clamp((t - TM['inv'] + 0.1) / 0.3))))
    dt = t - TM['acLab']
    if dt >= 0 and t < TM['gap'] + 0.6:
        x, y = pr['ac_tag']; pill(d, x, y, back(dt / 0.35), 'AC', AC, alpha=int(255 * (1 - clamp((t - TM['gap']) / 0.5))))
    if t >= TM['flips']:
        x, y = pr['dcin']; d.text((x - 22, y - 14), 'DC IN', font=fM(40), fill=DC + (255,), anchor='rs')
        if t >= TM['flips'] + 0.15: x, y = pr['acout']; d.text((x + 22, y + 50), 'AC OUT', font=fM(40), fill=AC + (255,), anchor='ls')
    # flash ring + label at "inverter"
    dl = t - TM['mat']
    if 0 < dl < 0.7:
        x, y = pr['inv']; r = 120 + dl * 520; d.ellipse([x - r, y - r, x + r, y + r], outline=INK + (int(255 * (1 - dl / 0.7)),), width=6)
    if dl >= 0:
        s = back(dl / 0.4); sz = int((60 if len(LABEL) > 10 else 74) * s)
        parts = [(p, ImageFont.truetype(FONTS + 'Inter-Bold.ttf', sz) if p == '→' else fG(sz)) for p in LABEL.replace('→', '\x00→\x00').split('\x00') if p]   # → is not in Space Grotesk
        tw = sum(d.textlength(p, font=f) for p, f in parts); h = 116 * s; w = tw + 80 * s
        cx, cy = W_ / 2, 520
        d.rounded_rectangle([cx - w / 2 + 8, cy - h / 2 + 10, cx + w / 2 + 8, cy + h / 2 + 10], radius=h / 2, fill=(0, 0, 0, 80))
        d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h / 2, fill=INK + (255,), outline=(255, 122, 26, 255), width=max(1, int(6 * s)))
        x0 = cx - tw / 2
        for p, f in parts: d.text((x0, cy + 2), p, font=f, fill=NAVY + (255,), anchor='lm'); x0 += d.textlength(p, font=f)
    captions(d, t)
    return Image.alpha_composite(im, ov).convert('RGB')

if __name__ == '__main__':
    n = len([f for f in os.listdir(FR) if f.startswith('f_') and f.endswith('.png')])
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W_}x{H_}', '-r', str(FPS), '-i', '-',
                          '-i', os.path.join(HERE, 'voz.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
                          '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    for i in range(n): p.stdin.write(frame(i).tobytes())
    p.stdin.close(); p.wait(); print(OUT, n, 'frames')

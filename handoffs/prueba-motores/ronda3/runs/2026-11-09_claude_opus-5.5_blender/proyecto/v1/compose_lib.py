# Ronda 2 · capa 2D común sobre los fotogramas de Blender: subtítulos de alto contraste, píldoras, rótulos con línea guía,
# títulos. Todo con Inter (tiene todos los glifos usados: ↑ ↓ → × % ·). Codifica con la voz del kit.
import json, math, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont

FONTS = '/Users/ashleyarriaga/Desktop/Reels: AI Videos/skill/fonts/'
W_, H_, FPS = 1080, 1920, 30
_fc = {}
def font(size, w='ExtraBold'):
    k = (size, w)
    if k not in _fc: _fc[k] = ImageFont.truetype(FONTS + f'Inter-{w}.ttf', max(1, int(size)))
    return _fc[k]
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def back(u):
    u = clamp(u); c = 1.70158; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2
def ease(u): u = clamp(u); return u * u * (3 - 2 * u)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def phrases(words, maxw=6):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        gap = words[i + 1]['s'] - w['e'] if i + 1 < len(words) else 9
        if w['w'][-1] in '.,?!:;' or len(cur) >= maxw or gap > 0.35: out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def captions(d, t, words, PH, emph, accent, y0=210):
    cur = None
    for ph in PH:
        if t >= words[ph[0]]['s'] - 0.1: cur = ph
    if cur is None or t > words[cur[-1]]['e'] + 1.2: return
    f = font(70); lines, line, wsum = [], [], 0
    for i in cur:
        tw = d.textlength(words[i]['w'] + ' ', font=f)
        if line and wsum + tw > 880: lines.append(line); line, wsum = [], 0
        line.append(i); wsum += tw
    if line: lines.append(line)
    y = y0
    for ln in lines:
        txt = ' '.join(words[i]['w'] for i in ln); tw = d.textlength(txt, font=f); x = (W_ - tw) / 2
        d.rounded_rectangle([x - 26, y - 14, x + tw + 26, y + 84], radius=22, fill=(8, 14, 28, 200))
        for i in ln:
            w = words[i]; s = w['w'] + ' '; on = t >= w['s'] - 0.05
            key = w['w'].lower().strip('.,?!:;')
            colr = (accent if key in emph else (255, 255, 255)) if on else (255, 255, 255)
            d.text((x, y), s, font=f, fill=colr + (255 if on else 110,)); x += d.textlength(s, font=f)
        y += 100

def pill(d, cx, cy, txt, s=1.0, bg=(255, 255, 255), fg=(12, 18, 32), size=46, alpha=255, border=None):
    if s <= 0.02 or alpha <= 0: return
    f = font(size * s); tw = d.textlength(txt, font=f); h = size * 1.55 * s; w = tw + 44 * s
    d.rounded_rectangle([cx - w / 2 + 6, cy - h / 2 + 8, cx + w / 2 + 6, cy + h / 2 + 8], radius=h / 2, fill=(0, 0, 0, int(alpha * 0.35)))
    d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h / 2, fill=bg + (alpha,), outline=(border + (alpha,)) if border else None, width=max(1, int(5 * s)))
    d.text((cx, cy + 1), txt, font=f, fill=fg + (alpha,), anchor='mm')
    return w, h

def label(d, anchor, offset, txt, t, t0, t1, bg=(255, 255, 255), fg=(12, 18, 32), size=44, border=None):
    """pill at anchor+offset with a leader line + dot at the anchor; pops in at t0, fades at t1"""
    if t < t0 or t > t1 + 0.3 or anchor[2] <= 0: return
    a = int(255 * (1 - clamp((t - t1) / 0.3))); s = back((t - t0) / 0.35)
    ax, ay = anchor[0], anchor[1]; px, py = ax + offset[0], ay + offset[1]
    k = ease((t - t0) / 0.25)
    d.line([(ax, ay), (ax + (px - ax) * k, ay + (py - ay) * k)], fill=(255, 255, 255, a), width=5)
    d.ellipse([ax - 10, ay - 10, ax + 10, ay + 10], fill=(255, 255, 255, a), outline=(12, 18, 32, a), width=3)
    pill(d, px, py, txt, s, bg, fg, size, a, border)

def title(d, txt, t, t0, t1, cy, bg, fg=(12, 18, 32), size=86, sub=None):
    if t < t0 or t > t1 + 0.35: return
    a = int(255 * (1 - clamp((t - t1) / 0.35))); s = back((t - t0) / 0.4)
    pill(d, W_ / 2, cy, txt, s, bg, fg, size, a)
    if sub: pill(d, W_ / 2, cy + size * 1.25 * s, sub, s * 0.9, (8, 14, 28), (255, 255, 255), 38, a)

def encode(frame_fn, n, voz, out):
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W_}x{H_}', '-r', str(FPS), '-i', '-',
                          '-i', voz, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
                          '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(n): p.stdin.write(frame_fn(i).tobytes())
    p.stdin.close(); p.wait()

X_, Y_ = np.meshgrid(np.linspace(-1, 1, W_), np.linspace(-1, 1, H_))
VIG = (1 - 0.22 * np.clip(X_ ** 2 + Y_ ** 2 - 0.45, 0, 1.3))[..., None].astype(np.float32)
def load(fr_dir, i):
    im = np.asarray(Image.open(os.path.join(fr_dir, f'f_{i + 1:04d}.png')).convert('RGB').resize((W_, H_), Image.LANCZOS)).astype(np.float32) * VIG
    return Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).convert('RGBA')

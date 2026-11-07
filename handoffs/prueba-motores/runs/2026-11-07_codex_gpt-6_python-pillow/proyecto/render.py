#!/usr/bin/env python3
"""Original parametric blueprint animation. All coordinates are 1080x1920 pixels.

No generated images, external footage, network requests or paid services.
Run: python render.py --config config_v1.json --render
Frames are streamed to FFmpeg; no intermediate image sequence is required.
"""
from pathlib import Path
import argparse, functools, hashlib, json, math, subprocess, time
from datetime import datetime, timezone
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / 'materiales' / 'entradas'
if not KIT.exists(): KIT = ROOT.parents[1] / 'kit'
FPS, W, H, SS = 30, 1080, 1920, 1.5
TIMING = json.loads((KIT / 'tiempos.json').read_text())
WORDS = TIMING['palabras']
N = math.ceil(TIMING['duracion_s'] * FPS)
BLUE, WHITE, MUTED = '#0B2A55', '#E6F6FF', '#8FB4D4'
AMBER, CYAN = '#FFB020', '#3FD5FF'
EVENTS = {'panels': 1, 'dc': 3, 'one_way': 8, 'house': 12,
          'ac': 15, 'back_forth': 19, 'box': 30, 'connect': 32, 'materialize': 38}
FRAMES = {k: math.ceil(WORDS[i]['s'] * FPS) for k, i in EVENTS.items()}
CAPTIONS = [(0, 2), (3, 4), (5, 7), (8, 9), (10, 14), (15, 16),
            (17, 18), (19, 21), (22, 25), (26, 30), (31, 35), (36, 38)]

def rgb(color, alpha=255):
    if isinstance(color, tuple):
        return color[:3] + (int(alpha),)
    return tuple(int(color[i:i+2], 16) for i in (1, 3, 5)) + (int(alpha),)

def clamp(v): return min(1., max(0., v))
def ease(v):
    v = clamp(v)
    return v*v*(3-2*v)
def progress(frame, start, duration):
    return clamp((frame-start+1) / max(1, duration)) if frame >= start else 0.
def lerp(a,b,t): return tuple(x+(y-x)*t for x,y in zip(a,b))
def length(points):
    return sum(math.dist(a,b) for a,b in zip(points,points[1:]))
def at(points, u):
    distance = clamp(u)*length(points)
    for a,b in zip(points,points[1:]):
        segment = math.dist(a,b)
        if distance <= segment:
            return lerp(a,b,distance/segment if segment else 0)
        distance -= segment
    return points[-1]
def partial(points, u):
    if u <= 0: return []
    distance = clamp(u)*length(points)
    out = [points[0]]
    for a,b in zip(points,points[1:]):
        segment = math.dist(a,b)
        if distance < segment:
            out.append(lerp(a,b,distance/segment if segment else 0)); break
        out.append(b); distance -= segment
    return out

FONT_BOLD = [Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf'),
             Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')]
FONT_REGULAR = [Path('/System/Library/Fonts/Supplemental/Arial.ttf'),
                Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')]
@functools.lru_cache(maxsize=64)
def font(size, bold=True):
    choices = FONT_BOLD if bold else FONT_REGULAR
    p = next((p for p in choices if p.exists()), None)
    if p is None: raise FileNotFoundError('Install Arial or DejaVu Sans; see README.md')
    return ImageFont.truetype(str(p), round(size*SS))

class Canvas:
    def __init__(self, background):
        self.im = background.copy()
        self.d = ImageDraw.Draw(self.im, 'RGBA')
    def pts(self, p): return [(round(x*SS), round(y*SS)) for x,y in p]
    def line(self, pts, color=WHITE, width=3, alpha=255, glow=False):
        if len(pts)<2 or alpha<=0: return
        coords=self.pts(pts)
        if glow:
            for extra,a in [(13,.025),(8,.045),(4,.09)]:
                self.d.line(coords, fill=rgb(color,alpha*a), width=round((width+extra)*SS), joint='curve')
        self.d.line(coords, fill=rgb(color,alpha), width=max(1,round(width*SS)), joint='curve')
        r=width/2
        for x,y in [pts[0],pts[-1]]:
            self.circle((x,y),r,color,alpha)
    def trace(self, pts, p, color=WHITE, width=3, alpha=255, pen=True):
        seg=partial(pts,p)
        self.line(seg,color,width,alpha,True)
        if pen and 0<p<1:
            self.dot(seg[-1],3.5,WHITE,alpha)
    def poly(self, pts, color, alpha=255):
        if alpha>0: self.d.polygon(self.pts(pts), fill=rgb(color,alpha))
    def rect(self, box, color, alpha=255, radius=0, outline=None, width=1):
        box=tuple(round(x*SS) for x in box)
        self.d.rounded_rectangle(box, radius=round(radius*SS), fill=rgb(color,alpha),
            outline=rgb(outline,alpha) if outline else None, width=max(1,round(width*SS)))
    def circle(self, p, r, color, alpha=255):
        x,y=p
        self.d.ellipse(tuple(round(k*SS) for k in (x-r,y-r,x+r,y+r)),fill=rgb(color,alpha))
    def dot(self,p,r,color,alpha=255):
        self.circle(p,r*3,color,alpha*.035)
        self.circle(p,r*2,color,alpha*.08)
        self.circle(p,r,color,alpha)
        self.circle(p,r*.3,WHITE,alpha*.9)
    def text(self, xy, text, size, color=WHITE, alpha=255, bold=True, anchor='la'):
        self.d.text(tuple(round(x*SS) for x in xy),text,font=font(size,bold),fill=rgb(color,alpha),anchor=anchor)
    def dash(self, pts, color=WHITE, width=1, alpha=80, dash=10, gap=9):
        ll=length(pts)
        for d in np.arange(0,ll,dash+gap):
            self.line([at(pts,d/ll),at(pts,min(1,(d+dash)/ll))],color,width,alpha)
    def arrow(self, p, angle, color, size=9, alpha=255):
        x,y=p
        side1=(x-size*math.cos(angle-.6),y-size*math.sin(angle-.6))
        side2=(x-size*math.cos(angle+.6),y-size*math.sin(angle+.6))
        self.line([side1,p,side2],color,3,alpha)
    def finish(self):
        return self.im.resize((W,H),Image.Resampling.LANCZOS)

@functools.lru_cache(maxsize=1)
def background():
    yy,xx=np.mgrid[0:round(H*SS),0:round(W*SS)].astype(np.float32)
    xx/=W*SS; yy/=H*SS
    light=np.exp(-(((xx-.42)/.67)**2+((yy-.46)/.6)**2))*1.0
    arr=np.empty((round(H*SS),round(W*SS),3),dtype=np.uint8)
    for ch,(lo,hi) in enumerate([(8,16),(28,57),(61,108)]):
        arr[:,:,ch]=lo+(hi-lo)*light
    c=Canvas(Image.fromarray(arr,'RGB'))
    for x in range(0,W+1,30): c.line([(x,0),(x,H)],WHITE,1,15 if x%150 else 27)
    for y in range(0,H+1,30): c.line([(0,y),(W,y)],WHITE,1,15 if y%150 else 27)
    # Safe frame: all essential information stays left of x=900, above y=1670.
    c.text((76,108),'SOLAR POWER',22,alpha=190)
    c.text((877,108),'03 / CONVERSION',18,alpha=155,bold=False,anchor='ra')
    c.line([(76,154),(879,154)],WHITE,1,75)
    for x,y,sx,sy in [(76,485,1,1),(879,485,-1,1),(76,1335,1,-1),(879,1335,-1,-1)]:
        c.line([(x,y+sy*20),(x,y),(x+sx*20,y)],WHITE,2,82)
    c.line([(112,1290),(846,1290)],WHITE,1,55)
    for x in (185,830):
        c.line([(x,1277),(x,1303)],WHITE,1,80)
        c.line([(x-5,1295),(x+5,1285)],WHITE,1,100)
    return c.im

ROOF=[(150,820),(310,602),(750,602),(870,820),(150,820)]
RIDGE=[(310,602),(337,578),(761,578),(887,796),(870,820)]
HOUSE=[(185,820),(185,1250),(830,1250),(830,820)]
SIDE=[(830,1250),(857,1227),(857,820)]
PANEL=[(306,661),(674,661),(768,787),(216,787)]
BOX=[(275,1040),(415,1040),(415,1210),(275,1210),(275,1040)]
AC_OPEN=[(500,1125),(540,1125),(540,960),(707,960),(707,1002)]
AC_CLOSED=[(415,1125)]+AC_OPEN
DC_DIRECT=[(240,787),(275,1125)]
DC_WALL=[(240,787),(195,841),(195,1125),(275,1125)]

def roof(c,f):
    p=ease(progress(f,0,28))
    c.trace(ROOF,p,WHITE,2,150)
    c.trace(RIDGE,progress(f,8,26),WHITE,2,85)
    c.line([(185,834),(830,834)],WHITE,1,45)
    # Original solar module, mapped as a quadrilateral, with independent cell lines.
    a,b,d,e=PANEL
    fill=ease(progress(f,FRAMES['panels']+24,16))
    c.poly(PANEL,'#123A68',fill*255)
    c.trace(PANEL+[a],progress(f,FRAMES['panels'],24),WHITE,3,255)
    for k in range(1,9):
        u=k/9
        start=FRAMES['panels']+7+k
        c.trace([lerp(a,b,u),lerp(e,d,u)],progress(f,start,18),WHITE,2,155)
    for k in range(1,4):
        u=k/4
        c.trace([lerp(a,e,u),lerp(b,d,u)],progress(f,FRAMES['panels']+10+k*2,18),WHITE,2,155)
    c.trace([lerp(a,b,.5),lerp(e,d,.5)],progress(f,26,14),WHITE,4,235)
    if fill:
        c.poly([a,b,lerp(b,d,.15),lerp(a,e,.15)],'#90DFFF',fill*20)
    if f>=FRAMES['panels']:
        c.trace([(152,672),(102,672),(102,741)],progress(f,10,20),WHITE,1,80)
        c.text((103,645),'01',18,alpha=110,bold=False)

def house(c,f):
    p=progress(f,FRAMES['house'],29)
    if not p: return
    fill=ease(progress(f,FRAMES['house']+23,18))
    c.poly([(185,835),(830,835),(830,1250),(185,1250)],'#205082',fill*170)
    c.poly([(830,835),(857,814),(857,1227),(830,1250)],'#123963',fill*230)
    c.trace(HOUSE,p,WHITE,3,230)
    c.trace(SIDE,progress(f,FRAMES['house']+13,20),WHITE,2,140)
    # Recessed view of one domestic lighting load.
    room=[(505,869),(800,869),(800,1215),(505,1215),(505,869)]
    c.poly(room[:-1],'#0A294E',fill*235)
    c.trace(room,progress(f,FRAMES['house']+8,27),WHITE,2,105)
    c.trace([(505,1215),(538,1187),(800,1187)],progress(f,142,23),WHITE,1,75)
    c.trace([(538,1187),(538,1049)],progress(f,151,20),WHITE,1,50)
    # Context markings on the solid exterior wall, never wires.
    for y in [873,935,997,1240]:
        c.line([(204,y),(453,y)],WHITE,1,25*fill)
    c.text((342,867),'02 / HOUSE',17,alpha=130*fill,bold=False)
    lamp_p=progress(f,FRAMES['house']+14,24)
    c.trace([(707,1002),(707,1030),(673,1074),(741,1074),(707,1030)],lamp_p,WHITE,3,225)
    c.trace([(683,1083),(731,1083)],lamp_p,WHITE,2,190)
    if f>=FRAMES['ac']:
        pulse=.72+.28*math.sin((f-FRAMES['ac'])/FPS*2*math.pi*1.25)
        c.poly([(682,1090),(732,1090),(786,1194),(625,1194)],CYAN,18*pulse)
        c.line([(684,1083),(730,1083)],CYAN,4,255,True)
        c.dot((707,1082),4,CYAN)

def dc(c,f,config):
    if f<FRAMES['dc']: return
    route=DC_WALL if config['cable_route']=='wall' else DC_DIRECT
    p=progress(f,FRAMES['dc'],24)
    # An open connector ends at the reserved converter space until box assembly.
    c.trace(route,p,AMBER,3,230)
    for offset in (0,.23,.46,.69,.92):
        u=((f-FRAMES['dc'])/FPS*.43+offset)%1
        if u<=p:
            c.dot(at(route,u),4.7,AMBER)
    c.circle(route[0],5,AMBER)
    c.circle(route[-1],5,AMBER,180)
    c.text((288,925),'DC',42,AMBER)
    c.line([(283,984),(272,984)],AMBER,1,120)
    if f>=FRAMES['one_way']:
        if config['cable_route']=='wall':
            c.arrow((195,1049),math.pi/2,AMBER,12)
        else:
            c.arrow(at(route,.775),math.atan2(338,35),AMBER,12)
    return route

def ac(c,f,config):
    if f<FRAMES['ac']: return
    connection=FRAMES['connect']+config['box_delay_frames']
    c.trace(AC_OPEN,progress(f,FRAMES['ac'],23),CYAN,3,210)
    if f>=connection:
        c.trace([(415,1125),(500,1125)],progress(f,connection,7),CYAN,3,230)
    # Every particle follows a bounded sinusoid; none travels one way continuously.
    phase=(f-FRAMES['ac'])/FPS*2*math.pi*1.25
    route=AC_CLOSED if f>=connection+7 else AC_OPEN
    for u in (.18,.38,.58,.78):
        pos=u+.075*math.sin(phase)
        c.dot(at(route,pos),4.7,CYAN)
    c.circle(AC_OPEN[0],4,CYAN,180 if f<connection else 0)
    c.text((653,892),'AC',42,CYAN)
    if f>=FRAMES['back_forth']:
        bright1=100+155*(.5+.5*math.cos(phase))
        bright2=355-bright1
        c.arrow((618,990),math.pi,CYAN,9,bright1)
        c.arrow((673,990),0,CYAN,9,bright2)

def converter(c,f,config):
    start=FRAMES['box']+config['box_delay_frames']
    if f<start: return
    p=progress(f,start,13)
    mat=ease(progress(f,FRAMES['materialize'],16))
    side=[(415,1040),(434,1025),(434,1195),(415,1210)]
    top=[(275,1040),(294,1025),(434,1025),(415,1040)]
    if mat>0:
        c.rect((284,1050,448,1224),'#04162F',mat*160,7)
        c.poly(side,'#7C9FBB',255*mat)
        c.poly(top,'#E9F9FF',255*mat)
        c.rect((275,1040,415,1210),'#C5DBE8',255*mat,7)
        c.rect((284,1049,406,1201),'#E2F0F5',255*mat,4)
        c.rect((297,1072,392,1111),'#133453',255*mat,4)
    c.trace(BOX,p,WHITE,3,255)
    c.trace([(275,1040),(294,1025),(434,1025),(434,1195),(415,1210)],progress(f,start+4,16),WHITE,2,180)
    c.trace([(415,1040),(434,1025)],p,WHITE,2,180)
    detail=progress(f,start+8,15)
    c.trace([(297,1111),(297,1072),(392,1072),(392,1111),(297,1111)],detail,WHITE,2,210)
    if detail>=.9:
        c.line([(307,1087),(330,1087)],AMBER,3,255)
        wave=[(346+i*.9,1091+5*math.sin(i/45*2*math.pi)) for i in range(46)]
        c.line(wave,CYAN,2,255)
        c.circle((345,1136),5,CYAN)
    for k in range(5):
        y=1160+k*7
        c.trace([(304,y),(386,y)],progress(f,start+12+k,8),'#446583' if mat>.6 else WHITE,2,160)
    c.circle((275,1125),6,AMBER)
    if f>=FRAMES['connect']+config['box_delay_frames']:
        c.circle((415,1125),6,CYAN)
    if f>=FRAMES['materialize']:
        # Surface is revealed locally from wireframe; terminal colors stay semantic.
        c.trace([(345,1232),(345,1363),(145,1415)],progress(f,FRAMES['materialize'],10),WHITE,2,150)

def scope(c, f, x, y, dc_type):
    color=AMBER if dc_type else CYAN
    c.rect((x,y,x+370,y+172),'#08254C',230,13,outline='#315884')
    c.text((x+22,y+17),'DC' if dc_type else 'AC',32,color)
    c.text((x+346,y+27),'ONE WAY' if dc_type else 'BACK & FORTH',16,WHITE,185,anchor='ra')
    c.line([(x+24,y+109),(x+346,y+109)],WHITE,1,45)
    if dc_type:
        c.line([(x+24,y+96),(x+346,y+96)],color,3,230,True)
        for k in range(4):
            u=(f/FPS*.38+k*.25)%1
            c.dot((x+24+322*u,y+96),4,color)
        c.arrow((x+320,y+96),0,color,9)
    else:
        # Stationary sine profile: moving dots and marker explicitly reverse direction.
        pts=[(x+24+i*322/100,y+109-27*math.sin(i/100*math.pi*4)) for i in range(101)]
        c.line(pts,color,3,240,True)
        u=.5+.38*math.sin((f-FRAMES['ac'])/FPS*2*math.pi*1.25)
        c.dot((x+24+322*u,y+109-27*math.sin(u*math.pi*4)),5,color)
    c.text((x+23,y+139),'CURRENT / DIRECTION' if dc_type else 'OSCILLATION / SLOW VIEW',12,WHITE,95,bold=False)

def info(c,f,config):
    if f<FRAMES['materialize']:
        if f>=FRAMES['dc']: scope(c,f,80,1428,True)
        if f>=FRAMES['ac']: scope(c,f,482,1428,False)
        if f>=FRAMES['connect']+config['box_delay_frames']:
            c.arrow((472,1514),0,WHITE,8,180)
    else:
        c.text((80,1435),'THE CONVERSION POINT',19,WHITE,175,bold=False)
        label=config['inverter_label']
        size=65 if label=='INVERTER' else 48
        c.text((77,1482),label,size,WHITE)
        # Abstract port schematic, kept consistent with the physical connection above.
        c.line([(84,1594),(330,1594)],AMBER,3,210,True)
        c.line([(559,1594),(840,1594)],CYAN,3,210,True)
        c.rect((350,1570,539,1618),'#244E78',255,6,outline=WHITE,width=2)
        c.text((369,1580),'DC',23,AMBER)
        c.arrow((456,1594),0,WHITE,10)
        c.line([(430,1594),(455,1594)],WHITE,2)
        c.text((479,1580),'AC',23,CYAN)
        for i in range(4):
            c.dot((84+246*((f/FPS*.4+i*.25)%1),1594),3.6,AMBER)
            c.dot((581+i*70+12*math.sin(f/FPS*2*math.pi*1.25),1594),3.6,CYAN)

def captions(c,f):
    active=None
    for j,(a,b) in enumerate(CAPTIONS):
        start=math.ceil(WORDS[a]['s']*FPS)
        end=math.ceil(WORDS[CAPTIONS[j+1][0]]['s']*FPS) if j+1<len(CAPTIONS) else N
        if start<=f<end: active=(a,b); break
    if active:
        a,b=active
        text=' '.join(w['w'] for w in WORDS[a:b+1])
        lines=[]; line=''
        for word in text.split():
            trial=(line+' '+word).strip()
            if font(66).getlength(trial)/SS>790:
                lines.append(line); line=word
            else: line=trial
        if line: lines.append(line)
        y=251 if len(lines)==1 else 213
        for i,line in enumerate(lines): c.text((477,y+i*79),line,66,'#FFFFFF',anchor='ma')
    # Tiny chapter marks communicate continuity without extra explanatory copy.
    phase=0 if f<FRAMES['house'] else 1 if f<FRAMES['box'] else 2
    for k in range(3):
        x=424+k*39
        c.line([(x,412),(x+23,412)],WHITE,3,220 if k==phase else 50)

def frame(index,config):
    c=Canvas(background())
    roof(c,index)
    house(c,index)
    dc(c,index,config)
    ac(c,index,config)
    converter(c,index,config)
    info(c,index,config)
    captions(c,index)
    return c.finish()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--config',default='config_v1.json')
    parser.add_argument('--render',action='store_true')
    parser.add_argument('--preview',action='store_true')
    args=parser.parse_args()
    cfgpath=Path(args.config)
    if not cfgpath.is_absolute(): cfgpath=Path(__file__).parent/cfgpath
    cfg=json.loads(cfgpath.read_text())
    version=cfg['version']
    if args.preview:
        out=ROOT/'materiales'/f'preview_{version}'
        out.mkdir(parents=True,exist_ok=True)
        times=[.55,1.1,3.4,6.0,7.5,10.4,11.0,13.0,13.6]
        thumbs=[]
        for t in times:
            im=frame(round(t*FPS),cfg)
            im.save(out/f'{t:04.1f}s.png')
            thumbs.append(im.resize((270,480),Image.Resampling.LANCZOS))
        sheet=Image.new('RGB',(270*3,480*3))
        for i,im in enumerate(thumbs): sheet.paste(im,((i%3)*270,(i//3)*480))
        sheet.save(ROOT/'materiales'/f'contacto_{version}.jpg',quality=94)
        print(f'Preview: {out}',flush=True)
    if args.render:
        output=ROOT/f'final_{version}.mp4'
        cmd=['ffmpeg','-hide_banner','-loglevel','warning','-y',
             '-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
             '-i',str(KIT/'voz.wav'),'-map','0:v:0','-map','1:a:0',
             '-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p',
             '-c:a','aac','-b:a','192k','-ar','48000','-ac','1',
             '-movflags','+faststart','-metadata','title=Solar power — conversion',str(output)]
        began=datetime.now(timezone.utc).isoformat(); tick=time.perf_counter()
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
        try:
            for i in range(N):
                proc.stdin.write(frame(i,cfg).tobytes())
                if i%60==0: print(f'{version}: {i}/{N}',flush=True)
            proc.stdin.close()
            if proc.wait(): raise RuntimeError('FFmpeg failed')
        except BaseException:
            proc.kill(); raise
        elapsed=time.perf_counter()-tick
        manifest={'version':version,'started_utc':began,'render_seconds':elapsed,'frames':N,
                  'video_duration':N/FPS,'audio_sha256':hashlib.sha256((KIT/'voz.wav').read_bytes()).hexdigest(),
                  'mp4_sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
                  'config':cfg,'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  'command':cmd,'anchors':[]}
        for key,word in EVENTS.items():
            frameidx=FRAMES[key]+(cfg['box_delay_frames'] if key in ('box','connect') else 0)
            manifest['anchors'].append({'event':key,'word':WORDS[word]['w'],'word_seconds':WORDS[word]['s'],
                        'frame':frameidx,'time':frameidx/FPS,'delta_ms':round((frameidx/FPS-WORDS[word]['s'])*1000,3)})
        (ROOT/'evidencia'/f'render_{version}.json').write_text(json.dumps(manifest,indent=2)+'\n')
        print(f'Complete: {output}; {elapsed:.2f}s',flush=True)

if __name__=='__main__': main()

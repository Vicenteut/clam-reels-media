from pathlib import Path
import subprocess, json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
TIMES=[1.1,3.4,6.0,7.5,10.4,11.0,13.0]
manifest={}
for ver in ['v1','v2']:
    video=ROOT/f'final_{ver}.mp4'
    out=ROOT/'stills' if ver=='v1' else ROOT/'stills'/'v2'
    out.mkdir(parents=True,exist_ok=True)
    records=[]
    for t in TIMES:
        filename=f't{t:04.1f}s.png'
        frame=round(t*30)
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-vf',f'select=eq(n\\,{frame})','-frames:v','1',str(out/filename)],check=True)
        records.append({'time_seconds':t,'frame_zero_based':frame,'file':str((out/filename).relative_to(ROOT))})
    manifest[ver]=records
    sheet=Image.new('RGB',(4*270,2*480),'#0B2A55')
    for i,item in enumerate(records):
        im=Image.open(ROOT/item['file']).resize((270,480),Image.Resampling.LANCZOS)
        sheet.paste(im,((i%4)*270,(i//4)*480))
    sheet.save(ROOT/'evidencia'/f'stills_{ver}.jpg',quality=94)
(ROOT/'evidencia/stills.json').write_text(json.dumps(manifest,indent=2)+'\n')

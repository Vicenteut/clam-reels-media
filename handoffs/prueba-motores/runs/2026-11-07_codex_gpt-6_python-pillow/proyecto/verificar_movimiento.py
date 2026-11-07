"""Measure an actual cyan particle in the encoded video before connection."""
from pathlib import Path
import json, subprocess
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
results={}
for ver in ('v1','v2'):
    path=ROOT/f'final_{ver}.mp4'
    if not path.exists(): continue
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vf','crop=80:20:620:950','-f','rawvideo','-pix_fmt','rgb24','-'])
    frames=np.frombuffer(raw,np.uint8).reshape(-1,20,80,3)
    indices=np.arange(180,300)
    observed=[]
    for i in indices:
        a=frames[i]
        white=(a[:,:,0]>150)&(a[:,:,1]>190)&(a[:,:,2]>200)
        yy,xx=np.where(white)
        observed.append(float(xx.mean()+620) if len(xx) else float('nan'))
    observed=np.array(observed)
    expected=335+414*(.78+.075*np.sin((indices-158)/30*2*np.pi*1.25))
    ok=np.isfinite(observed)
    correlation=float(np.corrcoef(observed[ok],expected[ok])[0,1])
    delta=np.diff(observed)
    results[ver]={'sampled_frames':[180,299],'roi':[620,950,80,20],
        'detected_frames':int(ok.sum()),'total_sampled':120,
        'min_x':float(np.nanmin(observed)),'max_x':float(np.nanmax(observed)),
        'positive_displacements':int((delta>.5).sum()),'negative_displacements':int((delta<-.5).sum()),
        'correlation_with_bounded_sinusoid':correlation,
        'passed':bool(ok.all() and correlation>.98 and (delta>.5).sum()>20 and (delta<-.5).sum()>20),
        'observed_x':observed.tolist(),
        'note':'Encoded AC marker reverses in same cable; this measures visual motion, not physical 50/60 Hz.'}
(ROOT/'evidencia'/'movimiento_ac.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({k:{x:y for x,y in v.items() if x!='observed_x'} for k,v in results.items()},indent=2))
assert all(r['passed'] for r in results.values())

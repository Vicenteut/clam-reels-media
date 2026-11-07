"""Detect visible events in decoded MP4 pixels; no reliance on render manifests."""
from pathlib import Path
import subprocess,json
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
# Each ROI excludes unrelated dynamic objects; coordinates refer to the final MP4.
ROIS={
 'panels':(310,659,30,8,'white',8,10),
 'dc_label':(288,930,70,45,'amber',40,35),
 'house':(183,842,6,24,'white',15,130),
 'ac_label':(653,896,70,45,'cyan',40,158),
 'box':(280,1036,130,8,'white',20,310),
 'inverter_label':(80,1492,360,25,'white',100,380),
}
result={}
for ver in ['v1','v2']:
 results={}
 for name,(x,y,w,h,kind,minimum,expected) in ROIS.items():
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(ROOT/f'final_{ver}.mp4'),'-vf',f'crop={w}:{h}:{x}:{y}:exact=1','-f','rawvideo','-pix_fmt','rgb24','-'])
  a=np.frombuffer(raw,np.uint8).reshape(-1,h,w,3)
  if kind=='white': mask=(a[:,:,:,0]>140)&(a[:,:,:,1]>160)&(a[:,:,:,2]>180)
  elif kind=='amber': mask=(a[:,:,:,0]>180)&(a[:,:,:,1]>100)&(a[:,:,:,1]<225)&(a[:,:,:,2]<110)
  else: mask=(a[:,:,:,0]<120)&(a[:,:,:,1]>150)&(a[:,:,:,2]>200)
  counts=mask.sum(axis=(1,2))
  found=np.where(counts>=minimum)[0]
  first=int(found[0]) if len(found) else None
  if ver=='v2' and name=='box': expected+=15
  results[name]={'roi':[x,y,w,h],'threshold_type':kind,'minimum_pixels':minimum,'first_visible_frame':first,'expected_frame':expected,'passed':first==expected}
 result[ver]=results
result['limitations']='Pixel thresholds detect onset of chosen visible contours/labels, not a human perceptual judgement of materialization.'
(ROOT/'evidencia/anclas_visibles.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
assert all(item['passed'] for ver in ['v1','v2'] for item in result[ver].values())

# Builds edit_decisions for the templated Explainer (OpenMontage scene types) and renders via video_compose.
# Usage: python work/build_edit.py <variant v1|v2>   (run from repo root)
import json, sys, time
from pathlib import Path
V = sys.argv[1] if len(sys.argv) > 1 else 'v1'
P = Path('projects/solar-residencial')
W = json.load(open(P/'assets/audio/tiempos.json'))['palabras']
t = lambda i: W[i]['s']
ACCENT = '#22C55E'          # green accent (v2 correction)
INV_DELAY = 0.5             # inverter label +0.5 s (v2 correction)
SEL = str((P/'assets/video/sel').resolve())
DC, ACc = 'Direct current (DC)', 'Alternating current (AC)'
cuts = [
 dict(id='c01', type='text_card', text='Where does the\nsolar power go?', fontSize=96, in_seconds=0, out_seconds=t(14),
      backgroundVideo=f'{SEL}/house_cc0.mp4', backgroundVideoStart=1, backgroundOverlay=0.45),
 dict(id='c02', type='callout', title='Sunlight → panels', text=f'Each panel makes a little {DC}.', in_seconds=t(14), out_seconds=t(26),
      backgroundVideo=f'{SEL}/house_cc0.mp4', backgroundVideoStart=14, backgroundOverlay=0.6),
 dict(id='c03', type='text_card', text='Panels wired together\n→ their power adds up\n→ one single cable', in_seconds=t(26), out_seconds=t(40)),
 dict(id='c04', type='comparison', title='Two kinds of current', leftLabel='Panels make', leftValue=DC, rightLabel='Your house runs on', rightValue=ACc, in_seconds=t(40), out_seconds=t(53)+INV_DELAY),
 dict(id='c05', type='callout', title='Inverter', text=f'A box that converts {DC} into {ACc}.', in_seconds=t(53)+INV_DELAY, out_seconds=t(63)),
 dict(id='c06', type='text_card', text='Inverter\n→ breaker panel\n→ lights · fridge · air conditioner', in_seconds=t(63), out_seconds=t(85)),
 dict(id='c07', type='bar_chart', title='Add a second air conditioner', chartData=[{'label':'Solar makes','value':60},{'label':'House uses','value':90},{'label':'Grid covers','value':30}], showValues=False, in_seconds=t(85), out_seconds=t(107)),
 dict(id='c08', type='progress_bar', title='The inverter limits power at once', progress=100, progressLabel='More panels + sometimes a bigger inverter', in_seconds=t(107), out_seconds=t(133)),
 dict(id='c09', type='callout', title='Noon', text='You make more than you use → the extra flows to the grid. In many places a two-way meter counts it.', in_seconds=t(133), out_seconds=t(159)),
 dict(id='c10', type='comparison', title='At night the panels stop', leftLabel='With a battery bank', leftValue='Your own stored power', rightLabel='Without batteries', rightValue='Power from the grid', in_seconds=t(159), out_seconds=t(190)),
 dict(id='c11', type='callout', title='Blackout', text='A normal grid-tied system shuts itself off to protect the workers fixing the lines.', in_seconds=t(190), out_seconds=t(208),
      backgroundVideo=f'{SEL}/linemen_ccby.mp4', backgroundVideoStart=0, backgroundOverlay=0.6),
 dict(id='c12', type='text_card', text='Batteries\n+ hybrid inverter\n= lights on', fontSize=88, in_seconds=t(208), out_seconds=t(218),
      backgroundVideo=f'{SEL}/nightlights_pd.mp4', backgroundVideoStart=0, backgroundOverlay=0.55),
 dict(id='c13', type='text_card', text='Thinking about solar?\nSend them this.', fontSize=84, in_seconds=t(218), out_seconds=77.78),
]
for c in cuts:
    c.setdefault('source', 'none'); c['accentColor'] = ACCENT
    if c['type']=='callout': c.update(fontSize=54, titleFontSize=64)
    if c['type']=='text_card': c.setdefault('fontSize', 72)
captions = [{'word': w['w'], 'startMs': round(w['s']*1000), 'endMs': round(w['e']*1000), 'pageBreakAfter': w['w'][-1] in '.?,'} for w in W]
ed = {'version': '1.0', 'render_runtime': 'remotion', 'renderer_family': 'explainer-data', 'playbook': 'flat-motion-graphics',
      'composition_mode': 'templated', 'tailPaddingSeconds': 0, 'cuts': cuts, 'overlays': [], 'captions': captions,
      'subtitles': {'caption_props': {'wordsPerPage': 4, 'fontSize': 64, 'highlightColor': ACCENT}},
      'audio': {'narration': {'src': str((P/'assets/audio/voz.wav').resolve()), 'volume': 1}}}
(P/'artifacts').mkdir(exist_ok=True)
json.dump(ed, open(P/f'artifacts/edit_decisions_{V}.json', 'w'), indent=1)
from tools.tool_registry import registry
registry.discover()
vc = registry._tools['video_compose']
t0 = time.time()
r = vc.execute({'operation': 'remotion_render', 'edit_decisions': ed, 'output_path': str(P/f'renders/raw_{V}.mp4'), 'profile': 'instagram_reels', 'remotion_timeout_ms': 120000, 'remotion_concurrency': 4})
print('render s', round(time.time()-t0,1), r.success, (r.error or '')[:800])

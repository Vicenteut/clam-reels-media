// ───────── timeline: canvas-calentador (classic print look: cream paper, ink, one accent, pointing presenter) ─────────
// Ronda 2 de la prueba de motores. Metáfora: el propio calentador, construido y luego en corte, con el agua visible (roja = caliente,
// azul = fría) circulando sola. Todo cuelga de palabras (wi(i) = índice de build/word_index.txt).
SCENE_FILES = ['scenes/kit.js', 'scenes/hook.js', 'scenes/panel.js', 'scenes/loop.js', 'scenes/night.js'];

const CUT_PANEL = wi(26) - 0.1;      // "The flat panel…"
const CUT_LOOP = wi(64) - 0.1;       // "So the water in the tubes…"
const CUT_NIGHT = wi(113) - 0.1;     // "And because the tank is insulated…"
END_AT = 47.898;                     // = kit/calentador/voz.wav

// corrección §4 (v2): cuándo aparece el rótulo THERMOSIPHON (v1: en la palabra)
const THERMO_DELAY = 0;

TIMELINE = () => [['hook', 0], ['panel', CUT_PANEL], ['loop', CUT_LOOP], ['night', CUT_NIGHT]];
PHRASES = null;
READOUT = null;

for (const t of [CUT_PANEL, CUT_LOOP, CUT_NIGHT]) cue(t - 0.1, 'whoosh', -6);
wipe(CUT_LOOP, 1);

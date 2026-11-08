// ───────── timeline: canvas-chatgpt (classic print look; generic chat UI, no third-party logos) ─────────
// Ronda 2 de la prueba de motores. Metáfora: el texto como fichas (tokens) que entran en una máquina, salen con su probabilidad, y una
// ruleta con peso elige la siguiente; la frase crece ficha a ficha y dos tiradas distintas hacen que dos respuestas se separen.
SCENE_FILES = ['scenes/kit.js', 'scenes/hook.js', 'scenes/tokens.js', 'scenes/roll.js', 'scenes/repeat.js'];

const CUT_TOKENS = wi(29) - 0.1;     // "First, your message…"
const CUT_ROLL = wi(62) - 0.1;       // "After 'The sky is'…"
const CUT_REPEAT = wi(102) - 0.1;    // "The chosen token…"
END_AT = 55.081;                     // = kit/chatgpt/voz.wav

// corrección §4 (v2): cuándo aparece el rótulo TOKENS (v1: en la palabra)
const TOKENS_DELAY = 0;

TIMELINE = () => [['hook', 0], ['tokens', CUT_TOKENS], ['roll', CUT_ROLL], ['repeat', CUT_REPEAT]];
PHRASES = null;
READOUT = null;

for (const t of [CUT_TOKENS, CUT_ROLL, CUT_REPEAT]) cue(t - 0.1, 'whoosh', -6);
wipe(CUT_ROLL, 1);

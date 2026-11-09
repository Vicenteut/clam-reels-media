# Registro de corrida · Ronda 3 · Remotion

## Identificación
- Fecha: 09/11/2026 · Agente: Claude Code (subagente) · Modelo: Claude Opus 5.5 (`claude-opus-5-5`).
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB. Node 26.7.0.
- Herramientas: Remotion 4.0.541 (`remotion`, `@remotion/cli`), React 19.3.1, TypeScript 5.9.3, Chrome Headless Shell de Remotion y FFmpeg (incluido en Remotion).
- Proyecto de trabajo: `~/clam-tests/remotion-r3/`. Reutiliza los `node_modules` de la ronda 1 mediante un enlace simbólico; la instalación es de 0 bytes nuevos.
- Licencias: Remotion tiene licencia propia, gratis para personas o equipos de hasta 3 personas. React es MIT; Inter, OFL. Coste: 0.

## E1 · Guion visual
`guion-visual.md`: un corte isométrico vivo con un solo mundo, cámara por estaciones y panel de energía abajo.

## E2 · Materiales
- Dibujo por código en SVG, sin IA y con 0 regeneraciones.
- Cambios respecto a la ronda 2:
  - **Textos grandes:** subtítulos de 70 px y rótulos y panel de 36–40 px.
  - **Sin espacio vacío:** el panel ocupa la franja inferior y el mundo llena el centro.
  - **Profundidad:** isometría con sombreado por caras y colinas con paralaje.

## E3–E4 · Animación y acabado
- **Sincronía:** todos los tiempos salen de índices de palabra (`wi(i)` sobre `tiempos.json`). Los rótulos aparecen 0,05–0,1 s antes de su palabra; la cámara llega unos 0,3–0,5 s antes de cada estación, a propósito, para que la mirada ya esté ahí.
- **Energía:** la corriente continua avanza en un sentido y la alterna oscila con amplitud fija a 1,4 Hz visual. No representa los 50/60 Hz reales.
- **Revisión de los hechos que suspenden, en los fotogramas:**
  - el camino es paneles → inversor → tablero → cargas;
  - continua antes del inversor y alterna después;
  - se exporta solo con el excedente del mediodía;
  - de noche, los paneles apagados y la energía de las baterías o de la red;
  - en el apagón, el inversor en OFF, sin flujo y SOLAR=0 aunque haya sol, hasta que entran las baterías con el híbrido;
  - el inversor nunca aparece como fuente;
  - el medidor no se asocia a ningún país.
- **Correcciones antes de entregar v1:**
  1. El techo tapaba el interior. Lo levanté más y lo hice semitransparente en las escenas interiores.
  2. El rótulo «Direct current (DC)» se solapaba con «Inverter»; ahora desaparece antes.
  3. «Lights» se solapaba con «Fridge»; lo moví.
  4. «Blackout» se solapaba con «Inverter: OFF»; lo moví.
- **Render:** v1 final en 47 s (2.334 fotogramas a 1080×1920, concurrencia 3), más 3 renders de borrador y unos 25 fotogramas sueltos de revisión.
- **Salida:** 77,80 s (la voz dura 77,78 s, dentro de 1 fotograma). H.264 + AAC, 18,2 MB.

## Intervenciones humanas
Ninguna durante la corrida.

## Tiempos
- **Agente:** unos 15 min de reloj (11:20–11:35 aprox.). Incluye diseño, código, revisión, dos renders de v1, la corrección y la documentación.
- **Humano:** 0. **Coste:** 0.

## E5 · Corrección (§5), hecha después de entregar v1 y sin variante preparada
| Cambio | Archivos tocados | Edición | Máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| Rótulo del inversor +0,5 s | `Solar.tsx`: constante `INV_LABEL` (1 línea) | ~1 min con la decisión; la escritura, al instante | 52 s de render (los dos cambios juntos) | No. Ahora aparece en «a box», no en «inverter». |
| Acento naranja → violeta `#8B5CF6` | `Solar.tsx`: constante `ACCENT` (1 línea) | (incluido) | (incluido) | No. Cambian a la vez los rótulos, el énfasis de los subtítulos, la barra HOME, el anillo y la tarjeta final. |

- El diff está en `proyecto/v2/cambios.diff` y el archivo completo, en `proyecto/v2/Solar.v2.tsx`.
- **Aviso de imparcialidad:** que `ACCENT` e `INV_LABEL` fueran constantes con nombre es buena práctica habitual de diseño, no una variante preparada. Aun así, ya conocía el tipo de corrección por las rondas anteriores.

## Autoevaluación
- **Qué funcionó:**
  - el recorrido de la energía se sigue sin perder la referencia;
  - el panel de energía hace entendibles los casos «la red cubre la diferencia», «sobra y se exporta», «noche» y «apagón» incluso sin sonido;
  - render rápido (menos de 1 min);
  - correcciones de 1 línea.
- **Qué no funcionó o es mejorable:**
  - en el plano del techo, el techo opaco tapa la parte alta del interior;
  - el plano general del gancho deja la casa algo pequeña;
  - los cables de la casa (turquesa) están dibujados desde el principio, aunque solo llevan corriente cuando corresponde;
  - el trabajador del poste es pequeño;
  - los objetos son esquemáticos (cajas isométricas), menos ricos que un 3D real.

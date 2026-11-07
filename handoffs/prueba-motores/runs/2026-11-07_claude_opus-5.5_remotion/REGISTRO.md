# Registro de corrida

## Identificación
- Fecha: 07/11/2026
- Agente: Claude Code (app de escritorio), subagente de la misma sesión que hizo la corrida `2026-11-07_claude_opus-5.5_motor-propio-canvas2d`
- Modelo exacto: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB RAM
- Herramienta principal: **Remotion 4.0.541** (`remotion`, `@remotion/cli`, `@remotion/paths`), React 19.3.1, TypeScript 5. Render con el Chrome Headless Shell que descarga Remotion.
- Otras herramientas: FFmpeg 9.0.2 (solo para extraer fotogramas de control).
- Licencias: Remotion tiene licencia propia (gratis para personas y equipos de hasta 3 personas según su web; no verificado en esta corrida); React MIT; fuentes OFL. Coste: 0.
- Tamaño de instalación: `node_modules` 253 MB + navegador de Remotion 461 MB (≈ 0,95 GB en total). Instalación: 25 s.

**Importante para comparar:** esta corrida reutiliza a propósito el guion visual, la geometría y los tiempos de la corrida Canvas del mismo agente. El objetivo es aislar el motor (Remotion frente al motor propio), no el diseño. Equivale a una mini «ronda 2 controlada».

## E1 · Guion visual
- Archivo: `guion-visual.md` (idéntico al de la corrida Canvas).

## E2 · Materiales
- Tipo: SVG generado por componentes React (sin imágenes). Ver `materiales/README.md`.
- Generador: ninguno. Regeneraciones: 0.

## E3–E4 · Animación y acabado
- Trazado progresivo: `evolvePath()` de `@remotion/paths` (strokeDasharray/offset) con `interpolate` + `Easing.out(Easing.cubic)`; punta luminosa con `getPointAtLength`.
- Materialización: `clipPath` SVG cuya altura sigue a `interpolate`; barrido con gradiente; anillo de destello.
- Rótulos: «DC» y «AC» como grupos SVG con `spring()`; «INVERTER» como `<div>` HTML (el ancho se ajusta solo al texto).
- Subtítulos: componente React propio, palabra a palabra, frases cortadas por puntuación (las de más de 7 palabras se parten en dos), énfasis en serif cursiva.
- Sincronía: tiempos derivados de los índices de palabra de `tiempos.json`, igual que en Canvas (mismos adelantos intencionados de 0,10–0,15 s en los trazos).
- Audio: `<Audio>` con `kit/voz.wav` **sin efectos de sonido y sin normalizar** (la corrida Canvas lleva 7 efectos sintetizados y la voz a −14 LUFS). Al comparar, tenerlo en cuenta.
- Tiempo de render: 17 s para v1 (413 fotogramas, 1080×1920, H.264 + AAC). Un fotograma suelto (`remotion still`): ~40 s la primera vez (empaquetado y arranque del navegador).

## Intervenciones humanas
| # | Qué se pidió o corrigió | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna. | | |

Corrección propia tras revisar el primer fotograma: la sombra del inversor materializado quedaba cortada por el recorte; se amplió el recorte al terminar.

## Tiempos
- Horas de trabajo del agente: ~0,4 h (portar geometría a SVG/React, subtítulos, carga de fuentes, revisión, v1, v2, registro).
- Horas humanas: 0.
- Coste: 0.

## E5 · Prueba de corrección
La variante **no** estaba preparada en el código; se editó después de entregar v1. Aun así, el agente ya conocía los tres cambios por la corrida Canvas, así que el tiempo de «pensar qué tocar» es casi nulo y no es comparable con un agente que llega en frío.

| Cambio | Archivos tocados | Tiempo humano | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| 1. Recorrido del cable | `src/geometry.ts` (`CABLE`) | 0 | 15 s de render (los 3 juntos) | No |
| 2. Inversor 0,5 s más tarde | `src/geometry.ts` (`TM.inv`, `TM.flips`) | 0 | (incluido) | No |
| 3. Rótulo «INVERTER · DC → AC» | `src/geometry.ts` (`LABEL`) + `src/Plano.tsx` (tamaño de letra para textos largos) | 0 | (incluido) | No |

Tiempo real entre v1 entregado y v2 renderizado: 25 s. Archivos de v2 guardados como `geometry.v2.ts` y `Plano.v2.tsx`.

## Autoevaluación y notas
- Qué funcionó: el resultado es prácticamente igual al de Canvas; render igual de rápido; `evolvePath` y `spring` resuelven el trazado y los rebotes con muy poco código; el HTML facilita rótulos con ancho automático; Remotion Studio permitiría a una persona previsualizar y mover la línea de tiempo (no probado aquí).
- Más difícil que el motor propio: hubo que montar desde cero subtítulos, carga de fuentes (`delayRender`) y tags SVG con ancho estimado a mano; ~1 GB de instalación; la ruta del workspace (con «:») rompe npm/npx, así que el proyecto vive en `~/clam-tests/remotion-plano/`.
- Más fácil que el motor propio: animaciones declarativas (`interpolate`, `spring`, `Easing`), texto y maquetación con HTML/CSS, un ecosistema documentado y mantenido.
- Qué habría ayudado: una plantilla de subtítulos y marca ya hecha en Remotion (existe `clam-video-template` de junio, no usada aquí).
- Propuestas sobre el guion: ninguna para este tramo.

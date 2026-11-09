# Registro de corrida · Ronda 3 · HyperFrames

## Identificación
- Fecha: 09/11/2026
- Agente: Claude Code (subagente de la sesión de The Clam AI)
- Modelo exacto: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB de RAM; captura con GPU por hardware (ANGLE Metal)
- Herramienta principal: **HyperFrames 0.9.26** (npm `hyperframes`, versión fijada), HeyGen, Apache-2.0
- Otras: Node 26.7.0, FFmpeg 9.0.2, GSAP 3.15.0 (CDN de la plantilla), fuente Inter (incluida, OFL)
- Licencias: HyperFrames Apache-2.0; GSAP con licencia propia (gratuita); FFmpeg LGPL/GPL. **Coste: 0.** No se usaron funciones Pro ni la app de escritorio.

## Instalación
- `npm install --save-exact hyperframes@0.9.26` en `~/clam-tests/hyperframes-r3/`: **17 s**, `node_modules` de **107 MB**.
- En el primer uso descarga Chrome headless y fuentes a `~/.cache/hyperframes`: **206 MB**.
- Skills: **no las instalé con `npx hyperframes skills update`**, porque eso escribe en la configuración global de agentes del usuario. Las leí directamente del repo en la etiqueta `v0.9.26` (clon parcial de `skills/`, 9 MB): `hyperframes/SKILL.md`, `references/types/explainer.md`, `types/vertical.md`, `format.md`, `captions.md`, `runtimes.md` y `motion.md`.
- No ejecuté el «usage beacon» de telemetría que pide la skill (`npx hyperframes events`), para no enviar datos sin necesidad.
- Total en disco: ~320 MB.

## Cómo ayudaron sus skills (y cómo no)
- **Ayudaron mucho:**
  - El **contrato** (timelines GSAP en pausa, `class="clip"` + `data-start`/`data-duration`, nada de reloj ni aleatoriedad) evitó errores típicos de render.
  - Las guías de **explicador** («un diagrama que crece», etiquetas sobre la pieza que nombran) y **vertical** (banda de texto 168–1330 px, primer fotograma con la pregunta).
  - Las reglas de **subtítulos** (3–5 palabras, una frase a la vez, banda segura).
- **`hyperframes check` es muy útil:** lint, validación en Chrome, maquetación, contraste y «craft» (tamaño mínimo de letra, tiempo de lectura). Detectó 3 problemas reales: textos de 22–24 px, contraste de «Grid» y «+», y `set` de opacidad solapados. Todos corregidos; el `check` final da **0 errores**.
- **`hyperframes snapshot --at`** con hoja de contacto: rápido para revisar fotogramas exactos. Así encontré dos fallos: el inversor escalaba desde la esquina (origen SVG mal puesto: había que usar `svgOrigin`) y el sol seguía visible de noche.
- **No usé** el catálogo de bloques (`/hyperframes-registry`) ni música o efectos. El plan pide la voz sola para la evaluación y no quería depender de otros recursos.
- **Fricción:**
  - La skill empuja a pedir 3 «storylines» al usuario y a abrir la vista previa del Studio antes de renderizar. En modo autónomo me lo salté.
  - Algunas sugerencias de la skill son de pago (HeyGen Pro), aunque no obligatorias.
  - Las advertencias de «archivo demasiado grande», porque genero un único `world.html` de unas 440 líneas.

## E1 · Guion visual
- `guion-visual.md`. Estilo: ilustración plana tipo infografía, una sola casa en corte que crece, el cielo marca la hora y unas barras «Power in / Home use» para los pasos 5–7.

## E2 · Materiales
- Todo SVG escrito por código (`gen.py` → `index.html`, `compositions/world.html`, `compositions/captions.html`). Sin generador de imágenes y 0 regeneraciones.

## E3–E4 · Animación y acabado
- **Animación:** un timeline GSAP por composición, con tweens en segundos absolutos tomados de `tiempos.json`.
- **Cables:** se dibujan con `stroke-dashoffset`.
- **Energía:** la mueve una sola interpolación «proxy» cuyo `onUpdate` coloca cada punto a partir del tiempo, así que es determinista al saltar a cualquier fotograma. La corriente continua avanza en un sentido. La alterna oscila y se desplaza despacio en la dirección de la energía neta.
- **Cámara:** un contenedor `#w-cam` con `x/y/scale` entre 30 fotogramas clave.
- **Sincronía:** cada evento sale del índice de palabra en `tiempos.json`. Algunos eventos se adelantan 0,1–0,5 s a propósito, para que la pieza ya esté apareciendo cuando suena su palabra (por ejemplo, el inversor empieza a construirse 0,5 s antes de «inverter»). Los rótulos caen en la palabra exacta.
- **Render v1:** 1 min 0,7 s según HyperFrames (captura 48,6 s, codificación 2,4 s) y 96 s de reloj total; 77,80 s de vídeo (+20 ms respecto a la voz, menos de 1 fotograma), 1080×1920, 30 fps, H.264 + AAC 48 kHz, **12,5 MB**.

## Hechos (sección 4) comprobados en los fotogramas
- **Recorrido:** paneles → inversor → tablero → cargas, sin ningún aparato directo al panel.
- **Tipos de corriente:** continua (ámbar, un sentido) antes del inversor y alterna (cian, oscila) después.
- **Excedente a la red:** solo a mediodía (49,3–53,9 s).
- **Noche:** la energía viene de la red o de la batería.
- **Apagón:** el inversor marca «OFF», la casa se apaga y no hay flujo desde los paneles. Solo con batería + «Hybrid inverter», y la casa separada de la red por un interruptor, vuelven las luces.
- **Inversor:** no aparece como fuente. Su límite se ve como tope de la barra.
- **Medidor:** no se nombra ningún país.
- **Rótulos:** «Direct current (DC)», «Alternating current (AC)» y «Air conditioner» (nunca «AC» para el aparato).

## Intervenciones humanas
| # | Qué se pidió o corrigió | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida | | |

## Tiempos
- **Agente:** unos 11 min de reloj desde la instalación hasta entregar v1 (11:23 → 11:34) y unos 13 min hasta v2. Antes hubo lectura de la documentación, que no está cronometrada.
- **Humano:** 0.
- **Coste:** 0.

## E5 · Prueba de corrección (no preparada de antemano)
v1 se entregó a las 11:34:26. Después se editaron 2 líneas de `gen.py` (ver `diff` entre `proyecto/v1/gen.py` y `proyecto/v2/gen.py`).

| Cambio | Archivos tocados | Tiempo humano | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| Rótulo del inversor +0,5 s (18,39 → 18,89 s) | `gen.py` (1 línea), se regeneran `compositions/*.html` | 0 | **64,8 s en total** para los dos cambios: regenerar, `check` y render (48,6 s) | No: el `check` da 0 errores |
| Acento coral `#FF5A5F` → violeta `#7C5CFF` | `gen.py` (1 línea) | 0 | (incluido) | No; también cambia la aguja del medidor, que usa el acento |

## Autoevaluación
- **Qué funcionó:**
  - una casa que se construye por partes y nunca se pierde la referencia;
  - colores con significado (ámbar = continua, cian = alterna);
  - las barras del paso 5 explican el límite del inversor;
  - el `check` y el `snapshot` atrapan errores antes del render;
  - render rápido (≈1 min);
  - MP4 pequeño (12,5 MB).
- **Qué no funcionó o es mejorable:**
  - **Composición:** abajo hay mucho verde vacío en los planos generales (la casa ocupa la mitad superior), y en algunos planos el panel de barras tapa el techo.
  - **Acabado:** más infografía que ilustración rica; no hay luz ni sombras.
  - **Subtítulos:** las palabras aún no dichas se ven al 62 % de opacidad. Es intencionado, pero el `check` lo marca como bajo contraste en las transiciones.
  - **Sonido:** no hay música ni efectos.
  - **Desactualización:** el CLI avisa de «skillsOutdated: 5», porque las skills que leí son las de la etiqueta y no las más nuevas.
- **Propuestas sobre el guion:** ninguna; es correcto. «Grid-tied» podría rotularse como «Grid-tied (connected to the grid)».

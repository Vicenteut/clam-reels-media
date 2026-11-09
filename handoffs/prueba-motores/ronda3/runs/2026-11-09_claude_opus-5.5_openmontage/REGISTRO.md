# Registro de corrida · Ronda 3 · OpenMontage

## Identificación
- Fecha: 09/11/2026 · Agente: Claude Code (subagente) · Modelo: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB, sin GPU NVIDIA.
- Herramienta principal: **OpenMontage** (github.com/calesthio/OpenMontage, commit `fecb9a1`, sin versiones publicadas), pipeline `animated-explainer`, compositor Remotion (`remotion-composer`, Remotion ^4.0.484) llamado a través de su herramienta `video_compose` (`operation: remotion_render`, perfil `instagram_reels` 1080×1920). Stock con su herramienta `direct_clip_search`.
- Otras: FFmpeg 9.0.2 (recorte final a la duración exacta de la voz y transcodificación de 3 clips de fondo), Python 3.12 (Anaconda), Node 26.7.
- Licencias: OpenMontage **AGPL-3.0** (uso local para producir un vídeo: sin obligaciones; si se ofreciera como servicio o se distribuyera modificado, obliga a publicar el código). Remotion: licencia propia (gratis para equipos de hasta 3 personas). Clips: ver `materiales/ORIGEN.md`. Coste: **0**.

## Instalación
- `git clone --depth 1` (172 MB) + `make setup`: **1 min 23 s**. Instala dependencias Python (pydantic, fastapi, openai, google-genai…), `npm install` del compositor Remotion (276 MB), Piper TTS local y la caché de HyperFrames.
- Tamaño total tras la corrida: ~824 MB (incluye el proyecto; los 505 MB de clips descargados se borraron al terminar).
- **Efecto colateral importante:** el `Makefile` detectó el entorno conda activo y **instaló/actualizó los paquetes en el Python base de Anaconda (`/opt/anaconda3`)** en vez de crear un `.venv` aislado (actualizó pip a 26.3, pydantic, openai, google-genai, certifi, etc.). No se revirtió. Si algo del Python de Anaconda falla, puede venir de aquí; para próximas instalaciones conviene desactivar conda (`conda deactivate`) antes de `make setup`.
- `HyperFrames runtime_available=False` en la instalación («doctor timed out after 20s»), aunque el preflight posterior lo marcó disponible.

## Preflight (lo que OpenMontage puede hacer gratis en este Mac)
Composición: FFmpeg ✓, Remotion ✓, HyperFrames ✓. **Generación de imagen 0/31 y de vídeo 0/35** (todo pide claves de pago), música 0/8, TTS 1/19 (Piper local). Stock: Wikimedia, Archive.org, Openverse, Mixkit, NASA y otros sin clave; Coverr pidió clave (401).

## Cómo se recorrió su pipeline (y qué se saltó)
OpenMontage está pensado para que el agente pregunte al usuario en cada puerta (propuesta, guion, plan de escenas…). En esta prueba las aprobaciones las daba el plan; las decisiones se registraron en `proyecto/decision_log.json` en vez de preguntarlas:
- **research / proposal / script:** no se ejecutaron como tal: el guion y la voz están fijados por el kit (`d-005`). Decisiones de propuesta registradas: pipeline `animated-explainer` (`d-001`), runtime **Remotion** frente a HyperFrames y FFmpeg (`d-002`; HyperFrames descartado por el timeout de su doctor y porque esta prueba ya tiene corrida propia de HyperFrames), modo **templated** frente a atelier (`d-003`), stock gratis porque no hay generación (`d-004`).
- **assets:** `direct_clip_search` con 11 consultas → 31 clips; solo 3 servían (ver hoja de contacto). Resultado honesto: **el stock gratuito apenas tiene material de energía solar residencial**; trajo tranvías, escarabajos, satélites, casas encantadas y anuncios.
- **edit / compose:** `edit_decisions` (13 cortes de su catálogo + subtítulos palabra a palabra) renderizado con `video_compose`.
- **Backlot (panel local):** arrancó en `localhost:8765` y lista el proyecto con su vídeo como póster, pero **todas las etapas aparecen «pending»** porque no se escribieron checkpoints formales por etapa (se saltaron research/proposal/script). No se usó su puerta de aprobación.

## Render
- v1 primer intento: **320 s**. Revisando fotogramas, las plantillas (diseñadas para 1920×1080 horizontal) salían diminutas en vertical y cortaban palabras («pow / er», «inverte / r»). Se corrigió dentro del modo templated: tamaños de letra de callouts y tarjetas, y títulos en text_card. v1 final: **246 s**.
- Salida de Remotion: 77,85 s → recortada con FFmpeg a 77,80 s (voz 77,78 s, dentro de 1 fotograma). `final_v1.mp4` 14,4 MB, `final_v2.mp4` 14,2 MB.

## Hechos (sección 4), comprobados en fotogramas
Paneles → inversor → tablero → cargas ✓. DC antes y AC después del inversor, con nombre completo + abreviatura ✓. Aire acondicionado nunca rotulado «AC» ✓. Excedente a la red solo al mediodía ✓. De noche: baterías o red ✓. Apagón: el sistema conectado a la red se apaga; solo baterías + inversor híbrido mantienen luces ✓. Medidor: «in many places» ✓. El gráfico del segundo aire acondicionado usa barras ilustrativas sin cifras.

## E5 · Prueba de corrección (§5), hecha tras entregar v1, sin variante preparada
| Cambio | Archivos tocados | Edición | Máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| Rótulo del inversor +0,5 s | `build_edit.py` (2 líneas: `INV_DELAY` y alargar la tarjeta anterior para no dejar un hueco vacío) | < 1 min (escritura instantánea por script) | 233 s render + 13 s recorte = **246 s** en total | No |
| Acento ámbar → verde | `build_edit.py` (1 línea `ACCENT`) | incluido | incluido | No, pero el verde nuevo se parece al verde fijo que la plantilla usa para «Alternating current» en la tarjeta de comparación |

## Autoevaluación
- **Qué funcionó:** instalación rápida; el catálogo de plantillas y los subtítulos de OpenMontage dan un vídeo correcto, legible y sincronizado sin escribir componentes; corrección barata (cambiar datos y volver a renderizar).
- **Qué no funcionó:**
  - **Sin claves de pago no genera imágenes ni vídeo**, y el stock libre no tiene material del tema → el resultado son sobre todo tarjetas de texto sobre fondo oscuro; poco «movimiento real dentro de la escena» (solo las animaciones de entrada de las tarjetas, las barras y 3 clips de fondo). Probablemente **no cumple bien** el requisito de movimiento de la sección 6.
  - Las plantillas son horizontales: en vertical quedan pequeñas y con mucho espacio vacío (gráfico y barra diminutos).
  - El flujo completo de OpenMontage (investigación, 3 conceptos, aprobaciones, Backlot) es pesado y está pensado para preguntar al usuario en cada paso; en una corrida autónoma la mayor parte se queda en registro.
  - Instalación en el Python de Anaconda del usuario (ver arriba).
  - Render lento para lo que es (≈4 min por versión, con otras corridas en paralelo en el Mac).
- **Qué habría ayudado (de pago):** una clave de generación de imagen o vídeo (FAL, Kling, etc.) para que el pipeline produjera planos propios; con eso el modo templated tendría fondos reales en cada escena.
- **Tiempo del agente:** ~25 min de reloj para v1 (incluida la instalación) + ~4 min la corrección y ~5 min el registro.

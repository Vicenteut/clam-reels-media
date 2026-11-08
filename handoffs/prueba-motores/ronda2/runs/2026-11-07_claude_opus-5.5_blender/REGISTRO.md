# Registro de corrida · Ronda 2 · Blender

## Identificación
- Fecha: 07/11/2026, de 21:42 a ~22:55 (America/Belize)
- Agente: Claude Code, subagente de la sesión de The Clam AI
- Modelo: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB, GPU integrada
  - **Aviso:** durante toda la corrida había un juego abierto (World of Warcraft) usando ~220 % de CPU y la GPU, y además otras corridas renderizando en paralelo. Los tiempos de render están inflados por eso.
- Herramienta principal: **Blender 5.2.3 LTS**, con EEVEE y todo escrito en Python (`-b -P`).
- Otras herramientas: Python 3.12, Pillow 10.3.0, NumPy 1.26.4 y FFmpeg 9.0.2 (x264 + AAC), para la capa 2D y la codificación. Fuente Inter (OFL), que tiene todos los glifos usados (↑ ↓ → × ≈ %).
- Licencias: Blender GPL, Python PSF, Pillow HPND, NumPy BSD, FFmpeg LGPL/GPL, Inter OFL. Coste: 0.

## Cómo está hecho (común a los dos temas)
- **Escena 3D:** geometría, materiales, luces y animación por script, en `proyecto/<tema>.py` con `lib3d.py`. Cámara real con claves, más un objetivo que sigue la cámara (Track To).
- **Render:** a 720×1280, que se reescala a 1080×1920 en la capa 2D. Los subtítulos y rótulos se dibujan a 1080 nativo, así que el texto queda nítido.
  - Motivo: a 1080×1920 el render iba a ~2,2 s por fotograma. A 720p, con sombras más ligeras, iba a ~0,8–1,2 s.
- **Capa 2D** (`compose_<tema>.py` + `compose_lib.py`):
  - Subtítulos por frases sobre un fondo oscuro de alto contraste, con la palabra clave en el color de acento.
  - Rótulos con línea guía anclados a puntos 3D. Blender proyecta cada punto en cada fotograma y lo guarda en `proj_<tema>.json`.
  - Títulos de concepto.
- **Sincronía:** todos los eventos salen de `tiempos.json` (índices de palabra), en 3D y en 2D. No hay segundos escritos a mano.
- **Mejoras frente a la ronda 1:**
  - Planos generales legibles (diorama completo, casa reconocible).
  - Modelos más ricos (colector en corte, depósito con espuma, dado con puntos, fichas con texto 3D).
  - Subtítulos sobre un fondo oscuro.
  - Una sola fuente con todos los glifos.

## Tema 1 · Calentador solar (`calentador/`)
- **Estilo:** diorama 3D de juguete en corte, con luz de sol real y paso de día a noche. Se eligió porque es un mecanismo físico con un recorrido de agua, y la cámara 3D permite rodearlo sin perder la referencia. Detalle en `guion-visual.md`.
- **Comprobación de hechos (sección 3):**
  - El depósito está por encima del colector: su fondo queda a 4,18 m y la parte alta del colector, a 4,02 m.
  - El agua caliente sale por arriba del colector y entra arriba en el depósito.
  - El agua fría sale del fondo del depósito y entra abajo en el colector.
  - No hay bomba.
  - Los rayos van del sol a la placa, no al depósito.
  - El depósito aparece aislado (espuma amarilla en corte).
- **Render v1:** 1.275 s (21 min) para 1.437 fotogramas, con contención. Capa 2D y codificación: 120 s.
- **Problemas y arreglos durante la corrida:**
  1. Exposición quemada: se bajaron las luces y el cielo pasó a un nodo «Is Camera Ray».
  2. El degradado del agua estaba invertido: los ejes cambiaban al rotar el cilindro.
  3. Booleanos animados: hacían el render unas 5 veces más lento. Se aplican al construir la escena y el depósito cerrado se sustituye por el abierto.
  4. Cámaras demasiado lejanas en la primera versión.
  5. Rótulos que se salían del encuadre por la derecha.
- **Qué no funcionó del todo:**
  - Los puntos de agua de los tubos se ven algo rosados a través del vidrio.
  - La metáfora del «coche al sol» no tiene imagen propia.
  - El rótulo INSULATION señala la franja de espuma del fondo del corte, no un anillo completo.

## Tema 2 · ChatGPT (`chatgpt/`)
- **Estilo:** estudio 3D oscuro con fichas de token físicas y una cámara que viaja entre estaciones. Se eligió porque un concepto abstracto se entiende mejor si cada idea es un objeto: piezas, alturas, dado y fila. Interfaz de chat genérica, sin logos. Detalle en `guion-visual.md`.
- **Comprobación de hechos (sección 3):**
  - Los tokens son piezas; el «?» se separa.
  - Las barras suman 100 %: blue 60, clear 20, falling ≈0, others 20. Lo dice el rótulo «ALL TOGETHER = 100%».
  - El muestreo no siempre gana la más alta: primero sale blue y en la segunda tirada se cuela clear.
  - El proceso se repite token a token.
  - Se tacha una «base de datos» con el rótulo «NO STORED ANSWER».
  - Los porcentajes coinciden con la voz.
- **Render v1:** 1.009 s para 1.653 fotogramas. Después hubo tres re-renders parciales del mismo .blend para reencuadrar:
  - fotogramas 300–480 (fichas cortadas en los bordes), 105 s;
  - fotogramas 650–1220 (gráfico desplazado), 349 s;
  - fotogramas 1355–1653 (última fila cortada), unos 3 min.
- **Capa 2D y codificación:** 537 s, con contención.
- **Problemas y arreglos:**
  1. Las fichas salían como cubos sin texto, porque la escala del objeto pisaba la animación. Se resolvió con mallas de tamaño real (`bbox`).
  2. Las barras estaban medio enterradas: el origen ahora está en la base.
  3. El suelo brillante reflejaba la luz como una «pared»: se dejó mate.
  4. Las líneas de bifurcación tapaban las fichas: la bifurcación pasó a la capa 2D.
- **Qué no funcionó del todo:**
  - En el gancho, los paneles de chat quedan algo desplazados a la derecha.
  - Las etiquetas 3D al pie de las barras son pequeñas; las cubren las píldoras 2D con nombre y porcentaje.
  - La «ciudad» de 676 fichas representa el vocabulario de forma simbólica: no son 100.000 piezas, y lo aclara el rótulo «100,000+ TOKENS».

## Intervenciones humanas
| # | Qué | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida | | 0 |

## Tiempos
- Trabajo del agente: unas 1,2 h en total para los dos temas, incluidos los renders.
- Horas humanas: 0. Coste: 0.

## Prueba de corrección (sección 4)
Se hizo después de entregar cada v1, sin variante preparada. En los dos temas los cambios son solo de la capa 2D (rótulo y color de acento), así que **no hubo que volver a renderizar Blender**.

| Tema | Cambio | Archivos tocados | Tiempo de edición | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|---|
| Calentador | «THERMOSIPHON» +0,5 s (38,68 → 39,18 s) | `compose_calentador.py` (1 línea) | ~1 min (2 líneas y 3 fotogramas de comprobación) | 409 s (recomposición y codificación, con contención) | No |
| Calentador | Acento amarillo `#FFD23F` → menta `#2EE6A8` (subtítulos clave, bordes, título) | `compose_calentador.py` (1 línea) | (incluido) | (incluido) | No |
| ChatGPT | «TOKENS» +0,5 s (13,65 → 14,15 s) | `compose_chatgpt.py` (1 línea) | ~1 min | 559 s (recomposición y codificación, con contención); total desde la edición: 576 s | No |
| ChatGPT | Acento `#FFD23F` → `#2EE6A8` | `compose_chatgpt.py` (1 línea) | (incluido) | (incluido) | No |

Total del calentador, desde el inicio de la edición hasta el MP4 v2: 416 s. Si el cambio hubiera sido 3D (otra forma o posición), habría habido que volver a renderizar el tramo afectado; las pruebas parciales de esta corrida dan ~0,6–1 s por fotograma.

Archivos: `proyecto/compose_<tema>.py` es la versión v1 y `proyecto/compose_<tema>_v2.py`, la corregida.

## Autoevaluación
- **Qué funcionó:**
  - Cámara 3D real y legible.
  - Corte del depósito, circuito caliente/frío con color de temperatura, día → noche.
  - Fichas de token tangibles, barras que crecen en su palabra y dado con dos tiradas.
  - Rótulos anclados a objetos 3D que siguen la cámara.
  - Correcciones de 2D muy baratas.
- **Qué no:**
  - El render es lento en este Mac con otras cargas (20 min por tema).
  - Reencuadrar exige volver a renderizar tramos.
  - El aspecto es «3D de juguete» sencillo, no ilustración.
- **Qué habría ayudado:** una GPU dedicada o un render en la nube (de pago) y una biblioteca de modelos reutilizables (casa, depósito, fichas).

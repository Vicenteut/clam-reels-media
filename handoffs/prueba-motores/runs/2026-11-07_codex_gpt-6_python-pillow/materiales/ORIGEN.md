# Origen de los materiales

- `entradas/`: copias binarias íntegras de los tres archivos utilizados del kit. `voz.mp3` no se utiliza; la fuente de audio es siempre el WAV original. Los hashes se verifican contra el kit del repositorio.
- `estudio_01/` y `contacto_estudio_01.jpg`: primeros nueve fotogramas de estudio, conservados. Tenían un recorrido vertical DC y una anotación de pared que coincidía con el cable.
- `preview_v1/`, `preview_v2/` y hojas de contacto: muestras procedurales de cada composición final. Son derivados del código; no entradas de generación.
- Geometría original: constantes `ROOF`, `RIDGE`, `HOUSE`, `SIDE`, `PANEL`, `BOX`, `AC_OPEN`, `AC_CLOSED`, `DC_DIRECT` y `DC_WALL` de `proyecto/render.py`. Cada pieza y trazo se mantiene separado y editable. No hay material raster de terceros.
- `proyecto/render_preflight.py`: snapshot previo a limpiar la anotación de la pared y a incorporar las entradas al paquete. Es histórico; el renderer de entrega es `render.py`.
- Los stills de `../stills/` se extraen de los MP4 finales, no de un render paralelo.
- Fuente tipográfica: Arial / Arial Bold incluidas con macOS, usadas localmente; no se redistribuyen. El renderer admite DejaVu Sans como alternativa gratuita en Linux; esa sustitución puede alterar ligeramente la métrica.

Sin fotografías, referencias visuales externas, imágenes generativas, música ni efectos de sonido añadidos. Coste incremental: 0.

# Reproducir y corregir

El proyecto es gratuito y local: Python 3.12, Pillow 10.3.0, NumPy 1.26.4, FFmpeg 9.0.2 con libx264. Render CPU. No requiere Blender, GPU, red ni claves. El kit usado se incluye sin alteraciones en `../materiales/entradas/`.

En el equipo de producción se ejecutó `/opt/anaconda3/bin/python3.12`. En otra máquina se puede usar un entorno Python con Pillow y NumPy instalados. `ffmpeg` y `ffprobe` deben estar en PATH. Arial de macOS se detecta automáticamente; en Linux se admite `/usr/share/fonts/truetype/dejavu/DejaVuSans{,-Bold}.ttf`.

Desde la carpeta de la corrida:

```bash
python3 proyecto/render.py --config config_v1.json --preview --render
python3 proyecto/render.py --config config_v2.json --preview --render
python3 proyecto/verificar.py
python3 proyecto/verificar_movimiento.py
python3 proyecto/verificar_anclas.py
python3 proyecto/extraer_stills.py
```

Cada render sobrescribe **solo** su versión y manifiesto dentro de esta carpeta. Mantener las entregas congeladas aparte si se desea preservar sus hashes. El motor toma los tiempos del JSON original, cuantiza cada ancla con ceil(t×30), dibuja a 1620×2880 y reduce a 1080×1920 mediante Lanczos. Son 413 fotogramas, 30 fps; el WAV se codifica a AAC sin filtros, recortes, ganancia, cambio de velocidad ni mezcla. Se conserva la voz completa de 13,75 s y el vídeo dura 13,7667 s.

La animación DC mueve partículas mediante una coordenada de arco que aumenta y reinicia únicamente al final del recorrido. La AC usa desplazamientos sinusoidales acotados: cada partícula invierte su dirección. La velocidad mostrada es didáctica, no una simulación de la frecuencia eléctrica real.

Las líneas se construyen por longitud recorrida; el punto luminoso marca su extremo activo. Después del contorno, las caras del inversor reciben relleno y volumen. La cámara no cambia y el sistema conserva su ubicación.

Para E5 solo se crea `config_v2.json`; no se rehace el proyecto. La caja y su conexión se desplazan exactamente 15 fotogramas. La corrección no retrasa la materialización en la palabra final.

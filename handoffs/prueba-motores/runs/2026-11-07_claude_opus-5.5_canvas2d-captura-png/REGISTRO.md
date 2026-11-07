# Registro · variante de captura (PNG frente a JPEG)

No es una corrida creativa nueva: es **la misma escena** de `2026-11-07_claude_opus-5.5_motor-propio-canvas2d` (v1), capturada de tres formas para medir si la captura JPEG del motor degrada las líneas finas del plano.

## Identificación
- Fecha: 07/11/2026 · Agente: Claude Code · Modelo: Claude Opus 5.5
- Entorno: macOS 26.6.2, M3 Pro, 18 GB · Chromium headless shell 1243 (Playwright 1.63.0) · FFmpeg 9.0.2
- Script: `proyecto/tools/capture-test.mjs` (usa el servidor y el navegador del motor sin modificarlo).

## Método
Los tres caminos salen del mismo fotograma, en el mismo instante:
- **jpeg (lo actual):** `canvas.toDataURL('image/jpeg', 0.92)`, luego pipe MJPEG y x264 con CRF 16, preset medium y yuv420p.
- **png:** `canvas.toDataURL('image/png')`, luego pipe PNG y el mismo x264.
- **máster:** PNG a FFV1 RGB sin pérdida. Es la referencia; no se entrega, porque pesa 655 MB.

Medición contra el máster con SSIM y PSNR de FFmpeg, en RGB completo y solo en luminancia (Y). Además, recortes al 100 % del fotograma 330 (t = 11,0 s), en `comparacion/`.

## Resultados
| Captura | SSIM RGB | PSNR RGB | SSIM luminancia (Y) | Tamaño del MP4 | Captura por fotograma |
|---|---|---|---|---|---|
| JPEG 0,92 (actual) | 0,946 | 29,8 dB | 0,953 | 24,3 MB | 33 ms |
| PNG | 0,943 | 29,7 dB | **0,960** | **14,9 MB** | 90 ms |

## Conclusiones
- **Visualmente, la diferencia es casi nula.** En los recortes al 100 % las líneas finas se ven prácticamente iguales.
- **La pérdida principal no es el JPEG, sino el submuestreo de color 4:2:0 del H.264**, que afecta igual a los dos caminos: la medida en RGB baja a unos 29,7 dB en ambos. Instagram y TikTok recodifican en 4:2:0 de todos modos.
- **El PNG da algo más de nitidez en la luminancia y un archivo un 39 % más pequeño**, porque el ruido del JPEG obliga a x264 a gastar más bits. A cambio, la captura es unas 2,7 veces más lenta: unos 37 s de render en vez de 14 s para este tramo.
- **Recomendación:** cambiar a PNG es una mejora menor y opcional. No explica por sí sola ninguna diferencia de calidad entre motores.

## Entregables
- `final_v1_jpeg.mp4` y `final_v1_png.mp4`: el mismo v1 con cada captura, con la voz y los efectos.
- `comparacion/crop_cap_master.png`, `crop_cap_jpeg.png` y `crop_cap_png.png`.
- `proyecto/tools/capture-test.mjs`.
- Coste: 0. Tiempo del agente: unos 15 min.

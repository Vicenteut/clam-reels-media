# Registro de corrida

## Identificación
- Fecha: 07/11/2026
- Agente: Claude Code (subagente de la sesión de The Clam AI)
- Modelo exacto: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB RAM, GPU integrada (Metal)
- Herramienta principal: **Blender 5.2.3 LTS** en modo sin ventana (`-b -P`), motor EEVEE (16 muestras), Grease Pencil v3 con modificadores Line Art y Build.
- Otras herramientas: Python 3.12 con OpenCV 5.0, NumPy y Pillow para la capa 2D; FFmpeg 9.0.2 para codificar.
- Licencias: Blender GPL, FFmpeg LGPL/GPL, OpenCV Apache-2.0, Pillow MIT-CMU, fuentes OFL (Space Grotesk, Instrument Serif, JetBrains Mono, Inter). Coste: 0.

**Aviso:** la idea visual (encuadres, anclas, colores, hueco discontinuo, materialización) sigue el guion visual de la corrida en Canvas 2D que hizo el mismo modelo (Claude). Esta corrida mide sobre todo **qué aporta Blender** con un diseño parecido; no es una propuesta creativa independiente.

## E1 · Guion visual
- Archivo: `guion-visual.md` (versión 3D).
- Decisiones: casa en corte de 8 × 6 m con el techo inclinado hacia atrás para ver el faldón con los paneles desde arriba; luego la cámara baja por delante del alero y entra a la altura de la casa; después viaja hasta la pared del fondo, donde se construye el inversor.

## E2 · Materiales
- Tipo: modelo 3D hecho por script (cajas, losas inclinadas, aristas sueltas para las celdas, un cono para la lámpara, curvas con grosor para los cables). Sin imágenes generadas.
- Regeneraciones: 0.
- Problemas: el modelo es esquemático (nevera = caja, lámpara = cono); el detalle cuesta modelado.

## E3–E4 · Animación y acabado
- **Trazado progresivo:** un objeto Grease Pencil por grupo (techo, paneles, celdas, caja de conexión, casa, objetos, inversor), cada uno con Line Art limitado a su colección y un Build en modo porcentaje con `percentage_factor` animado de 0 a 1. Paneles en modo secuencial, el resto concurrente.
- **Cables:** curvas con grosor y material emisivo que crecen animando `bevel_factor_end` (mapeado por longitud).
- **Energía:** esferas emisivas con posición por fotograma calculada en Python (ámbar avanza; cian oscila con amplitud mayor en «back and forth»).
- **Materialización:** materiales del inversor sólido con un umbral de altura animado (transparente por debajo) → barrido de arriba abajo; el Line Art del inversor baja a 35 % de opacidad.
- **Capa 2D (compose.py):** brillo de la energía (mezcla «pantalla»), subtítulos por frases palabra a palabra, rótulos DC/AC, chevrones «one way», DC IN/AC OUT, anillo de destello, rótulo INVERTER y viñeta. Las posiciones salen de proyectar puntos 3D con la cámara de Blender en cada fotograma (`proj.json`).
- **Sincronización:** mismos tiempos que la corrida 2D, sacados de los índices de palabra de `tiempos.json` (trazos 0,10–0,15 s antes de su palabra; rótulos y conexión en la palabra exacta).
- **Tiempo de render v1:** 149 s Blender (413 fotogramas 1080×1920) + ~8 s de construcción de escena + 45–50 s de capa 2D y codificación ≈ **3,4 min**.

## Intervenciones humanas
| # | Qué se pidió o corrigió | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida. | | |

Ajustes propios tras revisar fotogramas: cuadrícula demasiado densa y brillante; ámbar que salía amarillo (emisión > 1 y brillo aditivo; se bajó la emisión y se pasó el brillo a mezcla «pantalla»); cámara del plano general por encima del alero (el techo tapaba el interior; se bajó por debajo del alero); cámara del inversor demasiado cerca de un cable en primer plano; rótulo final encima del inversor (se subió); la fuente variable salía en peso Light (se forzó Bold).

## Tiempos
- Horas de trabajo del agente: ~0,6 h (estimación).
- Horas humanas: 0.
- Coste: 0.

## E5 · Prueba de corrección
Hecha **después** de entregar v1, sin variante preparada.

| Cambio | Archivos tocados | Tiempo humano | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| 1. Cable por la pared exterior | `build.py` (lista `CABLE`: sale al borde del techo, baja por fuera de la pared derecha y la atraviesa) | 0 | 155 s Blender + 50 s capa 2D (los 3 juntos) | No |
| 2. Inversor 0,5 s más tarde | `build.py` (`TM.inv` y `TM.flips` +0,5; la capa 2D lee los tiempos exportados) | 0 | (incluido) | No |
| 3. Rótulo «INVERTER · DC → AC» | argumento de `compose.py` | 0 | (incluido) | **Sí:** la flecha «→» no existe en Space Grotesk y salió como un cuadrado; se arregló dibujándola con Inter Bold (+50 s de recomposición) |

Edición medida: ~23 s entre llamadas para los cambios de datos, más ~2 min para detectar y arreglar la flecha. Total ~3 min de agente y ~4,5 min de máquina.

## Autoevaluación y notas
- **Qué aporta Blender:** cámara 3D real con paralaje (el paso del techo al interior es un movimiento continuo en el espacio, imposible de fingir igual en 2D); las líneas salen solas de la geometría y respetan oclusiones; la iluminación del inversor sólido es real; corregir el recorrido de un cable es cambiar una lista de puntos 3D.
- **Qué no funcionó o es mejorable:** el techo visto desde debajo del alero deja una franja gris oscura de líneas; el modelo es esquemático; los subtítulos y rótulos no son de Blender (los añade una segunda herramienta), así que el flujo tiene dos pasos; render 10–15 veces más lento que Canvas 2D (aún así, ~3,5 min); hay que conocer la API de Grease Pencil v3, que cambió respecto a versiones anteriores.
- **Qué habría ayudado:** modelos más ricos (nevera, inversor, casa) o un kit de piezas 3D reutilizables.
- **Propuestas sobre el guion:** ninguna para este tramo.

# Registro de corrida

Copia rellenada de `PLANTILLA-REGISTRO.md`. Registro cerrado el 2026-11-07 a las 17:34:23 (America/Belize); la ficha del evaluador se conserva vacía.

## Identificación
- Fecha: 2026-11-07.
- Agente (dots/ChatGPT, Claude, Codex, Gemini…): **Codex**, con un subagente del mismo entorno para auditoría visual y verificación técnica.
- Modelo exacto: **GPT-6 según la identidad disponible en esta sesión; no está expuesto el identificador exacto de variante/sufijo**. El nombre `gpt-6` de la carpeta no pretende inventar ese dato.
- Entorno (sistema operativo, GPU sí/no, memoria si se conoce): macOS 26.6.2, arm64, 18 GiB RAM. Render por CPU; no se utilizó GPU.
- Herramienta principal y versión (Blender 5.x, Remotion 4.x, motor propio, etc.): motor procedural original `proyecto/render.py`, Python 3.12.4 + Pillow 10.3.0.
- Otras herramientas y versiones: NumPy 1.26.4; FFmpeg/ffprobe 9.0.2 con libx264 y AAC. Git/GitHub para entrega. Blender 5.2.3 estaba disponible y se consultó su versión, pero **no se usó** para producir el vídeo.
- Licencia de cada herramienta usada (y si es gratis): Python PSF; Pillow HPND; NumPy BSD-3-Clause; FFmpeg compilado con GPL/version3 (GPLv3+); libx264 GPLv2+; Git GPLv2. Todas disponibles localmente, sin compra ni instalación. Arial/Arial Bold: fuentes propietarias incluidas con macOS, uso local, no redistribuidas. Codex es el entorno ya disponible; no se consultó ni imputó una suscripción preexistente. **Coste incremental de herramientas/servicios de esta corrida: 0**. No se usó una API de pago ni una clave.

## E1 · Guion visual
- Archivo: `guion-visual.md`.
- Decisiones principales (encuadre, cómo se representa DC/AC, cómo se construye el inversor): cámara fija de una casa casi frontal con profundidad ilustrada; cubierta/paneles arriba, caja sobre pared izquierda y lámpara en un corte interior a la derecha. Ámbar avanza hacia la caja; cian oscila. Hasta construir el inversor los dos tramos están abiertos y separados. El inversor se traza, recibe detalles y se materializa mediante caras sólidas, sombra y superficie clara.
- La oscilación se ralentiza deliberadamente para explicar su sentido; no pretende simular visualmente 50/60 Hz. No se añadió una frecuencia falsa.

## E2 · Materiales
- Tipo de material (imagen completa, capas, SVG, modelo 3D, dibujo por código…): dibujo original por código, con vértices y componentes independientes. Originales y derivados en `materiales/`; procedencia en `materiales/ORIGEN.md`; instrucciones exactas en `prompts.md` y código fuente.
- Generador usado y número de regeneraciones: Python/Pillow local. **0 generaciones/regeneraciones de imágenes con IA**. Tres series de previews de nueve fotogramas: estudio inicial, V1 final y V2. Cuatro renders MP4 completos: dos comprobaciones preliminares V1, V1 congelada y V2. No se confunden las iteraciones de código con regeneraciones de imágenes de IA.
- Problemas (escala, textos deformes, piezas no separadas, inconsistencias): el primer diseño tenía el cable sobre «02 / HOUSE»; el subagente lo detectó y el agente movió la anotación antes de congelar V1. Se cambió el recorrido V1 a diagonal directa para distinguir con claridad la corrección exterior. Los textos se dibujan con fuentes; no hay texto de imagen generativa. Los previews iniciales se conservan.
- Entradas: exclusivamente voz WAV, tiempos y guion del kit. Copias íntegras dentro de `materiales/entradas/`. No se consultaron otros runs ni las referencias opcionales. No hay metraje, audio, capturas, música ni imágenes de otros creadores.

## E3–E4 · Animación y acabado
- Cómo se hizo el trazado progresivo de líneas: parametrización por longitud de las polilíneas; se dibuja solo el tramo recorrido y un punto luminoso en su extremo. Contornos, divisiones de paneles, paredes, cables y detalles tienen comienzos propios.
- Cómo se hizo la materialización: tras construir el contorno se rellenan las caras del inversor, con frontal claro, lateral sombreado, tapa y pantalla. La revelación empieza en el fotograma 380 y dura 16 fotogramas. El plano sigue visible.
- Cómo se sincronizó con `tiempos.json`: lectura directa del JSON; comienzo `ceil(t × 30)` para cada evento. Desviación de programación máxima en V1: **31,7 ms**, dentro de ±67 ms. La tabla completa está en el guion visual y en los manifiestos. Los subtítulos usan frases cortas exactas, activadas por el tiempo de su primera palabra. La cubierta se anticipa como contexto desde la apertura, explícitamente; el panel y la pared se trazan en sus anclas.
- Tiempo de render: V1 congelada **25.89 s**; V2 **25.35 s**. Renders preliminares V1: 25.80 s y 25.77 s. Total de los cuatro renders: **102.81 s**, excluye preparación, previews, validación y empaquetado. Las marcas exactas están en `evidencia/`.
- Especificación real: ambas versiones **1080×1920, H.264/yuv420p, AAC mono 48 kHz, 30 fps, 413 fotogramas, 13,766667 s**. Audio del contenedor: **13,750000 s**. Se prioriza §7 frente a «14 s» aproximados de la introducción; diferencia de vídeo respecto al WAV: +16,7 ms, dentro de 1 fotograma.
- Voz sin edición: WAV completo, sin filtros, normalización, estiramiento, recorte, mezcla ni efectos. Solo codificación AAC exigida. Correlación WAV↔AAC **0.999985886**, ganancia estimada **0.999361133**, desfase global y en cinco ventanas **0 muestras**. La codificación AAC es con pérdidas, no se afirma identidad binaria con el WAV.
- Verificación real: `evidencia/validacion.json` registra **60 controles técnicos aprobados, 0 fallos, 0 pendientes**. `evidencia/movimiento_ac.json` mide 120 fotogramas por MP4: el marcador cian se desplaza en ambas direcciones, con correlación >0,9999 frente a la oscilación esperada. Además, `evidencia/anclas_visibles.json` detecta en los píxeles de cada MP4 seis comienzos visibles (12 detecciones correctas): panel, DC, casa, AC, caja y rótulo final. Confirma caja 310→325 y rótulo 380 en ambas. Estos controles no sustituyen la evaluación humana a ciegas.
- Los siete stills V1 solicitados se extraen del MP4 real en `stills/`; V2 se añade en `stills/v2/`. La muestra 1,1 s precede «direct» (1,135 s), por eso aún no aparece DC. Zonas seguras: información esencial x≤887, y≤1618; 180 px derechos y 250 px inferiores quedan libres de ella.

## Intervenciones humanas
| # | Qué se pidió o corrigió | Por qué | Tiempo |
|---|---|---|---|
| 0 | Handoff y plan inicial facilitados por el usuario | Definir la prueba | No medido; no se inventa |
| — | No se solicitaron confirmaciones, ajustes manuales ni nuevos materiales después del handoff | Ejecución autónoma autorizada | **0 min adicionales** |

Las ediciones de código, decisiones editoriales y revisiones del subagente fueron trabajo de agentes, no intervención humana. No hubo manipulación manual humana de imágenes o vídeo.

## Tiempos
- Horas de trabajo del agente: **aprox. 0.31 h transcurridas** hasta cerrar este registro (aprox. 17:16–17:34 America/Belize). El inicio es aproximado; no se dispone de un cronómetro por turno. Incluye preparación, código, renders, documentación y validación; el subagente trabajó en paralelo y no se suma dos veces. La operación Git y el ZIP posteriores se registran mediante su evidencia de entrega.
- Horas humanas: **0 h adicionales medidas**; tiempo previo de redactar el handoff desconocido.
- Coste (debe ser 0): **0 de coste incremental**. Sin pagos, APIs de pago, claves ni nuevas cuentas.

## E5 · Prueba de corrección
V1 se entregó en el chat y quedó congelada antes de crear la configuración V2. Hash de V1: `689e662c42883fdd69069aaa4fc4d6df4c2a4cc9cd56ca81f68f1cd84e8abe05`. V2 se generó sobre el mismo `render.py`; ambas versiones comparten hash de fuente `4de9690f0fd66d9d647f0e3d75b3574afb21db72156f9c2f42387a88a81b0ea9`. No se empezó de cero.

| Cambio | Archivos tocados | Tiempo humano | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| 1. Recorrido del cable | Nuevo `proyecto/config_v2.json`: `cable_route=wall` | 0 s | Render conjunto 25.35 s | No se observó regresión: baja por la pared exterior y entra al puerto DC |
| 2. Inversor 0,5 s más tarde | Mismo JSON: `box_delay_frames=15` | 0 s | Compartido, no se suma de nuevo | Caja 310→325, conexión 323→338; materialización sigue 380 |
| 3. Rótulo «INVERTER · DC → AC» | Mismo JSON: `inverter_label` | 0 s | Compartido, no se suma de nuevo | Texto completo, legible y dentro de la zona segura; el motor ajusta su tamaño |

Edición de parámetros: 0.0011 s de ejecución de escritura (no representa tiempo de razonamiento). Desde crear configuración hasta terminar preview y render V2: **27.10 s**. Validación, stills y documentación se hicieron después. Se generaron además MP4, previews, manifiesto y evidencias nuevos; el único archivo de autoría para implementar la corrección fue `config_v2.json`.

El retraso de la conexión acompaña al de la caja para preservar la causalidad. En V2 las anclas «box» y «flips» quedan deliberadamente +0,5 s más tarde por §9; la voz no se desplaza. El rótulo y la materialización mantienen el ancla final. El hash de V1 permaneció intacto tras V2.

## Autoevaluación y notas
- Qué funcionó: trazado paramétrico, separación de piezas, continuidad espacial, colores semánticos, voz intacta editorialmente y corrección mediante un archivo de parámetros. Revisión visual por agente principal y subagente, con fotogramas completos y hojas reducidas.
- Qué no funcionó: el Python del sistema no tenía Pillow; se utilizó el entorno Anaconda ya instalado, sin instalar nada. Hubo una colisión de anotación con cable, corregida antes de V1. El primer recorrido hacía menos evidente la diferencia de E5, y se cambió antes de la entrega. Se repitió un render V1 tras empaquetar las entradas para verificar la fuente autocontenida. No hubo fallos de render de FFmpeg; el aviso de canal mono fue informativo. La primera ejecución del detector adicional de anclas falló porque el recorte YUV redondeaba alturas impares: se añadió `exact=1` al verificador y las 12 detecciones pasaron. No fue necesario tocar ni rerenderizar los MP4. Un primer `git add` usó una ruta duplicada por ejecutarse desde la subcarpeta y no añadió nada; se corrigió ejecutándolo desde la raíz del checkout.
- Límites: no hubo evaluación por humanos en un teléfono, prueba de comprensión con evaluadores ni evaluación ciega. La revisión de anclas se apoya en programación, manifiestos, fotogramas y seis detectores de comienzo por versión; no se afirma una medición perceptual humana de todos sus comienzos. El 2,5D es ilustrado; no hay geometría 3D física ni cámara volumétrica. La tipografía alternativa Linux puede variar la métrica.
- Qué habría ayudado (aunque fuese de pago): nada de pago fue necesario. Un motor 3D podría dar más relieve físico, a costa de complejidad; Blender estaba disponible gratis, pero se eligió el dibujo paramétrico para esta corrida. La validación humana de lectura/comprensión sigue pendiente del evaluador.
- Propuestas sobre el guion: conservar el texto para la comparación. En una pieza futura, «alternates at 50 or 60 cycles per second» aportaría la precisión indicada por el plan. No se cambió nada en esta prueba.

---

## Ficha de evaluación (la rellena el evaluador, no el agente)

Vídeo evaluado como: ___ (letra a ciegas)

| Puerta | ¿Pasa? |
|---|---|
| Sin errores técnicos de la sección 5 | |
| Subtítulos y rótulos legibles en el celular | |
| Sincronía de anclas dentro de ±67 ms | |
| Especificación de salida | |

| Criterio | 1–5 | Nota |
|---|---|---|
| Efecto «plano que se construye» | | |
| Claridad | | |
| Calidad visual | | |
| Continuidad | | |
| Sincronía editorial | | |
| Facilidad de corrección | | |
| Reutilización | | |

Comprensión (3 preguntas): ___ / 3

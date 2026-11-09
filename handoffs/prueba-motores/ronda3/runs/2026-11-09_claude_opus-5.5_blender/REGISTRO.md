# Registro de corrida · Ronda 3 · Blender

## Identificación
- Fecha: 09/11/2026
- Agente: Claude Code (subagente de la sesión coordinadora)
- Modelo exacto: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB de RAM. GPU integrada, que Blender usa con EEVEE.
- Herramienta principal: Blender 5.2.3 LTS (EEVEE), con la escena entera escrita en Python (`bpy`) y renderizada sin ventana.
- Otras herramientas:
  - Python 3.12 con Pillow y NumPy, para la capa 2D.
  - FFmpeg 9.0.2 (H.264 + AAC).
  - Fuente Inter, del paquete de fuentes del skill.
- Licencias:
  - Blender GPL (uso para producir vídeo).
  - Pillow HPND y NumPy BSD.
  - FFmpeg LGPL/GPL.
  - Inter OFL.
- Coste: 0.

## E1 · Guion visual
- Archivo: `guion-visual.md`.
- Decisión: un solo diorama 3D coherente (casa en corte, poste de la red, batería) recorrido por una cámara 3D real, con la luz cambiando de día a mediodía, noche y apagón.
- Parte de lo que funcionó en el calentador de la ronda 2, y corrige sus fallos:
  - planos generales más cercanos;
  - cielo claro;
  - noche azul legible;
  - rótulos que no se salen del cuadro.
- La energía es ámbar para la corriente continua, que avanza en un sentido, y cian para la alterna, que oscila mientras avanza hacia donde va la energía.

## E2 · Materiales
- Modelado procedural en código: casa, paneles, inversor, tablero, lámpara, nevera, dos aires acondicionados, poste, medidor, batería y trabajador.
- No hay imágenes generadas. Regeneraciones de IA: 0.

## E3–E4 · Animación y acabado
- **Construcción:**
  - Las piezas aparecen con un crecimiento con rebote, sincronizado con su palabra: paneles, inversor, tablero, cargas, tercera fila de paneles, batería y trabajador.
  - Los cables se tienden con `bevel_factor_end`.
  - El inversor crece ×1,35 en «bigger inverter».
- **Energía:** cuentas emisivas con un fotograma clave cada 2 fotogramas, calculadas con un horario de flujos:
  - de día: paneles → inversor → tablero → cargas;
  - con el segundo aire acondicionado, la red entra hasta que se añade la tercera fila de paneles;
  - a mediodía, el excedente sale hacia el poste;
  - de noche: batería → casa, y sin batería, red → casa;
  - en el apagón, todo parado (LED del inversor en rojo) hasta que vuelven batería e inversor híbrido; entonces la red sigue sin recibir nada.
- **Capa 2D (`compose_solar.py`):** subtítulos de alto contraste, rótulos con línea guía y títulos.
  - Los rótulos llevan el nombre completo y la abreviatura, por ejemplo «DIRECT CURRENT (DC)», «HOUSE: ALTERNATING CURRENT (AC)» y «DC → AC», con el texto «direct current → alternating current» debajo.
  - Los aires acondicionados se rotulan «AIR CONDITIONER» y «+ SECOND AIR CONDITIONER».
  - Las posiciones salen de proyectar puntos 3D con la cámara de Blender.
- **Sincronía:** todos los tiempos salen de los índices de palabra de `tiempos.json`.
- **Render:**
  - Blender: 704 s para 2.334 fotogramas a 720×1280, con otras corridas en paralelo.
  - Capa 2D, escalado a 1080×1920 y codificación: 219 s.
  - Construcción de la escena: unos 15 s.
- **Salida:** 1080×1920, 30 fps y 77,776 s. `final_v1.mp4` pesa 32,1 MB y `final_v2.mp4`, 31,9 MB.

## Comprobación de hechos (sección 4, revisada en fotogramas)
- **Recorrido:** paneles → inversor → tablero → cargas. Ningún aparato está conectado a los paneles.
- **Tipo de corriente:** continua (ámbar) antes del inversor y alterna (cian) después.
- **Exportación:** solo a mediodía. De noche la energía sale de la batería o de la red, y los paneles están apagados.
- **Apagón sin baterías:** no fluye nada aunque haya sol. Las luces solo vuelven con batería + inversor híbrido.
- **Inversor:** se presenta como límite («MAX POWER AT ONCE»), no como fuente.
- **Medidor:** el rótulo «TWO-WAY METER» no menciona ningún país.

## Intervenciones humanas
| # | Qué | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida | | 0 |

## Tiempos
- Trabajo del agente: unos 26 minutos en total, contando los tiempos de render.
- Horas humanas: 0. Coste: 0.

## E5 · Prueba de corrección (sección 5)
Hecha después de entregar v1, sin variante preparada. Los dos cambios son de la capa 2D, así que **no hizo falta volver a renderizar en Blender**.

| Cambio | Archivo | Edición | Máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| Rótulo del inversor +0,5 s | `compose_solar.py` (`INV_LABEL_DELAY`) | 1 línea, menos de 1 min | 151 s de recomposición para los dos cambios | No |
| Acento amarillo `#FFD23F` → rosa `#FF5FA2` | `compose_solar.py` (`ACCENT`) | 1 línea | (incluido) | No |

Nota: el acento solo afecta a la capa 2D (subtítulos destacados, rótulos y títulos). Los colores de los objetos 3D, como la franja del inversor o el casco del trabajador, no forman parte del acento y no cambian. Hacer que también cambiaran obligaría a volver a renderizar en Blender, unos 12 minutos.

## Autoevaluación
- **Qué funcionó:**
  - El recorrido completo se sigue en un único mundo 3D.
  - Las secuencias de día, mediodía, noche y apagón se leen por la luz.
  - Las correcciones de la capa 2D son instantáneas.
- **Qué no funcionó o es mejorable:**
  - Los planos del interior quedan algo vacíos y bajo el alero.
  - En el apagón final, los rótulos «HYBRID INVERTER» y «BATTERIES» casi se superponen.
  - En las tomas de cerca el poste y los cables a veces cruzan el cuadro.
  - El render a 720p se escala a 1080 (el texto sí está a resolución completa).
- **Qué habría ayudado:** modelos más detallados del tablero y los aparatos, y una pasada de dirección de cámara con más tiempo.

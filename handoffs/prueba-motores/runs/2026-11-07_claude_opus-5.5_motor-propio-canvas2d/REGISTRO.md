# Registro de corrida

## Identificación
- Fecha: 07/11/2026
- Agente: Claude Code (app de escritorio), sesión de trabajo de The Clam AI
- Modelo exacto: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB RAM, GPU integrada (no se usó WebGL)
- Herramienta principal: motor propio de reels (estilo `classic`): página web en Chromium headless (Playwright 1.63.0, chromium_headless_shell-1243) que dibuja cada fotograma con Canvas 2D; captura JPEG por fotograma → FFmpeg 9.0.2 (H.264). Node 26.7.0.
- Otras herramientas: `mix.py` del mismo paquete (voz + efectos sintetizados, normaliza a −14 LUFS).
- Licencias: el motor es un paquete comprado (no redistribuible): `proyecto/` contiene solo los archivos de esta escena, **no se puede ejecutar fuera de este entorno**. Playwright Apache-2.0, FFmpeg LGPL/GPL, Node MIT. Coste: 0.

## E1 · Guion visual
- Archivo: `guion-visual.md`.
- Decisiones: alzado de la casa en corte con el faldón del techo en perspectiva (para que los paneles se lean). DC ámbar con puntos que avanzan y chevrones «›››» en «one way»; AC cian con puntos que oscilan, onda senoidal junto al rótulo y flechas ↔ en «back and forth». Antes del inversor, el cable DC termina en un terminal abierto y el cableado AC de la casa empieza en un tramo suelto: el hueco se marca con un rectángulo discontinuo y ahí se construye la caja.

## E2 · Materiales
- Tipo: vectores dibujados por código (sin imágenes generadas). Ver `materiales/README.md`.
- Generador: ninguno; regeneraciones: 0.
- Problemas: el acabado es de diagrama, menos rico que una ilustración. La nevera y la lámpara son esquemáticas.

## E3–E4 · Animación y acabado
- Trazado progresivo: cada trazo es una polilínea con hora de inicio y duración; en cada fotograma se dibuja hasta la fracción correspondiente, con brillo y una punta luminosa en el extremo que avanza.
- Materialización: barrido de arriba abajo que revela el inversor sólido (cuerpo, pantalla con onda, LEDs, franja naranja), anillo de destello y rótulo; el contorno del plano queda a baja opacidad y el símbolo interior desaparece.
- Sincronización: todos los tiempos salen de los índices de palabra de `tiempos.json` (no hay segundos fijos). Adelantos intencionados: los trazos empiezan 0,10–0,15 s antes de su palabra para que la línea ya esté apareciendo cuando la palabra suena; los rótulos «DC», «AC» e «INVERTER» y la conexión de «flips» caen en la palabra exacta.
- Cámara: 4 encuadres (techo → casa → inversor → algo más abierto) con transiciones suaves.
- Tiempo de render: 15 s para los 13,75 s a 1080×1920 (+2 s de mezcla).

## Intervenciones humanas
| # | Qué se pidió o corrigió | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida. La dirección de arte (plano azul) y el plan los decidió Vicente antes. | | |

Correcciones propias tras revisar fotogramas (2): el rótulo «DC» tapaba el inversor (ahora se desvanece cuando se construye la caja); el símbolo del plano se veía encima del inversor ya materializado (ahora desaparece).

## Tiempos
- Horas de trabajo del agente: ~0,75 h (estimación: montaje, guion visual, escena, 2 revisiones, v1, v2, registro).
- Horas humanas: 0 durante la corrida.
- Coste: 0.

## E5 · Prueba de corrección
**Aviso de imparcialidad:** leí la sección 9 antes de programar, así que dejé los tres cambios preparados como variante (`"variant": "v2"` en `reel.json`). Por eso el tiempo medido es casi solo de render y no es comparable con una corrección a ciegas. Estimación sin haberlos anticipado: ~5 min, porque los tres cambios son datos (una lista de puntos del cable, un desplazamiento de tiempo y un texto).

| Cambio | Archivos tocados | Tiempo humano | Tiempo de máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| 1. Recorrido del cable (baja por la pared exterior) | `scenes/plano.js` (constante `CABLE`) | 0 | 16 s (los 3 juntos: render + mezcla) | No |
| 2. Inversor 0,5 s más tarde | `scenes/plano.js` (`SHIFT`; las conexiones se mueven con él) | 0 | (incluido) | No |
| 3. Rótulo «INVERTER · DC → AC» | `scenes/plano.js` (`LABEL`) | 0 | (incluido) | No |

## Autoevaluación y notas
- Qué funcionó: el efecto de plano que se construye; los colores DC/AC y su movimiento (un sentido frente a oscilación) se leen claros; sincronía exacta con la voz; render muy rápido (15 s); las correcciones son cambios de datos.
- Qué no funcionó o es mejorable: el estilo queda más de diagrama que de ilustración; el rótulo final tapa parte de los paneles; al final la nevera queda cortada en el borde; la mezcla normaliza la voz a −14 LUFS (mismo audio, otro volumen); la captura es JPEG, lo que puede ablandar las líneas finas.
- Qué habría ayudado: una ilustración del inversor y la casa hecha a propósito (capas separadas) para que la materialización termine en un objeto más rico, no en uno dibujado por código.
- Propuestas sobre el guion: ninguna para este tramo; es correcto. («Many times a second» podría precisarse como «50 or 60 times a second».)

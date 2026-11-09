# Registro de corrida · ronda 3 · sistema solar residencial

## Identificación
- **Fecha:** 09/11/2026.
- **Agente:** Claude Code, subagente lanzado por la sesión coordinadora.
- **Modelo:** Claude Opus 5.5 (`claude-opus-5-5`).
- **Entorno:** macOS 26.6.2, Apple M3 Pro, 18 GB de RAM. Sin WebGL; todo en Canvas 2D.
- **Herramienta principal:** motor propio del skill, estilo `classic`. Funciona como página en Chromium headless (Playwright 1.63.0) que dibuja cada fotograma con Canvas 2D. Captura JPEG → FFmpeg 9.0.2 (H.264). Node 26.7.0.
- **Otras herramientas:** `mix.py` del mismo paquete para la voz más 27 efectos sintetizados, normalizado a −14 LUFS. La entrega se recodificó con x264 a CRF 23 para quedar por debajo de 45 MB.
- **Licencias:** el motor es un paquete comprado y no se puede redistribuir. Por eso `proyecto/` solo contiene los archivos de esta escena y no se ejecuta fuera de este Mac.
- **Coste:** 0.

## E1 · Guion visual
- Ver `guion-visual.md`.
- **Estilo:** plano azul que se construye y luego funciona, porque fue el preferido por Vicente en la ronda 1. No hay presentador, para que el esquema use todo el ancho.
- **Escenario:** un único mundo persistente con estaciones de cámara.
- **Hora del día:** día, mediodía, noche y vuelta al día en el apagón, con sol y luna.
- **Marcador SUN / HOME:** acompaña los pasos 5 a 7 y muestra cuándo la red cubre la diferencia y cuándo sobra energía.

## E2 · Materiales
- Todo son vectores dibujados por código. No hay imágenes generadas: 0 regeneraciones.
- Ver `materiales/README.md`.

## E3–E4 · Animación y acabado
- **Trazado progresivo:** cada pieza es una polilínea que se dibuja hasta una fracción dada, con brillo y una punta luminosa.
- **Materialización del inversor:** barrido de arriba abajo con anillo de destello. En «bigger» crece con rebote.
- **Energía:** la corriente continua son puntos ámbar en un solo sentido. La corriente alterna son puntos cian que oscilan. Los chevrones blancos indican si la energía entra o sale por la línea de la red.
- **Sincronía:** todos los tiempos salen de los índices de palabra de `tiempos.json`. Los trazos empiezan entre 0,1 y 0,35 s antes de su palabra, a propósito, para que estén apareciendo cuando suena. Los rótulos caen en su palabra.
- **Decisión de hecho (§4):** el sistema se apaga **0,35 s después de «blackout»** y no en «shuts», unos 2,4 s más tarde. En el primer borrador la casa seguía con energía durante esos 2,4 s del apagón, y eso es justo un error que suspende.
- **Rótulos:**
  - Con nombre completo y abreviatura: «Direct current (DC)» y «Alternating current (AC)».
  - El aire acondicionado se rotula como «Air conditioner» y «2nd air conditioner», nunca «AC».
  - Medidor: «Two-way meter», sin nombrar ningún país.
- **Dinamismo:** el chequeo `motion` del motor daba 2,25 en el primer render, con un mínimo de 4,8. Añadí golpes de cámara en los momentos clave, una deriva suave y movimientos de cámara dentro de los planos largos. El render final da **5,11**, con 7 % de tramos quietos.
- **Tiempo de render:** v1 tardó 120 s (1080×1920, 77,78 s) más ~3 s de mezcla y ~60 s de recodificación. Duración final: 77,767 s.

## Revisión de los hechos (§4) sobre los fotogramas
- Flujo: paneles → inversor → tablero → cargas. Ningún aparato está conectado a los paneles. ✓
- Ámbar antes del inversor y cian después. La batería también es ámbar, porque es corriente continua. ✓
- El excedente sale a la red solo a mediodía. De noche la energía viene de la batería o de la red, nunca de los paneles. ✓
- En el apagón sin baterías la casa se apaga aunque haya sol, y el inversor muestra «OFF». ✓
- El inversor no aparece como fuente. «Max power at once» se muestra como un límite. ✓

## Intervenciones humanas
| # | Qué | Por qué | Tiempo |
|---|---|---|---|
| — | Ninguna durante la corrida. El tema, el guion y el estilo libre los decidió Vicente antes. | | |

**Correcciones propias tras revisar los fotogramas (4):**
- El sistema se apagaba tarde en el apagón.
- Rótulos y sol pisaban el techo; bajé la casa en los planos generales y moví el sol.
- El rótulo «Grid» quedaba encima del inversor.
- Los rótulos se salían del borde; ahora se ajustan según su ancho.

## Tiempos
- **Agente:** ~1 h, como estimación.
- **Humano:** 0.
- **Coste:** 0.

## E5 · Prueba de corrección
Se hizo después de entregar v1, **sin variante preparada**. La hora del rótulo era la de la palabra «inverter», sin constante de desfase. El acento era la constante de diseño `ACCENT`.

| Cambio | Archivos tocados | Edición | Máquina | ¿Se rompió algo? |
|---|---|---|---|---|
| 1. Rótulo «Inverter» +0,5 s (18,39 → 18,89 s) | `scenes/solar.js` (1 línea de `TAGS`) | 8 s para los dos cambios | 184 s de render y mezcla, más ~60 s de recodificación a menos de 45 MB | No |
| 2. Acento naranja `#FF7A1A` → verde menta `#2BD9A0` | `scenes/solar.js` (`ACCENT`) y `reel.json` (`theme.accent`) | (incluido) | (incluido) | No. El acento cambia en la franja del inversor, el «?» inicial y el botón final. Los colores de energía (ámbar y cian) no cambian, porque tienen significado. |

Versiones de v2 en `proyecto/v2/`.

## Autoevaluación
- **Qué funcionó:**
  - Los 9 pasos se ven en orden y se entiende el recorrido de la energía sin audio.
  - El marcador SUN/HOME explica cuándo entra la red y cuándo sobra energía.
  - El apagón deja claro que sin baterías la casa se queda a oscuras.
  - La corrección es barata.
- **Qué no funcionó o es mejorable:**
  - El acabado sigue siendo de diagrama.
  - Los aparatos son esquemáticos.
  - El trabajador en el poste se ve pequeño en el plano general.
  - El marcador SUN/HOME usa letra mono pequeña (24 px).
  - La deriva de cámara que añadí para el dinamismo mueve un poco los rótulos.
- **Qué habría ayudado:** ilustraciones o modelos de los aparatos hechos a propósito.

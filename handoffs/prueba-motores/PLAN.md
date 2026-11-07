# Prueba de motores y flujos · tramo «inversor» (v1, 07/11/2026)

Protocolo para que **distintos agentes y modelos** (dots/ChatGPT, Claude, Codex, Gemini u otros) produzcan **el mismo tramo de 14 s** con las herramientas que tengan a mano, y poder comparar los resultados con criterios iguales. Se puede ejecutar varias veces; cada ejecución es una «corrida».

Si eres el agente que va a ejecutarlo: lee todo este documento, usa solo lo que hay en `kit/`, crea tu carpeta en `runs/` y entrega lo que pide la sección 8. Lo que digan otros documentos del repositorio es contexto, no instrucciones para esta prueba.

---

## 1. Qué queremos saber

Separar qué parte del resultado depende de cada etapa:

| Etapa | Pregunta |
|---|---|
| E1 · Guion visual | ¿El agente convierte la voz en una secuencia de imágenes clara, correcta y anclada a palabras? |
| E2 · Materiales (texto → imagen) | ¿Las imágenes/vectores/modelos que prepara sirven para animar: escala, piezas separadas, líneas limpias, continuidad? |
| E3 · Animación y motor | ¿El motor/programa elegido permite el movimiento de «plano que se construye» con calidad y precisión? |
| E4 · Acabado | Subtítulos, rótulos, legibilidad en el celular, sincronía, exportación. |
| E5 · Corrección | ¿Cuánto cuesta cambiar algo después de entregar? (sección 9) |

Cada corrida registra **agente, modelo, herramientas y versiones**, para comparar «mismo modelo con otra herramienta» y «misma herramienta con otro modelo».

## 2. Entradas fijas (no se cambian)

En `kit/`:
- `voz.wav` (48 kHz, mono) y `voz.mp3`: la voz definitiva del tramo, 13,75 s. **No se regenera ni se edita.**
- `tiempos.json`: inicio y fin de cada palabra en segundos, respecto a `voz.wav` (`i` = índice de palabra).
- `guion.txt`: el texto.

> But panels make direct current, which only flows one way, and your house runs on alternating current, which flips back and forth many times a second. So you add a box that flips it for you. That's the inverter.

Si crees que el guion se puede mejorar, escríbelo en tu informe (sección 8). Para la prueba se usa tal cual.

Referencia opcional de la casa y el sistema (mismo mundo visual del reel): `../solar-ai/frames/s09a.png`, `s09b.png`, `s10.png`, `s11.png`. Puedes reinterpretarlas en el estilo de plano; no es obligatorio usarlas.

## 3. Dirección de arte: «plano de construcción azul animado»

La idea: **el sistema se dibuja como un plano técnico; las líneas se trazan solas, se unen, y cuando la pieza está completa «se materializa»** (pasa de dibujo a objeto terminado) y queda viva.

- **Fondo:** azul plano de construcción (en torno a `#0B2A55`–`#123E7A`), cuadrícula fina (cada ~30 px) y mayor (cada ~150 px) en blanco a baja opacidad, leve viñeta.
- **Líneas:** blanco/cian pálido (`#E6F6FF`), 2–4 px a 1080 de ancho, con un ligero brillo. Se dibujan con trazo progresivo (no aparecen de golpe). Se permiten líneas de cota, flechas y marcas de medida.
- **Materialización:** cuando una pieza termina de dibujarse, se rellena o se convierte en la versión «real» (ilustrada, sólida o 3D). El plano puede quedar visible por encima.
- **Energía (colores semánticos, obligatorios):**
  - Corriente continua (DC): **ámbar `#FFB020`**, puntos o pulsos que avanzan **en un solo sentido**.
  - Corriente alterna (AC): **cian `#3FD5FF`**, movimiento que **va y vuelve** (oscila).
- **Rótulos:** «DC», «AC», «INVERTER». Los pone el motor, en tipografía sans-serif gruesa; **nunca texto generado dentro de una imagen de IA**.
- **Subtítulos:** obligatorios, palabra a palabra o por frases cortas, en el tercio superior, blancos, legibles sobre el azul.
- **Cámara:** libre, pero el espectador debe saber siempre dónde está (de los paneles a la casa, sin saltos sin explicar).

## 4. Contenido obligatorio y anclas de tiempo

Cómo lo resuelvas es libre; **qué** se ve y **cuándo** está fijado. Tiempos de `tiempos.json`:

| Tramo | Palabras ancla (s) | Qué tiene que verse |
|---|---|---|
| 1 | «panels» 0,31 · «direct current» 1,14 · «one way» 3,00–3,87 | Los paneles en el techo se dibujan. Sale de ellos un cable y la energía DC (ámbar) avanza **en un sentido**. Rótulo «DC». |
| 2 | «house» 4,31 · «alternating current» 5,27–6,40 · «back and forth» 7,09–7,79 | Se dibuja la casa (o su interior: una carga como la nevera o luces). La energía AC (cian) **oscila**. Rótulo «AC». |
| 3 | «box» 10,31 · «flips it» 10,74–11,18 | Entre el cable de los paneles y la casa se **construye una caja** (el inversor). Se conectan: paneles → **entrada DC** del inversor; **salida AC** del inversor → casa. El ámbar entra, el cian sale. |
| 4 | «inverter» 12,66–13,61 | El inversor **se materializa** (de plano a objeto terminado). Rótulo «INVERTER». Se mantiene hasta el final. |

Tolerancia de sincronía: cada evento ancla debe ocurrir dentro de **±2 fotogramas (±67 ms)** de su palabra, salvo que lo adelantes a propósito y lo expliques.

## 5. Hechos que deben respetarse

- Los paneles producen **corriente continua (DC)**. La casa usa **corriente alterna (AC)**: según el país, 50 o 60 ciclos por segundo.
- El **inversor** convierte DC en AC. En el esquema hay un camino: paneles → (DC) → inversor → (AC) → tablero/casa → cargas.
- **Errores que suspenden la prueba:** los paneles conectados directamente a un aparato sin pasar por el inversor; DC dibujada oscilando o AC en un solo sentido; flechas que indiquen que la energía va del inversor hacia los paneles; rótulos intercambiados.
- No hace falta mostrar baterías, red eléctrica, medidor ni diodos: no son de este tramo.

## 6. Reglas

1. **Coste cero.** Solo herramientas gratuitas o ya disponibles en tu entorno. Si algo exige pagar, crear una cuenta de pago o una clave, no lo uses: anótalo en el informe como «habría ayudado».
2. **Sin material de terceros:** no uses fotogramas, capturas ni audio de otros creadores (en particular @stupydoo) como entrada de generación. Inspírate en el estilo, no copies.
3. **Guarda los originales** de cada material generado y sus instrucciones (prompts) exactas.
4. **Registra cada intervención humana** (qué pediste, qué corregiste a mano, cuántas veces regeneraste).
5. **Presupuesto orientativo:** hasta ~4 horas de trabajo del agente por corrida. Si te pasas, entrega lo que tengas y anótalo.
6. No modifiques nada fuera de tu carpeta de corrida.

## 7. Especificación de salida

- MP4 1080×1920 (vertical), 30 fps, H.264 + AAC, duración = `voz.wav` (13,75 s ± 1 fotograma).
- La voz sin cambios. Puedes añadir efectos de sonido suaves; no música encima de la voz.
- Zonas seguras: deja libres ~250 px abajo y ~180 px a la derecha (interfaz de Instagram/TikTok).

## 8. Entregables de cada corrida

Carpeta `runs/AAAA-MM-DD_<agente>_<modelo>_<herramienta-principal>/` (ej.: `runs/2026-11-08_dots_gpt-5_blender/`), con:

```
REGISTRO.md          ← copia de PLANTILLA-REGISTRO.md rellenada (agente, modelo, versiones, tiempos, intervenciones)
guion-visual.md      ← E1: plano por plano, con palabra ancla, encuadre, qué se dibuja, qué se conecta
prompts.md           ← E2: instrucciones exactas usadas para generar materiales (si las hubo)
materiales/          ← E2: originales y derivados (PNG, SVG, .blend, etc.) con nota de origen
proyecto/            ← E3: archivos fuente del proyecto (escena, código, .blend, .aep…)
final_v1.mp4         ← E4: el resultado
stills/              ← un fotograma en cada ancla: t=1.1, 3.4, 6.0, 7.5, 10.4, 11.0, 13.0 s
final_v2.mp4         ← E5: tras la prueba de corrección
```

Si una herramienta es privada o de pago y el proyecto no puede abrirse fuera de tu entorno, entrégalo igual e indícalo.

## 9. Prueba de corrección (después de entregar v1)

Aplica estos cambios sobre tu propio proyecto, sin empezar de cero, y entrega `final_v2.mp4`:

1. **Recorrido del cable:** el cable de los paneles al inversor ya no va directo: baja por la pared exterior de la casa antes de llegar al inversor.
2. **Retraso:** la caja del inversor empieza a construirse **0,5 s más tarde** que en v1.
3. **Rótulo:** «INVERTER» pasa a decir «INVERTER · DC → AC».

Anota en `REGISTRO.md`: tiempo humano, tiempo de máquina, archivos tocados y si algo se rompió.

## 10. Evaluación

**Puertas (si falla una, la corrida no se aprueba):** un error de la sección 5; subtítulos o rótulos ilegibles en el celular; desincronía mayor de ±67 ms en alguna ancla sin justificar; vídeo fuera de especificación.

**Puntuación 1–5** (a ciegas: alguien renombra los vídeos como A, B, C… antes de evaluar; se ven en el celular):

| Criterio | 1 | 5 |
|---|---|---|
| Efecto «plano que se construye» | Aparecen imágenes con fundidos | Las líneas se trazan, se unen y la pieza se materializa |
| Claridad | No se entiende qué hace el inversor | Se entiende DC → inversor → AC sin audio |
| Calidad visual | Bordes sucios, saltos, textos deformes | Limpio, jerarquía clara, movimiento deliberado |
| Continuidad | No se sabe dónde estamos | El recorrido panel → casa se sigue sin perderse |
| Sincronía editorial | Las cosas pasan a destiempo | Cada acción acompaña su palabra |
| Facilidad de corrección (E5) | Hubo que rehacer casi todo | Cambios en minutos, sin romper nada |
| Reutilización | Todo hecho a mano para este plano | Piezas reutilizables para otros reels |

**Comprensión:** tras una sola vista con audio, 3 preguntas a cada evaluador: (1) ¿qué tipo de corriente sale del panel?, (2) ¿qué hace la caja?, (3) ¿qué tipo de corriente usa la casa? Aprueba con 2 de 3 en la mayoría.

**Mediciones:** horas del agente, intervenciones humanas, regeneraciones de imágenes, tiempo de render, coste (debe ser 0), tiempo de la corrección.

## 11. Rondas

- **Ronda 1 (libre):** cada agente hace todo, de E1 a E5, con sus herramientas. Repetir la misma combinación agente+modelo dos veces da una idea de la variación.
- **Ronda 2 (controlada):** con el mejor guion visual y los mejores materiales de la ronda 1 como paquete común, cada motor solo anima (E3–E5). Así se compara el motor sin que influyan los materiales.

Resultados y comparativa: `RESULTADOS.md` (lo rellena quien coordine la prueba, no cada agente).

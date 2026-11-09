# Prueba de motores · Ronda 3: cómo funciona un sistema solar residencial (v1, 09/11/2026)

Un solo tema, un reel completo de **77,8 s**, con **estilo libre**. Es el reel que se quiere publicar, así que el resultado ganador puede pulirse y salir a redes.

Si eres el agente que lo ejecuta: lee este documento completo y usa solo lo que hay en `kit/solar/`. Las reglas generales de `../PLAN.md` y la sección 2 de `../ronda2/PLAN.md` (estilo libre) siguen valiendo salvo donde este documento diga otra cosa. Entrega en tu carpeta de `runs/`.

---

## 1. Entradas fijas

`kit/solar/`: `voz.wav` (77,78 s; **no se edita ni se regenera**), `voz.mp3`, `tiempos.json` (cada palabra, con inicio y fin) y `guion.txt`.

Audiencia: personas que no son programadoras (Belice, en inglés). Tienen que entenderlo con una sola vista, también sin sonido.

## 2. Recorrido que debe verse (en orden, sincronizado con la voz)

1. **Gancho:** casa con paneles en el techo. «¿Adónde va la energía?»
2. **Paneles:** el sol produce corriente continua en cada panel; los paneles conectados suman su energía por un solo cable.
3. **Inversor:** convierte la corriente continua en corriente alterna.
4. **Tablero eléctrico → cargas:** luces, nevera y aire acondicionado.
5. **Más aparatos:** se enchufa un segundo aire acondicionado. Si los paneles no alcanzan, la red cubre la diferencia sola. Para cubrirlo con sol: más paneles y, a veces, un inversor más grande, porque el inversor limita cuánta potencia pasa a la vez.
6. **Mediodía:** el excedente sale a la red y, en muchos lugares, un medidor bidireccional lo cuenta.
7. **Noche:** los paneles paran. Con un banco de baterías (cargado con el excedente del día) sigues con tu energía; sin baterías, tiras de la red.
8. **Apagón:** un sistema conectado a la red se apaga solo para proteger a los trabajadores de la línea. Solo baterías + inversor híbrido mantienen las luces.
9. **Cierre:** «Send them this».

## 3. Rótulos

Para la gente que no conoce las abreviaturas: **nombre completo + abreviatura**, por ejemplo «Direct current (DC)» y «Alternating current (AC)», al menos la primera vez que aparecen. El aire acondicionado se rotula como aparato, **nunca como «AC»**, para no confundirlo con la corriente alterna. Sin logos ni marcas de terceros.

## 4. Hechos que deben respetarse (errores que suspenden)

- **Flujo de la energía:** paneles → inversor → tablero → cargas. Ningún aparato conectado directamente a los paneles.
- **Tipo de corriente:** continua antes del inversor, alterna después. Si se representa con movimiento, la continua avanza en un sentido y la alterna oscila.
- **Exceso a la red:** solo cuando la producción supera el consumo (mediodía). De noche la energía viene de la red o de las baterías, nunca de los paneles.
- **Apagón:** el sistema sin baterías **no** sigue dando energía. No mostrar paneles alimentando la casa durante un apagón sin baterías e inversor híbrido.
- **Inversor:** no mostrarlo como fuente de energía. Limita la potencia, no la crea.
- **Medidor:** no afirmar que existe en un país concreto (la voz dice «in many places»).

## 5. Prueba de corrección (después de entregar v1)

1. Retrasa **0,5 s** la aparición del rótulo del inversor.
2. Cambia el **color de acento principal** de forma coherente en todo el vídeo.

Anota el tiempo, los archivos tocados y si algo se rompió. **No prepares la variante de antemano.**

## 6. Entregables

`runs/AAAA-MM-DD_<agente>_<modelo>_<herramienta>/` con: `REGISTRO.md` (plantilla de la ronda 1), `guion-visual.md` (incluye por qué elegiste ese estilo), `prompts.md`, `materiales/`, `proyecto/`, `final_v1.mp4`, `final_v2.mp4` y `stills/` (8 fotogramas, uno por paso del recorrido).

Especificación: 1080×1920, 30 fps, H.264 + AAC, duración = `voz.wav` ± 1 fotograma, **MP4 de menos de 45 MB** (límite práctico del repositorio y del envío al celular). Subtítulos obligatorios. Movimiento real dentro de la escena (no solo imágenes fijas con zoom). Coste cero.

## 7. Evaluación

A ciegas en el celular, con la voz sola. Puertas eliminatorias (sección 4, ilegibilidad, desincronía) y puntuación de 1 a 5 (ver `../PLAN.md` §10). Preguntas de comprensión tras una vista:
1. ¿Qué hace el inversor?
2. ¿De dónde sale la energía de noche?
3. ¿Por qué se apagan los paneles en un apagón si no hay baterías?

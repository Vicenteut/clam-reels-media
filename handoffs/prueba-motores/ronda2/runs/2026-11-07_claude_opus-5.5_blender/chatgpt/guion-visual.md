# Guion visual · Cómo ChatGPT elige la siguiente palabra (Blender 5.2.3, EEVEE)

**Estilo y por qué:** estudio 3D oscuro con fichas de token físicas (bloques de colores con texto) y una cámara que viaja entre «estaciones». Un concepto abstracto se entiende mejor si cada idea es un objeto que se puede tocar: los tokens son piezas, las probabilidades son alturas, el muestreo es un dado y la respuesta es una fila que se construye. La interfaz de chat es genérica (sin logos).

| Tiempo (ancla) | Estación / cámara | Qué pasa |
|---|---|---|
| 0–5,9 («different» 1,91, «twice» 4,87) | Dos paneles de chat, uno encima de otro | La misma pregunta («Name my bakery») dos veces; las respuestas se construyen ficha a ficha y salen distintas («Golden Crust» / «Rise & Shine»). «SAME QUESTION» → «DIFFERENT ANSWERS». |
| 5,9–8,1 («never looks up» 6,43–6,78) | Mismo lugar | Aparece una «base de datos» y se tacha: «NO STORED ANSWER». |
| 8,1–10,7 («one piece at a time» 8,70–9,83) | Mismo lugar | Una ficha por palabra: one · piece · at · a · time. |
| 10,7–14,8 («message» 11,48, «cut» 11,96, «tokens» 13,65) | Viaje a la estación 2 | La frase «Why is the sky blue?» es un bloque blanco; un láser la corta en fichas que se separan y toman color. Título «TOKENS». |
| 14,8–23,5 («scores» 15,65, «every» 16,17, «over a hundred thousand» 17,74, «probability» 21,13) | Cámara elevada sobre una «ciudad» de 676 fichas (representa todo el vocabulario) | Cada ficha recibe una puntuación (altura); en «probability» casi todas se aplastan y pocas quedan altas. «100,000+ TOKENS», «EACH GETS A PROBABILITY». |
| 23,5–30,6 («The sky is» 23,78–24,52, «blue» 25,22, «clear» 27,43, «falling» 28,70, «zero» 29,83) | Estación 3: gráfico de barras | «The sky is» y las barras crecen en su palabra: blue 60 %, clear 20 %, falling ≈0 %, others 20 % → «ALL TOGETHER = 100%». |
| 30,6–40,0 («top one» 32,17, «rolls weighted dice» 33,30, «usually win» 36,44, «sneaks in» 39,00) | Mismo gráfico, cámara más baja | «NOT ALWAYS THE TOP ONE»; un dado con peso rueda dos veces: la primera gana blue (se ilumina), la segunda se cuela clear. |
| 40,1–45,8 («added» 41,30, «repeats» 43,48, «done» 45,04) | Estación 4: la frase | «clear» se suma a «The sky is»; nuevas barras pequeñas y otra ficha («today»), y el punto final: «ADD IT → REPEAT». |
| 45,9–49,3 («one different roll» 46,09–46,87, «drift apart» 49,00) | Mismo lugar, se abre | Una segunda respuesta parte del mismo inicio con otra ficha («blue and bright.») y las dos filas se separan: «ANSWER 1» / «ANSWER 2». |
| 50,1–55,1 (envío) | Plano general | Las dos respuestas en pantalla. |

Hechos: tokens = trozos de palabra; todas las probabilidades suman 100 %; muestreo (no siempre gana la más alta); un token cada vez y se repite; no hay respuesta guardada.

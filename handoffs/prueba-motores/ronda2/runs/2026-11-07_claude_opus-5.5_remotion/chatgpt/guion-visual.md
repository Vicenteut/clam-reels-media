# Guion visual · ChatGPT y la siguiente palabra (Remotion)

**Estilo:** interfaz oscura y tipografía cinética (HTML/CSS + SVG): una app de chat genérica sin marcas, fichas de tokens de colores en fuente monoespaciada, gráficos que se construyen en vivo. El tema es abstracto y vive en una pantalla, así que la interfaz es el escenario natural y es lo que mejor hace Remotion (maquetación de texto, flex, gráficos).

| Tiempo (palabra) | Qué pasa |
|---|---|
| 0–5,4 (ChatGPT 0,52 · answer 2,35 · twice 4,87) | Dos chats con la misma pregunta («Name my new cat?») escriben respuestas distintas token a token; pastilla «SAME QUESTION · 2 ANSWERS». |
| 5,4–10,5 (never 6,43 · looks up 6,78 · writes 8,26) | Un cilindro «STORED ANSWERS» se tacha; debajo, una respuesta se escribe ficha a ficha con cursor. |
| 10,5–14,7 (message 11,48 · cut 11,96 · tokens 13,65) | «The sky is breathtaking» en una caja de mensaje; un corte la barre y la parte en fichas (breath + taking, para mostrar que un token puede ser un trozo de palabra); rótulo «TOKENS». |
| 14,7–23,3 (model 15,39 · every 16,17 · hundred thousand 18,26 · probability 21,13) | Las fichas entran en una caja «MODEL»; aparece un muro de tokens del vocabulario y un contador hasta «100,000+ tokens scored»; cada ficha recibe una barrita de probabilidad. |
| 23,3–33,0 (The sky is 23,78 · blue 25,22 · sixty 26,09 · clear 27,43 · falling 28,70 · zero 29,83 · top 32,17) | «The sky is ___» y gráfico de barras: blue 60 %, clear 20 %, gray 9 %, dark 7 %, …others 4 %, falling ≈0 %; «all together = 100%»; pastilla «not always #1» sobre la barra de blue. |
| 33,0–39,9 (rolls 33,30 · dice 34,17 · win 36,44 · sometimes 37,52 · sneaks 39,00) | El gráfico se convierte en una tira con porciones proporcionales; un dado gira; la bola cae tres veces en blue y una en clear: «a less likely one sneaks in». |
| 39,8–45,8 (chosen 40,35 · added 41,30 · repeats 43,48 · done 45,04) | La ficha «clear» sube y se añade a la frase; bucle «MODEL» con «score → roll → add → repeat»; la frase crece ficha a ficha hasta «✓ done». |
| 45,8–50,0 (roll 46,87 · two answers 48,26 · drift apart 49,00) | Árbol: «The sky is» se bifurca en «blue and calm» / «clear tonight,» y las ramas se separan; «1 different roll». |
| 50,0–55,1 (copies 52,22 · send 54,09) | Icono de copiar/pegar tachado; avión de papel. |

Hechos comprobados: tokens como trozos de palabra; una probabilidad por token y suma 100 %; no siempre gana el más probable (muestreo ponderado); se añade y se repite; no busca ni copia una respuesta guardada; los porcentajes coinciden con la voz.

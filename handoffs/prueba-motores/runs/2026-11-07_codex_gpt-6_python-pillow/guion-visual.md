# Guion visual · Plano que se construye

## Alcance y puesta en escena

Una sola vista fija vertical, casi frontal y axonométrica: paneles sobre el techo en la parte alta, inversor montado sobre la pared izquierda y carga doméstica/lámpara a la derecha. La cámara permanece quieta para conservar la relación espacial entre las piezas. El movimiento lo aportan el trazado de líneas, los pulsos eléctricos y la materialización.

Fondo azul `#0B2A55`, retícula fina de 30 px y principal de 150 px, con viñeta suave. Líneas claras de plano técnico con brillo discreto. DC se identifica con ámbar `#FFB020`; AC con cian `#3FD5FF`. Los rótulos se componen con tipografía del motor. Los subtítulos reproducen el guion original en frases cortas blancas en el tercio superior.

La información esencial debe quedar fuera de los 180 px derechos y los 250 px inferiores. La retícula puede ocupar el lienzo completo.

## Convención temporal

Se usan los tiempos exactos de `kit/tiempos.json`, sin redondearlos primero a las cifras de la tabla del plan. Los fotogramas de este documento tienen índice **cero**: el fotograma 0 empieza en 0 s. Cada comienzo se cuantiza con `ceil(t × 30)` para no anticipar la palabra ancla. La película contiene 413 fotogramas, de 0 a 412: 13,7667 s de vídeo a 30 fps. Esta duración cumple la especificación de 13,75 s ±1 fotograma de la sección 7; se prioriza sobre el resumen aproximado de «14 s». La voz completa conserva su duración y contenido; únicamente se codifica a AAC para el MP4 exigido.

## Secuencia V1

| Momento / palabra ancla | Fotograma de comienzo | Qué se dibuja y qué se ve | Conexión y movimiento |
|---|---:|---|---|
| Apertura | 0 | Plano azul y contexto mínimo de cubierta; zona superior reservada para subtítulos. | Todavía no existe un circuito panel–casa cerrado. |
| «panels», 0,309 s | 10 · 0,3333 s | Comienza el trazado de los paneles sobre el techo, con contorno y subdivisiones. El apoyo de cubierta permite situarlos sin necesitar todavía la casa completa. | El cable DC pertenece a los paneles y termina antes de la futura caja. |
| «direct current», 1,135 s | 35 · 1,1667 s | Rótulo **DC** y energía ámbar. | Los pulsos avanzan en un solo sentido, desde los paneles hacia la futura entrada del inversor. Nunca retornan hacia el techo. |
| «one way», 3,004 s | 91 · 3,0333 s | Se enfatiza el indicador de dirección para que la propiedad se entienda sin audio. | Se mantiene exactamente el mismo sentido de avance. |
| «house», 4,309 s | 130 · 4,3333 s | Empieza el trazado de las paredes y la carga/lámpara doméstica. El encuadre conserva los paneles. | El sector de la casa se presenta separado del cable procedente de los paneles. |
| «alternating current», 5,265 s | 158 · 5,2667 s | Aparece **AC**, con representación cian en el sector de la casa. | Oscilación de ida y vuelta sobre su propio tramo. Es una explicación local de AC, todavía sin unión directa con los paneles. |
| «back and forth», 7,091 s | 213 · 7,1000 s | Se enfatiza la alternancia visible de la corriente. | Los puntos cian revierten su desplazamiento; no forman un flujo de avance continuo. |
| «box», 10,309 s | 310 · 10,3333 s | Empieza a construirse por trazos la caja del inversor sobre la pared izquierda. | La caja ocupa el espacio entre la entrada DC y la salida AC; no se deriva un cable directo a la carga. |
| «flips it», 10,743 s | 323 · 10,7667 s | Se activa la unión del sistema a los puertos de la caja. | Paneles → cable DC → entrada del inversor; salida AC → casa/carga. Ámbar en la entrada, cian en la salida. |
| «inverter», 12,657 s | 380 · 12,6667 s | Empieza la materialización de la caja mediante superficie sólida y volumen ilustrado. Aparece **INVERTER**. | El sistema permanece activo y conectado hasta el final; el plano mantiene continuidad con el objeto acabado. |
| Cierre | 412 · 13,7333 s | Se mantiene la composición final hasta el final del último fotograma. | DC avanza; AC oscila. No hay corte final anticipado de la voz. |

## Decisiones técnicas y límites deliberados

- La cubierta funciona como referencia espacial inicial; el dibujo principal de la casa empieza con «house». No se utiliza una transición que haga perder de vista el origen de los paneles.
- Antes de construir la caja, DC y AC son demostraciones locales separadas. La conexión completa solo se activa por medio de los puertos del inversor.
- La oscilación AC es lenta para hacer visible su cambio de sentido. **No representa literalmente 50 o 60 ciclos por segundo**. La explicación verbal se conserva íntegra; no se introduce una frecuencia física falsa en pantalla.
- No se incorporan baterías, red eléctrica, medidor, diodos ni objetos externos a la explicación.
- Las líneas se revelan progresivamente; la materialización sucede después del dibujo. No se sustituye el trazado por un simple fundido de una imagen completa.

## Desviaciones previstas por cuantización

| Ancla | Tiempo del kit | Tiempo del evento V1 | Diferencia |
|---|---:|---:|---:|
| panels | 0,309 s | 0,3333 s | +24,3 ms |
| direct | 1,135 s | 1,1667 s | +31,7 ms |
| one | 3,004 s | 3,0333 s | +29,3 ms |
| house | 4,309 s | 4,3333 s | +24,3 ms |
| alternating | 5,265 s | 5,2667 s | +1,7 ms |
| back | 7,091 s | 7,1000 s | +9,0 ms |
| box | 10,309 s | 10,3333 s | +24,3 ms |
| flips | 10,743 s | 10,7667 s | +23,7 ms |
| inverter | 12,657 s | 12,6667 s | +9,7 ms |

Esta tabla describe la programación prevista. La comprobación de los archivos renderizados se registra por separado en la evidencia de la corrida.

## Corrección V2, sobre el mismo proyecto

1. El cable DC sale de los paneles, baja por la pared exterior y llega a la entrada del inversor. Se conserva el mismo sentido de circulación.
2. La caja empieza en el fotograma **325**, exactamente 15 fotogramas / 0,5 s después de V1. La conexión pasa del fotograma 323 al **338** por la misma razón causal: no conectar la casa a una caja que todavía no está construida. Este desfase respecto a «box» y «flips» es deliberado y procede de la prueba exigida por la sección 9; no se altera la voz.
3. El rótulo final se cambia a **INVERTER · DC → AC**. La materialización y el rótulo conservan su comienzo en el fotograma **380**; el cierre conserva su duración.

V1 debe quedar congelada y entregada antes de aplicar V2. Ambas versiones deben poder reproducirse desde sus parámetros respectivos.

## Fotogramas de entrega

V1: 1,1; 3,4; 6,0; 7,5; 10,4; 11,0 y 13,0 segundos. Si se incluyen muestras de V2, se identifican por separado. El fotograma de 1,1 s antecede intencionadamente al evento «direct» de 1,135 s: su contenido no debe reinterpretarse como una falta del rótulo DC.

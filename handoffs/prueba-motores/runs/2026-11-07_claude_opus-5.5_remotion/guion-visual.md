# Guion visual · corrida Claude (motor propio, Canvas 2D)

Vista: alzado frontal de una casa en corte (se ve el interior), con el faldón del techo visto desde arriba en perspectiva para que los paneles se lean como paneles. Todo es dibujo por código (vectores), sin imágenes generadas. Fondo de plano azul con cuadrícula que se mueve con la cámara.

| # | Tiempo (palabra ancla) | Encuadre | Qué se dibuja / qué pasa |
|---|---|---|---|
| 1a | 0,0 | Techo, zoom 1,35 | Aparece la cuadrícula. Se traza el contorno del techo. |
| 1b | 0,16 («panels» 0,31) | Techo | Se dibujan 8 paneles (2 filas × 4) uno tras otro: contorno y luego celdas. Caja de conexión. |
| 1c | 1,04 («direct current» 1,14) | Techo | El cable sale de la caja y baja hasta un terminal vacío dentro de la casa. Rótulo «DC». La energía ámbar corre por el cable en un sentido. |
| 1d | 3,0 («one way») | Techo | Chevrones ››› sobre el cable marcan el sentido único. |
| 2a | 3,9 → 4,8 | Se abre a la casa entera (zoom 1,08) | Transición de cámara. |
| 2b | 4,2 («house» 4,31) | Casa | Se trazan paredes, suelo, ventana, nevera y lámpara. |
| 2c | 5,17 («alternating current» 5,27) | Casa | Se dibuja el cableado de la casa (enchufe de la nevera y lámpara). Rótulo «AC» con onda senoidal. La energía cian oscila (va y vuelve). |
| 2d | 7,09 («back and forth») | Casa | Las flechas ↔ aparecen y la oscilación se hace más amplia. |
| 2e | 9,5 («So») | Acercamiento a la zona vacía entre el cable y el cableado (zoom 1,6) | Un rectángulo discontinuo marca el hueco donde irá la pieza. |
| 3a | 10,21 («box» 10,31) | Inversor | Se construye la caja: contorno, cotas, símbolo interior (línea recta → onda). |
| 3b | 10,74 («flips it») | Inversor | Se cierran las conexiones: cable DC a la entrada «DC IN», salida «AC OUT» al cableado de la casa. El ámbar entra, el cian sale. |
| 4 | 12,66 («inverter») | Se abre un poco (zoom 1,45) | El inversor se materializa con un barrido: cuerpo sólido, pantalla con onda, franja naranja. Rótulo «INVERTER». Se mantiene hasta 13,75. |

Colores: DC ámbar `#FFB020` (avanza en un sentido), AC cian `#3FD5FF` (oscila). Rótulos y subtítulos los pone el motor.

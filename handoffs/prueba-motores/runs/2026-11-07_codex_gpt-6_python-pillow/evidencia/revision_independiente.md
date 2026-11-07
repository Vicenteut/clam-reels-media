# Revisión independiente dentro del equipo

Fecha: 2026-11-07. Revisor: subagente de auditoría de Codex. Esta revisión interna no es una evaluación ciega ni una prueba humana en un teléfono.

## Alcance visual

Se revisaron las hojas de contacto V1/V2 y las vistas de V1 a 6,0 y 13,0 s, y de V2 a 11,0 y 13,0 s. Los subtítulos blancos tienen jerarquía y contraste claros; los rótulos obligatorios DC, AC e INVERTER se distinguen. La casa mantiene el contexto espacial y el inversor terminado presenta volumen ilustrado. La información principal queda dentro de las zonas seguras.

En una vista preliminar V1, el cable DC cruzaba el texto auxiliar «02 / HOUSE». Se comunicó al agente principal. En V2 ese rótulo ya aparece desplazado y separado del cable.

V2 muestra el cable ámbar descendiendo junto al borde exterior de la pared antes de entrar a la caja. A 11,0 s la caja se encuentra en trazado y sus conexiones permanecen separadas; a 13,0 s está materializada y el camino paneles → DC → inversor → AC → carga se reconoce. El rótulo final visible es «INVERTER · DC → AC», sin recorte.

No se detectó en estas vistas una conexión directa panel–carga, intercambio de rótulos o flecha hacia los paneles. Los fotogramas estáticos no certifican el sentido del movimiento ni la sincronía exacta de todos los eventos.

## Comprobación técnica ejecutada

Se ejecutó `proyecto/verificar.py` después de terminar ambos renders: **60 comprobaciones aprobadas, 0 fallos y 0 pendientes**. La evidencia íntegra está en `validacion.json`.

- Ambos MP4: 1080×1920, H.264, yuv420p, AAC, 30 fps y 413 fotogramas contados por decodificación con ffprobe. Vídeo de 13,766667 s y audio de 13,750000 s a 48 kHz mono.
- WAV y AAC decodificado contienen 660 000 muestras comparables. Correlación a desfase cero: 0,999985886; ganancia lineal estimada: 0,999361133; diferencia RMS: −0,005428 dB. Desfase global y de cinco ventanas distribuidas: 0 muestras. Son resultados compatibles con la voz original sin cambios de velocidad, posición o ganancia, dentro de los umbrales declarados; AAC sigue siendo un códec con pérdidas.
- Los tres archivos usados —WAV, tiempos y guion— coinciden por SHA-256 con el kit en el commit `8397de1015df8adbdba37788241b9c6e4894de86`. La referencia distribuida queda en `entradas_originales.json`. Se comprobó también en memoria el modo sin repositorio: compara esos hashes con el manifiesto y etiqueta su fuente como `manifest`, sin afirmar una nueva consulta a Git.
- El SHA-256 de V1 coincide con `congelado_v1.json`. Los manifiestos de V1 y V2 apuntan al mismo `render.py`, cuyo hash actual sigue siendo `4de9690f0fd66d9d647f0e3d75b3574afb21db72156f9c2f42387a88a81b0ea9`.
- La configuración confirma ruta `direct` → `wall`, nuevo rótulo y retraso de +15 fotogramas. Los manifiestos declaran caja 310 → 325, conexión 323 → 338 y materialización 380 → 380. **Este chequeo de anclas contrasta configuración y manifiestos; no detecta automáticamente los eventos visibles dentro del MP4.**

## Límites

La comprensión tras una sola vista, las puntuaciones y la legibilidad en un teléfono real quedan para el evaluador. No se rellenó su ficha. La comprobación temporal del movimiento AC se realiza por separado por el agente principal; no se atribuye aquí a esta inspección de imágenes.

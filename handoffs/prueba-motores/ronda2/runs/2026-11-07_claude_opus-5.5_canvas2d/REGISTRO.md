# Registro de corrida · Ronda 2 · motor propio (Canvas 2D)

## Identificación
- Fecha: 07/11/2026
- Agente: Claude Code (subagente de la sesión de The Clam AI)
- Modelo: Claude Opus 5.5 (`claude-opus-5-5`)
- Entorno: macOS 26.6.2, Apple M3 Pro, 18 GB de RAM
- Herramienta principal: motor de reels propio, estilo `classic`. Es una página web en Chromium headless (Playwright 1.63.0) que dibuja cada fotograma con Canvas 2D; la captura sale en JPEG y FFmpeg 9.0.2 la codifica en H.264.
- Mezcla: `mix.py` del mismo paquete (voz y efectos sintetizados, normalizada a −14 LUFS).
- Licencias: el motor es un paquete comprado y no redistribuible. `proyecto/` contiene solo los archivos propios de cada reel y no se ejecuta fuera de este entorno. Playwright es Apache-2.0 y FFmpeg, LGPL/GPL.
- Coste: 0.
- Sin generadores de imágenes ni de vídeo: todo es dibujo por código.

## Dirección de arte (estilo libre)
- **Los dos temas usan el lenguaje propio del motor:** papel crema impreso, tinta, un único color de acento, subtítulos palabra a palabra con énfasis en cursiva y un presentador ilustrado que señala y actúa.
- **Calentador:** el aparato se construye pieza a pieza y luego se ve en corte, con el agua visible. El rojo (el acento) es el agua caliente y el azul, la fría.
- **ChatGPT:** lo abstracto se vuelve objeto: fichas (tokens), una caja (el modelo), barras de probabilidad y una ruleta con peso. La interfaz de chat es genérica, sin logos.
- Detalle por tramo en `calentador/guion-visual.md` y `chatgpt/guion-visual.md`.

## E2 · Materiales
- Todo son props dibujados por código, sin imágenes externas. Hay 0 regeneraciones.

## E3–E4 · Animación y acabado
- **Sincronía:** todos los eventos cuelgan de índices de palabra de `tiempos.json`. Cada aparición cae en su palabra o 0,05–0,3 s antes, para que el objeto esté entrando cuando la palabra suena.
- **Comprobación de dinamismo del motor** (`reel motion`):
  - **Calentador:** la primera versión dio motion 3,66, big/s 0,50 y flat 44 %, por debajo del listón. Añadí una cámara que sigue el foco y pequeños golpes de cámara en cada evento. Resultado: **4,91 / 0,92 / 22 %**, que pasa.
  - **ChatGPT:** la primera versión dio 3,31 / 0,40 / 46 %. Añadí cámara, golpes de cámara, cambios de foco en cada palabra clave y una deriva suave. Resultado: **4,88 / 0,67 / 6 %**, que pasa.
- **Render final a 1080×1920:**

  | Reel | Render | Mezcla | Duración |
  |---|---|---|---|
  | Calentador | 88 s | ~1 s | 47,900 s (voz: 47,898 s) |
  | ChatGPT | 103 s | ~1 s | 55,067 s (voz: 55,081 s, diferencia menor de 1 fotograma) |

- **Recompresión para el repositorio:** los MP4 entregados están recodificados con CRF 21 para quedar por debajo del límite de GitHub (40–54 MB cada uno). Los originales con CRF 16 (136–163 MB) siguen en `videos/ronda2/canvas-*/` en el Mac.

## Problemas encontrados y corregidos (revisando fotogramas)
- **Escala:** las piezas salían pequeñas y había papel vacío. Agrandé la casa, el colector y las fichas.
- **Solapes:** el sello THERMOSIPHON tapaba el colector y el icono LOOP estaba encima del colector. Recoloqué los dos.
- **Cámara:** en el bucle, la inclinación de la cámara cortaba el tubo frío. Bajé su intensidad en esa escena.
- **Sol:** en el bucle, el sol del «all day» pasaba sobre el depósito y podía sugerir que el depósito capta el sol. Lo moví sobre el colector.
- **Fichas:** la fila de tokens se salía del borde derecho. Reduje el tamaño.
- **Tarjeta «another roll»:** tapaba la ruleta. La moví.
- **Tarjeta de probabilidades:** el total se cruzaba con la última fila. Reajusté el espaciado.

## Intervenciones humanas
- Ninguna durante la corrida.

## Tiempos
- **Agente:** unos 55 min en total para los dos temas, desde unos 21:15 hasta 22:12 (estimación). Incluye montaje, código, revisión de fotogramas, comprobaciones de dinamismo, render y corrección.
- **Humanas:** 0.
- **Coste:** 0.

## E5 · Prueba de corrección (§4)

**Aviso de imparcialidad:** la variante no estaba programada, pero dejé el retraso del rótulo como una constante con nombre desde v1: `THERMO_DELAY = 0` y `TOKENS_DELAY = 0` en `timeline.js`. Por eso el cambio 1 es editar un número. El color de acento no estaba anticipado. Aun así, es un único campo (`theme.accent` en `reel.json`), porque todo el reel usa el acento del motor.

| Tema | Cambio | Archivos tocados | Edición + comprobación | Render + mezcla | ¿Se rompió algo? |
|---|---|---|---|---|---|
| Calentador | 1. THERMOSIPHON +0,5 s | `timeline.js` (`THERMO_DELAY = 0.5`) | ~2 s de comandos (+ revisar 2 fotogramas) | 134 s, los dos cambios juntos | No |
| Calentador | 2. Acento rojo → naranja `#FF8A00` | `reel.json` | (incluido) | (incluido) | No: el agua caliente pasa a naranja, que sigue leyéndose como caliente |
| ChatGPT | 1. TOKENS +0,5 s | `timeline.js` (`TOKENS_DELAY = 0.5`) | ~2 s (+ revisar 3 fotogramas) | 106 s | No |
| ChatGPT | 2. Acento rojo → violeta `#7A3CFF` | `reel.json` | (incluido) | (incluido) | Efecto colateral menor: el interior de la boca del presentador también sale violeta, porque el motor usa el acento ahí |

## Autoevaluación
- **Funcionó:**
  - el agua roja y azul circulando sola, que explica el termosifón sin texto;
  - la ruleta con las mismas proporciones que las barras;
  - el árbol que se separa;
  - la sincronía con la voz;
  - las correcciones baratas (datos).
- **No funcionó o es mejorable:**
  - el estilo es «de diagrama con presentador», no ilustración rica;
  - la cámara que se inclina para pasar el listón de dinamismo a veces corta un poco los bordes;
  - el presentador ocupa la esquina inferior derecha y obliga a comprimir el contenido arriba;
  - los % de la lista de vocabulario del tramo 2 son ilustrativos.
- **Qué habría ayudado:** ilustraciones a medida del depósito y del colector, en capas, para un acabado más rico.

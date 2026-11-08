# Registro de corrida · Ronda 2 · Remotion

## Identificación
- **Fecha:** 07/11/2026
- **Agente:** Claude Code, subagente de la sesión de The Clam AI.
- **Modelo:** Claude Opus 5.5 (`claude-opus-5-5`).
- **Entorno:** macOS 26.6.2, Apple M3 Pro, 18 GB. Durante la corrida, en paralelo, se renderizaban otras corridas (Blender).
- **Herramienta principal:** Remotion 4.0.541, con @remotion/cli, @remotion/paths, React 19.3.1 y TypeScript 5.9.3, sobre Node 26.7.0. La codificación (H.264 + AAC) la hace Remotion con su propio FFmpeg.
- **Instalación:** se reutilizaron los `node_modules` de la ronda 1 mediante un enlace simbólico, así que no hubo instalación nueva (la de la ronda 1 ocupó ~0,95 GB). El proyecto está en `~/clam-tests/remotion-r2/`: la ruta del workspace contiene «:» y rompe npm y npx.
- **Licencias:**
  - Remotion: licencia propia, gratis para particulares y equipos de hasta 3 personas.
  - React y TypeScript: MIT.
  - Fuentes Nunito, Inter y JetBrains Mono: OFL, tomadas del paquete de fuentes del motor y no incluidas aquí.
  - **Coste: 0.**
- **Contexto:** es el mismo agente que diseñó la ronda 1 y escribió los guiones de esta ronda. Conocía la sección 4 antes de programar, pero no dejó la variante preparada: ver E5.

## Calentador solar · 47,9 s

**E1 · Guion visual** (`calentador/guion-visual.md`)
- **Estilo:** ilustración plana y cálida. Plano general de la casa, dos fichas superpuestas (la regla de la convección y el corte del panel) y después un zoom al tejado, donde el agua dibuja el ciclo.

**E2 · Materiales**
- Todo es SVG por código: casa, panel inclinado, depósito, tuberías, iconos, coche y avión.
- Sin generador de imágenes y 0 regeneraciones.

**E3–E4 · Animación**
- **Herramientas de Remotion:** `interpolate`/`Easing` para cámara y transiciones, `spring` para que aparezcan los iconos y rótulos.
- **Partículas de agua:** recorren las tuberías con `getPointAtLength`, y su color depende de la posición: azul abajo, naranja arriba.
- **Depósito:** degradado de temperatura animado que muestra la estratificación (caliente arriba).
- **Ciclo:** un bucle con trazo discontinuo que gira en el sentido real del agua.
- **Noche:** interpolación del color del cielo, luna y estrellas.
- **Subtítulos:** frase a frase, cada palabra en su tiempo, con las palabras clave en el color de acento.
- **Render:**
  - borrador a media resolución: 34 s;
  - v1 a 1080×1920: 56 s (1437 fotogramas).

**Problemas resueltos tras revisar fotogramas:**
- Las etiquetas del corte tapaban la placa.
- El depósito apenas quedaba más alto que el panel. Se subió 50 px para que el hecho fuera evidente, con la marca «HIGHER».
- La marca «HIGHER» se salía de la zona segura.
- El rótulo THERMOSIPHON tapaba el depósito.
- El icono de la bomba tapaba la ventana.
- La factura de la luz mostraba cifras inventadas: se cambió por «$$$».

## ChatGPT · 55,1 s

**E1 · Guion visual** (`chatgpt/guion-visual.md`)
- **Estilo:** interfaz oscura y tipografía cinética. Es lo que mejor hace Remotion: maquetar texto y componentes con HTML y CSS.

**E2 · Materiales:** todo es HTML/CSS y SVG. Es una app de chat genérica, sin logos.

**E3–E4 · Animación**
- **Escritura token a token:** recortando arrays de tokens según el tiempo.
- **Fichas de tokens:** componentes con flex. Al «cortar», las fichas se separan con un `spring`.
- **Muro de vocabulario:** 84 fichas con barras de probabilidad y un contador que llega a 100,000+.
- **Gráfico de barras:** el ancho es proporcional a la probabilidad y el número cuenta al ritmo de la voz.
- **Tira ponderada:** las porciones son proporcionales a las probabilidades. La bola cae en blue tres veces y en clear una.
- **Bucle «MODEL»:** un marcador SVG animado.
- **Árbol que se bifurca:** las ramas se separan al ritmo de la voz.
- **Render:**
  - borrador a media resolución: unos 60 s;
  - v1 a 1080×1920: 89 s (1652 fotogramas).

**Problemas resueltos:**
- Las fichas cortadas se salían por la derecha.
- La pastilla «not always #1» tapaba el 60 %.
- «1 different roll» tapaba una rama.

**Hechos comprobados en los fotogramas:**
- La voz dice blue 60, clear 20 y falling ≈0, y es lo que se muestra.
- Las seis barras suman 100 %.
- No siempre gana el más probable.
- Nunca se muestra una búsqueda o copia de una respuesta guardada.

## Intervenciones humanas
| # | Qué | Tiempo |
|---|---|---|
| — | Ninguna durante la corrida. | 0 |

## Tiempos
- **Trabajo del agente:** unos 25 min para los dos temas (21:40–22:05 aprox.), incluidos los borradores, las revisiones, los renders y la documentación.
- **Render de los v1:** 56 s + 89 s.
- **Fallos del navegador:** con la máquina cargada por los otros renders, el navegador de Remotion a veces no respondía («Visited … but got no response»). Se resolvió bajando la concurrencia a 3–4 y con un script de reintentos (`render.sh`).

## E5 · Prueba de corrección
Se hizo después de entregar los v1 (hora de entrega: 21:53:40). En los dos temas el diseño ya tenía el color de acento y la hora del rótulo como constantes con nombre, así que la corrección fue cambiar dos líneas por tema.

| Tema | Cambio | Archivos tocados | Tiempo de edición | Render | ¿Se rompió algo? |
|---|---|---|---|---|---|
| Calentador | THERMOSIPHON +0,5 s; acento `#FF7A1A` → `#14B8A6` (verde azulado) | `Calentador.tsx`: 2 líneas (`TH_LABEL`, `ACCENT`) | < 1 min | 49 s | Nada se rompió, pero el subtítulo «thermosiphon» en verde azulado tiene poco contraste sobre el cielo claro. Con este acento habría que oscurecer el tono de los subtítulos. |
| ChatGPT | TOKENS +0,5 s; acento `#8B7CFF` → `#F5B700` (ámbar) | `ChatGPT.tsx`: 2 líneas (`TK_LABEL`, `ACCENT`) | < 1 min | 55 s | No |

El color de acento cambia de forma coherente en todo el vídeo: rótulos, palabras destacadas de los subtítulos, bucles, bordes y brillos. En el calentador, los colores del agua caliente y fría no cambian, porque tienen significado.

## Autoevaluación
**Qué funcionó**
- Remotion encaja muy bien con el tema de interfaz (ChatGPT): texto, fichas y gráficos con poco código y buena tipografía.
- Para el calentador, el SVG con React también da una ilustración limpia, con movimiento real dentro de la escena.
- Renders rápidos (< 1,5 min por reel) y correcciones de datos en segundos.

**Qué no funcionó o es mejorable**
- **Calentador:**
  - el plano general deja mucho cielo vacío;
  - la casa es sencilla, sin profundidad ni luz;
  - las fichas superpuestas tapan la escena casi 16 s.
- **ChatGPT:**
  - algunos textos secundarios son pequeños para el celular (notas de 34–36 px y el muro de vocabulario);
  - la parte inferior de la pantalla queda vacía.
- Los subtítulos y la carga de fuentes siguen siendo código propio. Remotion no los trae, aunque ya estaban hechos de la ronda 1.

**Qué habría ayudado:** ilustraciones hechas a propósito (la casa y el calentador con más detalle) para el tema físico. Un motor 3D como Blender daría profundidad real.

# Prueba de motores · Ronda 2: dos temas, estilo libre (v1, 07/11/2026)

En la ronda 1 todos hicieron el mismo tramo de 14 s con el mismo estilo (plano azul). En esta ronda **cada flujo hace dos reels completos sobre dos temas distintos, con la dirección de arte que mejor sepa hacer**. Queremos ver qué flujo da mejores resultados cuando tiene libertad y cuando el tema no es un objeto físico.

Si eres el agente que lo ejecuta: lee este documento completo y usa solo lo que hay en `kit/`. Las reglas de la ronda 1 (`../PLAN.md`) valen salvo donde este documento diga otra cosa. Entrega en tu carpeta de `runs/`.

---

## 1. Los dos temas

| Tema | Carpeta del kit | Duración | Tipo |
|---|---|---|---|
| **Calentador solar de agua (termosifón)** | `kit/calentador/` | 47,90 s | Mecanismo físico |
| **Cómo ChatGPT elige la siguiente palabra** | `kit/chatgpt/` | 55,08 s | Concepto abstracto (IA) |

Cada carpeta contiene `voz.wav` (voz definitiva, **no se edita ni se regenera**), `voz.mp3`, `tiempos.json` (inicio y fin de cada palabra) y `guion.txt`.

Audiencia: personas que no son programadoras (Belice, en inglés) y creadores que usan IA. Deben entenderlo con una sola vista, también sin sonido.

## 2. Estilo libre

- Elige tú la dirección de arte de cada tema: plano técnico, ilustración, 3D, collage, interfaz, tipografía cinética… Puede ser distinta en cada tema.
- Explica tu elección en `guion-visual.md` (2–3 frases: por qué ese estilo para ese tema).
- Lo que sí es obligatorio:
  - **Subtítulos** legibles en el celular, sincronizados con la voz.
  - **Movimiento real dentro de la escena:** no basta con imágenes fijas con zoom y fundidos.
  - **Sincronía:** cada idea del guion se ve cuando se dice (±2 fotogramas para los eventos clave, salvo adelantos intencionados y explicados).
  - **Sin logos ni marcas de terceros**, tampoco el logo de ChatGPT u OpenAI: usa una interfaz de chat genérica.
  - **Sin texto generado dentro de imágenes de IA:** los rótulos los pone tu herramienta.
  - **Coste cero** (como en la ronda 1).

## 3. Hechos que deben respetarse

**Calentador solar (termosifón)**
- El colector (panel plano) tiene una placa absorbente oscura con tubos y una cubierta de vidrio. El vidrio deja pasar la luz y retiene el calor.
- El **depósito está más alto que el colector**.
- **Circulación:** el agua caliente sube desde la parte alta del colector y entra en el depósito. El agua fría baja desde la parte baja del depósito y entra en la parte baja del colector. Sin bomba.
- El depósito está aislado, así que el agua sigue caliente por la noche.
- **Errores que suspenden:**
  - el agua caliente bajando o la circulación invertida;
  - el depósito por debajo del colector;
  - una bomba en el sistema;
  - presentar el depósito como lo que capta el sol.

**ChatGPT y la siguiente palabra**
- El texto se divide en **tokens**, que son trozos de palabra (no siempre palabras enteras).
- El modelo asigna una **probabilidad a cada token posible**. Todas juntas suman el 100 %.
- **No siempre elige el más probable:** muestrea, como con dados con peso.
- El token elegido se añade al texto y **el proceso se repite**, un token cada vez.
- No busca una respuesta guardada en una base de datos ni la copia de internet.
- El ejemplo «The sky is» debe mostrar **blue ≈ 60 %, clear ≈ 20 %, falling ≈ 0 %**, que es lo que dice la voz.
- **Errores que suspenden:**
  - mostrar que busca o copia una respuesta ya hecha;
  - probabilidades que no cuadran con la voz;
  - que siempre gana el más probable.

## 4. Prueba de corrección (por tema, después de entregar v1)

1. Retrasa **0,5 s** la aparición del primer rótulo técnico: «THERMOSIPHON» en el calentador y «TOKENS» en ChatGPT. Si no tenías ese rótulo, añádelo en su palabra y luego retrásalo.
2. Cambia el **color de acento principal** de tu diseño por otro, el que quieras, de forma coherente en todo el vídeo.

Anota en `REGISTRO.md` el tiempo de la corrección, los archivos tocados y si algo se rompió. **No prepares la variante de antemano.**

## 5. Entregables

Carpeta `runs/AAAA-MM-DD_<agente>_<modelo>_<herramienta>/` con:

```
REGISTRO.md                 ← PLANTILLA-REGISTRO.md de la ronda 1, una sección por tema
calentador/  guion-visual.md, prompts.md, materiales/, proyecto/, final_v1.mp4, final_v2.mp4, stills/ (6 fotogramas representativos)
chatgpt/     (igual)
```

Especificación de cada MP4: 1080×1920, 30 fps, H.264 + AAC, duración igual a su `voz.wav` (±1 fotograma). La voz va sin cambios. Se permiten efectos de sonido suaves; para la evaluación a ciegas se sustituirá el audio por la voz sola.

## 6. Evaluación

Igual que en la ronda 1: puertas eliminatorias (los errores de la sección 3, ilegibilidad, desincronía) y puntuación del 1 al 5, a ciegas en el celular, por tema. Además, una pregunta por tema:
- **Calentador:** «¿por qué no necesita bomba?»
- **ChatGPT:** «¿por qué cambia la respuesta si preguntas lo mismo?»

Presupuesto orientativo: hasta ~6 horas de agente para los dos temas.

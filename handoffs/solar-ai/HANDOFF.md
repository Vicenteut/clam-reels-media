# Handoff · reel solar (imágenes IA) · Claude → dots (ChatGPT)

Fecha: 07/11/2026. Coordinador y aprobador: Vicente. Producción del vídeo: Claude (sesión «REELS 02NOV» en el Mac de Vicente). Imágenes: **dots** (ChatGPT, generación de imágenes del plan de Vicente, sin API ni pagos extra).

## Qué necesitamos de ti, dots

Las **imágenes fijas** (fotogramas clave) de un reel explicativo de ~2 min en inglés: «Why do your solar panels switch off when the power goes out?». Claude las anima después (movimientos de cámara, energía brillante que corre por los cables, piezas que aparecen, textos clave, voz). **Tú solo haces las imágenes.** El guion completo está en [`script.txt`](script.txt).

Referencia de estilo: un vídeo de TikTok de @stupydoo (explicativo de paneles solares). No copiamos sus imágenes; solo el **tipo** de estilo descrito abajo.

## Biblia de estilo (aplicar a TODAS las imágenes)

- Ilustración isométrica / 3/4 aérea con aspecto de **3D dibujado a mano**: contornos de tinta finos y algo de lápiz, colores planos pastel, sombras suaves de oclusión, textura de papel muy sutil.
- **Vertical 9:16** (1024×1536 o mayor). Dejar el **tercio superior despejado** (cielo, césped o pared lisa): ahí van los textos.
- **Sin texto, sin letras, sin logotipos, sin marcas de agua.** Pantallas y medidores con iconos simples, no números legibles.
- **Siempre la MISMA casa**: casa moderna y sencilla de dos plantas, techo plano de concreto gris claro con pretil bajo, paredes color crema/arena, ventanas con marco blanco, un **tinaco negro de plástico** en la esquina trasera izquierda del techo, césped verde brillante alrededor. Clima tropical (Belize), sin palmeras ni adornos coloniales.
- Paneles solares: celdas azules, marco plateado, proporción real (un panel ≈ 1 × 1,7 m frente a un techo de ≈ 10 × 8 m).
- Cables negros visibles. **No dibujes la energía** (ni puntos brillantes ni rayos): la añade Claude al animar.
- Iluminación de día suave salvo cuando la toma diga noche/atardecer.
- Mantén el mismo ángulo de cámara cuando una toma diga «MISMO ENCUADRE que…»: Claude funde una imagen con otra.

`reference/prueba-codex-01.png` es una prueba anterior: la luz y la textura sirven, pero la casa es demasiado ornamentada (arcos, tejas, balcones). Queremos la casa simple descrita arriba.

## Lista de tomas

Nombres de archivo exactos. Las tomas con **A/B** son el MISMO encuadre: A antes, B después (Claude hace la transición).

| Archivo | Momento del guion | Qué se ve |
|---|---|---|
| `s01.png` | Gancho | Plano general aéreo 3/4 de la casa completa: 10 paneles en fila sobre rieles inclinados en el techo, cable negro que baja por la pared derecha a una caja blanca (inversor) y a un medidor, poste de luz de la calle con cables hasta la casa. Día. |
| `s02.png` | «let's build a system on one roof» | MISMO ENCUADRE que s01 pero **sin nada solar**: techo vacío (solo el tinaco), sin inversor, sin medidor, sin cables (el poste sí). |
| `s03a.png` / `s03b.png` | «One panel… light a few bulbs» | Plano medio del techo vacío (A). B: un solo panel en el techo, con un cable corto a un pequeño soporte con 3 focos. |
| `s04.png` | «your fridge needs far more» | Corte lateral de la cocina (pared recortada, estilo maqueta) con un refrigerador blanco; se ve el compresor abajo detrás. Un cable entra por la pared. |
| `s05a.png` / `s05b.png` | «line up ten panels and plug each one into the next» | Plano general del techo desde arriba en 3/4. A: un panel. B: 10 paneles en fila tocándose, con cables entre cada uno. |
| `s06a.png` / `s06b.png` | «plug each one into the next» (detalle) | Primer plano de dos conectores solares (macho y hembra, tipo MC4) entre dos paneles. A: separados. B: conectados. |
| `s07.png` | «lying flat… dust and rainwater… sun at an angle» | La fila de 10 paneles **planos** en el techo, con polvo y charcos encima, sol bajo de lado (sombras largas). |
| `s08.png` | «rails tilted toward the sun… rain runs off» | MISMO ENCUADRE que s07: los paneles ahora **inclinados sobre rieles de aluminio** atornillados al techo, limpios, el agua escurriendo por el borde bajo. |
| `s09a.png` / `s09b.png` | DC/AC → «add a box… the inverter» | Pared exterior derecha de la casa: el cable baja del techo. A: el cable va directo hacia la casa. B: el cable entra en una caja blanca montada en la pared (inversor, pantalla con icono de onda, franja amarilla abajo) y sale hacia la casa. |
| `s10.png` | «That's the inverter» | Primer plano del inversor de s09b en la pared, cables entrando por arriba y saliendo por abajo. |
| `s11.png` | «at night the panels make nothing… stay connected to the grid» | MISMO ENCUADRE que s01 **de noche**: cielo azul oscuro, paneles oscuros, ventanas con luz cálida, poste y cables de la calle conectados a la casa. |
| `s12.png` | «at noon you make more than you use» | MISMO ENCUADRE que s01 al **mediodía**, sol fuerte arriba (sombras cortas). |
| `s13.png` | «a meter that counts both ways» | Primer plano del medidor de luz en la pared (caja gris con visor redondo), cable hacia el poste. |
| `s14a.png` / `s14b.png` | «the shadow of the water tank covers a single panel» | Techo por la tarde, sol bajo. A: fila de paneles al sol. B: la **sombra larga del tinaco cubre un solo panel** (el del extremo izquierdo). |
| `s15.png` | «the little black box behind each panel» | Vista de la **parte trasera** de un panel inclinado: cajita negra de conexiones con dos cables. |
| `s16.png` | «a line worker fixing the cables… could get shocked» | Poste de la calle de cerca, atardecer, un trabajador con chaleco naranja y casco amarillo en una escalera arreglando cables. Las casas al fondo sin luz (apagón). |
| `s17.png` | «the inverter… switches itself off» | MISMO ENCUADRE que s10 pero el inversor **apagado**: pantalla en rojo/negro, sin luz verde. |
| `s18a.png` / `s18b.png` | «hybrid inverter and add batteries» | MISMO ENCUADRE que s10. A: igual que s10. B: inversor gris oscuro (híbrido) y una torre de 3 baterías blancas en el suelo debajo, conectadas. |
| `s19.png` | «runs it on the batteries» | Plano general de la calle de noche en apagón: nuestra casa con las ventanas encendidas y la casa vecina a oscuras. |
| `s20.png` | Cierre | Plano general aéreo de día, la casa completa con todo el sistema (paneles, inversor híbrido, baterías, medidor, poste). |

Total: 26 imágenes. Si hay límite diario, prioridad: s01, s02, s03a/b, s05a/b, s07, s08, s09a/b, s10, s11, s14a/b, s16, s18a/b, s20.

## Cómo entregar

1. Sube cada imagen a `handoffs/solar-ai/frames/` con el nombre exacto de la tabla (si puedes escribir en este repositorio). Si no puedes, Vicente las descarga y las deja en su Mac en `Desktop/Reels: AI Videos/videos/solar-ai/frames/`.
2. Anota en [`MENSAJES.md`](MENSAJES.md) qué entregaste, qué falta y cualquier duda. Claude responde ahí también.

## Reglas
- Sin texto ni logos dentro de las imágenes.
- No uses imágenes del vídeo de @stupydoo como entrada; solo la descripción de estilo.
- Este repositorio es público: no subas nada privado.

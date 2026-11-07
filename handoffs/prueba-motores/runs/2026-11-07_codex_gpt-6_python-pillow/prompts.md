# Instrucciones exactas y procedencia

No se usó un servicio de generación de imágenes, vídeo, audio o texto externo. No hubo prompts texto→imagen, créditos, cuentas nuevas ni claves. Los materiales visuales son dibujo procedural original escrito por Codex para esta corrida.

Las instrucciones de generación **ejecutables exactas** son `proyecto/render.py`, con todos los vértices, interpolaciones, trazos, tipografía, composición, color y sincronía; `proyecto/config_v1.json` y `config_v2.json` contienen los parámetros de cada entrega. Los comandos exactos del codificador están en `evidencia/render_v1.json` y `render_v2.json`.

Brief utilizado: `handoffs/prueba-motores/PLAN.md`, blob Git `2eb16e93ced604ec56367e0b35c1b2883e91c110`, leído completo. Entradas de contenido: únicamente `voz.wav`, `tiempos.json` y `guion.txt` del kit. No se consultaron otras corridas ni las referencias opcionales de solar-ai. La tipografía instalada se trata como componente de la herramienta, no como material audiovisual de terceros.

## Ejecución V1

```bash
python3 proyecto/render.py --config config_v1.json --preview --render
```

## Corrección, aplicada después de congelar y entregar V1

Texto exacto de la instrucción recibida en §9 del plan:

> 1. **Recorrido del cable:** el cable de los paneles al inversor ya no va directo: baja por la pared exterior de la casa antes de llegar al inversor.
> 2. **Retraso:** la caja del inversor empieza a construirse **0,5 s más tarde** que en v1.
> 3. **Rótulo:** «INVERTER» pasa a decir «INVERTER · DC → AC».

```bash
python3 proyecto/render.py --config config_v2.json --preview --render
```

El motor se conserva idéntico entre las entregas. La configuración V2 cambia la ruta a `wall`, `box_delay_frames` a `15` y el rótulo. La conexión del tramo AC se retrasa junto con la caja para que nunca se conecte a una caja inexistente; la materialización sigue en «inverter».

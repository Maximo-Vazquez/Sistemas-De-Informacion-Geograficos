# Contexto y objetivos del TPI

## Consigna

La cátedra pide, en grupos de 4 a 5 integrantes y con las capas del SIG IGN 250 (entrega: 01/12/2026 y 03/12/2026):

- **a)** Montar un servidor de bases de datos espaciales con las capas vectoriales, un servidor de mapas que las publique por WMS y WFS, y una aplicación web que permita navegar el mapa, activar y desactivar capas, ver la leyenda y la escala, consultar por punto y por rectángulo, medir distancias e ingresar elementos nuevos (geometría y atributos).
- **b)** Responder, para la obra de mantenimiento de la Ruta Nacional 11 en el Chaco: kilómetros de traza en la provincia, población afectada hasta 10 km y hasta 20 km (categorías excluyentes) y cantidad y nombre de los puentes que cruzan la traza, con un informe de pasos y capturas.
- **c)** Confeccionar un mapa A4 en PDF que comunique la traza en el contexto de la red vial, las áreas de influencia y localidades, los puentes y los accidentes naturales, con los elementos y criterios de diseño cartográfico de la Unidad 2.

## Objetivos del proyecto

- Una sola aplicación web (Visor SIG Chaco) que cubra el punto a y muestre los resultados del punto b.
- Procesos reproducibles: análisis con QGIS automatizado por scripts y MCP, despliegue con contenedores y CI.
- Trazabilidad: cada decisión y cada paso queda en esta bitácora.

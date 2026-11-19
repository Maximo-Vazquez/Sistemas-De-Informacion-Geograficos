---
id: ADR-0017
titulo: Método del análisis de la RN 11 (punto b)
estado: aceptada
fecha: 2026-11-19
---

## Contexto

La consigna b pide el largo de la RN 11 en el Chaco, la población a 10 km y de 10 a 20 km (categorías excluyentes) y los puentes que cruzan la traza, con un informe que muestre los pasos. Las capas del SIG IGN 250 están en coordenadas geográficas. La red vial tiene dos rutas con el número 11. La capa de puentes son puntos sin el camino al que pertenecen. Dentro de los 20 km también hay localidades de otras provincias, entre ellas la ciudad de Corrientes.

## Opciones consideradas

- Hacer el análisis solo en QGIS, a mano, con capturas.
- Hacerlo en PostGIS con SQL, repetirlo en QGIS para validar y generar el informe a partir de las tablas resultantes.
- Para los puentes: contar los puntos a cierta distancia de la traza, o pedir además que el camino más cercano sea la RN 11.
- Para la población: incluir todas las localidades dentro de los buffers, o solo las del Chaco.

## Decisión

- El análisis se calcula en PostGIS (`scripts/analisis_rn11.sql` y `analisis_rn11.py`, esquema `analisis`) y se repite con algoritmos de Procesamiento de QGIS (`scripts/analisis_rn11_qgis.py`), que compara cada número con PostGIS.
- Las medidas se hacen en POSGAR 2007 faja 5 (EPSG:5347).
- La traza se forma con los tramos `nro_ruta = '11'` y `administra = 'Nacional'` (la RP 11 es otra ruta), recortados al polígono del Chaco.
- Las categorías se arman con un buffer de 10 km y un anillo de 20 km menos 10 km, recortados al Chaco. La población es la suma de `canthab` (Censo 2001) de las localidades de cada área.
- Solo se cuentan las localidades cuyo atributo `provincia` es Chaco; las de otras provincias se informan aparte. Se usa el atributo y no el polígono porque, sobre el río Bermejo, General Lucio V. Mansilla (Formosa) cae dentro del polígono del Chaco.
- Un puente es de la RN 11 si está a 500 m o menos de la traza y su camino más cercano es la RN 11. Se controla contra los cruces de la traza con los cursos de agua.
- El informe (`scripts/generar_informe_b.py`) toma sus números de `analisis.rn11_resumen`. Lo mismo hacen el panel de Administración y el video.

## Consecuencias

- Resultado: 172,39 km; 360.983 habitantes hasta 10 km y 26.080 de 10 a 20 km; 21 puentes. PostGIS y QGIS coinciden en los seis valores.
- El análisis se repite con dos comandos y alimenta el visor (capas `rn11_*` en GeoServer), el panel y el informe sin copiar números a mano.
- Limitaciones aceptadas: población del Censo 2001, solo 15 de 36 localidades del Chaco con dato, localidades representadas como puntos, y el cruce del Río de Oro sin punto de puente en la capa del IGN.

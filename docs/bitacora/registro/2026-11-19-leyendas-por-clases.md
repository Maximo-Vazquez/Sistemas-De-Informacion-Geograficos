---
fecha: 2026-11-19
titulo: Simbología y leyenda por clases de las capas IGN
autor: Asistencia técnica del proyecto
decisiones: [ADR-0014]
---

## Objetivo

Completar la leyenda con las clases de la simbología que pide la consigna a.3, la única función obligatoria del visor que faltaba.

## Trabajo realizado

- Se consultaron en PostGIS los valores de los atributos de las capas principales para definir las clases: `red_vial.tipo` (4 valores), `localidades.tipo` (11, agrupados en 4 clases), `curso_de_agua_hid.regimen` (2), `espejo_de_agua_hid.tipo` (7, agrupados en 5), `curvas_de_nivel.tipo` (2), `limite_politico_administrativo_lim.tipo` (3), `puente_red_vial_puntos.tipo` (4, agrupados en 2) y `vias_secundarias.tipo` (3, agrupados en 2).
- `scripts/simbologia_ign.py` define la simbología de las 47 capas y genera el SLD de cada una. `scripts/estilos_ign.py` los carga en GeoServer por la API REST y los asigna como estilo por defecto. Se puede repetir: actualiza los estilos existentes.
- Los caminos de tierra, los parajes y caseríos, las vías secundarias y las curvas intermedias se dibujan solo desde 1:1.000.000 o 1:500.000, según la clase. La escala figura en el título de cada regla.
- Las localidades capitales, ciudades y cabeceras de departamento, y las provincias, se rotulan con su nombre.
- La leyenda del visor se pide transparente y con el color de texto del tema (token `foreground`), y se vuelve a pedir al cambiar el tema.
- Se ejecutó `python scripts/estilos_ign.py` contra el GeoServer local: 47 capas con estilo. Se revisaron las leyendas con `GetLegendGraphic` y mapas de la zona de Resistencia y de la provincia con `GetMap`.
- Pasaron Ruff, TypeScript, el control de colores, la compilación del frontend y las 8 pruebas del visor en Chrome. Se revisaron capturas del visor con las capas reales en tema claro y oscuro.

## Problemas y soluciones

- Cada clase va en su propio `FeatureTypeStyle` para controlar el orden de dibujo. Como ahí `ElseFilter` abarcaría todos los elementos, la clase "resto" se expresa como un filtro que niega los valores de las otras clases.
- En tema oscuro, la leyenda de GeoServer aparecía como un recuadro blanco. Se resolvió con `transparent=true` y `fontColor` tomado del token del tema, sin escribir colores en la feature.

## Pendientes

- Los rótulos del mapa usan halo blanco también en tema oscuro, porque GeoServer dibuja la imagen sin conocer el tema del visor.
- [PENDIENTE] Consultar al profesor si la capa Relevamientos debe estar en PostGIS y servida por GeoServer.

---
fecha: 2026-10-29
titulo: Visor completo con las funciones de la consigna a.3
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0011]
---

## Objetivo

Rehacer el visor para cumplir todas las funciones de la consigna a.3, con cada herramienta separada y una interfaz fácil de usar.

## Trabajo realizado

- Visor reorganizado en `frontend/src/features/admin-visor/`: `mapa/` (mapa, capas WMS, capas propias, estilos y estado), `herramientas/` (un hook por herramienta), `ui/` (barra, paneles y controles) y `ogc.ts` (WMS, WFS y WFS-T).
- Barra de herramientas a la izquierda del mapa, una activa por vez y con atajo de teclado: Navegar (V), Consultar punto (I), Consultar área (R), Medir distancia (M) y Agregar elemento (A). Esc vuelve a Navegar.
- Panel lateral con pestañas: **Capas** (47 capas agrupadas por tema, búsqueda sin acentos, interruptor y opacidad por capa) y **Leyenda** (clases de cada capa encendida con `GetLegendGraphic`). En el celular se abre como panel deslizable.
- Consulta por punto (`GetFeatureInfo` de todas las capas encendidas) y por área (`GetFeature` WFS con filtro BBOX, hasta 50 por capa con el total). Los resultados se resaltan en el mapa; al elegir uno se encuadra y se ven sus atributos.
- Medición geodésica de varios tramos con la distancia en vivo junto al puntero, lista de mediciones y total.
- Carga de elementos: punto, línea o polígono, con vértices editables antes de guardar y formulario armado desde `DescribeFeatureType`. Se guarda por WFS-T a través de Django (ADR-0011).
- Controles de zoom y "Ver todo el Chaco"; barra de estado con escala gráfica y numérica y coordenadas del puntero.
- Estilos SLD con clases para red vial, localidades, cursos y espejos de agua, puentes, provincias y elementos relevados (`geoserver/estilos/`).
- Capa editable `elementos_relevados` creada y publicada por `scripts/cargar_capas_ign.py`.
- Se quitó el mapa de fondo externo: arrancan encendidas provincias, red vial y localidades.

## Verificación

- Pruebas de navegador `e2e/pruebas/visor.spec.ts` (5): capas y leyenda, consulta por punto, consulta por área, medición e inserción de un punto con atributos, que se borra al terminar. Suite completa: 14 en verde.
- Tests de Django: 19 en verde, con el proxy WFS-T (rechaza borrar, capas no editables y XML inválido; reenvía con credenciales).
- `ruff`, `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- Capturas revisadas en tema claro y oscuro a 1440 × 900. No se revisó a mano en el celular.

## Problemas y soluciones

- GeoServer pide credenciales para escribir por WFS-T: la transacción pasa por Django, que solo permite inserciones en capas editables.
- Los estilos del mapa no pueden escribir colores en las features (`check:colores`): `lib/map-theme.ts` lee los tokens del tema al dibujar.

## Pendientes

- Estilos propios para las otras 41 capas del IGN.
- Las etiquetas de GeoServer tienen halo blanco, que en tema oscuro resalta mucho.

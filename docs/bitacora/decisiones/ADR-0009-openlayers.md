---
id: ADR-0009
titulo: OpenLayers como biblioteca de mapas del visor
estado: aceptada
fecha: 2026-10-29
---

## Contexto

La consigna a.3 pide un visor web con navegación, activar y desactivar capas, leyenda y escala, consulta gráfica por punto y por rectángulo, medición de distancias y carga de elementos nuevos en una capa vectorial. Las capas llegan desde GeoServer por WMS y WFS (ADR-0008).

## Opciones consideradas

- OpenLayers.
- Leaflet con plugins.
- MapLibre GL.

## Decisión

OpenLayers 10.6.1 en el frontend React (`frontend/src/features/admin-visor/`). Razones:

- Es la biblioteca recomendada en la clase de Sistemas de Información Geográfica, junto con GeoServer.
- Trae de fábrica lo que pide la consigna: WMS y WFS, escala (`ScaleLine`), `GetFeatureInfo`, selección por rectángulo (`DragBox`), dibujo y medición (`Draw`, `ol/sphere`) y transacciones WFS-T.
- Maneja proyecciones, necesario para medir en metros sobre datos en coordenadas geográficas.
- Leaflet necesita plugins de terceros para medición, selección por rectángulo y WFS-T.

## Consecuencias

- El visor es una pantalla de Administración (`/administracion/visor/`) montada con `mountAdminPage`, sin cambiar la arquitectura Django + React.
- Primera versión: fondo Argenmap del IGN (público, sin clave), vista inicial en el Chaco, zoom, escala, lista de capas leída del `GetCapabilities` con interruptores y leyenda por capa.
- Pendiente: consulta por punto y rectángulo, medición y carga de elementos.

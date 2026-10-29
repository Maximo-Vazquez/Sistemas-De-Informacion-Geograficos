---
id: ADR-0008
titulo: GeoServer como servidor de mapas WMS/WFS
estado: aceptada
fecha: 2026-10-29
---

## Contexto

La consigna a.2 exige un servidor de mapas que publique las capas del SIG IGN 250 con servicios OGC (WMS y WFS). El visor (a.3) consume esos servicios para mostrar capas, leyendas, consultas y para cargar elementos nuevos (WFS-T).

## Opciones consideradas

- GeoServer.
- QGIS Server.
- MapServer.

## Decisión

GeoServer 2.27.2, con la imagen oficial `docker.osgeo.org/geoserver` como servicio `geoserver` de `docker-compose.yml` (puerto 8085, consola en `http://localhost:8085/geoserver`). Razones:

- Es el servidor recomendado en la clase de Sistemas de Información Geográfica, junto con OpenLayers para el visor (ADR-0009).
- Publica WMS, WFS y WFS-T (edición) desde una consola web, sin escribir configuración a mano.
- Se conecta directo a PostGIS como almacén de datos y genera la leyenda con `GetLegendGraphic`.
- Tiene imagen Docker oficial, la misma en desarrollo y en el VPS.

El visor lee la URL con `GEOSERVER_URL` y el espacio de trabajo con `GEOSERVER_WORKSPACE` (por defecto `ign`). La contraseña del usuario `admin` llega por `GEOSERVER_ADMIN_PASSWORD`.

## Consecuencias

- La configuración de GeoServer (almacenes, capas y estilos) vive en el volumen `datos_geoserver`, no en el repositorio.
- CORS está habilitado en el contenedor porque el navegador pide WMS/WFS desde `localhost:8000` a `localhost:8085`.
- Falta cargar las capas en PostGIS (a.1) y publicarlas en el espacio de trabajo `ign`.
- QGIS sigue en uso para el análisis del punto b y el mapa del punto c (ADR-0006).

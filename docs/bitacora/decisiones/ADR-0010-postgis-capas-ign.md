---
id: ADR-0010
titulo: PostGIS dedicado para las capas IGN en desarrollo
estado: reemplazada
fecha: 2026-11-13
---

## Contexto

El proyecto ya tiene una base PostgreSQL con cuentas y sesiones de Django. También se encontró una instalación de laboratorio con cinco capas y una configuración de GeoServer independientes. El ZIP entregado para el TPI contiene 47 shapefiles nacionales en WGS 84; sus geometrías deben almacenarse en PostGIS y publicarse por WMS y WFS.

## Opciones consideradas

- Sustituir la imagen de la base de Django por PostGIS y reutilizar su volumen existente.
- Usar directamente la base y el GeoServer del laboratorio anterior.
- Crear un servicio PostGIS propio para las capas del proyecto y conectarlo a GeoServer, conservando las bases existentes.

## Decisión

Agregar el servicio `gisdb` con `postgis/postgis:17-3.5` y el volumen `datos_gis`. Django sigue usando `db` para sus cuentas; GeoServer usa la red de Compose para conectarse a `gisdb`. Se cargan las capas completas del ZIP en el esquema `ign`, con SRID 4326, mediante GDAL. Un almacén nuevo `sig_ign2011` las publica en el espacio `ign` sin alterar los almacenes previos.

Los scripts de importación y publicación documentan el procedimiento. La importación verifica los conteos de cada tabla respecto del ZIP y registra el hash y el catálogo de origen. Los nombres de capas que coinciden con otras publicaciones reciben el prefijo `sig2011_` para evitar colisiones.

## Consecuencias

- Las cuentas de Django y las capas del IGN tienen volúmenes independientes. La imagen contiene el software; los datos cargados persisten en `datos_gis`.
- El GeoServer local depende de que `gisdb` esté saludable. La publicación anterior del laboratorio conserva su conexión y sus datos originales.
- Las capas mantienen coordenadas geográficas EPSG:4326. Los cálculos métricos y buffers del TPI deben usar un CRS proyectado apropiado.
- Django todavía no tiene una conexión GeoDjango al nuevo PostGIS ni cálculos para el panel. Estos trabajos continúan pendientes.
- La etiqueta de la imagen PostGIS utilizada es `linux/amd64`; en este equipo ARM se ejecuta mediante la emulación de Docker Desktop.

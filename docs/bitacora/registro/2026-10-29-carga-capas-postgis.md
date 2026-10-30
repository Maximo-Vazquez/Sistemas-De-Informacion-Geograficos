---
fecha: 2026-10-29
titulo: PostGIS en Docker y carga de las capas del IGN
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0010]
---

## Objetivo

Levantar una base espacial en Docker, cargar todas las capas del SIG IGN 250 y publicarlas en GeoServer.

## Trabajo realizado

- Servicio `postgis` en `docker-compose.yml` (`postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433). GeoServer arranca después de que PostGIS está sano.
- `scripts/cargar_capas_ign.py`: descomprime `docs/tpi/sig_ign.zip` (la carpeta extraída no se versiona), carga cada shapefile con `ogr2ogr` (imagen `ghcr.io/osgeo/gdal:ubuntu-small-3.11.3`) en EPSG:4326, geometrías multiparte, columna `geom` e índice espacial, y publica cada tabla en GeoServer.
- Se cargaron y publicaron las 47 capas en el espacio `ign` (almacén `sig_ign`).

## Verificación

- 47 tablas espaciales en `public`. Ejemplos: `red_vial` 118.955 registros, `localidades` 10.804 y `puente_red_vial_puntos` 3.852.
- Acentos correctos en atributos y nombres de columnas (por ejemplo "Colonia Peñas Blancas", `precisión`).
- WMS `GetCapabilities` lista las 47 capas; `GetMap` de `provincias` y `red_vial` sobre el Chaco devuelve una imagen PNG.
- WFS `GetFeature` en GeoJSON responde para `puente_red_vial_puntos`.
- No se revisó el visor en el navegador con las capas cargadas.

## Problemas y soluciones

- Los `.dbf` del IGN están en Windows-1252 aunque `Provincias.cpg` declara UTF-8: se carga todo con `SHAPE_ENCODING=CP1252` (Provincias no tiene acentos, así que no la afecta).
- El puerto 5432 lo usa el PostgreSQL local: PostGIS se publica en el 5433.

## Pendientes

- Estilos propios en GeoServer: hoy cada capa usa el estilo por defecto (punto, línea o polígono).
- `localidades.canthab` trae la cantidad de habitantes: base para la población a 10 y 20 km del punto b.

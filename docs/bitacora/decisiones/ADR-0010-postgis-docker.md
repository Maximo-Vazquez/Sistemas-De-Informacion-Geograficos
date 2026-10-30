---
id: ADR-0010
titulo: PostGIS en Docker para las capas del SIG IGN 250
estado: aceptada
fecha: 2026-10-29
---

## Contexto

La consigna a.1 pide un servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250. ADR-0003 preveía sumar PostGIS a la base de la aplicación más adelante. GeoServer (ADR-0008) corre en Docker y necesita llegar a la base por la red de Compose.

## Opciones consideradas

- Instalar la extensión PostGIS en el PostgreSQL local (`gis_tpi`).
- Un contenedor PostGIS propio para las capas, separado de la base de la aplicación.

## Decisión

Servicio `postgis` en `docker-compose.yml` con la imagen `postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433 en el host (el 5432 lo usa el PostgreSQL local) y volumen `datos_postgis`. La base de la aplicación Django no cambia.

Las 47 capas se cargan con `python scripts/cargar_capas_ign.py`, que usa `ogr2ogr` de la imagen oficial de GDAL dentro de la red de Compose y después las publica en GeoServer por su API REST (almacén `sig_ign`, espacio `ign`).

## Consecuencias

- No hay que instalar PostGIS ni GDAL en la máquina: alcanza con Docker.
- GeoServer se conecta a la base con el nombre de servicio `postgis`.
- Las tablas usan nombres en minúscula y sin acentos (`Líneas_de_Conducción_Ene` → `lineas_de_conduccion_ene`); el título de la capa en GeoServer conserva el nombre original.
- La carga es reproducible: el script recrea las tablas y salta las capas ya publicadas.
- Para el VPS falta decidir si PostGIS va en el mismo clúster o como servicio aparte.

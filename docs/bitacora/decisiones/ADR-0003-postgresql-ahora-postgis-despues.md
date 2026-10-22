---
id: ADR-0003
titulo: PostgreSQL desde el inicio, PostGIS en la etapa siguiente
estado: aceptada
fecha: 2026-10-22
---

## Contexto

La consigna a.1 exige un servidor de bases de datos espaciales. La primera etapa del proyecto solo arma la base de la aplicación, pero no conviene empezar con una base distinta a la final.

## Opciones consideradas

- SQLite en desarrollo y PostgreSQL en producción.
- PostgreSQL en todos los entornos, con PostGIS más adelante.
- PostGIS desde el primer día.

## Decisión

PostgreSQL 17 en desarrollo (base local `gis_tpi`, o `docker-compose.yml`), CI y producción. El motor se elige con `DB_ENGINE`: para GeoDjango alcanza con `django.contrib.gis.db.backends.postgis` y la imagen `postgis/postgis`, sin cambiar código.

## Consecuencias

- Mismo motor en todos los entornos desde el inicio.
- El PostgreSQL local todavía no tiene la extensión PostGIS instalada (Stack Builder).
- En la etapa GIS hay que sumar GDAL/GEOS/PROJ a la imagen (ya indicado en el Dockerfile) y crear la extensión `postgis` en la base del VPS.

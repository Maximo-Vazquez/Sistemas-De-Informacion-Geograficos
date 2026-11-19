---
id: ADR-0015
titulo: PostGIS en Docker y carga única de las capas del SIG IGN 250
estado: aceptada
fecha: 2026-11-19
reemplaza: ADR-0010
---

## Contexto

La consigna a.1 pide un servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250. El grupo resolvió la carga dos veces en ramas paralelas. Una versión usaba el servicio `postgis` (base `sig_ign`, puerto 5433) y `scripts/cargar_capas_ign.py`. La otra usaba el servicio `gisdb` (base `visor_ign`, esquema `ign`, puerto 5434) y tres scripts: `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. Al unir las ramas en `develop` había que elegir una.

## Opciones consideradas

- Mantener `gisdb` y los tres scripts. Requiere `ogr2ogr` instalado en la máquina.
- Mantener `postgis` y `cargar_capas_ign.py`, y sumarle la simbología de `simbologia_ign.py` (ADR-0014).

## Decisión

- Servicio `postgis` en `docker-compose.yml` con la imagen `postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433 en el host y volumen `datos_postgis`. La base de la aplicación Django (`db`) no cambia.
- Un solo comando carga y publica todo: `python scripts/cargar_capas_ign.py`. Usa `ogr2ogr` de la imagen oficial de GDAL dentro de la red de Compose, publica las 47 capas en GeoServer (almacén `sig_ign`, espacio `ign`), crea la capa editable `elementos_relevados` (ADR-0016) y aplica los estilos. Con `--solo-publicar` rehace la publicación y los estilos sin recargar las tablas.
- Los estilos de las 47 capas los genera `scripts/simbologia_ign.py` (ADR-0014). El script de carga los sube con el nombre `ign_<tabla>`. La capa editable usa `geoserver/estilos/visor_elementos_relevados.sld`.

## Consecuencias

- No hay que instalar PostGIS ni GDAL: alcanza con Docker.
- Se retiran `gisdb`, `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. `docs/tpi/catalogo_ign.json` queda como inventario de referencia.
- Las tablas usan nombres en minúscula y sin acentos (`Líneas_de_Conducción_Ene` → `lineas_de_conduccion_ene`). Las columnas conservan sus acentos (`régimen`, `precisión`), así que la clasificación de cursos de agua usa `régimen`.
- Quien tenga cargado el volumen `datos_gis` de la otra rama tiene que cargar las capas en `postgis` con el script; el volumen viejo se puede borrar.

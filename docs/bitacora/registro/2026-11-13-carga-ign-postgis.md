---
fecha: 2026-11-13
titulo: Carga y publicación de las capas IGN
autor: Asistencia técnica del proyecto
decisiones: [ADR-0010]
---

## Objetivo

Comprobar las bases y servicios existentes, ejecutar la aplicación según el README y cargar el ZIP IGN indicado por el usuario.

## Trabajo realizado

- Se inició la aplicación con `docker compose up -d web geoserver`; PostgreSQL, PostGIS y GeoServer quedaron saludables. La base `db` contiene 17 tablas de Django y no tiene PostGIS; el servicio `gisdb` tiene PostGIS 3.5.2 y su propio volumen.
- Se inspeccionó `D:/TPI/sig_ign.zip`: 47 shapefiles con sus componentes y WGS 84; la carpeta interna se llama `SIG_IGN2011`. El archivo comprimido pesa aproximadamente 236,6 MiB.
- Se cargaron las 47 capas en el esquema `ign` del PostGIS del proyecto usando GDAL. Se verificó la cantidad por tabla frente al DBF de origen: 570.443 elementos en total. Las 47 geometrías usan SRID 4326. El catálogo de archivos, conteos y SHA-256 quedó en `docs/tpi/catalogo_ign.json`.
- Se creó el almacén `sig_ign2011` y se publicaron las 47 capas en el espacio `ign` de GeoServer. Se conservaron el almacén del laboratorio y sus cinco capas previas; los nombres nacionales que colisionaban llevan el prefijo `sig2011_`.
- Se comprobaron las 47 capas por WFS (`GetFeature` con conteos iguales al ZIP), WMS (`GetMap` PNG) y `GetLegendGraphic` PNG. Se verificó CORS para el origen local. También se solicitaron geometrías de provincias, localidades, puentes, rutas, espejos de agua y vegetación, y un mapa combinado de las cinco primeras.
- Se documentaron los servicios, el arranque, la importación y la publicación; se agregó la dependencia de GeoServer a `gisdb` y la decisión ADR-0010.
- Pasaron los 13 tests de Django, Ruff, la comprobación TypeScript, la compilación Vite, el control de colores, `manage.py check` y `docker compose config --quiet`.

## Problemas y soluciones

- La presencia de una imagen PostGIS no implicaba datos cargados: el nuevo volumen estaba vacío y la base de Django solo contenía tablas de la aplicación. Se usó un volumen propio para las capas sin sustituir los datos existentes.
- La instalación anterior guardaba cinco capas en un PostGIS de laboratorio. Se agregó un almacén nuevo para el ZIP completo; sus nombres en conflicto se diferenciaron sin alterar la conexión anterior.
- El nombre comunicado del paquete mencionaba 2021, pero la carpeta interna del archivo suministrado indica `SIG_IGN2011`. Se conserva esa identificación, sin afirmar una fecha de actualización distinta.

## Pendientes

- Implementar consultas por punto y rectángulo, medición de distancias y carga de geometrías y atributos en el visor.
- Conectar Django al PostGIS para calcular los indicadores del panel y completar el análisis de la RN 11.
- Provisionar PostGIS y GeoServer en el VPS e identificar las credenciales y conexiones de ese entorno.

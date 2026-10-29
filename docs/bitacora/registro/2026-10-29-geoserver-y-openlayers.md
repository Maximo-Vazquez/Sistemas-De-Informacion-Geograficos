---
fecha: 2026-10-29
titulo: GeoServer en Docker y visor con OpenLayers
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0008, ADR-0009]
---

## Objetivo

Elegir el servidor de mapas y la biblioteca de mapas del visor, levantar el servidor en Docker local y armar la primera versión del visor.

## Trabajo realizado

- Se eligieron GeoServer y OpenLayers, los dos recomendados en la clase de Sistemas de Información Geográfica (ADR-0008 y ADR-0009).
- Servicio `geoserver` en `docker-compose.yml`: imagen `docker.osgeo.org/geoserver:2.27.2`, CORS habilitado, sin datos de ejemplo y volumen `datos_geoserver`. Consola en `http://localhost:8085/geoserver` (usuario `admin`, contraseña por `GEOSERVER_ADMIN_PASSWORD`).
- Espacio de trabajo `ign` creado por la API REST de GeoServer.
- Variables `GEOSERVER_URL` y `GEOSERVER_WORKSPACE` en `config/settings/base.py` y `.env.example`.
- Pantalla Administración → Visor (`/administracion/visor/`): mapa de OpenLayers 10.6.1 con fondo Argenmap del IGN (claro u oscuro según el tema), vista inicial en el Chaco, zoom, barra de escala, lista de capas leída del `GetCapabilities` de WMS con un interruptor por capa y la leyenda (`GetLegendGraphic`) de cada capa encendida. Si GeoServer no responde o no hay capas, lo indica.
- Tests de Django del visor: redirección sin sesión y datos de GeoServer con sesión.

## Verificación

- `ruff check .`, tests de Django (13), `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- `GetCapabilities` del espacio `ign` responde 200 con el encabezado CORS `Access-Control-Allow-Origin: *`.
- No se revisó el visor en el navegador ni se agregaron pruebas de Playwright.

## Problemas y soluciones

- El puerto 8080 ya estaba ocupado por otro contenedor de la máquina: GeoServer se publica en el 8085 (configurable con `GEOSERVER_PORT`).
- Los tiles de OpenStreetMap respondían 403 "Access blocked": sus servidores exigen el encabezado `Referer` y Django no lo envía a otros sitios (`SECURE_REFERRER_POLICY = same-origin`). Se probó CARTO, pero en el navegador pidió clave de API. El fondo quedó en Argenmap, el mapa base público del IGN: no pide clave y es la misma fuente que las capas del TPI.

## Pendientes

- Cargar las capas del SIG IGN 250 en PostGIS (a.1) y publicarlas en el espacio `ign`.
- Visor: consulta por punto y rectángulo, medición de distancias y carga de elementos (WFS-T).
- Desplegar GeoServer en el VPS.

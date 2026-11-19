---
id: ADR-0016
titulo: Carga de elementos por WFS-T a través de Django en una capa de PostGIS
estado: aceptada
fecha: 2026-11-19
reemplaza: ADR-0013
---

## Contexto

La consigna a.3 pide cargar elementos nuevos (geometría y atributos) en una capa vectorial. El grupo lo resolvió dos veces en ramas paralelas: con WFS-T sobre una capa de PostGIS publicada en GeoServer, y con la capa Relevamientos guardada como GeoJSON en el PostgreSQL de Django (ADR-0013). Esa segunda opción dejaba abierta la duda de si la capa tenía que estar en PostGIS y servirse por GeoServer. GeoServer exige credenciales de administración para escribir por WFS-T.

## Opciones consideradas

- WFS-T directo desde el navegador con escritura anónima habilitada en GeoServer.
- WFS-T armado en el navegador y reenviado por Django con las credenciales de GeoServer.
- Guardar el elemento en el PostgreSQL de Django, sin WFS-T (ADR-0013).

## Decisión

- El visor arma la transacción con `ol/format/WFS` y la envía a `POST /administracion/visor/transaccion/` (sesión y CSRF). `apps/administracion/services.py` acepta solo `Insert` en las capas de `GEOSERVER_CAPAS_EDITABLES` y la reenvía a GeoServer con `GEOSERVER_ADMIN_USER`/`GEOSERVER_ADMIN_PASSWORD`. Rechaza `Update`, `Delete`, otras capas y XML inválido.
- Django llega a GeoServer por `GEOSERVER_URL_INTERNA`, que por defecto es `GEOSERVER_URL`. En el servicio `web` de Compose vale `http://geoserver:8080/geoserver`.
- La capa editable es `elementos_relevados` (PostGIS, geometría genérica, campos nombre, categoría, descripción, responsable y fecha). La crea `scripts/cargar_capas_ign.py` y su estilo está en `geoserver/estilos/visor_elementos_relevados.sld`. No se tocan las capas del IGN.

## Consecuencias

- La clave de GeoServer nunca llega al navegador y el visor solo puede agregar, no modificar ni borrar.
- La capa nueva es una capa más de GeoServer: se ve por WMS, se consulta por WFS y se analiza en PostGIS junto con las del IGN.
- Se retiran el modelo `ElementoVectorial`, su formulario, su migración y la ruta `/administracion/visor/elementos/`.

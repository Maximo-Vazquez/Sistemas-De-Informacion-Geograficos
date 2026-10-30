---
id: ADR-0011
titulo: Carga de elementos por WFS-T a través de Django y estilos SLD versionados
estado: aceptada
fecha: 2026-10-29
---

## Contexto

La consigna a.3 pide cargar elementos nuevos (geometría y atributos) en una capa vectorial y mostrar la leyenda con las clases de la simbología. GeoServer exige credenciales de administración para escribir por WFS-T, y las capas publicadas usaban el estilo por defecto (una sola clase).

## Opciones consideradas

- WFS-T directo desde el navegador con escritura anónima habilitada en GeoServer.
- WFS-T armado en el navegador y reenviado por Django con las credenciales de GeoServer.
- Insertar directo en PostGIS desde Django, sin WFS-T.

## Decisión

- El visor arma la transacción con `ol/format/WFS` y la envía a `POST /administracion/visor/transaccion/` (sesión y CSRF). `apps/administracion/services.py` acepta solo `Insert` en las capas de `GEOSERVER_CAPAS_EDITABLES` y la reenvía a GeoServer con `GEOSERVER_ADMIN_USER`/`GEOSERVER_ADMIN_PASSWORD`. Rechaza `Update`, `Delete`, otras capas y XML inválido.
- La capa editable es `elementos_relevados` (PostGIS, geometría genérica, campos nombre, categoría, descripción, responsable y fecha). No se tocan las capas del IGN.
- Los estilos con clases viven en `geoserver/estilos/*.sld` y `scripts/cargar_capas_ign.py` los sube a GeoServer: red vial por tipo, localidades por jerarquía, cursos de agua por régimen, espejos de agua por tipo, puentes, provincias y elementos relevados por geometría.

## Consecuencias

- La clave de GeoServer nunca llega al navegador y el visor solo puede agregar, no modificar ni borrar.
- Se sigue usando WFS-T, el estándar OGC que se ve en la materia.
- Los estilos son reproducibles: se regeneran con el script en cualquier GeoServer.
- Las demás 41 capas del IGN siguen con el estilo por defecto de GeoServer.

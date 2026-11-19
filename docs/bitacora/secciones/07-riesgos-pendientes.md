# Riesgos y pendientes

## Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026 al 03/12/2026) con visor y análisis incompletos | Alto | Priorizar la demostración del visor con datos reales y el análisis de la ruta |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google y de GeoServer | Medio | Guardarlas en el `.env` local; nunca en el repositorio |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- El usuario confirmó el acceso autenticado al visor con Google y la visualización del mapa base.
- Las 47 capas del ZIP IGN están cargadas en el PostGIS local `postgis` (base `sig_ign`) y publicadas por WMS/WFS con su simbología (ADR-0014, ADR-0015). Los volúmenes locales no se distribuyen con el repositorio: cada integrante corre `python scripts/cargar_capas_ign.py` con el ZIP.
- Quien tenga el volumen `datos_gis` del servicio `gisdb` (rama anterior) tiene que volver a cargar las capas con el script; ese volumen ya no se usa.
- [PENDIENTE] Conectar Django al PostGIS del proyecto para alimentar el panel y realizar los cálculos geográficos.
- La carga de elementos usa WFS-T sobre `elementos_relevados` en PostGIS, servida por GeoServer (ADR-0016): la capa queda en PostGIS, que era la duda abierta sobre Relevamientos.

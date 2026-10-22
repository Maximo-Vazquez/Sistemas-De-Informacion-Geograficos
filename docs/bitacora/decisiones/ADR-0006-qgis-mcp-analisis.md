---
id: ADR-0006
titulo: QGIS automatizado con QGIS MCP para análisis y cartografía
estado: aceptada
fecha: 2026-09-24
---

## Contexto

Los puntos b y c requieren geoprocesos (recortes, buffers, intersecciones) y un mapa de impresión. Hacerlos solo a mano dificulta repetirlos y documentarlos.

## Opciones consideradas

- QGIS manual con capturas.
- QGIS con scripts PyQGIS y el servidor QGIS MCP (complemento y servidor v0.14.1, proyecto nkarasiak/qgis-mcp).

## Decisión

QGIS 4.2.2 con QGIS MCP: un asistente opera QGIS mediante herramientas (capas, procesos, layouts) y los pasos quedan como scripts reproducibles. La configuración del equipo está en `docs/qgis-mcp-y-skill.md` y la skill `qgis-mcp-workflows`.

## Consecuencias

- Requiere QGIS abierto con el servidor del complemento activo (`localhost:9876`).
- Complemento y servidor deben mantener la misma versión.

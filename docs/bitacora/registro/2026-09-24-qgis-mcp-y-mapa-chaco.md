---
fecha: 2026-09-24
titulo: Configuración de QGIS MCP y mapa del Chaco
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0006]
---

## Objetivo

Preparar el entorno de QGIS automatizado y un primer proyecto de mapa provincial.

## Trabajo realizado

- Repositorio inicializado en la rama `develop`.
- Skill `qgis-mcp-workflows` y guía `docs/qgis-mcp-y-skill.md` para instalar y conectar QGIS MCP (complemento y servidor v0.14.1, QGIS 4.2.2).
- Proyecto `qgis/Chaco/Mapa_Chaco.qgz` con los 25 departamentos y 750 tramos de cursos de agua recortados a la provincia (GeoPackage `chaco.gpkg`), exportado a PDF y PNG con `scripts/generar_mapa_chaco.py`.

## Problemas y soluciones

- El TIFF `3420C_2010_327_RGB_LATLNG.tif` del material provisto está georreferenciado sobre el sureste de África y la escena Landsat cubre solo parte del Chaco: se dejaron fuera del mapa.
- Los insumos originales superan los 170 MB descomprimidos: quedaron fuera de git y se versionó solo el GeoPackage procesado.

## Pendientes

- Repetir el análisis con las capas del SIG IGN 250 de la consigna.

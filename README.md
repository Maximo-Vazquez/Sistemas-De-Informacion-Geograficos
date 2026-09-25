# GIS

Repositorio de trabajo para proyectos de Sistemas de Información Geográfica. Cada proyecto de QGIS se organiza en su propia carpeta dentro de qgis.

## Primer inicio

Cloná la rama de trabajo del equipo:

    git clone --branch develop https://github.com/Maximo-Vazquez/Sistemas-De-Informacion-Geograficos.git GIS

Abrí la carpeta GIS con tu cliente de trabajo para que detecte las instrucciones y la skill compartidas, si admite skills del repositorio.

## Estructura

- qgis/Chaco/: proyecto del mapa de departamentos e hidrografía del Chaco.
- .agents/skills/: instrucciones de trabajo con QGIS para herramientas compatibles con este formato de skills.
- docs/qgis-mcp-y-skill.md: instalación, procedencia, configuración y mantenimiento del MCP y la skill.

Para agregar otro proyecto de QGIS, creá una carpeta hermana de Chaco dentro de qgis y guardá allí su archivo .qgz, datos, scripts y exportaciones.

## Automatización

Seguí [la guía de QGIS MCP y la skill del equipo](docs/qgis-mcp-y-skill.md) para conectar un cliente MCP con QGIS.

## Proyecto actual

Abrí qgis/Chaco/Mapa_Chaco.qgz con QGIS. La descripción de datos y generación está en qgis/Chaco/README.md.

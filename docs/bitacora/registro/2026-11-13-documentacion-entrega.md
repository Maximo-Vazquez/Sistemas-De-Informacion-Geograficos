---
fecha: 2026-11-13
titulo: Documentación para compartir la carga IGN
autor: Asistencia técnica del proyecto
decisiones: []
---

## Objetivo

Preparar una explicación de los cambios, las capas cargadas y su reproducción para el equipo.

## Trabajo realizado

- Se creó la rama de trabajo `feature/postgis-capas-ign` a partir de `develop`.
- Se agregó el inventario de 47 capas a las fuentes de la bitácora, con sus nombres, familias de geometría, tablas y cantidades. Los datos provienen del catálogo generado y de las cabeceras de los shapefiles del ZIP usado en la carga.
- Se documentaron los servicios Docker, los scripts de importación y publicación, los cinco nombres diferenciados por colisión y los pasos para reproducir la instalación.
- Se aclaró qué archivos y datos quedan fuera de Git, qué verificaciones se hicieron y qué funcionalidades siguen pendientes.
- Se vinculó el inventario desde el README y se actualizó la versión de esta bitácora.
- Se verificó que las 47 filas del inventario y su suma coinciden con el catálogo, y que los archivos modificados no contienen los valores locales de las credenciales. Pasaron los 13 tests de Django, Ruff, TypeScript, la compilación del frontend, el control de colores y la validación de Docker Compose.

## Problemas y soluciones

- Los nombres publicados para cinco capas dependen de que existan o no capas antiguas con el mismo nombre. La documentación distingue el resultado local de una instalación nueva.
- Los volúmenes Docker y las credenciales locales no viajan con el repositorio. La documentación indica que cada integrante necesita el ZIP y su configuración local.
- La generación del PDF dentro de la imagen de la aplicación falló porque falta la biblioteca del sistema `libgobject-2.0`. Se generó y verificó la versión Markdown de la bitácora, que sí se comparte en el repositorio.

## Pendientes

- Revisar la documentación con el equipo y ejecutar la carga en las demás computadoras según sea necesario.
- Completar las funcionalidades y los análisis SIG pendientes indicados en esta bitácora.

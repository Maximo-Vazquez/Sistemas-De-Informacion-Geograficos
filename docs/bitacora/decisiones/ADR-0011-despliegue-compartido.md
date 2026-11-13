---
id: ADR-0011
titulo: Propuesta de aplicación, GeoServer y PostGIS compartidos
estado: propuesta
fecha: 2026-11-13
---

## Contexto

La instalación actual carga las capas IGN en un volumen PostGIS local y las publica en un GeoServer local. El repositorio contiene los scripts y el catálogo, pero no el ZIP ni los datos guardados en los volúmenes de Docker. Una persona que prepare una instalación local independiente necesita cargar las capas o contar con una copia de la base.

La consigna pide una base de datos espacial, un servidor de mapas con WMS y WFS y un visor web. No exige que cada usuario descargue las capas ni especifica que el sistema deba estar publicado en internet.

## Opciones consideradas

- Cada integrante prepara y mantiene su propia base PostGIS y su propio GeoServer.
- El equipo dispone de una aplicación y servicios SIG compartidos; las personas acceden al visor desde su navegador.
- Se utiliza un entorno compartido para ver y presentar el proyecto, y cada integrante puede crear una instalación local independiente cuando necesite desarrollar o probar cambios.

## Decisión

**Propuesta para evaluar con el equipo:** disponer de una aplicación compartida y un GeoServer conectado a una base PostGIS compartida. Las capas se cargarían una vez en esa base mediante un proceso inicial por definir, o se restaurarían desde una copia ya preparada. Después, quienes usen el visor accederían por navegador sin descargar el ZIP.

La propuesta admite instalaciones locales para desarrollo y pruebas. No implica que el equipo ya haya elegido esta alternativa ni que esté implementada o desplegada.

## Consecuencias

- La aplicación, GeoServer y los datos espaciales deben estar disponibles en un entorno accesible para las personas que usarán el visor. El navegador actual solicita los servicios de GeoServer directamente, por lo que su URL debe ser accesible desde ese navegador; `localhost` solo apunta a la propia computadora.
- Hay que definir dónde guardar de forma persistente los datos de PostGIS y la configuración de GeoServer, y cómo inicializarlos y recuperarlos. Una imagen Docker de la aplicación no incluye automáticamente las capas cargadas en un volumen local.
- Para el acceso compartido se deben definir las direcciones de la aplicación y de GeoServer. Si se mantiene el ingreso con Google, también habrá que registrar el callback correspondiente y configurar los orígenes necesarios para los servicios web.
- El equipo debe acordar el entorno, quién lo administra y cómo se conservarán los datos y las credenciales. La disponibilidad del entorno compartido condicionará el acceso al visor.
- La instalación local y los scripts de carga existentes seguirían siendo útiles para pruebas o para preparar los datos iniciales del entorno compartido.

---
id: ADR-0013
titulo: Alta en la capa vectorial Relevamientos
estado: reemplazada
fecha: 2026-11-19
---

## Contexto

La consigna a.3 admite ingresar una geometría y sus atributos en una capa creada para ese fin o en una capa SIG IGN 250.

## Opciones consideradas

- Editar una capa SIG IGN 250 mediante WFS transaccional.
- Crear una capa de relevamientos del visor con persistencia a cargo de Django.

## Decisión

El visor incorpora la capa **Relevamientos**, con puntos, líneas y polígonos de un anillo. OpenLayers captura la geometría y la convierte a GeoJSON en EPSG:4326. Django valida el dibujo, el nombre y la descripción, y guarda el alta en el PostgreSQL de la aplicación.

## Consecuencias

El visor carga la capa por GeoJSON y permite consultarla por punto o rectángulo. El alta funciona con la base local de Django y usa una clave de solicitud para que un reintento conserve un único elemento. Las capas del IGN se siguen sirviendo a través de GeoServer.

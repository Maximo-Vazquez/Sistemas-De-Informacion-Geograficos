---
fecha: 2026-11-19
titulo: Alta de elementos en el visor y ejecución local
autor: Asistencia técnica del proyecto
decisiones: [ADR-0012, ADR-0013]
---

## Objetivo

Completar el ingreso de geometrías y atributos del visor y preparar la ejecución local del TPI.

## Trabajo realizado

- Se incorporó la herramienta **Agregar elemento** con dibujo de puntos, líneas y polígonos y un formulario con nombre y descripción.
- Django guarda cada alta en PostgreSQL. El visor recupera la capa **Relevamientos** en formato GeoJSON y permite consultar sus atributos por punto o rectángulo.
- Se retiraron los manifiestos k3s y los workflows de publicación y despliegue remoto. Docker Compose mantiene Django, PostgreSQL, PostGIS y GeoServer en puertos locales.
- Pasaron Ruff, las 18 pruebas de Django con PostgreSQL, el chequeo de migraciones, el control de colores y la compilación del frontend y de la imagen Docker. Las ocho pruebas del visor en Chromium verificaron las tres geometrías y la recuperación del punto y sus atributos después de recargar.
- Las dos pruebas de alta también pasaron en un viewport móvil con tema oscuro, usando una base SQLite temporal.

## Problemas y soluciones

- Se preparó un PostgreSQL temporal y una sesión de prueba de Django para ejecutar las verificaciones con datos aislados. Las pruebas del visor simularon los servicios de mapas del IGN y usaron el backend real para guardar los relevamientos.
- En móvil, el texto de ayuda cubría parte del área de dibujo e interceptaba clics. El panel deja los eventos de dibujo disponibles en el mapa y reserva la interacción de la barra para sus botones.
- Docker Desktop devolvió un error del motor durante la última reconstrucción. Se verificaron la configuración de Compose y la compilación final del frontend.
- Se recuperó el motor tras reiniciar WSL y se reconstruyó la imagen local. Django aplicó la migración de Relevamientos y respondió con sus archivos estáticos.
- El catálogo conservaba cinco capas de laboratorio conectadas al contenedor local `postgis` en el puerto 5433. Al iniciarlo, GeoServer respondió al catálogo WMS.

## Pendientes

- Demostrar el visor con las capas reales del IGN y completar los análisis y la cartografía de la Ruta Nacional 11.

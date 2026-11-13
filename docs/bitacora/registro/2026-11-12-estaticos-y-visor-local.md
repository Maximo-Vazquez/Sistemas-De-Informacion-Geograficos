---
fecha: 2026-11-12
titulo: Corrección de estáticos y confirmación del visor local
autor: Asistencia técnica del proyecto
decisiones: []
---

## Objetivo

Resolver la pantalla vacía del inicio y del login, y comprobar el acceso al visor.

## Trabajo realizado

- Se identificó que Gunicorn entregaba el HTML, pero los archivos JavaScript, CSS y el logo devolvían HTTP 404. Los assets sí existían en la imagen.
- Se agregó el servicio opcional `web` al Compose de desarrollo. Usa la imagen de la aplicación, `env_file: .env`, `DB_HOST=db`, `config.settings.local` y `runserver --noreload --skip-frontend-build` en el puerto local 8000. La imagen ya contiene el frontend compilado.
- Se conservó detenido el contenedor manual anterior y se inició el servicio de Compose. PostgreSQL y sus volúmenes no se modificaron.
- Se verificaron inicio, login y confirmación de Google: HTTP 200 y sus siete assets referenciados con HTTP 200 en cada página. El POST OAuth con CSRF continuó respondiendo 302 hacia Google con el cliente y callback correctos. `manage.py check` pasó.
- El usuario confirmó mediante capturas el acceso autenticado al visor y la visualización del fondo Argenmap. La lista de capas continúa vacía.
- Se localizaron cinco shapefiles en `D:/GIS/labhoy/shapes`: red vial, espejos de agua y tres clases de vegetación. No se comprobó su procedencia o correspondencia con el paquete SIG IGN 250 de la consigna; no se importaron ni publicaron.
- Se actualizaron README, arquitectura, revisión, pendientes y bitácora.

## Problemas y soluciones

- El HTTP 200 de una página no asegura que una pantalla React pueda renderizarse. Se verificaron también sus recursos estáticos.
- El intento de capturar el DOM con Edge en modo headless no produjo una salida utilizable. La confirmación visual posterior fue aportada por el usuario.

## Pendientes

- Identificar el paquete SIG IGN 250 correcto, cargar las capas en PostGIS y publicarlas en el espacio `ign` de GeoServer.
- Completar las herramientas pendientes del visor.

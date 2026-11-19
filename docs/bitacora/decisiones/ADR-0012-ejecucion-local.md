---
id: ADR-0012
titulo: Ejecución local del TPI
estado: aceptada
fecha: 2026-11-19
reemplaza: ADR-0004
---

## Contexto

El equipo decidió ejecutar y presentar el TPI en un entorno local. Django, PostgreSQL, PostGIS y GeoServer ya se pueden iniciar en la computadora de la demostración.

## Opciones consideradas

- Ejecución local con Docker Compose y Django.
- Despliegue del proyecto en un VPS o en un entorno compartido.

## Decisión

La aplicación y los servicios SIG se ejecutan localmente. Docker Compose publica los servicios en la interfaz de loopback. Se retiran los manifiestos de Kubernetes y los workflows de publicación y despliegue. Se conservan las comprobaciones de calidad y las pruebas de navegador.

## Consecuencias

Cada instalación prepara sus volúmenes y carga las capas del IGN con los scripts del proyecto. El acceso con Google y el mapa base Argenmap siguen usando sus servicios externos.

---
fecha: 2026-11-13
titulo: Propuesta de despliegue compartido para el visor
autor: Asistencia técnica del proyecto
decisiones: [ADR-0011]
---

## Objetivo

Dejar documentada una alternativa para que el equipo y los usuarios consulten las capas IGN sin descargar el ZIP en cada computadora.

## Trabajo realizado

- Se revisaron la consigna, la arquitectura y la documentación de la carga local de las 47 capas.
- Se registró el ADR-0011 con estado `propuesta`: aplicación y GeoServer accesibles desde el navegador, conectados a un PostGIS compartido con las capas cargadas.
- Se documentó que la carga inicial o restauración ocurriría en el servidor y que los usuarios finales no necesitarían el ZIP. Una instalación local independiente seguiría siendo una opción para desarrollo.
- Se enlazó la propuesta desde el README y la sección de arquitectura, y se aclaró la diferencia entre los requisitos de una instalación local y los de un futuro entorno compartido.

## Problemas y soluciones

- El código y las imágenes no incluyen los datos que están en el volumen Docker local. La propuesta deja pendiente definir la persistencia, la carga inicial y la recuperación de PostGIS y de la configuración de GeoServer.
- La configuración actual usa `localhost` para GeoServer. Para un acceso desde otras computadoras habría que definir una dirección accesible para los navegadores y ajustar la configuración correspondiente.

## Pendientes

- Revisar la propuesta con el equipo y decidir si se adopta y dónde se alojaría.
- Si se adopta, definir el entorno, las direcciones, el proceso de carga o restauración inicial, la persistencia y el acceso de usuarios.
- No se implementó ni desplegó la alternativa durante esta sesión.

---
fecha: 2026-11-12
titulo: Revisión de cumplimiento y preparación del acceso con Google
autor: Asistencia técnica del proyecto
decisiones: []
---

## Objetivo

Contrastar el proyecto con el apartado a de la consigna y preparar la configuración local de acceso al visor.

## Trabajo realizado

- Se revisaron README, settings, autenticación, vistas, componentes del visor, Docker y estado del TPI. El informe detallado está en `docs/revision-2026-11-12.md`.
- Se comprobó que PostgreSQL no tiene PostGIS ni capas del IGN y que GeoServer no tenía espacios ni capas. Se creó el espacio `ign` que espera el visor.
- WMS 1.3.0 y WFS 2.0.0 respondieron HTTP 200 con capacidades válidas y CORS. El catálogo sigue vacío; a.2 continúa en curso.
- Se creó un `.env` local ignorado por Git con una clave Django aleatoria. No se inventaron credenciales de Google; el usuario confirmó que aún no creó un cliente OAuth.
- Se agregó al README la guía de Google, el tipo de cliente web, los callbacks y la diferencia entre el entorno del host y el del contenedor.
- Se instalaron las dependencias del frontend. La compilación, incluida la comprobación TypeScript, y el chequeo de colores finalizaron correctamente.
- En la imagen existente del contenedor Django pasaron `manage.py check`, los 13 tests y Ruff. Inicio y login respondieron HTTP 200; el visor sin sesión redirigió al login.

## Problemas y soluciones

- Las herramientas Python y Node estaban instaladas fuera del PATH de esta sesión. Se localizó Node y se usó Corepack para instalar el frontend respetando el lockfile.
- La instalación nativa de Python ARM intentó compilar `cryptography` y terminó sin una distribución compatible de `psycopg-binary==3.3.6`. El entorno virtual quedó sin completar. La verificación del backend se realizó en el contenedor existente, que ya dispone de las dependencias.
- El contenedor de Django no monta el código local ni contiene `.env` o variables OAuth. Configurar el archivo en Windows no basta para activar el login en ese contenedor.
- La barra de escala y la URL WFS no constituyen herramientas de medición o edición. Esas funciones continúan pendientes.

## Pendientes

- Crear o reutilizar el cliente OAuth, cargar sus credenciales reales en Django y verificar un login completo. No se realizó una prueba visual autenticada del visor.
- Habilitar PostGIS, cargar las capas IGN, publicarlas y probar interruptores y leyendas con datos reales.
- Implementar consultas por punto y rectángulo, medición y alta de elementos.
- Mantener a.1 pendiente y a.2 y a.3 en curso; revisar también los estados desactualizados del inicio.

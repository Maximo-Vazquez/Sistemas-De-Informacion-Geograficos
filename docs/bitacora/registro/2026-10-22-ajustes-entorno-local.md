---
fecha: 2026-10-22
titulo: Ajustes de acceso y entorno local
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0001, ADR-0003]
---

## Objetivo

Dejar la aplicación lista para correr con `python manage.py runserver` y simplificar el acceso.

## Trabajo realizado

- Se quitó la lista de cuentas habilitadas: cualquier cuenta de Google con sesión entra a Administración (`login_required`). La pantalla 403 quedó genérica.
- `runserver` propio en `apps/core/management/commands/runserver.py`: en desarrollo aplica migraciones, instala dependencias del frontend si faltan y compila Vite en `static/frontend/` antes de iniciar (`--skip-migrate`, `--skip-frontend-build`). Corre una sola vez aunque el autoreload relance el proceso.
- Base PostgreSQL local `gis_tpi` y archivo `.env` de desarrollo (no versionado) con la conexión y las credenciales OAuth de Google.
- Las URL de allauth pasaron a `accounts/`, la ruta estándar de la biblioteca. URI de redirección de desarrollo: `http://localhost:8000/accounts/google/login/callback/`.
- Dependencias de Python unificadas en un solo `requirements.txt` (aplicación, bitácora y calidad).
- Globo 3D interactivo en el inicio: componente Globe de Magic UI (instalado con el CLI de shadcn, basado en cobe/WebGL) envuelto en `components/app/chaco-globe.tsx`, que arranca mostrando el Chaco con marcadores en Resistencia y la RN 11 y se adapta al tema claro/oscuro.
- Logo del equipo diseñado con Codex (CLI incluida en la app de escritorio) a partir de un pedido escrito: tres capas de mapa con una ruta blanca, en azul #1f4fd1 y neutro oscuro. Versiones en `static/imagenes/logo-equipo.svg`, `logo-equipo-horizontal.svg` y `logo-equipo-mono.svg`; `logo.svg` lo usa sobre fondo blanco para que se lea en tema claro y oscuro.
- Botón estándar "Continuar con Google" con la G oficial a color (`components/app/google-login-button.tsx`), compartido por el inicio y el login.
- Logo de la UTN extraído de `docs/tpi/practico.pdf` para la portada y el encabezado de esta bitácora.
- Se reescribieron el README del frontend, las skills y estas fuentes para describir solo este proyecto.

## Verificación

- 11 tests en verde contra PostgreSQL, ruff y build del frontend sin errores.
- `runserver` contra `gis_tpi`: aplicó las migraciones, compiló el frontend, sirvió inicio y login, redirigió `/administracion/` al login y el botón de Google redirigió a `accounts.google.com`.
- No se completó un ingreso real con Google (requiere un navegador).

## Pendientes

- [PENDIENTE] Instalar PostGIS en el PostgreSQL local para la etapa GIS.

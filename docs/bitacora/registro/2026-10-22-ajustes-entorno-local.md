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
- Las URL de allauth pasaron a `accounts/` para coincidir con la URI de redirección ya registrada en el cliente OAuth (`http://localhost:8000/accounts/google/login/callback/`).
- Dependencias de Python unificadas en un solo `requirements.txt` (aplicación, bitácora y calidad).
- Globo 3D interactivo en el inicio: componente Globe de Magic UI (instalado con el CLI de shadcn, basado en cobe/WebGL) envuelto en `components/app/chaco-globe.tsx`, que arranca mostrando el Chaco con marcadores en Resistencia y la RN 11 y se adapta al tema claro/oscuro.
- Logo de la UTN extraído de `docs/tpi/practico.pdf` para la portada y el encabezado de esta bitácora.
- Se reescribieron el README del frontend, las skills y estas fuentes para describir solo este proyecto.

## Verificación

- 11 tests en verde contra PostgreSQL, ruff y build del frontend sin errores.
- `runserver` contra `gis_tpi`: aplicó las migraciones, compiló el frontend, sirvió inicio y login, redirigió `/administracion/` al login y el botón de Google redirigió a `accounts.google.com`.
- No se completó un ingreso real con Google (requiere un navegador).

## Pendientes

- [PENDIENTE] Instalar PostGIS en el PostgreSQL local para la etapa GIS.

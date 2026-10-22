---
fecha: 2026-10-22
titulo: Base del proyecto Django y bitácora técnica
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005]
---

## Objetivo

Arrancar desde cero la aplicación web del TPI: estructura Django, frontend, skills de diseño, CI y Kubernetes, con login de Google estándar.

## Trabajo realizado

- Reestructuración del repositorio: se eliminó `qgis/Chaco/` (sigue disponible en el historial de git); la consigna pasó a `docs/tpi/` y `sig_ign.zip` quedó fuera de git.
- Proyecto Django en la raíz: `config/settings/{base,local,production,test}.py`, apps `core` (inicio público), `cuentas` (allauth y pantallas de cuenta) y `administracion` (panel de gráficos en estado vacío).
- Frontend con shadcn/Base UI, coss y componentes compartidos, con tres entradas: `inicio`, `cuenta` (login, logout, error de Google y 403) y `admin-panel`.
- Calidad: ruff con complejidad ciclomática ≤ 10 y chequeo orientativo de largo de archivos (`scripts/check_file_length.py`, solo avisa).
- Infraestructura: Dockerfile multi-etapa, `docker-compose.yml` con PostgreSQL 17, manifiestos `k8s/` y workflows `0-calidad`, `1-construir-imagen` y `2-deploy-vps`.
- Skills de diseño y componentes, `django-backend` y `bitacora`.
- Esta bitácora: fuentes en `docs/bitacora/` y generador `scripts/generar_bitacora.py` (Markdown → PDF con WeasyPrint), con el formato del documento de ejemplo provisto.

## Verificación

- `python manage.py test`: 12 tests en verde (con SQLite en memoria; CI los corre contra PostgreSQL).
- `ruff check .`, `manage.py check` y `makemigrations --check` sin observaciones.
- `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- No se probó todavía: login real con Google (faltan credenciales), la imagen Docker (Docker Desktop apagado) ni el deploy al VPS.

## Problemas y soluciones

- Con `SOCIALACCOUNT_ONLY`, allauth no registra la URL de alta con contraseña: el test se ajustó para comprobar esa ausencia.
- Las pantallas de Administración usan `AdminLayout` completo en React, sin mezclar plantillas Django con islas.

## Pendientes

- [PENDIENTE] Credenciales OAuth de Google, secrets del deploy y dominio.
- [PENDIENTE] Etapa GIS: PostGIS, servidor de mapas y visor.

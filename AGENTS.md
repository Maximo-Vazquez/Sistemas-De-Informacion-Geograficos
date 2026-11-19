# AGENTS.md — Visor SIG Chaco

## Alcance
- Aplicación web del Trabajo Práctico Integrador de SIG (UTN FRRe, 2026). Consigna: `docs/tpi/practico.pdf`.
- Django con plantillas mínimas que montan pantallas React + TypeScript + Vite + Tailwind v4. No es una SPA.
- Autenticación estándar de Django con allauth y Google; no agregar proveedores OIDC propios ni JWT.
- Etapa actual: ejecución local (ADR-0012), sin despliegue remoto. PostGIS (puerto 5433) y GeoServer (puerto 8085) en Docker con las 47 capas del IGN (`docker compose up -d postgis geoserver`, `python scripts/cargar_capas_ign.py`) y visor OpenLayers en `/administracion/visor/`. El visor cumple a.3 (consulta, medición, carga por WFS-T vía Django en `elementos_relevados`, leyenda con la simbología de `scripts/simbologia_ign.py`). Punto b resuelto: análisis con algoritmos de Procesamiento de QGIS en `scripts/analisis_rn11_qgis.py` (Python de QGIS; guarda en PostGIS, esquema `analisis`), publicación con `python scripts/publicar_analisis_rn11.py` e informe con `python scripts/generar_informe_b.py` (ADR-0017). Siguiente: mapa A4 del punto c.

## Estructura
- `config/settings/`: configuración común, local (por defecto) y de pruebas. Entorno solo vía `config/settings/entorno.py`.
- `apps/core/`: inicio público, tag `{% vite_assets %}`, 403 y `runserver` de desarrollo (migra y compila el frontend).
- `apps/cuentas/`: adaptador de allauth y pantallas de cuenta. Administración exige sesión (`login_required`).
- `apps/administracion/`: panel; `contexto.py` arma el contrato `AdminPageData`, `navegacion.py` el sidebar.
- `frontend/src/`: entradas `inicio.tsx`, `cuenta.tsx`, `admin-*.tsx`; features en `features/`; bibliotecas en `components/`.
- `docs/bitacora/` + `scripts/generar_bitacora.py`: bitácora técnica.
- `e2e/`: pruebas Playwright, capturas (`docs/capturas/`) y login de prueba (`apps/e2e/`, solo con `config.settings.e2e`). Ver `e2e/README.md`.

## Skills (leer antes de trabajar en cada área)
- Backend Python/Django: `.agents/skills/django-backend/SKILL.md`.
- UI: `frontend-components`, `admin-screens`, `admin-visual-style` (fuente de verdad del color), `data-tables`, `shadcn`, `coss`, `coss-particles`; diseño general en `.claude/skills/frontend-design`.
- QGIS: `.agents/skills/qgis-mcp-workflows/SKILL.md` y `docs/qgis-mcp-y-skill.md`.
- Bitácora: `.agents/skills/bitacora/SKILL.md`.
- Pruebas de navegador y capturas: `e2e/README.md`.

## Reglas
- Reutilizar componentes compartidos antes de crear nuevos; shadcn primero, coss para faltantes. Base UI compone con `render`, no `asChild`.
- Las features no escriben colores: tokens de `frontend/src/index.css` y componentes compartidos (`pnpm --dir frontend check:colores`).
- Backend: vistas delgadas, lecturas en `selectors.py`, escrituras en `services.py`/`servicios.py`. Complejidad ciclomática ≤ 10 (ruff, obligatorio). Largo de archivo ~300 líneas Python / ~250 TS: referencia orientativa, se puede extender.
- Secretos solo por variables de entorno. Nunca guardar credenciales en el código.
- **Al cerrar cada sesión con cambios, actualizar la bitácora** (registro, ADR si hubo decisiones, versión) y regenerarla.

## Verificación
```powershell
.venv\Scripts\ruff check .
.venv\Scripts\python scripts\check_file_length.py
.venv\Scripts\python manage.py test --settings=config.settings.test
pnpm --dir frontend typecheck; pnpm --dir frontend build; pnpm --dir frontend check:colores
.venv\Scripts\python scripts\generar_bitacora.py
pnpm --dir e2e probar   # solo cuando haga falta o se pida
```

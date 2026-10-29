# Visor SIG Chaco

Aplicación web del Trabajo Práctico Integrador de Sistemas de Información Geográfica (UTN FRRe, 2026): capas del SIG IGN 250 sobre PostGIS, servicios WMS/WFS y un visor web, más el análisis de la Ruta Nacional 11 en el Chaco. La consigna está en [docs/tpi/practico.pdf](docs/tpi/practico.pdf).

Estado actual: base de la aplicación (inicio, Administración con login de Google y paneles en preparación). El avance y las decisiones están en la [bitácora técnica](docs/bitacora/salida/bitacora.md).

## Primer inicio

Requisitos: Python 3.13, Node 24 con pnpm 10 (`corepack enable`) y Docker.

```powershell
git clone --branch develop https://github.com/Maximo-Vazquez/Sistemas-De-Informacion-Geograficos.git GIS
cd GIS
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env            # completar la base y GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
docker compose up -d db
.venv\Scripts\python manage.py migrate
pnpm --dir frontend install
$env:VITE_OUTPUT_DIR="../static/frontend"; pnpm --dir frontend exec vite build
.venv\Scripts\python manage.py runserver
```

Abrí http://localhost:8000. Para el login con Google, registrá `http://localhost:8000/accounts/google/login/callback/` como URI de redirección en las credenciales OAuth. Cualquier cuenta de Google que inicie sesión accede a Administración.

## Estructura

- `config/`, `apps/`, `templates/`: proyecto Django.
- `frontend/`: React + Vite + shadcn (Base UI) y coss.
- `k8s/`, `Dockerfile`, `.github/workflows/`: despliegue (imagen en GHCR por tag `v*`, deploy manual al VPS).
- `docs/bitacora/`: fuentes de la bitácora; `python scripts/generar_bitacora.py` genera el Markdown y el PDF.
- `docs/qgis-mcp-y-skill.md`: configuración de QGIS MCP para el análisis y la cartografía.
- `AGENTS.md` y `.agents/skills/`: instrucciones para trabajar en el repositorio.

## Pruebas de navegador y capturas

- `pnpm --dir e2e probar`: pruebas Playwright con servidor y base propios (ver [e2e/README.md](e2e/README.md)).
- `pnpm --dir e2e capturas`: capturas de pantalla reales en `docs/capturas/`.

## Calidad

```powershell
.venv\Scripts\ruff check .
.venv\Scripts\python manage.py test --settings=config.settings.test
pnpm --dir frontend typecheck
```

CI (`0-calidad`) corre lo mismo contra PostgreSQL, compila el frontend y verifica la bitácora.

## Despliegue

1. Cargar en GitHub los secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
2. En el VPS, crear el secret `db-credentials-sig` (plantilla en `k8s/00-secret-db.yaml`) y `ghcr-cred` para descargar la imagen.
3. Crear un tag `v*` (construye la imagen) y ejecutar el workflow **2. Deploy Manual a VPS**.

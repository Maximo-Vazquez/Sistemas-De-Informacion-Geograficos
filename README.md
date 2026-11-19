# Visor SIG Chaco

Aplicación web del Trabajo Práctico Integrador de Sistemas de Información Geográfica (UTN FRRe, 2026): capas del SIG IGN 250 sobre PostGIS, servicios WMS/WFS y un visor web, más el análisis de la Ruta Nacional 11 en el Chaco. La consigna está en [docs/tpi/practico.pdf](docs/tpi/practico.pdf).

El proyecto se ejecuta localmente. El visor incluye consultas por punto y rectángulo, medición de distancias y alta de elementos con geometría y atributos. La instalación puede cargar las 47 capas del IGN en PostGIS y publicarlas en GeoServer. Los cálculos del panel para la RN 11 siguen pendientes. El avance está en la [bitácora técnica](docs/bitacora/salida/bitacora.md).

## Primer inicio

Requisitos: Python 3.13, Node 24 con pnpm 10 (`corepack enable`) y Docker.

```powershell
git clone --branch develop https://github.com/Maximo-Vazquez/Sistemas-De-Informacion-Geograficos.git GIS
cd GIS
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env            # completar la base y GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
docker compose up -d db postgis geoserver
.venv\Scripts\python scripts\cargar_capas_ign.py   # solo la primera vez; necesita docs/tpi/sig_ign.zip
.venv\Scripts\python manage.py migrate
pnpm --dir frontend install
$env:VITE_OUTPUT_DIR="../static/frontend"; pnpm --dir frontend exec vite build
.venv\Scripts\python manage.py runserver
```

Abrí http://localhost:8000. Para el login con Google, registrá `http://localhost:8000/accounts/google/login/callback/` como URI de redirección en las credenciales OAuth. Cualquier cuenta de Google que inicie sesión accede a Administración.

Para seguir con Google y volver al visor: http://localhost:8000/accounts/google/login/?next=/administracion/visor/.

### Agregar elementos al mapa

1. Entrá a **Administración → Visor** y elegí **Agregar elemento** en la barra del mapa.
2. Elegí la capa (**Elementos relevados**) y la geometría: **Punto**, **Línea** o **Polígono**. Hacé clic para ubicar un punto. Para una línea, marcá los vértices y hacé doble clic en el último. Para un polígono, marcá al menos tres vértices y hacé clic en el primero para cerrarlo.
3. Completá **Nombre** y, si querés, **Categoría** y **Descripción**. Elegí **Guardar elemento**.
4. El elemento aparece en la capa al guardar. Usá **Consultar punto** o **Consultar área** para ver sus atributos.

El visor arma una transacción WFS-T y la envía a Django, que solo acepta inserciones en las capas de `GEOSERVER_CAPAS_EDITABLES` y la reenvía a GeoServer con sus credenciales (ADR-0016). El elemento se guarda en la tabla `elementos_relevados` de PostGIS.

### Capas IGN y bases de datos

El servicio `db` guarda las cuentas y sesiones de Django en PostgreSQL. `postgis` (base `sig_ign`, puerto 5433) guarda las 47 capas del IGN y `elementos_relevados`. GeoServer accede a `postgis` por la red de Compose y publica las capas en el espacio `ign` (ADR-0015).

Para preparar una instalación nueva se necesita el ZIP del SIG IGN 250 en `docs/tpi/sig_ign.zip` y Docker; no hace falta instalar GDAL. Con `postgis` y `geoserver` en marcha:

```powershell
.venv\Scripts\python scripts\cargar_capas_ign.py                  # carga, publica y aplica estilos
.venv\Scripts\python scripts\cargar_capas_ign.py --solo-publicar  # solo publicación y estilos
```

El script carga los shapefiles con `ogr2ogr` de la imagen oficial de GDAL, crea la capa editable, publica todo en GeoServer y aplica la simbología por clases de `scripts/simbologia_ign.py` (ADR-0014), que es la que muestra la leyenda del visor. Se puede repetir: recrea las tablas y actualiza los estilos. Las 47 capas suman 570.443 elementos.

Si tenés el volumen `datos_gis` de la versión anterior (servicio `gisdb`), ya no se usa: corré el script para cargar `postgis` y borralo con `docker volume rm <proyecto>_datos_gis`.

El [inventario de capas y cambios](docs/bitacora/secciones/09-inventario-capas-ign.md) detalla los nombres, geometrías, cantidades, verificaciones y pendientes para el equipo.

## Configurar el acceso con Google

El proyecto usa Django allauth con Google como único proveedor. La consigna del TPI no exige este login; es la forma de acceso elegida para Administración y el visor. No hace falta crear una cuenta de Google nueva ni obtener una clave de Google Maps: el fondo del mapa usa Argenmap del IGN.

Si el equipo ya tiene un cliente OAuth, se pueden reutilizar sus credenciales siempre que incluya la URI local. Si todavía no existe:

1. Entrar con la cuenta habitual a [Google Auth Platform](https://console.cloud.google.com/auth/overview) y seleccionar o crear un proyecto.
2. Configurar la aplicación y su información de contacto. Para cuentas personales, elegir público externo; si se mantiene en pruebas, agregar las cuentas que correspondan como usuarios de prueba.
3. En **Clientes → Crear cliente**, elegir **Aplicación web**. El callback lo recibe Django, aunque se ejecute en la computadora local.
4. En **URI de redirección autorizados**, agregar exactamente `http://localhost:8000/accounts/google/login/callback/`. Para entrar también por `127.0.0.1`, agregar por separado `http://127.0.0.1:8000/accounts/google/login/callback/`.
5. Descargar el JSON del cliente y guardarlo fuera del repositorio. Copiar `web.client_id` a `GOOGLE_CLIENT_ID` y `web.client_secret` a `GOOGLE_CLIENT_SECRET` en `.env`.
6. Reiniciar Django y entrar a http://localhost:8000/administracion/visor/.

El secreto pertenece a la aplicación; no es la contraseña personal de Google. La configuración actual pide perfil y correo. No necesita orígenes JavaScript para este flujo de autenticación del servidor. Referencia: [documentación de clientes OAuth de Google](https://support.google.com/cloud/answer/15549257?hl=es).

La revisión de cumplimiento de la consigna está en [docs/revision-2026-11-12.md](docs/revision-2026-11-12.md).

## Estructura

- `config/`, `apps/`, `templates/`: proyecto Django.
- `frontend/`: React + Vite + shadcn (Base UI) y coss.
- `docker-compose.yml`: PostgreSQL, PostGIS y GeoServer locales; Django corre con `runserver`. `.github/workflows/`: comprobaciones de calidad y pruebas.
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

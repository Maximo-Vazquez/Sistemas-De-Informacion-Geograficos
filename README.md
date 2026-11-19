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
docker compose up -d db
.venv\Scripts\python manage.py migrate
pnpm --dir frontend install
$env:VITE_OUTPUT_DIR="../static/frontend"; pnpm --dir frontend exec vite build
.venv\Scripts\python manage.py runserver
```

Abrí http://localhost:8000. Para el login con Google, registrá `http://localhost:8000/accounts/google/login/callback/` como URI de redirección en las credenciales OAuth. Cualquier cuenta de Google que inicie sesión accede a Administración.

### Aplicación local con Docker

Como alternativa al Python nativo, completar `.env` y ejecutar:

```powershell
docker compose up -d --build web geoserver
```

La aplicación queda en http://localhost:8000. El servicio `web` usa los assets compilados en la imagen y `runserver` para servirlos en desarrollo. GeoServer inicia automáticamente `gisdb`, la base PostGIS de las capas. Si la imagen ya está construida, alcanza con `docker compose up -d web geoserver`. Tras modificar `.env`, ejecutar `docker compose up -d --force-recreate web`.

Para seguir con Google y volver al visor: http://localhost:8000/accounts/google/login/?next=/administracion/visor/.

### Agregar elementos al mapa

1. Entrá a **Administración → Visor** y elegí **Agregar elemento** en la barra del mapa.
2. Elegí **Punto**, **Línea** o **Polígono**. Hacé clic para ubicar un punto. Para una línea, marcá los vértices y hacé doble clic en el último. Para un polígono, marcá al menos tres vértices y hacé clic en el primero para cerrarlo.
3. Completá **Nombre** y, si querés, **Descripción**. Elegí **Guardar elemento**.
4. El visor activa **Relevamientos** al guardar. Para ver los elementos al volver al visor, activá esa capa en el panel. Usá **Punto** o **Rectángulo** para consultar sus atributos.

Django guarda los elementos como GeoJSON en EPSG:4326 junto con sus atributos en el PostgreSQL local (`db`). La migración se aplica al iniciar con `manage.py runserver`. Si ya usabas la aplicación en Docker, reconstruí el servicio con `docker compose up -d --build web geoserver` para incorporar el alta.

### Capas IGN y bases de datos

El servicio `db` guarda las cuentas, sesiones y relevamientos en PostgreSQL. `gisdb` guarda las capas del IGN en PostGIS. GeoServer accede a `gisdb` por la red de Compose y publica esas capas en el espacio `ign`. La imagen PostGIS contiene el software y la extensión. Los datos de las capas se cargan en el volumen `datos_gis`.

Para preparar una instalación nueva se necesita el ZIP del SIG IGN 250 y GDAL (`ogr2ogr`) con soporte PostgreSQL. Una vez iniciado `gisdb`, cargar y publicar:

```powershell
python scripts/importar_ign.py docs/tpi/sig_ign.zip --ogr2ogr D:/GIS/bin/ogr2ogr.exe
python scripts/publicar_ign.py
python scripts/estilos_ign.py
```

Reemplazá ambas rutas por las del ZIP y de `ogr2ogr` en tu computadora. El importador lee el ZIP directamente, preserva los atributos y comprueba el número de elementos de cada capa; no sobrescribe tablas existentes. El catálogo generado registra el hash del archivo de origen y los conteos. La publicación usa las credenciales de los contenedores sin escribirlas en el código. `estilos_ign.py` carga la simbología por clases de `scripts/simbologia_ign.py` y la asigna a cada capa; es la que muestra la leyenda del visor.

La publicación crea el almacén `sig_ign2011` y conserva los almacenes existentes. Si otra capa ya usa el mismo nombre en el espacio `ign`, la capa del ZIP recibe el prefijo `sig2011_` y se identifica en el título como SIG IGN 250.

En esta computadora se usó `D:/TPI/sig_ign.zip`. El ZIP contiene la carpeta `SIG_IGN2011`: sus 47 capas suman 570.443 elementos. Las cinco capas del laboratorio anterior permanecen en otro almacén y pueden generar entradas de nombre parecido en la lista. Para ver una capa en el visor, activá su interruptor.

En esta computadora, esas cinco capas anteriores usan el contenedor local `postgis` en el puerto 5433. Si GeoServer tarda en leer el catálogo después de reiniciar Docker, iniciá también ese contenedor con `docker start postgis`.

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

Si Django corre en Docker, `.env` debe estar disponible en ese contenedor o sus variables deben pasarse al crearlo. El servicio `web` de Compose ya usa `env_file: .env`. Crear o modificar el archivo solamente en Windows no actualiza las variables de un contenedor iniciado: recrear el servicio después del cambio.

La revisión de cumplimiento de la consigna está en [docs/revision-2026-11-12.md](docs/revision-2026-11-12.md).

## Estructura

- `config/`, `apps/`, `templates/`: proyecto Django.
- `frontend/`: React + Vite + shadcn (Base UI) y coss.
- `Dockerfile` y `docker-compose.yml`: ejecución local. `.github/workflows/`: comprobaciones de calidad y pruebas.
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

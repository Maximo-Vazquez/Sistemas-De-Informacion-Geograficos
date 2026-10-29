<!-- Generado por scripts/generar_bitacora.py. No editar: modificar las fuentes en docs/bitacora/. -->

|  |  |
|---|---|
| **Título del proyecto** | Visor SIG Chaco |
| **Entregable** | Documentación técnica del Trabajo Práctico Integrador |
| **Organización para quien se redacta** | Universidad Tecnológica Nacional – Facultad Regional Resistencia<br>French 414, Resistencia, Chaco, Argentina. |
| **Autor** | Vazquez Maximo Ezequiel |

## Ficha del documento

|  |  |
|---|---|
| **Autor** | Vazquez Maximo Ezequiel |
| **Responsables** | Ing. Ilse Hodapp<br>Ing. Rodrigo Valdés |
| **Integrantes** | Vazquez Maximo Ezequiel<br>[PENDIENTE] completar el resto del grupo (4 a 5 integrantes) |
| **Proyecto** | Visor SIG Chaco |
| **Lugar de realización** | Universidad Tecnológica Nacional – Facultad Regional Resistencia<br>French 414, Resistencia, Chaco, Argentina. |
| **Nombre del documento** | Bitácora técnica – Visor SIG Chaco |
| **Versión/Edición** | 0.4.0 |
| **Fecha de versión** | 29/10/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.4.0 | 29/10/2026 | GeoServer en Docker como servidor de mapas (ADR-0008); OpenLayers y primera versión del visor (ADR-0009) |
| 0.3.0 | 22/10/2026 | Pruebas de navegador con Playwright y capturas reproducibles; ADR-0007 |
| 0.2.0 | 22/10/2026 | Acceso a Administración para cualquier cuenta de Google; Base local gis_tpi y runserver que compila el frontend; Dependencias unificadas en requirements.txt y logo de la UTN; Globo 3D en la pantalla de inicio; Logo del equipo y botón estándar de Google |
| 0.1.0 | 22/10/2026 | Creación del documento; Registro de la configuración de QGIS MCP y del mapa del Chaco; Base Django del proyecto y ADR-0001 a ADR-0006 |

<!-- cuerpo -->

# 1 Introducción

## 1.1 Propósito

Este documento registra el desarrollo del Trabajo Práctico Integrador (TPI) de Sistemas de Información Geográfica: qué se hizo en cada sesión, qué decisiones técnicas se tomaron y por qué, con qué tecnologías y en qué estado está cada consigna. Se actualiza al cierre de cada sesión de trabajo y sirve como base del informe que pide la consigna b.

## 1.2 Alcance

Cubre la aplicación web del proyecto (Django y React), la infraestructura (PostgreSQL/PostGIS, servidor de mapas, contenedores y Kubernetes) y el trabajo de análisis y cartografía con QGIS. No reemplaza al informe del punto b ni al mapa del punto c: los referencia.

## 1.3 Estructura y estándares

- Identificación, ficha y control de versiones según **ISO/IEC/IEEE 15289** (contenido de los ítems de información del ciclo de vida).
- Decisiones registradas como **ADR** (*Architecture Decision Records*) en formato **MADR**: contexto, opciones consideradas, decisión y consecuencias.
- Versión del documento con **SemVer** y cambios al estilo **Keep a Changelog**.
- Las dudas abiertas se marcan como pendientes y se destacan en naranja hasta que se resuelven.

## 1.4 Referencias

Tabla: Documentos de referencia

| Documento | Ubicación |
|---|---|
| Consigna del TPI | `docs/tpi/practico.pdf` |
| Capas del SIG IGN 250 | `docs/tpi/sig_ign.zip` (no versionado) |
| Guía de QGIS MCP | `docs/qgis-mcp-y-skill.md` |
| Instrucciones del repositorio | `AGENTS.md` y `.agents/skills/` |
| Fuentes de esta bitácora | `docs/bitacora/` |

# 2 Contexto y objetivos del TPI

## 2.1 Consigna

La cátedra pide, en grupos de 4 a 5 integrantes y con las capas del SIG IGN 250 (entrega: 01/12/2026 y 03/12/2026):

- **a)** Montar un servidor de bases de datos espaciales con las capas vectoriales, un servidor de mapas que las publique por WMS y WFS, y una aplicación web que permita navegar el mapa, activar y desactivar capas, ver la leyenda y la escala, consultar por punto y por rectángulo, medir distancias e ingresar elementos nuevos (geometría y atributos).
- **b)** Responder, para la obra de mantenimiento de la Ruta Nacional 11 en el Chaco: kilómetros de traza en la provincia, población afectada hasta 10 km y hasta 20 km (categorías excluyentes) y cantidad y nombre de los puentes que cruzan la traza, con un informe de pasos y capturas.
- **c)** Confeccionar un mapa A4 en PDF que comunique la traza en el contexto de la red vial, las áreas de influencia y localidades, los puentes y los accidentes naturales, con los elementos y criterios de diseño cartográfico de la Unidad 2.

## 2.2 Objetivos del proyecto

- Una sola aplicación web (Visor SIG Chaco) que cubra el punto a y muestre los resultados del punto b.
- Procesos reproducibles: análisis con QGIS automatizado por scripts y MCP, despliegue con contenedores y CI.
- Trazabilidad: cada decisión y cada paso queda en esta bitácora.

# 3 Arquitectura y stack tecnológico

## 3.1 Vista general

Django sirve las páginas y monta pantallas React compiladas con Vite (no es una SPA). PostgreSQL guarda los datos de la aplicación y, en la etapa GIS, las capas con PostGIS. Un servidor de mapas publicará esas capas por WMS/WFS y el visor web las consumirá. En producción, un pod de Kubernetes corre Django (Gunicorn) junto a nginx, que sirve los estáticos.

## 3.2 Stack actual

Tabla: Tecnologías en uso

| Componente | Tecnología | Versión | Uso |
|---|---|---|---|
| Backend | Django | 5.2.18 | Aplicación web, vistas y administración |
| Autenticación | django-allauth (Google) | 65.20.1 | Login con Google, sin contraseñas |
| Base de datos | PostgreSQL | 17 | Datos de la aplicación; PostGIS en la etapa GIS |
| Driver | psycopg | 3.3.6 | Conexión Django–PostgreSQL |
| Servidor WSGI | Gunicorn | 26.2.0 | Producción |
| Frontend | React + TypeScript | 19.3 / 7.0 | Pantallas montadas por Django |
| Build | Vite + Tailwind CSS | 8.3 / 4.3 | Compilación y estilos |
| Componentes | shadcn/ui (Base UI) + coss | 4.21 / 1.8 | Biblioteca de componentes de UI |
| Gráficos | Recharts | 3.8 | Paneles de Administración |
| Globo 3D | Magic UI Globe (cobe, WebGL) | 0.6 | Globo interactivo del inicio, centrado en el Chaco |
| Calidad | Ruff | 0.17.2 | Estilo y complejidad ciclomática (≤ 10) |
| Contenedores | Docker (multi-etapa) | Node 24 / Python 3.13 | Imagen publicada en GHCR |
| Orquestación | Kubernetes (k3s) | — | Despliegue en VPS |
| CI/CD | GitHub Actions | — | Calidad, imagen por tag `v*` y deploy manual |
| Análisis SIG | QGIS + QGIS MCP | 4.2.2 / 0.14.1 | Análisis del punto b y mapa del punto c |
| Documentación | Python + Markdown + WeasyPrint | 70.0 | Esta bitácora en PDF |
| Pruebas de navegador | Playwright (Chromium) | 1.63 | Pruebas de flujos y capturas de pantalla |
| Servidor de mapas | GeoServer (Docker) | 2.27.2 | Servicios WMS y WFS de las capas (ADR-0008) |
| Biblioteca de mapas | OpenLayers | 10.6.1 | Visor web de Administración (ADR-0009) |

## 3.3 Componentes previstos

- **PostGIS** sobre PostgreSQL 17 para las capas del IGN (imagen `postgis/postgis`).
- Publicar las capas de PostGIS en GeoServer (espacio de trabajo `ign`).

# 4 Estado de las consignas del TPI

Avance de cada consigna de `docs/tpi/practico.pdf` al cierre de esta versión.

Tabla: Estado de las consignas del TPI

| Consigna | Descripción | Estado | Referencia |
|---|---|---|---|
| a.1 | Servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250 | Pendiente | ADR-0003 |
| a.2 | Servidor de mapas con servicios OGC (WMS y WFS) | En curso | ADR-0008 |
| a.3 | Aplicación web de visualización (navegación, capas, leyenda, escala, consultas, medición y edición) | En curso | ADR-0001, ADR-0002, ADR-0009 |
| b | Análisis de la RN 11 en el Chaco (km, población a 10 y 20 km, puentes) e informe | Pendiente | ADR-0006 |
| c | Mapa A4 en PDF con la traza, áreas de influencia, puentes y accidentes naturales | Pendiente | ADR-0006 |

# 5 Registro de decisiones (ADR)

Cada decisión técnica sigue el formato MADR: contexto, opciones consideradas, decisión y consecuencias.

Tabla: Resumen de decisiones

| ADR | Decisión | Estado | Fecha |
|---|---|---|---|
| ADR-0001 | Django con allauth y login de Google estándar | aceptada | 22/10/2026 |
| ADR-0002 | Frontend React con shadcn (Base UI) y coss | aceptada | 22/10/2026 |
| ADR-0003 | PostgreSQL desde el inicio, PostGIS en la etapa siguiente | aceptada | 22/10/2026 |
| ADR-0004 | Despliegue en Kubernetes (k3s) en VPS con imágenes en GHCR | aceptada | 22/10/2026 |
| ADR-0005 | Bitácora generada desde Markdown con Python y WeasyPrint | aceptada | 22/10/2026 |
| ADR-0006 | QGIS automatizado con QGIS MCP para análisis y cartografía | aceptada | 24/09/2026 |
| ADR-0007 | Playwright para pruebas de navegador y capturas de pantalla | aceptada | 22/10/2026 |
| ADR-0008 | GeoServer como servidor de mapas WMS/WFS | aceptada | 29/10/2026 |
| ADR-0009 | OpenLayers como biblioteca de mapas del visor | aceptada | 29/10/2026 |

## 5.1 ADR-0001 — Django con allauth y login de Google estándar

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

La aplicación necesita una sección de Administración que requiera iniciar sesión, sin administrar contraseñas.

### Opciones consideradas

- Proveedor OIDC propio con tokens JWT (login unificado entre aplicaciones).
- django-allauth estándar con Google como único proveedor.
- Usuario y contraseña propios de Django.

### Decisión

django-allauth con Google como único proveedor (`SOCIALACCOUNT_ONLY`), sin verificación por mail ni contraseñas. Cualquier cuenta de Google con sesión iniciada accede a Administración (`login_required`). Login y logout se hacen por POST con CSRF. Las credenciales de Google llegan por variables de entorno.

### Consecuencias

- Sin claves de firma, clientes OIDC ni envío de correos: menos secretos y menos código.
- Hay que crear credenciales OAuth en Google Cloud y registrar las URI de redirección de cada entorno.
- No hay lista de cuentas habilitadas: si más adelante hace falta restringir, se agrega un permiso propio.

## 5.2 ADR-0002 — Frontend React con shadcn (Base UI) y coss

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

La aplicación necesita pantallas consistentes (inicio, Administración, paneles de datos y, más adelante, el visor) con accesibilidad, tema claro/oscuro y uso en móvil, sin diseñar cada control desde cero.

### Opciones consideradas

- Plantillas Django con Bootstrap.
- React con shadcn sobre Base UI, complementado con coss.
- React con una biblioteca cerrada de componentes.

### Decisión

React con shadcn (Base UI) y coss, más componentes compartidos propios (`data-table`, `dashboard`, `admin`, `detail`, `upload`, `app`) y skills de diseño (`admin-visual-style`, `admin-screens`, `data-tables`, `frontend-components`, `shadcn`, `coss`). Django monta cada pantalla React desde un `json_script`; las entradas `admin-*.tsx` se registran solas en Vite.

### Consecuencias

- Un único patrón visual para todas las pantallas, controlado por `check:colores`.
- Los primitivos se agregan o actualizan con el CLI de shadcn.
- Las pantallas públicas y Administración comparten el cambio de tema (`components/app/theme-toggle.tsx`).

## 5.3 ADR-0003 — PostgreSQL desde el inicio, PostGIS en la etapa siguiente

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

La consigna a.1 exige un servidor de bases de datos espaciales. La primera etapa del proyecto solo arma la base de la aplicación, pero no conviene empezar con una base distinta a la final.

### Opciones consideradas

- SQLite en desarrollo y PostgreSQL en producción.
- PostgreSQL en todos los entornos, con PostGIS más adelante.
- PostGIS desde el primer día.

### Decisión

PostgreSQL 17 en desarrollo (base local `gis_tpi`, o `docker-compose.yml`), CI y producción. El motor se elige con `DB_ENGINE`: para GeoDjango alcanza con `django.contrib.gis.db.backends.postgis` y la imagen `postgis/postgis`, sin cambiar código.

### Consecuencias

- Mismo motor en todos los entornos desde el inicio.
- El PostgreSQL local todavía no tiene la extensión PostGIS instalada (Stack Builder).
- En la etapa GIS hay que sumar GDAL/GEOS/PROJ a la imagen (ya indicado en el Dockerfile) y crear la extensión `postgis` en la base del VPS.

## 5.4 ADR-0004 — Despliegue en Kubernetes (k3s) en VPS con imágenes en GHCR

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

La aplicación debe quedar publicada para la presentación y desplegarse de forma repetible. El equipo dispone de un VPS con k3s y de un NAS QNAP.

### Opciones consideradas

- Mantener ambos destinos.
- Solo el VPS con k3s.
- Solo el NAS QNAP.

### Decisión

Solo el VPS. El workflow `1-construir-imagen` publica la imagen en GHCR al crear un tag `v*`; `2-deploy-vps` (manual) resuelve el último tag, crea el secret `sig-runtime-credentials` y aplica `k8s/`. Se suma `0-calidad` (ruff, tests con Postgres, build del frontend y bitácora) en cada push y PR.

### Consecuencias

- Secrets necesarios en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- PostGIS y el servidor de mapas irán como manifiestos propios en `k8s/`.

## 5.5 ADR-0005 — Bitácora generada desde Markdown con Python y WeasyPrint

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

El grupo necesita registrar trabajo y decisiones durante todo el TPI y presentar un informe con formato de documento técnico (portada, ficha, control de versiones, índice, encabezado y pie).

### Opciones consideradas

- Un documento de Word o Google Docs editado a mano.
- Markdown versionado en el repositorio y un script que genera el PDF.

### Decisión

Fuentes en `docs/bitacora/` (YAML y Markdown: secciones, ADR y una entrada por sesión). `scripts/generar_bitacora.py` arma `salida/bitacora.md` y lo convierte a PDF con WeasyPrint (HTML + CSS de impresión). CI verifica que el `.md` generado esté al día y publica el PDF como artifact.

### Consecuencias

- La bitácora se revisa en los mismos commits que el código.
- El formato vive en un solo lugar (`assets/estilos.css` y `assets/plantilla.html`).
- Generar el PDF en local requiere WeasyPrint y sus librerías del sistema (Pango); `--solo-md` funciona sin ellas.

## 5.6 ADR-0006 — QGIS automatizado con QGIS MCP para análisis y cartografía

*Estado: aceptada · Fecha: 24/09/2026*

### Contexto

Los puntos b y c requieren geoprocesos (recortes, buffers, intersecciones) y un mapa de impresión. Hacerlos solo a mano dificulta repetirlos y documentarlos.

### Opciones consideradas

- QGIS manual con capturas.
- QGIS con scripts PyQGIS y el servidor QGIS MCP (complemento y servidor v0.14.1, proyecto nkarasiak/qgis-mcp).

### Decisión

QGIS 4.2.2 con QGIS MCP: un asistente opera QGIS mediante herramientas (capas, procesos, layouts) y los pasos quedan como scripts reproducibles. La configuración del equipo está en `docs/qgis-mcp-y-skill.md` y la skill `qgis-mcp-workflows`.

### Consecuencias

- Requiere QGIS abierto con el servidor del complemento activo (`localhost:9876`).
- Complemento y servidor deben mantener la misma versión.

## 5.7 ADR-0007 — Playwright para pruebas de navegador y capturas de pantalla

*Estado: aceptada · Fecha: 22/10/2026*

### Contexto

La aplicación necesita pruebas que verifiquen los flujos reales en el navegador, y el punto b del TPI exige un informe con capturas de pantalla de los pasos. El login es solo con Google, que no se puede automatizar.

### Opciones consideradas

- Capturas manuales y sin pruebas de navegador.
- Playwright para pruebas y capturas reproducibles.
- Selenium o Cypress para las pruebas.

### Decisión

Playwright 1.63 en `e2e/` (pnpm, Chromium) con servidor Django y base propios (`gis_tpi_e2e`, puerto 8030). El login de Google se reemplaza en pruebas por los comandos `reiniciar_e2e` y `sesion_e2e` de `apps/e2e`, que solo existen con `config.settings.e2e`. Las capturas salen de `pnpm --dir e2e capturas`. Las pruebas en CI se lanzan solo a mano.

### Consecuencias

- Las capturas se regeneran con un comando cuando cambia la interfaz.
- Las capturas usan la GPU real: con la GPU por software del modo headless, el globo WebGL sale negro.
- El login de prueba no existe en producción: la app `apps.e2e` no está en los settings de la aplicación.

## 5.8 ADR-0008 — GeoServer como servidor de mapas WMS/WFS

*Estado: aceptada · Fecha: 29/10/2026*

### Contexto

La consigna a.2 exige un servidor de mapas que publique las capas del SIG IGN 250 con servicios OGC (WMS y WFS). El visor (a.3) consume esos servicios para mostrar capas, leyendas, consultas y para cargar elementos nuevos (WFS-T).

### Opciones consideradas

- GeoServer.
- QGIS Server.
- MapServer.

### Decisión

GeoServer 2.27.2, con la imagen oficial `docker.osgeo.org/geoserver` como servicio `geoserver` de `docker-compose.yml` (puerto 8085, consola en `http://localhost:8085/geoserver`). Razones:

- Es el servidor recomendado en la clase de Sistemas de Información Geográfica, junto con OpenLayers para el visor (ADR-0009).
- Publica WMS, WFS y WFS-T (edición) desde una consola web, sin escribir configuración a mano.
- Se conecta directo a PostGIS como almacén de datos y genera la leyenda con `GetLegendGraphic`.
- Tiene imagen Docker oficial, la misma en desarrollo y en el VPS.

El visor lee la URL con `GEOSERVER_URL` y el espacio de trabajo con `GEOSERVER_WORKSPACE` (por defecto `ign`). La contraseña del usuario `admin` llega por `GEOSERVER_ADMIN_PASSWORD`.

### Consecuencias

- La configuración de GeoServer (almacenes, capas y estilos) vive en el volumen `datos_geoserver`, no en el repositorio.
- CORS está habilitado en el contenedor porque el navegador pide WMS/WFS desde `localhost:8000` a `localhost:8085`.
- Falta cargar las capas en PostGIS (a.1) y publicarlas en el espacio de trabajo `ign`.
- QGIS sigue en uso para el análisis del punto b y el mapa del punto c (ADR-0006).

## 5.9 ADR-0009 — OpenLayers como biblioteca de mapas del visor

*Estado: aceptada · Fecha: 29/10/2026*

### Contexto

La consigna a.3 pide un visor web con navegación, activar y desactivar capas, leyenda y escala, consulta gráfica por punto y por rectángulo, medición de distancias y carga de elementos nuevos en una capa vectorial. Las capas llegan desde GeoServer por WMS y WFS (ADR-0008).

### Opciones consideradas

- OpenLayers.
- Leaflet con plugins.
- MapLibre GL.

### Decisión

OpenLayers 10.6.1 en el frontend React (`frontend/src/features/admin-visor/`). Razones:

- Es la biblioteca recomendada en la clase de Sistemas de Información Geográfica, junto con GeoServer.
- Trae de fábrica lo que pide la consigna: WMS y WFS, escala (`ScaleLine`), `GetFeatureInfo`, selección por rectángulo (`DragBox`), dibujo y medición (`Draw`, `ol/sphere`) y transacciones WFS-T.
- Maneja proyecciones, necesario para medir en metros sobre datos en coordenadas geográficas.
- Leaflet necesita plugins de terceros para medición, selección por rectángulo y WFS-T.

### Consecuencias

- El visor es una pantalla de Administración (`/administracion/visor/`) montada con `mountAdminPage`, sin cambiar la arquitectura Django + React.
- Primera versión: fondo Argenmap del IGN (público, sin clave), vista inicial en el Chaco, zoom, escala, lista de capas leída del `GetCapabilities` con interruptores y leyenda por capa.
- Pendiente: consulta por punto y rectángulo, medición y carga de elementos.

# 6 Bitácora de trabajo

Registro cronológico de las sesiones de trabajo.

## 6.1 24/09/2026 — Configuración de QGIS MCP y mapa del Chaco

*Vazquez Maximo Ezequiel · Decisiones: ADR-0006*

### Objetivo

Preparar el entorno de QGIS automatizado y un primer proyecto de mapa provincial.

### Trabajo realizado

- Repositorio inicializado en la rama `develop`.
- Skill `qgis-mcp-workflows` y guía `docs/qgis-mcp-y-skill.md` para instalar y conectar QGIS MCP (complemento y servidor v0.14.1, QGIS 4.2.2).
- Proyecto `qgis/Chaco/Mapa_Chaco.qgz` con los 25 departamentos y 750 tramos de cursos de agua recortados a la provincia (GeoPackage `chaco.gpkg`), exportado a PDF y PNG con `scripts/generar_mapa_chaco.py`.

### Problemas y soluciones

- El TIFF `3420C_2010_327_RGB_LATLNG.tif` del material provisto está georreferenciado sobre el sureste de África y la escena Landsat cubre solo parte del Chaco: se dejaron fuera del mapa.
- Los insumos originales superan los 170 MB descomprimidos: quedaron fuera de git y se versionó solo el GeoPackage procesado.

### Pendientes

- Repetir el análisis con las capas del SIG IGN 250 de la consigna.

## 6.2 22/10/2026 — Ajustes de acceso y entorno local

*Vazquez Maximo Ezequiel · Decisiones: ADR-0001, ADR-0003*

### Objetivo

Dejar la aplicación lista para correr con `python manage.py runserver` y simplificar el acceso.

### Trabajo realizado

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

### Verificación

- 11 tests en verde contra PostgreSQL, ruff y build del frontend sin errores.
- `runserver` contra `gis_tpi`: aplicó las migraciones, compiló el frontend, sirvió inicio y login, redirigió `/administracion/` al login y el botón de Google redirigió a `accounts.google.com`.
- No se completó un ingreso real con Google (requiere un navegador).

### Pendientes

- [PENDIENTE] Instalar PostGIS en el PostgreSQL local para la etapa GIS.

## 6.3 22/10/2026 — Base del proyecto Django y bitácora técnica

*Vazquez Maximo Ezequiel · Decisiones: ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005*

### Objetivo

Arrancar desde cero la aplicación web del TPI: estructura Django, frontend, skills de diseño, CI y Kubernetes, con login de Google estándar.

### Trabajo realizado

- Reestructuración del repositorio: se eliminó `qgis/Chaco/` (sigue disponible en el historial de git); la consigna pasó a `docs/tpi/` y `sig_ign.zip` quedó fuera de git.
- Proyecto Django en la raíz: `config/settings/{base,local,production,test}.py`, apps `core` (inicio público), `cuentas` (allauth y pantallas de cuenta) y `administracion` (panel de gráficos en estado vacío).
- Frontend con shadcn/Base UI, coss y componentes compartidos, con tres entradas: `inicio`, `cuenta` (login, logout, error de Google y 403) y `admin-panel`.
- Calidad: ruff con complejidad ciclomática ≤ 10 y chequeo orientativo de largo de archivos (`scripts/check_file_length.py`, solo avisa).
- Infraestructura: Dockerfile multi-etapa, `docker-compose.yml` con PostgreSQL 17, manifiestos `k8s/` y workflows `0-calidad`, `1-construir-imagen` y `2-deploy-vps`.
- Skills de diseño y componentes, `django-backend` y `bitacora`.
- Esta bitácora: fuentes en `docs/bitacora/` y generador `scripts/generar_bitacora.py` (Markdown → PDF con WeasyPrint), con el formato del documento de ejemplo provisto.

### Verificación

- `python manage.py test`: 12 tests en verde (con SQLite en memoria; CI los corre contra PostgreSQL).
- `ruff check .`, `manage.py check` y `makemigrations --check` sin observaciones.
- `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- No se probó todavía: login real con Google (faltan credenciales), la imagen Docker (Docker Desktop apagado) ni el deploy al VPS.

### Problemas y soluciones

- Con `SOCIALACCOUNT_ONLY`, allauth no registra la URL de alta con contraseña: el test se ajustó para comprobar esa ausencia.
- Las pantallas de Administración usan `AdminLayout` completo en React, sin mezclar plantillas Django con islas.

### Pendientes

- [PENDIENTE] Credenciales OAuth de Google, secrets del deploy y dominio.
- [PENDIENTE] Etapa GIS: PostGIS, servidor de mapas y visor.

## 6.4 22/10/2026 — Pruebas de navegador y capturas

*Vazquez Maximo Ezequiel · Decisiones: ADR-0007*

### Objetivo

Integrar Playwright para probar la aplicación en el navegador y generar capturas para la bitácora y el informe.

### Trabajo realizado

- `e2e/`: Playwright 1.63 con Chromium, servidor propio en el puerto 8030 y base `gis_tpi_e2e` creada automáticamente (`preparar_e2e`).
- Login de prueba sin Google: `reiniciar_e2e` deja un usuario conocido y `sesion_e2e` guarda su sesión como `storageState`. Ambos viven en `apps/e2e`, que solo se instala con `config.settings.e2e`.
- Nueve pruebas: inicio (globo, botón de Google, consignas, celular sin scroll horizontal, tema oscuro persistente) y acceso (redirección al login, sin alta con contraseña, panel con sesión, ir a Administración y cierre de sesión).
- Capturas reproducibles en `docs/capturas/` (inicio, login y panel; claro, oscuro y celular).
- Workflow `3-pruebas-navegador.yaml`, solo manual.

### Verificación

- `pnpm --dir e2e probar`: 9 pruebas en verde.
- Capturas revisadas a mano en claro, oscuro y celular.

### Problemas y soluciones

- En las capturas el globo salía como un disco negro: la GPU por software del modo headless (SwiftShader) no renderiza bien cobe. Con la GPU real (`--use-angle=d3d11` en Windows) se ve correctamente; la app en un navegador normal no tenía el problema.
- La prueba de cierre de sesión invalidaba la sesión compartida: ahora crea una sesión propia.

## 6.5 29/10/2026 — GeoServer en Docker y visor con OpenLayers

*Vazquez Maximo Ezequiel · Decisiones: ADR-0008, ADR-0009*

### Objetivo

Elegir el servidor de mapas y la biblioteca de mapas del visor, levantar el servidor en Docker local y armar la primera versión del visor.

### Trabajo realizado

- Se eligieron GeoServer y OpenLayers, los dos recomendados en la clase de Sistemas de Información Geográfica (ADR-0008 y ADR-0009).
- Servicio `geoserver` en `docker-compose.yml`: imagen `docker.osgeo.org/geoserver:2.27.2`, CORS habilitado, sin datos de ejemplo y volumen `datos_geoserver`. Consola en `http://localhost:8085/geoserver` (usuario `admin`, contraseña por `GEOSERVER_ADMIN_PASSWORD`).
- Espacio de trabajo `ign` creado por la API REST de GeoServer.
- Variables `GEOSERVER_URL` y `GEOSERVER_WORKSPACE` en `config/settings/base.py` y `.env.example`.
- Pantalla Administración → Visor (`/administracion/visor/`): mapa de OpenLayers 10.6.1 con fondo Argenmap del IGN (claro u oscuro según el tema), vista inicial en el Chaco, zoom, barra de escala, lista de capas leída del `GetCapabilities` de WMS con un interruptor por capa y la leyenda (`GetLegendGraphic`) de cada capa encendida. Si GeoServer no responde o no hay capas, lo indica.
- Tests de Django del visor: redirección sin sesión y datos de GeoServer con sesión.

### Verificación

- `ruff check .`, tests de Django (13), `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- `GetCapabilities` del espacio `ign` responde 200 con el encabezado CORS `Access-Control-Allow-Origin: *`.
- No se revisó el visor en el navegador ni se agregaron pruebas de Playwright.

### Problemas y soluciones

- El puerto 8080 ya estaba ocupado por otro contenedor de la máquina: GeoServer se publica en el 8085 (configurable con `GEOSERVER_PORT`).
- Los tiles de OpenStreetMap respondían 403 "Access blocked": sus servidores exigen el encabezado `Referer` y Django no lo envía a otros sitios (`SECURE_REFERRER_POLICY = same-origin`). Se probó CARTO, pero en el navegador pidió clave de API. El fondo quedó en Argenmap, el mapa base público del IGN: no pide clave y es la misma fuente que las capas del TPI.

### Pendientes

- Cargar las capas del SIG IGN 250 en PostGIS (a.1) y publicarlas en el espacio `ign`.
- Visor: consulta por punto y rectángulo, medición de distancias y carga de elementos (WFS-T).
- Desplegar GeoServer en el VPS.

# 7 Riesgos y pendientes

## 7.1 Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026) con PostGIS, servidor de mapas y visor sin empezar | Alto | Priorizar la carga de capas y el servidor OGC antes que funciones extra del visor |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google y del VPS | Medio | Solo en secrets de GitHub y `.env` local; nunca en el repositorio |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## 7.2 Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- [PENDIENTE] Cargar los secrets del deploy (`DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) y registrar la URI de redirección del dominio en Google.
- [PENDIENTE] Instalar la extensión PostGIS en el PostgreSQL local.
- [PENDIENTE] Definir el dominio de despliegue (nginx y `CSRF_TRUSTED_ORIGINS`).
- [PENDIENTE] Publicar las capas del IGN en GeoServer (espacio de trabajo `ign`) una vez cargadas en PostGIS.
- [PENDIENTE] Desplegar GeoServer en el VPS (manifiesto k8s) y definir su URL pública.

# 8 Glosario

Tabla: Términos usados en el documento

| Término | Definición |
|---|---|
| ADR | Registro de una decisión de arquitectura: contexto, opciones, decisión y consecuencias |
| CRS | Sistema de referencia de coordenadas (por ejemplo EPSG:4326 o POSGAR 2007) |
| IGN | Instituto Geográfico Nacional; el SIG 250 es su base a escala 1:250.000 |
| MCP | *Model Context Protocol*: permite que un asistente opere QGIS mediante herramientas |
| OGC | *Open Geospatial Consortium*, autor de los estándares WMS y WFS |
| PostGIS | Extensión espacial de PostgreSQL |
| WFS | *Web Feature Service*: publica entidades vectoriales con geometría y atributos |
| WMS | *Web Map Service*: publica mapas como imágenes |
| RN 11 | Ruta Nacional 11, objeto del análisis del punto b |

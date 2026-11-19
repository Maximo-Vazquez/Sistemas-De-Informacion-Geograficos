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
| **Versión/Edición** | 0.14.0 |
| **Fecha de versión** | 19/11/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.14.0 | 19/11/2026 | Análisis de la RN 11 en PostGIS y QGIS con resultados validados (ADR-0017); Resultados en el panel y en el visor (tema Obra RN 11); Informe del punto b en PDF con figuras, tablas y referencias, y video explicativo |
| 0.13.0 | 19/11/2026 | Unión en develop de las ramas del visor, la carga IGN y la simbología; Visor con catálogo de capas, orden arrastrable, globo, detalle y tabla de atributos; Carga de elementos por WFS-T a través de Django en elementos_relevados (ADR-0016); Carga única con cargar_capas_ign.py y simbología de las 47 capas (ADR-0015); Django se ejecuta con runserver; se retiran el Dockerfile y el contenedor web |
| 0.12.0 | 19/11/2026 | Simbología por clases de las 47 capas IGN generada por script (ADR-0014); Leyenda del visor transparente y con el color de texto del tema; Consigna a.3 completa |
| 0.11.0 | 19/11/2026 | Alta de geometrías y atributos en la capa vectorial Relevamientos; Retiro de la configuración de despliegue remoto y actualización del arranque local |
| 0.10.0 | 17/11/2026 | Integración de la rama del visor con búsqueda y grupos de capas; Incorporación de medición de distancias y consultas por punto y rectángulo; Actualización de verificaciones y pendientes de las funciones del visor |
| 0.9.0 | 13/11/2026 | Propuesta de aplicación, GeoServer y PostGIS compartidos (ADR-0011); Aclaración de la carga inicial de capas y del acceso sin ZIP para usuarios del visor |
| 0.8.0 | 13/11/2026 | Inventario de las 47 capas, sus geometrías, tablas y cantidades; Resumen de los cambios realizados y guía para reproducir la carga en equipo |
| 0.7.0 | 13/11/2026 | Carga de las 47 capas IGN y sus 570.443 elementos en PostGIS (ADR-0010); Publicación en GeoServer y verificación individual de WMS, WFS y leyendas; Scripts y documentación para reproducir la importación y la publicación local |
| 0.6.1 | 12/11/2026 | Corrección del arranque local para servir los archivos estáticos desde Compose; Confirmación del usuario del acceso autenticado al visor y visualización del mapa base |
| 0.6.0 | 12/11/2026 | Configuración de credenciales OAuth reales en el entorno local y el contenedor Django; Verificación del inicio OAuth por POST con CSRF y redirección a Google |
| 0.5.0 | 12/11/2026 | Revisión de cumplimiento del apartado a con evidencia de código y servicios locales; Guía de configuración OAuth de Google y aclaración del entorno Docker; Creación del espacio local ign y comprobación de servicios WMS y WFS sin capas |
| 0.4.0 | 29/10/2026 | GeoServer en Docker como servidor de mapas (ADR-0008); OpenLayers y primera versión del visor (ADR-0009) |
| 0.3.0 | 22/10/2026 | Pruebas de navegador con Playwright y capturas reproducibles; ADR-0007 |
| 0.2.0 | 22/10/2026 | Acceso a Administración para cualquier cuenta de Google; Base local gis_tpi y runserver que compila el frontend; Dependencias unificadas en requirements.txt y logo de la UTN; Globo 3D en la pantalla de inicio; Logo del equipo y botón estándar de Google |
| 0.1.0 | 22/10/2026 | Creación del documento; Registro de la configuración de QGIS MCP y del mapa del Chaco; Base Django del proyecto y ADR-0001 a ADR-0006 |

<!-- cuerpo -->

# 1 Introducción

## 1.1 Propósito

Este documento registra el desarrollo del Trabajo Práctico Integrador (TPI) de Sistemas de Información Geográfica: qué se hizo en cada sesión, qué decisiones técnicas se tomaron y por qué, con qué tecnologías y en qué estado está cada consigna. Se actualiza al cierre de cada sesión de trabajo y sirve como base del informe que pide la consigna b.

## 1.2 Alcance

Cubre la aplicación web del proyecto (Django y React), los servicios locales (PostgreSQL, PostGIS y GeoServer) y el trabajo de análisis y cartografía con QGIS. Incluye referencias al informe del punto b y al mapa del punto c.

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
- Procesos reproducibles mediante Docker Compose local, comprobaciones de calidad y análisis con QGIS automatizado por scripts y MCP.
- Trazabilidad: cada decisión y cada paso queda en esta bitácora.

# 3 Arquitectura y stack tecnológico

## 3.1 Vista general

Django sirve las páginas y monta pantallas React compiladas con Vite. PostgreSQL guarda los datos de la aplicación. Un servicio PostGIS separado guarda las capas IGN y la capa editable `elementos_relevados`; GeoServer las publica por WMS y WFS y recibe las altas por WFS-T a través de Django (ADR-0016).

El TPI se ejecuta localmente (ADR-0012): `docker compose up -d db postgis geoserver` levanta las bases y el servidor de mapas, y Django corre en la máquina con `python manage.py runserver`, que migra, compila el frontend y sirve los estáticos.

## 3.2 Stack actual

Tabla: Tecnologías en uso

| Componente | Tecnología | Versión | Uso |
|---|---|---|---|
| Backend | Django | 5.2.18 | Aplicación web, vistas y administración |
| Autenticación | django-allauth (Google) | 65.20.1 | Login con Google, sin contraseñas |
| Base de datos | PostgreSQL | 17 | Cuentas y sesiones |
| Driver | psycopg | 3.3.6 | Conexión Django–PostgreSQL |
| Frontend | React + TypeScript | 19.3 / 7.0 | Pantallas montadas por Django |
| Build | Vite + Tailwind CSS | 8.3 / 4.3 | Compilación y estilos |
| Componentes | shadcn/ui (Base UI) + coss | 4.21 / 1.8 | Biblioteca de componentes de UI |
| Gráficos | Recharts | 3.8 | Paneles de Administración |
| Globo 3D | Magic UI Globe (cobe, WebGL) | 0.6 | Globo interactivo del inicio, centrado en el Chaco |
| Calidad | Ruff | 0.17.2 | Estilo y complejidad ciclomática (≤ 10) |
| Contenedores | Docker Compose | — | PostgreSQL, PostGIS y GeoServer locales |
| CI | GitHub Actions | — | Calidad, bitácora y pruebas de navegador |
| Análisis SIG | QGIS + QGIS MCP | 4.2.2 / 0.14.1 | Análisis del punto b y mapa del punto c |
| Documentación | Python + Markdown + WeasyPrint | 70.0 | Esta bitácora en PDF |
| Pruebas de navegador | Playwright (Chromium) | 1.63 | Pruebas de flujos y capturas de pantalla |
| Base espacial | PostGIS (Docker) | 17-3.5 | 47 capas del SIG IGN 250 y `elementos_relevados` (ADR-0015) |
| Carga de capas | GDAL ogr2ogr (Docker) | 3.11.3 | Shapefiles a PostGIS (`scripts/cargar_capas_ign.py`) |
| Servidor de mapas | GeoServer (Docker) | 2.27.2 | Servicios WMS y WFS de las capas (ADR-0008) |
| Biblioteca de mapas | OpenLayers | 10.6.1 | Visor web de Administración (ADR-0009) |
| Listas ordenables | dnd-kit | 6.3.1 | Orden de las capas en el visor |
| Análisis espacial | SQL de PostGIS + Procesamiento de QGIS (PyQGIS) | 3.5 / 4.2.2 | Punto b: traza, áreas, población y puentes (ADR-0017) |
| Estilos de capas | SLD 1.0 (`scripts/simbologia_ign.py`) | — | Simbología y leyenda por clases de las 47 capas (ADR-0014) |

## 3.3 Componentes previstos

- Mapa A4 del punto c a partir de las capas `rn11_*` del esquema `analisis`.

# 4 Estado de las consignas del TPI

Avance de cada consigna de `docs/tpi/practico.pdf` al cierre de esta versión.

Tabla: Estado de las consignas del TPI

| Consigna | Descripción | Estado | Referencia |
|---|---|---|---|
| a.1 | Servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250 | Completa | ADR-0003, ADR-0015 |
| a.2 | Servidor de mapas con servicios OGC (WMS y WFS) | Completa | ADR-0008 |
| a.3 | Visor web con navegación, capas, leyenda, escala, consultas, medición y carga de elementos por WFS-T | Completa | ADR-0009, ADR-0014, ADR-0016 |
| b | Análisis de la RN 11 en el Chaco (km, población a 10 y 20 km, puentes) e informe | Completa | ADR-0006, ADR-0017 |
| c | Mapa A4 en PDF con la traza, áreas de influencia, puentes y accidentes naturales | Pendiente | ADR-0006 |

# 5 Registro de decisiones (ADR)

Cada decisión técnica sigue el formato MADR: contexto, opciones consideradas, decisión y consecuencias.

Tabla: Resumen de decisiones

| ADR | Decisión | Estado | Fecha |
|---|---|---|---|
| ADR-0001 | Django con allauth y login de Google estándar | aceptada | 22/10/2026 |
| ADR-0002 | Frontend React con shadcn (Base UI) y coss | aceptada | 22/10/2026 |
| ADR-0003 | PostgreSQL desde el inicio, PostGIS en la etapa siguiente | aceptada | 22/10/2026 |
| ADR-0004 | Despliegue en Kubernetes (k3s) en VPS con imágenes en GHCR | reemplazada | 22/10/2026 |
| ADR-0005 | Bitácora generada desde Markdown con Python y WeasyPrint | aceptada | 22/10/2026 |
| ADR-0006 | QGIS automatizado con QGIS MCP para análisis y cartografía | aceptada | 24/09/2026 |
| ADR-0007 | Playwright para pruebas de navegador y capturas de pantalla | aceptada | 22/10/2026 |
| ADR-0008 | GeoServer como servidor de mapas WMS/WFS | aceptada | 29/10/2026 |
| ADR-0009 | OpenLayers como biblioteca de mapas del visor | aceptada | 29/10/2026 |
| ADR-0010 | PostGIS dedicado para las capas IGN en desarrollo | reemplazada | 13/11/2026 |
| ADR-0011 | Propuesta de aplicación, GeoServer y PostGIS compartidos | descartada | 13/11/2026 |
| ADR-0012 | Ejecución local del TPI | aceptada | 19/11/2026 |
| ADR-0013 | Alta en la capa vectorial Relevamientos | reemplazada | 19/11/2026 |
| ADR-0014 | Simbología de las capas IGN en SLD generada por script | aceptada | 19/11/2026 |
| ADR-0015 | PostGIS en Docker y carga única de las capas del SIG IGN 250 | aceptada | 19/11/2026 |
| ADR-0016 | Carga de elementos por WFS-T a través de Django en una capa de PostGIS | aceptada | 19/11/2026 |
| ADR-0017 | Método del análisis de la RN 11 (punto b) | aceptada | 19/11/2026 |

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

*Estado: reemplazada · Fecha: 22/10/2026*

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
- Primera versión: sin mapa de fondo externo (las capas del IGN hacen de base; arranca con `provincias`), vista inicial en el Chaco, zoom, escala, lista de capas leída del `GetCapabilities` con interruptores y leyenda por capa.
- Pendiente: consulta por punto y rectángulo, medición y carga de elementos.

## 5.10 ADR-0010 — PostGIS dedicado para las capas IGN en desarrollo

*Estado: reemplazada · Fecha: 13/11/2026*

### Contexto

El proyecto ya tiene una base PostgreSQL con cuentas y sesiones de Django. También se encontró una instalación de laboratorio con cinco capas y una configuración de GeoServer independientes. El ZIP entregado para el TPI contiene 47 shapefiles nacionales en WGS 84; sus geometrías deben almacenarse en PostGIS y publicarse por WMS y WFS.

### Opciones consideradas

- Sustituir la imagen de la base de Django por PostGIS y reutilizar su volumen existente.
- Usar directamente la base y el GeoServer del laboratorio anterior.
- Crear un servicio PostGIS propio para las capas del proyecto y conectarlo a GeoServer, conservando las bases existentes.

### Decisión

Agregar el servicio `gisdb` con `postgis/postgis:17-3.5` y el volumen `datos_gis`. Django sigue usando `db` para sus cuentas; GeoServer usa la red de Compose para conectarse a `gisdb`. Se cargan las capas completas del ZIP en el esquema `ign`, con SRID 4326, mediante GDAL. Un almacén nuevo `sig_ign2011` las publica en el espacio `ign` sin alterar los almacenes previos.

Los scripts de importación y publicación documentan el procedimiento. La importación verifica los conteos de cada tabla respecto del ZIP y registra el hash y el catálogo de origen. Los nombres de capas que coinciden con otras publicaciones reciben el prefijo `sig2011_` para evitar colisiones.

### Consecuencias

- Las cuentas de Django y las capas del IGN tienen volúmenes independientes. La imagen contiene el software; los datos cargados persisten en `datos_gis`.
- El GeoServer local depende de que `gisdb` esté saludable. La publicación anterior del laboratorio conserva su conexión y sus datos originales.
- Las capas mantienen coordenadas geográficas EPSG:4326. Los cálculos métricos y buffers del TPI deben usar un CRS proyectado apropiado.
- Django todavía no tiene una conexión GeoDjango al nuevo PostGIS ni cálculos para el panel. Estos trabajos continúan pendientes.
- La etiqueta de la imagen PostGIS utilizada es `linux/amd64`; en este equipo ARM se ejecuta mediante la emulación de Docker Desktop.

## 5.11 ADR-0011 — Propuesta de aplicación, GeoServer y PostGIS compartidos

*Estado: descartada · Fecha: 13/11/2026*

### Contexto

La instalación actual carga las capas IGN en un volumen PostGIS local y las publica en un GeoServer local. El repositorio contiene los scripts y el catálogo, pero no el ZIP ni los datos guardados en los volúmenes de Docker. Una persona que prepare una instalación local independiente necesita cargar las capas o contar con una copia de la base.

La consigna pide una base de datos espacial, un servidor de mapas con WMS y WFS y un visor web. No exige que cada usuario descargue las capas ni especifica que el sistema deba estar publicado en internet.

### Opciones consideradas

- Cada integrante prepara y mantiene su propia base PostGIS y su propio GeoServer.
- El equipo dispone de una aplicación y servicios SIG compartidos; las personas acceden al visor desde su navegador.
- Se utiliza un entorno compartido para ver y presentar el proyecto, y cada integrante puede crear una instalación local independiente cuando necesite desarrollar o probar cambios.

### Decisión

**Propuesta para evaluar con el equipo:** disponer de una aplicación compartida y un GeoServer conectado a una base PostGIS compartida. Las capas se cargarían una vez en esa base mediante un proceso inicial por definir, o se restaurarían desde una copia ya preparada. Después, quienes usen el visor accederían por navegador sin descargar el ZIP.

La propuesta admite instalaciones locales para desarrollo y pruebas. No implica que el equipo ya haya elegido esta alternativa ni que esté implementada o desplegada.

### Consecuencias

- La aplicación, GeoServer y los datos espaciales deben estar disponibles en un entorno accesible para las personas que usarán el visor. El navegador actual solicita los servicios de GeoServer directamente, por lo que su URL debe ser accesible desde ese navegador; `localhost` solo apunta a la propia computadora.
- Hay que definir dónde guardar de forma persistente los datos de PostGIS y la configuración de GeoServer, y cómo inicializarlos y recuperarlos. Una imagen Docker de la aplicación no incluye automáticamente las capas cargadas en un volumen local.
- Para el acceso compartido se deben definir las direcciones de la aplicación y de GeoServer. Si se mantiene el ingreso con Google, también habrá que registrar el callback correspondiente y configurar los orígenes necesarios para los servicios web.
- El equipo debe acordar el entorno, quién lo administra y cómo se conservarán los datos y las credenciales. La disponibilidad del entorno compartido condicionará el acceso al visor.
- La instalación local y los scripts de carga existentes seguirían siendo útiles para pruebas o para preparar los datos iniciales del entorno compartido.

## 5.12 ADR-0012 — Ejecución local del TPI

*Estado: aceptada · Fecha: 19/11/2026 · Reemplaza a ADR-0004*

### Contexto

El equipo decidió ejecutar y presentar el TPI en un entorno local. Django, PostgreSQL, PostGIS y GeoServer ya se pueden iniciar en la computadora de la demostración.

### Opciones consideradas

- Ejecución local con Docker Compose y Django.
- Despliegue del proyecto en un VPS o en un entorno compartido.

### Decisión

La aplicación y los servicios SIG se ejecutan localmente. Docker Compose publica los servicios en la interfaz de loopback. Se retiran los manifiestos de Kubernetes y los workflows de publicación y despliegue. Se conservan las comprobaciones de calidad y las pruebas de navegador.

### Consecuencias

Cada instalación prepara sus volúmenes y carga las capas del IGN con los scripts del proyecto. El acceso con Google y el mapa base Argenmap siguen usando sus servicios externos.

## 5.13 ADR-0013 — Alta en la capa vectorial Relevamientos

*Estado: reemplazada · Fecha: 19/11/2026*

### Contexto

La consigna a.3 admite ingresar una geometría y sus atributos en una capa creada para ese fin o en una capa SIG IGN 250.

### Opciones consideradas

- Editar una capa SIG IGN 250 mediante WFS transaccional.
- Crear una capa de relevamientos del visor con persistencia a cargo de Django.

### Decisión

El visor incorpora la capa **Relevamientos**, con puntos, líneas y polígonos de un anillo. OpenLayers captura la geometría y la convierte a GeoJSON en EPSG:4326. Django valida el dibujo, el nombre y la descripción, y guarda el alta en el PostgreSQL de la aplicación.

### Consecuencias

El visor carga la capa por GeoJSON y permite consultarla por punto o rectángulo. El alta funciona con la base local de Django y usa una clave de solicitud para que un reintento conserve un único elemento. Las capas del IGN se siguen sirviendo a través de GeoServer.

## 5.14 ADR-0014 — Simbología de las capas IGN en SLD generada por script

*Estado: aceptada · Fecha: 19/11/2026*

### Contexto

La consigna a.3 pide mostrar la leyenda de las capas con las clases de la simbología. Las 47 capas se publicaron con los estilos genéricos de GeoServer (`line`, `point`, `polygon`), cuya leyenda muestra un único símbolo sin clases. Además, en la vista de toda la provincia los 92.910 caminos de tierra tapaban el resto del mapa.

### Opciones consideradas

- Diseñar cada estilo a mano en la consola de GeoServer.
- Escribir 47 archivos SLD a mano y versionarlos.
- Definir la simbología como datos en Python y generar los SLD con un script que los cargue por la API REST.

### Decisión

La simbología se define en `scripts/simbologia_ign.py` y `scripts/estilos_ign.py` la carga en el espacio `ign` y la asigna como estilo por defecto de cada capa. Ocho capas se clasifican por un atributo con valores comprobados en PostGIS: red vial y vías secundarias por `tipo`, localidades por `tipo`, cursos de agua por `regimen`, espejos de agua, curvas de nivel, límites y puentes por `tipo`. Las demás reciben un símbolo propio según su tema. Las clases más densas se dibujan solo desde cierta escala, indicada en el título de la regla.

### Consecuencias

- La leyenda del visor muestra las clases con títulos en castellano, sin cambios en el frontend más allá del color del texto según el tema.
- Cualquier instalación aplica la misma simbología con un comando, después de `publicar_ign.py`. La consola de GeoServer no es la fuente de verdad: un cambio hecho a mano se pierde al volver a correr el script.
- Los colores de la simbología viven en el script, porque los dibuja GeoServer y no el frontend.

## 5.15 ADR-0015 — PostGIS en Docker y carga única de las capas del SIG IGN 250

*Estado: aceptada · Fecha: 19/11/2026 · Reemplaza a ADR-0010*

### Contexto

La consigna a.1 pide un servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250. El grupo resolvió la carga dos veces en ramas paralelas. Una versión usaba el servicio `postgis` (base `sig_ign`, puerto 5433) y `scripts/cargar_capas_ign.py`. La otra usaba el servicio `gisdb` (base `visor_ign`, esquema `ign`, puerto 5434) y tres scripts: `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. Al unir las ramas en `develop` había que elegir una.

### Opciones consideradas

- Mantener `gisdb` y los tres scripts. Requiere `ogr2ogr` instalado en la máquina.
- Mantener `postgis` y `cargar_capas_ign.py`, y sumarle la simbología de `simbologia_ign.py` (ADR-0014).

### Decisión

- Servicio `postgis` en `docker-compose.yml` con la imagen `postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433 en el host y volumen `datos_postgis`. La base de la aplicación Django (`db`) no cambia.
- Un solo comando carga y publica todo: `python scripts/cargar_capas_ign.py`. Usa `ogr2ogr` de la imagen oficial de GDAL dentro de la red de Compose, publica las 47 capas en GeoServer (almacén `sig_ign`, espacio `ign`), crea la capa editable `elementos_relevados` (ADR-0016) y aplica los estilos. Con `--solo-publicar` rehace la publicación y los estilos sin recargar las tablas.
- Los estilos de las 47 capas los genera `scripts/simbologia_ign.py` (ADR-0014). El script de carga los sube con el nombre `ign_<tabla>`. La capa editable usa `geoserver/estilos/visor_elementos_relevados.sld`.

### Consecuencias

- No hay que instalar PostGIS ni GDAL: alcanza con Docker.
- Se retiran `gisdb`, `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. `docs/tpi/catalogo_ign.json` queda como inventario de referencia.
- Las tablas usan nombres en minúscula y sin acentos (`Líneas_de_Conducción_Ene` → `lineas_de_conduccion_ene`). Las columnas conservan sus acentos (`régimen`, `precisión`), así que la clasificación de cursos de agua usa `régimen`.
- Quien tenga cargado el volumen `datos_gis` de la otra rama tiene que cargar las capas en `postgis` con el script; el volumen viejo se puede borrar.

## 5.16 ADR-0016 — Carga de elementos por WFS-T a través de Django en una capa de PostGIS

*Estado: aceptada · Fecha: 19/11/2026 · Reemplaza a ADR-0013*

### Contexto

La consigna a.3 pide cargar elementos nuevos (geometría y atributos) en una capa vectorial. El grupo lo resolvió dos veces en ramas paralelas: con WFS-T sobre una capa de PostGIS publicada en GeoServer, y con la capa Relevamientos guardada como GeoJSON en el PostgreSQL de Django (ADR-0013). Esa segunda opción dejaba abierta la duda de si la capa tenía que estar en PostGIS y servirse por GeoServer. GeoServer exige credenciales de administración para escribir por WFS-T.

### Opciones consideradas

- WFS-T directo desde el navegador con escritura anónima habilitada en GeoServer.
- WFS-T armado en el navegador y reenviado por Django con las credenciales de GeoServer.
- Guardar el elemento en el PostgreSQL de Django, sin WFS-T (ADR-0013).

### Decisión

- El visor arma la transacción con `ol/format/WFS` y la envía a `POST /administracion/visor/transaccion/` (sesión y CSRF). `apps/administracion/services.py` acepta solo `Insert` en las capas de `GEOSERVER_CAPAS_EDITABLES` y la reenvía a GeoServer con `GEOSERVER_ADMIN_USER`/`GEOSERVER_ADMIN_PASSWORD`. Rechaza `Update`, `Delete`, otras capas y XML inválido.
- La capa editable es `elementos_relevados` (PostGIS, geometría genérica, campos nombre, categoría, descripción, responsable y fecha). La crea `scripts/cargar_capas_ign.py` y su estilo está en `geoserver/estilos/visor_elementos_relevados.sld`. No se tocan las capas del IGN.

### Consecuencias

- La clave de GeoServer nunca llega al navegador y el visor solo puede agregar, no modificar ni borrar.
- La capa nueva es una capa más de GeoServer: se ve por WMS, se consulta por WFS y se analiza en PostGIS junto con las del IGN.
- Se retiran el modelo `ElementoVectorial`, su formulario, su migración y la ruta `/administracion/visor/elementos/`.

## 5.17 ADR-0017 — Método del análisis de la RN 11 (punto b)

*Estado: aceptada · Fecha: 19/11/2026*

### Contexto

La consigna b pide el largo de la RN 11 en el Chaco, la población a 10 km y de 10 a 20 km (categorías excluyentes) y los puentes que cruzan la traza, con un informe que muestre los pasos. Las capas del SIG IGN 250 están en coordenadas geográficas. La red vial tiene dos rutas con el número 11. La capa de puentes son puntos sin el camino al que pertenecen. Dentro de los 20 km también hay localidades de otras provincias, entre ellas la ciudad de Corrientes.

### Opciones consideradas

- Hacer el análisis solo en QGIS, a mano, con capturas.
- Hacerlo en PostGIS con SQL, repetirlo en QGIS para validar y generar el informe a partir de las tablas resultantes.
- Para los puentes: contar los puntos a cierta distancia de la traza, o pedir además que el camino más cercano sea la RN 11.
- Para la población: incluir todas las localidades dentro de los buffers, o solo las del Chaco.

### Decisión

- El análisis se calcula en PostGIS (`scripts/analisis_rn11.sql` y `analisis_rn11.py`, esquema `analisis`) y se repite con algoritmos de Procesamiento de QGIS (`scripts/analisis_rn11_qgis.py`), que compara cada número con PostGIS.
- Las medidas se hacen en POSGAR 2007 faja 5 (EPSG:5347).
- La traza se forma con los tramos `nro_ruta = '11'` y `administra = 'Nacional'` (la RP 11 es otra ruta), recortados al polígono del Chaco.
- Las categorías se arman con un buffer de 10 km y un anillo de 20 km menos 10 km, recortados al Chaco. La población es la suma de `canthab` (Censo 2001) de las localidades de cada área.
- Solo se cuentan las localidades cuyo atributo `provincia` es Chaco; las de otras provincias se informan aparte. Se usa el atributo y no el polígono porque, sobre el río Bermejo, General Lucio V. Mansilla (Formosa) cae dentro del polígono del Chaco.
- Un puente es de la RN 11 si está a 500 m o menos de la traza y su camino más cercano es la RN 11. Se controla contra los cruces de la traza con los cursos de agua.
- El informe (`scripts/generar_informe_b.py`) toma sus números de `analisis.rn11_resumen`. Lo mismo hacen el panel de Administración y el video.

### Consecuencias

- Resultado: 172,39 km; 360.983 habitantes hasta 10 km y 26.080 de 10 a 20 km; 21 puentes. PostGIS y QGIS coinciden en los seis valores.
- El análisis se repite con dos comandos y alimenta el visor (capas `rn11_*` en GeoServer), el panel y el informe sin copiar números a mano.
- Limitaciones aceptadas: población del Censo 2001, solo 15 de 36 localidades del Chaco con dato, localidades representadas como puntos, y el cruce del Río de Oro sin punto de puente en la capa del IGN.

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

## 6.5 29/10/2026 — PostGIS en Docker y carga de las capas del IGN

*Vazquez Maximo Ezequiel · Decisiones: ADR-0010*

### Objetivo

Levantar una base espacial en Docker, cargar todas las capas del SIG IGN 250 y publicarlas en GeoServer.

### Trabajo realizado

- Servicio `postgis` en `docker-compose.yml` (`postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433). GeoServer arranca después de que PostGIS está sano.
- `scripts/cargar_capas_ign.py`: descomprime `docs/tpi/sig_ign.zip` (la carpeta extraída no se versiona), carga cada shapefile con `ogr2ogr` (imagen `ghcr.io/osgeo/gdal:ubuntu-small-3.11.3`) en EPSG:4326, geometrías multiparte, columna `geom` e índice espacial, y publica cada tabla en GeoServer.
- Se cargaron y publicaron las 47 capas en el espacio `ign` (almacén `sig_ign`).

### Verificación

- 47 tablas espaciales en `public`. Ejemplos: `red_vial` 118.955 registros, `localidades` 10.804 y `puente_red_vial_puntos` 3.852.
- Acentos correctos en atributos y nombres de columnas (por ejemplo "Colonia Peñas Blancas", `precisión`).
- WMS `GetCapabilities` lista las 47 capas; `GetMap` de `provincias` y `red_vial` sobre el Chaco devuelve una imagen PNG.
- WFS `GetFeature` en GeoJSON responde para `puente_red_vial_puntos`.
- No se revisó el visor en el navegador con las capas cargadas.

### Problemas y soluciones

- Los `.dbf` del IGN están en Windows-1252 aunque `Provincias.cpg` declara UTF-8: se carga todo con `SHAPE_ENCODING=CP1252` (Provincias no tiene acentos, así que no la afecta).
- El puerto 5432 lo usa el PostgreSQL local: PostGIS se publica en el 5433.

### Pendientes

- Estilos propios en GeoServer: hoy cada capa usa el estilo por defecto (punto, línea o polígono).
- `localidades.canthab` trae la cantidad de habitantes: base para la población a 10 y 20 km del punto b.

## 6.6 29/10/2026 — GeoServer en Docker y visor con OpenLayers

*Vazquez Maximo Ezequiel · Decisiones: ADR-0008, ADR-0009*

### Objetivo

Elegir el servidor de mapas y la biblioteca de mapas del visor, levantar el servidor en Docker local y armar la primera versión del visor.

### Trabajo realizado

- Se eligieron GeoServer y OpenLayers, los dos recomendados en la clase de Sistemas de Información Geográfica (ADR-0008 y ADR-0009).
- Servicio `geoserver` en `docker-compose.yml`: imagen `docker.osgeo.org/geoserver:2.27.2`, CORS habilitado, sin datos de ejemplo y volumen `datos_geoserver`. Consola en `http://localhost:8085/geoserver` (usuario `admin`, contraseña por `GEOSERVER_ADMIN_PASSWORD`).
- Espacio de trabajo `ign` creado por la API REST de GeoServer.
- Variables `GEOSERVER_URL` y `GEOSERVER_WORKSPACE` en `config/settings/base.py` y `.env.example`.
- Pantalla Administración → Visor (`/administracion/visor/`): mapa de OpenLayers 10.6.1 sin mapa de fondo externo (se probaron OpenStreetMap, CARTO y Argenmap; ver problemas), vista inicial en el Chaco, zoom, barra de escala, lista de capas leída del `GetCapabilities` de WMS con un interruptor por capa y la leyenda (`GetLegendGraphic`) de cada capa encendida. Si GeoServer no responde o no hay capas, lo indica.
- Tests de Django del visor: redirección sin sesión y datos de GeoServer con sesión.

### Verificación

- `ruff check .`, tests de Django (13), `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- `GetCapabilities` del espacio `ign` responde 200 con el encabezado CORS `Access-Control-Allow-Origin: *`.
- No se revisó el visor en el navegador ni se agregaron pruebas de Playwright.

### Problemas y soluciones

- El puerto 8080 ya estaba ocupado por otro contenedor de la máquina: GeoServer se publica en el 8085 (configurable con `GEOSERVER_PORT`).
- Los tiles de OpenStreetMap respondían 403 "Access blocked": sus servidores exigen el encabezado `Referer` y Django no lo envía a otros sitios (`SECURE_REFERRER_POLICY = same-origin`). Se probó CARTO, pero en el navegador pidió clave de API. Después se pasó a Argenmap del IGN y, por último, se quitó el fondo: las 47 capas del IGN ya forman el mapa base y la consigna no pide un fondo externo. El visor arranca con `provincias` encendida.

### Pendientes

- Cargar las capas del SIG IGN 250 en PostGIS (a.1) y publicarlas en el espacio `ign`.
- Visor: consulta por punto y rectángulo, medición de distancias y carga de elementos (WFS-T).
- Desplegar GeoServer en el VPS.

## 6.7 29/10/2026 — Visor completo con las funciones de la consigna a.3

*Vazquez Maximo Ezequiel · Decisiones: ADR-0011*

### Objetivo

Rehacer el visor para cumplir todas las funciones de la consigna a.3, con cada herramienta separada y una interfaz fácil de usar.

### Trabajo realizado

- Visor reorganizado en `frontend/src/features/admin-visor/`: `mapa/` (mapa, capas WMS, capas propias, estilos y estado), `herramientas/` (un hook por herramienta), `ui/` (barra, paneles y controles) y `ogc.ts` (WMS, WFS y WFS-T).
- Barra de herramientas a la izquierda del mapa, una activa por vez y con atajo de teclado: Navegar (V), Consultar punto (I), Consultar área (R), Medir distancia (M) y Agregar elemento (A). Esc vuelve a Navegar.
- Panel lateral con pestañas: **Capas** (47 capas agrupadas por tema, búsqueda sin acentos, interruptor y opacidad por capa) y **Leyenda** (clases de cada capa encendida con `GetLegendGraphic`). En el celular se abre como panel deslizable.
- Consulta por punto (`GetFeatureInfo` de todas las capas encendidas) y por área (`GetFeature` WFS con filtro BBOX, hasta 50 por capa con el total). Los resultados se resaltan en el mapa; al elegir uno se encuadra y se ven sus atributos.
- Medición geodésica de varios tramos con la distancia en vivo junto al puntero, lista de mediciones y total.
- Carga de elementos: punto, línea o polígono, con vértices editables antes de guardar y formulario armado desde `DescribeFeatureType`. Se guarda por WFS-T a través de Django (ADR-0011).
- Controles de zoom y "Ver todo el Chaco"; barra de estado con escala gráfica y numérica y coordenadas del puntero.
- Estilos SLD con clases para red vial, localidades, cursos y espejos de agua, puentes, provincias y elementos relevados (`geoserver/estilos/`).
- Capa editable `elementos_relevados` creada y publicada por `scripts/cargar_capas_ign.py`.
- Se quitó el mapa de fondo externo: arrancan encendidas provincias, red vial y localidades.

### Verificación

- Pruebas de navegador `e2e/pruebas/visor.spec.ts` (5): capas y leyenda, consulta por punto, consulta por área, medición e inserción de un punto con atributos, que se borra al terminar. Suite completa: 14 en verde.
- Tests de Django: 19 en verde, con el proxy WFS-T (rechaza borrar, capas no editables y XML inválido; reenvía con credenciales).
- `ruff`, `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- Capturas revisadas en tema claro y oscuro a 1440 × 900. No se revisó a mano en el celular.

### Problemas y soluciones

- GeoServer pide credenciales para escribir por WFS-T: la transacción pasa por Django, que solo permite inserciones en capas editables.
- Los estilos del mapa no pueden escribir colores en las features (`check:colores`): `lib/map-theme.ts` lee los tokens del tema al dibujar.

### Pendientes

- Estilos propios para las otras 41 capas del IGN.
- Las etiquetas de GeoServer tienen halo blanco, que en tema oscuro resalta mucho.

## 6.8 30/10/2026 — Visor - capas en el mapa, catálogo y detalle de elementos

*Vazquez Maximo Ezequiel*

### Objetivo

Simplificar la selección de capas (47 interruptores juntos) y mejorar cómo se ve el detalle de los elementos consultados.

### Trabajo realizado

- Panel de capas reorganizado: muestra solo las **capas en el mapa**, de arriba hacia abajo, con su leyenda, opacidad, ojo para ocultar y botón para quitar. Se reordenan arrastrando (dnd-kit 6.3.1, también con teclado).
- **Catálogo** para agregar capas: diálogo con buscador (`Command` de shadcn), agrupado por tema y con marca de las que ya están en el mapa. Se abre con "Agregar" o con la tecla C.
- **Temas rápidos**: Obra RN 11, Hidrografía, Transporte y Límites cambian las capas del mapa con un clic.
- Nombres legibles para las 47 capas y los atributos del IGN (`catalogo.ts`): por ejemplo `canthab` se muestra como "Habitantes" con separador de miles, y los campos técnicos se ocultan.
- Consulta por punto: **globo** junto al clic con el nombre, la capa y los datos clave; flechas para recorrer los elementos encontrados y "Ver todos los datos" abre el **panel de detalle** (`DetailSheet`, el mismo de Administración) con atributos y ubicación.
- Consulta por área: **tabla de atributos** bajo el mapa, con una pestaña por capa, orden por columna, exportación a CSV y la fila elegida resaltada en el mapa. El nombre abre el detalle.
- Al elegir un resultado, el mapa solo se desplaza si el elemento quedó fuera de la vista; ya no acerca de más.
- `DataTable` compartido: nueva opción `onRowClick` para hacer clic en la fila entera.

### Verificación

- Pruebas de navegador del visor (6): catálogo y leyenda, temas rápidos, globo y detalle, tabla de atributos y detalle, medición y carga de elementos. Suite completa: 15 en verde.
- Tests de Django (19), `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- Capturas revisadas en escritorio, tema claro.

### Problemas y soluciones

- El globo de una consulta por punto quedaba abierto al cambiar de herramienta: los resultados se limpian al elegir otra herramienta y se conservan al volver a Navegar.

### Pendientes

- Revisar el panel de capas en el celular.

## 6.9 12/11/2026 — Configuración local de las credenciales de Google

*Asistencia técnica del proyecto*

### Objetivo

Aplicar el cliente OAuth proporcionado por el usuario para habilitar el acceso con Google en la aplicación local.

### Trabajo realizado

- Se leyó el JSON indicado por el usuario fuera del repositorio. Se validó que fuera un cliente web con ID, secreto y ambos callbacks locales autorizados.
- Se actualizaron únicamente las variables de Google en el `.env` local, ignorado por Git, sin imprimir sus valores. El JSON original no se copió al repositorio.
- Se comprobó que el contenedor Django no tenía variables OAuth que anularan el archivo. Se copió el `.env` a `/app/.env`, con propietario `app` y permisos `600`, y se reinició `visor-sig-web`. Las variables existentes del contenedor conservan prioridad, incluido `DB_HOST=db`.
- `manage.py check` finalizó sin problemas.
- Se probó el flujo HTTP real: GET del formulario, cookie CSRF y POST de inicio de Google con destino al visor. La respuesta fue HTTP 302 hacia Google, con el cliente correcto y `http://localhost:8000/accounts/google/login/callback/` como retorno.
- Se actualizaron la revisión del proyecto, los pendientes y la bitácora.

### Problemas y soluciones

- El archivo `.env` en Windows no era accesible desde el contenedor existente, que no tiene montajes. Se aplicó también dentro del contenedor sin modificar la imagen ni incluir secretos en archivos versionados.
- La verificación solo comprueba el inicio del flujo. No suplanta el ingreso del usuario a Google ni demuestra todavía el intercambio del código por una sesión autenticada.

### Pendientes

- Abrir `http://localhost:8000/administracion/visor/`, iniciar sesión con Google y comprobar el regreso al visor.
- Si se recrea el contenedor, pasar nuevamente las variables mediante `--env-file .env` o un mecanismo de secretos.
- Cargar y publicar las capas del IGN; el login no modifica el catálogo vacío de GeoServer.

## 6.10 12/11/2026 — Corrección de estáticos y confirmación del visor local

*Asistencia técnica del proyecto*

### Objetivo

Resolver la pantalla vacía del inicio y del login, y comprobar el acceso al visor.

### Trabajo realizado

- Se identificó que Gunicorn entregaba el HTML, pero los archivos JavaScript, CSS y el logo devolvían HTTP 404. Los assets sí existían en la imagen.
- Se agregó el servicio opcional `web` al Compose de desarrollo. Usa la imagen de la aplicación, `env_file: .env`, `DB_HOST=db`, `config.settings.local` y `runserver --noreload --skip-frontend-build` en el puerto local 8000. La imagen ya contiene el frontend compilado.
- Se conservó detenido el contenedor manual anterior y se inició el servicio de Compose. PostgreSQL y sus volúmenes no se modificaron.
- Se verificaron inicio, login y confirmación de Google: HTTP 200 y sus siete assets referenciados con HTTP 200 en cada página. El POST OAuth con CSRF continuó respondiendo 302 hacia Google con el cliente y callback correctos. `manage.py check` pasó.
- El usuario confirmó mediante capturas el acceso autenticado al visor y la visualización del fondo Argenmap. La lista de capas continúa vacía.
- Se localizaron cinco shapefiles en `D:/GIS/labhoy/shapes`: red vial, espejos de agua y tres clases de vegetación. No se comprobó su procedencia o correspondencia con el paquete SIG IGN 250 de la consigna; no se importaron ni publicaron.
- Se actualizaron README, arquitectura, revisión, pendientes y bitácora.

### Problemas y soluciones

- El HTTP 200 de una página no asegura que una pantalla React pueda renderizarse. Se verificaron también sus recursos estáticos.
- El intento de capturar el DOM con Edge en modo headless no produjo una salida utilizable. La confirmación visual posterior fue aportada por el usuario.

### Pendientes

- Identificar el paquete SIG IGN 250 correcto, cargar las capas en PostGIS y publicarlas en el espacio `ign` de GeoServer.
- Completar las herramientas pendientes del visor.

## 6.11 12/11/2026 — Revisión de cumplimiento y preparación del acceso con Google

*Asistencia técnica del proyecto*

### Objetivo

Contrastar el proyecto con el apartado a de la consigna y preparar la configuración local de acceso al visor.

### Trabajo realizado

- Se revisaron README, settings, autenticación, vistas, componentes del visor, Docker y estado del TPI. El informe detallado está en `docs/revision-2026-11-12.md`.
- Se comprobó que PostgreSQL no tiene PostGIS ni capas del IGN y que GeoServer no tenía espacios ni capas. Se creó el espacio `ign` que espera el visor.
- WMS 1.3.0 y WFS 2.0.0 respondieron HTTP 200 con capacidades válidas y CORS. El catálogo sigue vacío; a.2 continúa en curso.
- Se creó un `.env` local ignorado por Git con una clave Django aleatoria. No se inventaron credenciales de Google; el usuario confirmó que aún no creó un cliente OAuth.
- Se agregó al README la guía de Google, el tipo de cliente web, los callbacks y la diferencia entre el entorno del host y el del contenedor.
- Se instalaron las dependencias del frontend. La compilación, incluida la comprobación TypeScript, y el chequeo de colores finalizaron correctamente.
- En la imagen existente del contenedor Django pasaron `manage.py check`, los 13 tests y Ruff. Inicio y login respondieron HTTP 200; el visor sin sesión redirigió al login.

### Problemas y soluciones

- Las herramientas Python y Node estaban instaladas fuera del PATH de esta sesión. Se localizó Node y se usó Corepack para instalar el frontend respetando el lockfile.
- La instalación nativa de Python ARM intentó compilar `cryptography` y terminó sin una distribución compatible de `psycopg-binary==3.3.6`. El entorno virtual quedó sin completar. La verificación del backend se realizó en el contenedor existente, que ya dispone de las dependencias.
- El contenedor de Django no monta el código local ni contiene `.env` o variables OAuth. Configurar el archivo en Windows no basta para activar el login en ese contenedor.
- La barra de escala y la URL WFS no constituyen herramientas de medición o edición. Esas funciones continúan pendientes.

### Pendientes

- Crear o reutilizar el cliente OAuth, cargar sus credenciales reales en Django y verificar un login completo. No se realizó una prueba visual autenticada del visor.
- Habilitar PostGIS, cargar las capas IGN, publicarlas y probar interruptores y leyendas con datos reales.
- Implementar consultas por punto y rectángulo, medición y alta de elementos.
- Mantener a.1 pendiente y a.2 y a.3 en curso; revisar también los estados desactualizados del inicio.

## 6.12 13/11/2026 — Carga y publicación de las capas IGN

*Asistencia técnica del proyecto · Decisiones: ADR-0010*

### Objetivo

Comprobar las bases y servicios existentes, ejecutar la aplicación según el README y cargar el ZIP IGN indicado por el usuario.

### Trabajo realizado

- Se inició la aplicación con `docker compose up -d web geoserver`; PostgreSQL, PostGIS y GeoServer quedaron saludables. La base `db` contiene 17 tablas de Django y no tiene PostGIS; el servicio `gisdb` tiene PostGIS 3.5.2 y su propio volumen.
- Se inspeccionó `D:/TPI/sig_ign.zip`: 47 shapefiles con sus componentes y WGS 84; la carpeta interna se llama `SIG_IGN2011`. El archivo comprimido pesa aproximadamente 236,6 MiB.
- Se cargaron las 47 capas en el esquema `ign` del PostGIS del proyecto usando GDAL. Se verificó la cantidad por tabla frente al DBF de origen: 570.443 elementos en total. Las 47 geometrías usan SRID 4326. El catálogo de archivos, conteos y SHA-256 quedó en `docs/tpi/catalogo_ign.json`.
- Se creó el almacén `sig_ign2011` y se publicaron las 47 capas en el espacio `ign` de GeoServer. Se conservaron el almacén del laboratorio y sus cinco capas previas; los nombres nacionales que colisionaban llevan el prefijo `sig2011_`.
- Se comprobaron las 47 capas por WFS (`GetFeature` con conteos iguales al ZIP), WMS (`GetMap` PNG) y `GetLegendGraphic` PNG. Se verificó CORS para el origen local. También se solicitaron geometrías de provincias, localidades, puentes, rutas, espejos de agua y vegetación, y un mapa combinado de las cinco primeras.
- Se documentaron los servicios, el arranque, la importación y la publicación; se agregó la dependencia de GeoServer a `gisdb` y la decisión ADR-0010.
- Pasaron los 13 tests de Django, Ruff, la comprobación TypeScript, la compilación Vite, el control de colores, `manage.py check` y `docker compose config --quiet`.

### Problemas y soluciones

- La presencia de una imagen PostGIS no implicaba datos cargados: el nuevo volumen estaba vacío y la base de Django solo contenía tablas de la aplicación. Se usó un volumen propio para las capas sin sustituir los datos existentes.
- La instalación anterior guardaba cinco capas en un PostGIS de laboratorio. Se agregó un almacén nuevo para el ZIP completo; sus nombres en conflicto se diferenciaron sin alterar la conexión anterior.
- El nombre comunicado del paquete mencionaba 2021, pero la carpeta interna del archivo suministrado indica `SIG_IGN2011`. Se conserva esa identificación, sin afirmar una fecha de actualización distinta.

### Pendientes

- Implementar consultas por punto y rectángulo, medición de distancias y carga de geometrías y atributos en el visor.
- Conectar Django al PostGIS para calcular los indicadores del panel y completar el análisis de la RN 11.
- Provisionar PostGIS y GeoServer en el VPS e identificar las credenciales y conexiones de ese entorno.

## 6.13 13/11/2026 — Documentación para compartir la carga IGN

*Asistencia técnica del proyecto*

### Objetivo

Preparar una explicación de los cambios, las capas cargadas y su reproducción para el equipo.

### Trabajo realizado

- Se creó la rama de trabajo `feature/postgis-capas-ign` a partir de `develop`.
- Se agregó el inventario de 47 capas a las fuentes de la bitácora, con sus nombres, familias de geometría, tablas y cantidades. Los datos provienen del catálogo generado y de las cabeceras de los shapefiles del ZIP usado en la carga.
- Se documentaron los servicios Docker, los scripts de importación y publicación, los cinco nombres diferenciados por colisión y los pasos para reproducir la instalación.
- Se aclaró qué archivos y datos quedan fuera de Git, qué verificaciones se hicieron y qué funcionalidades siguen pendientes.
- Se vinculó el inventario desde el README y se actualizó la versión de esta bitácora.
- Se verificó que las 47 filas del inventario y su suma coinciden con el catálogo, y que los archivos modificados no contienen los valores locales de las credenciales. Pasaron los 13 tests de Django, Ruff, TypeScript, la compilación del frontend, el control de colores y la validación de Docker Compose.

### Problemas y soluciones

- Los nombres publicados para cinco capas dependen de que existan o no capas antiguas con el mismo nombre. La documentación distingue el resultado local de una instalación nueva.
- Los volúmenes Docker y las credenciales locales no viajan con el repositorio. La documentación indica que cada integrante necesita el ZIP y su configuración local.
- La generación del PDF dentro de la imagen de la aplicación falló porque falta la biblioteca del sistema `libgobject-2.0`. Se generó y verificó la versión Markdown de la bitácora, que sí se comparte en el repositorio.

### Pendientes

- Revisar la documentación con el equipo y ejecutar la carga en las demás computadoras según sea necesario.
- Completar las funcionalidades y los análisis SIG pendientes indicados en esta bitácora.

## 6.14 13/11/2026 — Propuesta de despliegue compartido para el visor

*Asistencia técnica del proyecto · Decisiones: ADR-0011*

### Objetivo

Dejar documentada una alternativa para que el equipo y los usuarios consulten las capas IGN sin descargar el ZIP en cada computadora.

### Trabajo realizado

- Se revisaron la consigna, la arquitectura y la documentación de la carga local de las 47 capas.
- Se registró el ADR-0011 con estado `propuesta`: aplicación y GeoServer accesibles desde el navegador, conectados a un PostGIS compartido con las capas cargadas.
- Se documentó que la carga inicial o restauración ocurriría en el servidor y que los usuarios finales no necesitarían el ZIP. Una instalación local independiente seguiría siendo una opción para desarrollo.
- Se enlazó la propuesta desde el README y la sección de arquitectura, y se aclaró la diferencia entre los requisitos de una instalación local y los de un futuro entorno compartido.

### Problemas y soluciones

- El código y las imágenes no incluyen los datos que están en el volumen Docker local. La propuesta deja pendiente definir la persistencia, la carga inicial y la recuperación de PostGIS y de la configuración de GeoServer.
- La configuración actual usa `localhost` para GeoServer. Para un acceso desde otras computadoras habría que definir una dirección accesible para los navegadores y ajustar la configuración correspondiente.

### Pendientes

- Revisar la propuesta con el equipo y decidir si se adopta y dónde se alojaría.
- Si se adopta, definir el entorno, las direcciones, el proceso de carga o restauración inicial, la persistencia y el acceso de usuarios.
- No se implementó ni desplegó la alternativa durante esta sesión.

## 6.15 17/11/2026 — Integración de mejoras del visor

*Asistencia técnica del proyecto*

### Objetivo

Integrar los cambios de la rama de Joaquín en la rama de trabajo que contiene la carga de capas IGN, conservando intacta `develop`.

### Trabajo realizado

- Se integró `feature/visor-buscador-grupos` en `feature/postgis-capas-ign` mediante un avance rápido de `b40b9de` a `984ef06`, sin conflictos.
- Se incorporaron la búsqueda y agrupación de capas, la medición de distancias y las consultas gráficas por punto y rectángulo, junto con las pruebas de navegador aportadas en esa rama.
- Se actualizaron los pendientes para distinguir las funciones implementadas de las que todavía necesitan validación con las capas reales.
- Pasaron la compilación del frontend con comprobación de TypeScript, el control de colores, Ruff y las 13 pruebas de Django. El control orientativo de largo de archivos informó un componente que supera la referencia.

### Problemas y soluciones

- La integración fue posible sin resolver conflictos porque la rama del visor ya incluía el trabajo de carga de capas.
- No se ejecutaron las pruebas de navegador durante esta integración. Las pruebas incorporadas para las herramientas del visor simulan las respuestas de los servicios de mapas.

### Pendientes

- Ejecutar las pruebas de navegador y verificar las herramientas, las leyendas y los interruptores con las capas reales del IGN.
- Implementar el alta de elementos con geometría y atributos; la consigna del visor continúa en curso.
- Completar los análisis y el mapa de las consignas restantes.

## 6.16 19/11/2026 — Alta de elementos en el visor y ejecución local

*Asistencia técnica del proyecto · Decisiones: ADR-0012, ADR-0013*

### Objetivo

Completar el ingreso de geometrías y atributos del visor y preparar la ejecución local del TPI.

### Trabajo realizado

- Se incorporó la herramienta **Agregar elemento** con dibujo de puntos, líneas y polígonos y un formulario con nombre y descripción.
- Django guarda cada alta en PostgreSQL. El visor recupera la capa **Relevamientos** en formato GeoJSON y permite consultar sus atributos por punto o rectángulo.
- Se retiraron los manifiestos k3s y los workflows de publicación y despliegue remoto. Docker Compose mantiene Django, PostgreSQL, PostGIS y GeoServer en puertos locales.
- Pasaron Ruff, las 18 pruebas de Django con PostgreSQL, el chequeo de migraciones, el control de colores y la compilación del frontend y de la imagen Docker. Las ocho pruebas del visor en Chromium verificaron las tres geometrías y la recuperación del punto y sus atributos después de recargar.
- Las dos pruebas de alta también pasaron en un viewport móvil con tema oscuro, usando una base SQLite temporal.

### Problemas y soluciones

- Se preparó un PostgreSQL temporal y una sesión de prueba de Django para ejecutar las verificaciones con datos aislados. Las pruebas del visor simularon los servicios de mapas del IGN y usaron el backend real para guardar los relevamientos.
- En móvil, el texto de ayuda cubría parte del área de dibujo e interceptaba clics. El panel deja los eventos de dibujo disponibles en el mapa y reserva la interacción de la barra para sus botones.
- Docker Desktop devolvió un error del motor durante la última reconstrucción. Se verificaron la configuración de Compose y la compilación final del frontend.
- Se recuperó el motor tras reiniciar WSL y se reconstruyó la imagen local. Django aplicó la migración de Relevamientos y respondió con sus archivos estáticos.
- El catálogo conservaba cinco capas de laboratorio conectadas al contenedor local `postgis` en el puerto 5433. Al iniciarlo, GeoServer respondió al catálogo WMS.

### Pendientes

- Demostrar el visor con las capas reales del IGN y completar los análisis y la cartografía de la Ruta Nacional 11.

## 6.17 19/11/2026 — Análisis de la RN 11 (punto b), informe y video

*Vazquez Maximo Ezequiel · Decisiones: ADR-0017*

### Objetivo

Resolver la consigna b: largo de la RN 11 en el Chaco, población afectada a 10 km y de 10 a 20 km, y puentes sobre la traza. Además, entregar un informe con pasos, capturas y referencias, y un video explicativo.

### Trabajo realizado

- `scripts/analisis_rn11.sql` y `analisis_rn11.py`: esquema `analisis` en PostGIS con la traza, las áreas, las localidades, los puentes, los cruces con cursos de agua y un resumen. Publica `rn11_chaco`, `rn11_areas`, `rn11_localidades` y `rn11_puentes` en GeoServer con su simbología.
- `scripts/analisis_rn11_qgis.py`: los mismos pasos con algoritmos de Procesamiento de QGIS 4.2.2 (PyQGIS sin interfaz), figuras de cada paso, el proyecto `docs/tpi/punto-b/qgis/rn11.qgz` y `validacion.json`.
- Panel de Administración con indicadores, dona de población y tablas de localidades y puentes, leídos de PostGIS (`apps/administracion/postgis.py`). En el visor, grupo "Análisis RN 11" y tema rápido "Obra RN 11".
- Informe `docs/tpi/punto-b/salida/informe-punto-b.pdf`, generado con `scripts/generar_informe_b.py` y el estilo de la bitácora: metodología con SQL y figuras, tablas, validación, limitaciones y referencias.
- Video `videos/03-analisis-rn11/` (unos 2 min 20 s, narrado con Gemini TTS) con un mapa SVG animado exportado de PostGIS. La carpeta `videos/` no se versiona.

### Problemas y soluciones

- `localhost` tardaba 3 s por conexión a PostGIS: en Windows prueba primero `::1` y Docker publica solo en IPv4. Se usa `127.0.0.1`; la prueba e2e del panel bajó de 11 s a 1,5 s.
- Sin clave primaria, GeoServer generaba identificadores `fid-…` y no exponía `gid` para rotular. Se agregaron claves primarias y la columna `numero`.
- General Lucio V. Mansilla (Formosa) caía dentro del polígono del Chaco sobre el Bermejo. Las localidades se asignan por el atributo `provincia`.
- En QGIS 4 las capas de símbolo no tienen `setProperties` y la expresión `line_locate_point` sobre una WKT larga devolvía nulos. Se crean símbolos nuevos y se usa `QgsGeometry.lineLocatePoint`.
- La API de voz limita a 10 pedidos por minuto. `narrar.py` se reanuda y solo pide las frases que faltan.

### Verificación

- PostGIS y QGIS coinciden: 172,39 km; 360.983 y 26.080 habitantes; 21 y 15 localidades; 21 puentes.
- `ruff check .`, 23 tests de Django, `typecheck`, `build` y `check:colores` en verde. Playwright: 15 pruebas en verde y 4 capturas del punto b.

### Pendientes

- [PENDIENTE] Revisar con el grupo el informe y el video antes de la entrega.
- Punto c: mapa A4 en PDF con la traza, las áreas, los puentes y los accidentes naturales.

## 6.18 19/11/2026 — Simbología y leyenda por clases de las capas IGN

*Asistencia técnica del proyecto · Decisiones: ADR-0014*

### Objetivo

Completar la leyenda con las clases de la simbología que pide la consigna a.3, la única función obligatoria del visor que faltaba.

### Trabajo realizado

- Se consultaron en PostGIS los valores de los atributos de las capas principales para definir las clases: `red_vial.tipo` (4 valores), `localidades.tipo` (11, agrupados en 4 clases), `curso_de_agua_hid.regimen` (2), `espejo_de_agua_hid.tipo` (7, agrupados en 5), `curvas_de_nivel.tipo` (2), `limite_politico_administrativo_lim.tipo` (3), `puente_red_vial_puntos.tipo` (4, agrupados en 2) y `vias_secundarias.tipo` (3, agrupados en 2).
- `scripts/simbologia_ign.py` define la simbología de las 47 capas y genera el SLD de cada una. `scripts/estilos_ign.py` los carga en GeoServer por la API REST y los asigna como estilo por defecto. Se puede repetir: actualiza los estilos existentes.
- Los caminos de tierra, los parajes y caseríos, las vías secundarias y las curvas intermedias se dibujan solo desde 1:1.000.000 o 1:500.000, según la clase. La escala figura en el título de cada regla.
- Las localidades capitales, ciudades y cabeceras de departamento, y las provincias, se rotulan con su nombre.
- La leyenda del visor se pide transparente y con el color de texto del tema (token `foreground`), y se vuelve a pedir al cambiar el tema.
- Se ejecutó `python scripts/estilos_ign.py` contra el GeoServer local: 47 capas con estilo. Se revisaron las leyendas con `GetLegendGraphic` y mapas de la zona de Resistencia y de la provincia con `GetMap`.
- Pasaron Ruff, TypeScript, el control de colores, la compilación del frontend y las 8 pruebas del visor en Chrome. Se revisaron capturas del visor con las capas reales en tema claro y oscuro.

### Problemas y soluciones

- Cada clase va en su propio `FeatureTypeStyle` para controlar el orden de dibujo. Como ahí `ElseFilter` abarcaría todos los elementos, la clase "resto" se expresa como un filtro que niega los valores de las otras clases.
- En tema oscuro, la leyenda de GeoServer aparecía como un recuadro blanco. Se resolvió con `transparent=true` y `fontColor` tomado del token del tema, sin escribir colores en la feature.

### Pendientes

- Los rótulos del mapa usan halo blanco también en tema oscuro, porque GeoServer dibuja la imagen sin conocer el tema del visor.
- [PENDIENTE] Consultar al profesor si la capa Relevamientos debe estar en PostGIS y servida por GeoServer.

## 6.19 19/11/2026 — Unión en develop de las ramas del visor y de la carga IGN

*Vazquez Maximo Ezequiel · Decisiones: ADR-0015, ADR-0016*

### Objetivo

Unir en `develop` el trabajo hecho en paralelo: la rama local (visor con catálogo, WFS-T y estilos SLD) y `feature/postgis-capas-ign`, que incluye `feature/visor-buscador-grupos` (carga IGN en `gisdb`, Relevamientos en Django, simbología de las 47 capas y retiro del despliegue). Quitar el despliegue remoto y verificar que todo funcione.

### Trabajo realizado

- Se commiteó la reorganización pendiente del visor (`ui/`, `mapa/`) y se creó la rama `respaldo/develop-antes-merge`.
- Merge de `origin/feature/postgis-capas-ign` con 17 conflictos resueltos:
  - Visor: queda la versión de `develop` (catálogo con buscador y grupos, orden arrastrable, globo, detalle y tabla de atributos). Se retiran los archivos planos de la otra rama.
  - Carga de elementos: queda WFS-T sobre `elementos_relevados` en PostGIS (ADR-0016). Se retiran el modelo `ElementoVectorial`, su formulario, su migración y la ruta `visor/elementos/`. ADR-0013 pasa a `reemplazada`.
  - Capas: queda el servicio `postgis` con `scripts/cargar_capas_ign.py` (ADR-0015). Se retiran `gisdb`, `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. ADR-0010 pasa a `reemplazada`.
  - Simbología: `cargar_capas_ign.py` genera y sube los SLD de las 47 capas desde `scripts/simbologia_ign.py` (ADR-0014). Se borran los seis SLD hechos a mano; queda `visor_elementos_relevados.sld`.
  - Despliegue: se aceptan los cambios de la otra rama. Se retiran `k8s/`, los workflows de imagen y deploy, `config/settings/production.py` y Gunicorn (ADR-0012).
- Compose: los puertos quedan en `127.0.0.1`. Se retiran el servicio `web` de la otra rama, el `Dockerfile` y el `.dockerignore`: Django se ejecuta en la máquina con `python manage.py runserver`, que ya migra, compila el frontend y sirve los estáticos. Correrlo en un contenedor no aportaba nada y obligaba a una URL interna para llegar a GeoServer.
- Los ADR locales duplicados se renumeraron: ADR-0010 → ADR-0015 y ADR-0011 → ADR-0016.

### Problemas y soluciones

- La otra rama clasificaba los cursos de agua por `regimen`, pero `cargar_capas_ign.py` conserva los acentos de las columnas (`régimen`). Se ajustó `simbologia_ign.py` y se comprobó que todos los valores de clase de las ocho capas clasificadas existen en PostGIS.
- Las dos ramas tenían ADR con el mismo número y versiones de la bitácora superpuestas. Se mantuvo el historial de la otra rama y se agregó la versión 0.13.0.

### Verificación

- `ruff check .`, `check_file_length.py` (solo el aviso previo de `media-upload.tsx`) y 19 tests de Django en verde.
- `typecheck`, `build` y `check:colores` del frontend en verde.
- Playwright: 15 pruebas en verde.
- Contra los servicios reales: 48 capas con estilo (`--solo-publicar`), GetMap y leyenda PNG de seis capas, 570.443 elementos en PostGIS (igual que la otra carga) e inserción WFS-T real por `services.enviar_transaccion` (`totalInserted=1`, fila borrada después).
- `docker compose up -d --wait postgis geoserver` con la configuración nueva: ambos servicios sanos.

### Pendientes

- Quienes usaban `gisdb` tienen que cargar las capas en `postgis` con `cargar_capas_ign.py`.
- Análisis del punto b y mapa del punto c.

# 7 Riesgos y pendientes

## 7.1 Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026 al 03/12/2026) con visor y análisis incompletos | Alto | Priorizar la demostración del visor con datos reales y el análisis de la ruta |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google y de GeoServer | Medio | Guardarlas en el `.env` local; nunca en el repositorio |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## 7.2 Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- El usuario confirmó el acceso autenticado al visor con Google y la visualización del mapa base.
- Las 47 capas del ZIP IGN están cargadas en el PostGIS local `postgis` (base `sig_ign`) y publicadas por WMS/WFS con su simbología (ADR-0014, ADR-0015). Los volúmenes locales no se distribuyen con el repositorio: cada integrante corre `python scripts/cargar_capas_ign.py` con el ZIP.
- Quien tenga el volumen `datos_gis` del servicio `gisdb` (rama anterior) tiene que volver a cargar las capas con el script; ese volumen ya no se usa.
- Django lee el análisis de la RN 11 desde PostGIS (`apps/administracion/postgis.py`). El cálculo se hace con `scripts/analisis_rn11.py` (ADR-0017).
- [PENDIENTE] Revisar con el grupo el informe del punto b (`docs/tpi/punto-b/salida/informe-punto-b.pdf`) y el video antes de la entrega.
- La carga de elementos usa WFS-T sobre `elementos_relevados` en PostGIS, servida por GeoServer (ADR-0016): la capa queda en PostGIS, que era la duda abierta sobre Relevamientos.

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

# 9 Carga y publicación de las capas IGN

Este apartado describe los cambios para que el equipo pueda revisarlos y repetir la carga. Los resultados corresponden a la instalación local comprobada el 13/11/2026.

## 9.1 Cómo se carga

La primera carga (13/11/2026) usó el servicio `gisdb` y los scripts `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. Al unir las ramas en `develop` (19/11/2026) quedó un solo flujo (ADR-0015):

- **`docker-compose.yml`:** servicio `postgis` (PostgreSQL 17 + PostGIS 3.5, base `sig_ign`, puerto 5433, volumen `datos_postgis`). GeoServer espera a que PostGIS esté disponible. Django no corre en un contenedor: se ejecuta con `python manage.py runserver`.
- **`scripts/cargar_capas_ign.py`:** descomprime el ZIP, carga los 47 shapefiles con `ogr2ogr` de la imagen oficial de GDAL, crea la capa editable `elementos_relevados`, publica todo en el espacio `ign` (almacén `sig_ign`) y aplica la simbología de `scripts/simbologia_ign.py` (ADR-0014).
- **`docs/tpi/catalogo_ign.json`:** inventario de la primera carga (nombres, conteos y SHA-256 del ZIP). Se conserva como referencia.
- **Documentación de la revisión:** `docs/revision-2026-11-12.md` registra el diagnóstico del proyecto y su actualización posterior a la carga.

## 9.2 Origen y resultado

El archivo local usado fue `D:/TPI/sig_ign.zip`, con 47 shapefiles y sus componentes. El directorio interno se llama `SIG_IGN2011`: ese nombre identifica el contenido comprobado y no permite afirmar que el paquete sea una edición de 2021.

| Dato | Resultado local |
|---|---|
| Capa y escala indicadas | SIG IGN 250 |
| Cantidad de capas | 47 |
| Elementos cargados | 570.443 |
| Sistema de referencia | WGS 84, EPSG:4326 |
| Base y esquema | `sig_ign`, esquema `public` |
| GeoServer | Puerto 8085; espacio `ign`; almacén `sig_ign` |
| SHA-256 del ZIP | `f9e1c4368fae85d58a51fcf074163babb270d5560cb2b3481ef7d370967c0797` |

La base `db` contiene las cuentas y sesiones de Django; la base `postgis` contiene las capas. La carga con `cargar_capas_ign.py` dio los mismos 570.443 elementos. La imagen Docker aporta el software de base de datos: los datos importados y la configuración de GeoServer viven en volúmenes locales, que no se comparten al subir el código a Git.

## 9.3 Inventario de las 47 capas

La cantidad corresponde a los elementos del shapefile y a los contados en PostGIS durante la carga. La geometría indica su familia general; GDAL puede almacenarla como geometría múltiple.

Tabla: Capas importadas desde el ZIP IGN

| Capa del ZIP | Geometría | Tabla PostGIS | Elementos |
|---|---|---|---:|
| Actividades_Agropecuarias | Punto | `actividades_agropecuarias` | 21 |
| Actividades_Economicas | Punto | `actividades_economicas` | 4.530 |
| Complejo_de_Energia_Ene | Punto | `complejo_de_energia_ene` | 247 |
| Curso_de_Agua_Hid | Línea | `curso_de_agua_hid` | 87.419 |
| Curvas_de_Nivel | Línea | `curvas_de_nivel` | 120.470 |
| Edif_Construcciones_Turisticas | Punto | `edif_construcciones_turisticas` | 63 |
| Edif_Depor_y_Esparcimiento | Punto | `edif_depor_y_esparcimiento` | 90 |
| Edif_Educacion | Punto | `edif_educacion` | 5.260 |
| Edif_Religiosos | Punto | `edif_religiosos` | 855 |
| Edificio_Publico_IPS | Punto | `edificio_publico_ips` | 32 |
| Edificio_de_Salud_IPS | Punto | `edificio_de_salud_ips` | 15 |
| Edificio_de_Seguridad_IPS | Punto | `edificio_de_seguridad_ips` | 1.453 |
| Edificios_Ferroviarios | Punto | `edificios_ferroviarios` | 1.892 |
| Ejido | Polígono | `ejido` | 2.258 |
| Espejo_de_Agua_Hid | Polígono | `espejo_de_agua_hid` | 26.515 |
| Estructuras_portuarias | Punto | `estructuras_portuarias` | 98 |
| Infraestructura_Aeroportuaria_Punto | Punto | `infraestructura_aeroportuaria_punto` | 1.079 |
| Infraestructura_Hidro | Punto | `infraestructura_hidro` | 142 |
| Isla | Polígono | `isla` | 2.866 |
| Limite_Politico_Administrativo_Lim | Línea | `limite_politico_administrativo_lim` | 483 |
| Localidades | Punto | `localidades` | 10.804 |
| Líneas_de_Conducción_Ene | Línea | `lineas_de_conduccion_ene` | 41 |
| Marcas_y_Señales | Punto | `marcas_y_senales` | 10.090 |
| Muro_Embalse | Línea | `muro_embalse` | 9 |
| Obra_Portuaria | Punto | `obra_portuaria` | 17 |
| Obra_de_Comunicación | Punto | `obra_de_comunicacion` | 513 |
| Otras_Edificaciones | Punto | `otras_edificaciones` | 96.056 |
| Pais_Lim | Polígono | `pais_lim` | 541 |
| Provincias | Polígono | `provincias` | 25 |
| Puente_Red_Vial_Puntos | Punto | `puente_red_vial_puntos` | 3.852 |
| Puntos_de_Alturas_Topograficas | Punto | `puntos_de_alturas_topograficas` | 4.323 |
| Puntos_del_Terreno | Punto | `puntos_del_terreno` | 8.644 |
| Red_Vial | Línea | `red_vial` | 118.955 |
| Red_ferroviaria | Línea | `red_ferroviaria` | 968 |
| Salvado_de_Obstaculo | Punto | `salvado_de_obstaculo` | 1.550 |
| Señalizaciones | Punto | `senalizaciones` | 142 |
| Sue_Costero | Polígono | `sue_costero` | 1.033 |
| Sue_Hidromorfologico | Polígono | `sue_hidromorfologico` | 3.208 |
| Sue_No_Consolidado | Polígono | `sue_no_consolidado` | 12.276 |
| Sue_congelado | Polígono | `sue_congelado` | 334 |
| Sue_consolidado | Polígono | `sue_consolidado` | 2.611 |
| Veg_Arborea | Polígono | `veg_arborea` | 6.730 |
| Veg_Arbustiva | Polígono | `veg_arbustiva` | 358 |
| Veg_Cultivos | Polígono | `veg_cultivos` | 3.463 |
| Veg_Suelo_Desnudo | Polígono | `veg_suelo_desnudo` | 14 |
| Vias_Secundarias | Línea | `vias_secundarias` | 22.353 |
| veg_Hidrofila | Polígono | `veg_hidrofila` | 5.745 |

Todas las capas se publican con `ign:` seguido del nombre de la tabla. La primera carga usó el prefijo `sig2011_` en cinco capas porque convivía con capas anteriores del laboratorio; el flujo actual no lo necesita.

## 9.4 Cómo volver a levantarlo

1. Preparar `.env` a partir de `.env.example` y configurar un cliente OAuth de Google válido, como explica el README.
2. Desde la carpeta del proyecto, ejecutar `docker compose up -d db postgis geoserver`.
3. Con el ZIP en `docs/tpi/sig_ign.zip`, ejecutar `python scripts/cargar_capas_ign.py`. Para rehacer solo la publicación y los estilos: `python scripts/cargar_capas_ign.py --solo-publicar`.
4. Ejecutar `python manage.py runserver` y entrar al visor en `http://localhost:8000/administracion/visor/` con Google.

El ZIP del IGN, `.env` y los volúmenes de Docker no forman parte del commit. Quien prepare una instalación necesita el ZIP y sus propias credenciales. El ADR-0011 planteaba un entorno compartido con las capas ya cargadas; quedó descartado al elegir la ejecución local (ADR-0012).

## 9.5 Qué se verificó y qué falta

Se contrastaron las cantidades de las 47 tablas con los archivos DBF del ZIP. Para cada capa publicada se comprobó un `GetFeature` WFS con su conteo, un `GetMap` WMS y una leyenda PNG; también se verificó CORS para el origen local. Se probaron geometrías de provincias, localidades, puentes, rutas, agua y vegetación, y se generó un mapa combinado de las cinco primeras. Pasaron 13 tests de Django, Ruff, TypeScript, la compilación del frontend y el control de colores.

Después de la unión de ramas, las 47 capas tienen su simbología por clases y la carga de elementos usa `elementos_relevados` por WFS-T (ADR-0016). Siguen pendientes el enlace de Django con PostGIS para los indicadores y el análisis de la Ruta Nacional 11.

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
| **Versión/Edición** | 0.7.0 |
| **Fecha de versión** | 30/10/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.7.0 | 30/10/2026 | Visor con capas en el mapa, catálogo de capas y temas rápidos; Globo, panel de detalle y tabla de atributos para las consultas |
| 0.6.0 | 29/10/2026 | Visor con consulta por punto y área, medición, carga de elementos y leyenda con clases (ADR-0011); Pruebas de navegador del visor |
| 0.5.0 | 29/10/2026 | PostGIS en Docker con las 47 capas del SIG IGN 250 (ADR-0010); Capas publicadas en GeoServer |
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
| Base espacial | PostGIS (Docker) | 17-3.5 | 47 capas del SIG IGN 250 (ADR-0010) |
| Carga de capas | GDAL ogr2ogr (Docker) | 3.11.3 | Shapefiles a PostGIS (`scripts/cargar_capas_ign.py`) |
| Servidor de mapas | GeoServer (Docker) | 2.27.2 | Servicios WMS y WFS de las capas (ADR-0008) |
| Biblioteca de mapas | OpenLayers | 10.6.1 | Visor web de Administración (ADR-0009) |
| Listas ordenables | dnd-kit | 6.3.1 | Orden de las capas en el visor |
| Estilos de capas | SLD 1.0 (`geoserver/estilos/`) | — | Leyenda con clases (ADR-0011) |

## 3.3 Componentes previstos

- Estilos propios para el resto de las capas del IGN.

# 4 Estado de las consignas del TPI

Avance de cada consigna de `docs/tpi/practico.pdf` al cierre de esta versión.

Tabla: Estado de las consignas del TPI

| Consigna | Descripción | Estado | Referencia |
|---|---|---|---|
| a.1 | Servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250 | Completa | ADR-0003, ADR-0010 |
| a.2 | Servidor de mapas con servicios OGC (WMS y WFS) | Completa | ADR-0008 |
| a.3 | Aplicación web de visualización (navegación, capas, leyenda, escala, consultas, medición y edición) | Completa | ADR-0001, ADR-0002, ADR-0009, ADR-0011 |
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
| ADR-0010 | PostGIS en Docker para las capas del SIG IGN 250 | aceptada | 29/10/2026 |
| ADR-0011 | Carga de elementos por WFS-T a través de Django y estilos SLD versionados | aceptada | 29/10/2026 |

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
- Primera versión: sin mapa de fondo externo (las capas del IGN hacen de base; arranca con `provincias`), vista inicial en el Chaco, zoom, escala, lista de capas leída del `GetCapabilities` con interruptores y leyenda por capa.
- Pendiente: consulta por punto y rectángulo, medición y carga de elementos.

## 5.10 ADR-0010 — PostGIS en Docker para las capas del SIG IGN 250

*Estado: aceptada · Fecha: 29/10/2026*

### Contexto

La consigna a.1 pide un servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250. ADR-0003 preveía sumar PostGIS a la base de la aplicación más adelante. GeoServer (ADR-0008) corre en Docker y necesita llegar a la base por la red de Compose.

### Opciones consideradas

- Instalar la extensión PostGIS en el PostgreSQL local (`gis_tpi`).
- Un contenedor PostGIS propio para las capas, separado de la base de la aplicación.

### Decisión

Servicio `postgis` en `docker-compose.yml` con la imagen `postgis/postgis:17-3.5`, base `sig_ign`, puerto 5433 en el host (el 5432 lo usa el PostgreSQL local) y volumen `datos_postgis`. La base de la aplicación Django no cambia.

Las 47 capas se cargan con `python scripts/cargar_capas_ign.py`, que usa `ogr2ogr` de la imagen oficial de GDAL dentro de la red de Compose y después las publica en GeoServer por su API REST (almacén `sig_ign`, espacio `ign`).

### Consecuencias

- No hay que instalar PostGIS ni GDAL en la máquina: alcanza con Docker.
- GeoServer se conecta a la base con el nombre de servicio `postgis`.
- Las tablas usan nombres en minúscula y sin acentos (`Líneas_de_Conducción_Ene` → `lineas_de_conduccion_ene`); el título de la capa en GeoServer conserva el nombre original.
- La carga es reproducible: el script recrea las tablas y salta las capas ya publicadas.
- Para el VPS falta decidir si PostGIS va en el mismo clúster o como servicio aparte.

## 5.11 ADR-0011 — Carga de elementos por WFS-T a través de Django y estilos SLD versionados

*Estado: aceptada · Fecha: 29/10/2026*

### Contexto

La consigna a.3 pide cargar elementos nuevos (geometría y atributos) en una capa vectorial y mostrar la leyenda con las clases de la simbología. GeoServer exige credenciales de administración para escribir por WFS-T, y las capas publicadas usaban el estilo por defecto (una sola clase).

### Opciones consideradas

- WFS-T directo desde el navegador con escritura anónima habilitada en GeoServer.
- WFS-T armado en el navegador y reenviado por Django con las credenciales de GeoServer.
- Insertar directo en PostGIS desde Django, sin WFS-T.

### Decisión

- El visor arma la transacción con `ol/format/WFS` y la envía a `POST /administracion/visor/transaccion/` (sesión y CSRF). `apps/administracion/services.py` acepta solo `Insert` en las capas de `GEOSERVER_CAPAS_EDITABLES` y la reenvía a GeoServer con `GEOSERVER_ADMIN_USER`/`GEOSERVER_ADMIN_PASSWORD`. Rechaza `Update`, `Delete`, otras capas y XML inválido.
- La capa editable es `elementos_relevados` (PostGIS, geometría genérica, campos nombre, categoría, descripción, responsable y fecha). No se tocan las capas del IGN.
- Los estilos con clases viven en `geoserver/estilos/*.sld` y `scripts/cargar_capas_ign.py` los sube a GeoServer: red vial por tipo, localidades por jerarquía, cursos de agua por régimen, espejos de agua por tipo, puentes, provincias y elementos relevados por geometría.

### Consecuencias

- La clave de GeoServer nunca llega al navegador y el visor solo puede agregar, no modificar ni borrar.
- Se sigue usando WFS-T, el estándar OGC que se ve en la materia.
- Los estilos son reproducibles: se regeneran con el script en cualquier GeoServer.
- Las demás 41 capas del IGN siguen con el estilo por defecto de GeoServer.

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
- [PENDIENTE] Definir el dominio de despliegue (nginx y `CSRF_TRUSTED_ORIGINS`).
- [PENDIENTE] Estilos propios para las 41 capas del IGN que siguen con el estilo por defecto.
- [PENDIENTE] Desplegar PostGIS y GeoServer en el VPS (manifiesto k8s) y definir su URL pública.

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

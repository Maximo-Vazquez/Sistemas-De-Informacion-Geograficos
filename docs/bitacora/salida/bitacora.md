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
| **Versión/Edición** | 0.2.0 |
| **Fecha de versión** | 22/10/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.2.0 | 22/10/2026 | Acceso a Administración para cualquier cuenta de Google; Base local gis_tpi y runserver que compila el frontend; Dependencias unificadas en requirements.txt y logo de la UTN; Globo 3D en la pantalla de inicio |
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

## 3.3 Componentes previstos

- **PostGIS** sobre PostgreSQL 17 para las capas del IGN (imagen `postgis/postgis`).
- **Servidor de mapas** con WMS/WFS. [PENDIENTE] elegir entre GeoServer y QGIS Server (registrar ADR).
- **Biblioteca de mapas** del visor. [PENDIENTE] elegir entre OpenLayers y Leaflet (registrar ADR).

# 4 Estado de las consignas del TPI

Avance de cada consigna de `docs/tpi/practico.pdf` al cierre de esta versión.

Tabla: Estado de las consignas del TPI

| Consigna | Descripción | Estado | Referencia |
|---|---|---|---|
| a.1 | Servidor de bases de datos espaciales con las capas vectoriales del SIG IGN 250 | Pendiente | ADR-0003 |
| a.2 | Servidor de mapas con servicios OGC (WMS y WFS) | Pendiente | — |
| a.3 | Aplicación web de visualización (navegación, capas, leyenda, escala, consultas, medición y edición) | En curso | ADR-0001, ADR-0002 |
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
- Las URL de allauth pasaron a `accounts/` para coincidir con la URI de redirección ya registrada en el cliente OAuth (`http://localhost:8000/accounts/google/login/callback/`).
- Dependencias de Python unificadas en un solo `requirements.txt` (aplicación, bitácora y calidad).
- Globo 3D interactivo en el inicio: componente Globe de Magic UI (instalado con el CLI de shadcn, basado en cobe/WebGL) envuelto en `components/app/chaco-globe.tsx`, que arranca mostrando el Chaco con marcadores en Resistencia y la RN 11 y se adapta al tema claro/oscuro.
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
- [PENDIENTE] Elegir servidor de mapas y biblioteca de mapas (ADR).

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

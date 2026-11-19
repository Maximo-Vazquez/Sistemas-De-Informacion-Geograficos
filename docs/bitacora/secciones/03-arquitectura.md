# Arquitectura y stack tecnológico

## Vista general

Django sirve las páginas y monta pantallas React compiladas con Vite. PostgreSQL guarda los datos de la aplicación. Un servicio PostGIS separado guarda las capas IGN y la capa editable `elementos_relevados`; GeoServer las publica por WMS y WFS y recibe las altas por WFS-T a través de Django (ADR-0016).

El TPI se ejecuta localmente (ADR-0012): `docker compose up -d db postgis geoserver` levanta las bases y el servidor de mapas, y Django corre en la máquina con `python manage.py runserver`, que migra, compila el frontend y sirve los estáticos.

## Stack actual

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

## Componentes previstos

- Mapa A4 del punto c a partir de las capas `rn11_*` del esquema `analisis`.

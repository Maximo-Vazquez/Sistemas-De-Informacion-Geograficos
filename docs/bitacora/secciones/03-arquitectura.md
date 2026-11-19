# Arquitectura y stack tecnológico

## Vista general

Django sirve las páginas y monta pantallas React compiladas con Vite. PostgreSQL guarda los datos de la aplicación y los elementos de la capa Relevamientos. Un servicio PostGIS separado guarda las capas IGN y GeoServer las publica por WMS y WFS.

Para ejecutar el proyecto localmente, se puede usar `docker compose up -d --build web geoserver`. El servicio `web` usa `runserver` para servir las páginas y los estáticos compilados, y recibe el entorno desde `.env`.

## Stack actual

Tabla: Tecnologías en uso

| Componente | Tecnología | Versión | Uso |
|---|---|---|---|
| Backend | Django | 5.2.18 | Aplicación web, vistas y administración |
| Autenticación | django-allauth (Google) | 65.20.1 | Login con Google, sin contraseñas |
| Base de datos | PostgreSQL | 17 | Cuentas, sesiones y elementos de Relevamientos |
| Base espacial | PostGIS sobre PostgreSQL | 3.5.2 / 17 | Capas IGN en el esquema `ign` (ADR-0010) |
| Driver | psycopg | 3.3.6 | Conexión Django–PostgreSQL |
| Frontend | React + TypeScript | 19.3 / 7.0 | Pantallas montadas por Django |
| Build | Vite + Tailwind CSS | 8.3 / 4.3 | Compilación y estilos |
| Componentes | shadcn/ui (Base UI) + coss | 4.21 / 1.8 | Biblioteca de componentes de UI |
| Gráficos | Recharts | 3.8 | Paneles de Administración |
| Globo 3D | Magic UI Globe (cobe, WebGL) | 0.6 | Globo interactivo del inicio, centrado en el Chaco |
| Calidad | Ruff | 0.17.2 | Estilo y complejidad ciclomática (≤ 10) |
| Contenedores | Docker Compose y Dockerfile multi-etapa | Node 24 / Python 3.13 | Servicios locales del TPI |
| CI | GitHub Actions | — | Calidad, bitácora y pruebas de navegador |
| Análisis SIG | QGIS + QGIS MCP | 4.2.2 / 0.14.1 | Análisis del punto b y mapa del punto c |
| Documentación | Python + Markdown + WeasyPrint | 70.0 | Esta bitácora en PDF |
| Pruebas de navegador | Playwright (Chromium) | 1.63 | Pruebas de flujos y capturas de pantalla |
| Servidor de mapas | GeoServer (Docker) | 2.27.2 | Servicios WMS y WFS de las capas (ADR-0008) |
| Biblioteca de mapas | OpenLayers | 10.6.1 | Visor web de Administración (ADR-0009) |

## Componentes previstos

- Conexión de Django a PostGIS para los cálculos del panel sobre la RN 11.

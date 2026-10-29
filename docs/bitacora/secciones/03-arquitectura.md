# Arquitectura y stack tecnológico

## Vista general

Django sirve las páginas y monta pantallas React compiladas con Vite (no es una SPA). PostgreSQL guarda los datos de la aplicación y, en la etapa GIS, las capas con PostGIS. Un servidor de mapas publicará esas capas por WMS/WFS y el visor web las consumirá. En producción, un pod de Kubernetes corre Django (Gunicorn) junto a nginx, que sirve los estáticos.

## Stack actual

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

## Componentes previstos

- **PostGIS** sobre PostgreSQL 17 para las capas del IGN (imagen `postgis/postgis`).
- **Servidor de mapas** con WMS/WFS. [PENDIENTE] elegir entre GeoServer y QGIS Server (registrar ADR).
- **Biblioteca de mapas** del visor. [PENDIENTE] elegir entre OpenLayers y Leaflet (registrar ADR).

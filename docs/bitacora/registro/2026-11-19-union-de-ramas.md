---
fecha: 2026-11-19
titulo: Unión en develop de las ramas del visor y de la carga IGN
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0015, ADR-0016]
---

## Objetivo

Unir en `develop` el trabajo hecho en paralelo: la rama local (visor con catálogo, WFS-T y estilos SLD) y `feature/postgis-capas-ign`, que incluye `feature/visor-buscador-grupos` (carga IGN en `gisdb`, Relevamientos en Django, simbología de las 47 capas y retiro del despliegue). Quitar el despliegue remoto y verificar que todo funcione.

## Trabajo realizado

- Se commiteó la reorganización pendiente del visor (`ui/`, `mapa/`) y se creó la rama `respaldo/develop-antes-merge`.
- Merge de `origin/feature/postgis-capas-ign` con 17 conflictos resueltos:
  - Visor: queda la versión de `develop` (catálogo con buscador y grupos, orden arrastrable, globo, detalle y tabla de atributos). Se retiran los archivos planos de la otra rama.
  - Carga de elementos: queda WFS-T sobre `elementos_relevados` en PostGIS (ADR-0016). Se retiran el modelo `ElementoVectorial`, su formulario, su migración y la ruta `visor/elementos/`. ADR-0013 pasa a `reemplazada`.
  - Capas: queda el servicio `postgis` con `scripts/cargar_capas_ign.py` (ADR-0015). Se retiran `gisdb`, `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. ADR-0010 pasa a `reemplazada`.
  - Simbología: `cargar_capas_ign.py` genera y sube los SLD de las 47 capas desde `scripts/simbologia_ign.py` (ADR-0014). Se borran los seis SLD hechos a mano; queda `visor_elementos_relevados.sld`.
  - Despliegue: se aceptan los cambios de la otra rama. Se retiran `k8s/`, los workflows de imagen y deploy, `config/settings/production.py` y Gunicorn (ADR-0012).
- Compose: los puertos quedan en `127.0.0.1`. Se retiran el servicio `web` de la otra rama, el `Dockerfile` y el `.dockerignore`: Django se ejecuta en la máquina con `python manage.py runserver`, que ya migra, compila el frontend y sirve los estáticos. Correrlo en un contenedor no aportaba nada y obligaba a una URL interna para llegar a GeoServer.
- Los ADR locales duplicados se renumeraron: ADR-0010 → ADR-0015 y ADR-0011 → ADR-0016.

## Problemas y soluciones

- La otra rama clasificaba los cursos de agua por `regimen`, pero `cargar_capas_ign.py` conserva los acentos de las columnas (`régimen`). Se ajustó `simbologia_ign.py` y se comprobó que todos los valores de clase de las ocho capas clasificadas existen en PostGIS.
- Las dos ramas tenían ADR con el mismo número y versiones de la bitácora superpuestas. Se mantuvo el historial de la otra rama y se agregó la versión 0.13.0.

## Verificación

- `ruff check .`, `check_file_length.py` (solo el aviso previo de `media-upload.tsx`) y 19 tests de Django en verde.
- `typecheck`, `build` y `check:colores` del frontend en verde.
- Playwright: 15 pruebas en verde.
- Contra los servicios reales: 48 capas con estilo (`--solo-publicar`), GetMap y leyenda PNG de seis capas, 570.443 elementos en PostGIS (igual que la otra carga) e inserción WFS-T real por `services.enviar_transaccion` (`totalInserted=1`, fila borrada después).
- `docker compose up -d --wait postgis geoserver` con la configuración nueva: ambos servicios sanos.

## Pendientes

- Quienes usaban `gisdb` tienen que cargar las capas en `postgis` con `cargar_capas_ign.py`.
- Análisis del punto b y mapa del punto c.

"""Lectura de solo consulta en el PostGIS de las capas (servicio `postgis`, ADR-0015).

Django no usa GeoDjango: el análisis lo calcula QGIS (scripts/analisis_rn11_qgis.py) y lo guarda en PostGIS; acá solo
se leen sus tablas. Si la base no responde o el análisis no corrió, `consultar` devuelve None y la
pantalla muestra su estado vacío.
"""

import logging

import psycopg
from django.conf import settings
from psycopg.rows import dict_row

logger = logging.getLogger(__name__)


def consultar(*consultas: str) -> list[list[dict]] | None:
    """Ejecuta las consultas en una sola conexión y devuelve las filas de cada una."""
    conexion = settings.POSTGIS
    if not conexion:
        return None
    try:
        with psycopg.connect(**conexion, connect_timeout=3, row_factory=dict_row) as base:
            base.read_only = True
            return [base.execute(sql).fetchall() for sql in consultas]
    except psycopg.Error as error:
        logger.warning("PostGIS no disponible para el panel: %s", error)
        return None

"""Lecturas para el panel de resultados y el visor.

Los números del panel salen del análisis de la RN 11 (scripts/analisis_rn11.py, ADR-0017), que
deja sus tablas en el esquema `analisis` de PostGIS. Si el análisis no corrió, el panel muestra
cada sección vacía con la instrucción para generarlo.
"""

from decimal import Decimal

from django.conf import settings
from django.urls import reverse

from .contexto import datos_pagina_admin
from .postgis import consultar

PANELES = [
    {
        "id": "poblacion",
        "titulo": "Población afectada por categoría",
        "descripcion": "Habitantes del Chaco hasta 10 km y de 10 a 20 km de la traza (Censo 2001).",
    },
    {
        "id": "localidades",
        "titulo": "Localidades en el área de influencia",
        "descripcion": "Localidades del Chaco a 20 km o menos de la RN 11, por distancia.",
    },
    {
        "id": "puentes",
        "titulo": "Puentes sobre la traza",
        "descripcion": "Puentes de la RN 11 en el Chaco, desde el límite con Santa Fe.",
    },
]

INDICADORES = [
    {"id": "km", "label": "Km de traza", "hint": "RN 11 dentro del Chaco"},
    {"id": "poblacion10", "label": "Población hasta 10 km", "hint": "Habitantes, Censo 2001"},
    {"id": "poblacion20", "label": "Población de 10 a 20 km", "hint": "Habitantes, Censo 2001"},
    {"id": "puentes", "label": "Puentes", "hint": "Sobre la traza en el Chaco"},
]

SQL_RESUMEN = "SELECT * FROM analisis.rn11_resumen"
SQL_LOCALIDADES = """
SELECT nombre, tipo, departamento, habitantes, con_dato, distancia_km, categoria
FROM analisis.rn11_localidades WHERE en_chaco ORDER BY distancia_km
"""
SQL_PUENTES = """
SELECT numero, km_traza, curso_de_agua, regimen, localidad_cercana
FROM analisis.rn11_puentes ORDER BY gid
"""


def _numeros(fila: dict) -> dict:
    """psycopg devuelve los numeric como Decimal; el JSON de la página necesita números."""
    return {clave: float(valor) if isinstance(valor, Decimal) else valor for clave, valor in fila.items()}


def analisis_rn11() -> dict | None:
    filas = consultar(SQL_RESUMEN, SQL_LOCALIDADES, SQL_PUENTES)
    if not filas or not filas[0]:
        return None
    resumen, localidades, puentes = filas
    return {
        "resumen": _numeros(resumen[0]),
        "localidades": [_numeros(fila) for fila in localidades],
        "puentes": [_numeros(fila) for fila in puentes],
    }


def _indicadores(resumen: dict | None) -> list[dict]:
    if resumen is None:
        return [{**indicador, "valor": None} for indicador in INDICADORES]
    valores = {
        "km": resumen["km_traza"],
        "poblacion10": resumen["poblacion_0_10"],
        "poblacion20": resumen["poblacion_10_20"],
        "puentes": resumen["puentes"],
    }
    pistas = {
        "poblacion10": f"{resumen['localidades_0_10']} localidades, Censo 2001",
        "poblacion20": f"{resumen['localidades_10_20']} localidades, Censo 2001",
        "puentes": f"Sobre {resumen['cruces_con_cursos_de_agua']} cruces con cursos de agua",
    }
    return [
        {**indicador, "valor": valores[indicador["id"]], "hint": pistas.get(indicador["id"], indicador["hint"])}
        for indicador in INDICADORES
    ]


def datos_panel(request):
    analisis = analisis_rn11()
    return {
        **datos_pagina_admin(request),
        "indicadores": _indicadores(analisis["resumen"] if analisis else None),
        "paneles": PANELES,
        "analisis": analisis,
    }


# Vista inicial del visor: la Provincia del Chaco (lon/lat, EPSG:4326).
EXTENSION_CHACO = [-63.5, -28.1, -58.2, -24.0]


def datos_visor(request):
    base = settings.GEOSERVER_URL
    espacio = settings.GEOSERVER_WORKSPACE
    return {
        **datos_pagina_admin(request),
        "geoserver": {
            "url": base,
            "workspace": espacio,
            "wmsUrl": f"{base}/{espacio}/wms",
            "wfsUrl": f"{base}/{espacio}/wfs",
        },
        "extension": EXTENSION_CHACO,
        "capasEditables": settings.GEOSERVER_CAPAS_EDITABLES,
        "transaccionUrl": reverse("administracion:visor_transaccion"),
    }

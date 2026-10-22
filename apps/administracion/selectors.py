"""Lecturas para el panel de gráficos.

Esta etapa no tiene datos: cada panel se declara con su propósito y se muestra
vacío. Cuando exista PostGIS, cada panel recibe sus filas desde aquí.
"""

from .contexto import datos_pagina_admin

PANELES = [
    {
        "id": "longitud-ruta",
        "titulo": "Longitud de la RN 11 en Chaco",
        "descripcion": "Kilómetros de traza dentro de la provincia.",
    },
    {
        "id": "poblacion-afectada",
        "titulo": "Población afectada",
        "descripcion": "Habitantes hasta 10 km y entre 10 y 20 km de la ruta.",
    },
    {
        "id": "puentes",
        "titulo": "Puentes sobre la traza",
        "descripcion": "Cantidad y detalle de puentes que cruzan la RN 11.",
    },
    {
        "id": "capas",
        "titulo": "Capas publicadas",
        "descripcion": "Capas del SIG IGN 250 cargadas y servidas por WMS/WFS.",
    },
]

INDICADORES = [
    {"id": "km", "label": "Km de traza", "hint": "RN 11, Chaco"},
    {"id": "poblacion10", "label": "Población a 10 km", "hint": "Hasta 10 km"},
    {"id": "poblacion20", "label": "Población a 20 km", "hint": "De 10 a 20 km"},
    {"id": "puentes", "label": "Puentes", "hint": "Sobre la traza"},
]


def datos_panel(request):
    return {
        **datos_pagina_admin(request),
        "indicadores": [{**indicador, "valor": None} for indicador in INDICADORES],
        "paneles": PANELES,
    }

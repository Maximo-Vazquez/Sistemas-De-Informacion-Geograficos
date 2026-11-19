"""Genera el informe del punto b (Markdown y PDF) con los números del análisis en PostGIS.

Completa los marcadores {{...}} de docs/tpi/punto-b/informe.md con analisis.rn11_* (que genera
QGIS), baja de GeoServer los mapas de contexto y arma el PDF con la plantilla y el estilo de la
bitácora.

    python scripts/generar_informe_b.py            # salida/informe-punto-b.md y .pdf
    python scripts/generar_informe_b.py --solo-md  # sin PDF (no requiere WeasyPrint)

Requiere haber corrido scripts/analisis_rn11_qgis.py y scripts/publicar_analisis_rn11.py, y
tener PostGIS y GeoServer en marcha.
"""

import argparse
import re
import sys
import urllib.parse
import urllib.request
from decimal import Decimal
from pathlib import Path

import psycopg
import yaml
from psycopg.rows import dict_row

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bitacora.armar_md import MARCA_CUERPO, numerar_titulos, preliminares, tabla  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
INFORME = RAIZ / "docs" / "tpi" / "punto-b"
FIGURAS = INFORME / "figuras"
SALIDA = INFORME / "salida"
ASSETS = RAIZ / "docs" / "bitacora" / "assets"
CONEXION = {"host": "127.0.0.1", "port": 5433, "dbname": "sig_ign", "user": "sig_ign", "password": "sig_ign"}
WMS = "http://localhost:8085/geoserver/ign/wms"
CAPAS_MAPA = ["provincias", "curso_de_agua_hid", "rn11_areas", "red_vial", "rn11_chaco", "rn11_localidades",
              "rn11_puentes"]
MARCADOR = re.compile(r"\{\{(\w+)\}\}")
FIGURA = re.compile(r"<p>Figura: (.*?)</p>")
CSS_EXTRA = """
.cuerpo img, img { display: block; max-width: 100%; max-height: 11cm; margin: 0.4cm auto 0.15cm; }
p.leyenda.figura { text-align: center; }
pre { white-space: pre-wrap; font-size: 8.5pt; }
"""


def numero(valor, decimales=0) -> str:
    """Formato es-AR: punto de miles y coma decimal."""
    texto = f"{float(valor):,.{decimales}f}"
    return texto.replace(",", "§").replace(".", ",").replace("§", ".")


def consultar(base, sql: str) -> list[dict]:
    return [{k: float(v) if isinstance(v, Decimal) else v for k, v in fila.items()} for fila in base.execute(sql)]


def leer_datos() -> dict:
    with psycopg.connect(**CONEXION, row_factory=dict_row) as base:
        return {
            "resumen": consultar(base, "SELECT * FROM analisis.rn11_resumen")[0],
            "areas": {f["categoria"]: f["km2"]
                      for f in consultar(base, "SELECT categoria, km2 FROM analisis.rn11_areas")},
            "localidades": consultar(base, "SELECT * FROM analisis.rn11_localidades ORDER BY distancia_km"),
            "puentes": consultar(base, "SELECT * FROM analisis.rn11_puentes ORDER BY numero"),
            "cajas": {nombre: consultar(base, sql)[0] for nombre, sql in CAJAS.items()},
        }


# Extensiones de los mapas en POSGAR 2007 faja 5, con margen (metros).
CAJAS = {
    "mapa-general": """SELECT ST_XMin(b) x0, ST_YMin(b) y0, ST_XMax(b) x1, ST_YMax(b) y1 FROM
        (SELECT ST_Expand(ST_Extent(ST_Transform(geom, 5347)), 6000) b FROM analisis.rn11_areas) e""",
    "mapa-resistencia": """SELECT ST_XMin(b) x0, ST_YMin(b) y0, ST_XMax(b) x1, ST_YMax(b) y1 FROM
        (SELECT ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(-58.96, -27.46), 4326), 5347), 16000) b) e""",
}


def bajar_mapa(nombre: str, caja: dict, ancho: int = 1800):
    alto = round(ancho * (caja["y1"] - caja["y0"]) / (caja["x1"] - caja["x0"]))
    parametros = {
        "service": "WMS", "version": "1.1.1", "request": "GetMap", "srs": "EPSG:5347", "format": "image/png",
        "layers": ",".join(f"ign:{capa}" for capa in CAPAS_MAPA), "styles": "", "width": ancho, "height": alto,
        "bbox": ",".join(str(caja[k]) for k in ("x0", "y0", "x1", "y1")), "bgcolor": "0xF4F6F8",
        "format_options": "dpi:144;antialiasing:full",
    }
    with urllib.request.urlopen(f"{WMS}?{urllib.parse.urlencode(parametros)}", timeout=120) as respuesta:
        contenido = respuesta.read()
    if not contenido.startswith(b"\x89PNG"):
        sys.exit(f"GeoServer no devolvió una imagen para {nombre}: {contenido[:300]!r}")
    (FIGURAS / f"{nombre}.png").write_bytes(contenido)
    print(f"Mapa {nombre}.png ({ancho}x{alto})")


def tablas(datos: dict) -> dict[str, str]:
    r = datos["resumen"]

    return {
        "tabla_resumen": tabla(["Pregunta", "Respuesta"], [
            ["Km de la traza en el Chaco", f"**{numero(r['km_traza'], 2)} km**"],
            ["Población hasta 10 km",
             f"**{numero(r['poblacion_0_10'])} habitantes** ({r['localidades_0_10']} localidades)"],
            ["Población de 10 a 20 km",
             f"**{numero(r['poblacion_10_20'])} habitantes** ({r['localidades_10_20']} localidades)"],
            ["Puentes sobre la traza", f"**{r['puentes']} puentes** (detalle en la sección de resultados)"],
        ]),
        "tabla_poblacion": tabla(["Categoría", "Localidades", "Con dato de población", "Habitantes"], [
            ["Hasta 10 km", r["localidades_0_10"],
             sum(1 for f in datos["localidades"] if f["en_chaco"] and f["con_dato"] and f["categoria"] == "0 a 10 km"),
             numero(r["poblacion_0_10"])],
            ["De 10 a 20 km", r["localidades_10_20"],
             sum(1 for f in datos["localidades"] if f["en_chaco"] and f["con_dato"] and f["categoria"] == "10 a 20 km"),
             numero(r["poblacion_10_20"])],
            ["**Total**", r["localidades_0_10"] + r["localidades_10_20"], r["localidades_con_dato"],
             f"**{numero(r['poblacion_0_10'] + r['poblacion_10_20'])}**"],
        ]),
        "tabla_localidades": tabla(["Localidad", "Categoría", "Distancia (km)", "Habitantes"], [
            [f["nombre"], "Hasta 10 km" if f["categoria"] == "0 a 10 km" else "De 10 a 20 km",
             numero(f["distancia_km"], 1), numero(f["habitantes"])]
            for f in datos["localidades"] if f["en_chaco"] and f["con_dato"]
        ]),
        "tabla_puentes": tabla(["N.º", "Km", "Curso de agua", "Localidad cercana"], [
            [p["numero"], numero(p["km_traza"], 1), p["curso_de_agua"] or "Sin curso cartografiado",
             p["localidad_cercana"]]
            for p in datos["puentes"]
        ]),
    }


def valores(datos: dict) -> dict[str, str]:
    r = datos["resumen"]
    return {
        "km_traza": numero(r["km_traza"], 2),
        "poblacion_0_10": numero(r["poblacion_0_10"]),
        "poblacion_10_20": numero(r["poblacion_10_20"]),
        "poblacion_total": numero(r["poblacion_0_10"] + r["poblacion_10_20"]),
        "poblacion_fuera": numero(r["poblacion_fuera_del_chaco"]),
        "localidades_con_dato": str(r["localidades_con_dato"]),
        "localidades_total": str(r["localidades_0_10"] + r["localidades_10_20"]),
        "localidades_sin_dato": str(r["localidades_0_10"] + r["localidades_10_20"] - r["localidades_con_dato"]),
        "puentes": str(r["puentes"]),
        "cruces": str(r["cruces_con_cursos_de_agua"]),
        **tablas(datos),
    }


def documento() -> dict:
    ficha = yaml.safe_load((INFORME / "documento.yaml").read_text(encoding="utf-8"))
    ficha["fecha_version"] = ficha["versiones"][-1]["fecha"]
    return ficha


def armar_markdown(ficha: dict, datos: dict) -> str:
    reemplazos = valores(datos)
    cuerpo = MARCADOR.sub(lambda m: reemplazos[m.group(1)], (INFORME / "informe.md").read_text(encoding="utf-8"))
    aviso = "<!-- Generado por scripts/generar_informe_b.py desde docs/tpi/punto-b/informe.md. No editar. -->"
    return f"{aviso}\n\n{preliminares(ficha)}\n\n{MARCA_CUERPO}\n\n{numerar_titulos(cuerpo)}\n"


def generar_pdf(texto: str, ficha: dict):
    from bitacora.render_pdf import armar_html
    from weasyprint import HTML

    contenido = armar_html(texto, ficha, ASSETS).replace("</style>", CSS_EXTRA + "</style>", 1)
    contador = iter(range(1, 1000))
    contenido = FIGURA.sub(lambda m: f'<p class="leyenda figura">Figura {next(contador)} {m.group(1)}</p>', contenido)
    contenido = contenido.replace('src="figuras/', f'src="{FIGURAS.as_uri()}/')
    destino = SALIDA / "informe-punto-b.pdf"
    HTML(string=contenido, base_url=str(ASSETS)).write_pdf(destino)
    print(f"PDF: {destino}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--solo-md", action="store_true", help="no genera el PDF")
    args = parser.parse_args()
    datos = leer_datos()
    for nombre, caja in datos["cajas"].items():
        bajar_mapa(nombre, caja)
    ficha = documento()
    texto = armar_markdown(ficha, datos)
    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "informe-punto-b.md").write_text(texto, encoding="utf-8", newline="\n")
    print(f"Markdown: {SALIDA / 'informe-punto-b.md'}")
    if not args.solo_md:
        generar_pdf(texto, ficha)


if __name__ == "__main__":
    main()

"""Carga las capas del SIG IGN 250 en PostGIS y las publica en GeoServer (ADR-0010).

Requiere los servicios `postgis` y `geoserver` de docker-compose.yml en marcha. Usa la imagen
oficial de GDAL (ogr2ogr) dentro de la red de Compose, así que no hace falta instalar nada.

    python scripts/cargar_capas_ign.py              # carga y publica todas las capas
    python scripts/cargar_capas_ign.py --solo-publicar   # publica capas y estilos sin recargar

También crea la capa editable `elementos_relevados` (carga de elementos desde el visor) y aplica
la simbología: las 47 capas del IGN con los SLD que genera `scripts/simbologia_ign.py` (ADR-0014) y
la capa editable con `geoserver/estilos/visor_elementos_relevados.sld`.

Es idempotente: vuelve a crear cada tabla (-overwrite) y salta las capas ya publicadas.
"""

import argparse
import base64
import json
import os
import subprocess
import sys
import unicodedata
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from simbologia_ign import ESTILOS as SIMBOLOGIA_IGN
from simbologia_ign import sld as generar_sld

RAIZ = Path(__file__).resolve().parent.parent
ZIP = RAIZ / "docs" / "tpi" / "sig_ign.zip"
CARPETA = RAIZ / "docs" / "tpi" / "sig_ign" / "SIG_IGN2011"
IMAGEN_GDAL = "ghcr.io/osgeo/gdal:ubuntu-small-3.11.3"

DB = os.environ.get("POSTGIS_DB", "sig_ign")
USUARIO = os.environ.get("POSTGIS_USER", "sig_ign")
CLAVE = os.environ.get("POSTGIS_PASSWORD", "sig_ign")
GEOSERVER = os.environ.get("GEOSERVER_URL", "http://localhost:8085/geoserver").rstrip("/")
ESPACIO = os.environ.get("GEOSERVER_WORKSPACE", "ign")
GS_USUARIO = os.environ.get("GEOSERVER_ADMIN_USER", "admin")
GS_CLAVE = os.environ.get("GEOSERVER_ADMIN_PASSWORD", "geoserver")
ALMACEN = "sig_ign"
ESTILOS = RAIZ / "geoserver" / "estilos"
EDITABLE = "elementos_relevados"
ESTILO_EDITABLE = "visor_elementos_relevados"
SQL_EDITABLE = f"""
CREATE TABLE IF NOT EXISTS {EDITABLE} (
    gid serial PRIMARY KEY,
    nombre varchar(120) NOT NULL,
    categoria varchar(60),
    descripcion text,
    responsable varchar(120),
    fecha date DEFAULT current_date,
    geom geometry(Geometry, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS {EDITABLE}_geom_idx ON {EDITABLE} USING gist (geom);
"""


def nombre_tabla(archivo: Path) -> str:
    """'Líneas_de_Conducción_Ene' -> 'lineas_de_conduccion_ene'."""
    sin_acentos = unicodedata.normalize("NFKD", archivo.stem).encode("ascii", "ignore").decode()
    return sin_acentos.lower()


def extraer():
    if CARPETA.exists():
        return
    if not ZIP.exists():
        sys.exit(f"No está {ZIP}. Descargalo desde el enlace de la consigna (docs/tpi/practico.pdf).")
    print("Descomprimiendo sig_ign.zip…")
    with zipfile.ZipFile(ZIP) as archivo:
        archivo.extractall(ZIP.parent)


def red_compose() -> str:
    salida = subprocess.run(
        ["docker", "compose", "ps", "-q", "postgis"], cwd=RAIZ, capture_output=True, text=True, check=True
    ).stdout.strip()
    if not salida:
        sys.exit("PostGIS no está corriendo: docker compose up -d postgis geoserver")
    inspeccion = subprocess.run(
        ["docker", "inspect", "-f", "{{json .NetworkSettings.Networks}}", salida],
        capture_output=True, text=True, check=True,
    ).stdout
    return next(iter(json.loads(inspeccion)))


def cargar(capas: list[Path]):
    red = red_compose()
    conexion = f"PG:host=postgis dbname={DB} user={USUARIO} password={CLAVE}"
    for numero, shp in enumerate(capas, 1):
        tabla = nombre_tabla(shp)
        print(f"[{numero}/{len(capas)}] {shp.stem} -> {tabla}")
        subprocess.run(
            [
                "docker", "run", "--rm", "--network", red, "-v", f"{CARPETA}:/datos:ro", IMAGEN_GDAL,
                "ogr2ogr", "-f", "PostgreSQL", conexion, f"/datos/{shp.name}",
                "-nln", tabla, "-overwrite", "-progress",
                "-nlt", "PROMOTE_TO_MULTI", "-a_srs", "EPSG:4326",
                "-lco", "GEOMETRY_NAME=geom", "-lco", "FID=gid", "-lco", "SPATIAL_INDEX=GIST",
                "-lco", "PRECISION=NO",
                # Los .dbf del IGN están en Windows-1252 (ver registro 2026-10-29).
                "--config", "SHAPE_ENCODING", "CP1252",
            ],
            check=True,
        )


def crear_editable():
    subprocess.run(
        ["docker", "compose", "exec", "-T", "postgis", "psql", "-U", USUARIO, "-d", DB, "-v", "ON_ERROR_STOP=1"],
        cwd=RAIZ, input=SQL_EDITABLE, text=True, check=True, capture_output=True,
    )
    print(f"Capa editable {EDITABLE} lista.")


def geoserver(metodo: str, ruta: str, cuerpo: dict | bytes | None = None, tipo: str = "application/json") -> int:
    credencial = base64.b64encode(f"{GS_USUARIO}:{GS_CLAVE}".encode()).decode()
    datos = json.dumps(cuerpo).encode() if isinstance(cuerpo, dict) else cuerpo
    pedido = urllib.request.Request(
        f"{GEOSERVER}/rest/{ruta}",
        method=metodo,
        data=datos,
        headers={"Authorization": f"Basic {credencial}", "Content-Type": tipo, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(pedido) as respuesta:
            return respuesta.status
    except urllib.error.HTTPError as error:
        return error.code


def publicar(capas: list[tuple[str, str]]):
    if geoserver("GET", f"workspaces/{ESPACIO}") == 404:
        geoserver("POST", "workspaces", {"workspace": {"name": ESPACIO}})
    if geoserver("GET", f"workspaces/{ESPACIO}/datastores/{ALMACEN}") == 404:
        parametros = {"host": "postgis", "port": "5432", "database": DB, "user": USUARIO,
                      "passwd": CLAVE, "dbtype": "postgis", "schema": "public"}
        estado = geoserver("POST", f"workspaces/{ESPACIO}/datastores", {
            "dataStore": {"name": ALMACEN, "connectionParameters": {"entry": [
                {"@key": clave, "$": valor} for clave, valor in parametros.items()
            ]}},
        })
        print(f"Almacén {ALMACEN}: {estado}")
    for tabla, titulo in capas:
        ruta = f"workspaces/{ESPACIO}/datastores/{ALMACEN}/featuretypes"
        if geoserver("GET", f"{ruta}/{tabla}") == 200:
            continue
        tipo = {"name": tabla, "nativeName": tabla, "title": titulo, "srs": "EPSG:4326"}
        estado = geoserver("POST", ruta, {"featureType": tipo})
        print(f"Publicada {ESPACIO}:{tabla} ({estado})")


def estilos() -> list[tuple[str, str, bytes]]:
    """(capa, estilo, SLD): las capas del IGN desde simbologia_ign.py y la editable desde su archivo."""
    generados = [
        (capa, f"ign_{capa}", generar_sld(f"ign_{capa}", estilo).encode())
        for capa, estilo in SIMBOLOGIA_IGN.items()
    ]
    editable = (ESTILOS / f"{ESTILO_EDITABLE}.sld").read_bytes()
    return [*generados, (EDITABLE, ESTILO_EDITABLE, editable)]


def publicar_estilos():
    sld = "application/vnd.ogc.sld+xml"
    ruta = f"workspaces/{ESPACIO}/styles"
    for capa, estilo, contenido in estilos():
        if geoserver("GET", f"{ruta}/{estilo}.json") == 404:
            geoserver("POST", f"{ruta}?name={estilo}", contenido, sld)
        else:
            geoserver("PUT", f"{ruta}/{estilo}", contenido, sld)
        capa_gs = {"layer": {"defaultStyle": {"name": f"{ESPACIO}:{estilo}"}}}
        estado = geoserver("PUT", f"layers/{ESPACIO}:{capa}", capa_gs)
        print(f"Estilo {estilo} -> {capa} ({estado})")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--solo-publicar", action="store_true", help="no recarga PostGIS")
    args = parser.parse_args()
    extraer()
    shapefiles = sorted(CARPETA.glob("*.shp"))
    if not args.solo_publicar:
        cargar(shapefiles)
    crear_editable()
    capas = [(nombre_tabla(shp), shp.stem.replace("_", " ")) for shp in shapefiles]
    publicar([*capas, (EDITABLE, "Elementos relevados")])
    publicar_estilos()
    print(f"Listo: {len(capas)} capas del IGN y {EDITABLE} en {ESPACIO}.")


if __name__ == "__main__":
    main()

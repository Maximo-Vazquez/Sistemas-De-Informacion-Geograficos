"""Carga los shapefiles de un ZIP IGN en el PostGIS local sin extraerlos.

Ejemplo: python scripts/importar_ign.py D:/TPI/sig_ign.zip --ogr2ogr D:/GIS/bin/ogr2ogr.exe

Requiere Docker Compose, el servicio gisdb iniciado y GDAL con driver PostgreSQL.
No sobrescribe tablas existentes: una carga interrumpida solo se reanuda si los
conteos ya cargados coinciden con el ZIP.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import unicodedata
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "docs" / "tpi" / "catalogo_ign.json"
IDENTIFICADOR = re.compile(r"[a-z_][a-z0-9_]{0,62}\Z")


def ejecutar(comando, **opciones):
    return subprocess.run(comando, cwd=RAIZ, check=True, text=True, **opciones)


def tabla_para(nombre):
    base = unicodedata.normalize("NFKD", Path(nombre).stem).encode("ascii", "ignore").decode().lower()
    tabla = re.sub(r"[^a-z0-9_]+", "_", base).strip("_")
    if not IDENTIFICADOR.fullmatch(tabla):
        raise ValueError(f"Nombre de capa no compatible: {nombre}")
    return tabla


def sha256(ruta):
    resumen = hashlib.sha256()
    with ruta.open("rb") as archivo:
        for bloque in iter(lambda: archivo.read(1024 * 1024), b""):
            resumen.update(bloque)
    return resumen.hexdigest()


def capa_zip(archivo, nombre, miembros):
    base = nombre[:-4]
    requeridos = [base + extension for extension in (".dbf", ".shx", ".prj")]
    if not all(ruta in miembros for ruta in requeridos):
        raise ValueError(f"Faltan componentes de {nombre}")
    prj = archivo.read(base + ".prj").decode("utf-8-sig", errors="replace").upper()
    if not prj.startswith("GEOGCS[") or "WGS_1984" not in prj:
        raise ValueError(f"CRS no reconocido para {nombre}; se esperaba WGS 84")
    with archivo.open(base + ".dbf") as dbf:
        cabecera = dbf.read(32)
    if len(cabecera) != 32:
        raise ValueError(f"Cabecera DBF incompleta: {nombre}")
    return {"archivo": nombre, "tabla": tabla_para(nombre), "elementos": struct.unpack("<I", cabecera[4:8])[0]}


def leer_capas(ruta):
    with zipfile.ZipFile(ruta) as archivo:
        miembros = set(archivo.namelist())
        nombres = sorted(nombre for nombre in miembros if nombre.lower().endswith(".shp"))
        capas = [capa_zip(archivo, nombre, miembros) for nombre in nombres]
    if not capas or len({capa["tabla"] for capa in capas}) != len(capas):
        raise ValueError("El ZIP no contiene capas o produce nombres de tabla duplicados")
    return capas


def datos_contenedor():
    identificador = ejecutar(["docker", "compose", "ps", "-q", "gisdb"], capture_output=True).stdout.strip()
    if not identificador:
        raise ValueError("Iniciá PostGIS con: docker compose up -d gisdb")
    inspeccion = json.loads(ejecutar(["docker", "inspect", identificador], capture_output=True).stdout)[0]
    entorno = dict(item.split("=", 1) for item in inspeccion["Config"]["Env"] if "=" in item)
    for clave in ("POSTGRES_USER", "POSTGRES_DB"):
        if not IDENTIFICADOR.fullmatch(entorno[clave]):
            raise ValueError(f"Identificador PostgreSQL no admitido: {clave}")
    puertos = inspeccion["NetworkSettings"]["Ports"]["5432/tcp"]
    if not puertos or not entorno.get("POSTGRES_PASSWORD"):
        raise ValueError("Falta puerto o contraseña en el contenedor gisdb")
    return entorno, puertos[0]["HostPort"]


def consulta(entorno, sql):
    comando = [
        "docker", "compose", "exec", "-T", "gisdb", "psql", "-v", "ON_ERROR_STOP=1", "-At",
        "-U", entorno["POSTGRES_USER"], "-d", entorno["POSTGRES_DB"], "-c", sql,
    ]
    return ejecutar(comando, capture_output=True).stdout.strip()


def existentes(entorno):
    sql = "SELECT f_table_name FROM geometry_columns WHERE f_table_schema = 'ign' ORDER BY f_table_name"
    return set(consulta(entorno, sql).splitlines())


def verificar_cantidad(entorno, capa):
    total = int(consulta(entorno, f'SELECT count(*) FROM ign."{capa["tabla"]}"'))
    if total != capa["elementos"]:
        raise ValueError(f'{capa["tabla"]}: esperados {capa["elementos"]}, cargados {total}')


def entorno_gdal(ogr, postgres):
    entorno = {**os.environ, "PGPASSWORD": postgres["POSTGRES_PASSWORD"], "PG_USE_COPY": "YES"}
    raiz = ogr.parent.parent
    for variable, carpeta in (("GDAL_DATA", "gdal"), ("PROJ_DATA", "proj")):
        directorio = raiz / "share" / carpeta
        if directorio.is_dir():
            entorno[variable] = str(directorio)
    return entorno


def importar_capa(archivo, ogr, entorno, conexion, capa):
    origen = f'/vsizip/{archivo.as_posix()}/{capa["archivo"]}'
    comando = [
        str(ogr), "-f", "PostgreSQL", conexion, origen, "-nln", capa["tabla"],
        "-lco", "SCHEMA=ign", "-lco", "GEOMETRY_NAME=geom", "-lco", "FID=ogc_fid",
        "-lco", "LAUNDER_ASCII=YES", "-lco", "PRECISION=NO", "-nlt", "PROMOTE_TO_MULTI",
        "-gt", "65536",
    ]
    ejecutar(comando, env=entorno, capture_output=True, encoding="utf-8", errors="replace")


def procesar(archivo, ogr):
    capas = leer_capas(archivo)
    postgres, puerto = datos_contenedor()
    consulta(postgres, "CREATE SCHEMA IF NOT EXISTS ign")
    cargadas = existentes(postgres)
    conexion = f'PG:host=127.0.0.1 port={puerto} dbname={postgres["POSTGRES_DB"]} user={postgres["POSTGRES_USER"]}'
    entorno = entorno_gdal(ogr, postgres)
    for numero, capa in enumerate(capas, 1):
        nombre = capa["tabla"]
        if nombre not in cargadas:
            print(f'[{numero}/{len(capas)}] Cargando {nombre} ({capa["elementos"]} elementos)...', flush=True)
            importar_capa(archivo, ogr, entorno, conexion, capa)
        verificar_cantidad(postgres, capa)
        print(f'[{numero}/{len(capas)}] {nombre}: cantidad verificada.', flush=True)
    catalogo = {"archivo": archivo.name, "sha256": sha256(archivo), "srid": 4326, "capas": capas}
    CATALOGO.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Carga verificada: {len(capas)} capas. Catálogo: {CATALOGO}")


def buscar_ogr(ruta):
    if ruta.is_file():
        return ruta.resolve()
    ejecutable = shutil.which(str(ruta))
    if not ejecutable:
        raise FileNotFoundError(f"No se encontró ogr2ogr: {ruta}")
    return Path(ejecutable).resolve()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archivo", type=Path, help="ZIP con shapefiles IGN")
    parser.add_argument("--ogr2ogr", type=Path, default=Path("ogr2ogr"), help="Ruta al ejecutable GDAL")
    argumentos = parser.parse_args()
    try:
        procesar(argumentos.archivo.resolve(strict=True), buscar_ogr(argumentos.ogr2ogr))
    except (OSError, ValueError, subprocess.CalledProcessError, zipfile.BadZipFile) as error:
        if isinstance(error, subprocess.CalledProcessError) and error.stderr:
            print(error.stderr, file=sys.stderr)
        print(f"No se completó la importación: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

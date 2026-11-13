"""Publica en GeoServer las capas verificadas por scripts/importar_ign.py.

Ejemplo: python scripts/publicar_ign.py

Requiere los servicios geoserver y gisdb en ejecución. Lee sus credenciales del
entorno de Docker y nunca las imprime ni guarda en el repositorio.
"""

import argparse
import base64
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "docs" / "tpi" / "catalogo_ign.json"
ESPACIO = "ign"
PREFIJO = "sig2011_"


def inspeccionar(servicio):
    comando = ["docker", "compose", "ps", "-q", servicio]
    identificador = subprocess.check_output(comando, cwd=RAIZ, text=True).strip()
    if not identificador:
        raise ValueError(f"El servicio {servicio} no está iniciado")
    info = json.loads(subprocess.check_output(["docker", "inspect", identificador], text=True))[0]
    entorno = dict(item.split("=", 1) for item in info["Config"]["Env"] if "=" in item)
    return info, entorno


class GeoServer:
    def __init__(self, info, entorno):
        puerto = info["NetworkSettings"]["Ports"]["8080/tcp"][0]["HostPort"]
        self.base = f"http://localhost:{puerto}/geoserver/rest"
        login = entorno.get("GEOSERVER_ADMIN_USER", "admin") + ":" + entorno["GEOSERVER_ADMIN_PASSWORD"]
        self.autorizacion = "Basic " + base64.b64encode(login.encode()).decode()

    def solicitud(self, ruta, metodo="GET", datos=None):
        cuerpo = json.dumps(datos).encode("utf-8") if datos is not None else None
        cabeceras = {
            "Authorization": self.autorizacion,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        pedido = urllib.request.Request(self.base + ruta, data=cuerpo, headers=cabeceras, method=metodo)
        try:
            with urllib.request.urlopen(pedido, timeout=120) as respuesta:
                contenido = respuesta.read()
                return json.loads(contenido) if contenido and metodo == "GET" else {}
        except urllib.error.HTTPError as error:
            if error.code == 404 and metodo == "GET":
                return None
            raise ValueError(f"GeoServer respondió HTTP {error.code} en {metodo} {ruta}") from None


def crear_espacio(servidor):
    if servidor.solicitud(f"/workspaces/{ESPACIO}.json") is None:
        servidor.solicitud("/workspaces", "POST", {"workspace": {"name": ESPACIO}})


def parametros_postgis(postgres):
    valores = {
        "dbtype": "postgis",
        "host": "gisdb",
        "port": "5432",
        "database": postgres["POSTGRES_DB"],
        "schema": "ign",
        "user": postgres["POSTGRES_USER"],
        "passwd": postgres["POSTGRES_PASSWORD"],
        "namespace": "http://ign",
        "Expose primary keys": "true",
    }
    return {"entry": [{"@key": clave, "$": valor} for clave, valor in valores.items()]}


def configurar_almacen(servidor, postgres, nombre):
    ruta = f"/workspaces/{ESPACIO}/datastores/{nombre}"
    actual = servidor.solicitud(ruta + ".json")
    if actual and conexion_coincide(actual, postgres):
        print(f"Almacén {nombre}: ya apunta al PostGIS del proyecto.", flush=True)
        return
    if actual:
        raise ValueError(f"El almacén {nombre} ya existe con otra conexión; elegí otro nombre")
    almacen = {"dataStore": {"name": nombre, "type": "PostGIS", "enabled": True}}
    almacen["dataStore"]["connectionParameters"] = parametros_postgis(postgres)
    servidor.solicitud(f"/workspaces/{ESPACIO}/datastores", "POST", almacen)
    print(f"Almacén {nombre}: conexión con PostGIS preparada.", flush=True)


def conexion_coincide(actual, postgres):
    entradas = actual["dataStore"]["connectionParameters"]["entry"]
    valores = {entrada["@key"]: entrada.get("$", "") for entrada in entradas}
    return all(
        valores.get(clave) == valor
        for clave, valor in {"host": "gisdb", "database": postgres["POSTGRES_DB"], "schema": "ign"}.items()
    )


def nombre_publico(tabla, existentes, globales):
    prefijado = PREFIJO + tabla
    if tabla in existentes:
        return tabla
    if prefijado in existentes:
        return prefijado
    ocupados = {nombre.casefold() for nombre in globales}
    if tabla.casefold() not in ocupados:
        return tabla
    if prefijado.casefold() in ocupados:
        raise ValueError(f"Ya existe una capa con el nombre {prefijado} en otro almacén")
    return prefijado


def registrar_capa(servidor, almacen, capa, existentes, globales):
    tabla = capa["tabla"]
    nombre = nombre_publico(tabla, existentes, globales)
    ruta = f"/workspaces/{ESPACIO}/datastores/{almacen}/featuretypes"
    titulo = Path(capa["archivo"]).stem.replace("_", " ")
    if nombre.startswith(PREFIJO):
        titulo += " (SIG IGN 250)"
    tipo = {"name": nombre, "nativeName": tabla, "title": titulo}
    if nombre in existentes:
        opciones = "?recalculate=attributes,nativebbox,latlonbbox"
        servidor.solicitud(ruta + "/" + urllib.parse.quote(nombre, safe="") + opciones, "PUT", {"featureType": tipo})
    else:
        tipo.update({"srs": "EPSG:4326", "enabled": True})
        servidor.solicitud(ruta, "POST", {"featureType": tipo})
    globales.add(nombre)
    print(f"Publicada: {nombre}", flush=True)


def capas_existentes(servidor, almacen):
    respuesta = servidor.solicitud(f"/workspaces/{ESPACIO}/datastores/{almacen}/featuretypes.json")
    tipos = respuesta.get("featureTypes", {}) if respuesta else {}
    return {tipo["name"] for tipo in tipos.get("featureType", [])} if isinstance(tipos, dict) else set()


def capas_del_espacio(servidor):
    respuesta = servidor.solicitud(f"/workspaces/{ESPACIO}/layers.json") or {}
    capas = respuesta.get("layers") or {}
    return {capa["name"] for capa in capas.get("layer", [])} if isinstance(capas, dict) else set()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--almacen", default="sig_ign2011", help="Nombre del almacén de GeoServer")
    argumentos = parser.parse_args()
    try:
        catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
        info, credenciales = inspeccionar("geoserver")
        _, postgres = inspeccionar("gisdb")
        servidor = GeoServer(info, credenciales)
        crear_espacio(servidor)
        configurar_almacen(servidor, postgres, argumentos.almacen)
        existentes = capas_existentes(servidor, argumentos.almacen)
        globales = capas_del_espacio(servidor)
        for capa in catalogo["capas"]:
            registrar_capa(servidor, argumentos.almacen, capa, existentes, globales)
        print(f'Publicación terminada: {len(catalogo["capas"])} capas.')
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(f"No se completó la publicación: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

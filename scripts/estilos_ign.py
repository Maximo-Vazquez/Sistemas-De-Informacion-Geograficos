"""Carga en GeoServer la simbología de scripts/simbologia_ign.py y la asigna a cada capa IGN.

Ejemplo: python scripts/estilos_ign.py

Requiere los servicios geoserver y gisdb en ejecución y las capas ya publicadas con
scripts/publicar_ign.py. Se puede repetir: actualiza los estilos que ya existen.
"""

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

from publicar_ign import CATALOGO, ESPACIO, PREFIJO, GeoServer, capas_existentes, inspeccionar
from simbologia_ign import ESTILOS, sld

TIPO_SLD = "application/vnd.ogc.sld+xml"


def enviar_sld(servidor, ruta, metodo, contenido):
    cabeceras = {"Authorization": servidor.autorizacion, "Content-Type": TIPO_SLD}
    pedido = urllib.request.Request(servidor.base + ruta, data=contenido.encode("utf-8"), headers=cabeceras,
                                    method=metodo)
    try:
        with urllib.request.urlopen(pedido, timeout=60):
            pass
    except urllib.error.HTTPError as error:
        detalle = error.read().decode("utf-8", errors="replace")[:300]
        raise ValueError(f"GeoServer respondió HTTP {error.code} en {metodo} {ruta}: {detalle}") from None


def guardar_estilo(servidor, nombre, contenido):
    estilos = f"/workspaces/{ESPACIO}/styles"
    if servidor.solicitud(f"{estilos}/{nombre}.json") is None:
        enviar_sld(servidor, f"{estilos}?name={urllib.parse.quote(nombre)}", "POST", contenido)
    else:
        enviar_sld(servidor, f"{estilos}/{nombre}", "PUT", contenido)


def asignar_estilo(servidor, capa, nombre):
    cambio = {"layer": {"defaultStyle": {"name": nombre, "workspace": ESPACIO}}}
    servidor.solicitud(f"/workspaces/{ESPACIO}/layers/{urllib.parse.quote(capa, safe='')}", "PUT", cambio)


def nombre_publicado(tabla, publicadas):
    """publicar_ign.py agrega el prefijo cuando el nombre ya estaba ocupado en el espacio."""
    for candidato in (tabla, PREFIJO + tabla):
        if candidato in publicadas:
            return candidato
    return None


def aplicar(servidor, almacen):
    publicadas = capas_existentes(servidor, almacen)
    tablas = [capa["tabla"] for capa in json.loads(CATALOGO.read_text(encoding="utf-8"))["capas"]]
    faltantes = []
    for tabla in tablas:
        capa = nombre_publicado(tabla, publicadas)
        estilo = ESTILOS.get(tabla)
        if capa is None or estilo is None:
            faltantes.append(tabla)
            continue
        nombre = f"ign_{tabla}"
        guardar_estilo(servidor, nombre, sld(nombre, estilo))
        asignar_estilo(servidor, capa, nombre)
        print(f"Estilo aplicado: {capa} ({len(estilo.clases)} clases)", flush=True)
    return len(tablas) - len(faltantes), faltantes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--almacen", default="sig_ign2011", help="Almacén de GeoServer con las capas IGN")
    argumentos = parser.parse_args()
    try:
        info, credenciales = inspeccionar("geoserver")
        aplicadas, faltantes = aplicar(GeoServer(info, credenciales), argumentos.almacen)
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(f"No se completó la carga de estilos: {error}", file=sys.stderr)
        return 1
    print(f"Estilos aplicados: {aplicadas} capas.")
    if faltantes:
        print(f"Sin publicar o sin estilo definido: {', '.join(faltantes)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Análisis del punto b: la RN 11 en la Provincia del Chaco (ADR-0017).

Ejecuta scripts/analisis_rn11.sql en PostGIS (esquema `analisis`), imprime el resumen y publica
en GeoServer las capas de la traza, las áreas de influencia, las localidades y los puentes, cada
una con su simbología.

    python scripts/analisis_rn11.py               # analiza y publica
    python scripts/analisis_rn11.py --sin-publicar

Requiere los servicios `postgis` y `geoserver` en marcha y las capas del IGN cargadas
(scripts/cargar_capas_ign.py). Se puede repetir: recrea el esquema y actualiza los estilos.
"""

import argparse
import json
import subprocess
import sys

from cargar_capas_ign import CLAVE, DB, ESPACIO, RAIZ, USUARIO, geoserver
from simbologia_ign import Clase, Estilo, linea, poligono, punto, sld, texto

SQL = RAIZ / "scripts" / "analisis_rn11.sql"
ALMACEN = "analisis"
TIPO_SLD = "application/vnd.ogc.sld+xml"

ROJO, NARANJA, AMBAR, AZUL = "#d7263d", "#f46036", "#f9c74f", "#1b4f9c"

# Capa -> (título, estilo). El orden es el de dibujo: las áreas abajo, los puentes arriba.
CAPAS = {
    "rn11_areas": ("Áreas de influencia de la RN 11", Estilo("Áreas de influencia", atributo="categoria", clases=[
        Clase("De 10 a 20 km", poligono(AMBAR, "#c99a1e", 0.28, 0.8), ("10 a 20 km",)),
        Clase("Hasta 10 km", poligono(NARANJA, "#c4471f", 0.32, 0.8), ("0 a 10 km",)),
    ])),
    "rn11_chaco": ("Traza de la RN 11 en el Chaco", Estilo("Traza de la RN 11", clases=[
        Clase("RN 11 (172 km en el Chaco)", linea("#ffffff", 7) + linea(ROJO, 4)),
    ])),
    "rn11_localidades": ("Localidades en el área de influencia", Estilo(
        "Localidades afectadas", atributo="clase", etiqueta="nombre", clases=[
            Clase("Fuera del Chaco (no se cuenta)", punto("circle", "#9e9e9e", 6) + texto("nombre", 9),
                  ("Fuera del Chaco",)),
            Clase("Localidad a 10–20 km", punto("circle", AMBAR, 8) + texto("nombre", 10), ("10 a 20 km",)),
            Clase("Localidad hasta 10 km", punto("circle", NARANJA, 9) + texto("nombre", 11, negrita=True),
                  ("0 a 10 km",)),
        ])),
    "rn11_puentes": ("Puentes sobre la RN 11", Estilo("Puentes de la RN 11", clases=[
        Clase("Puente sobre la traza", punto("square", AZUL, 11) + texto("gid", 9, negrita=True)),
    ])),
}

CONSULTA_RESUMEN = "SELECT row_to_json(r) FROM analisis.rn11_resumen r"


def psql(*argumentos: str, entrada: str | None = None) -> str:
    comando = ["docker", "compose", "exec", "-T", "postgis", "psql", "-U", USUARIO, "-d", DB,
               "-v", "ON_ERROR_STOP=1", "-q", *argumentos]
    resultado = subprocess.run(comando, cwd=RAIZ, input=entrada, capture_output=True, text=True,
                               encoding="utf-8")
    if resultado.returncode != 0:
        sys.exit(f"PostGIS devolvió un error:\n{resultado.stderr.strip()}")
    return resultado.stdout


def analizar() -> dict:
    psql(entrada=SQL.read_text(encoding="utf-8"))
    return json.loads(psql("-At", "-c", CONSULTA_RESUMEN))


def crear_almacen():
    ruta = f"workspaces/{ESPACIO}/datastores"
    if geoserver("GET", f"{ruta}/{ALMACEN}") == 200:
        return
    parametros = {"host": "postgis", "port": "5432", "database": DB, "user": USUARIO,
                  "passwd": CLAVE, "dbtype": "postgis", "schema": "analisis"}
    estado = geoserver("POST", ruta, {"dataStore": {"name": ALMACEN, "connectionParameters": {"entry": [
        {"@key": clave, "$": valor} for clave, valor in parametros.items()
    ]}}})
    print(f"Almacén {ALMACEN}: {estado}")


def publicar():
    crear_almacen()
    tipos = f"workspaces/{ESPACIO}/datastores/{ALMACEN}/featuretypes"
    estilos = f"workspaces/{ESPACIO}/styles"
    for capa, (titulo, estilo) in CAPAS.items():
        # Las tablas se recrean en cada corrida: se vuelve a publicar para que GeoServer relea el esquema.
        if geoserver("GET", f"{tipos}/{capa}") == 200:
            geoserver("DELETE", f"layers/{ESPACIO}:{capa}")
            geoserver("DELETE", f"{tipos}/{capa}")
        geoserver("POST", tipos, {"featureType": {"name": capa, "nativeName": capa, "title": titulo,
                                                  "srs": "EPSG:4326"}})
        nombre = f"analisis_{capa}"
        contenido = sld(nombre, estilo).encode()
        if geoserver("GET", f"{estilos}/{nombre}.json") == 404:
            geoserver("POST", f"{estilos}?name={nombre}", contenido, TIPO_SLD)
        else:
            geoserver("PUT", f"{estilos}/{nombre}", contenido, TIPO_SLD)
        estado = geoserver("PUT", f"layers/{ESPACIO}:{capa}",
                           {"layer": {"defaultStyle": {"name": f"{ESPACIO}:{nombre}"}}})
        print(f"Publicada {ESPACIO}:{capa} con estilo {nombre} ({estado})")


def mostrar(resumen: dict):
    print("\nResumen del análisis (analisis.rn11_resumen)")
    print(f"  Traza de la RN 11 en el Chaco: {resumen['km_traza']} km ({resumen['partes_traza']} parte)")
    for clave, titulo in (("0_10", "Población hasta 10 km"), ("10_20", "Población de 10 a 20 km")):
        print(f"  {titulo}: {resumen[f'poblacion_{clave}']:,} hab. ({resumen[f'localidades_{clave}']} localidades)")
    print(f"  Fuera del Chaco (contexto): {resumen['poblacion_fuera_del_chaco']:,} hab.")
    print(f"  Puentes sobre la traza: {resumen['puentes']} "
          f"(cruces con cursos de agua: {resumen['cruces_con_cursos_de_agua']})")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sin-publicar", action="store_true", help="solo recalcula en PostGIS")
    args = parser.parse_args()
    resumen = analizar()
    if resumen["partes_traza"] != 1:
        sys.exit("La traza quedó partida en varias líneas: revisar los tramos de red_vial.")
    if not args.sin_publicar:
        publicar()
    mostrar(resumen)


if __name__ == "__main__":
    main()

"""Punto b en QGIS: análisis de la RN 11 en el Chaco con algoritmos de Procesamiento (ADR-0017).

Lee las capas del IGN desde PostGIS, resuelve los cinco pasos con las herramientas de
Procesamiento de QGIS y guarda los resultados en el esquema `analisis` de PostGIS, de donde los
toman GeoServer (scripts/publicar_analisis_rn11.py), el panel, el informe y el video. Además
genera las figuras del informe (una por paso) y el proyecto docs/tpi/punto-b/qgis/rn11.qgz.

    D:\\qgis\\bin\\python-qgis.bat scripts\\analisis_rn11_qgis.py

Usa el Python de QGIS (no el .venv) y necesita PostGIS en 127.0.0.1:5433. La variable
ANALISIS_ESQUEMA cambia el esquema de destino (por defecto, `analisis`).
"""

import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.append(os.environ.get("QGIS_PLUGINS", r"D:\qgis\apps\qgis\python\plugins"))

from qgis.core import (  # noqa: E402
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsCoordinateTransform,
    QgsDataSourceUri,
    QgsDatumTransform,
    QgsFeature,
    QgsField,
    QgsFillSymbol,
    QgsGeometry,
    QgsLineSymbol,
    QgsMapRendererParallelJob,
    QgsMapSettings,
    QgsMarkerSymbol,
    QgsPalLayerSettings,
    QgsProject,
    QgsProviderRegistry,
    QgsReferencedRectangle,
    QgsSpatialIndex,
    QgsTextBufferSettings,
    QgsTextFormat,
    QgsVectorFileWriter,
    QgsVectorLayer,
    QgsVectorLayerExporter,
    QgsVectorLayerSimpleLabeling,
)
from qgis.PyQt.QtCore import QMetaType, QSize  # noqa: E402
from qgis.PyQt.QtGui import QColor, QFont  # noqa: E402

APP = QgsApplication([], False)
APP.initQgis()
from processing.core.Processing import Processing  # noqa: E402

Processing.initialize()
import processing  # noqa: E402

SALIDA = RAIZ / "docs" / "tpi" / "punto-b"
FIGURAS = SALIDA / "figuras"
CARPETA_QGIS = SALIDA / "qgis"
GPKG = CARPETA_QGIS / "rn11_qgis.gpkg"
POSGAR = QgsCoordinateReferenceSystem("EPSG:5347")
WGS84 = QgsCoordinateReferenceSystem("EPSG:4326")
ESQUEMA = os.environ.get("ANALISIS_ESQUEMA", "analisis")
CONEXION = ("127.0.0.1", os.environ.get("POSTGIS_PORT", "5433"), "sig_ign", "sig_ign",
            os.environ.get("POSTGIS_PASSWORD", "sig_ign"))


def capa_postgis(esquema, tabla, nombre, filtro=""):
    uri = QgsDataSourceUri()
    uri.setConnection(*CONEXION)
    uri.setDataSource(esquema, tabla, "geom", filtro)
    capa = QgsVectorLayer(uri.uri(False), nombre, "postgres")
    if not capa.isValid():
        sys.exit(f"No se pudo abrir {esquema}.{tabla}: ¿está corriendo PostGIS en {CONEXION[1]}?")
    return capa


def correr(algoritmo, nombre, **parametros):
    salida = processing.run(algoritmo, {**parametros, "OUTPUT": "TEMPORARY_OUTPUT"})["OUTPUT"]
    salida.setName(nombre)
    print(f"  {algoritmo:<32} -> {nombre} ({salida.featureCount()} elementos)")
    return salida


def fijar_transformacion():
    """WGS 84 -> POSGAR 2007 con la transformación de mayor precisión (0,5 m), sin preguntar."""
    proyecto = QgsProject.instance()
    proyecto.setCrs(POSGAR)
    operacion = QgsDatumTransform.operations(WGS84, POSGAR)[0]
    contexto_transformacion = proyecto.transformContext()
    contexto_transformacion.addCoordinateOperation(WGS84, POSGAR, operacion.proj)
    proyecto.setTransformContext(contexto_transformacion)
    print(f"Transformación: {operacion.name} ({operacion.accuracy} m)")


# --- Análisis ----------------------------------------------------------------------------

def mas_cercano(capa, geometria, distancia_maxima):
    """Elemento de `capa` más cercano a `geometria` (hasta `distancia_maxima` metros), o None."""
    if not hasattr(capa, "_indice"):
        capa._indice = QgsSpatialIndex(capa.getFeatures(), flags=QgsSpatialIndex.FlagStoreFeatureGeometries)
    ids = capa._indice.nearestNeighbor(geometria, 1, distancia_maxima)
    return capa.getFeature(ids[0]) if ids else None


def analizar():
    print("Paso 1. Extraer la RN 11 nacional y recortarla al Chaco")
    red_vial = capa_postgis("public", "red_vial", "Red vial")
    provincias = capa_postgis("public", "provincias", "Provincias")
    chaco = correr("native:extractbyattribute", "Chaco", INPUT=provincias, FIELD="provincia",
                   OPERATOR=0, VALUE="Chaco")
    rn11 = correr("native:extractbyexpression", "RN 11 nacional", INPUT=red_vial,
                  EXPRESSION="\"nro_ruta\" = '11' AND \"administra\" = 'Nacional'")
    recorte = correr("native:clip", "RN 11 en el Chaco", INPUT=rn11, OVERLAY=chaco)

    print("Paso 2. Reproyectar a POSGAR 2007 faja 5 y medir")
    traza = correr("native:dissolve", "Traza RN 11 (POSGAR)",
                   INPUT=correr("native:reprojectlayer", "RN 11 reproyectada", INPUT=recorte, TARGET_CRS=POSGAR))
    traza = correr("native:mergelines", "Traza RN 11", INPUT=traza)
    linea = next(traza.getFeatures()).geometry()

    print("Paso 3. Áreas de influencia de 10 y 20 km")
    chaco_m = correr("native:reprojectlayer", "Chaco (POSGAR)", INPUT=chaco, TARGET_CRS=POSGAR)
    b10 = correr("native:buffer", "Buffer 10 km", INPUT=traza, DISTANCE=10000, SEGMENTS=16, DISSOLVE=True)
    b20 = correr("native:buffer", "Buffer 20 km", INPUT=traza, DISTANCE=20000, SEGMENTS=16, DISSOLVE=True)
    area10 = correr("native:clip", "Hasta 10 km", INPUT=b10, OVERLAY=chaco_m)
    anillo = correr("native:difference", "De 10 a 20 km",
                    INPUT=correr("native:clip", "Buffer 20 km en el Chaco", INPUT=b20, OVERLAY=chaco_m),
                    OVERLAY=b10)

    print("Paso 4. Localidades dentro de cada área (selección por ubicación)")
    localidades = correr("native:reprojectlayer", "Localidades (POSGAR)",
                         INPUT=capa_postgis("public", "localidades", "Localidades"), TARGET_CRS=POSGAR)
    # La provincia sale del atributo y no del polígono: sobre el río Bermejo, que es el límite, el
    # punto de General Lucio V. Mansilla (Formosa) cae dentro del polígono del Chaco.
    del_chaco = correr("native:extractbyattribute", "Localidades del Chaco", INPUT=localidades,
                       FIELD="provincia", OPERATOR=0, VALUE="Chaco")
    loc10 = correr("native:extractbylocation", "Localidades hasta 10 km", INPUT=del_chaco,
                   PREDICATE=[6], INTERSECT=area10)
    loc20 = correr("native:extractbylocation", "Localidades de 10 a 20 km", INPUT=del_chaco,
                   PREDICATE=[6], INTERSECT=anillo)
    # Contexto: localidades de otras provincias a 20 km o menos (no suman a la población afectada).
    fuera = correr("native:extractwithindistance", "Localidades de otras provincias a 20 km",
                   INPUT=correr("native:extractbyexpression", "Localidades de otras provincias",
                                INPUT=localidades, EXPRESSION="\"provincia\" IS NULL OR \"provincia\" <> 'Chaco'"),
                   REFERENCE=traza, DISTANCE=20000)

    print("Paso 5. Puentes de la traza (a 500 m y con la RN 11 como camino más cercano)")
    puentes = correr("native:reprojectlayer", "Puentes (POSGAR)",
                     INPUT=capa_postgis("public", "puente_red_vial_puntos", "Puentes"), TARGET_CRS=POSGAR)
    cerca = correr("native:extractwithindistance", "Puentes a 500 m", INPUT=puentes, REFERENCE=traza,
                   DISTANCE=500)
    vias = correr("native:reprojectlayer", "Red vial cercana (POSGAR)", INPUT=correr(
        "native:extractbylocation", "Red vial en el Chaco", INPUT=red_vial, PREDICATE=[0], INTERSECT=chaco),
        TARGET_CRS=POSGAR)
    unidos = correr("native:joinbynearest", "Puentes con su camino más cercano", INPUT=cerca, INPUT_2=vias,
                    FIELDS_TO_COPY=["nro_ruta", "administra"], NEIGHBORS=1, PREFIX="via_")
    puentes_rn11 = correr("native:extractbyexpression", "Puentes de la RN 11", INPUT=unidos,
                          EXPRESSION="\"via_nro_ruta\" = '11' AND \"via_administra\" = 'Nacional'")
    ubicar_en_traza(puentes_rn11, linea)

    # Cursos de agua cerca de la traza: para saber qué cruza cada puente y para contar los cruces.
    cursos = correr("native:extractwithindistance", "Cursos de agua a 25 km",
                    INPUT=correr("native:reprojectlayer", "Cursos de agua (POSGAR)",
                                 INPUT=capa_postgis("public", "curso_de_agua_hid", "Cursos de agua"),
                                 TARGET_CRS=POSGAR),
                    REFERENCE=traza, DISTANCE=25000)
    cruces = correr("native:extractbylocation", "Cursos de agua que cruzan la traza", INPUT=cursos,
                    PREDICATE=[0], INTERSECT=traza)

    capas = {"chaco": chaco_m, "traza": traza, "area10": area10, "anillo": anillo, "loc10": loc10,
             "loc20": loc20, "puentes": puentes_rn11, "rn11": rn11}
    datos = {"linea": linea, "fuera": fuera, "cursos": cursos, "localidades": localidades,
             "cruces": cruces.featureCount()}
    return capas, datos


def ubicar_en_traza(puentes, linea):
    """Agrega a cada puente su kilómetro sobre la traza, medido desde el límite con Santa Fe."""
    eje = QgsGeometry(linea.constGet().geometryN(0).clone()) if linea.isMultipart() else linea
    proveedor = puentes.dataProvider()
    proveedor.addAttributes([QgsField("km_traza", QMetaType.Type.Double)])
    puentes.updateFields()
    indice = puentes.fields().indexOf("km_traza")
    cambios = {}
    for puente in puentes.getFeatures():
        punto = QgsGeometry.fromPointXY(puente.geometry().asMultiPoint()[0])
        cambios[puente.id()] = {indice: round(eje.lineLocatePoint(punto) / 1000, 1)}
    proveedor.changeAttributeValues(cambios)
    print(f"  lineLocatePoint                  -> km de traza de {len(cambios)} puentes")


# --- Resultados en PostGIS ---------------------------------------------------------------

CAMPOS = {
    "rn11_chaco": ("MultiLineString", [("gid", "integer"), ("nombre", "string"), ("km", "double"),
                                       ("partes", "integer")]),
    "rn11_areas": ("MultiPolygon", [("gid", "integer"), ("categoria", "string"), ("km2", "double")]),
    "rn11_localidades": ("MultiPoint", [
        ("gid", "integer"), ("nombre", "string"), ("tipo", "string"), ("departamento", "string"),
        ("provincia", "string"), ("habitantes", "integer"), ("con_dato", "boolean"), ("distancia_km", "double"),
        ("categoria", "string"), ("en_chaco", "boolean"), ("clase", "string")]),
    "rn11_puentes": ("MultiPoint", [
        ("gid", "integer"), ("numero", "integer"), ("gid_ign", "integer"), ("km_traza", "double"),
        ("distancia_traza_m", "double"), ("curso_de_agua", "string"), ("regimen", "string"),
        ("distancia_agua_m", "double"), ("localidad_cercana", "string"), ("distancia_localidad_km", "double")]),
}


def tablas(capas, datos):
    """Filas de cada tabla de resultados: (geometría en POSGAR, atributos)."""
    linea = datos["linea"]
    filas = {"rn11_chaco": [(linea, [1, "Ruta Nacional 11", round(linea.length() / 1000, 2),
                                     linea.constGet().numGeometries() if linea.isMultipart() else 1])]}
    filas["rn11_areas"] = []
    for gid, categoria, capa in ((1, "0 a 10 km", capas["area10"]), (2, "10 a 20 km", capas["anillo"])):
        area = next(capa.getFeatures()).geometry()
        filas["rn11_areas"].append((area, [gid, categoria, round(area.area() / 1e6, 1)]))

    localidades = []
    for capa in (capas["loc10"], capas["loc20"], datos["fuera"]):
        for f in capa.getFeatures():
            distancia = f.geometry().distance(linea)
            categoria = "0 a 10 km" if distancia <= 10000 else "10 a 20 km"
            en_chaco = f["provincia"] == "Chaco"
            habitantes = int(f["canthab"] or 0)
            localidades.append((distancia, f.geometry(), [
                f["nombre"], f["tipo"], f["departamen"], f["provincia"], habitantes, habitantes > 0,
                round(distancia / 1000, 2), categoria, en_chaco, categoria if en_chaco else "Fuera del Chaco"]))
    localidades.sort(key=lambda fila: fila[0])
    filas["rn11_localidades"] = [(g, [i, *atributos]) for i, (_, g, atributos) in enumerate(localidades, 1)]

    puentes = sorted(capas["puentes"].getFeatures(), key=lambda f: f["km_traza"])
    filas["rn11_puentes"] = []
    for numero, f in enumerate(puentes, 1):
        g = f.geometry()
        agua = mas_cercano(datos["cursos"], g, 5000)
        lugar = mas_cercano(datos["localidades"], g, 50000)
        filas["rn11_puentes"].append((g, [
            numero, numero, f["gid"], f["km_traza"], round(g.distance(linea)),
            agua["nombre"] if agua else None, agua["régimen"] if agua else None,
            round(agua.geometry().distance(g)) if agua else None,
            lugar["nombre"] if lugar else None, round(lugar.geometry().distance(g) / 1000, 1) if lugar else None]))
    return filas


def resumen(filas, datos):
    nombres = [c for c, _ in CAMPOS["rn11_localidades"][1]]
    localidades = [dict(zip(nombres, a, strict=True)) for _, a in filas["rn11_localidades"]]

    def de(categoria):
        return [x for x in localidades if x["en_chaco"] and x["categoria"] == categoria]

    traza = filas["rn11_chaco"][0][1]
    return {"km_traza": traza[2], "partes_traza": traza[3],
            "poblacion_0_10": sum(x["habitantes"] for x in de("0 a 10 km")),
            "poblacion_10_20": sum(x["habitantes"] for x in de("10 a 20 km")),
            "localidades_0_10": len(de("0 a 10 km")), "localidades_10_20": len(de("10 a 20 km")),
            "localidades_con_dato": sum(1 for x in localidades if x["en_chaco"] and x["con_dato"]),
            "poblacion_fuera_del_chaco": sum(x["habitantes"] for x in localidades if not x["en_chaco"]),
            "puentes": len(filas["rn11_puentes"]), "cruces_con_cursos_de_agua": datos["cruces"]}


def conexion_sql():
    uri = QgsDataSourceUri()
    uri.setConnection(*CONEXION)
    return QgsProviderRegistry.instance().providerMetadata("postgres").createConnection(uri.uri(False), {})


def escribir(filas, numeros):
    """Guarda las capas en EPSG:4326 (como las del IGN) en el esquema de resultados de PostGIS."""
    sql = conexion_sql()
    sql.executeSql(f"DROP SCHEMA IF EXISTS {ESQUEMA} CASCADE; CREATE SCHEMA {ESQUEMA}")
    a_wgs84 = QgsCoordinateTransform(POSGAR, WGS84, QgsProject.instance().transformContext())
    for tabla, (tipo, campos) in CAMPOS.items():
        definicion = "&".join(f"field={nombre}:{clase}" for nombre, clase in campos)
        capa = QgsVectorLayer(f"{tipo}?crs=EPSG:4326&{definicion}", tabla, "memory")
        elementos = []
        for geometria, atributos in filas[tabla]:
            g = QgsGeometry(geometria)
            g.convertToMultiType()
            g.transform(a_wgs84)
            elemento = QgsFeature(capa.fields())
            elemento.setGeometry(g)
            elemento.setAttributes(atributos)
            elementos.append(elemento)
        capa.dataProvider().addFeatures(elementos)
        uri = QgsDataSourceUri()
        uri.setConnection(*CONEXION)
        uri.setDataSource(ESQUEMA, tabla, "geom", "", "gid")  # gid: clave primaria (FID estable en GeoServer)
        error, mensaje = QgsVectorLayerExporter.exportLayer(capa, uri.uri(False), "postgres", WGS84, False,
                                                            {"overwrite": True, "lowercaseFieldNames": True})
        if error:
            sys.exit(f"No se pudo guardar {ESQUEMA}.{tabla}: {mensaje}")
        sql.executeSql(f"CREATE INDEX IF NOT EXISTS {tabla}_geom_idx ON {ESQUEMA}.{tabla} USING gist (geom)")
        print(f"  {ESQUEMA}.{tabla} ({len(elementos)} elementos)")
    # Una fila con los números finales: la leen el panel, el informe y el video.
    sql.executeSql(f"CREATE TABLE {ESQUEMA}.rn11_resumen AS SELECT " + ", ".join(
        f"{v}::{'numeric' if isinstance(v, float) else 'int'} AS {c}" for c, v in numeros.items()))
    print(f"  {ESQUEMA}.rn11_resumen")


def mostrar(numeros):
    print("\nResultados")
    print(f"  Traza de la RN 11 en el Chaco: {numeros['km_traza']} km ({numeros['partes_traza']} parte)")
    print(f"  Población hasta 10 km: {numeros['poblacion_0_10']:,} hab. ({numeros['localidades_0_10']} localidades)")
    print(f"  Población de 10 a 20 km: {numeros['poblacion_10_20']:,} hab. "
          f"({numeros['localidades_10_20']} localidades)")
    print(f"  Fuera del Chaco (contexto): {numeros['poblacion_fuera_del_chaco']:,} hab.")
    print(f"  Puentes sobre la traza: {numeros['puentes']} "
          f"(cruces con cursos de agua: {numeros['cruces_con_cursos_de_agua']})")


# --- Figuras -----------------------------------------------------------------------------

def linea_simbolo(color, ancho):
    return QgsLineSymbol.createSimple({"line_color": color, "line_width": str(ancho), "capstyle": "round"})


def estilo(capa, **props):
    """Relleno simple para una capa de polígonos."""
    capa.renderer().setSymbol(QgsFillSymbol.createSimple({"style": "solid", **props}))
    return capa


def rotular(capa, campo, tamano=9, negrita=False):
    formato = QgsTextFormat()
    fuente = QFont("Arial", tamano)
    fuente.setBold(negrita)
    formato.setFont(fuente)
    formato.setSize(tamano)
    borde = QgsTextBufferSettings()
    borde.setEnabled(True)
    borde.setSize(1)
    borde.setColor(QColor("white"))
    formato.setBuffer(borde)
    ajustes = QgsPalLayerSettings()
    ajustes.fieldName = campo
    ajustes.isExpression = True
    ajustes.setFormat(formato)
    capa.setLabeling(QgsVectorLayerSimpleLabeling(ajustes))
    capa.setLabelsEnabled(True)


def contexto():
    provincias = capa_postgis("public", "provincias", "Provincias")
    estilo(provincias, color="248,248,244,255", outline_color="90,90,90,255", outline_width="0.5")
    rotular(provincias, "\"provincia\"", 11, True)
    rios = capa_postgis("public", "curso_de_agua_hid", "Cursos de agua", "\"régimen\" = 'Permanente'")
    rios.setRenderer(rios.renderer().clone())
    rios.renderer().setSymbol(linea_simbolo("#7fb2de", 0.25))
    vial = capa_postgis("public", "red_vial", "Red vial principal", "\"tipo\" = 'Camino Pavimentado'")
    vial.renderer().setSymbol(linea_simbolo("#c9c2b4", 0.35))
    return [vial, rios, provincias]


def renderizar(capas, extension, archivo, ancho=1600, alto=1200):
    ajustes = QgsMapSettings()
    ajustes.setLayers(capas)
    ajustes.setDestinationCrs(POSGAR)
    ajustes.setBackgroundColor(QColor("#eef3f7"))
    ajustes.setOutputSize(QSize(ancho, alto))
    ajustes.setExtent(extension)
    ajustes.setOutputDpi(150)
    trabajo = QgsMapRendererParallelJob(ajustes)
    trabajo.start()
    trabajo.waitForFinished()
    trabajo.renderedImage().save(str(FIGURAS / archivo))
    print(f"  Figura {archivo}")


def figuras(capas):
    FIGURAS.mkdir(parents=True, exist_ok=True)
    fondo = contexto()
    chaco = estilo(capas["chaco"], color="255,255,255,0", outline_color="40,40,40,255", outline_width="0.9")
    traza = capas["traza"]
    traza.renderer().setSymbol(linea_simbolo("#d7263d", 1.4))
    rn11 = capas["rn11"]
    rn11.renderer().setSymbol(linea_simbolo("#d7263d", 0.9))
    area10 = estilo(capas["area10"], color="244,96,54,90", outline_color="196,71,31,255", outline_width="0.4")
    anillo = estilo(capas["anillo"], color="249,199,79,80", outline_color="201,154,30,255", outline_width="0.4")
    for capa, color in ((capas["loc10"], "#f46036"), (capas["loc20"], "#e0a800")):
        capa.renderer().setSymbol(QgsMarkerSymbol.createSimple(
            {"name": "circle", "color": color, "size": "2.4", "outline_color": "white"}))
        rotular(capa, "\"nombre\"", 8)
    puentes = capas["puentes"]
    puentes.renderer().setSymbol(QgsMarkerSymbol.createSimple(
        {"name": "square", "color": "#1b4f9c", "size": "2.6", "outline_color": "white"}))
    rotular(puentes, "concat('km ', \"km_traza\")", 7)

    provincia = chaco.extent()
    provincia.scale(1.15)
    zona = area10.extent()
    zona.combineExtentWith(anillo.extent())
    zona.scale(1.15)
    renderizar([chaco, rn11, *fondo], provincia, "qgis-paso1-extraccion.png")
    renderizar([traza, chaco, *fondo], zona, "qgis-paso2-traza.png")
    renderizar([traza, area10, anillo, chaco, *fondo], zona, "qgis-paso3-areas.png")
    renderizar([capas["loc10"], capas["loc20"], traza, area10, anillo, chaco, *fondo], zona,
               "qgis-paso4-localidades.png")
    renderizar([puentes, traza, chaco, *fondo], zona, "qgis-paso5-puentes.png")
    # Orden de dibujo del proyecto, de abajo hacia arriba.
    return [rn11, chaco, anillo, area10, traza, capas["loc20"], capas["loc10"], puentes], zona


def guardar(capas, extension):
    """Guarda los resultados en un GeoPackage y arma un proyecto de QGIS que los usa."""
    CARPETA_QGIS.mkdir(parents=True, exist_ok=True)
    if GPKG.exists():
        GPKG.unlink()
    proyecto = QgsProject.instance()
    proyecto.setCrs(POSGAR)
    # Transformación WGS 84 -> POSGAR 2007 de mayor precisión (0,5 m), así QGIS no pregunta al abrir.
    wgs84 = QgsCoordinateReferenceSystem("EPSG:4326")
    operacion = QgsDatumTransform.operations(wgs84, POSGAR)[0]
    contexto_transformacion = proyecto.transformContext()
    contexto_transformacion.addCoordinateOperation(wgs84, POSGAR, operacion.proj)
    proyecto.setTransformContext(contexto_transformacion)
    print(f"  Transformación: {operacion.name} ({operacion.accuracy} m)")
    for capa in contexto():
        proyecto.addMapLayer(capa)
    for numero, capa in enumerate(capas):
        opciones = QgsVectorFileWriter.SaveVectorOptions()
        opciones.layerName = f"paso_{numero}_{capa.name().lower().replace(' ', '_')}"
        opciones.actionOnExistingFile = (QgsVectorFileWriter.CreateOrOverwriteLayer if numero
                                         else QgsVectorFileWriter.CreateOrOverwriteFile)
        QgsVectorFileWriter.writeAsVectorFormatV3(capa, str(GPKG), proyecto.transformContext(), opciones)
        guardada = QgsVectorLayer(f"{GPKG}|layername={opciones.layerName}", capa.name(), "ogr")
        guardada.setRenderer(capa.renderer().clone())
        if capa.labelsEnabled():
            guardada.setLabeling(capa.labeling().clone())
            guardada.setLabelsEnabled(True)
        proyecto.addMapLayer(guardada)
        if numero == 0:  # la RN 11 completa solo sirve para el paso 1
            proyecto.layerTreeRoot().findLayer(guardada.id()).setItemVisibilityChecked(False)
    proyecto.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extension, POSGAR))
    proyecto.write(str(CARPETA_QGIS / "rn11.qgz"))
    print(f"  Proyecto {CARPETA_QGIS / 'rn11.qgz'}")




def main():
    fijar_transformacion()
    capas, datos = analizar()
    print("\nResultados en PostGIS")
    filas = tablas(capas, datos)
    numeros = resumen(filas, datos)
    escribir(filas, numeros)
    print("\nFiguras del informe")
    guardar(*figuras(capas))
    mostrar(numeros)
    APP.exitQgis()
    if numeros["partes_traza"] != 1:
        sys.exit("La traza quedó partida en varias líneas: revisar los tramos de red_vial.")


if __name__ == "__main__":
    main()

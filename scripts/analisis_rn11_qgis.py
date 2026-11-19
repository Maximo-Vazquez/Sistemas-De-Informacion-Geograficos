"""Punto b en QGIS: repite el análisis de la RN 11 con algoritmos de Procesamiento (ADR-0017).

Valida los números de scripts/analisis_rn11.sql con otra herramienta y genera las figuras del
informe (una por paso) y el proyecto docs/tpi/punto-b/qgis/rn11.qgz para abrir en QGIS.

    D:\\qgis\\bin\\python-qgis.bat scripts\\analisis_rn11_qgis.py

Usa el Python de QGIS (no el .venv). Lee PostGIS en localhost:5433 y necesita haber corrido
antes scripts/analisis_rn11.py, porque compara contra analisis.rn11_resumen.
"""

import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.append(os.environ.get("QGIS_PLUGINS", r"D:\qgis\apps\qgis\python\plugins"))

from qgis.core import (  # noqa: E402
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsDataSourceUri,
    QgsDatumTransform,
    QgsField,
    QgsFillSymbol,
    QgsGeometry,
    QgsLineSymbol,
    QgsMapRendererParallelJob,
    QgsMapSettings,
    QgsMarkerSymbol,
    QgsPalLayerSettings,
    QgsProject,
    QgsReferencedRectangle,
    QgsTextBufferSettings,
    QgsTextFormat,
    QgsVectorFileWriter,
    QgsVectorLayer,
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


# --- Análisis ----------------------------------------------------------------------------

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
    km = linea.length() / 1000

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
    loc10 = correr("native:extractbylocation", "Localidades hasta 10 km", INPUT=localidades,
                   PREDICATE=[6], INTERSECT=area10)
    loc20 = correr("native:extractbylocation", "Localidades de 10 a 20 km", INPUT=localidades,
                   PREDICATE=[6], INTERSECT=anillo)

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

    def suma(capa):
        return int(sum(f["canthab"] or 0 for f in capa.getFeatures()))

    sin_km = [f.id() for f in puentes_rn11.getFeatures() if f["km_traza"] is None]
    if sin_km:
        sys.exit(f"No se pudo ubicar sobre la traza a {len(sin_km)} puente(s).")
    resultado = {"km_traza": round(km, 2), "poblacion_0_10": suma(loc10), "poblacion_10_20": suma(loc20),
                 "localidades_0_10": loc10.featureCount(), "localidades_10_20": loc20.featureCount(),
                 "puentes": puentes_rn11.featureCount()}
    capas = {"chaco": chaco_m, "traza": traza, "area10": area10, "anillo": anillo, "loc10": loc10,
             "loc20": loc20, "puentes": puentes_rn11, "rn11": rn11}
    return resultado, capas


def comparar(resultado):
    uri = QgsDataSourceUri()
    uri.setConnection(*CONEXION)
    uri.setDataSource("analisis", "rn11_resumen", None)  # tabla sin geometría
    resumen = QgsVectorLayer(uri.uri(False), "Resumen", "postgres")
    fila = next(resumen.getFeatures())
    print("\nComparación QGIS vs. PostGIS (analisis.rn11_resumen)")
    diferencias = 0
    for clave, valor in resultado.items():
        esperado = fila[clave]
        igual = abs(float(valor) - float(esperado)) < 0.05
        diferencias += not igual
        print(f"  {clave:<20} QGIS {valor:>10}   PostGIS {esperado:>10}   {'OK' if igual else 'DIFERENCIA'}")
    return diferencias


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
    resultado, capas = analizar()
    diferencias = comparar(resultado)
    print("\nFiguras del informe")
    guardar(*figuras(capas))
    APP.exitQgis()
    if diferencias:
        sys.exit(f"{diferencias} valor(es) de QGIS no coinciden con PostGIS: revisar antes de informar.")


if __name__ == "__main__":
    main()

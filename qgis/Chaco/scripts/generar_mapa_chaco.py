from pathlib import Path
import colorsys

from qgis.core import (
    Qgis, QgsApplication, QgsProject, QgsVectorLayer, QgsCategorizedSymbolRenderer,
    QgsCoordinateReferenceSystem, QgsLayoutItemPage,
    QgsRendererCategory, QgsFillSymbol, QgsLineSymbol, QgsPalLayerSettings,
    QgsTextFormat, QgsTextBufferSettings, QgsVectorLayerSimpleLabeling,
    QgsPrintLayout, QgsLayoutSize, QgsLayoutPoint, QgsLayoutItemLabel,
    QgsLayoutItemShape, QgsLayoutItemMap, QgsLayoutItemScaleBar,
    QgsUnitTypes, QgsLayoutExporter, QgsReferencedRectangle,
    QgsLayoutMeasurement
)
from qgis.PyQt.QtCore import Qt
from qgis.PyQt.QtGui import QColor, QFont

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "datos" / "procesados" / "chaco.gpkg"
OUT = ROOT / "salidas"
OUT.mkdir(parents=True, exist_ok=True)
PROJECT_PATH = ROOT / "Mapa_Chaco.qgz"
PDF_PATH = OUT / "Mapa_departamentos_hidrografia_Chaco.pdf"
PNG_PATH = OUT / "Mapa_departamentos_hidrografia_Chaco.png"

app = QgsApplication([], False)
app.initQgis()
project = QgsProject.instance()
project.clear()
project.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))
project.setFilePathStorage(Qgis.FilePathType.Relative)
project.setEllipsoid("EPSG:7030")

departments = QgsVectorLayer(f"{DATA}|layername=departamentos", "Departamentos", "ogr")
rivers = QgsVectorLayer(f"{DATA}|layername=rios", "Cursos de agua", "ogr")
if not departments.isValid() or not rivers.isValid():
    raise RuntimeError("No se pudieron abrir las capas del GeoPackage de Chaco")

# Paleta suave y reproducible, con límites departamentales discretos.
names = sorted({str(f["FNA"]) for f in departments.getFeatures() if f["FNA"]})
categories = []
for idx, name in enumerate(names):
    hue = (0.08 + idx * 0.61803398875) % 1.0
    sat = 0.28 + (idx % 3) * 0.055
    val = 0.98 - (idx % 2) * 0.055
    red, green, blue = colorsys.hsv_to_rgb(hue, sat, val)
    fill = QColor(round(red * 255), round(green * 255), round(blue * 255))
    symbol = QgsFillSymbol.createSimple({
        "color": fill.name(), "outline_color": "#8a9892",
        "outline_width": "0.22", "outline_width_unit": "MM",
        "joinstyle": "round"
    })
    categories.append(QgsRendererCategory(name, symbol, name.title()))
departments.setRenderer(QgsCategorizedSymbolRenderer("FNA", categories))

# Nombres centrados con halo claro para mantener la lectura.
label = QgsPalLayerSettings()
label.fieldName = "FNA"
label.isExpression = False
label.placement = Qgis.LabelPlacement.OverPoint
text = QgsTextFormat()
text.setFont(QFont("Noto Sans", 7, QFont.Weight.DemiBold))
text.setSize(7.2)
text.setColor(QColor("#263b3c"))
buffer = QgsTextBufferSettings()
buffer.setEnabled(True)
buffer.setSize(0.8)
buffer.setColor(QColor(250, 249, 243, 225))
text.setBuffer(buffer)
label.setFormat(text)
departments.setLabeling(QgsVectorLayerSimpleLabeling(label))
departments.setLabelsEnabled(True)

rivers.renderer().setSymbol(QgsLineSymbol.createSimple({
    "line_color": "#167da0", "line_width": "0.42",
    "line_width_unit": "MM", "line_style": "solid",
    "capstyle": "round", "joinstyle": "round"
}))
rivers.setOpacity(0.9)

project.addMapLayer(departments)
project.addMapLayer(rivers)
project.layerTreeRoot().findLayer(rivers.id()).setItemVisibilityChecked(True)
project.layerTreeRoot().findLayer(departments.id()).setItemVisibilityChecked(True)

layout = QgsPrintLayout(project)
layout.initializeDefaults()
layout.setName("Mapa de Chaco")
page = layout.pageCollection().pages()[0]
page.setPageSize("A3", QgsLayoutItemPage.Landscape)
page.setBackgroundColor(QColor("#f7f6f0"))

NAVY, INK, MUTED, TEAL = "#173642", "#203b43", "#5d7375", "#24a6a0"
WHITE = "#fffefa"


def rect(x, y, w, h, color, stroke=None):
    item = QgsLayoutItemShape(layout)
    item.setShapeType(QgsLayoutItemShape.Rectangle)
    item.setSymbol(QgsFillSymbol.createSimple({
        "color": color,
        "outline_color": stroke or color,
        "outline_width": "0.2" if stroke else "0",
        "joinstyle": "round",
    }))
    layout.addLayoutItem(item)
    item.attemptMove(QgsLayoutPoint(x, y))
    item.attemptResize(QgsLayoutSize(w, h))
    return item


def label_item(value, x, y, w, h, size=9, color=INK, bold=False,
               align=Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter):
    item = QgsLayoutItemLabel(layout)
    item.setText(value)
    item.setFont(QFont("Noto Sans", size, QFont.Weight.Bold if bold else QFont.Weight.Normal))
    item.setFontColor(QColor(color))
    item.setHAlign(Qt.AlignmentFlag(align & (Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignRight)))
    item.setVAlign(Qt.AlignmentFlag(align & (Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignBottom)))
    item.setMargin(0)
    layout.addLayoutItem(item)
    item.attemptMove(QgsLayoutPoint(x, y))
    item.attemptResize(QgsLayoutSize(w, h))
    return item

# Cabecera.
rect(0, 0, 420, 33, NAVY)
rect(14, 8, 1.4, 17, TEAL)
label_item("CHACO", 21, 5, 125, 14, 25, WHITE, True)
label_item("DIVISIÓN DEPARTAMENTAL E HIDROGRAFÍA", 22, 19, 230, 7, 9, "#b9d5d3", True)
label_item("PROVINCIA DEL CHACO  ·  ARGENTINA", 283, 11, 123, 8, 9, WHITE, True,
           Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

# Marco cartográfico.
rect(13, 42, 276, 240, WHITE, "#d8ded7")
map_item = QgsLayoutItemMap(layout)
map_item.setCrs(project.crs())
map_item.setLayers([rivers, departments])
map_item.setKeepLayerSet(True)
map_item.setBackgroundColor(QColor("#edf3ef"))
map_item.setFrameEnabled(True)
map_item.setFrameStrokeColor(QColor("#cbd6d0"))
map_item.setFrameStrokeWidth(QgsLayoutMeasurement(0.25))
layout.addLayoutItem(map_item)
map_item.attemptMove(QgsLayoutPoint(16, 45))
map_item.attemptResize(QgsLayoutSize(270, 234))
extent = departments.extent()
extent.scale(1.045)
map_item.zoomToExtent(extent)

# Flecha norte.
label_item("▲", 270, 48, 14, 12, 15, NAVY, True, Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
label_item("N", 270, 58, 14, 6, 8, NAVY, True, Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)

# Columna de referencias y datos.
rect(298, 42, 109, 240, WHITE, "#d8ded7")
label_item("REFERENCIAS", 306, 50, 91, 8, 9, MUTED, True)
rect(306, 64, 6, 4, "#b9d7cb", "#879b91")
label_item("Departamentos", 316, 62, 80, 7, 9, INK, True)
label_item("Límite departamental", 316, 69, 80, 6, 7, MUTED)
rect(306, 82, 6, 0.65, "#167da0")
label_item("Cursos de agua", 316, 78, 80, 7, 9, INK, True)
label_item("Red hidrográfica recortada", 316, 85, 82, 6, 7, MUTED)
rect(306, 98, 93, 0.35, "#e4e9e2")
label_item("EN EL MAPA", 306, 104, 91, 7, 8, MUTED, True)
label_item("25", 306, 116, 37, 13, 20, NAVY, True)
label_item("departamentos", 306, 130, 56, 7, 8, MUTED)
label_item("750", 306, 145, 39, 13, 20, NAVY, True)
label_item("tramos de cursos de agua", 306, 159, 89, 7, 8, MUTED)
rect(306, 174, 93, 0.35, "#e4e9e2")
label_item("FUENTES Y NOTAS", 306, 180, 91, 7, 8, MUTED, True)
label_item("Capas provistas en\nDATOS-LABQGIS2026", 306, 191, 91, 15, 8, INK, True)
label_item("Departamentos: actualización\nDBF 06/09/2017.\nCursos de agua: actualización\nDBF 20/05/2011.", 306, 211, 92, 29, 7, MUTED)
label_item("Sistema de referencia: WGS 84\nEPSG:4326 · escala indicativa", 306, 245, 93, 15, 7, MUTED)
label_item("El recorte hidrográfico sigue el\nlímite de los departamentos.", 306, 263, 92, 11, 7, MUTED)

# Escala gráfica.
scale = QgsLayoutItemScaleBar(layout)
scale.setStyle("Single Box")
scale.setLinkedMap(map_item)
scale.setUnits(QgsUnitTypes.DistanceKilometers)
scale.setUnitsPerSegment(50)
scale.setNumberOfSegments(2)
scale.setNumberOfSegmentsLeft(0)
scale.setUnitLabel("km")
scale.setFont(QFont("Noto Sans", 7))
scale.setFontColor(QColor(INK))
scale.setFillColor(QColor(WHITE))
scale.setFillColor2(QColor(NAVY))
scale.setLineColor(QColor(NAVY))
scale.setHeight(1.7)
layout.addLayoutItem(scale)
scale.attemptMove(QgsLayoutPoint(21, 267))

label_item("Mapa temático elaborado con datos vectoriales del material suministrado por el usuario.",
           14, 285, 320, 6, 7, MUTED)
label_item("GIS  /  QGIS", 350, 285, 56, 6, 7, MUTED, True,
           Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

project.setTitle("Chaco — departamentos e hidrografía")
metadata = project.metadata()
metadata.setAbstract("Mapa temático de los 25 departamentos de Chaco y cursos de agua recortados desde la capa hidrográfica provista.")
project.setMetadata(metadata)
project.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(departments.extent(), project.crs()))
project.layoutManager().addLayout(layout)
if not project.write(str(PROJECT_PATH)):
    raise RuntimeError(f"No se pudo guardar el proyecto: {PROJECT_PATH}")

if PDF_PATH.exists(): PDF_PATH.unlink()
if PNG_PATH.exists(): PNG_PATH.unlink()
exporter = QgsLayoutExporter(layout)
pdf_settings = QgsLayoutExporter.PdfExportSettings()
pdf_settings.dpi = 300
if exporter.exportToPdf(str(PDF_PATH), pdf_settings) != QgsLayoutExporter.Success:
    raise RuntimeError("Falló la exportación a PDF")
image_settings = QgsLayoutExporter.ImageExportSettings()
image_settings.dpi = 220
if exporter.exportToImage(str(PNG_PATH), image_settings) != QgsLayoutExporter.Success:
    raise RuntimeError("Falló la exportación a PNG")

print(f"Proyecto: {PROJECT_PATH}")
print(f"PDF: {PDF_PATH}")
print(f"PNG: {PNG_PATH}")
print(f"Departamentos: {departments.featureCount()} | cursos de agua: {rivers.featureCount()}")
app.exitQgis()

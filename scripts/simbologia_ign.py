"""Simbología de las capas SIG IGN 250 en SLD 1.0, para la leyenda por clases del visor.

Las capas con un atributo que las clasifica (tipo de camino, régimen del agua, tipo de
localidad…) tienen una regla por clase; el resto, un símbolo propio según su tema. Cada
clase va en su propio FeatureTypeStyle: así se dibujan en orden (lo menor abajo) y la
leyenda de GeoServer muestra cada título.
"""

from dataclasses import dataclass, field
from xml.sax.saxutils import escape

# Paleta por tema. Los colores viven acá porque los dibuja GeoServer, no el frontend.
AGUA, AGUA_CLARA, AGUA_RELLENO, BANADO = "#1f6fb2", "#6aaee0", "#a9d3f0", "#7fc4b8"
BORDE_PUNTO = "#ffffff"
TEXTO, HALO = "#222222", "#ffffff"


@dataclass(frozen=True)
class Clase:
    titulo: str
    simbolos: str
    valores: tuple[str, ...] = ()  # vacío: sin filtro (o el resto, si `resto`)
    resto: bool = False
    escala_max: int | None = None  # se dibuja solo con escala mayor que 1:escala_max


@dataclass(frozen=True)
class Estilo:
    titulo: str
    clases: list[Clase]
    atributo: str = ""
    etiqueta: str = field(default="")  # atributo a rotular en las clases que lo piden


# --- Simbolizadores -------------------------------------------------------------------

def _css(nombre, valor):
    return f'<CssParameter name="{nombre}">{valor}</CssParameter>'


def linea(color, ancho, guiones=""):
    trazo = _css("stroke", color) + _css("stroke-width", ancho) + _css("stroke-linecap", "round")
    if guiones:
        trazo += _css("stroke-dasharray", guiones)
    return f"<LineSymbolizer><Stroke>{trazo}</Stroke></LineSymbolizer>"


def ferrocarril():
    """Clásico de vías: línea oscura con un guionado claro encima."""
    return linea("#3b3b3b", 3) + linea("#ffffff", 1.5, "6 6")


def poligono(relleno, borde, opacidad=0.6, ancho=0.6):
    rell = _css("fill", relleno) + _css("fill-opacity", opacidad)
    trazo = _css("stroke", borde) + _css("stroke-width", ancho)
    return f"<PolygonSymbolizer><Fill>{rell}</Fill><Stroke>{trazo}</Stroke></PolygonSymbolizer>"


def punto(forma, relleno, tamano=7):
    marca = (
        f"<Mark><WellKnownName>{forma}</WellKnownName><Fill>{_css('fill', relleno)}</Fill>"
        f"<Stroke>{_css('stroke', BORDE_PUNTO)}{_css('stroke-width', 1)}</Stroke></Mark>"
    )
    return f"<PointSymbolizer><Graphic>{marca}<Size>{tamano}</Size></Graphic></PointSymbolizer>"


def texto(atributo, tamano=11, negrita=False):
    peso = "bold" if negrita else "normal"
    fuente = _css("font-family", "SansSerif") + _css("font-size", tamano) + _css("font-weight", peso)
    return (
        f"<TextSymbolizer><Label><ogc:PropertyName>{atributo}</ogc:PropertyName></Label>"
        f"<Font>{fuente}</Font>"
        "<LabelPlacement><PointPlacement><AnchorPoint><AnchorPointX>0.5</AnchorPointX>"
        "<AnchorPointY>0</AnchorPointY></AnchorPoint><Displacement><DisplacementX>0</DisplacementX>"
        "<DisplacementY>6</DisplacementY></Displacement></PointPlacement></LabelPlacement>"
        f"<Halo><Radius>1.5</Radius><Fill>{_css('fill', HALO)}</Fill></Halo>"
        f"<Fill>{_css('fill', TEXTO)}</Fill></TextSymbolizer>"
    )


# --- Capas clasificadas por atributo ----------------------------------------------------

CLASIFICADAS = {
    "red_vial": Estilo("Red vial", atributo="tipo", clases=[
        Clase("Camino de tierra (desde 1:1.000.000)", linea("#a1887f", 0.7),
              ("Camino de Tierra, Camino sin Pavimentar de Transitavilidad Temporaria",), escala_max=1_000_000),
        Clase("Camino consolidado", linea("#c9a227", 1.4),
              ("Camino Consolidado, Camino sin Pavimentar de Transitavilidad Permanente",)),
        Clase("Camino pavimentado", linea("#e67e22", 2.2), ("Camino Pavimentado",)),
        Clase("Autopista", linea("#c0392b", 3.5), ("Autopista con Camino Pavimentado Dual con Separador",)),
    ]),
    "vias_secundarias": Estilo("Vías secundarias", atributo="tipo", clases=[
        Clase("Huella o rodera (desde 1:500.000)", linea("#8d6e63", 0.6, "4 3"),
              ("Huella, Rodera",), escala_max=500_000),
        Clase("Senda, picada u otra (desde 1:500.000)", linea("#8d6e63", 0.6, "1 3"),
              resto=True, escala_max=500_000),
    ]),
    "localidades": Estilo("Localidades", atributo="tipo", etiqueta="nombre", clases=[
        Clase("Lugar, paraje o caserío (desde 1:1.000.000)", punto("circle", "#9e9e9e", 4),
              ("Lugar o Paraje", "Caserío"), escala_max=1_000_000),
        Clase("Localidad, pueblo, colonia o barrio", punto("circle", "#5d4037", 5),
              ("Localidad", "Pueblo", "Colonia", "Barrio", "Villa")),
        Clase("Ciudad o cabecera de departamento", punto("square", "#c62828", 8) + texto("nombre", 11),
              ("Ciudad", "Cabecera de Partido o Departamento")),
        Clase("Capital", punto("star", "#b71c1c", 13) + texto("nombre", 12, negrita=True),
              ("Capital de Provincia", "Capital de Nación")),
    ]),
    "curso_de_agua_hid": Estilo("Cursos de agua", atributo="régimen", clases=[
        Clase("Intermitente", linea(AGUA_CLARA, 0.8, "5 3"), ("Intermitente",)),
        Clase("Permanente", linea(AGUA, 1.3), ("Permanente",)),
    ]),
    "espejo_de_agua_hid": Estilo("Espejos de agua", atributo="tipo", clases=[
        Clase("Bañado", poligono(BANADO, BANADO, 0.45), ("Bañado Intermitente", "Bañado Perenne")),
        Clase("Estero", poligono("#4db6ac", "#26897d", 0.5), ("Estero",)),
        Clase("Laguna intermitente", poligono(AGUA_RELLENO, AGUA_CLARA, 0.5), ("Lago o Laguna Intermitente",)),
        Clase("Laguna permanente", poligono(AGUA_CLARA, AGUA, 0.75), ("Lago o Laguna Perenne",)),
        Clase("Otros (canales y cauces)", poligono(AGUA, AGUA, 0.75), resto=True),
    ]),
    "curvas_de_nivel": Estilo("Curvas de nivel", atributo="tipo", clases=[
        Clase("Intermedia (desde 1:500.000)", linea("#c8a27c", 0.4), ("Intermedia",), escala_max=500_000),
        Clase("Directriz", linea("#a1785a", 0.9), ("Directriz",)),
    ]),
    "limite_politico_administrativo_lim": Estilo("Límites", atributo="tipo", clases=[
        Clase("Costa", linea("#78909c", 0.8), ("Costa",)),
        Clase("Límite provincial", linea("#616161", 1.2, "8 4"), ("Limite Provincial",)),
        Clase("Límite internacional", linea("#212121", 2, "10 4 2 4"), ("Limite Internacional",)),
    ]),
    "puente_red_vial_puntos": Estilo("Puentes", atributo="tipo", clases=[
        Clase("Puente vehicular", punto("square", "#37474f", 6), ("Puentes Para toda Clase de Vehículos",)),
        Clase("Viaducto, túnel o colgante", punto("triangle", "#ef6c00", 8), resto=True),
    ]),
}

# --- Capas con un símbolo propio según su tema -----------------------------------------

def _simple(titulo, simbolos):
    return Estilo(titulo, clases=[Clase(titulo, simbolos)])


SIMPLES = {
    # Límites y localidades
    "pais_lim": _simple("País", poligono("#ffffff", "#424242", 0, 1.6)),
    "provincias": _simple("Provincias", poligono("#ffffff", "#616161", 0, 1.2) + texto("provincia", 12, negrita=True)),
    "ejido": _simple("Ejidos urbanos", poligono("#ffcc80", "#ef6c00", 0.35)),
    # Transporte
    "red_ferroviaria": _simple("Red ferroviaria", ferrocarril()),
    "edificios_ferroviarios": _simple("Edificios ferroviarios", punto("square", "#3b3b3b", 6)),
    "estructuras_portuarias": _simple("Estructuras portuarias", punto("triangle", "#0277bd", 7)),
    "obra_portuaria": _simple("Obras portuarias", punto("square", "#0277bd", 6)),
    "infraestructura_aeroportuaria_punto": _simple("Aeropuertos y aeródromos", punto("star", "#5e35b1", 10)),
    "salvado_de_obstaculo": _simple("Salvado de obstáculos", punto("square", "#455a64", 5)),
    "senalizaciones": _simple("Señalizaciones", punto("x", "#757575", 6)),
    "marcas_y_senales": _simple("Marcas y señales", punto("x", "#9e9e9e", 6)),
    # Hidrografía
    "isla": _simple("Islas", poligono("#d7ccc8", "#8d6e63", 0.6)),
    "infraestructura_hidro": _simple("Infraestructura hidráulica", punto("triangle", AGUA, 7)),
    "muro_embalse": _simple("Muros de embalse", linea("#5d4037", 2.5)),
    # Relieve y suelos
    "puntos_de_alturas_topograficas": _simple("Puntos de altura", punto("triangle", "#795548", 5)),
    "puntos_del_terreno": _simple("Puntos del terreno", punto("circle", "#a1887f", 4)),
    "sue_congelado": _simple("Suelo congelado", poligono("#e3f2fd", "#90caf9", 0.7)),
    "sue_consolidado": _simple("Suelo consolidado", poligono("#bcaaa4", "#8d6e63", 0.6)),
    "sue_costero": _simple("Suelo costero", poligono("#ffe0b2", "#ffb74d", 0.6)),
    "sue_hidromorfologico": _simple("Suelo hidromórfico", poligono("#b2dfdb", "#4db6ac", 0.6)),
    "sue_no_consolidado": _simple("Suelo no consolidado", poligono("#f0e0b0", "#c8b273", 0.6)),
    # Vegetación
    "veg_arborea": _simple("Vegetación arbórea", poligono("#4f9a4a", "#3b7a37", 0.55)),
    "veg_arbustiva": _simple("Vegetación arbustiva", poligono("#8dbf6a", "#6d9e4c", 0.55)),
    "veg_cultivos": _simple("Cultivos", poligono("#e4d96f", "#c2b64a", 0.55)),
    "veg_hidrofila": _simple("Vegetación hidrófila", poligono("#6fb59a", "#4e9479", 0.55)),
    "veg_suelo_desnudo": _simple("Suelo desnudo", poligono("#d9c3a0", "#b49e7a", 0.55)),
    # Edificios y servicios
    "edif_educacion": _simple("Educación", punto("square", "#3949ab", 6)),
    "edificio_de_salud_ips": _simple("Salud", punto("cross", "#e53935", 9)),
    "edificio_de_seguridad_ips": _simple("Seguridad", punto("square", "#1565c0", 6)),
    "edificio_publico_ips": _simple("Edificios públicos", punto("square", "#546e7a", 6)),
    "edif_religiosos": _simple("Edificios religiosos", punto("cross", "#6d4c41", 8)),
    "edif_construcciones_turisticas": _simple("Construcciones turísticas", punto("circle", "#ab47bc", 6)),
    "edif_depor_y_esparcimiento": _simple("Deporte y esparcimiento", punto("circle", "#26a69a", 6)),
    "otras_edificaciones": _simple("Otras edificaciones", punto("circle", "#8d6e63", 5)),
    # Energía y comunicaciones
    "complejo_de_energia_ene": _simple("Complejos de energía", punto("triangle", "#f9a825", 8)),
    "lineas_de_conduccion_ene": _simple("Líneas de conducción eléctrica", linea("#f9a825", 1.2, "8 3")),
    "obra_de_comunicacion": _simple("Obras de comunicación", punto("triangle", "#8e24aa", 7)),
    # Actividades económicas
    "actividades_agropecuarias": _simple("Actividades agropecuarias", punto("circle", "#7cb342", 6)),
    "actividades_economicas": _simple("Actividades económicas", punto("circle", "#00897b", 5)),
}

ESTILOS = {**SIMPLES, **CLASIFICADAS}


# --- SLD ---------------------------------------------------------------------------------

def _igual(atributo, valor):
    return (
        f"<ogc:PropertyIsEqualTo><ogc:PropertyName>{atributo}</ogc:PropertyName>"
        f"<ogc:Literal>{escape(valor)}</ogc:Literal></ogc:PropertyIsEqualTo>"
    )


def _alguno(atributo, valores):
    comparaciones = "".join(_igual(atributo, valor) for valor in valores)
    return comparaciones if len(valores) == 1 else f"<ogc:Or>{comparaciones}</ogc:Or>"


def _filtro(estilo, clase):
    """Cada clase va en su FeatureTypeStyle, donde ElseFilter abarcaría todo: el resto se
    expresa como "ninguno de los valores de las otras clases"."""
    if clase.resto:
        otros = [valor for otra in estilo.clases if otra is not clase for valor in otra.valores]
        return f"<ogc:Filter><ogc:Not>{_alguno(estilo.atributo, otros)}</ogc:Not></ogc:Filter>"
    if clase.valores:
        return f"<ogc:Filter>{_alguno(estilo.atributo, clase.valores)}</ogc:Filter>"
    return ""


def _regla(estilo, clase):
    titulo = escape(clase.titulo)
    escala = f"<MaxScaleDenominator>{clase.escala_max}</MaxScaleDenominator>" if clase.escala_max else ""
    return f"<Rule><Name>{titulo}</Name><Title>{titulo}</Title>{_filtro(estilo, clase)}{escala}{clase.simbolos}</Rule>"


def sld(nombre, estilo):
    capas = "".join(f"<FeatureTypeStyle>{_regla(estilo, clase)}</FeatureTypeStyle>" for clase in estilo.clases)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" '
        'xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" '
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
        'xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">'
        f"<NamedLayer><Name>{nombre}</Name><UserStyle><Name>{nombre}</Name>"
        f"<Title>{escape(estilo.titulo)}</Title>{capas}</UserStyle></NamedLayer></StyledLayerDescriptor>"
    )

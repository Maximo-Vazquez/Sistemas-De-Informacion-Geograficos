import Feature from "ol/Feature"
import GeoJSON from "ol/format/GeoJSON"
import WFS from "ol/format/WFS"
import WMSCapabilities from "ol/format/WMSCapabilities"
import type { Geometry } from "ol/geom"
import ImageWMS from "ol/source/ImageWMS"
import type { Coordinate } from "ol/coordinate"
import type { Extent } from "ol/extent"
import { grupoDeCapa, ORDEN_GRUPOS, tituloDeCapa } from "./catalogo"
import type { CampoCapa, CapaWms, EsquemaCapa, GrupoResultados, TipoCampo } from "./types"

// Servicios OGC de GeoServer: WMS (capas, leyenda, consulta por punto) y WFS (consulta por
// rectángulo, esquema de atributos e inserción WFS-T). Todo en EPSG:3857, la proyección del mapa.
const PROYECCION = "EPSG:3857"
const LIMITE_RECTANGULO = 50
const geojson = new GeoJSON({ dataProjection: PROYECCION, featureProjection: PROYECCION })

type CapaCapabilities = { Name?: string; Title?: string; Layer?: CapaCapabilities[] }

function hojas(capa: CapaCapabilities): { nombre: string; titulo: string }[] {
  if (capa.Layer?.length) return capa.Layer.flatMap(hojas)
  return capa.Name ? [{ nombre: capa.Name, titulo: capa.Title || capa.Name }] : []
}

export async function leerCapas(wmsUrl: string, editables: string[], signal?: AbortSignal): Promise<CapaWms[]> {
  const respuesta = await fetch(`${wmsUrl}?service=WMS&version=1.3.0&request=GetCapabilities`, { signal })
  if (!respuesta.ok) throw new Error(`GeoServer respondió ${respuesta.status}`)
  const raiz = new WMSCapabilities().read(await respuesta.text())?.Capability?.Layer as CapaCapabilities | undefined
  const capas = raiz ? hojas(raiz) : []
  return capas
    .map((capa) => {
      const editable = editables.includes(capa.nombre)
      const grupo = grupoDeCapa(capa.nombre, editable)
      return { ...capa, titulo: tituloDeCapa(capa.nombre, capa.titulo), editable, grupo, orden: ORDEN_GRUPOS.indexOf(grupo) * 100 }
    })
    .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, "es"))
}

export function urlLeyenda(wmsUrl: string, capa: string) {
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.3.0",
    request: "GetLegendGraphic",
    format: "image/png",
    layer: capa,
    legend_options: "fontAntiAliasing:true;forceLabels:on;fontName:SansSerif;fontSize:11",
  })
  return `${wmsUrl}?${params}`
}

function capaDeId(id: string) {
  return id.slice(0, id.lastIndexOf("."))
}

function agrupar(features: Feature[], capas: CapaWms[], totales: Record<string, number> = {}): GrupoResultados[] {
  return capas
    .map((capa) => {
      const elementos = features
        .filter((feature) => capaDeId(String(feature.getId())) === capa.nombre)
        .map((feature) => ({ id: String(feature.getId()), capa: capa.nombre, feature }))
      return { capa, elementos, total: totales[capa.nombre] ?? elementos.length }
    })
    .filter((grupo) => grupo.elementos.length > 0)
}

// Consulta por punto: un GetFeatureInfo con todas las capas encendidas (la de arriba primero).
export async function consultarPunto(
  wmsUrl: string,
  capas: CapaWms[],
  coordenada: Coordinate,
  resolucion: number,
  signal?: AbortSignal,
) {
  const nombres = [...capas].reverse().map((capa) => capa.nombre).join(",")
  const fuente = new ImageWMS({ url: wmsUrl, params: { LAYERS: nombres }, serverType: "geoserver" })
  const url = fuente.getFeatureInfoUrl(coordenada, resolucion, PROYECCION, {
    INFO_FORMAT: "application/json",
    QUERY_LAYERS: nombres,
    FEATURE_COUNT: 20,
    BUFFER: 8,
  })
  if (!url) return []
  const respuesta = await fetch(url, { signal })
  if (!respuesta.ok) throw new Error(`GeoServer respondió ${respuesta.status}`)
  const features = geojson.readFeatures(await respuesta.json()) as Feature[]
  return agrupar(features, [...capas].reverse())
}

// Consulta por rectángulo: un GetFeature por capa con filtro BBOX (hasta 50 elementos por capa).
export async function consultarRectangulo(wfsUrl: string, capas: CapaWms[], extension: Extent, signal?: AbortSignal) {
  const respuestas = await Promise.all(
    capas.map(async (capa) => {
      const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: capa.nombre,
        outputFormat: "application/json",
        srsName: PROYECCION,
        count: String(LIMITE_RECTANGULO),
        bbox: `${extension.join(",")},${PROYECCION}`,
      })
      const respuesta = await fetch(`${wfsUrl}?${params}`, { signal })
      if (!respuesta.ok) throw new Error(`GeoServer respondió ${respuesta.status} en ${capa.titulo}`)
      const datos = await respuesta.json()
      return { capa, datos, features: geojson.readFeatures(datos) as Feature[] }
    }),
  )
  const totales = Object.fromEntries(
    respuestas.map(({ capa, datos, features }) => [capa.nombre, Number(datos.numberMatched ?? datos.totalFeatures) || features.length]),
  )
  return agrupar(
    respuestas.flatMap((respuesta) => respuesta.features),
    [...capas].reverse(),
    totales,
  )
}

const TIPOS: Record<string, TipoCampo> = {
  string: "texto",
  int: "entero",
  integer: "entero",
  long: "entero",
  short: "entero",
  double: "numero",
  float: "numero",
  decimal: "numero",
  number: "numero",
  date: "fecha",
  "date-time": "fecha",
  boolean: "booleano",
}

export async function describirCapa(wfsUrl: string, capa: string, signal?: AbortSignal): Promise<EsquemaCapa> {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "DescribeFeatureType",
    typeNames: capa,
    outputFormat: "application/json",
  })
  const respuesta = await fetch(`${wfsUrl}?${params}`, { signal })
  if (!respuesta.ok) throw new Error(`GeoServer respondió ${respuesta.status}`)
  const datos = await respuesta.json()
  const propiedades: { name: string; type: string; localType: string; nillable: boolean }[] =
    datos.featureTypes?.[0]?.properties ?? []
  const geometria = propiedades.find((propiedad) => propiedad.type.startsWith("gml:"))
  const campos: CampoCapa[] = propiedades
    .filter((propiedad) => propiedad !== geometria)
    .map((propiedad) => ({
      nombre: propiedad.name,
      tipo: TIPOS[propiedad.localType] ?? "texto",
      obligatorio: !propiedad.nillable,
    }))
  return {
    capa,
    espacioUri: datos.targetNamespace,
    prefijo: datos.targetPrefix,
    campoGeometria: geometria?.name ?? "geom",
    campos,
  }
}

function convertir(valor: string, tipo: TipoCampo) {
  if (tipo === "entero" || tipo === "numero") return Number(valor)
  if (tipo === "booleano") return valor === "true"
  return valor
}

function mensajeDeError(texto: string) {
  return texto.match(/<ows:ExceptionText>([\s\S]*?)<\/ows:ExceptionText>/)?.[1]?.trim() ?? texto.match(/"error":\s*"([^"]+)"/)?.[1]
}

// Inserta un elemento por WFS-T. Django reenvía la transacción a GeoServer con sus credenciales.
export async function insertarElemento(
  transaccionUrl: string,
  csrf: string,
  esquema: EsquemaCapa,
  geometria: Geometry,
  valores: Record<string, string>,
) {
  const feature = new Feature()
  feature.setGeometryName(esquema.campoGeometria)
  feature.setGeometry(geometria)
  for (const campo of esquema.campos) {
    const valor = valores[campo.nombre]?.trim()
    if (valor) feature.set(campo.nombre, convertir(valor, campo.tipo))
  }
  const formato = new WFS()
  const nodo = formato.writeTransaction([feature], [], [], {
    featureNS: esquema.espacioUri,
    featurePrefix: esquema.prefijo,
    featureType: esquema.capa,
    srsName: PROYECCION,
    version: "1.1.0",
    nativeElements: [],
    gmlOptions: { srsName: PROYECCION },
  })
  const respuesta = await fetch(transaccionUrl, {
    method: "POST",
    headers: { "Content-Type": "text/xml", "X-CSRFToken": csrf },
    body: new XMLSerializer().serializeToString(nodo),
  })
  const texto = await respuesta.text()
  const resumen = respuesta.ok ? formato.readTransactionResponse(texto)?.transactionSummary : undefined
  if (!resumen?.totalInserted) {
    throw new Error(mensajeDeError(texto) ?? `No se pudo guardar (${respuesta.status}).`)
  }
}

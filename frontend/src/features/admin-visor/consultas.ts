import GeoJSON from "ol/format/GeoJSON"
import type Feature from "ol/Feature"
import type { Coordinate } from "ol/coordinate"
import type { Extent } from "ol/extent"
import ImageWMS from "ol/source/ImageWMS"
import type VectorSource from "ol/source/Vector"
import { CAPA_RELEVAMIENTOS } from "./types"
import type { CapaWms } from "./types"

// Tope de elementos por capa: alcanza para leerlos en el panel y evita bajar miles de
// geometrías al navegador. El total real llega aparte (numberMatched) y se informa.
export const LIMITE_POR_CAPA = 50
// Tolerancia en píxeles alrededor del clic: sin ella es casi imposible acertarle a un punto o una línea.
export const TOLERANCIA_PX = 8
const PROYECCION_MAPA = "EPSG:3857"

export type Elemento = { id: string; titulo: string; atributos: [string, string][]; feature: Feature }
export type ResultadoCapa = { capa: CapaWms; elementos: Elemento[]; total: number; error: boolean }

// Atributos de control del SIG IGN 250 (simbología de MicroStation, ids internos) que no
// le dicen nada a quien consulta.
const OCULTOS = new Set(["ogc_fid", "gid", "bbox", "rotation", "group", "cell_name"])
const esOculto = (clave: string) => OCULTOS.has(clave) || clave.startsWith("igds_")

// Los shapefiles cortan los nombres de campo a 10 caracteres; los más usados se traducen.
const ETIQUETAS: Record<string, string> = {
  nombre: "Nombre",
  descripcion: "Descripción",
  tipo: "Tipo",
  provincia: "Provincia",
  departamen: "Departamento",
  canthab: "Habitantes",
  nro_ruta: "N.º de ruta",
  administra: "Administración",
  revestimie: "Revestimiento",
  situacion: "Situación",
  categoria: "Categoría",
  carriles: "Carriles",
  trafico: "Tránsito",
  precision: "Precisión",
  escala: "Escala",
  fuente: "Fuente",
  responsabl: "Responsable",
  fclass: "Clase",
  ac: "Año de captura",
  sp: "Sistema de referencia",
  length: "Longitud",
  prov: "Código de provincia",
  cuenca: "Cuenca",
  regimen: "Régimen",
  navegable: "Navegable",
  profundida: "Profundidad",
  contenido: "Contenido",
  material: "Material",
  largo: "Largo",
  capacidad: "Capacidad",
  sist_uso: "Uso",
}

export function etiquetaAtributo(clave: string) {
  const texto = ETIQUETAS[clave] ?? clave.replace(/_/g, " ")
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const formato = new Intl.NumberFormat("es-AR")

function valorLegible(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null
  if (typeof valor === "number") return formato.format(valor)
  if (typeof valor === "boolean") return valor ? "Sí" : "No"
  const texto = String(valor).trim()
  return texto === "" ? null : texto
}

// Casi ningún camino del IGN tiene nombre: después del nombre se prueba la provincia (la
// capa de provincias no tiene "nombre"), el número de ruta y, por último, el tipo de elemento.
function titulo(propiedades: Record<string, unknown>, numero: string) {
  const texto = (clave: string) => valorLegible(propiedades[clave])
  const nombre = texto("nombre") ?? ("nombre" in propiedades ? null : texto("provincia"))
  if (nombre) return nombre
  const ruta = texto("nro_ruta")
  if (ruta) return `Ruta ${ruta}`
  const tipo = texto("tipo")
  return tipo ? `${tipo.split(",")[0]} · n.º ${numero}` : `Elemento ${numero}`
}

function aElemento(feature: Feature, indice: number): Elemento {
  const propiedades = feature.getProperties()
  const atributos: [string, string][] = []
  for (const [clave, valor] of Object.entries(propiedades)) {
    if (clave === feature.getGeometryName() || esOculto(clave)) continue
    const legible = valorLegible(valor)
    if (legible !== null) atributos.push([clave, legible])
  }
  const id = String(feature.getId() ?? indice)
  return { id, titulo: titulo(propiedades, id.split(".").pop()!), atributos, feature }
}

const lector = new GeoJSON({ dataProjection: PROYECCION_MAPA, featureProjection: PROYECCION_MAPA })

export function consultarRelevamientos(origen: VectorSource, extension: Extent): ResultadoCapa {
  const features = origen.getFeaturesInExtent(extension)
    .filter((feature) => feature.getGeometry()?.intersectsExtent(extension))
  return {
    capa: CAPA_RELEVAMIENTOS,
    elementos: features.slice(0, LIMITE_POR_CAPA).map(aElemento),
    total: features.length,
    error: false,
  }
}

async function leer(capa: CapaWms, url: string, signal: AbortSignal): Promise<ResultadoCapa> {
  try {
    const respuesta = await fetch(url, { signal })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    const json = await respuesta.json()
    const features = lector.readFeatures(json) as Feature[]
    const total = typeof json.numberMatched === "number" ? json.numberMatched : features.length
    return { capa, elementos: features.slice(0, LIMITE_POR_CAPA).map(aElemento), total, error: false }
  } catch (error) {
    if (signal.aborted) throw error
    return { capa, elementos: [], total: 0, error: true }
  }
}

// Consulta por punto: un GetFeatureInfo de WMS por capa encendida, en paralelo.
export function consultarPunto(
  wmsUrl: string,
  capas: CapaWms[],
  coordenada: Coordinate,
  resolucion: number,
  signal: AbortSignal,
) {
  return Promise.all(
    capas.map((capa) => {
      const fuente = new ImageWMS({ url: wmsUrl, params: { LAYERS: capa.nombre } })
      const url = fuente.getFeatureInfoUrl(coordenada, resolucion, PROYECCION_MAPA, {
        INFO_FORMAT: "application/json",
        FEATURE_COUNT: LIMITE_POR_CAPA,
        BUFFER: TOLERANCIA_PX,
      })
      return leer(capa, url!, signal)
    }),
  )
}

// Consulta por rectángulo: un GetFeature de WFS por capa encendida con filtro BBOX.
export function consultarRectangulo(wfsUrl: string, capas: CapaWms[], extension: Extent, signal: AbortSignal) {
  return Promise.all(
    capas.map((capa) => {
      const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: capa.nombre,
        outputFormat: "application/json",
        srsName: PROYECCION_MAPA,
        count: String(LIMITE_POR_CAPA),
        bbox: `${extension.join(",")},${PROYECCION_MAPA}`,
      })
      return leer(capa, `${wfsUrl}?${params}`, signal)
    }),
  )
}

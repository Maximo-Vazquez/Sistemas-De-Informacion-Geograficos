import type Feature from "ol/Feature"
import type { Coordinate } from "ol/coordinate"
import type { AdminPageData } from "@/components/admin/types"

export type GeoServerConfig = { url: string; workspace: string; wmsUrl: string; wfsUrl: string }

export type VisorData = AdminPageData & {
  geoserver: GeoServerConfig
  // [oeste, sur, este, norte] en lon/lat (EPSG:4326).
  extension: [number, number, number, number]
  capasEditables: string[]
  transaccionUrl: string
}

// Capa publicada en GeoServer, ya ubicada en un grupo del catálogo.
export type CapaWms = { nombre: string; titulo: string; grupo: string; orden: number; editable: boolean }

export type Herramienta = "navegar" | "punto" | "rectangulo" | "medir" | "agregar"

export type ElementoConsultado = { id: string; capa: string; feature: Feature }

export type GrupoResultados = { capa: CapaWms; elementos: ElementoConsultado[]; total: number }

export type Consulta =
  | { estado: "cargando"; tipo: "punto" | "rectangulo" }
  | { estado: "listo"; tipo: "punto" | "rectangulo"; grupos: GrupoResultados[]; coordenada?: Coordinate }
  | { estado: "error"; tipo: "punto" | "rectangulo"; mensaje: string }

export type TipoCampo = "texto" | "entero" | "numero" | "fecha" | "booleano"

export type CampoCapa = { nombre: string; tipo: TipoCampo; obligatorio: boolean }

// Lo que hace falta para insertar en una capa por WFS-T (DescribeFeatureType).
export type EsquemaCapa = {
  capa: string
  espacioUri: string
  prefijo: string
  campoGeometria: string
  campos: CampoCapa[]
}

export type TipoGeometria = "Point" | "LineString" | "Polygon"

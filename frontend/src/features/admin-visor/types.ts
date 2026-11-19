import type { AdminPageData } from "@/components/admin/types"

export type GeoServerConfig = { url: string; workspace: string; wmsUrl: string; wfsUrl: string }

export type VisorData = AdminPageData & {
  geoserver: GeoServerConfig
  elementosUrl: string
  // [oeste, sur, este, norte] en lon/lat (EPSG:4326).
  extension: [number, number, number, number]
}

export type CapaWms = { nombre: string; titulo: string }

export const CAPA_RELEVAMIENTOS = { nombre: "relevamiento", titulo: "Relevamientos" }

export const GEOMETRIAS = {
  Point: { titulo: "Punto", ayuda: "Hacé clic en el mapa para ubicar el punto." },
  LineString: { titulo: "Línea", ayuda: "Marcá los vértices y hacé doble clic para terminar." },
  Polygon: { titulo: "Polígono", ayuda: "Marcá al menos tres vértices y volvé al primero para cerrar." },
}

export type TipoGeometria = keyof typeof GEOMETRIAS
export type BorradorElemento = { solicitud: string; geometria: string; tipo: TipoGeometria }

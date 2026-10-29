import type { AdminPageData } from "@/components/admin/types"

export type GeoServerConfig = { url: string; workspace: string; wmsUrl: string; wfsUrl: string }

export type VisorData = AdminPageData & {
  geoserver: GeoServerConfig
  // [oeste, sur, este, norte] en lon/lat (EPSG:4326).
  extension: [number, number, number, number]
}

export type CapaWms = { nombre: string; titulo: string }

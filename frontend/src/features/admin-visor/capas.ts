import WMSCapabilities from "ol/format/WMSCapabilities"
import type { CapaWms } from "./types"

type CapaCapabilities = { Name?: string; Title?: string; Layer?: CapaCapabilities[] }

function hojas(capa: CapaCapabilities): CapaWms[] {
  if (capa.Layer?.length) return capa.Layer.flatMap(hojas)
  return capa.Name ? [{ nombre: capa.Name, titulo: capa.Title || capa.Name }] : []
}

// Capas publicadas en el espacio de trabajo, leídas del GetCapabilities de WMS.
export async function leerCapas(wmsUrl: string, signal?: AbortSignal): Promise<CapaWms[]> {
  const respuesta = await fetch(`${wmsUrl}?service=WMS&version=1.3.0&request=GetCapabilities`, { signal })
  if (!respuesta.ok) throw new Error(`GeoServer respondió ${respuesta.status}`)
  const capabilities = new WMSCapabilities().read(await respuesta.text())
  const raiz = capabilities?.Capability?.Layer as CapaCapabilities | undefined
  return raiz ? hojas(raiz) : []
}

export function urlLeyenda(wmsUrl: string, capa: string) {
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.3.0",
    request: "GetLegendGraphic",
    format: "image/png",
    layer: capa,
    legend_options: "fontAntiAliasing:true;forceLabels:on",
  })
  return `${wmsUrl}?${params}`
}

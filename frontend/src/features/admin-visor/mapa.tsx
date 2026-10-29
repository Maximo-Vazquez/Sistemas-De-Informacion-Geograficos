import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import OlMap from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import ImageLayer from "ol/layer/Image"
import XYZ from "ol/source/XYZ"
import ImageWMS from "ol/source/ImageWMS"
import { ScaleLine, defaults as controlesBase } from "ol/control"
import { transformExtent } from "ol/proj"
import type { CapaWms } from "./types"

// Fondo: Argenmap, el mapa base oficial del IGN (servicio público, sin clave). Es la misma
// fuente que las capas del SIG IGN 250. Se sirve como TMS, por eso la fila va invertida ({-y}).
const ATRIBUCION =
  '<a href="https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion" target="_blank" rel="noreferrer">Instituto Geográfico Nacional</a> + OpenStreetMap'

function fondo(oscuro: boolean) {
  const capa = oscuro ? "argenmap_oscuro" : "capabaseargenmap"
  return new XYZ({
    url: `https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/${capa}@EPSG%3A3857@png/{z}/{x}/{-y}.png`,
    attributions: ATRIBUCION,
    crossOrigin: "anonymous",
    maxZoom: 19,
  })
}

// Mapa de OpenLayers: fondo Argenmap y una capa WMS por cada capa de GeoServer.
// `visibles` decide qué capas se dibujan; cada capa se crea una sola vez.
export function Mapa({
  wmsUrl,
  extension,
  capas,
  visibles,
}: {
  wmsUrl: string
  extension: [number, number, number, number]
  capas: CapaWms[]
  visibles: Set<string>
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<OlMap | null>(null)
  const capasWms = useRef(new Map<string, ImageLayer<ImageWMS>>())
  const capaFondo = useRef<TileLayer<XYZ> | null>(null)
  const { resolvedTheme } = useTheme()
  const oscuro = resolvedTheme === "dark"

  useEffect(() => {
    if (!contenedor.current) return
    capaFondo.current = new TileLayer({ source: fondo(false) })
    const instancia = new OlMap({
      target: contenedor.current,
      layers: [capaFondo.current],
      view: new View({ center: [0, 0], zoom: 2 }),
      controls: controlesBase().extend([new ScaleLine({ units: "metric", bar: true, text: true, minWidth: 120 })]),
    })
    instancia.getView().fit(transformExtent(extension, "EPSG:4326", "EPSG:3857"), { padding: [24, 24, 24, 24] })
    mapa.current = instancia
    const registradas = capasWms.current
    return () => {
      instancia.setTarget(undefined)
      mapa.current = null
      registradas.clear()
    }
  }, [extension])

  useEffect(() => {
    capaFondo.current?.setSource(fondo(oscuro))
  }, [oscuro])

  useEffect(() => {
    const instancia = mapa.current
    if (!instancia) return
    for (const capa of capas) {
      if (capasWms.current.has(capa.nombre)) continue
      const layer = new ImageLayer({
        source: new ImageWMS({ url: wmsUrl, params: { LAYERS: capa.nombre }, ratio: 1, serverType: "geoserver" }),
        visible: visibles.has(capa.nombre),
      })
      capasWms.current.set(capa.nombre, layer)
      instancia.addLayer(layer)
    }
  }, [capas, wmsUrl, visibles])

  useEffect(() => {
    for (const [nombre, layer] of capasWms.current) layer.setVisible(visibles.has(nombre))
  }, [visibles, capas])

  return <div ref={contenedor} className="size-full bg-muted" aria-label="Mapa" role="region" />
}

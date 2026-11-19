import { useCallback, useEffect, useRef, useState } from "react"
import OlMap from "ol/Map"
import View from "ol/View"
import ImageLayer from "ol/layer/Image"
import VectorLayer from "ol/layer/Vector"
import ImageWMS from "ol/source/ImageWMS"
import VectorSource from "ol/source/Vector"
import type { StyleLike } from "ol/style/Style"
import { transformExtent } from "ol/proj"
import type { CapaWms } from "../types"

const PADDING = [48, 48, 48, 48]

// Mapa de OpenLayers sin controles propios: zoom, escala y herramientas son componentes React.
export function useMapa(extension: [number, number, number, number]) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [mapa, setMapa] = useState<OlMap | null>(null)

  useEffect(() => {
    if (!contenedor.current) return
    const instancia = new OlMap({
      target: contenedor.current,
      controls: [],
      view: new View({ center: [0, 0], zoom: 2, maxZoom: 19 }),
    })
    instancia.getView().fit(transformExtent(extension, "EPSG:4326", "EPSG:3857"), { padding: PADDING })
    setMapa(instancia)
    return () => {
      instancia.setTarget(undefined)
      setMapa(null)
    }
  }, [extension])

  const verExtensionInicial = useCallback(() => {
    mapa?.getView().fit(transformExtent(extension, "EPSG:4326", "EPSG:3857"), { padding: PADDING, duration: 400 })
  }, [mapa, extension])

  return { contenedor, mapa, verExtensionInicial }
}

// Una capa WMS por cada capa de GeoServer; orden, visibilidad y opacidad vienen del panel de capas.
export function useCapasWms(
  mapa: OlMap | null,
  wmsUrl: string,
  capas: CapaWms[],
  activas: string[],
  ocultas: Set<string>,
  opacidades: Record<string, number>,
) {
  const registro = useRef(new Map<string, ImageLayer<ImageWMS>>())

  useEffect(() => {
    if (!mapa) return
    const capasMapa = registro.current
    for (const capa of capas) {
      const layer = new ImageLayer({
        source: new ImageWMS({ url: wmsUrl, params: { LAYERS: capa.nombre }, ratio: 1, serverType: "geoserver" }),
        visible: false,
        zIndex: capa.orden,
      })
      capasMapa.set(capa.nombre, layer)
      mapa.addLayer(layer)
    }
    return () => {
      for (const layer of capasMapa.values()) mapa.removeLayer(layer)
      capasMapa.clear()
    }
  }, [mapa, wmsUrl, capas])

  useEffect(() => {
    for (const [nombre, layer] of registro.current) {
      const lugar = activas.indexOf(nombre)
      layer.setVisible(lugar >= 0 && !ocultas.has(nombre))
      layer.setZIndex(1000 - lugar)
      layer.setOpacity(opacidades[nombre] ?? 1)
    }
  }, [mapa, capas, activas, ocultas, opacidades])

  // Vuelve a pedir la imagen (por ejemplo, después de insertar un elemento).
  return useCallback((nombre: string) => {
    registro.current.get(nombre)?.getSource()?.updateParams({ _: Date.now() })
  }, [])
}

// Capa vectorial propia del visor (resaltados, mediciones, dibujo) por encima de las WMS.
export function useCapaVectorial(mapa: OlMap | null, estilo: StyleLike, zIndex: number) {
  const [fuente] = useState(() => new VectorSource())
  useEffect(() => {
    if (!mapa) return
    const layer = new VectorLayer({ source: fuente, style: estilo, zIndex, updateWhileInteracting: true })
    mapa.addLayer(layer)
    return () => {
      mapa.removeLayer(layer)
    }
  }, [mapa, fuente, estilo, zIndex])
  return fuente
}

import { useEffect, useState } from "react"
import type OlMap from "ol/Map"
import GeoJSON, { type GeoJSONFeature } from "ol/format/GeoJSON"
import Draw from "ol/interaction/Draw"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { Circle, Fill, Stroke, Style } from "ol/style"
import { colorDeToken } from "./colores"
import type { BorradorElemento, TipoGeometria } from "./types"

const formato = new GeoJSON({ dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" })

function estilo(borrador = false) {
  const marca = colorDeToken("primary")
  const relleno = colorDeToken("primary", borrador ? 0.16 : 0.28)
  return new Style({
    stroke: new Stroke({ color: marca, width: 3, lineDash: borrador ? [6, 4] : undefined }),
    fill: new Fill({ color: relleno }),
    image: new Circle({
      radius: 6,
      fill: new Fill({ color: marca }),
      stroke: new Stroke({ color: colorDeToken("background"), width: 2 }),
    }),
  })
}

export function useRelevamientos({
  mapa,
  url,
  oscuro,
  dibujando,
  tipo,
}: {
  mapa: OlMap | null
  url: string
  oscuro: boolean
  dibujando: boolean
  tipo: TipoGeometria
}) {
  const [capa] = useState(() => new VectorLayer({ source: new VectorSource(), visible: false, zIndex: 80 }))
  const [vistaPrevia] = useState(() => new VectorLayer({ source: new VectorSource(), zIndex: 95 }))
  const [visible, setVisible] = useState(false)
  const [errorCarga, setErrorCarga] = useState(false)
  const [borrador, setBorrador] = useState<BorradorElemento | null>(null)
  const origen = capa.getSource()!
  const origenPrevia = vistaPrevia.getSource()!

  useEffect(() => {
    if (!mapa) return
    mapa.addLayer(capa)
    mapa.addLayer(vistaPrevia)
    return () => {
      mapa.removeLayer(capa)
      mapa.removeLayer(vistaPrevia)
    }
  }, [mapa, capa, vistaPrevia])

  useEffect(() => {
    capa.setStyle(estilo())
    vistaPrevia.setStyle(estilo(true))
  }, [capa, vistaPrevia, oscuro])

  useEffect(() => capa.setVisible(visible), [capa, visible])

  useEffect(() => {
    const control = new AbortController()
    fetch(url, { signal: control.signal, redirect: "error" })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error()
        return respuesta.json()
      })
      .then((datos) => {
        if (!control.signal.aborted) origen.addFeatures(formato.readFeatures(datos))
      })
      .catch(() => {
        if (!control.signal.aborted) setErrorCarga(true)
      })
    return () => control.abort()
  }, [url, origen])

  useEffect(() => {
    if (!mapa || !dibujando || borrador) return
    const dibujo = new Draw({ type: tipo, stopClick: true, style: estilo(true) })
    dibujo.on("drawend", ({ feature }) => {
      const geometria = formato.writeGeometry(feature.getGeometry()!, { rightHanded: true })
      dibujo.setActive(false)
      origenPrevia.addFeature(feature)
      setBorrador({ solicitud: crypto.randomUUID(), geometria, tipo })
    })

    const vista = mapa.getViewport()
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") dibujo.abortDrawing()
    }
    vista.style.cursor = "crosshair"
    document.addEventListener("keydown", alPresionar)
    mapa.addInteraction(dibujo)
    return () => {
      dibujo.abortDrawing()
      mapa.removeInteraction(dibujo)
      document.removeEventListener("keydown", alPresionar)
      vista.style.cursor = ""
    }
  }, [mapa, dibujando, tipo, oscuro, borrador, origenPrevia])

  const descartar = () => {
    origenPrevia.clear()
    setBorrador(null)
  }

  const incorporar = (datos: GeoJSONFeature) => {
    const [feature] = formato.readFeatures(datos)
    if (!feature) throw new Error("El servidor no devolvió el elemento guardado")
    origen.addFeature(feature)
    setVisible(true)
    descartar()
  }

  return { visible, setVisible, origen, errorCarga, borrador, descartar, incorporar }
}

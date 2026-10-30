import { useCallback, useEffect, useState } from "react"
import type OlMap from "ol/Map"
import Overlay from "ol/Overlay"
import type { LineString } from "ol/geom"
import { Draw } from "ol/interaction"
import { unByKey } from "ol/Observable"
import type { EventsKey } from "ol/events"
import type VectorSource from "ol/source/Vector"
import { getLength } from "ol/sphere"
import { estiloPuntero } from "../mapa/estilos"

export type Medicion = { id: string; metros: number }

const kilometros = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 })
const metros = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })

export function formatearDistancia(valor: number) {
  return valor >= 1000 ? `${kilometros.format(valor / 1000)} km` : `${metros.format(valor)} m`
}

// Medición de distancias geodésicas (ol/sphere) con líneas de varios tramos. La distancia en
// curso se muestra junto al puntero; las terminadas quedan dibujadas con su etiqueta.
export function useMedicion(mapa: OlMap | null, activa: boolean, fuente: VectorSource) {
  const [mediciones, setMediciones] = useState<Medicion[]>([])
  const [enCurso, setEnCurso] = useState<number | null>(null)

  useEffect(() => {
    if (!mapa || !activa) return
    const dibujo = new Draw({ source: fuente, type: "LineString", style: estiloPuntero("warning") })
    const etiqueta = document.createElement("div")
    etiqueta.className =
      "pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background tabular-nums shadow-md"
    const globo = new Overlay({ element: etiqueta, offset: [14, -14], positioning: "bottom-left", stopEvent: false })
    mapa.addOverlay(globo)
    let escucha: EventsKey | undefined

    dibujo.on("drawstart", (evento) => {
      const linea = evento.feature.getGeometry() as LineString
      escucha = linea.on("change", () => {
        const distancia = getLength(linea)
        setEnCurso(distancia)
        etiqueta.textContent = formatearDistancia(distancia)
        globo.setPosition(linea.getLastCoordinate())
      })
    })
    dibujo.on("drawend", (evento) => {
      if (escucha) unByKey(escucha)
      const distancia = getLength(evento.feature.getGeometry() as LineString)
      const id = crypto.randomUUID()
      evento.feature.setId(id)
      evento.feature.set("etiqueta", formatearDistancia(distancia))
      setMediciones((actuales) => [...actuales, { id, metros: distancia }])
      setEnCurso(null)
      globo.setPosition(undefined)
    })
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Backspace") dibujo.removeLastPoint()
    }
    window.addEventListener("keydown", alTeclear)
    mapa.addInteraction(dibujo)
    return () => {
      window.removeEventListener("keydown", alTeclear)
      mapa.removeInteraction(dibujo)
      mapa.removeOverlay(globo)
      if (escucha) unByKey(escucha)
      setEnCurso(null)
    }
  }, [mapa, activa, fuente])

  const eliminar = useCallback(
    (id: string) => {
      const feature = fuente.getFeatureById(id)
      if (feature) fuente.removeFeature(feature)
      setMediciones((actuales) => actuales.filter((medicion) => medicion.id !== id))
    },
    [fuente],
  )

  const limpiar = useCallback(() => {
    fuente.clear()
    setMediciones([])
  }, [fuente])

  return { mediciones, enCurso, eliminar, limpiar }
}

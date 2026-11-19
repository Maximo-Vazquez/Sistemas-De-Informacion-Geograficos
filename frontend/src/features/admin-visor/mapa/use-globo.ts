import { useEffect, useState } from "react"
import type OlMap from "ol/Map"
import Overlay from "ol/Overlay"
import type { Coordinate } from "ol/coordinate"

// Contenedor anclado a una coordenada del mapa; React dibuja adentro con un portal.
// El mapa se desplaza solo si el globo queda fuera de la vista.
export function useGlobo(mapa: OlMap | null, posicion: Coordinate | undefined) {
  const [elemento] = useState(() => document.createElement("div"))
  const [globo, setGlobo] = useState<Overlay | null>(null)

  useEffect(() => {
    if (!mapa) return
    const overlay = new Overlay({
      element: elemento,
      positioning: "bottom-center",
      offset: [0, -14],
      stopEvent: true,
      autoPan: { animation: { duration: 250 }, margin: 24 },
    })
    mapa.addOverlay(overlay)
    setGlobo(overlay)
    return () => {
      mapa.removeOverlay(overlay)
      setGlobo(null)
    }
  }, [mapa, elemento])

  useEffect(() => {
    globo?.setPosition(posicion)
  }, [globo, posicion])

  return elemento
}

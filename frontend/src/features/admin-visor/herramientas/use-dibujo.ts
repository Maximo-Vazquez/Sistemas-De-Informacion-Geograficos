import { useCallback, useEffect, useState } from "react"
import type OlMap from "ol/Map"
import type { Geometry } from "ol/geom"
import { Draw, Modify, Snap } from "ol/interaction"
import type VectorSource from "ol/source/Vector"
import { estiloPuntero } from "../mapa/estilos"
import type { TipoGeometria } from "../types"

// Dibujo del elemento nuevo: primero se traza (Draw) y después se pueden mover sus vértices
// (Modify) hasta guardarlo o descartarlo. Hay un solo elemento en curso por vez.
export function useDibujo(mapa: OlMap | null, activo: boolean, tipo: TipoGeometria, fuente: VectorSource) {
  const [geometria, setGeometria] = useState<Geometry | null>(null)

  const descartar = useCallback(() => {
    fuente.clear()
    setGeometria(null)
  }, [fuente])

  useEffect(() => {
    if (!mapa || !activo || geometria) return
    const dibujo = new Draw({ source: fuente, type: tipo, style: estiloPuntero("success") })
    dibujo.on("drawend", (evento) => setGeometria(evento.feature.getGeometry() ?? null))
    mapa.addInteraction(dibujo)
    return () => {
      mapa.removeInteraction(dibujo)
    }
  }, [mapa, activo, tipo, fuente, geometria])

  useEffect(() => {
    if (!mapa || !activo || !geometria) return
    const edicion = new Modify({ source: fuente, style: estiloPuntero("success") })
    const iman = new Snap({ source: fuente })
    mapa.addInteraction(edicion)
    mapa.addInteraction(iman)
    return () => {
      mapa.removeInteraction(edicion)
      mapa.removeInteraction(iman)
    }
  }, [mapa, activo, fuente, geometria])

  // Al salir de la herramienta o cambiar el tipo de geometría se descarta lo dibujado.
  useEffect(() => {
    if (!activo) descartar()
  }, [activo, descartar])
  useEffect(() => {
    descartar()
  }, [tipo, descartar])

  return { geometria, descartar }
}

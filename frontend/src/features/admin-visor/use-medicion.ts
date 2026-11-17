import { useCallback, useEffect, useRef, useState } from "react"
import type OlMap from "ol/Map"
import Overlay from "ol/Overlay"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Draw from "ol/interaction/Draw"
import type { LineString } from "ol/geom"
import { getLength } from "ol/sphere"
import { unByKey } from "ol/Observable"
import type { EventsKey } from "ol/events"
import { Circle, Fill, Stroke, Style } from "ol/style"
import { formatNumber } from "@/lib/format"
import { colorDeToken } from "./colores"

const kilometros = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Distancia geodésica: las coordenadas del mapa están en EPSG:3857, cuyas distancias
// planas se deforman con la latitud (en el Chaco, ~13 % más largas). getLength mide sobre la esfera.
export function formatearDistancia(metros: number) {
  return metros < 1000 ? `${formatNumber(Math.round(metros))} m` : `${kilometros.format(metros / 1000)} km`
}

const ETIQUETA =
  "pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background tabular-nums shadow-sm"

function estilos(boceto: boolean) {
  const marca = colorDeToken("primary")
  const halo = colorDeToken("background", 0.9)
  return [
    new Style({ stroke: new Stroke({ color: halo, width: 6 }) }),
    new Style({
      stroke: new Stroke({ color: marca, width: 3, lineDash: boceto ? [8, 6] : undefined }),
      image: new Circle({ radius: 4, fill: new Fill({ color: halo }), stroke: new Stroke({ color: marca, width: 2 }) }),
    }),
  ]
}

function crearEtiqueta(mapa: OlMap) {
  const elemento = document.createElement("div")
  elemento.className = ETIQUETA
  const etiqueta = new Overlay({ element: elemento, offset: [0, -12], positioning: "bottom-center", stopEvent: false })
  mapa.addOverlay(etiqueta)
  return etiqueta
}

// Herramienta de medición de distancias: clic agrega vértices, doble clic termina y Esc
// cancela la línea en curso. Las mediciones quedan en el mapa hasta borrarlas.
export function useMedicion(mapa: OlMap | null, activa: boolean, oscuro: boolean) {
  const origen = useRef(new VectorSource())
  const capa = useRef<VectorLayer | null>(null)
  const etiquetas = useRef<Overlay[]>([])
  const [cantidad, setCantidad] = useState(0)

  useEffect(() => {
    if (!mapa) return
    const vector = new VectorLayer({ source: origen.current, zIndex: 100 })
    capa.current = vector
    mapa.addLayer(vector)
    return () => {
      mapa.removeLayer(vector)
      capa.current = null
    }
  }, [mapa])

  // Los tokens cambian con el tema: se rearman los estilos para que contrasten en ambos.
  useEffect(() => {
    capa.current?.setStyle(estilos(false))
  }, [mapa, oscuro])

  useEffect(() => {
    if (!mapa || !activa) return
    const dibujo = new Draw({ source: origen.current, type: "LineString", style: estilos(true) })
    let enCurso: Overlay | null = null
    let escucha: EventsKey | null = null

    dibujo.on("drawstart", (evento) => {
      const linea = evento.feature.getGeometry() as LineString
      const etiqueta = crearEtiqueta(mapa)
      const actualizar = () => {
        etiqueta.getElement()!.textContent = formatearDistancia(getLength(linea))
        etiqueta.setPosition(linea.getLastCoordinate())
      }
      enCurso = etiqueta
      actualizar()
      escucha = linea.on("change", actualizar)
    })
    const soltar = (conservar: boolean) => {
      if (escucha) unByKey(escucha)
      if (enCurso && conservar) etiquetas.current.push(enCurso)
      else if (enCurso) mapa.removeOverlay(enCurso)
      enCurso = escucha = null
    }
    dibujo.on("drawend", () => {
      soltar(true)
      setCantidad(etiquetas.current.length)
    })
    dibujo.on("drawabort", () => soltar(false))

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") dibujo.abortDrawing()
    }
    const vista = mapa.getViewport()
    vista.style.cursor = "crosshair"
    document.addEventListener("keydown", alPresionar)
    mapa.addInteraction(dibujo)
    return () => {
      dibujo.abortDrawing()
      mapa.removeInteraction(dibujo)
      document.removeEventListener("keydown", alPresionar)
      vista.style.cursor = ""
    }
  }, [mapa, activa, oscuro])

  const borrar = useCallback(() => {
    origen.current.clear()
    for (const etiqueta of etiquetas.current) mapa?.removeOverlay(etiqueta)
    etiquetas.current = []
    setCantidad(0)
  }, [mapa])

  return { cantidad, borrar }
}

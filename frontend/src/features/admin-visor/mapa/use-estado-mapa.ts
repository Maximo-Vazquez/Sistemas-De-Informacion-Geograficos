import { useEffect, useState } from "react"
import type OlMap from "ol/Map"
import { getPointResolution, toLonLat } from "ol/proj"
import type { Coordinate } from "ol/coordinate"

// Escala numérica (1 : N), barra de escala y coordenadas del puntero para la barra de estado.
const METROS_POR_PIXEL_OGC = 0.00028
const ANCHO_BARRA = 96

export type EstadoMapa = {
  denominador: number
  barra: { pixeles: number; metros: number }
  puntero: Coordinate | null
}

function barraRedonda(metrosPorPixel: number) {
  const maximo = metrosPorPixel * ANCHO_BARRA
  const potencia = 10 ** Math.floor(Math.log10(maximo))
  const metros = [5, 2, 1].map((paso) => paso * potencia).find((valor) => valor <= maximo) ?? potencia
  return { metros, pixeles: Math.round(metros / metrosPorPixel) }
}

export function useEstadoMapa(mapa: OlMap | null) {
  const [estado, setEstado] = useState<EstadoMapa>({ denominador: 0, barra: { pixeles: 0, metros: 0 }, puntero: null })

  useEffect(() => {
    if (!mapa) return
    const vista = mapa.getView()
    const actualizarEscala = () => {
      const resolucion = vista.getResolution()
      const centro = vista.getCenter()
      if (!resolucion || !centro) return
      const metrosPorPixel = getPointResolution(vista.getProjection(), resolucion, centro, "m")
      setEstado((actual) => ({
        ...actual,
        denominador: metrosPorPixel / METROS_POR_PIXEL_OGC,
        barra: barraRedonda(metrosPorPixel),
      }))
    }
    let cuadro = 0
    const alMover = (evento: { coordinate: Coordinate }) => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => setEstado((actual) => ({ ...actual, puntero: toLonLat(evento.coordinate) })))
    }
    const alSalir = () => setEstado((actual) => ({ ...actual, puntero: null }))
    const vistaPort = mapa.getViewport()
    actualizarEscala()
    mapa.on("moveend", actualizarEscala)
    mapa.on("pointermove", alMover)
    vistaPort.addEventListener("pointerleave", alSalir)
    return () => {
      cancelAnimationFrame(cuadro)
      mapa.un("moveend", actualizarEscala)
      mapa.un("pointermove", alMover)
      vistaPort.removeEventListener("pointerleave", alSalir)
    }
  }, [mapa])

  return estado
}

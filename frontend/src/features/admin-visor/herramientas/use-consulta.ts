import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import Feature from "ol/Feature"
import type OlMap from "ol/Map"
import type MapBrowserEvent from "ol/MapBrowserEvent"
import { Point } from "ol/geom"
import { DragBox, DragPan } from "ol/interaction"
import type VectorSource from "ol/source/Vector"
import { consultarPunto, consultarRectangulo } from "../ogc"
import type { CapaWms, Consulta, GeoServerConfig, GrupoResultados, Herramienta } from "../types"

type Buscar = (signal: AbortSignal) => Promise<GrupoResultados[]>

// Consulta gráfica: clic (GetFeatureInfo) o rectángulo (WFS BBOX) sobre las capas encendidas.
// Los elementos encontrados se resaltan en `fuente`; `seleccionar` destaca uno y lo encuadra.
export function useConsulta(
  mapa: OlMap | null,
  herramienta: Herramienta,
  capasEncendidas: CapaWms[],
  geoserver: GeoServerConfig,
  fuente: VectorSource,
) {
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const control = useRef<AbortController | null>(null)

  const ejecutar = useEffectEvent(async (tipo: "punto" | "rectangulo", buscar: Buscar, marco: Feature) => {
    control.current?.abort()
    const actual = new AbortController()
    control.current = actual
    fuente.clear()
    marco.set("rectangulo", true)
    fuente.addFeature(marco)
    setSeleccion(null)
    if (capasEncendidas.length === 0) {
      setConsulta({ estado: "error", tipo, mensaje: "Encendé al menos una capa para consultar." })
      return
    }
    setConsulta({ estado: "cargando", tipo })
    try {
      const grupos = await buscar(actual.signal)
      if (actual.signal.aborted) return
      fuente.addFeatures(grupos.flatMap((grupo) => grupo.elementos.map((elemento) => elemento.feature)))
      setConsulta({ estado: "listo", tipo, grupos })
    } catch (error) {
      if (actual.signal.aborted) return
      setConsulta({ estado: "error", tipo, mensaje: error instanceof Error ? error.message : "No se pudo consultar." })
    }
  })

  const porPunto = useEffectEvent((evento: MapBrowserEvent) => {
    const resolucion = mapa?.getView().getResolution()
    if (!resolucion) return
    const buscar: Buscar = (signal) =>
      consultarPunto(geoserver.wmsUrl, capasEncendidas, evento.coordinate, resolucion, signal)
    ejecutar("punto", buscar, new Feature(new Point(evento.coordinate)))
  })

  const porRectangulo = useEffectEvent((caja: DragBox) => {
    const geometria = caja.getGeometry()
    const buscar: Buscar = (signal) =>
      consultarRectangulo(geoserver.wfsUrl, capasEncendidas, geometria.getExtent(), signal)
    ejecutar("rectangulo", buscar, new Feature(geometria.clone()))
  })

  useEffect(() => {
    if (!mapa || herramienta !== "punto") return
    const alHacerClic = (evento: MapBrowserEvent) => porPunto(evento)
    mapa.on("singleclick", alHacerClic)
    return () => mapa.un("singleclick", alHacerClic)
  }, [mapa, herramienta])

  useEffect(() => {
    if (!mapa || herramienta !== "rectangulo") return
    // Con el rectángulo activo, arrastrar dibuja en lugar de mover el mapa.
    const paneo = mapa.getInteractions().getArray().filter((interaccion) => interaccion instanceof DragPan)
    paneo.forEach((interaccion) => interaccion.setActive(false))
    const caja = new DragBox()
    caja.on("boxend", () => porRectangulo(caja))
    mapa.addInteraction(caja)
    return () => {
      mapa.removeInteraction(caja)
      paneo.forEach((interaccion) => interaccion.setActive(true))
    }
  }, [mapa, herramienta])

  const seleccionar = useCallback(
    (id: string | null) => {
      setSeleccion(id)
      for (const feature of fuente.getFeatures()) feature.set("seleccionado", feature.getId() === id)
      const elegido = id ? fuente.getFeatureById(id) : null
      const extension = elegido?.getGeometry()?.getExtent()
      if (mapa && extension) {
        mapa.getView().fit(extension, { padding: [80, 80, 80, 80], maxZoom: 13, duration: 400 })
      }
    },
    [fuente, mapa],
  )

  const limpiar = useCallback(() => {
    control.current?.abort()
    fuente.clear()
    setConsulta(null)
    setSeleccion(null)
  }, [fuente])

  return { consulta, seleccion, seleccionar, limpiar }
}

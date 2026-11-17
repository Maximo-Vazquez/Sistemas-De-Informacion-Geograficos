import { useCallback, useEffect, useRef, useState } from "react"
import type OlMap from "ol/Map"
import type Feature from "ol/Feature"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import DragBox from "ol/interaction/DragBox"
import { unByKey } from "ol/Observable"
import { Circle, Fill, Stroke, Style } from "ol/style"
import { colorDeToken } from "./colores"
import { consultarPunto, consultarRectangulo, type Elemento, type ResultadoCapa } from "./consultas"
import type { CapaWms } from "./types"

export type ModoConsulta = "punto" | "rectangulo"

export type Consulta =
  | { tipo: "vacia" }
  | { tipo: "sin-capas"; modo: ModoConsulta }
  | { tipo: "consultando"; modo: ModoConsulta }
  // `numero` identifica cada consulta, para que el panel arranque de cero con la siguiente.
  | { tipo: "lista"; modo: ModoConsulta; resultados: ResultadoCapa[]; numero: number }

function estilos(destacado: boolean) {
  const marca = colorDeToken("primary")
  const relleno = colorDeToken("primary", destacado ? 0.3 : 0.12)
  const halo = colorDeToken("background", 0.9)
  const ancho = destacado ? 4 : 2.5
  return [
    new Style({ stroke: new Stroke({ color: halo, width: ancho + 3 }) }),
    new Style({
      stroke: new Stroke({ color: marca, width: ancho }),
      fill: new Fill({ color: relleno }),
      image: new Circle({
        radius: destacado ? 8 : 6,
        fill: new Fill({ color: relleno }),
        stroke: new Stroke({ color: marca, width: 2 }),
      }),
    }),
  ]
}

// Consultas gráficas sobre las capas encendidas: clic (GetFeatureInfo de WMS) o
// rectángulo arrastrado (GetFeature de WFS). Los elementos encontrados se resaltan en el
// mapa; el seleccionado en el panel se destaca y el mapa se acerca a él.
export function useConsulta({
  mapa,
  modo,
  capas,
  wmsUrl,
  wfsUrl,
  oscuro,
}: {
  mapa: OlMap | null
  modo: ModoConsulta | null
  capas: CapaWms[]
  wmsUrl: string
  wfsUrl: string
  oscuro: boolean
}) {
  const [consulta, setConsulta] = useState<Consulta>({ tipo: "vacia" })
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const origen = useRef(new VectorSource())
  const capa = useRef<VectorLayer | null>(null)
  const control = useRef<AbortController | null>(null)
  const numero = useRef(0)
  // Las capas encendidas se leen al consultar; así cambiar un interruptor no rearma las interacciones.
  const capasActuales = useRef(capas)
  useEffect(() => {
    capasActuales.current = capas
  }, [capas])

  useEffect(() => {
    if (!mapa) return
    const vector = new VectorLayer({ source: origen.current, zIndex: 90 })
    capa.current = vector
    mapa.addLayer(vector)
    return () => {
      mapa.removeLayer(vector)
      capa.current = null
    }
  }, [mapa])

  useEffect(() => {
    const normal = estilos(false)
    const destacado = estilos(true)
    capa.current?.setStyle((feature) => (feature.getId() === seleccionado ? destacado : normal))
  }, [mapa, oscuro, seleccionado])

  const ejecutar = useCallback(
    async (modoActual: ModoConsulta, consultar: (capas: CapaWms[], signal: AbortSignal) => Promise<ResultadoCapa[]>) => {
      control.current?.abort()
      const actual = new AbortController()
      control.current = actual
      origen.current.clear()
      setSeleccionado(null)
      if (capasActuales.current.length === 0) {
        setConsulta({ tipo: "sin-capas", modo: modoActual })
        return
      }
      setConsulta({ tipo: "consultando", modo: modoActual })
      try {
        const resultados = await consultar(capasActuales.current, actual.signal)
        origen.current.addFeatures(resultados.flatMap((resultado) => resultado.elementos.map((e) => e.feature)))
        numero.current += 1
        setConsulta({ tipo: "lista", modo: modoActual, resultados, numero: numero.current })
      } catch {
        if (!actual.signal.aborted) setConsulta({ tipo: "vacia" })
      }
    },
    [],
  )

  useEffect(() => {
    if (!mapa || !modo) return
    const vista = mapa.getViewport()
    vista.style.cursor = "crosshair"
    if (modo === "punto") {
      const escucha = mapa.on("singleclick", (evento) => {
        const resolucion = mapa.getView().getResolution() ?? 1
        void ejecutar("punto", (capas, signal) =>
          consultarPunto(wmsUrl, capas, evento.coordinate, resolucion, signal),
        )
      })
      return () => {
        unByKey(escucha)
        vista.style.cursor = ""
      }
    }
    // El recuadro toma los colores de los tokens. OpenLayers le agrega "ol-box", cuyo estilo
    // (ol.css, fuera de las capas de Tailwind) ganaría sin el "!".
    const recuadro = new DragBox({ className: "rounded-sm! border-2! border-primary! bg-primary/10!" })
    recuadro.on("boxend", () => {
      const extension = recuadro.getGeometry().getExtent()
      void ejecutar("rectangulo", (capas, signal) => consultarRectangulo(wfsUrl, capas, extension, signal))
    })
    mapa.addInteraction(recuadro)
    return () => {
      mapa.removeInteraction(recuadro)
      vista.style.cursor = ""
    }
  }, [mapa, modo, wmsUrl, wfsUrl, ejecutar])

  const seleccionar = useCallback(
    (elemento: Elemento | null) => {
      setSeleccionado(elemento?.id ?? null)
      const geometria = (elemento?.feature as Feature | undefined)?.getGeometry()
      if (!mapa || !geometria) return
      mapa.getView().fit(geometria.getExtent(), { padding: [96, 96, 96, 96], maxZoom: 13, duration: 300 })
    },
    [mapa],
  )

  const cerrar = useCallback(() => {
    control.current?.abort()
    origen.current.clear()
    setSeleccionado(null)
    setConsulta({ tipo: "vacia" })
  }, [])

  return { consulta, seleccionado, seleccionar, cerrar }
}

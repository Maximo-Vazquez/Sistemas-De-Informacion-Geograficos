import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useTheme } from "next-themes"
import { Layers } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useDjangoMessages } from "@/lib/use-django-messages"
import { cn } from "@/lib/utils"
import { CAPAS_INICIALES } from "./catalogo"
import { useConsulta } from "./herramientas/use-consulta"
import { useDibujo } from "./herramientas/use-dibujo"
import { useMedicion } from "./herramientas/use-medicion"
import { estiloDibujo, estiloMedicion, estiloResaltado } from "./mapa/estilos"
import { useCapasActivas } from "./mapa/use-capas-activas"
import { useEstadoMapa } from "./mapa/use-estado-mapa"
import { useGlobo } from "./mapa/use-globo"
import { useCapasWms, useCapaVectorial, useMapa } from "./mapa/use-mapa"
import { leerCapas } from "./ogc"
import type { Herramienta, TipoGeometria, VisorData } from "./types"
import { BarraHerramientas, TECLAS } from "./ui/barra-herramientas"
import { BarraEstado, ControlesZoom } from "./ui/controles-mapa"
import { DetalleElemento } from "./ui/detalle-elemento"
import { EstadoConsulta } from "./ui/estado-consulta"
import { GloboConsulta, type ElementoConCapa } from "./ui/globo-consulta"
import { PanelAgregar } from "./ui/panel-agregar"
import { PanelCapas, type EstadoCapas } from "./ui/panel-capas"
import { PanelMedicion } from "./ui/panel-medicion"
import { TablaAtributos } from "./ui/tabla-atributos"

const SIN_CAPAS: never[] = []

function esCampoDeTexto(destino: EventTarget | null) {
  return destino instanceof HTMLElement && (destino.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName))
}

export function VisorPage({ data }: { data: VisorData }) {
  useDjangoMessages(data.messages)
  const { geoserver } = data
  const [estado, setEstado] = useState<EstadoCapas>({ tipo: "cargando" })
  const [herramienta, setHerramienta] = useState<Herramienta>("navegar")
  const [capaEditable, setCapaEditable] = useState("")
  const [tipoGeometria, setTipoGeometria] = useState<TipoGeometria>("Point")
  const [catalogoAbierto, setCatalogoAbierto] = useState(false)
  const [detalleId, setDetalleId] = useState<string | null>(null)

  const capas = estado.tipo === "listo" ? estado.capas : SIN_CAPAS
  const activas = useCapasActivas(capas)
  const editables = useMemo(() => capas.filter((capa) => capa.editable), [capas])
  const { reemplazar } = activas

  useEffect(() => {
    const control = new AbortController()
    leerCapas(geoserver.wmsUrl, data.capasEditables, control.signal)
      .then((resultado) => {
        setEstado({ tipo: "listo", capas: resultado })
        setCapaEditable(resultado.find((capa) => capa.editable)?.nombre ?? "")
      })
      .catch(() => !control.signal.aborted && setEstado({ tipo: "error" }))
    return () => control.abort()
  }, [geoserver.wmsUrl, data.capasEditables])

  useEffect(() => {
    if (capas.length) reemplazar(CAPAS_INICIALES)
  }, [capas, reemplazar])

  // Mapa, capas y herramientas: cada una vive en su hook y comparte solo el mapa.
  const { contenedor, mapa, verExtensionInicial } = useMapa(data.extension)
  const refrescarCapa = useCapasWms(mapa, geoserver.wmsUrl, capas, activas.activas, activas.ocultas, activas.opacidades)
  const fuenteResaltado = useCapaVectorial(mapa, estiloResaltado, 10_000)
  const fuenteMedicion = useCapaVectorial(mapa, estiloMedicion, 10_001)
  const fuenteDibujo = useCapaVectorial(mapa, estiloDibujo, 10_002)
  const estadoMapa = useEstadoMapa(mapa)
  const consulta = useConsulta(mapa, herramienta, activas.visibles, geoserver, fuenteResaltado)
  const medicion = useMedicion(mapa, herramienta === "medir", fuenteMedicion)
  const dibujo = useDibujo(mapa, herramienta === "agregar", tipoGeometria, fuenteDibujo)

  // Resultados con su capa: el globo los recorre y el detalle busca por identificador.
  const elementos = useMemo<ElementoConCapa[]>(() => {
    const actual = consulta.consulta
    if (actual?.estado !== "listo") return []
    return actual.grupos.flatMap((grupo) => grupo.elementos.map((elemento) => ({ ...elemento, capaWms: grupo.capa })))
  }, [consulta.consulta])
  const resultado = consulta.consulta?.estado === "listo" ? consulta.consulta : null
  const conGlobo = resultado?.tipo === "punto" && elementos.length > 0
  const conTabla = resultado?.tipo === "rectangulo" && resultado.grupos.length > 0
  const indiceGlobo = Math.max(0, elementos.findIndex((elemento) => elemento.id === consulta.seleccion))
  const globo = useGlobo(mapa, conGlobo ? resultado.coordenada : undefined)

  // Los estilos propios leen los tokens del tema: al cambiar de tema se vuelve a dibujar.
  const { resolvedTheme } = useTheme()
  useEffect(() => mapa?.render(), [mapa, resolvedTheme])

  const { limpiar: limpiarConsulta } = consulta
  const cambiarHerramienta = useCallback(
    (siguiente: Herramienta) => {
      // Los resultados quedan al volver a Navegar; con otra herramienta se limpian.
      if (siguiente !== "navegar") limpiarConsulta()
      setHerramienta(siguiente)
    },
    [limpiarConsulta],
  )

  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.ctrlKey || evento.metaKey || evento.altKey || esCampoDeTexto(evento.target)) return
      if (evento.key === "Escape") return cambiarHerramienta("navegar")
      if (evento.key.toLowerCase() === "c") {
        evento.preventDefault()
        return setCatalogoAbierto(true)
      }
      const elegida = TECLAS[evento.key.toLowerCase()]
      if (elegida) cambiarHerramienta(elegida)
    }
    window.addEventListener("keydown", alTeclear)
    return () => window.removeEventListener("keydown", alTeclear)
  }, [cambiarHerramienta])

  const alGuardar = (capa: string) => {
    refrescarCapa(capa)
    activas.agregar(capa)
    if (activas.ocultas.has(capa)) activas.alternarVisible(capa)
    dibujo.descartar()
  }

  const panelCapas = (
    <PanelCapas
      estado={estado}
      activas={activas}
      catalogoAbierto={catalogoAbierto}
      onCatalogo={setCatalogoAbierto}
      wmsUrl={geoserver.wmsUrl}
      consolaUrl={`${geoserver.url}/web/`}
    />
  )

  const consultando = herramienta === "punto" || herramienta === "rectangulo"
  const panelHerramienta =
    herramienta === "medir" ? (
      <PanelMedicion {...medicion} onEliminar={medicion.eliminar} onLimpiar={medicion.limpiar} />
    ) : herramienta === "agregar" ? (
      <PanelAgregar
        capas={editables}
        capa={capaEditable}
        onCapa={setCapaEditable}
        tipo={tipoGeometria}
        onTipo={setTipoGeometria}
        geometria={dibujo.geometria}
        onDescartar={dibujo.descartar}
        onGuardado={alGuardar}
        wfsUrl={geoserver.wfsUrl}
        transaccionUrl={data.transaccionUrl}
        csrf={data.csrf}
      />
    ) : consultando && !conGlobo && !conTabla ? (
      <EstadoConsulta consulta={consulta.consulta} tipo={herramienta} capasConsultadas={activas.visibles.length} />
    ) : null

  return (
    <AdminLayout
      title="Visor"
      contentWidth="full"
      adminUrl={data.adminUrl}
      sidebarOpen={data.sidebarOpen}
      navigation={data.navigation}
      homeUrl={data.homeUrl}
      brandName={data.brandName}
      logoUrl={data.logoUrl}
      currentUrl={data.currentUrl}
      user={data.viewer}
      accountUrl={data.accountUrl}
      logoutUrl={data.logoutUrl}
      csrf={data.csrf}
    >
      <div className="flex min-h-0 flex-1">
        <aside aria-label="Capas" className="hidden w-80 shrink-0 flex-col border-r bg-background md:flex">
          {panelCapas}
        </aside>
        <div className="flex min-h-[60dvh] min-w-0 flex-1 flex-col md:min-h-0">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={contenedor}
              role="region"
              aria-label="Mapa"
              className={cn("absolute inset-0 bg-muted/40", herramienta !== "navegar" && "cursor-crosshair")}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" size="icon" className="shadow-lg md:hidden" aria-label="Capas" />}>
                  <Layers />
                </SheetTrigger>
                <SheetContent side="left" className="flex w-80 flex-col gap-0 p-0">
                  <SheetHeader>
                    <SheetTitle>Capas</SheetTitle>
                  </SheetHeader>
                  {panelCapas}
                </SheetContent>
              </Sheet>
              <BarraHerramientas herramienta={herramienta} onCambiar={cambiarHerramienta} />
              <ControlesZoom mapa={mapa} onInicio={verExtensionInicial} />
            </div>
            {panelHerramienta && (
              <div className="pointer-events-none absolute inset-x-3 bottom-14 flex max-h-[45%] flex-col justify-end md:top-3 md:right-3 md:bottom-16 md:left-auto md:max-h-none md:justify-start">
                {panelHerramienta}
              </div>
            )}
            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)]">
              <BarraEstado estado={estadoMapa} />
            </div>
          </div>
          {conTabla && (
            <TablaAtributos
              key={resultado.grupos.map((grupo) => grupo.capa.nombre).join()}
              grupos={resultado.grupos}
              seleccion={consulta.seleccion}
              onSeleccionar={consulta.seleccionar}
              onDetalle={setDetalleId}
              onCerrar={consulta.limpiar}
            />
          )}
        </div>
      </div>
      {conGlobo &&
        createPortal(
          <GloboConsulta
            elementos={elementos}
            actual={indiceGlobo}
            onCambiar={(indice) => consulta.seleccionar(elementos[indice].id)}
            onVerTodo={() => setDetalleId(elementos[indiceGlobo].id)}
            onCerrar={consulta.limpiar}
          />,
          globo,
        )}
      <DetalleElemento elemento={elementos.find((elemento) => elemento.id === detalleId) ?? null} onCerrar={() => setDetalleId(null)} />
    </AdminLayout>
  )
}

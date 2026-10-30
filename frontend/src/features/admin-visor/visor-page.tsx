import { useCallback, useEffect, useMemo, useState } from "react"
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
import { useEstadoMapa } from "./mapa/use-estado-mapa"
import { useCapasWms, useCapaVectorial, useMapa } from "./mapa/use-mapa"
import { leerCapas } from "./ogc"
import type { Herramienta, TipoGeometria, VisorData } from "./types"
import { BarraHerramientas, TECLAS } from "./ui/barra-herramientas"
import { BarraEstado, ControlesZoom } from "./ui/controles-mapa"
import { PanelAgregar } from "./ui/panel-agregar"
import { PanelLateral, type EstadoCapas } from "./ui/panel-lateral"
import { PanelMedicion } from "./ui/panel-medicion"
import { ResultadosConsulta } from "./ui/resultados-consulta"

const SIN_CAPAS: never[] = []

function esCampoDeTexto(destino: EventTarget | null) {
  return destino instanceof HTMLElement && (destino.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName))
}

export function VisorPage({ data }: { data: VisorData }) {
  useDjangoMessages(data.messages)
  const { geoserver } = data
  const [estado, setEstado] = useState<EstadoCapas>({ tipo: "cargando" })
  const [visibles, setVisibles] = useState<Set<string>>(() => new Set())
  const [opacidades, setOpacidades] = useState<Record<string, number>>({})
  const [herramienta, setHerramienta] = useState<Herramienta>("navegar")
  const [capaEditable, setCapaEditable] = useState("")
  const [tipoGeometria, setTipoGeometria] = useState<TipoGeometria>("Point")

  const capas = estado.tipo === "listo" ? estado.capas : SIN_CAPAS
  const encendidas = useMemo(() => capas.filter((capa) => visibles.has(capa.nombre)), [capas, visibles])
  const editables = useMemo(() => capas.filter((capa) => capa.editable), [capas])

  useEffect(() => {
    const control = new AbortController()
    leerCapas(geoserver.wmsUrl, data.capasEditables, control.signal)
      .then((resultado) => {
        setEstado({ tipo: "listo", capas: resultado })
        setVisibles(new Set(resultado.filter((capa) => CAPAS_INICIALES.includes(capa.nombre)).map((capa) => capa.nombre)))
        setCapaEditable(resultado.find((capa) => capa.editable)?.nombre ?? "")
      })
      .catch(() => !control.signal.aborted && setEstado({ tipo: "error" }))
    return () => control.abort()
  }, [geoserver.wmsUrl, data.capasEditables])

  // Mapa, capas y herramientas: cada una vive en su hook y comparte solo el mapa.
  const { contenedor, mapa, verExtensionInicial } = useMapa(data.extension)
  const refrescarCapa = useCapasWms(mapa, geoserver.wmsUrl, capas, visibles, opacidades)
  const fuenteResaltado = useCapaVectorial(mapa, estiloResaltado, 10_000)
  const fuenteMedicion = useCapaVectorial(mapa, estiloMedicion, 10_001)
  const fuenteDibujo = useCapaVectorial(mapa, estiloDibujo, 10_002)
  const estadoMapa = useEstadoMapa(mapa)
  const consulta = useConsulta(mapa, herramienta, encendidas, geoserver, fuenteResaltado)
  const medicion = useMedicion(mapa, herramienta === "medir", fuenteMedicion)
  const dibujo = useDibujo(mapa, herramienta === "agregar", tipoGeometria, fuenteDibujo)

  // Los estilos propios leen los tokens del tema: al cambiar de tema se vuelve a dibujar.
  const { resolvedTheme } = useTheme()
  useEffect(() => mapa?.render(), [mapa, resolvedTheme])

  const { limpiar: limpiarConsulta } = consulta
  const cambiarHerramienta = useCallback(
    (siguiente: Herramienta) => {
      if (siguiente === "medir" || siguiente === "agregar") limpiarConsulta()
      setHerramienta(siguiente)
    },
    [limpiarConsulta],
  )

  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.ctrlKey || evento.metaKey || evento.altKey || esCampoDeTexto(evento.target)) return
      if (evento.key === "Escape") return cambiarHerramienta("navegar")
      const elegida = TECLAS[evento.key.toLowerCase()]
      if (elegida) cambiarHerramienta(elegida)
    }
    window.addEventListener("keydown", alTeclear)
    return () => window.removeEventListener("keydown", alTeclear)
  }, [cambiarHerramienta])

  const cambiarVisible = (nombre: string, visible: boolean) =>
    setVisibles((actual) => {
      const siguiente = new Set(actual)
      if (visible) siguiente.add(nombre)
      else siguiente.delete(nombre)
      return siguiente
    })

  const alGuardar = (capa: string) => {
    refrescarCapa(capa)
    cambiarVisible(capa, true)
    dibujo.descartar()
  }

  const panelLateral = (
    <PanelLateral
      estado={estado}
      visibles={visibles}
      opacidades={opacidades}
      onVisible={cambiarVisible}
      onOpacidad={(nombre, opacidad) => setOpacidades((actual) => ({ ...actual, [nombre]: opacidad }))}
      onApagarTodas={() => setVisibles(new Set())}
      wmsUrl={geoserver.wmsUrl}
      consolaUrl={`${geoserver.url}/web/`}
    />
  )

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
    ) : herramienta !== "navegar" || consulta.consulta ? (
      <ResultadosConsulta
        consulta={consulta.consulta}
        tipo={herramienta === "rectangulo" ? "rectangulo" : "punto"}
        seleccion={consulta.seleccion}
        onSeleccionar={consulta.seleccionar}
        onLimpiar={consulta.limpiar}
      />
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
        <aside aria-label="Capas y leyenda" className="hidden w-80 shrink-0 flex-col border-r bg-background md:flex">
          {panelLateral}
        </aside>
        <div className="relative min-h-[60dvh] flex-1 overflow-hidden md:min-h-0">
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
                  <SheetTitle>Capas y leyenda</SheetTitle>
                </SheetHeader>
                {panelLateral}
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
      </div>
    </AdminLayout>
  )
}

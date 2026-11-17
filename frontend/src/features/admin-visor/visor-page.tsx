import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import type OlMap from "ol/Map"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useDjangoMessages } from "@/lib/use-django-messages"
import { BarraHerramientas, type Herramienta } from "./barra-herramientas"
import { leerCapas } from "./capas"
import { Mapa } from "./mapa"
import { PanelCapas, type EstadoCapas } from "./panel-capas"
import { PanelResultados } from "./panel-resultados"
import type { VisorData } from "./types"
import { useConsulta } from "./use-consulta"
import { useMedicion } from "./use-medicion"

export function VisorPage({ data }: { data: VisorData }) {
  useDjangoMessages(data.messages)
  const { wmsUrl, wfsUrl, url: geoserverUrl, workspace } = data.geoserver
  const [estado, setEstado] = useState<EstadoCapas>({ tipo: "cargando" })
  const [visibles, setVisibles] = useState<Set<string>>(() => new Set())
  const [mapa, setMapa] = useState<OlMap | null>(null)
  const [herramienta, setHerramienta] = useState<Herramienta>("navegar")
  const oscuro = useTheme().resolvedTheme === "dark"
  const medicion = useMedicion(mapa, herramienta === "medir", oscuro)
  // Se consultan las capas encendidas, en el orden del panel.
  const encendidas = useMemo(
    () => (estado.tipo === "listo" ? estado.capas.filter((capa) => visibles.has(capa.nombre)) : []),
    [estado, visibles],
  )
  const consulta = useConsulta({
    mapa,
    modo: herramienta === "punto" || herramienta === "rectangulo" ? herramienta : null,
    capas: encendidas,
    wmsUrl,
    wfsUrl,
    oscuro,
  })

  useEffect(() => {
    const control = new AbortController()
    leerCapas(wmsUrl, control.signal)
      .then((capas) => setEstado({ tipo: "listo", capas }))
      .catch(() => {
        if (!control.signal.aborted) setEstado({ tipo: "error" })
      })
    return () => control.abort()
  }, [wmsUrl])

  const cambiar = (nombre: string, visible: boolean) =>
    setVisibles((actual) => {
      const siguiente = new Set(actual)
      if (visible) siguiente.add(nombre)
      else siguiente.delete(nombre)
      return siguiente
    })

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
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          aria-label="Capas y leyenda"
          className="order-2 max-h-[40dvh] shrink-0 overflow-y-auto border-t bg-background md:order-1 md:max-h-none md:w-72 md:border-t-0 md:border-r"
        >
          <h2 className="px-4 pt-4 pb-2 text-sm font-medium">Capas · {workspace}</h2>
          <PanelCapas
            estado={estado}
            visibles={visibles}
            onCambiar={cambiar}
            wmsUrl={wmsUrl}
            consolaUrl={`${geoserverUrl}/web/`}
          />
        </aside>
        <div className="relative order-1 min-h-[50dvh] flex-1 md:order-2 md:min-h-0">
          <Mapa
            wmsUrl={wmsUrl}
            extension={data.extension}
            capas={estado.tipo === "listo" ? estado.capas : []}
            visibles={visibles}
            onMapa={setMapa}
          />
          <BarraHerramientas
            herramienta={herramienta}
            onCambiar={setHerramienta}
            mediciones={medicion.cantidad}
            onBorrarMediciones={medicion.borrar}
          />
          <PanelResultados
            consulta={consulta.consulta}
            seleccionado={consulta.seleccionado}
            onSeleccionar={consulta.seleccionar}
            onCerrar={consulta.cerrar}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

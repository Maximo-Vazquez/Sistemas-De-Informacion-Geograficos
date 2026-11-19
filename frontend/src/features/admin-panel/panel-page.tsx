import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ChartCard, MetricCard, MetricGrid } from "@/components/dashboard/dashboard"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { PanelEmpty } from "@/components/dashboard/panel"
import { formatNumber } from "@/lib/format"
import { useDjangoMessages } from "@/lib/use-django-messages"
import { TablaLocalidades, TablaPuentes } from "./tablas-rn11"
import type { AnalisisRn11, PanelData, PanelGrafico } from "./types"

const SIN_DATOS = "Se completa al correr el análisis en QGIS: scripts/analisis_rn11_qgis.py"

function valorIndicador(id: string, valor: number | null) {
  if (valor === null) return "—"
  return id === "km" ? `${formatNumber(valor)} km` : formatNumber(valor)
}

function Poblacion({ analisis }: { analisis: AnalisisRn11 }) {
  const { resumen } = analisis
  return (
    <div className="flex flex-col gap-4">
      <DonutChart
        ariaLabel="población afectada por categoría"
        centerLabel="habitantes"
        formatValue={formatNumber}
        items={[
          { key: "cerca", label: "Hasta 10 km", value: resumen.poblacion_0_10, color: "var(--chart-1)" },
          { key: "lejos", label: "De 10 a 20 km", value: resumen.poblacion_10_20, color: "var(--chart-4)" },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Solo cuenta la población del Chaco. Las localidades de otras provincias dentro de los 20 km
        (entre ellas, la ciudad de Corrientes) suman {formatNumber(resumen.poblacion_fuera_del_chaco)}{" "}
        habitantes y se informan aparte. {resumen.localidades_con_dato} de las{" "}
        {resumen.localidades_0_10 + resumen.localidades_10_20} localidades tienen dato de población.
      </p>
    </div>
  )
}

function contenido(panel: PanelGrafico, analisis: AnalisisRn11) {
  if (panel.id === "poblacion") return <Poblacion analisis={analisis} />
  if (panel.id === "puentes") return <TablaPuentes puentes={analisis.puentes} />
  return <TablaLocalidades localidades={analisis.localidades} />
}

export function PanelPage({ data }: { data: PanelData }) {
  useDjangoMessages(data.messages)
  const { analisis } = data
  return (
    <AdminLayout
      title="Panel"
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
      <AdminPageHeader
        title="Panel"
        description="Resultados del análisis de la RN 11 en el Chaco para las obras de mantenimiento."
      />
      <MetricGrid>
        {data.indicadores.map((indicador) => (
          <MetricCard
            key={indicador.id}
            label={indicador.label}
            value={valorIndicador(indicador.id, indicador.valor)}
            hint={indicador.hint}
          />
        ))}
      </MetricGrid>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.paneles.map((panel) => (
          <ChartCard
            key={panel.id}
            title={panel.titulo}
            description={panel.descripcion}
            className={panel.id === "localidades" ? "lg:col-span-2" : undefined}
          >
            {analisis ? contenido(panel, analisis) : <PanelEmpty title="Todavía sin datos" description={SIN_DATOS} />}
          </ChartCard>
        ))}
      </div>
    </AdminLayout>
  )
}

import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ChartCard, MetricCard, MetricGrid } from "@/components/dashboard/dashboard"
import { PanelEmpty } from "@/components/dashboard/panel"
import { formatNumber } from "@/lib/format"
import { useDjangoMessages } from "@/lib/use-django-messages"
import type { PanelData } from "./types"

const SIN_DATOS = "Se completa cuando las capas del IGN estén cargadas en PostGIS."

export function PanelPage({ data }: { data: PanelData }) {
  useDjangoMessages(data.messages)
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
        description="Resultados del análisis de la RN 11 y estado de las capas publicadas."
      />
      <MetricGrid>
        {data.indicadores.map((indicador) => (
          <MetricCard
            key={indicador.id}
            label={indicador.label}
            value={indicador.valor === null ? "—" : formatNumber(indicador.valor)}
            hint={indicador.hint}
          />
        ))}
      </MetricGrid>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.paneles.map((panel) => (
          <ChartCard key={panel.id} title={panel.titulo} description={panel.descripcion}>
            <PanelEmpty title="Todavía sin datos" description={SIN_DATOS} />
          </ChartCard>
        ))}
      </div>
    </AdminLayout>
  )
}

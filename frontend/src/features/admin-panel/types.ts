import type { AdminPageData } from "@/components/admin/types"

export type Indicador = { id: string; label: string; hint: string; valor: number | null }

export type PanelGrafico = { id: string; titulo: string; descripcion: string }

export type PanelData = AdminPageData & {
  indicadores: Indicador[]
  paneles: PanelGrafico[]
}

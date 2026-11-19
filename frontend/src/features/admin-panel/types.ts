import type { AdminPageData } from "@/components/admin/types"

export type Indicador = { id: string; label: string; hint: string; valor: number | null }

export type PanelGrafico = { id: string; titulo: string; descripcion: string }

export type Categoria = "0 a 10 km" | "10 a 20 km"

// Filas del esquema `analisis` de PostGIS (scripts/analisis_rn11.sql).
export type LocalidadAfectada = {
  nombre: string
  tipo: string
  departamento: string | null
  habitantes: number
  con_dato: boolean
  distancia_km: number
  categoria: Categoria
}

export type PuenteRn11 = {
  numero: number
  km_traza: number
  curso_de_agua: string | null
  regimen: string | null
  localidad_cercana: string | null
}

export type ResumenRn11 = {
  km_traza: number
  poblacion_0_10: number
  poblacion_10_20: number
  localidades_0_10: number
  localidades_10_20: number
  localidades_con_dato: number
  poblacion_fuera_del_chaco: number
  puentes: number
  cruces_con_cursos_de_agua: number
}

export type AnalisisRn11 = {
  resumen: ResumenRn11
  localidades: LocalidadAfectada[]
  puentes: PuenteRn11[]
}

export type PanelData = AdminPageData & {
  indicadores: Indicador[]
  paneles: PanelGrafico[]
  analisis: AnalisisRn11 | null
}

import type { StatusTone } from "@/components/admin/visual"

export type EstadoConsigna = "pendiente" | "en-curso" | "completa"

export type Consigna = { id: string; titulo: string; estado: EstadoConsigna }

export type InicioData = {
  brandName: string
  logoUrl: string
  homeUrl: string
  csrf: string
  loginUrl: string
  logoutUrl: string
  adminUrl: string
  usuario: { nombre: string; email: string } | null
  consignas: Consigna[]
}

// La feature decide el significado; StatusIndicator decide el color.
export const ESTADO_CONSIGNA: Record<EstadoConsigna, { tone: StatusTone; label: string }> = {
  pendiente: { tone: "neutral", label: "Pendiente" },
  "en-curso": { tone: "pending", label: "En curso" },
  completa: { tone: "ok", label: "Completa" },
}

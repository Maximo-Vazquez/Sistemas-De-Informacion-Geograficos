import type { ReactNode } from "react"
import { CircleCheck, CircleDashed, CircleMinus, CircleX, Clock3, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Significado de un estado. El color lo pone el ícono; el texto queda neutro y siempre explícito.
export type StatusTone = "ok" | "pending" | "warning" | "error" | "neutral" | "info"

const TONE = {
  ok: { icon: CircleCheck, className: "text-success" },
  pending: { icon: Clock3, className: "text-warning-text" },
  warning: { icon: CircleDashed, className: "text-warning-text" },
  error: { icon: CircleX, className: "text-destructive" },
  neutral: { icon: CircleMinus, className: "text-muted-foreground" },
  info: { icon: Info, className: "text-primary" },
} satisfies Record<StatusTone, { icon: typeof CircleCheck; className: string }>

// Estado de un registro en tablas, tarjetas y detalle ("✓ Activo", "⏱ Pendiente").
// Reemplaza a las pastillas grises indistinguibles; usar Badge solo para datos secundarios.
export function StatusIndicator({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: ReactNode
  className?: string
}) {
  const { icon: Icon, className: color } = TONE[tone]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm whitespace-nowrap", className)}>
      <Icon aria-hidden="true" className={cn("size-4 shrink-0", color)} />
      <span>{children}</span>
    </span>
  )
}

// Recuadro de ícono que identifica una tarjeta o sección. `brand` para lo principal de la vista;
// `neutral` para el resto (no pintar cada tarjeta de un color distinto).
export function IconTile({
  children,
  tone = "brand",
  size = "md",
}: {
  children: ReactNode
  tone?: "brand" | "neutral"
  size?: "sm" | "md"
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
        size === "sm" ? "size-8 [&>svg]:size-4" : "size-10 [&>svg]:size-5",
        tone === "brand"
          ? "bg-primary/10 text-primary ring-primary/15"
          : "bg-muted text-muted-foreground ring-border",
      )}
    >
      {children}
    </span>
  )
}

// Encabezado de tarjeta con ícono: título y descripción neutros al lado del recuadro.
export function TileHeading({
  icon,
  tone,
  title,
  description,
  aside,
}: {
  icon: ReactNode
  tone?: "brand" | "neutral"
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <IconTile tone={tone}>{icon}</IconTile>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="leading-snug font-medium">{title}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      </div>
      {aside}
    </div>
  )
}

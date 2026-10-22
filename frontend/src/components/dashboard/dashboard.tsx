import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

// Cifra clave de un panel de datos. `hint` explica el alcance ("Últimos 30 días").
export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 [&_svg]:size-4">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums group-data-[size=sm]/card:text-2xl">
          {value}
        </CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
}

// Fila de cifras clave: 2 columnas en móvil, hasta 4 en escritorio.
export function MetricGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>
}

// Contenedor de gráfico o tabla de un panel, con título y descripción.
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export type PeriodOption = { value: string; label: string }

// Período del panel por GET (el servidor recalcula). Se ubica en las acciones del encabezado.
export function PeriodFilter({
  options,
  value,
  onChange,
  label = "Período",
}: {
  options: PeriodOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  return (
    // flex-wrap: con muchos períodos (años) los botones bajan de línea en móvil en vez de desbordar.
    <ToggleGroup
      aria-label={label}
      variant="outline"
      className="flex-wrap"
      value={[value]}
      onValueChange={(next) => next[0] && next[0] !== value && onChange(next[0])}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

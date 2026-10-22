import { useState, type ReactNode } from "react"
import { getCoreRowModel, useReactTable, type ColumnDef, type Row } from "@tanstack/react-table"
import { CalendarRange, ChartNoAxesColumn } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatPeriod } from "@/lib/format"
import { PeriodFilter } from "./dashboard"

// Período de un panel. El servidor lo resuelve y manda los presets con sus fechas.
export type PanelPeriod = {
  desde: string
  hasta: string
  // Valor del preset que coincide con el período ("" si es personalizado).
  preset: string
  presets: { value: string; label: string; desde: string; hasta: string }[]
}

// Presets + rango propio por GET. `params` conserva otros parámetros de la vista.
// `names` permite otro contrato que `desde`/`hasta`.
export function PeriodRange({
  period,
  url,
  params = {},
  names = ["desde", "hasta"],
}: {
  period: PanelPeriod
  url: string
  params?: Record<string, string>
  names?: [string, string]
}) {
  const [open, setOpen] = useState(false)
  const go = (desde: string, hasta: string) =>
    window.location.assign(
      `${url}?${new URLSearchParams({ ...params, [names[0]]: desde, [names[1]]: hasta })}`,
    )
  return (
    <>
      <PeriodFilter
        options={period.presets}
        value={period.preset}
        onChange={(value) => {
          const preset = period.presets.find((option) => option.value === value)
          if (preset) go(preset.desde, preset.hasta)
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant={period.preset ? "outline" : "secondary"}>
              <CalendarRange data-icon="inline-start" />
              {period.preset ? "Personalizado" : formatPeriod(period)}
            </Button>
          }
        />
        <PopoverContent align="end" className="w-72">
          <form method="get" action={url}>
            {Object.entries(params).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="periodo-desde">Desde</FieldLabel>
                <Input
                  id="periodo-desde"
                  type="date"
                  name={names[0]}
                  defaultValue={period.desde}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="periodo-hasta">Hasta</FieldLabel>
                <Input
                  id="periodo-hasta"
                  type="date"
                  name={names[1]}
                  defaultValue={period.hasta}
                  required
                />
              </Field>
              <Button type="submit">Aplicar período</Button>
            </FieldGroup>
          </form>
        </PopoverContent>
      </Popover>
    </>
  )
}

export type PanelView = { id: string; label: string; href: string }

// Navegación entre vistas de un mismo panel; los `href` ya conservan el período.
export function PanelViewNav({
  label,
  views,
  current,
}: {
  label: string
  views: PanelView[]
  current: string
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1 border-b pb-2">
      {views.map((view) => (
        <Button
          key={view.id}
          size="sm"
          variant={view.id === current ? "secondary" : "ghost"}
          aria-current={view.id === current ? "page" : undefined}
          render={<a href={view.href} />}
        >
          {view.label}
        </Button>
      ))}
    </nav>
  )
}

// Período sin datos: explica qué se consultó y qué hacer.
export function PanelEmpty({
  period,
  title = "Sin datos en este período",
  description,
}: {
  period?: { desde: string; hasta: string }
  title?: string
  description?: ReactNode
}) {
  return (
    <Empty className="border py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartNoAxesColumn />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description ??
            (period
              ? `No hay registros entre ${formatPeriod(period)}. Probá con otro período.`
              : "Probá con otro período.")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// Tabla de un panel con filas completas desde el servidor (sin filtros ni paginación).
export function DetailTable<T>({
  data,
  columns,
  renderCard,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  renderCard: (row: Row<T>) => ReactNode
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  return <DataTable table={table} pagination={null} renderCard={renderCard} />
}

// Encabezado o celda numérica alineada a la derecha.
export const numeric = (content: ReactNode) => (
  <div className="text-right tabular-nums">{content}</div>
)

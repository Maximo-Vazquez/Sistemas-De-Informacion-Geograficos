import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// Rangos de fechas y números de las tablas (reexportados por data-table-filters).
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const shift = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return iso(date)
}
export type DatePreset = { label: string; from: string; to: string }
// Atajos relativos a hoy: "past" para registros/accesos, "future" para vencimientos.
export function datePresets(direction: "past" | "future"): DatePreset[] {
  const today = new Date()
  const monthStart = iso(new Date(today.getFullYear(), today.getMonth(), 1))
  const monthEnd = iso(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  return direction === "past"
    ? [
        { label: "Últimos 7 días", from: shift(-7), to: iso(today) },
        { label: "Últimos 30 días", from: shift(-30), to: iso(today) },
        { label: "Últimos 90 días", from: shift(-90), to: iso(today) },
        { label: "Este mes", from: monthStart, to: monthEnd },
      ]
    : [
        { label: "Próximos 7 días", from: iso(today), to: shift(7) },
        { label: "Próximos 30 días", from: iso(today), to: shift(30) },
        { label: "Próximos 90 días", from: iso(today), to: shift(90) },
        { label: "Este mes", from: monthStart, to: monthEnd },
      ]
}

export function DataTableDateRange({
  from,
  to,
  onChange,
  presets,
}: {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  presets: DatePreset[]
}) {
  const id = useId()
  const invalid = !!from && !!to && from > to
  return (
    <FieldGroup className="gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.from === from && preset.to === to
          return (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant={active ? "secondary" : "outline"}
              aria-pressed={active}
              onClick={() => onChange(preset.from, preset.to)}
            >
              {preset.label}
            </Button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel htmlFor={`${id}-from`}>Desde</FieldLabel>
          <Input
            id={`${id}-from`}
            type="date"
            value={from}
            onChange={(event) => onChange(event.target.value, to)}
          />
        </Field>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={`${id}-to`}>Hasta</FieldLabel>
          <Input
            id={`${id}-to`}
            type="date"
            value={to}
            min={from || undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) => onChange(from, event.target.value)}
          />
        </Field>
      </div>
      {invalid && <FieldError>La fecha final debe ser posterior a la inicial.</FieldError>}
    </FieldGroup>
  )
}

export function DataTableNumberRange({
  min,
  max,
  onChange,
}: {
  min: string
  max: string
  onChange: (min: string, max: string) => void
}) {
  const id = useId()
  const invalid = min !== "" && max !== "" && Number(min) > Number(max)
  return (
    <FieldGroup className="gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel htmlFor={`${id}-min`}>Mínimo</FieldLabel>
          <Input
            id={`${id}-min`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={min}
            onChange={(event) => onChange(event.target.value, max)}
          />
        </Field>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={`${id}-max`}>Máximo</FieldLabel>
          <Input
            id={`${id}-max`}
            type="number"
            inputMode="numeric"
            min={min || "0"}
            step="1"
            value={max}
            aria-invalid={invalid || undefined}
            onChange={(event) => onChange(min, event.target.value)}
          />
        </Field>
      </div>
      {invalid && <FieldError>El mínimo no puede superar al máximo.</FieldError>}
    </FieldGroup>
  )
}

// Texto de chips y resúmenes para rangos.
export function rangeLabel(from: string, to: string, format: (value: string) => string) {
  if (from && to) return `${format(from)} – ${format(to)}`
  return from ? `desde ${format(from)}` : `hasta ${format(to)}`
}
export const isoDateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("es-AR")

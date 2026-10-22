import { useId, useState } from "react"
import { ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type FacetOption = { value: string; label: string; count?: number }

// Lista de opciones con conteos. `single` se usa cuando el servidor acepta un solo valor.
export function DataTableOptionList({
  options,
  value,
  onChange,
  single = false,
}: {
  options: FacetOption[]
  value: string[]
  onChange: (value: string[]) => void
  single?: boolean
}) {
  const id = useId()
  const [query, setQuery] = useState("")
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  )
  return (
    <FieldGroup className="gap-2">
      {options.length > 8 && (
        <Input
          type="search"
          aria-label="Buscar opciones"
          placeholder="Buscar opción…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}
      {visible.map((option) => (
        <Field key={option.value} orientation="horizontal">
          <Checkbox
            id={`${id}-${option.value}`}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(
                single
                  ? checked
                    ? [option.value]
                    : []
                  : checked
                    ? [...value, option.value]
                    : value.filter((v) => v !== option.value),
              )
            }
          />
          <FieldLabel htmlFor={`${id}-${option.value}`} className="flex-1 font-normal">
            {option.label}
          </FieldLabel>
          {option.count !== undefined && (
            <span className="text-xs text-muted-foreground tabular-nums">{option.count}</span>
          )}
        </Field>
      ))}
      {!visible.length && <p className="text-sm text-muted-foreground">Sin coincidencias.</p>}
    </FieldGroup>
  )
}

// Filtro rápido de la barra: marca varias opciones y aplica al cerrar el popover.
export function DataTableFacetedFilter({
  title,
  options,
  value,
  onChange,
  onClose,
}: {
  title: string
  options: FacetOption[]
  value: string[]
  onChange: (value: string[]) => void
  onClose?: () => void
}) {
  return (
    <Popover onOpenChange={(open) => !open && onClose?.()}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant={value.length ? "secondary" : "outline"}
            className={cn(!value.length && "border-dashed")}
          />
        }
      >
        <ListFilter data-icon="inline-start" />
        {title}
        {value.length > 0 && <Badge>{value.length}</Badge>}
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle>{title}</PopoverTitle>
        <DataTableOptionList options={options} value={value} onChange={onChange} />
        {value.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Limpiar selección
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

export * from "./data-table-range-filters"

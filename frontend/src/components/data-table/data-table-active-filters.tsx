import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ActiveFilter = { id: string; label: string; onRemove: () => void }

// Chips de filtros aplicados: cada uno se quita solo; "Limpiar todo" vuelve a la URL base.
export function DataTableActiveFilters({
  filters,
  clearUrl,
}: {
  filters: ActiveFilter[]
  clearUrl: string
}) {
  if (!filters.length) return null
  return (
    <div
      role="group"
      aria-label="Filtros aplicados"
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
    >
      {filters.map((filter) => (
        <Button
          key={filter.id}
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-full"
          aria-label={`Quitar filtro ${filter.label}`}
          onClick={filter.onRemove}
        >
          {filter.label}
          <X data-icon="inline-end" />
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => window.location.assign(clearUrl)}
      >
        Limpiar todo
      </Button>
    </div>
  )
}

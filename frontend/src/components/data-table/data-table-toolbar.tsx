import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Orden fijo: búsqueda, filtros rápidos, botón de filtros | acciones de tabla.
// En móvil los filtros rápidos y las acciones se ocultan: el panel de filtros los reúne.
export function DataTableToolbar({
  search,
  onSearchChange,
  onSearch,
  searchLabel,
  placeholder = "Buscá…",
  quickFilters,
  filterButton,
  actions,
}: {
  search: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  searchLabel: string
  placeholder?: string
  quickFilters?: ReactNode
  filterButton?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
        <form
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2 md:flex-none"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch()
          }}
        >
          <Input
            className="min-w-0 flex-1 md:w-72 md:flex-none"
            type="search"
            aria-label={searchLabel}
            placeholder={placeholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button type="submit" variant="outline">
            <Search data-icon="inline-start" />
            <span className="sr-only md:not-sr-only">Buscar</span>
          </Button>
        </form>
        {quickFilters && <div className="hidden items-center gap-2 md:flex">{quickFilters}</div>}
        {filterButton}
      </div>
      {actions && <div className="hidden flex-wrap items-center gap-2 md:flex">{actions}</div>}
    </div>
  )
}

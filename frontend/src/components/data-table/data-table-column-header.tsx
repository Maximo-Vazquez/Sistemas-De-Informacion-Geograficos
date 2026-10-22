import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DataTableColumnHeader({
  title,
  active,
  descending,
  onSort,
}: {
  title: string
  active: boolean
  descending: boolean
  onSort: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSort}
      aria-label={`Ordenar por ${title}${active ? (descending ? ", orden descendente" : ", orden ascendente") : ""}`}
    >
      {title}
      {active ? (
        descending ? (
          <ArrowDown data-icon="inline-end" />
        ) : (
          <ArrowUp data-icon="inline-end" />
        )
      ) : (
        <ArrowUpDown data-icon="inline-end" />
      )}
    </Button>
  )
}

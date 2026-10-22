import { Fragment } from "react"
import { Button } from "@/components/ui/button"

export type SummaryItem = {
  label: string
  value: number
  // Si existe, la cifra aplica el filtro equivalente.
  onSelect?: () => void
  active?: boolean
}

// Resumen opcional de una línea sobre el resultado filtrado completo (no solo la página).
export function DataTableSummary({ items }: { items: SummaryItem[] }) {
  return (
    <div
      role="group"
      aria-label="Resumen de resultados"
      className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground"
    >
      {items.map((item, index) => {
        const text = (
          <>
            <span className="font-medium text-foreground tabular-nums">
              {item.value.toLocaleString("es-AR")}
            </span>{" "}
            {item.label}
          </>
        )
        return (
          <Fragment key={item.label}>
            {index > 0 && <span aria-hidden>·</span>}
            {item.onSelect ? (
              <Button
                type="button"
                variant={item.active ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 font-normal text-muted-foreground"
                aria-pressed={item.active}
                onClick={item.onSelect}
              >
                {text}
              </Button>
            ) : (
              <span className="px-2">{text}</span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

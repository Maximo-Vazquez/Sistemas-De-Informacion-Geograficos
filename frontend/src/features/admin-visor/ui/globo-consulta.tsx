import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { atributosDestacados, nombreElemento } from "../catalogo"
import type { CapaWms, ElementoConsultado } from "../types"

export type ElementoConCapa = ElementoConsultado & { capaWms: CapaWms }

// Globo junto al clic: nombre, capa y los datos clave del elemento. Si el clic tocó varios
// elementos (de la misma o de otras capas), se recorren con las flechas.
export function GloboConsulta({ elementos, actual, onCambiar, onVerTodo, onCerrar }: {
  elementos: ElementoConCapa[]
  actual: number
  onCambiar: (indice: number) => void
  onVerTodo: () => void
  onCerrar: () => void
}) {
  const elemento = elementos[actual]
  if (!elemento) return null
  const propiedades = elemento.feature.getProperties()
  const datos = atributosDestacados(elemento.capa, propiedades)
  return (
    <div
      role="dialog"
      aria-label={`Detalle de ${nombreElemento(propiedades, elemento.id)}`}
      className="relative w-72 rounded-xl border bg-background text-foreground shadow-xl after:absolute after:-bottom-2 after:left-1/2 after:size-4 after:-translate-x-1/2 after:rotate-45 after:border-r after:border-b after:bg-background"
    >
      <header className="flex items-start gap-2 p-3 pb-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-xs font-medium text-primary">{elemento.capaWms.titulo}</span>
          <h3 className="truncate text-sm font-semibold">{nombreElemento(propiedades, elemento.id)}</h3>
        </div>
        <Button variant="ghost" size="icon-xs" aria-label="Cerrar" onClick={onCerrar}>
          <X />
        </Button>
      </header>
      {datos.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 pb-3 text-xs">
          {datos.map((dato) => (
            <div key={dato.clave} className="contents">
              <dt className="text-muted-foreground">{dato.etiqueta}</dt>
              <dd className="min-w-0 truncate font-medium" title={dato.valor}>
                {dato.valor}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <footer className="flex items-center gap-1 border-t px-2 py-1.5">
        {elementos.length > 1 && (
          <>
            <Button variant="ghost" size="icon-xs" aria-label="Elemento anterior" disabled={actual === 0} onClick={() => onCambiar(actual - 1)}>
              <ChevronLeft />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {actual + 1} de {elementos.length}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Elemento siguiente"
              disabled={actual === elementos.length - 1}
              onClick={() => onCambiar(actual + 1)}
            >
              <ChevronRight />
            </Button>
          </>
        )}
        <Button variant="link" size="xs" className="ml-auto px-1" onClick={onVerTodo}>
          Ver todos los datos
        </Button>
      </footer>
    </div>
  )
}

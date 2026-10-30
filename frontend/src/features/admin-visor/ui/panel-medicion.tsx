import { Ruler, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { formatearDistancia, type Medicion } from "../herramientas/use-medicion"
import { PanelFlotante } from "./panel-flotante"

export function PanelMedicion({ mediciones, enCurso, onEliminar, onLimpiar }: {
  mediciones: Medicion[]
  enCurso: number | null
  onEliminar: (id: string) => void
  onLimpiar: () => void
}) {
  const total = mediciones.reduce((suma, medicion) => suma + medicion.metros, 0)
  return (
    <PanelFlotante
      icono={<Ruler />}
      titulo="Medir distancia"
      descripcion={
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          Clic en cada punto, doble clic para terminar. <Kbd>Retroceso</Kbd> borra el último punto y <Kbd>Esc</Kbd> sale.
        </span>
      }
      acciones={
        mediciones.length > 0 && (
          <Button variant="outline" size="sm" onClick={onLimpiar}>
            Borrar mediciones
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-3 p-3">
        <div className="rounded-lg bg-muted px-3 py-2.5">
          <div className="text-xs text-muted-foreground">{enCurso !== null ? "Midiendo…" : "Última medición"}</div>
          <div className="text-2xl font-semibold tabular-nums">
            {enCurso !== null
              ? formatearDistancia(enCurso)
              : mediciones.length > 0
                ? formatearDistancia(mediciones[mediciones.length - 1].metros)
                : "—"}
          </div>
        </div>
        {mediciones.length > 0 && (
          <>
            <ul className="flex flex-col divide-y rounded-lg border">
              {mediciones.map((medicion, indice) => (
                <li key={medicion.id} className="flex items-center justify-between gap-2 py-1 pr-1 pl-3 text-sm">
                  <span className="text-muted-foreground">Medición {indice + 1}</span>
                  <span className="ml-auto font-medium tabular-nums">{formatearDistancia(medicion.metros)}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Borrar medición ${indice + 1}`}
                    onClick={() => onEliminar(medicion.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            {mediciones.length > 1 && (
              <div className="flex justify-between px-1 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">{formatearDistancia(total)}</span>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-muted-foreground">Distancia geodésica sobre el elipsoide WGS84.</p>
      </div>
    </PanelFlotante>
  )
}

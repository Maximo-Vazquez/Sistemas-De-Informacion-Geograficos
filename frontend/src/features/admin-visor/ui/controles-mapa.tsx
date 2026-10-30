import type OlMap from "ol/Map"
import { House, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/format"
import { formatearDistancia } from "../herramientas/use-medicion"
import type { EstadoMapa } from "../mapa/use-estado-mapa"

function BotonMapa({ etiqueta, onClick, children }: { etiqueta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={etiqueta} onClick={onClick} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="left">{etiqueta}</TooltipContent>
    </Tooltip>
  )
}

export function ControlesZoom({ mapa, onInicio }: { mapa: OlMap | null; onInicio: () => void }) {
  const zoom = (delta: number) => {
    const vista = mapa?.getView()
    const actual = vista?.getZoom()
    if (vista && actual !== undefined) vista.animate({ zoom: actual + delta, duration: 250 })
  }
  return (
    <div className="flex flex-col rounded-xl border bg-background/95 p-1 shadow-lg backdrop-blur-md">
      <BotonMapa etiqueta="Acercar" onClick={() => zoom(1)}>
        <Plus />
      </BotonMapa>
      <BotonMapa etiqueta="Alejar" onClick={() => zoom(-1)}>
        <Minus />
      </BotonMapa>
      <BotonMapa etiqueta="Ver todo el Chaco" onClick={onInicio}>
        <House />
      </BotonMapa>
    </div>
  )
}

function formatearCoordenada(valor: number, positivo: string, negativo: string) {
  return `${Math.abs(valor).toLocaleString("es-AR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}° ${valor >= 0 ? positivo : negativo}`
}

// Escala gráfica y numérica, coordenadas del puntero y fuente de los datos.
export function BarraEstado({ estado }: { estado: EstadoMapa }) {
  const { barra, denominador, puntero } = estado
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-md backdrop-blur-md">
      <div className="flex items-center gap-2" aria-label="Escala">
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-medium text-foreground tabular-nums">{formatearDistancia(barra.metros)}</span>
          <span
            aria-hidden="true"
            className="h-1.5 border-x-2 border-b-2 border-foreground/70"
            style={{ width: barra.pixeles }}
          />
        </div>
        <span className="tabular-nums">1 : {formatNumber(Math.round(denominador))}</span>
      </div>
      <span className="hidden min-w-44 tabular-nums sm:inline" aria-live="off">
        {puntero
          ? `${formatearCoordenada(puntero[1], "N", "S")} · ${formatearCoordenada(puntero[0], "E", "O")}`
          : "Mové el puntero sobre el mapa"}
      </span>
      <span className="hidden lg:inline">EPSG:3857 · Datos: IGN, SIG 250</span>
    </div>
  )
}

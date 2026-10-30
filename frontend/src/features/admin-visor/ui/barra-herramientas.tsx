import { Hand, MapPinPlus, MousePointerClick, Ruler, SquareDashedMousePointer, type LucideIcon } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Herramienta } from "../types"

export const HERRAMIENTAS: { id: Herramienta; etiqueta: string; ayuda: string; icono: LucideIcon; tecla: string }[] = [
  { id: "navegar", etiqueta: "Navegar", ayuda: "Arrastrá para mover y usá la rueda para el zoom", icono: Hand, tecla: "V" },
  { id: "punto", etiqueta: "Consultar punto", ayuda: "Clic sobre el mapa para ver los atributos", icono: MousePointerClick, tecla: "I" },
  { id: "rectangulo", etiqueta: "Consultar área", ayuda: "Arrastrá un rectángulo para listar elementos", icono: SquareDashedMousePointer, tecla: "R" },
  { id: "medir", etiqueta: "Medir distancia", ayuda: "Clic en cada punto, doble clic para terminar", icono: Ruler, tecla: "M" },
  { id: "agregar", etiqueta: "Agregar elemento", ayuda: "Dibujá un elemento nuevo y cargá sus datos", icono: MapPinPlus, tecla: "A" },
]

export const TECLAS: Record<string, Herramienta> = Object.fromEntries(
  HERRAMIENTAS.map((herramienta) => [herramienta.tecla.toLowerCase(), herramienta.id]),
)

// Una sola herramienta activa a la vez; cada una tiene atajo de teclado (Esc vuelve a Navegar).
export function BarraHerramientas({
  herramienta,
  onCambiar,
}: {
  herramienta: Herramienta
  onCambiar: (herramienta: Herramienta) => void
}) {
  return (
    <div className="rounded-xl border bg-background/95 p-1 shadow-lg backdrop-blur-md">
      <ToggleGroup
        aria-label="Herramientas del mapa"
        orientation="vertical"
        spacing={1}
        value={[herramienta]}
        onValueChange={(valor) => valor[0] && onCambiar(valor[0] as Herramienta)}
      >
        {HERRAMIENTAS.map(({ id, etiqueta, ayuda, icono: Icono, tecla }) => (
          <Tooltip key={id}>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={id}
                  aria-label={etiqueta}
                  className="size-10 data-pressed:bg-primary data-pressed:text-primary-foreground"
                />
              }
            >
              <Icono className="size-5" />
            </TooltipTrigger>
            <TooltipContent side="right" className="flex max-w-56 flex-col items-start gap-1 py-2">
              <span className="flex items-center gap-2 font-medium">
                {etiqueta} <Kbd>{tecla}</Kbd>
              </span>
              <span className="text-xs opacity-80">{ayuda}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  )
}

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, Eye, EyeOff, GripVertical, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { urlLeyenda } from "../ogc"
import type { CapaWms } from "../types"

// Una capa en el mapa: arrastrar para cambiar el orden de dibujo, ojo para ocultarla sin
// quitarla, y desplegable con su leyenda (clases del estilo) y la opacidad.
export function FilaCapa({ capa, oculta, opacidad, wmsUrl, onVisible, onOpacidad, onQuitar }: {
  capa: CapaWms
  oculta: boolean
  opacidad: number
  wmsUrl: string
  onVisible: () => void
  onOpacidad: (opacidad: number) => void
  onQuitar: () => void
}) {
  const [abierta, setAbierta] = useState(true)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: capa.nombre,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/capa relative rounded-lg border bg-background",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/40",
        oculta && "bg-muted/40",
      )}
    >
      <div className="flex items-center gap-1 py-1 pr-1 pl-0.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Mover ${capa.titulo}`}
          className="flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          aria-expanded={abierta}
          onClick={() => setAbierta(!abierta)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded py-1 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", abierta && "rotate-90")} />
          <span className={cn("truncate", oculta && "text-muted-foreground")}>{capa.titulo}</span>
          {capa.editable && <Badge variant="success">Editable</Badge>}
        </button>
        <Button variant="ghost" size="icon-xs" aria-label={oculta ? `Mostrar ${capa.titulo}` : `Ocultar ${capa.titulo}`} aria-pressed={!oculta} onClick={onVisible}>
          {oculta ? <EyeOff /> : <Eye />}
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label={`Quitar ${capa.titulo} del mapa`} onClick={onQuitar}>
          <X />
        </Button>
      </div>
      {abierta && (
        <div className="flex flex-col gap-2 px-3 pb-3 pl-8">
          {/* Fondo claro fijo: GeoServer dibuja la leyenda con texto oscuro. */}
          <img
            src={urlLeyenda(wmsUrl, capa.nombre)}
            alt={`Simbología de ${capa.titulo}`}
            loading="lazy"
            className={cn("max-w-full self-start rounded-md bg-white p-1 ring-1 ring-border", oculta && "opacity-50")}
          />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Opacidad</span>
            <Slider
              aria-label={`Opacidad de ${capa.titulo}`}
              className="flex-1"
              min={10}
              max={100}
              step={5}
              value={[Math.round(opacidad * 100)]}
              onValueChange={(valor) => onOpacidad((Array.isArray(valor) ? valor[0] : valor) / 100)}
            />
            <span className="w-11 text-right whitespace-nowrap tabular-nums">{Math.round(opacidad * 100)} %</span>
          </div>
        </div>
      )}
    </li>
  )
}

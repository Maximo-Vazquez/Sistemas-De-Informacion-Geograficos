import { HandIcon, MousePointerClickIcon, RulerIcon, SquareDashedMousePointerIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Modos del mapa; son excluyentes porque cada uno interpreta los clics a su manera.
// El alta de elementos se suma acá en la etapa siguiente.
export type Herramienta = "navegar" | "punto" | "rectangulo" | "medir"

const HERRAMIENTAS: { valor: Herramienta; titulo: string; icono: typeof HandIcon; ayuda?: string }[] = [
  { valor: "navegar", titulo: "Navegar", icono: HandIcon },
  {
    valor: "punto",
    titulo: "Punto",
    icono: MousePointerClickIcon,
    ayuda: "Clic en el mapa para consultar las capas encendidas",
  },
  {
    valor: "rectangulo",
    titulo: "Rectángulo",
    icono: SquareDashedMousePointerIcon,
    ayuda: "Arrastrá un rectángulo para consultar las capas encendidas",
  },
  {
    valor: "medir",
    titulo: "Medir",
    icono: RulerIcon,
    ayuda: "Clic para marcar puntos · doble clic para terminar · Esc cancela",
  },
]

export function BarraHerramientas({
  herramienta,
  onCambiar,
  mediciones,
  onBorrarMediciones,
}: {
  herramienta: Herramienta
  onCambiar: (herramienta: Herramienta) => void
  mediciones: number
  onBorrarMediciones: () => void
}) {
  const ayuda = HERRAMIENTAS.find((item) => item.valor === herramienta)?.ayuda
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-col items-center gap-2 px-14">
      <div
        role="toolbar"
        aria-label="Herramientas del mapa"
        className="pointer-events-auto flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm"
      >
        <ToggleGroup
          value={[herramienta]}
          onValueChange={(valor) => valor[0] && onCambiar(valor[0] as Herramienta)}
          spacing={1}
        >
          {HERRAMIENTAS.map(({ valor, titulo, icono: Icono }) => (
            <ToggleGroupItem key={valor} value={valor} aria-label={titulo} size="sm">
              <Icono aria-hidden />
              <span className="hidden sm:inline">{titulo}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {mediciones > 0 && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-5" />
            <Button variant="ghost" size="sm" onClick={onBorrarMediciones}>
              <Trash2Icon aria-hidden />
              <span className="hidden sm:inline">Borrar mediciones</span>
              <span className="sr-only sm:hidden">Borrar mediciones</span>
            </Button>
          </>
        )}
      </div>
      {ayuda && (
        <p className="rounded-md border bg-background px-2 py-1 text-center text-xs text-muted-foreground shadow-sm">
          {ayuda}
        </p>
      )}
    </div>
  )
}

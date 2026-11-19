import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ORDEN_GRUPOS } from "../catalogo"
import type { CapaWms } from "../types"

// Catálogo de las capas publicadas: buscar y sumar o quitar del mapa sin cerrar el diálogo.
export function CatalogoCapas({ abierto, onAbierto, capas, activas, onAlternar }: {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  capas: CapaWms[]
  activas: string[]
  onAlternar: (nombre: string) => void
}) {
  const grupos = [...ORDEN_GRUPOS]
    .reverse()
    .map((titulo) => ({ titulo, capas: capas.filter((capa) => capa.grupo === titulo) }))
    .filter((grupo) => grupo.capas.length > 0)
  return (
    <CommandDialog
      open={abierto}
      onOpenChange={onAbierto}
      title="Agregar capas"
      description="Buscá una capa y elegila para sumarla o quitarla del mapa."
      showCloseButton
    >
      <Command>
        <CommandInput placeholder="Buscar capa… (por ejemplo: puentes, ríos, rutas)" />
        <CommandList className="max-h-[60dvh]">
          <CommandEmpty>Ninguna capa coincide.</CommandEmpty>
          {grupos.map((grupo) => (
            <CommandGroup key={grupo.titulo} heading={grupo.titulo}>
              {grupo.capas.map((capa) => {
                const enMapa = activas.includes(capa.nombre)
                return (
                  <CommandItem
                    key={capa.nombre}
                    value={`${capa.titulo} ${grupo.titulo}`}
                    onSelect={() => onAlternar(capa.nombre)}
                    data-checked={enMapa}
                  >
                    <span className="flex-1">{capa.titulo}</span>
                    {enMapa && <span className="text-xs text-muted-foreground">En el mapa</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

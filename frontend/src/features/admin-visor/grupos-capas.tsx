import { useTheme } from "next-themes"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { urlLeyenda } from "./capas"
import type { GrupoCapas } from "./grupos"
import type { CapaWms } from "./types"

type ControlCapas = {
  visibles: Set<string>
  onCambiar: (nombre: string, visible: boolean) => void
  wmsUrl: string
}

// Una capa: interruptor y, si está encendida, su leyenda (GetLegendGraphic).
function ItemCapa({ capa, visibles, onCambiar, wmsUrl }: ControlCapas & { capa: CapaWms }) {
  const visible = visibles.has(capa.nombre)
  const id = `capa-${capa.nombre.replace(/\W/g, "-")}`
  // El tema entra en la clave de la imagen: al cambiarlo se pide la leyenda con el nuevo color de texto.
  const { resolvedTheme } = useTheme()
  return (
    <li className="flex flex-col gap-2 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <label htmlFor={id} className="min-w-0 cursor-pointer truncate" title={capa.nombre}>
          {capa.titulo}
        </label>
        <Switch id={id} checked={visible} onCheckedChange={(valor) => onCambiar(capa.nombre, valor)} />
      </div>
      {visible && (
        <img
          key={resolvedTheme}
          src={urlLeyenda(wmsUrl, capa.nombre)}
          alt={`Leyenda de ${capa.titulo}`}
          className="max-w-full self-start"
        />
      )}
    </li>
  )
}

// Grupos temáticos plegables. El encabezado muestra cuántas capas del grupo están
// encendidas, para no perderlas de vista con el grupo cerrado.
export function GruposCapas({
  grupos,
  abiertos,
  onAbrir,
  ...control
}: ControlCapas & {
  grupos: GrupoCapas[]
  abiertos: string[]
  onAbrir: (abiertos: string[]) => void
}) {
  return (
    <Accordion multiple value={abiertos} onValueChange={(valor) => onAbrir(valor as string[])}>
      {grupos.map((grupo) => {
        const activas = grupo.capas.filter((capa) => control.visibles.has(capa.nombre)).length
        return (
          <AccordionItem key={grupo.id} value={grupo.id}>
            <AccordionTrigger className="items-center gap-2 rounded-none px-4 hover:no-underline">
              <span className="min-w-0 flex-1 truncate">{grupo.titulo}</span>
              {activas > 0 && (
                <Badge variant="secondary" aria-label={`${activas} encendidas`}>
                  {activas}
                </Badge>
              )}
              <span className="text-xs font-normal text-muted-foreground tabular-nums">{grupo.capas.length}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              <ul className="flex flex-col" aria-label={grupo.titulo}>
                {grupo.capas.map((capa) => (
                  <ItemCapa key={capa.nombre} capa={capa} {...control} />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

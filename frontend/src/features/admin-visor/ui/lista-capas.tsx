import { useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ORDEN_GRUPOS } from "../catalogo"
import type { CapaWms } from "../types"

const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

type Props = {
  capas: CapaWms[]
  visibles: Set<string>
  opacidades: Record<string, number>
  onVisible: (nombre: string, visible: boolean) => void
  onOpacidad: (nombre: string, opacidad: number) => void
  onApagarTodas: () => void
}

function FilaCapa({ capa, visible, opacidad, onVisible, onOpacidad }: {
  capa: CapaWms
  visible: boolean
  opacidad: number
  onVisible: (visible: boolean) => void
  onOpacidad: (opacidad: number) => void
}) {
  const [abierta, setAbierta] = useState(false)
  const id = `capa-${capa.nombre}`
  return (
    <li className="px-2">
      <div className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted", visible && "bg-muted/60")}>
        <Switch id={id} size="sm" checked={visible} onCheckedChange={onVisible} />
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer truncate text-sm" title={capa.titulo}>
          {capa.titulo}
        </label>
        {capa.editable && <Badge variant="success">Editable</Badge>}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Opacidad de ${capa.titulo}`}
          aria-expanded={abierta}
          disabled={!visible}
          onClick={() => setAbierta(!abierta)}
        >
          <ChevronDown className={cn("transition-transform", abierta && visible && "rotate-180")} />
        </Button>
      </div>
      {abierta && visible && (
        <div className="flex items-center gap-3 py-2 pr-2 pl-11 text-xs text-muted-foreground">
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
          <span className="w-9 text-right tabular-nums">{Math.round(opacidad * 100)} %</span>
        </div>
      )}
    </li>
  )
}

// Capas agrupadas por tema (las que se dibujan arriba, primero), con búsqueda sin acentos.
export function ListaCapas({ capas, visibles, opacidades, onVisible, onOpacidad, onApagarTodas }: Props) {
  const [busqueda, setBusqueda] = useState("")
  const grupos = useMemo(() => {
    const filtro = normalizar(busqueda.trim())
    const filtradas = capas.filter((capa) => normalizar(capa.titulo).includes(filtro))
    return [...ORDEN_GRUPOS]
      .reverse()
      .map((titulo) => ({ titulo, capas: filtradas.filter((capa) => capa.grupo === titulo) }))
      .filter((grupo) => grupo.capas.length > 0)
  }, [capas, busqueda])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 px-4 pb-3">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Buscar capa"
            placeholder="Buscar capa…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </InputGroup>
        <div className="flex h-7 items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {visibles.size} de {capas.length} encendidas
          </span>
          {visibles.size > 0 && (
            <Button variant="ghost" size="xs" onClick={onApagarTodas}>
              Apagar todas
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto border-t pb-4">
        {grupos.length === 0 && <p className="p-4 text-sm text-muted-foreground">Ninguna capa coincide con “{busqueda}”.</p>}
        {grupos.map((grupo) => (
          <section key={grupo.titulo} aria-label={grupo.titulo}>
            <h3 className="sticky top-0 z-10 bg-background/95 px-4 pt-3 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
              {grupo.titulo}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {grupo.capas.map((capa) => (
                <FilaCapa
                  key={capa.nombre}
                  capa={capa}
                  visible={visibles.has(capa.nombre)}
                  opacidad={opacidades[capa.nombre] ?? 1}
                  onVisible={(visible) => onVisible(capa.nombre, visible)}
                  onOpacidad={(opacidad) => onOpacidad(capa.nombre, opacidad)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

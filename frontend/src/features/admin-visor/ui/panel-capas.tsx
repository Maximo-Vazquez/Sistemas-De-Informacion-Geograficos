import { useState } from "react"
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { TEMAS } from "../catalogo"
import type { useCapasActivas } from "../mapa/use-capas-activas"
import type { CapaWms } from "../types"
import { CatalogoCapas } from "./catalogo-capas"
import { FilaCapa } from "./fila-capa"

export type EstadoCapas = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; capas: CapaWms[] }

type Props = {
  estado: EstadoCapas
  activas: ReturnType<typeof useCapasActivas>
  catalogoAbierto: boolean
  onCatalogo: (abierto: boolean) => void
  wmsUrl: string
  consolaUrl: string
}

function SinCapas({ error, consolaUrl }: { error: boolean; consolaUrl: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Layers />
        </EmptyMedia>
        <EmptyTitle>{error ? "GeoServer no responde" : "Sin capas publicadas"}</EmptyTitle>
        <EmptyDescription>
          {error ? (
            <>
              Levantalo con <code>docker compose up -d postgis geoserver</code>.
            </>
          ) : (
            <>
              Cargalas con <code>python scripts/cargar_capas_ign.py</code> o desde la{" "}
              <a href={consolaUrl} target="_blank" rel="noreferrer">
                consola de GeoServer
              </a>
              .
            </>
          )}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// Solo las capas que están en el mapa (con su leyenda), temas rápidos y un catálogo para sumar más.
export function PanelCapas({ estado, activas, catalogoAbierto, onCatalogo, wmsUrl, consolaUrl }: Props) {
  const [temaActivo, setTemaActivo] = useState<string | null>(null)
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  if (estado.tipo === "cargando") {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Spinner /> Leyendo capas de GeoServer…
      </div>
    )
  }
  if (estado.tipo === "error" || estado.capas.length === 0) {
    return <SinCapas error={estado.tipo === "error"} consolaUrl={consolaUrl} />
  }
  const porNombre = new Map(estado.capas.map((capa) => [capa.nombre, capa]))
  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) activas.mover(String(active.id), String(over.id))
  }
  const alternar = (nombre: string) => {
    setTemaActivo(null)
    if (activas.activas.includes(nombre)) activas.quitar(nombre)
    else activas.agregar(nombre)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">
            Capas en el mapa <span className="text-muted-foreground tabular-nums">({activas.activas.length})</span>
          </h2>
          <Button size="sm" onClick={() => onCatalogo(true)}>
            <Plus data-icon="inline-start" /> Agregar
          </Button>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Temas rápidos</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Temas rápidos">
            {TEMAS.map((tema) => (
              <Button
                key={tema.id}
                variant={temaActivo === tema.id ? "outline-primary" : "outline"}
                size="xs"
                aria-pressed={temaActivo === tema.id}
                onClick={() => {
                  setTemaActivo(tema.id)
                  activas.reemplazar(tema.capas)
                }}
              >
                {tema.titulo}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activas.activas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No hay capas en el mapa.
            <Button variant="outline-primary" size="sm" onClick={() => onCatalogo(true)}>
              <Plus data-icon="inline-start" /> Agregar capas
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensores} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={alSoltar}>
            <SortableContext items={activas.activas} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2" aria-label="Capas en el mapa, de arriba hacia abajo">
                {activas.activas.map((nombre) => {
                  const capa = porNombre.get(nombre)
                  if (!capa) return null
                  return (
                    <FilaCapa
                      key={nombre}
                      capa={capa}
                      oculta={activas.ocultas.has(nombre)}
                      opacidad={activas.opacidades[nombre] ?? 1}
                      wmsUrl={wmsUrl}
                      onVisible={() => activas.alternarVisible(nombre)}
                      onOpacidad={(opacidad) => activas.cambiarOpacidad(nombre, opacidad)}
                      onQuitar={() => alternar(nombre)}
                    />
                  )
                })}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
          <span>Arrastrá para cambiar el orden.</span>
          <span className="flex items-center gap-1">
            <Kbd>C</Kbd> abre el catálogo
          </span>
        </p>
      </div>
      <CatalogoCapas
        abierto={catalogoAbierto}
        onAbierto={onCatalogo}
        capas={estado.capas}
        activas={activas.activas}
        onAlternar={alternar}
      />
    </div>
  )
}

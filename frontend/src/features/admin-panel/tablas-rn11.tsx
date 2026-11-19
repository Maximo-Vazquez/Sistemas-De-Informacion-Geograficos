import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DetailTable, numeric } from "@/components/dashboard/panel"
import { formatNumber } from "@/lib/format"
import type { LocalidadAfectada, PuenteRn11 } from "./types"

const km = (valor: number) => `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(valor)} km`
const habitantes = (localidad: LocalidadAfectada) =>
  localidad.con_dato ? formatNumber(localidad.habitantes) : "Sin dato"

function CategoriaBadge({ categoria }: { categoria: LocalidadAfectada["categoria"] }) {
  return <Badge variant={categoria === "0 a 10 km" ? "warning" : "outline"}>{categoria}</Badge>
}

const columnasLocalidades: ColumnDef<LocalidadAfectada>[] = [
  {
    id: "localidad",
    header: "Localidad",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.nombre}</span>
        <span className="text-xs text-muted-foreground">{row.original.tipo}</span>
      </div>
    ),
  },
  { id: "categoria", header: "Categoría", cell: ({ row }) => <CategoriaBadge categoria={row.original.categoria} /> },
  { id: "distancia", header: () => numeric("Distancia"), cell: ({ row }) => numeric(km(row.original.distancia_km)) },
  { id: "habitantes", header: () => numeric("Habitantes"), cell: ({ row }) => numeric(habitantes(row.original)) },
]

// Localidades del Chaco a 20 km o menos de la traza, de la más cercana a la más lejana.
export function TablaLocalidades({ localidades }: { localidades: LocalidadAfectada[] }) {
  return (
    <DetailTable
      data={localidades}
      columns={columnasLocalidades}
      renderCard={(row) => (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{row.original.nombre}</span>
            <span className="text-xs text-muted-foreground">
              {km(row.original.distancia_km)} · {habitantes(row.original)}
            </span>
          </div>
          <CategoriaBadge categoria={row.original.categoria} />
        </div>
      )}
    />
  )
}

const columnasPuentes: ColumnDef<PuenteRn11>[] = [
  { id: "numero", header: "N.º", cell: ({ row }) => <span className="tabular-nums">{row.original.numero}</span> },
  { id: "km", header: () => numeric("Km"), cell: ({ row }) => numeric(km(row.original.km_traza)) },
  {
    id: "curso",
    header: "Curso de agua",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.curso_de_agua ?? "Sin curso cartografiado"}</span>
        {row.original.regimen && <span className="text-xs text-muted-foreground">{row.original.regimen}</span>}
      </div>
    ),
  },
  { id: "localidad", header: "Localidad cercana", cell: ({ row }) => row.original.localidad_cercana ?? "—" },
]

// Puentes de la RN 11 ordenados desde el límite con Santa Fe hacia el río Bermejo.
export function TablaPuentes({ puentes }: { puentes: PuenteRn11[] }) {
  return (
    <DetailTable
      data={puentes}
      columns={columnasPuentes}
      renderCard={(row) => (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium">
              {row.original.numero}. {row.original.curso_de_agua ?? "Sin curso cartografiado"}
            </span>
            <span className="text-xs text-muted-foreground">{row.original.localidad_cercana}</span>
          </div>
          <span className="text-sm tabular-nums">{km(row.original.km_traza)}</span>
        </div>
      )}
    />
  )
}

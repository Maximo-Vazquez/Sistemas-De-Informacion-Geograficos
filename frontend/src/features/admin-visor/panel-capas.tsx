import { Layers } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { urlLeyenda } from "./capas"
import type { CapaWms } from "./types"

export type EstadoCapas = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; capas: CapaWms[] }

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
            <>Levantalo con <code>docker compose up -d geoserver</code>.</>
          ) : (
            <>
              Publicá las capas en el espacio de trabajo desde la{" "}
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

// Lista de capas con su interruptor y, si está encendida, su leyenda (GetLegendGraphic).
export function PanelCapas({
  estado,
  visibles,
  onCambiar,
  wmsUrl,
  consolaUrl,
}: {
  estado: EstadoCapas
  visibles: Set<string>
  onCambiar: (nombre: string, visible: boolean) => void
  wmsUrl: string
  consolaUrl: string
}) {
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
  return (
    <ul className="flex flex-col divide-y" aria-label="Capas">
      {estado.capas.map((capa) => {
        const visible = visibles.has(capa.nombre)
        const id = `capa-${capa.nombre.replace(/\W/g, "-")}`
        return (
          <li key={capa.nombre} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <label htmlFor={id} className="min-w-0 cursor-pointer truncate" title={capa.nombre}>
                {capa.titulo}
              </label>
              <Switch id={id} checked={visible} onCheckedChange={(valor) => onCambiar(capa.nombre, valor)} />
            </div>
            {visible && (
              <img
                src={urlLeyenda(wmsUrl, capa.nombre)}
                alt={`Leyenda de ${capa.titulo}`}
                className="max-w-full self-start rounded-sm bg-background p-1"
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

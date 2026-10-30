import { Layers, ListTree } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { urlLeyenda } from "../ogc"
import type { CapaWms } from "../types"
import { ListaCapas } from "./lista-capas"

export type EstadoCapas = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; capas: CapaWms[] }

type Props = {
  estado: EstadoCapas
  visibles: Set<string>
  opacidades: Record<string, number>
  onVisible: (nombre: string, visible: boolean) => void
  onOpacidad: (nombre: string, opacidad: number) => void
  onApagarTodas: () => void
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

// Leyenda de las capas encendidas en orden de dibujo (GetLegendGraphic con las clases del estilo).
function Leyenda({ capas, visibles, wmsUrl }: { capas: CapaWms[]; visibles: Set<string>; wmsUrl: string }) {
  const encendidas = capas.filter((capa) => visibles.has(capa.nombre)).reverse()
  if (encendidas.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Encendé una capa para ver su simbología.</p>
  }
  return (
    <ul className="flex flex-col divide-y">
      {encendidas.map((capa) => (
        <li key={capa.nombre} className="flex flex-col gap-2 px-4 py-3">
          <span className="text-sm font-medium">{capa.titulo}</span>
          {/* Fondo claro fijo: GeoServer dibuja la leyenda con texto oscuro. */}
          <img
            src={urlLeyenda(wmsUrl, capa.nombre)}
            alt={`Simbología de ${capa.titulo}`}
            loading="lazy"
            className="max-w-full self-start rounded-md bg-white p-1.5 ring-1 ring-border"
          />
        </li>
      ))}
    </ul>
  )
}

export function PanelLateral({ estado, wmsUrl, consolaUrl, ...lista }: Props) {
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
    <Tabs defaultValue="capas" className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
      <TabsList className="mx-4 grid grid-cols-2">
        <TabsTrigger value="capas">
          <Layers /> Capas
        </TabsTrigger>
        <TabsTrigger value="leyenda">
          <ListTree /> Leyenda
        </TabsTrigger>
      </TabsList>
      <TabsContent value="capas" className="flex min-h-0 flex-1 flex-col">
        <ListaCapas capas={estado.capas} {...lista} />
      </TabsContent>
      <TabsContent value="leyenda" className="min-h-0 flex-1 overflow-y-auto border-t">
        <Leyenda capas={estado.capas} visibles={lista.visibles} wmsUrl={wmsUrl} />
      </TabsContent>
    </Tabs>
  )
}

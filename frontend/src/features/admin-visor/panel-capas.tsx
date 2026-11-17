import { useMemo, useState } from "react"
import { Layers, SearchIcon, SearchXIcon, XIcon } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { agruparCapas, filtrarGrupos, GRUPO_INICIAL } from "./grupos"
import { GruposCapas } from "./grupos-capas"
import type { CapaWms } from "./types"

export type EstadoCapas = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; capas: CapaWms[] }

function SinCapas({ error, consolaUrl }: { error: boolean; consolaUrl: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Layers />
        </EmptyMedia>
        <EmptyTitle>{error ? "No se pudieron leer las capas" : "Sin capas publicadas"}</EmptyTitle>
        <EmptyDescription>
          {error ? (
            <>
              Revisá que GeoServer esté levantado (<code>docker compose up -d geoserver</code>) y que exista el
              espacio de trabajo.
            </>
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

function SinResultados({ busqueda }: { busqueda: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Sin resultados</EmptyTitle>
        <EmptyDescription>Ninguna capa coincide con “{busqueda}”.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (valor: string) => void }) {
  return (
    <div className="sticky top-0 z-10 bg-background px-4 pb-3">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
          onKeyDown={(evento) => evento.key === "Escape" && onCambiar("")}
          placeholder="Buscar capa o tema…"
          aria-label="Buscar capa"
          autoComplete="off"
        />
        {valor && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Limpiar búsqueda" onClick={() => onCambiar("")}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  )
}

type ListaProps = {
  capas: CapaWms[]
  visibles: Set<string>
  onCambiar: (nombre: string, visible: boolean) => void
  wmsUrl: string
}

// Buscador y grupos temáticos. Mientras hay una búsqueda, los grupos con resultados se
// muestran abiertos; al borrarla vuelven a como los había dejado el usuario.
function ListaCapas({ capas, ...control }: ListaProps) {
  const [busqueda, setBusqueda] = useState("")
  const [abiertos, setAbiertos] = useState<string[]>([GRUPO_INICIAL])
  // Grupos que el usuario cerró durante la búsqueda actual; se olvidan al cambiarla.
  const [cerradosEnBusqueda, setCerradosEnBusqueda] = useState<string[]>([])
  const grupos = useMemo(() => agruparCapas(capas), [capas])
  const filtrados = useMemo(() => filtrarGrupos(grupos, busqueda), [grupos, busqueda])
  const buscando = busqueda.trim() !== ""
  const ids = filtrados.map((grupo) => grupo.id)

  const buscar = (valor: string) => {
    setBusqueda(valor)
    setCerradosEnBusqueda([])
  }

  return (
    <>
      <Buscador valor={busqueda} onCambiar={buscar} />
      {filtrados.length === 0 ? (
        <SinResultados busqueda={busqueda.trim()} />
      ) : (
        <GruposCapas
          grupos={filtrados}
          abiertos={buscando ? ids.filter((id) => !cerradosEnBusqueda.includes(id)) : abiertos}
          onAbrir={buscando ? (valor) => setCerradosEnBusqueda(ids.filter((id) => !valor.includes(id))) : setAbiertos}
          {...control}
        />
      )}
    </>
  )
}

export function PanelCapas({
  estado,
  consolaUrl,
  ...lista
}: Omit<ListaProps, "capas"> & { estado: EstadoCapas; consolaUrl: string }) {
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
  return <ListaCapas capas={estado.capas} {...lista} />
}

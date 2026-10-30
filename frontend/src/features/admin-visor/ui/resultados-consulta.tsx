import { CircleAlert, MousePointerClick, SquareDashedMousePointer } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { atributosVisibles, nombreElemento } from "../catalogo"
import type { Consulta, ElementoConsultado } from "../types"
import { PanelFlotante } from "./panel-flotante"

const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`

function Atributos({ elemento }: { elemento: ElementoConsultado }) {
  const filas = atributosVisibles(elemento.feature.getProperties())
  if (filas.length === 0) return <p className="px-3 pb-3 text-xs text-muted-foreground">Sin atributos cargados.</p>
  return (
    <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-1.5 px-3 pb-3 text-xs">
      {filas.map(([clave, valor]) => (
        <div key={clave} className="contents">
          <dt className="truncate text-muted-foreground capitalize" title={clave}>
            {clave.replaceAll("_", " ")}
          </dt>
          <dd className="break-words">{String(valor)}</dd>
        </div>
      ))}
    </dl>
  )
}

function Contenido({ consulta, seleccion, onSeleccionar }: {
  consulta: Consulta
  seleccion: string | null
  onSeleccionar: (id: string | null) => void
}) {
  if (consulta.estado === "cargando") {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Spinner /> Consultando capas encendidas…
      </div>
    )
  }
  if (consulta.estado === "error") {
    return (
      <div className="p-3">
        <Alert variant="warning">
          <CircleAlert />
          <AlertDescription>{consulta.mensaje}</AlertDescription>
        </Alert>
      </div>
    )
  }
  if (consulta.grupos.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No hay elementos ahí. Acercate o encendé otra capa.</p>
  }
  return (
    <div className="flex flex-col divide-y">
      {consulta.grupos.map((grupo) => (
        <section key={grupo.capa.nombre} aria-label={grupo.capa.titulo}>
          <h3 className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background/95 px-3 py-2 text-xs font-medium backdrop-blur">
            <span className="truncate">{grupo.capa.titulo}</span>
            <Badge variant="secondary" className="tabular-nums">
              {grupo.total > grupo.elementos.length ? `${grupo.elementos.length} de ${grupo.total}` : grupo.total}
            </Badge>
          </h3>
          <ul className="flex flex-col px-1.5 pb-1.5">
            {grupo.elementos.map((elemento) => {
              const activo = elemento.id === seleccion
              const propiedades = elemento.feature.getProperties()
              return (
                <li key={elemento.id} className={cn("rounded-md", activo && "bg-muted")}>
                  <button
                    type="button"
                    aria-expanded={activo}
                    onClick={() => onSeleccionar(activo ? null : elemento.id)}
                    className="flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-md px-1.5 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="text-sm">{nombreElemento(propiedades, elemento.id)}</span>
                    {typeof propiedades.tipo === "string" && propiedades.nombre && (
                      <span className="text-xs text-muted-foreground">{propiedades.tipo}</span>
                    )}
                  </button>
                  {activo && <Atributos elemento={elemento} />}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function ResultadosConsulta({ consulta, tipo, seleccion, onSeleccionar, onLimpiar }: {
  consulta: Consulta | null
  tipo: "punto" | "rectangulo"
  seleccion: string | null
  onSeleccionar: (id: string | null) => void
  onLimpiar: () => void
}) {
  const esPunto = (consulta?.tipo ?? tipo) === "punto"
  const total = consulta?.estado === "listo" ? consulta.grupos.reduce((suma, grupo) => suma + grupo.total, 0) : 0
  const descripcion = !consulta
    ? esPunto
      ? "Hacé clic sobre el mapa. Se consultan todas las capas encendidas."
      : "Arrastrá un rectángulo sobre el mapa para listar lo que cae adentro."
    : consulta.estado === "listo"
      ? `${plural(total, "elemento", "elementos")} en ${plural(consulta.grupos.length, "capa", "capas")}. Elegí uno para ver sus atributos.`
      : undefined
  return (
    <PanelFlotante
      icono={esPunto ? <MousePointerClick /> : <SquareDashedMousePointer />}
      titulo={esPunto ? "Consulta por punto" : "Consulta por área"}
      descripcion={descripcion}
      acciones={
        consulta && (
          <Button variant="outline" size="sm" onClick={onLimpiar}>
            Limpiar resultados
          </Button>
        )
      }
    >
      {consulta && <Contenido consulta={consulta} seleccion={seleccion} onSeleccionar={onSeleccionar} />}
    </PanelFlotante>
  )
}

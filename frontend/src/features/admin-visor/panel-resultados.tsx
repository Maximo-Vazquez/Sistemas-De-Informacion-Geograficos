import { LayersIcon, SearchXIcon, XIcon } from "lucide-react"
import { StatusIndicator } from "@/components/admin/visual"
import { DetailList } from "@/components/detail/detail-sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { formatNumber } from "@/lib/format"
import { etiquetaAtributo, type Elemento, type ResultadoCapa } from "./consultas"
import type { Consulta } from "./use-consulta"

const TITULO = { punto: "Consulta por punto", rectangulo: "Consulta por rectángulo" }

type Seleccion = { seleccionado: string | null; onSeleccionar: (elemento: Elemento | null) => void }

function Aviso({ icono: Icono, titulo, texto }: { icono: typeof LayersIcon; titulo: string; texto: string }) {
  return (
    <Empty className="p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icono />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription>{texto}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// Un elemento: el nombre lo selecciona (resaltado y zoom) y despliega sus atributos.
function FilaElemento({ elemento, seleccionado, onSeleccionar }: Seleccion & { elemento: Elemento }) {
  const abierto = seleccionado === elemento.id
  return (
    <li className="border-t first:border-t-0">
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => onSeleccionar(abierto ? null : elemento)}
        className="w-full truncate px-4 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted aria-expanded:font-medium"
      >
        {elemento.titulo}
      </button>
      {abierto && (
        <div className="px-4 pt-1 pb-3">
          <DetailList
            items={elemento.atributos.map(([clave, valor]) => ({ label: etiquetaAtributo(clave), value: valor }))}
          />
        </div>
      )}
    </li>
  )
}

function cantidad({ elementos, total }: ResultadoCapa) {
  return total > elementos.length ? `${elementos.length} de ${formatNumber(total)}` : formatNumber(total)
}

function Resultados({ resultados, ...seleccion }: Seleccion & { resultados: ResultadoCapa[] }) {
  const conDatos = resultados.filter((resultado) => resultado.error || resultado.total > 0)
  const vacias = resultados.filter((resultado) => !resultado.error && resultado.total === 0)
  if (conDatos.length === 0) {
    return (
      <Aviso
        icono={SearchXIcon}
        titulo="Sin elementos"
        texto="Ninguna capa encendida tiene elementos acá. Probá en otro lugar o con otras capas."
      />
    )
  }
  return (
    <>
      <Accordion multiple defaultValue={conDatos.map((resultado) => resultado.capa.nombre)}>
        {conDatos.map((resultado) => (
          <AccordionItem key={resultado.capa.nombre} value={resultado.capa.nombre}>
            <AccordionTrigger className="items-center gap-2 rounded-none px-4 hover:no-underline">
              <span className="min-w-0 flex-1 truncate">{resultado.capa.titulo}</span>
              {!resultado.error && (
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{cantidad(resultado)}</span>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {resultado.error ? (
                <StatusIndicator tone="error" className="px-4 pb-3">
                  No se pudo consultar esta capa
                </StatusIndicator>
              ) : (
                <ul aria-label={`Elementos de ${resultado.capa.titulo}`}>
                  {resultado.elementos.map((elemento) => (
                    <FilaElemento key={elemento.id} elemento={elemento} {...seleccion} />
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {vacias.length > 0 && (
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">
          Sin elementos en: {vacias.map((resultado) => resultado.capa.titulo).join(", ")}.
        </p>
      )}
    </>
  )
}

function resumen(consulta: Consulta) {
  if (consulta.tipo !== "lista") return null
  const total = consulta.resultados.reduce((suma, resultado) => suma + resultado.total, 0)
  const capas = consulta.resultados.filter((resultado) => resultado.total > 0).length
  if (total === 0) return null
  return `${formatNumber(total)} ${total === 1 ? "elemento" : "elementos"} en ${capas} ${capas === 1 ? "capa" : "capas"}`
}

// Panel flotante sobre el mapa: a la derecha en pantallas anchas y abajo en el celular,
// para que los elementos resaltados sigan a la vista.
export function PanelResultados({
  consulta,
  onCerrar,
  ...seleccion
}: Seleccion & { consulta: Consulta; onCerrar: () => void }) {
  if (consulta.tipo === "vacia") return null
  const detalle = resumen(consulta)
  return (
    <section
      aria-label="Resultados de la consulta"
      className="absolute inset-x-2 bottom-2 z-10 flex max-h-[45%] flex-col overflow-hidden rounded-lg border bg-background shadow-lg md:inset-x-auto md:top-24 md:right-2 md:bottom-8 md:max-h-none md:w-80"
    >
      <header className="flex items-start gap-2 border-b py-2 pr-2 pl-4">
        <div className="min-w-0 flex-1 py-1">
          <h2 className="text-sm font-medium">{TITULO[consulta.modo]}</h2>
          {detalle && <p className="text-xs text-muted-foreground">{detalle}</p>}
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Cerrar resultados" onClick={onCerrar}>
          <XIcon />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {consulta.tipo === "consultando" && (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Spinner /> Consultando capas…
          </div>
        )}
        {consulta.tipo === "sin-capas" && (
          <Aviso icono={LayersIcon} titulo="No hay capas encendidas" texto="Encendé al menos una capa para consultarla." />
        )}
        {consulta.tipo === "lista" && (
          <Resultados key={consulta.numero} resultados={consulta.resultados} {...seleccion} />
        )}
      </div>
    </section>
  )
}

import { useMemo, useState } from "react"
import { getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table"
import { Download, Table2, X } from "lucide-react"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { atributos, clavesDestacadas, nombreElemento } from "../catalogo"
import type { GrupoResultados } from "../types"

type Fila = { id: string; nombre: string; valores: Record<string, string> }

const MAX_COLUMNAS = 6
const METADATOS = new Set(["fuente", "precisión", "precision", "situación", "actualizac"])

function filasDe(grupo: GrupoResultados) {
  const filas = grupo.elementos.map((elemento) => {
    const propiedades = elemento.feature.getProperties()
    const datos = atributos(propiedades).filter((dato) => dato.clave !== "nombre")
    return { id: elemento.id, nombre: nombreElemento(propiedades, elemento.id), datos }
  })
  // Columnas: los campos destacados de la capa; si no tiene, los que más datos traen
  // (sin los de metadatos, que quedan en el detalle).
  const frecuencia = new Map<string, { etiqueta: string; veces: number }>()
  for (const fila of filas)
    for (const dato of fila.datos)
      if (!METADATOS.has(dato.clave)) frecuencia.set(dato.clave, { etiqueta: dato.etiqueta, veces: (frecuencia.get(dato.clave)?.veces ?? 0) + 1 })
  const destacadas = clavesDestacadas(grupo.capa.nombre)?.filter((clave) => frecuencia.has(clave))
  const claves = destacadas?.length
    ? destacadas
    : [...frecuencia.entries()].sort((a, b) => b[1].veces - a[1].veces).slice(0, MAX_COLUMNAS).map(([clave]) => clave)
  const columnas = claves.map((clave) => frecuencia.get(clave)!.etiqueta)
  return {
    columnas,
    filas: filas.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      valores: Object.fromEntries(fila.datos.map((dato) => [dato.etiqueta, dato.valor])),
    })),
  }
}

function descargarCsv(nombre: string, columnas: string[], filas: Fila[]) {
  const celda = (valor: string) => `"${valor.replaceAll('"', '""')}"`
  const lineas = [["Nombre", ...columnas], ...filas.map((fila) => [fila.nombre, ...columnas.map((c) => fila.valores[c] ?? "")])]
  // BOM para que Excel abra bien los acentos.
  const blob = new Blob(["﻿" + lineas.map((linea) => linea.map(celda).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" })
  const enlace = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${nombre}.csv` })
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// Tabla de atributos de la consulta por área: una pestaña por capa, orden por columna,
// fila elegida resaltada en el mapa y el nombre abre el detalle completo.
export function TablaAtributos({ grupos, seleccion, onSeleccionar, onDetalle, onCerrar }: {
  grupos: GrupoResultados[]
  seleccion: string | null
  onSeleccionar: (id: string) => void
  onDetalle: (id: string) => void
  onCerrar: () => void
}) {
  const [pestana, setPestana] = useState(grupos[0]?.capa.nombre ?? "")
  const [orden, setOrden] = useState<SortingState>([])
  const grupo = grupos.find((g) => g.capa.nombre === pestana) ?? grupos[0]
  const { filas, columnas } = useMemo(() => (grupo ? filasDe(grupo) : { filas: [], columnas: [] }), [grupo])

  const definicion = useMemo<ColumnDef<Fila>[]>(() => {
    const encabezado = (titulo: string) => ({ column }: { column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: () => void } }) => (
      <DataTableColumnHeader title={titulo} active={!!column.getIsSorted()} descending={column.getIsSorted() === "desc"} onSort={() => column.toggleSorting()} />
    )
    return [
      {
        id: "nombre",
        accessorFn: (fila) => fila.nombre,
        header: encabezado("Nombre"),
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-left font-medium text-primary underline-offset-4 hover:underline"
            onClick={(evento) => {
              evento.stopPropagation()
              onDetalle(row.original.id)
            }}
          >
            {row.original.nombre}
          </button>
        ),
      },
      ...columnas.map<ColumnDef<Fila>>((etiqueta) => ({
        id: etiqueta,
        accessorFn: (fila) => fila.valores[etiqueta] ?? "",
        header: encabezado(etiqueta),
        cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue() ?? "") || "—"}</span>,
      })),
    ]
  }, [columnas, onDetalle])

  const tabla = useReactTable({
    data: filas,
    columns: definicion,
    state: { sorting: orden, rowSelection: seleccion ? { [seleccion]: true } : {} },
    onSortingChange: setOrden,
    getRowId: (fila) => fila.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!grupo) return null
  return (
    <section aria-label="Tabla de atributos" className="flex h-72 shrink-0 flex-col border-t bg-background">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2">
        <Table2 className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-medium">Tabla de atributos</h2>
        <Tabs value={grupo.capa.nombre} onValueChange={(valor) => setPestana(String(valor))} className="order-last w-full">
          <TabsList className="max-w-full justify-start overflow-x-auto">
            {grupos.map((g) => (
              <TabsTrigger key={g.capa.nombre} value={g.capa.nombre}>
                {g.capa.titulo}
                <span className="text-muted-foreground tabular-nums">
                  {g.total > g.elementos.length ? `${g.elementos.length}/${g.total}` : g.total}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => descargarCsv(grupo.capa.nombre, columnas, filas)}>
          <Download data-icon="inline-start" /> CSV
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Cerrar tabla de atributos" onClick={onCerrar}>
          <X />
        </Button>
      </header>
      {grupo.total > grupo.elementos.length && (
        <p className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          Se muestran los primeros {grupo.elementos.length} de {grupo.total}. Achicá el área para ver el resto.
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-3 [&_tbody_tr[data-state=selected]]:bg-primary/10">
        <DataTable table={tabla} pagination={null} onRowClick={(fila) => onSeleccionar(fila.id)} />
      </div>
    </section>
  )
}

import type { ReactNode } from "react"
import { flexRender, type Row, type Table as TableInstance } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useIsMobile } from "@/hooks/use-mobile"

function EmptyResults() {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyTitle>Sin resultados</EmptyTitle>
        <EmptyDescription>Probá cambiar o limpiar los filtros.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// El consumidor configura TanStack y decide si los datos son locales o de servidor.
// Con `renderCard`, debajo de md cada fila se muestra como tarjeta en lugar de la tabla.
export function DataTable<T>({
  table,
  toolbar,
  pagination,
  renderCard,
}: {
  table: TableInstance<T>
  toolbar?: ReactNode
  pagination: ReactNode
  renderCard?: (row: Row<T>) => ReactNode
}) {
  const rows = table.getRowModel().rows
  // Se monta una sola vista para no duplicar contenido ni controles accesibles.
  const cards = useIsMobile() && !!renderCard
  return (
    <div className="flex flex-col gap-3">
      {toolbar}
      {!cards && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length}>
                    <EmptyResults />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {cards && (
        <ul className="flex flex-col gap-2" aria-label="Resultados">
          {rows.length ? (
            rows.map((row) => (
              <li key={row.id} className="rounded-xl border bg-card p-3 text-card-foreground">
                {renderCard!(row)}
              </li>
            ))
          ) : (
            <li className="rounded-xl border">
              <EmptyResults />
            </li>
          )}
        </ul>
      )}
      {pagination}
    </div>
  )
}

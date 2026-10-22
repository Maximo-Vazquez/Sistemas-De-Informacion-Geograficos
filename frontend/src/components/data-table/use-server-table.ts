import { useState } from "react"
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table"

// El servidor pagina, ordena y filtra; TanStack administra visibilidad y selección de la página.
export function useServerTable<T extends { id: number }>(
  rows: T[],
  columns: ColumnDef<T>[],
  {
    pageCount,
    enableRowSelection = false,
  }: { pageCount?: number; enableRowSelection?: boolean } = {},
) {
  const [rowSelection, onRowSelectionChange] = useState<RowSelectionState>({})
  const [columnVisibility, onColumnVisibilityChange] = useState<VisibilityState>({})
  return useReactTable({
    data: rows,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange,
    onColumnVisibilityChange,
    enableRowSelection,
  })
}

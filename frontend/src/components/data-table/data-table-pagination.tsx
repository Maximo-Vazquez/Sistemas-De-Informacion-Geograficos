import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ServerPagination = { page: number; pages: number; pageSize: number; total: number }
export function DataTablePagination({
  pagination: p,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: ServerPagination
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const sizes = [12, 24, 48].map((value) => ({ value: String(value), label: String(value) }))
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground tabular-nums">
        {p.total ? (p.page - 1) * p.pageSize + 1 : 0}–{Math.min(p.page * p.pageSize, p.total)} de{" "}
        {p.total.toLocaleString("es-AR")}
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        <Label htmlFor="table-page-size" className="hidden sm:flex">
          Filas
        </Label>
        <Select
          items={sizes}
          value={String(p.pageSize)}
          onValueChange={(value) => value && onPageSizeChange(Number(value))}
        >
          <SelectTrigger
            id="table-page-size"
            aria-label="Filas por página"
            className="hidden sm:flex"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sizes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="hidden tabular-nums sm:inline">
          Página {p.page} de {p.pages}
        </span>
        <span className="tabular-nums sm:hidden">
          {p.page}/{p.pages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Primera página"
          className="hidden sm:inline-flex"
          disabled={p.page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Página anterior"
          disabled={p.page === 1}
          onClick={() => onPageChange(p.page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Página siguiente"
          disabled={p.page >= p.pages}
          onClick={() => onPageChange(p.page + 1)}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Última página"
          className="hidden sm:inline-flex"
          disabled={p.page >= p.pages}
          onClick={() => onPageChange(p.pages)}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}

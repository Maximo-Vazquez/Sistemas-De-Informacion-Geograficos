import { useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, CircleAlert, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ItemErrors = Record<string, string>
type Summary = { title: ReactNode; description?: ReactNode; meta?: ReactNode }
type Editing<T> = { index: number | null; draft: T; errors: ItemErrors }

// Lista de ítems repetibles: una fila compacta por ítem y un modal para editar (patrón de las
// variantes de la ficha de producto). Los cambios del modal se aplican al confirmar y viven en
// el estado del formulario: se guardan todos juntos con el botón principal de la página.
export function EditableList<T>({
  noun,
  items,
  onChange,
  addOptions,
  summary,
  editor,
  validate,
  invalid,
  error,
  errorId,
  emptyText,
  sortable,
}: {
  // Sustantivo en singular para textos y nombres accesibles ("plan", "módulo").
  noun: string
  items: T[]
  onChange: (items: T[]) => void
  addOptions: { label: string; create: () => T }[]
  summary: (item: T, index: number) => Summary
  editor: (draft: T, set: (patch: Partial<T>) => void, errors: ItemErrors) => ReactNode
  validate?: (item: T) => ItemErrors
  invalid?: (index: number) => boolean
  error?: string
  errorId?: string
  emptyText: string
  sortable?: boolean
}) {
  const [editing, setEditing] = useState<Editing<T> | null>(null)
  const open = (index: number | null, draft: T) =>
    setEditing({ index, draft, errors: index !== null && invalid?.(index) ? validate?.(draft) ?? {} : {} })
  const set = (patch: Partial<T>) =>
    setEditing((old) => (old ? { ...old, draft: { ...old.draft, ...patch } } : old))
  const save = () => {
    if (!editing) return
    const errors = validate?.(editing.draft) ?? {}
    if (Object.keys(errors).length) return setEditing({ ...editing, errors })
    onChange(
      editing.index === null
        ? [...items, editing.draft]
        : items.map((item, i) => (i === editing.index ? editing.draft : item)),
    )
    setEditing(null)
  }
  const move = (index: number, delta: number) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }
  const title = editing
    ? editing.index === null
      ? `Agregar ${noun}`
      : `Editar ${noun}`
    : ""

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {items.length ? (
        <ul className="flex flex-col divide-y rounded-lg ring-1 ring-border" aria-label={`Lista de ${noun}`}>
          {items.map((item, index) => {
            const row = summary(item, index)
            const bad = invalid?.(index)
            return (
              <li key={index} className={cn("flex items-center gap-3 px-3 py-2.5", bad && "bg-destructive/5")}>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => open(index, item)}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className="truncate">{row.title}</span>
                    {bad && (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-normal text-destructive">
                        <CircleAlert aria-hidden="true" className="size-3.5" />
                        Revisar
                      </span>
                    )}
                  </span>
                  {row.description && <span className="truncate text-muted-foreground">{row.description}</span>}
                </button>
                {row.meta && <span className="hidden shrink-0 items-center gap-2 sm:flex">{row.meta}</span>}
                <span className="flex shrink-0 items-center">
                  {sortable && (
                    <>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${noun} ${index + 1}`} disabled={index === 0} onClick={() => move(index, -1)}>
                        <ArrowUp />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${noun} ${index + 1}`} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                        <ArrowDown />
                      </Button>
                    </>
                  )}
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Editar ${noun} ${index + 1}`} onClick={() => open(index, item)}>
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Quitar ${noun} ${index + 1}`}
                    onClick={() => onChange(items.filter((_, i) => i !== index))}
                  >
                    <Trash2 />
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {addOptions.map((option) => (
          <Button key={option.label} type="button" variant="outline-primary" size="sm" onClick={() => open(null, option.create())}>
            <Plus data-icon="inline-start" />
            {option.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(value) => !value && setEditing(null)}>
        <DialogContent
          className="flex max-h-[90dvh] flex-col sm:max-w-xl max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Los cambios se guardan junto con el resto del formulario.</DialogDescription>
          </DialogHeader>
          <div className="-mx-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-1">
            {editing && editor(editing.draft, set, editing.errors)}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={save}>
              {editing?.index === null ? `Agregar ${noun}` : "Aplicar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

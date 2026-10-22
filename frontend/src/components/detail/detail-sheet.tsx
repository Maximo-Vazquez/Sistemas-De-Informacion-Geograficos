import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type DetailItem = { label: string; value: ReactNode }
export type DetailSection = { title?: string; items: DetailItem[] }

// Lista de datos etiqueta/valor; se usa en el panel de detalle y en tarjetas de solo lectura.
export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2.5 text-sm">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Detalle de un registro: se abre desde el nombre de la fila. Secciones de datos arriba,
// contenido extra opcional y acciones del registro en el pie (editar → … → destructivas).
export function DetailSheet({
  open,
  onClose,
  title,
  description,
  badges,
  sections,
  children,
  actions,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  badges?: ReactNode
  sections: DetailSection[]
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
          {badges && <div className="flex flex-wrap gap-2 pt-1">{badges}</div>}
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4">
          {sections.map((section, index) => (
            <section key={section.title ?? index} className="flex flex-col gap-3">
              {index > 0 && <Separator />}
              {section.title && <h3 className="text-sm font-medium">{section.title}</h3>}
              <DetailList items={section.items} />
            </section>
          ))}
          {children}
        </div>
        {actions && <SheetFooter className="flex-row flex-wrap border-t">{actions}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

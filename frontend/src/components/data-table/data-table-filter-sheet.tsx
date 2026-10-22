import type { ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export type FilterSection = {
  id: string
  title: string
  // Grupos con valor en el borrador; se muestra junto al título.
  count: number
  // Los filtros rápidos ya están en la barra de escritorio: el panel solo los muestra en móvil.
  quick?: boolean
  content: ReactNode
}

// Panel de filtros: edita un borrador por secciones y aplica todo junto.
// En escritorio es "Más filtros"; en móvil reúne todos los filtros y se abre desde abajo.
export function DataTableFilterSheet({
  title,
  description,
  sections,
  open,
  onOpenChange,
  onApply,
  onClear,
}: {
  title: string
  description: string
  sections: FilterSection[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
  // Recibe los ids visibles: en escritorio no se limpian los filtros rápidos de la barra.
  onClear: (ids: string[]) => void
}) {
  const isMobile = useIsMobile()
  const advanced = sections.filter((section) => !section.quick)
  const shown = isMobile ? sections : advanced
  const pending = shown.filter((section) => section.count > 0).length
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "gap-0 p-0",
          isMobile ? "max-h-[88dvh] rounded-t-2xl" : "data-[side=right]:sm:max-w-md",
        )}
      >
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <Accordion
            multiple
            defaultValue={[
              ...new Set([shown[0]?.id, ...shown.filter((s) => s.count > 0).map((s) => s.id)]),
            ].filter(Boolean)}
          >
            {shown.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    {section.title}
                    {section.count > 0 && <Badge variant="secondary">{section.count}</Badge>}
                  </span>
                </AccordionTrigger>
                <AccordionContent>{section.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <SheetFooter className="flex-row border-t">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onClear(shown.map((section) => section.id))}
          >
            Limpiar
          </Button>
          <Button className="flex-1" onClick={onApply}>
            Aplicar filtros{pending > 0 && ` (${pending})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Botón que abre el panel. `count` = grupos avanzados aplicados; `mobileCount` = todos.
export function DataTableFilterTrigger({
  count,
  mobileCount,
  hasAdvanced,
  onClick,
}: {
  count: number
  mobileCount: number
  hasAdvanced: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={mobileCount ? "secondary" : "outline"}
      className={cn(!hasAdvanced && "md:hidden")}
      onClick={onClick}
    >
      <SlidersHorizontal data-icon="inline-start" />
      <span className="md:hidden">Filtros</span>
      <span className="hidden md:inline">Más filtros</span>
      {mobileCount > 0 && <Badge className="md:hidden">{mobileCount}</Badge>}
      {count > 0 && <Badge className="hidden md:inline-flex">{count}</Badge>}
    </Button>
  )
}

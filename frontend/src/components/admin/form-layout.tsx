import { useEffect, useState, type ReactNode } from "react"
import { ChevronDown, CircleAlert, CircleCheck, CircleDashed } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { IconTile } from "./visual"

// Formularios largos: secciones plegables a la izquierda y un
// panel fijo a la derecha con el resumen en vivo y las acciones. En móvil el panel se oculta y
// `mobileBar` queda fijo abajo con lo esencial (progreso y botón principal).
export function FormLayout({
  children,
  aside,
  mobileBar,
}: {
  children: ReactNode
  aside: ReactNode
  mobileBar?: ReactNode
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
      {/* top-18 = barra superior fija del layout (h-14) + 1rem; si no entra en la pantalla,
          el panel scrollea solo y los botones siguen alcanzables. */}
      <aside
        aria-label="Resumen"
        className="hidden flex-col gap-4 lg:sticky lg:top-18 lg:flex lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto"
      >
        {aside}
      </aside>
      {mobileBar && (
        <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
          {mobileBar}
        </div>
      )}
    </div>
  )
}

// Sección plegable. El contenido queda montado aunque esté plegada: los inputs de archivo y
// los valores se envían igual. `summary` resume lo cargado cuando está cerrada; si la sección
// tiene errores (`invalid`) se abre sola y lo indica en el encabezado.
export function FormSection({
  id,
  icon,
  title,
  description,
  summary,
  invalid,
  defaultOpen = true,
  children,
}: {
  id: string
  icon: ReactNode
  title: string
  description?: string
  summary?: ReactNode
  invalid?: boolean
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => {
    if (invalid) setOpen(true)
  }, [invalid])
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-20 rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10",
        invalid && "ring-destructive/40",
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <h2 className="text-base font-medium">
        <CollapsibleTrigger
          className="flex w-full items-center gap-3 rounded-xl p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-describedby={`${id}-resumen`}
        >
          <IconTile size="sm">{icon}</IconTile>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id={`${id}-title`}>{title}</span>
            <span id={`${id}-resumen`} className="truncate text-sm font-normal text-muted-foreground">
              {open ? description : summary ?? description}
            </span>
          </span>
          {invalid && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-normal text-destructive">
              <CircleAlert aria-hidden="true" className="size-4" />
              Revisar
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </CollapsibleTrigger>
        </h2>
        <CollapsibleContent keepMounted className="flex flex-col gap-4 border-t p-4 data-closed:hidden">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

export type ChecklistItem = { label: string; done: boolean; target?: string }

// Lo que falta para completar el formulario. Cada ítem pendiente lleva a su sección.
export function FormChecklist({ items }: { items: ChecklistItem[] }) {
  const done = items.filter((item) => item.done).length
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Para publicar</span>
        <span className="text-muted-foreground tabular-nums">
          {done} de {items.length}
        </span>
      </div>
      <Progress value={(done / Math.max(items.length, 1)) * 100} aria-label="Avance del formulario" />
      <ul className="flex flex-col gap-1.5" aria-label="Pasos para publicar">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-success" />
            ) : (
              <CircleDashed aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            )}
            {item.done || !item.target ? (
              <span className={cn(!item.done && "text-muted-foreground")}>
                {item.label}
                <span className="sr-only">{item.done ? " (listo)" : " (pendiente)"}</span>
              </span>
            ) : (
              <a href={`#${item.target}`} className="text-muted-foreground underline-offset-4 hover:underline">
                {item.label}
                <span className="sr-only"> (pendiente)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { IconTile } from "@/components/admin/visual"
import { Button } from "@/components/ui/button"

// Tarjeta flotante a la derecha del mapa con el contexto de la herramienta activa.
export function PanelFlotante({
  icono,
  titulo,
  descripcion,
  onCerrar,
  acciones,
  children,
}: {
  icono: ReactNode
  titulo: string
  descripcion?: ReactNode
  onCerrar?: () => void
  acciones?: ReactNode
  children?: ReactNode
}) {
  return (
    <section
      aria-label={titulo}
      className="pointer-events-auto flex max-h-full w-full flex-col overflow-hidden rounded-xl border bg-background/95 shadow-lg backdrop-blur-md md:w-[23rem]"
    >
      <header className="flex items-start gap-3 p-3">
        <IconTile size="sm">{icono}</IconTile>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-sm font-medium">{titulo}</h2>
          {descripcion && <div className="text-xs text-muted-foreground">{descripcion}</div>}
        </div>
        {onCerrar && (
          <Button variant="ghost" size="icon-xs" aria-label="Cerrar" onClick={onCerrar}>
            <X />
          </Button>
        )}
      </header>
      {children && <div className="min-h-0 flex-1 overflow-y-auto border-t">{children}</div>}
      {acciones && <footer className="flex justify-end gap-2 border-t p-3">{acciones}</footer>}
    </section>
  )
}

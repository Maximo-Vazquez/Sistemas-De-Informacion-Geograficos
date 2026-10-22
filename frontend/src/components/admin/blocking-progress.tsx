import { useEffect, useState } from "react"
import { CircleCheck, CircleDashed } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Paso de una operación larga. `desde` = segundos aproximados en que empieza (estimado).
export type ProgressStep = { label: string; detail?: string; desde: number }

// Bloquea la pantalla mientras el servidor procesa una operación larga de un solo POST (crear un
// tenant tarda 30–60 s). El servidor no informa el avance, así que los pasos se marcan por tiempo
// transcurrido y la pantalla lo aclara: nunca muestra un éxito que no ocurrió. No se puede cerrar.
export function BlockingProgress({
  open,
  title,
  description,
  steps,
  estimadoSegundos,
}: {
  open: boolean
  title: string
  description?: string
  steps: ProgressStep[]
  estimadoSegundos: number
}) {
  const [segundos, setSegundos] = useState(0)
  useEffect(() => {
    if (!open) return setSegundos(0)
    const inicio = Date.now()
    const timer = window.setInterval(
      () => setSegundos(Math.floor((Date.now() - inicio) / 1000)),
      500,
    )
    return () => window.clearInterval(timer)
  }, [open])
  const actual = steps.reduce((idx, paso, i) => (segundos >= paso.desde ? i : idx), 0)
  // Avance aproximado que nunca llega a 100 % hasta que responde el servidor.
  const avance = Math.min(92, Math.round((segundos / estimadoSegundos) * 92))
  const demorado = segundos > estimadoSegundos
  return (
    <Dialog open={open} onOpenChange={() => {}} disablePointerDismissal>
      <DialogContent showCloseButton={false} className="sm:max-w-md" aria-busy="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Spinner role="presentation" aria-hidden="true" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Progress value={avance} aria-label="Avance estimado" />
          <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {segundos} s transcurridos · suele tardar ~{estimadoSegundos} s
            </span>
          </p>
        </div>
        <ol className="flex flex-col gap-3" aria-label="Pasos del proceso" aria-live="polite">
          {steps.map((paso, i) => {
            const hecho = i < actual
            const enCurso = i === actual
            return (
              <li key={paso.label} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                  {hecho ? (
                    <CircleCheck aria-hidden="true" className="size-4 text-success" />
                  ) : enCurso ? (
                    <Spinner role="presentation" aria-hidden="true" className="size-4 text-primary" />
                  ) : (
                    <CircleDashed aria-hidden="true" className="size-4 text-muted-foreground" />
                  )}
                </span>
                <span className="flex flex-col">
                  <span
                    className={cn(
                      !hecho && !enCurso && "text-muted-foreground",
                      enCurso && "font-medium",
                    )}
                  >
                    {paso.label}
                    <span className="sr-only">
                      {hecho ? " (estimado: listo)" : enCurso ? " (en curso)" : " (pendiente)"}
                    </span>
                  </span>
                  {enCurso && paso.detail && (
                    <span className="text-xs text-muted-foreground">{paso.detail}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {demorado
            ? "Está tardando más de lo habitual. Seguí esperando: la operación continúa en el servidor."
            : "No cierres ni recargues esta página. Los pasos se estiman por tiempo; al terminar vas a ver el resultado."}
        </p>
      </DialogContent>
    </Dialog>
  )
}

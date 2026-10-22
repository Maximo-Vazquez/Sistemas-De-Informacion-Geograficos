import { useState, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type DeleteImpact = { label: string; value: number }

// Confirmación de eliminación con POST real a Django (CSRF y campos extra preservados).
// Muestra el impacto y, si el servidor bloquea la eliminación, el motivo sin permitir confirmar.
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  name,
  action,
  csrf,
  description = "Esta acción es permanente.",
  impact = [],
  blockedReason,
  hiddenFields = {},
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  action: string
  csrf: string
  description?: ReactNode
  impact?: DeleteImpact[]
  blockedReason?: string
  hiddenFields?: Record<string, string>
  children?: ReactNode
}) {
  const [submitting, setSubmitting] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={(value) => !submitting && onOpenChange(value)}>
      <AlertDialogContent>
        <form method="post" action={action} onSubmit={() => setSubmitting(true)}>
          <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
          {Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {name}?</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4 text-sm">
            {impact.length > 0 && (
              <ul className="flex flex-col gap-1">
                {impact.map((item) => (
                  <li key={item.label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{item.label}</span>
                    <strong className="tabular-nums">{item.value.toLocaleString("es-AR")}</strong>
                  </li>
                ))}
              </ul>
            )}
            {blockedReason && (
              <Alert variant="destructive">
                <AlertTitle>No se puede eliminar</AlertTitle>
                <AlertDescription>{blockedReason}</AlertDescription>
              </Alert>
            )}
            {children}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={submitting || !!blockedReason}>
              {submitting && <Spinner />}
              {submitting ? "Eliminando…" : "Confirmar eliminación"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import type { ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type FormErrors = Record<string, string[]>

// Resumen al inicio del formulario cuando el servidor rechazó el envío.
// Los errores de cada campo se muestran además junto al campo con `FieldError`.
export function FormErrorSummary({ errors }: { errors: FormErrors }) {
  if (!Object.keys(errors).length) return null
  return (
    <Alert variant="destructive" role="alert">
      <AlertTitle>Revisá los campos indicados</AlertTitle>
      <AlertDescription>
        {errors.__all__?.join(" ") ||
          "No se guardaron los cambios. Corregí los errores e intentá de nuevo."}
      </AlertDescription>
    </Alert>
  )
}

// Pie común: secundaria a la izquierda del primario, primario siempre "Guardar cambios"
// (o el verbo de la acción) con estado de envío. En móvil ocupan todo el ancho.
export function FormActions({
  cancelHref,
  onCancel,
  submitting,
  submitLabel = "Guardar cambios",
  submittingLabel = "Guardando…",
  disabled,
  extra,
}: {
  cancelHref?: string
  onCancel?: () => void
  submitting: boolean
  submitLabel?: string
  submittingLabel?: string
  disabled?: boolean
  extra?: ReactNode
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      {extra && <div className="sm:mr-auto">{extra}</div>}
      {cancelHref ? (
        <Button variant="outline" nativeButton={false} render={<a href={cancelHref} />}>
          Cancelar
        </Button>
      ) : (
        onCancel && (
          <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>
            Cancelar
          </Button>
        )
      )}
      <Button type="submit" disabled={submitting || disabled}>
        {submitting && <Spinner />}
        {submitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  )
}

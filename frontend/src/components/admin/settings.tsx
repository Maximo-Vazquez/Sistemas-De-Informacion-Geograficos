import { useEffect, useState, type ReactNode } from "react"
import { CircleCheck, CircleMinus, CircleX, Eye, EyeOff, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { IconTile } from "./visual"

// Grupo de una página de Ajustes: título, para qué sirve, estado opcional y sus campos.
export function SettingsSection({
  id,
  title,
  description,
  icon,
  status,
  children,
  footer,
}: {
  id?: string
  title: string
  description?: ReactNode
  icon?: ReactNode
  status?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Card id={id} className="scroll-mt-20">
      <CardHeader className={cn("flex flex-wrap items-start justify-between gap-2", icon ? "flex-col sm:flex-row" : "flex-row")}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && <IconTile>{icon}</IconTile>}
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
        {status}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
      {footer && <div className="border-t px-6 py-4">{footer}</div>}
    </Card>
  )
}

// Estado de una integración ("Configurado", "Falta configurar", "Modo prueba"...).
export function SettingsStatus({
  tone,
  appearance = "default",
  children,
}: {
  tone: "ok" | "warning" | "error" | "neutral"
  appearance?: "default" | "soft"
  children: ReactNode
}) {
  if (appearance === "soft") {
    const Icon = { ok: CircleCheck, warning: TriangleAlert, error: CircleX, neutral: CircleMinus }[tone]
    const variant = tone === "ok" ? "success" : tone === "warning" ? "warning" : tone === "error" ? "destructive" : "secondary"
    return <Badge variant={variant}><Icon aria-hidden="true" data-icon="inline-start" />{children}</Badge>
  }
  const variant = tone === "ok" ? "default" : tone === "error" ? "destructive" : "secondary"
  return <Badge variant={variant}>{children}</Badge>
}

// Credencial o token: oculto por defecto, con botón para mostrarlo.
// No cambia el contrato del servidor: envía el valor con el mismo `name`.
export function SecretField({
  id,
  name,
  label,
  defaultValue,
  description,
  error,
  placeholder,
}: {
  id: string
  name: string
  label: string
  defaultValue?: string
  description?: ReactNode
  error?: string
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}

// Avisa antes de salir con cambios sin guardar. `dirty` lo calcula la página.
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
}

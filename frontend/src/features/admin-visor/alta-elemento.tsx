import { useRef, useState, type FormEvent } from "react"
import type { GeoJSONFeature } from "ol/format/GeoJSON"
import { FormActions, FormErrorSummary, type FormErrors } from "@/components/admin/admin-form"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CAPA_RELEVAMIENTOS, GEOMETRIAS, type BorradorElemento, type TipoGeometria } from "./types"

export function ControlesDibujo({ tipo, onCambiar }: { tipo: TipoGeometria; onCambiar: (tipo: TipoGeometria) => void }) {
  return (
    <div className="grid max-w-full justify-items-center gap-1 rounded-lg border bg-background px-2 py-1 shadow-sm">
      <ToggleGroup
        aria-label="Tipo de geometría"
        value={[tipo]}
        onValueChange={([elegido]) => elegido && onCambiar(elegido as TipoGeometria)}
        spacing={1}
        className="pointer-events-auto flex-wrap justify-center"
      >
        {Object.entries(GEOMETRIAS).map(([valor, geometria]) => (
          <ToggleGroupItem key={valor} value={valor} size="sm">
            {geometria.titulo}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-center text-xs text-muted-foreground" aria-live="polite">
        {GEOMETRIAS[tipo].ayuda}
      </p>
    </div>
  )
}

export function AltaElemento({
  borrador,
  csrf,
  url,
  onCancelar,
  onGuardar,
}: {
  borrador: BorradorElemento
  csrf: string
  url: string
  onCancelar: () => void
  onGuardar: (feature: GeoJSONFeature) => void
}) {
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<FormErrors>({})
  const nombre = useRef<HTMLInputElement>(null)

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    const valores = new FormData(evento.currentTarget)
    setGuardando(true)
    setErrores({})
    try {
      const respuesta = await fetch(url, {
        method: "POST",
        body: valores,
        headers: { Accept: "application/json" },
        redirect: "error",
      })
      if (respuesta.status === 400) {
        const { errores } = await respuesta.json()
        setErrores(errores)
        return
      }
      if (!respuesta.ok) throw new Error()
      onGuardar(await respuesta.json())
    } catch {
      setErrores({ __all__: ["No se pudo confirmar el guardado. Intentá de nuevo."] })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onCancelar()}>
      <DialogContent
        initialFocus={nombre}
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <DialogTitle>Atributos del elemento</DialogTitle>
        <DialogDescription>
          {CAPA_RELEVAMIENTOS.titulo} · {GEOMETRIAS[borrador.tipo].titulo}
        </DialogDescription>
        <form method="post" action={url} onSubmit={guardar} noValidate className="grid gap-4">
          <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
          <input type="hidden" name="solicitud" value={borrador.solicitud} />
          <input type="hidden" name="geometria" value={borrador.geometria} />
          <FormErrorSummary errors={errores} />
          <FieldError>{errores.geometria?.join(" ") || errores.solicitud?.join(" ")}</FieldError>
          <FieldGroup>
            <Field data-invalid={!!errores.nombre}>
              <FieldLabel htmlFor="nombre-elemento">Nombre</FieldLabel>
              <Input
                id="nombre-elemento"
                name="nombre"
                ref={nombre}
                maxLength={120}
                required
                readOnly={guardando}
                aria-invalid={!!errores.nombre}
                aria-describedby={errores.nombre ? "nombre-elemento-error" : undefined}
              />
              <FieldError id="nombre-elemento-error">{errores.nombre?.join(" ")}</FieldError>
            </Field>
            <Field data-invalid={!!errores.descripcion}>
              <FieldLabel htmlFor="descripcion-elemento">Descripción (opcional)</FieldLabel>
              <Textarea
                id="descripcion-elemento"
                name="descripcion"
                maxLength={1000}
                readOnly={guardando}
                aria-invalid={!!errores.descripcion}
                aria-describedby={errores.descripcion ? "descripcion-elemento-error" : undefined}
              />
              <FieldError id="descripcion-elemento-error">{errores.descripcion?.join(" ")}</FieldError>
            </Field>
          </FieldGroup>
          <FormActions onCancel={onCancelar} submitting={guardando} submitLabel="Guardar elemento" />
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from "react"
import type { Geometry } from "ol/geom"
import { CircleAlert, MapPin, MapPinPlus, Pentagon, Spline } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { describirCapa, insertarElemento } from "../ogc"
import type { CampoCapa, CapaWms, EsquemaCapa, TipoGeometria } from "../types"
import { PanelFlotante } from "./panel-flotante"

const GEOMETRIAS: { id: TipoGeometria; etiqueta: string; icono: typeof MapPin; ayuda: string }[] = [
  { id: "Point", etiqueta: "Punto", icono: MapPin, ayuda: "Hacé clic donde va el punto." },
  { id: "LineString", etiqueta: "Línea", icono: Spline, ayuda: "Clic en cada vértice, doble clic para terminar." },
  { id: "Polygon", etiqueta: "Polígono", icono: Pentagon, ayuda: "Clic en cada vértice, doble clic para cerrar." },
]

const hoy = () => new Date().toISOString().slice(0, 10)
const NOMBRES: Record<string, string> = { categoria: "Categoría", descripcion: "Descripción" }
const etiqueta = (campo: CampoCapa) =>
  NOMBRES[campo.nombre] ?? campo.nombre.charAt(0).toUpperCase() + campo.nombre.slice(1).replaceAll("_", " ")

function Campo({ campo, valor, error, onCambiar }: {
  campo: CampoCapa
  valor: string
  error?: string
  onCambiar: (valor: string) => void
}) {
  const id = `campo-${campo.nombre}`
  const comunes = {
    id,
    name: campo.nombre,
    value: valor,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
  }
  const largo = campo.tipo === "texto" && /descrip|observ|coment/.test(campo.nombre)
  const tipoInput = { fecha: "date", entero: "number", numero: "number", booleano: "text", texto: "text" }[campo.tipo]
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {etiqueta(campo)}
        {campo.obligatorio && <span aria-hidden="true">*</span>}
      </FieldLabel>
      {largo ? (
        <Textarea {...comunes} rows={3} onChange={(evento) => onCambiar(evento.target.value)} />
      ) : (
        <Input
          {...comunes}
          type={tipoInput}
          step={campo.tipo === "entero" ? 1 : campo.tipo === "numero" ? "any" : undefined}
          onChange={(evento) => onCambiar(evento.target.value)}
        />
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}

type Props = {
  capas: CapaWms[]
  capa: string
  onCapa: (capa: string) => void
  tipo: TipoGeometria
  onTipo: (tipo: TipoGeometria) => void
  geometria: Geometry | null
  onDescartar: () => void
  onGuardado: (capa: string) => void
  wfsUrl: string
  transaccionUrl: string
  csrf: string
}

// Carga de un elemento nuevo en 3 pasos: capa y tipo de geometría → dibujo → atributos.
// Los campos salen del DescribeFeatureType de la capa; se guarda por WFS-T.
export function PanelAgregar(props: Props) {
  const { capas, capa, onCapa, tipo, onTipo, geometria, onDescartar, onGuardado } = props
  const [esquema, setEsquema] = useState<EsquemaCapa | null>(null)
  const [errorEsquema, setErrorEsquema] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!capa) return
    const control = new AbortController()
    setEsquema(null)
    setErrorEsquema(null)
    describirCapa(props.wfsUrl, capa, control.signal)
      .then((resultado) => {
        setEsquema(resultado)
        setValores(Object.fromEntries(resultado.campos.filter((c) => c.tipo === "fecha").map((c) => [c.nombre, hoy()])))
      })
      .catch(() => !control.signal.aborted && setErrorEsquema("No se pudieron leer los campos de la capa."))
    return () => control.abort()
  }, [capa, props.wfsUrl])

  if (capas.length === 0) {
    return (
      <PanelFlotante icono={<MapPinPlus />} titulo="Agregar elemento">
        <p className="p-4 text-sm text-muted-foreground">No hay capas editables publicadas en GeoServer.</p>
      </PanelFlotante>
    )
  }

  const guardar = async () => {
    if (!esquema || !geometria) return
    const faltan = Object.fromEntries(
      esquema.campos.filter((c) => c.obligatorio && !valores[c.nombre]?.trim()).map((c) => [c.nombre, "Completá este campo."]),
    )
    setErrores(faltan)
    if (Object.keys(faltan).length > 0) return
    setGuardando(true)
    try {
      await insertarElemento(props.transaccionUrl, props.csrf, esquema, geometria, valores)
      toast.success(`Elemento guardado en ${capas.find((c) => c.nombre === capa)?.titulo ?? capa}.`)
      setValores(Object.fromEntries(esquema.campos.filter((c) => c.tipo === "fecha").map((c) => [c.nombre, hoy()])))
      onGuardado(capa)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el elemento.")
    } finally {
      setGuardando(false)
    }
  }

  const ayuda = GEOMETRIAS.find((g) => g.id === tipo)?.ayuda
  return (
    <PanelFlotante
      icono={<MapPinPlus />}
      titulo="Agregar elemento"
      descripcion={geometria ? "Podés mover los vértices antes de guardar." : ayuda}
      acciones={
        geometria && (
          <>
            <Button variant="outline" size="sm" onClick={onDescartar} disabled={guardando}>
              Descartar
            </Button>
            <Button size="sm" onClick={guardar} disabled={guardando || !esquema}>
              {guardando ? "Guardando…" : "Guardar elemento"}
            </Button>
          </>
        )
      }
    >
      <form className="flex flex-col gap-4 p-3" noValidate onSubmit={(evento) => (evento.preventDefault(), guardar())}>
        <FieldGroup className="gap-3">
          {capas.length > 1 && (
            <Field>
              <FieldLabel htmlFor="capa-editable">Capa</FieldLabel>
              <NativeSelect id="capa-editable" value={capa} onChange={(evento) => onCapa(evento.target.value)}>
                {capas.map((c) => (
                  <NativeSelectOption key={c.nombre} value={c.nombre}>
                    {c.titulo}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}
          <Field>
            <FieldLabel>Geometría</FieldLabel>
            <ToggleGroup
              variant="outline"
              spacing={0}
              className="w-full"
              value={[tipo]}
              onValueChange={(valor) => valor[0] && onTipo(valor[0] as TipoGeometria)}
            >
              {GEOMETRIAS.map(({ id, etiqueta: texto, icono: Icono }) => (
                <ToggleGroupItem key={id} value={id} className="flex-1" size="sm">
                  <Icono /> {texto}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>
        {!geometria && (
          <div className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
            Dibujá el elemento en el mapa para cargar sus datos.
          </div>
        )}
        {geometria && errorEsquema && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{errorEsquema}</AlertDescription>
          </Alert>
        )}
        {geometria && !esquema && !errorEsquema && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Leyendo campos…
          </div>
        )}
        {geometria && esquema && (
          <FieldGroup className="gap-3">
            {esquema.campos.map((campo) => (
              <Campo
                key={campo.nombre}
                campo={campo}
                valor={valores[campo.nombre] ?? ""}
                error={errores[campo.nombre]}
                onCambiar={(valor) => setValores((actuales) => ({ ...actuales, [campo.nombre]: valor }))}
              />
            ))}
          </FieldGroup>
        )}
        <button type="submit" hidden />
      </form>
    </PanelFlotante>
  )
}

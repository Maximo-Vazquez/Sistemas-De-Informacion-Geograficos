import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react"
import { Expand, FileText, ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

// `url` es opcional para archivos no visuales (certificados, claves): solo se muestra el nombre.
export type ExistingMedia = { id: string; url?: string; label?: string }

type Item = {
  key: string
  url: string
  name: string
  kind: "image" | "video" | "file"
  size?: number
  existing?: ExistingMedia
}

const VIDEO = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i
const kindOf = (url: string, type?: string): Item["kind"] =>
  type?.startsWith("video/") || (!type && VIDEO.test(url)) ? "video" : "image"
const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("es-AR")} KB`
    : `${(bytes / 1024 / 1024).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`
const fileName = (url: string) =>
  decodeURIComponent(url.split("?")[0].split("/").pop() || "Archivo")

function matchesAccept(file: File, accept: string) {
  return accept.split(",").some((rule) => {
    const pattern = rule.trim().toLowerCase()
    if (!pattern) return false
    if (pattern === "*" || pattern === "*/*") return true
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern)
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1))
    return file.type === pattern
  })
}

// Carga de imágenes/videos (o archivos genéricos con `preview={false}`) para formularios multipart.
// - Arrastrar y soltar o elegir; vista previa en cuadrícula y ampliada en un diálogo.
// - Envía un `<input type="file" name>` real (sincronizado con DataTransfer): mismo contrato POST.
// - Archivos existentes: en modo simple, uno nuevo los reemplaza; quitarlos envía `removeName=on`.
//   En modo múltiple, cada existente quitado envía `removeName=<id>`.
export function MediaUpload({
  id,
  name,
  label,
  description,
  accept = "image/*",
  multiple = false,
  maxSizeMb = 10,
  maxFiles,
  existing = [],
  removeName,
  aspect = "video",
  preview: showPreview = true,
  onChange,
  error,
}: {
  id?: string
  name: string
  label: string
  description?: ReactNode
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  maxFiles?: number
  existing?: ExistingMedia[]
  removeName?: string
  aspect?: "video" | "square"
  // false: archivos no visuales (.key, .crt, .pdf…); se listan con nombre y tamaño, sin vista previa.
  preview?: boolean
  // Aviso de cambio (p. ej. para `useUnsavedChanges`).
  onChange?: () => void
  error?: string
}) {
  const autoId = useId()
  const inputId = id ?? `${autoId}-input`
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<Item | null>(null)

  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls])

  // El input real es la fuente de lo que se envía: se sincroniza con la selección visible.
  useEffect(() => {
    if (!input.current) return
    const transfer = new DataTransfer()
    files.forEach((file) => transfer.items.add(file))
    input.current.files = transfer.files
  }, [files])

  const add = (incoming: File[]) => {
    const errors: string[] = []
    const valid = incoming.filter((file) => {
      if (!matchesAccept(file, accept)) {
        errors.push(`${file.name}: formato no admitido.`)
        return false
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        errors.push(`${file.name}: supera ${maxSizeMb} MB.`)
        return false
      }
      return true
    })
    let next = multiple ? [...files, ...valid] : valid.slice(-1)
    const kept = existing.filter((item) => !removed.includes(item.id)).length
    if (multiple && maxFiles && kept + next.length > maxFiles) {
      errors.push(`Podés tener hasta ${maxFiles} archivos.`)
      next = next.slice(0, Math.max(0, maxFiles - kept))
    }
    setProblems(errors)
    setFiles(next)
    onChange?.()
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    add(Array.from(event.dataTransfer.files))
  }

  const replacing = !multiple && files.length > 0
  const items: Item[] = [
    ...existing.map((item) => ({
      key: `existing-${item.id}`,
      url: item.url ?? "",
      name: item.label ?? fileName(item.url ?? ""),
      kind: showPreview && item.url ? kindOf(item.url) : ("file" as const),
      existing: item,
    })),
    ...files.map((file, index) => ({
      key: `new-${index}-${file.name}`,
      url: urls[index],
      name: file.name,
      kind: showPreview ? kindOf(file.name, file.type) : ("file" as const),
      size: file.size,
    })),
  ]
  const hint = !showPreview
    ? "archivos"
    : accept.includes("video")
      ? "imágenes o videos"
      : "imágenes"
  const errorText = [error, ...problems].filter(Boolean).join(" ")

  return (
    <Field data-invalid={!!errorText || undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors",
          "hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
          dragging && "border-primary bg-primary/5",
          errorText && "border-destructive",
        )}
      >
        {showPreview ? (
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        ) : (
          <Upload className="size-6 text-muted-foreground" aria-hidden />
        )}
        <span>
          <span className="font-medium">Arrastrá {multiple ? hint : `un archivo`} acá</span> o{" "}
          <span className="text-primary underline underline-offset-4">elegí desde tu equipo</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {multiple ? "Podés agregar varios. " : ""}Hasta {maxSizeMb} MB
          {multiple && maxFiles ? ` · máximo ${maxFiles}` : ""}.
        </span>
        <input
          ref={input}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          aria-invalid={!!errorText || undefined}
          onChange={(event) => {
            const chosen = Array.from(event.target.files ?? [])
            // El cambio nativo reemplaza la lista; se combina con la selección previa.
            if (chosen.length) add(chosen)
          }}
        />
      </label>
      {description && <FieldDescription>{description}</FieldDescription>}
      {errorText && <FieldError>{errorText}</FieldError>}

      {items.length > 0 && (
        <ul
          aria-label={`Archivos de ${label}`}
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "sm:max-w-xs",
          )}
        >
          {items.map((item) => {
            const isRemoved = !!item.existing && removed.includes(item.existing.id)
            const isReplaced = !!item.existing && replacing
            const fadeOut = isRemoved || isReplaced
            return (
              <li key={item.key} className="flex flex-col gap-1.5">
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-lg border bg-muted",
                    item.kind === "file"
                      ? "flex h-20 items-center justify-center"
                      : aspect === "square"
                        ? "aspect-square"
                        : "aspect-video",
                  )}
                >
                  {item.kind === "file" ? (
                    <FileText
                      aria-hidden
                      className={cn("size-8 text-muted-foreground", fadeOut && "opacity-40")}
                    />
                  ) : item.kind === "video" ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className={cn("size-full object-cover", fadeOut && "opacity-40")}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className={cn("size-full object-cover", fadeOut && "opacity-40 grayscale")}
                    />
                  )}
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    {!item.existing && <Badge>Nuevo</Badge>}
                    {isRemoved && <Badge variant="destructive">Se eliminará</Badge>}
                    {isReplaced && !isRemoved && <Badge variant="secondary">Se reemplaza</Badge>}
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex gap-1">
                    {item.kind !== "file" && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`Ver ${item.name}`}
                        onClick={() => setPreview(item)}
                      >
                        <Expand />
                      </Button>
                    )}
                    {item.existing ? (
                      (multiple || removeName) &&
                      (isRemoved ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="secondary"
                          aria-label={`Conservar ${item.name}`}
                          onClick={() =>
                            setRemoved((old) => old.filter((id) => id !== item.existing!.id))
                          }
                        >
                          <RotateCcw />
                        </Button>
                      ) : (
                        removeName && (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="secondary"
                            aria-label={`Quitar ${item.name}`}
                            onClick={() => setRemoved((old) => [...old, item.existing!.id])}
                          >
                            <Trash2 />
                          </Button>
                        )
                      ))
                    ) : (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`Quitar ${item.name}`}
                        onClick={() =>
                          setFiles((old) =>
                            old.filter((_, i) => `new-${i}-${old[i].name}` !== item.key),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="truncate text-xs text-muted-foreground" title={item.name}>
                  {item.name}
                  {item.size !== undefined && ` · ${sizeLabel(item.size)}`}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {removeName &&
        existing
          .filter((item) => removed.includes(item.id))
          .map((item) => (
            <input
              key={item.id}
              type="hidden"
              name={removeName}
              value={multiple ? item.id : "on"}
            />
          ))}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
            <DialogDescription>
              {preview?.existing ? "Archivo guardado" : "Archivo nuevo, se sube al guardar"}
              {preview?.size !== undefined && ` · ${sizeLabel(preview.size)}`}
            </DialogDescription>
          </DialogHeader>
          {preview &&
            (preview.kind === "video" ? (
              <video
                src={preview.url}
                controls
                className="max-h-[70dvh] w-full rounded-lg bg-muted"
              />
            ) : (
              <img
                src={preview.url}
                alt={preview.name}
                className="max-h-[70dvh] w-full rounded-lg bg-muted object-contain"
              />
            ))}
        </DialogContent>
      </Dialog>
    </Field>
  )
}

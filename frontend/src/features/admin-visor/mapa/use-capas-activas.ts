import { useCallback, useMemo, useState } from "react"
import type { CapaWms } from "../types"

// Capas en el mapa, de arriba hacia abajo (el orden de la lista es el orden de dibujo).
// Una capa puede estar en el mapa pero oculta (ojo) sin perder su lugar ni su opacidad.
export function useCapasActivas(capas: CapaWms[]) {
  const [activas, setActivas] = useState<string[]>([])
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set())
  const [opacidades, setOpacidades] = useState<Record<string, number>>({})
  const porNombre = useMemo(() => new Map(capas.map((capa) => [capa.nombre, capa])), [capas])

  const reemplazar = useCallback(
    (nombres: string[]) => {
      setActivas(nombres.filter((nombre) => porNombre.has(nombre)))
      setOcultas(new Set())
    },
    [porNombre],
  )

  // Una capa nueva entra según su grupo: los puntos quedan sobre las líneas y estas sobre las superficies.
  const agregar = useCallback(
    (nombre: string) =>
      setActivas((actual) => {
        const capa = porNombre.get(nombre)
        if (!capa || actual.includes(nombre)) return actual
        const lugar = actual.findIndex((otra) => (porNombre.get(otra)?.orden ?? 0) <= capa.orden)
        return lugar === -1 ? [...actual, nombre] : [...actual.slice(0, lugar), nombre, ...actual.slice(lugar)]
      }),
    [porNombre],
  )

  const quitar = useCallback((nombre: string) => setActivas((actual) => actual.filter((otra) => otra !== nombre)), [])

  const alternarVisible = useCallback(
    (nombre: string) =>
      setOcultas((actual) => {
        const siguiente = new Set(actual)
        if (!siguiente.delete(nombre)) siguiente.add(nombre)
        return siguiente
      }),
    [],
  )

  const mover = useCallback(
    (desde: string, hacia: string) =>
      setActivas((actual) => {
        const origen = actual.indexOf(desde)
        const destino = actual.indexOf(hacia)
        if (origen < 0 || destino < 0) return actual
        const siguiente = [...actual]
        siguiente.splice(destino, 0, ...siguiente.splice(origen, 1))
        return siguiente
      }),
    [],
  )

  const cambiarOpacidad = useCallback(
    (nombre: string, opacidad: number) => setOpacidades((actual) => ({ ...actual, [nombre]: opacidad })),
    [],
  )

  // Para consultar: las visibles de abajo hacia arriba, como las espera ogc.ts.
  const visibles = useMemo(
    () => activas.filter((nombre) => !ocultas.has(nombre)).map((nombre) => porNombre.get(nombre)!).reverse(),
    [activas, ocultas, porNombre],
  )

  return { activas, ocultas, opacidades, visibles, reemplazar, agregar, quitar, alternarVisible, mover, cambiarOpacidad }
}

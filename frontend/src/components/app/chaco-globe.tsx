import { useMemo } from "react"
import type { COBEOptions } from "cobe"
import { useTheme } from "next-themes"
import { Globe } from "@/components/ui/globe"
import { cn } from "@/lib/utils"

type Marcador = { lat: number; lon: number; size: number }

// Resistencia y la traza de la RN 11 en el Chaco (aprox.), destacadas sobre el globo.
const MARCADORES: Marcador[] = [
  { lat: -27.46, lon: -58.98, size: 0.09 },
  { lat: -26.79, lon: -59.06, size: 0.04 },
  { lat: -26.18, lon: -58.77, size: 0.04 },
]

// Ángulos de cobe que dejan una coordenada de frente (fórmula de la documentación de cobe).
function anguloDe(lat: number, lon: number): [number, number] {
  return [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

function configuracion(oscuro: boolean): COBEOptions {
  const [phi, theta] = anguloDe(-27.46, -58.98)
  // cobe recibe colores como RGB de 0 a 1 (check-colores: dato de WebGL, no estilos CSS).
  return {
    width: 800,
    height: 800,
    onRender: () => {},
    devicePixelRatio: 2,
    phi,
    theta: theta * 0.6,
    dark: oscuro ? 1 : 0,
    diffuse: oscuro ? 1.2 : 0.4,
    mapSamples: 16000,
    mapBrightness: oscuro ? 4 : 1.2,
    baseColor: oscuro ? [0.3, 0.3, 0.32] : [1, 1, 1],
    markerColor: [0.12, 0.31, 0.82],
    glowColor: oscuro ? [0.2, 0.2, 0.24] : [1, 1, 1],
    markers: MARCADORES.map(({ lat, lon, size }) => ({ location: [lat, lon], size })),
  }
}

// Globo interactivo que gira y se puede arrastrar; arranca mostrando el Chaco.
export function ChacoGlobe({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme()
  const config = useMemo(() => configuracion(resolvedTheme === "dark"), [resolvedTheme])
  return (
    <div className={cn("relative aspect-square w-full", className)} aria-hidden="true">
      <Globe config={config} className="max-w-none" />
    </div>
  )
}

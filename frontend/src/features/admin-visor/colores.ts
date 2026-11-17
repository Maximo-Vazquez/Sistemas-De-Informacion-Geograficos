import type { Color } from "ol/color"

// OpenLayers dibuja en canvas y necesita colores concretos. Se leen de los tokens de
// index.css (la fuente de verdad del color) y se convierten a RGBA pasando por un canvas,
// que normaliza cualquier formato CSS (oklch incluido).
export function colorDeToken(token: string, opacidad = 1): Color {
  const sonda = document.createElement("span")
  sonda.style.color = `var(--${token})`
  sonda.style.display = "none"
  document.body.append(sonda)
  const css = getComputedStyle(sonda).color
  sonda.remove()
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = 1
  const contexto = lienzo.getContext("2d", { willReadFrequently: true })
  if (!contexto) return [0, 0, 0, opacidad]
  contexto.fillStyle = css
  contexto.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = contexto.getImageData(0, 0, 1, 1).data
  return [r, g, b, (a / 255) * opacidad]
}

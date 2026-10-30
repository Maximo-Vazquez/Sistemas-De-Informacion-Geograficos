import type { FeatureLike } from "ol/Feature"
import { LineString, Point } from "ol/geom"
import { Circle, Fill, RegularShape, Stroke, Style, Text } from "ol/style"
import { tokenColor } from "@/lib/map-theme"

// Estilos de las capas propias del visor (resaltado, medición y dibujo). Los colores salen de
// los tokens del tema: marca para lo consultado, ámbar para medir y verde para crear.

function estiloGeneral(token: string, ancho: number, relleno: number, dash?: number[]) {
  return new Style({
    stroke: new Stroke({ color: tokenColor(token), width: ancho, lineDash: dash }),
    fill: new Fill({ color: tokenColor(token, relleno) }),
    image: new Circle({
      radius: ancho + 3,
      fill: new Fill({ color: tokenColor(token) }),
      stroke: new Stroke({ color: tokenColor("background"), width: 2 }),
    }),
  })
}

const halo = () =>
  new Style({
    stroke: new Stroke({ color: tokenColor("background", 0.9), width: 7 }),
    image: new Circle({ radius: 10, fill: new Fill({ color: tokenColor("background", 0.9) }) }),
  })

export function estiloResaltado(feature: FeatureLike) {
  if (feature.get("rectangulo")) return estiloGeneral("primary", 1.5, 0.06, [6, 4])
  if (feature.get("seleccionado")) return [halo(), estiloGeneral("primary", 3.5, 0.25)]
  return estiloGeneral("primary", 2, 0.12)
}

// Cada medición terminada muestra su distancia junto al último vértice.
export function estiloMedicion(feature: FeatureLike) {
  const estilos = [halo(), estiloGeneral("warning", 2.5, 0.1, [10, 6])]
  const etiqueta = feature.get("etiqueta")
  if (etiqueta) {
    estilos.push(
      new Style({
        geometry: (elemento) => {
          const linea = elemento.getGeometry()
          return linea instanceof LineString ? new Point(linea.getLastCoordinate()) : undefined
        },
        text: new Text({
          text: etiqueta,
          offsetY: -16,
          font: "600 12px 'Inter Variable', sans-serif",
          fill: new Fill({ color: tokenColor("foreground") }),
          backgroundFill: new Fill({ color: tokenColor("background", 0.92) }),
          backgroundStroke: new Stroke({ color: tokenColor("warning"), width: 1 }),
          padding: [3, 6, 3, 6],
        }),
      }),
    )
  }
  return estilos
}

export function estiloDibujo() {
  return [halo(), estiloGeneral("success", 2.5, 0.2)]
}

// Puntero mientras se dibuja o se mide.
export function estiloPuntero(token: string) {
  return () =>
    new Style({
      image: new RegularShape({
        points: 4,
        radius: 9,
        radius2: 0,
        angle: Math.PI / 4,
        stroke: new Stroke({ color: tokenColor(token), width: 2 }),
      }),
      stroke: new Stroke({ color: tokenColor(token), width: 2, lineDash: [6, 4] }),
      fill: new Fill({ color: tokenColor(token, 0.15) }),
    })
}

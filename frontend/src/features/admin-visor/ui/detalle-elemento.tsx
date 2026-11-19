import { getCenter } from "ol/extent"
import { toLonLat } from "ol/proj"
import { DetailSheet } from "@/components/detail/detail-sheet"
import { Badge } from "@/components/ui/badge"
import { atributos, nombreElemento } from "../catalogo"
import type { ElementoConCapa } from "./globo-consulta"

const coordenada = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 5, maximumFractionDigits: 5 })

// Todos los datos de un elemento, con el mismo panel de detalle que el resto de Administración.
export function DetalleElemento({ elemento, onCerrar }: { elemento: ElementoConCapa | null; onCerrar: () => void }) {
  if (!elemento) return <DetailSheet open={false} onClose={onCerrar} title="" sections={[]} />
  const propiedades = elemento.feature.getProperties()
  const geometria = elemento.feature.getGeometry()
  const centro = geometria ? toLonLat(getCenter(geometria.getExtent())) : null
  const datos = atributos(propiedades)
  return (
    <DetailSheet
      open
      onClose={onCerrar}
      title={nombreElemento(propiedades, elemento.id)}
      description={elemento.capaWms.titulo}
      badges={
        <>
          <Badge variant="secondary">{elemento.capaWms.grupo}</Badge>
          {geometria && <Badge variant="outline">{geometria.getType().replace("Multi", "")}</Badge>}
        </>
      }
      sections={[
        {
          title: "Atributos",
          items: datos.length
            ? datos.map((dato) => ({ label: dato.etiqueta, value: dato.valor }))
            : [{ label: "Atributos", value: "Sin datos cargados" }],
        },
        ...(centro
          ? [
              {
                title: "Ubicación",
                items: [
                  { label: "Latitud", value: `${coordenada.format(centro[1])}°` },
                  { label: "Longitud", value: `${coordenada.format(centro[0])}°` },
                  { label: "Identificador", value: <code className="text-xs">{elemento.id}</code> },
                ],
              },
            ]
          : []),
      ]}
    />
  )
}

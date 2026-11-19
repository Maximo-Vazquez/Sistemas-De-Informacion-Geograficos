import { CircleAlert, MousePointerClick, SquareDashedMousePointer } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { Consulta } from "../types"
import { PanelFlotante } from "./panel-flotante"

const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`

// Ayuda y estado de la consulta. Los resultados se ven en el globo (punto) o en la tabla (área).
export function EstadoConsulta({ consulta, tipo, capasConsultadas }: {
  consulta: Consulta | null
  tipo: "punto" | "rectangulo"
  capasConsultadas: number
}) {
  const esPunto = tipo === "punto"
  const ayuda = esPunto
    ? `Hacé clic sobre el mapa. Se consultan ${plural(capasConsultadas, "capa visible", "capas visibles")}.`
    : `Arrastrá un rectángulo. Se listan los elementos de ${plural(capasConsultadas, "capa visible", "capas visibles")}.`
  const vacio = consulta?.estado === "listo" && consulta.grupos.length === 0
  return (
    <PanelFlotante icono={esPunto ? <MousePointerClick /> : <SquareDashedMousePointer />} titulo={esPunto ? "Consulta por punto" : "Consulta por área"} descripcion={ayuda}>
      {consulta?.estado === "cargando" && (
        <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <Spinner /> Consultando…
        </div>
      )}
      {(consulta?.estado === "error" || vacio) && (
        <div className="p-3">
          <Alert variant="warning">
            <CircleAlert />
            <AlertDescription>
              {consulta?.estado === "error" ? consulta.mensaje : "No hay elementos ahí. Acercate o sumá otra capa."}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </PanelFlotante>
  )
}

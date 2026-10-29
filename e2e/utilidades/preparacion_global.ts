import { archivoSesion, ejecutarDjango } from "./django"

// Antes de toda la suite: datos conocidos y una sesión iniciada para las pruebas con login.
export default function preparacionGlobal() {
  ejecutarDjango(["reiniciar_e2e"])
  ejecutarDjango(["sesion_e2e", archivoSesion])
}

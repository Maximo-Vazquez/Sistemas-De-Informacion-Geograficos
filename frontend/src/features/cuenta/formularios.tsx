import type { ReactNode } from "react"
import { LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CuentaData } from "./types"

// POST al login de Google de allauth (SOCIALACCOUNT_LOGIN_ON_GET = False).
export function IngresarConGoogle({ data, children = "Ingresar con Google" }: { data: CuentaData; children?: ReactNode }) {
  return (
    <form method="post" action={data.googleUrl} className="w-full">
      <input type="hidden" name="csrfmiddlewaretoken" value={data.csrf} />
      <input type="hidden" name="process" value="login" />
      {data.next && <input type="hidden" name="next" value={data.next} />}
      <Button type="submit" size="lg" className="w-full">
        <LogIn data-icon="inline-start" />
        {children}
      </Button>
    </form>
  )
}

export function CerrarSesion({
  data,
  variant = "default",
  children = "Cerrar sesión",
}: {
  data: CuentaData
  variant?: "default" | "outline-primary"
  children?: ReactNode
}) {
  return (
    <form method="post" action={data.logoutUrl} className="w-full">
      <input type="hidden" name="csrfmiddlewaretoken" value={data.csrf} />
      <Button type="submit" size="lg" variant={variant} className="w-full">
        <LogOut data-icon="inline-start" />
        {children}
      </Button>
    </form>
  )
}

export function VolverAlInicio({ data }: { data: CuentaData }) {
  return (
    <Button variant="ghost" className="w-full" render={<a href={data.homeUrl} />}>
      Volver al inicio
    </Button>
  )
}

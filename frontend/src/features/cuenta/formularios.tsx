import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { GoogleLoginButton } from "@/components/app/google-login-button"
import { Button } from "@/components/ui/button"
import type { CuentaData } from "./types"

export function IngresarConGoogle({ data, label }: { data: CuentaData; label?: string }) {
  return <GoogleLoginButton action={data.googleUrl} csrf={data.csrf} next={data.next} label={label} className="w-full" />
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

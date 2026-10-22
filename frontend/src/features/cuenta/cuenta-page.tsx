import type { ReactNode } from "react"
import { CircleAlert, LockKeyhole, LogIn, LogOut } from "lucide-react"
import { Brand, PublicShell } from "@/components/app/public-shell"
import { IconTile } from "@/components/admin/visual"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDjangoMessages } from "@/lib/use-django-messages"
import { CerrarSesion, IngresarConGoogle, VolverAlInicio } from "./formularios"
import type { CuentaData, PantallaCuenta } from "./types"

type Contenido = { icon: ReactNode; titulo: string; descripcion: ReactNode; cuerpo?: ReactNode; acciones: ReactNode }

function contenidoLogin(data: CuentaData): Contenido {
  return {
    icon: <LogIn />,
    titulo: `Ingresar a ${data.brandName}`,
    descripcion: "Usá tu cuenta de Google para entrar a Administración.",
    acciones: (
      <>
        <IngresarConGoogle data={data} />
        <VolverAlInicio data={data} />
      </>
    ),
  }
}

function contenidoLogout(data: CuentaData): Contenido {
  return {
    icon: <LogOut />,
    titulo: "¿Cerrar sesión?",
    descripcion: data.email ? `Vas a salir de la cuenta ${data.email}.` : "Vas a salir de tu cuenta.",
    acciones: (
      <>
        <CerrarSesion data={data} />
        <VolverAlInicio data={data} />
      </>
    ),
  }
}

function contenidoError(data: CuentaData): Contenido {
  return {
    icon: <CircleAlert />,
    titulo: "No se pudo ingresar",
    descripcion: "Google no completó el inicio de sesión.",
    cuerpo: (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Ingreso interrumpido</AlertTitle>
        <AlertDescription>Probá de nuevo. Si el problema sigue, avisá al equipo.</AlertDescription>
      </Alert>
    ),
    acciones: (
      <>
        <IngresarConGoogle data={data}>Intentar de nuevo</IngresarConGoogle>
        <VolverAlInicio data={data} />
      </>
    ),
  }
}

function contenidoSinPermiso(data: CuentaData): Contenido {
  return {
    icon: <LockKeyhole />,
    titulo: "Sin acceso",
    descripcion: "No tenés permiso para ver esta página.",
    acciones: <VolverAlInicio data={data} />,
  }
}

const PANTALLAS: Record<PantallaCuenta, (data: CuentaData) => Contenido> = {
  login: contenidoLogin,
  logout: contenidoLogout,
  error: contenidoError,
  "sin-permiso": contenidoSinPermiso,
}

export function CuentaPage({ data }: { data: CuentaData }) {
  useDjangoMessages(data.messages)
  const contenido = PANTALLAS[data.pantalla](data)
  return (
    <PublicShell brand={<Brand name={data.brandName} logoUrl={data.logoUrl} href={data.homeUrl} />}>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-start gap-3">
            <IconTile>{contenido.icon}</IconTile>
            <CardTitle className="text-xl">{contenido.titulo}</CardTitle>
            <CardDescription>{contenido.descripcion}</CardDescription>
          </CardHeader>
          {contenido.cuerpo && <CardContent>{contenido.cuerpo}</CardContent>}
          <CardFooter className="flex flex-col gap-2">{contenido.acciones}</CardFooter>
        </Card>
      </div>
    </PublicShell>
  )
}

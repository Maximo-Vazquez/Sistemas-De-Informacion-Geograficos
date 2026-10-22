import { LayoutDashboard, LogIn, MapPinned } from "lucide-react"
import { ChacoGlobe } from "@/components/app/chaco-globe"
import { Brand, PublicShell } from "@/components/app/public-shell"
import { IconTile, StatusIndicator } from "@/components/admin/visual"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ESTADO_CONSIGNA, type InicioData } from "./types"

function AccionPrincipal({ data }: { data: InicioData }) {
  if (data.usuario) {
    return (
      <Button size="lg" render={<a href={data.adminUrl} />}>
        <LayoutDashboard data-icon="inline-start" />
        Ir a Administración
      </Button>
    )
  }
  return (
    <form method="post" action={data.loginUrl}>
      <input type="hidden" name="csrfmiddlewaretoken" value={data.csrf} />
      <input type="hidden" name="process" value="login" />
      <Button size="lg" type="submit">
        <LogIn data-icon="inline-start" />
        Ingresar con Google
      </Button>
    </form>
  )
}

function Consignas({ data }: { data: InicioData }) {
  return (
    <section id="consignas" aria-labelledby="consignas-titulo" className="flex flex-col gap-4">
      <div>
        <h2 id="consignas-titulo" className="text-xl font-semibold tracking-tight">Consignas del trabajo</h2>
        <p className="text-sm text-muted-foreground">Avance de cada punto del Trabajo Práctico Integrador.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.consignas.map((consigna) => {
          const estado = ESTADO_CONSIGNA[consigna.estado]
          return (
            <li key={consigna.id}>
              <Card size="sm" className="h-full">
                <CardHeader>
                  <CardDescription className="uppercase tracking-wide">Punto {consigna.id}</CardDescription>
                  <CardTitle>{consigna.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatusIndicator tone={estado.tone}>{estado.label}</StatusIndicator>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function InicioPage({ data }: { data: InicioData }) {
  return (
    <PublicShell
      brand={<Brand name={data.brandName} logoUrl={data.logoUrl} href={data.homeUrl} />}
      footer="UTN Facultad Regional Resistencia · Sistemas de Información Geográfica · Ciclo 2026"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:py-16">
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="flex flex-col items-start gap-5">
            <IconTile>
              <MapPinned />
            </IconTile>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              Ruta Nacional 11 en el Chaco, capa por capa
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Aplicación del Trabajo Práctico Integrador: capas del SIG IGN 250 servidas por WMS y WFS, un visor web
              para consultarlas y el análisis de la obra sobre la RN 11.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <AccionPrincipal data={data} />
              <Button size="lg" variant="outline-primary" render={<a href="#consignas" />}>
                Ver consignas
              </Button>
            </div>
          </div>
          <ChacoGlobe className="mx-auto max-w-sm lg:max-w-md" />
        </section>
        <Consignas data={data} />
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPinned />
            </EmptyMedia>
            <EmptyTitle>Visor de mapas en preparación</EmptyTitle>
            <EmptyDescription>
              El visor se habilita cuando estén montados PostGIS y el servidor de mapas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </PublicShell>
  )
}

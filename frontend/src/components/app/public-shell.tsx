import type { ReactNode } from "react"
import { ThemeToggle } from "./theme-toggle"

// Marca del sitio: logo y nombre, enlazados al inicio.
export function Brand({ name, logoUrl, href }: { name: string; logoUrl: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-2 rounded-lg font-semibold tracking-tight">
      <img src={logoUrl} alt="" className="size-8 rounded-lg ring-1 ring-border" />
      <span>{name}</span>
    </a>
  )
}

// Estructura de las pantallas públicas (inicio y cuenta): barra superior, contenido y pie.
export function PublicShell({
  brand,
  actions,
  footer,
  children,
}: {
  brand: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          {brand}
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      {footer && (
        <footer className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">{footer}</div>
        </footer>
      )}
    </div>
  )
}

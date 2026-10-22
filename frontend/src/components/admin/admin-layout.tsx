import type { ReactNode } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminSidebar, type AdminSidebarProps } from "./admin-sidebar"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/app/theme-toggle"

export function AdminLayout({
  title,
  adminUrl,
  sidebarOpen,
  contentWidth = "wide",
  children,
  ...sidebarProps
}: AdminSidebarProps & {
  title: string
  adminUrl: string
  sidebarOpen: boolean
  // `editor`: formulario largo con panel lateral (FormLayout).
  contentWidth?: "wide" | "form" | "editor" | "full"
  children: ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={sidebarOpen} className={contentWidth === "full" ? "h-(--alto-visible,100dvh) min-h-0 overflow-hidden" : undefined}>
      <AdminSidebar {...sidebarProps} />
      <SidebarInset className={contentWidth === "full" ? "min-h-0 min-w-0" : undefined}>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger aria-label="Abrir o cerrar navegación" />
          <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb aria-label="Ubicación actual">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href={adminUrl}>Administración</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle className="ml-auto" />
        </header>
        <main
          className={cn(
            "mx-auto flex w-full flex-col",
            contentWidth === "full" ? "min-h-0 flex-1" : "gap-6 p-4 md:p-6",
            contentWidth === "form" ? "max-w-3xl" : contentWidth === "editor" ? "max-w-6xl" : contentWidth === "wide" ? "max-w-[1600px]" : undefined,
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

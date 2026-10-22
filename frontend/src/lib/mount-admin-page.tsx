import { StrictMode, type ComponentType } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

// Monta una pantalla de Administración: lee el `json_script` y aplica tema, tooltips y avisos.
// Si falta el contenedor o los datos, no hace nada (la plantilla Django decide qué se monta).
export function mountAdminPage<T>(
  rootId: string,
  dataId: string,
  Page: ComponentType<{ data: T }>,
) {
  const root = document.getElementById(rootId)
  const payload = document.getElementById(dataId)
  if (!root || !payload?.textContent) return
  const data = JSON.parse(payload.textContent) as T
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" storageKey="visor-sig-theme">
        <TooltipProvider>
          <Page data={data} />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}

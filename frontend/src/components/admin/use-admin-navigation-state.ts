import { useCallback, useLayoutEffect, useRef, useState, type UIEvent } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import type { AdminNavSection } from "./types"

export type ExpandedGroups = Record<string, boolean>

function readScroll(key: string) {
  try {
    const value = Number(sessionStorage.getItem(key))
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch { return 0 }
}

// Estado de navegación por usuario y pestaña, compartido por páginas React y la isla Django.
export function useAdminNavigationState(userKey: string, sections: AdminNavSection[], currentUrl: string) {
  const key = `visor-sig:admin-navigation:${userKey}`
  const { state, isMobile, openMobile } = useSidebar()
  const scrollKey = `${key}:scroll:${isMobile ? "mobile" : "desktop"}`
  const visible = isMobile ? openMobile : state === "expanded"
  const content = useRef<HTMLDivElement | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>(() => {
    const defaults = Object.fromEntries(sections.flatMap((section) => section.items.flatMap((item) =>
      item.children ? [[item.id, item.children.some((child) => child.href === currentUrl)]] : [],
    ))) as ExpandedGroups
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(`${key}:groups`) || "null")
      if (saved && typeof saved === "object") {
        for (const id of Object.keys(defaults)) {
          const value = (saved as Record<string, unknown>)[id]
          if (typeof value === "boolean") defaults[id] = value
        }
      }
    } catch { /* Sin storage se conserva la navegación durante esta página. */ }
    return defaults
  })

  useLayoutEffect(() => {
    try { sessionStorage.setItem(`${key}:groups`, JSON.stringify(expandedGroups)) } catch { /* storage bloqueado */ }
  }, [key, expandedGroups])

  const restore = useCallback((element: HTMLDivElement | null) => {
    content.current = element
    if (element && visible) element.scrollTop = readScroll(scrollKey)
  }, [scrollKey, visible])

  // También se restaura al reabrir el panel móvil o volver del riel al menú.
  useLayoutEffect(() => {
    if (visible && content.current) content.current.scrollTop = readScroll(scrollKey)
  }, [scrollKey, visible])

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    // Al contraer, el navegador puede recortar el scroll: eso no es una nueva posición elegida.
    if (!visible) return
    try { sessionStorage.setItem(scrollKey, String(event.currentTarget.scrollTop)) } catch { /* storage bloqueado */ }
  }, [scrollKey, visible])

  const onExpandedChange = (id: string, open: boolean) => {
    setExpandedGroups((previous) => ({ ...previous, [id]: open }))
  }

  return { expandedGroups, onExpandedChange, contentRef: restore, onScroll }
}

import { flushSync } from "react-dom"

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown
}

// Aplica el tema con una revelación circular desde `origin`; sin soporte o con
// movimiento reducido, cambia de inmediato.
export function changeTheme(
  setTheme: (theme: string) => void,
  theme: string,
  origin?: { x: number; y: number },
) {
  const doc = document as ViewTransitionDocument
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!doc.startViewTransition || reduced) {
    setTheme(theme)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const root = document.documentElement.style
  root.setProperty("--theme-x", `${x}px`)
  root.setProperty("--theme-y", `${y}px`)
  root.setProperty("--theme-r", `${radius}px`)
  doc.startViewTransition(() => flushSync(() => setTheme(theme)))
}

export function originOf(element: Element | null) {
  const rect = element?.getBoundingClientRect()
  return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined
}

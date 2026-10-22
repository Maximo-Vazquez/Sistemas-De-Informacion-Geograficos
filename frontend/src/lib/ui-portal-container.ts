import { createContext, useContext, type RefObject } from "react"

// Las islas dentro de Shadow DOM conservan también sus overlays en el mismo tema.
export const UiPortalContainerContext = createContext<
  HTMLElement | RefObject<HTMLElement | null> | undefined
>(undefined)
export const useUiPortalContainer = () => useContext(UiPortalContainerContext)

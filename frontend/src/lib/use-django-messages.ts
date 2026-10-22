import { useEffect } from "react"
import { toast } from "sonner"

export type DjangoMessage = { level: string; text: string }

// Muestra los mensajes del framework de Django como avisos de Sonner al montar la pantalla.
export function useDjangoMessages(messages: DjangoMessage[] = []) {
  useEffect(() => {
    messages.forEach((message) => {
      if (message.level.includes("error")) toast.error(message.text)
      else if (message.level.includes("warning")) toast.warning(message.text)
      else toast.success(message.text)
    })
  }, [messages])
}

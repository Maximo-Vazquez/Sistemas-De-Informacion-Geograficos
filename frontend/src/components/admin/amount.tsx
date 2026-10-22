import type { ReactNode } from "react"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

// Tono de un monto. `auto` lo decide el signo: positivo verde, negativo rojo, cero gris.
// `income`/`expense`/`pending` fijan el significado aunque el valor sea positivo
// (un gasto se muestra en rojo sin ser negativo).
export type AmountTone = "auto" | "income" | "expense" | "pending" | "neutral"

// Tokens de texto semántico de index.css (contraste AA en ambos temas).
const TONE_CLASS = {
  positive: "text-success-text",
  negative: "text-destructive",
  pending: "text-warning-text",
  zero: "text-muted-foreground",
  neutral: "",
}

export function amountToneClass(value: number, tone: AmountTone = "auto") {
  if (tone === "neutral") return TONE_CLASS.neutral
  if (tone === "pending") return TONE_CLASS.pending
  if (!value) return TONE_CLASS.zero
  if (tone === "income") return TONE_CLASS.positive
  if (tone === "expense") return TONE_CLASS.negative
  return value > 0 ? TONE_CLASS.positive : TONE_CLASS.negative
}

// Monto con color semántico y cifras tabulares. `signed` antepone + a los positivos
// (variaciones). `children` reemplaza el texto formateado si hace falta otro formato.
export function Amount({
  value,
  currency = "ARS",
  tone = "auto",
  signed = false,
  className,
  children,
}: {
  value: number | string
  currency?: string
  tone?: AmountTone
  signed?: boolean
  className?: string
  children?: ReactNode
}) {
  const numeric = Number(value) || 0
  return (
    <span className={cn("tabular-nums", amountToneClass(numeric, tone), className)}>
      {children ?? `${signed && numeric > 0 ? "+" : ""}${formatMoney(numeric, currency)}`}
    </span>
  )
}

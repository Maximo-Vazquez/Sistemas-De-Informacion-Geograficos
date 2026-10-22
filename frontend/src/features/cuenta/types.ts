import type { DjangoMessage } from "@/lib/use-django-messages"

export type PantallaCuenta = "login" | "logout" | "error" | "sin-permiso"

export type CuentaData = {
  pantalla: PantallaCuenta
  brandName: string
  logoUrl: string
  csrf: string
  next: string
  googleUrl: string
  logoutUrl: string
  homeUrl: string
  adminUrl: string
  email: string
  messages: DjangoMessage[]
}

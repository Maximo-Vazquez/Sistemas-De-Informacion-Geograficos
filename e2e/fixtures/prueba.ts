import { test as base, expect } from "@playwright/test"
import { archivoSesion } from "../utilidades/django"

// Toda prueba falla si el navegador registra errores de JavaScript o el servidor responde 5xx.
export const test = base.extend<{ erroresNavegador: string[] }>({
  erroresNavegador: [
    async ({ page }, use) => {
      const errores: string[] = []
      page.on("pageerror", (error) => errores.push(error.message))
      page.on("response", (respuesta) => {
        if (respuesta.status() >= 500) errores.push(`HTTP ${respuesta.status()} ${respuesta.url()}`)
      })
      page.on("console", (mensaje) => {
        if (mensaje.type() === "error" && !/failed to load resource.*\b404\b/i.test(mensaje.text()))
          errores.push(mensaje.text())
      })
      await use(errores)
      expect(errores, `Errores del navegador:\n${errores.join("\n")}`).toEqual([])
    },
    { auto: true },
  ],
})

// Usar en un describe para entrar con la sesión del usuario de pruebas (sin Google).
export const conSesion = { storageState: archivoSesion }

export { expect }

import { conSesion, expect, test } from "../fixtures/prueba"
import { ejecutarDjango } from "../utilidades/django"

test.describe("Sin sesión", () => {
  test("Administración redirige al login con la vuelta indicada", async ({ page }) => {
    await page.goto("/administracion/")
    await expect(page).toHaveURL(/\/accounts\/login\/\?next=\/administracion\/$/)
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible()
  })

  test("no existe el alta con contraseña", async ({ page }) => {
    const respuesta = await page.goto("/accounts/signup/")
    expect(respuesta?.status()).toBe(404)
  })
})

test.describe("Con sesión", () => {
  test.use(conSesion)

  test("el panel muestra indicadores y gráficos en preparación", async ({ page }) => {
    await page.goto("/administracion/")
    await expect(page.getByRole("heading", { level: 1, name: "Panel" })).toBeVisible()
    await expect(page.getByText("Km de traza")).toBeVisible()
    await expect(page.getByText("Todavía sin datos")).toHaveCount(4)
  })

  test("el inicio ofrece ir a Administración", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Ir a Administración" }).click()
    await expect(page).toHaveURL(/\/administracion\/$/)
  })

  test("cerrar sesión vuelve al inicio sin sesión", async ({ browser }, testInfo) => {
    // Sesión propia: cerrarla no debe invalidar la que comparten las demás pruebas.
    const sesion = testInfo.outputPath("sesion-logout.json")
    ejecutarDjango(["sesion_e2e", sesion])
    const page = await (await browser.newContext({ storageState: sesion })).newPage()
    await page.goto("/accounts/logout/")
    await page.getByRole("button", { name: "Cerrar sesión" }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible()
  })
})

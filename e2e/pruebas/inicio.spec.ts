import { expect, test } from "../fixtures/prueba"

test.describe("Inicio público", () => {
  test("muestra el proyecto, el globo y el ingreso con Google", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1, name: /Ruta Nacional 11/ })).toBeVisible()
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible()
    await expect(page.locator("canvas")).toBeVisible()
  })

  test("lista las cinco consignas del TPI con su estado", async ({ page }) => {
    await page.goto("/")
    const consignas = page.getByRole("region", { name: "Consignas del trabajo" }).getByRole("listitem")
    await expect(consignas).toHaveCount(5)
    await expect(consignas.first()).toContainText("Pendiente")
  })

  test("en el celular no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(desborde).toBeLessThanOrEqual(0)
  })

  test("el tema oscuro se aplica y se recuerda", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Cambiar tema" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator("html")).toHaveClass(/dark/)
  })
})

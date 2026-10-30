import { execFileSync } from "node:child_process"
import { conSesion, expect, test } from "../fixtures/prueba"
import { raizProyecto } from "../utilidades/django"

// Necesita PostGIS y GeoServer con las capas cargadas (docker compose up -d postgis geoserver).
const GEOSERVER = process.env.GEOSERVER_URL ?? "http://localhost:8085/geoserver"
const NOMBRE_PRUEBA = "Prueba e2e del visor"

function borrarElementosDePrueba() {
  execFileSync(
    "docker",
    ["compose", "exec", "-T", "postgis", "psql", "-U", "sig_ign", "-d", "sig_ign", "-c",
      `DELETE FROM elementos_relevados WHERE nombre = '${NOMBRE_PRUEBA}'`],
    { cwd: raizProyecto, stdio: "ignore" },
  )
}

test.describe("Visor", () => {
  test.use(conSesion)

  test.beforeAll(async ({ request }) => {
    const respuesta = await request.get(`${GEOSERVER}/ign/wms?service=WMS&request=GetCapabilities`).catch(() => null)
    test.skip(!respuesta?.ok(), "GeoServer no está corriendo")
  })

  test.beforeEach(async ({ page }) => {
    await page.goto("/administracion/visor/")
    await expect(page.getByRole("switch", { name: "Provincias" })).toBeChecked()
  })

  test("lista las capas por tema y muestra la leyenda de las encendidas", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Hidrografía" })).toBeVisible()
    await page.getByRole("textbox", { name: "Buscar capa" }).fill("curso")
    await page.getByRole("switch", { name: "Curso de Agua Hid" }).click()
    await page.getByRole("tab", { name: "Leyenda" }).click()
    await expect(page.getByRole("img", { name: "Simbología de Curso de Agua Hid" })).toBeVisible()
    await expect(page.getByRole("img", { name: "Simbología de Red Vial" })).toBeVisible()
  })

  test("la consulta por punto muestra los atributos del elemento", async ({ page }) => {
    await page.getByRole("radio", { name: "Consultar punto" }).or(page.getByRole("button", { name: "Consultar punto" })).click()
    const mapa = page.getByRole("region", { name: "Mapa" })
    const caja = (await mapa.boundingBox())!
    await mapa.click({ position: { x: caja.width * 0.55, y: caja.height * 0.5 } })
    const panel = page.getByRole("region", { name: "Consulta por punto" })
    await expect(panel.getByRole("region", { name: "Provincias" })).toBeVisible()
    await panel.getByRole("button", { name: "Chaco" }).click()
    await expect(panel.getByText("provincia", { exact: true })).toBeVisible()
  })

  test("la consulta por área lista elementos de varias capas", async ({ page }) => {
    await page.keyboard.press("r")
    const mapa = page.getByRole("region", { name: "Mapa" })
    const caja = (await mapa.boundingBox())!
    await page.mouse.move(caja.x + caja.width * 0.45, caja.y + caja.height * 0.4)
    await page.mouse.down()
    await page.mouse.move(caja.x + caja.width * 0.7, caja.y + caja.height * 0.65, { steps: 8 })
    await page.mouse.up()
    const panel = page.getByRole("region", { name: "Consulta por área" })
    await expect(panel.getByRole("region", { name: "Localidades" })).toBeVisible()
    await expect(panel.getByText(/elementos en \d+ capas/)).toBeVisible()
  })

  test("mide una distancia de varios tramos", async ({ page }) => {
    await page.keyboard.press("m")
    const mapa = page.getByRole("region", { name: "Mapa" })
    const caja = (await mapa.boundingBox())!
    await mapa.click({ position: { x: caja.width * 0.3, y: caja.height * 0.5 } })
    await mapa.click({ position: { x: caja.width * 0.5, y: caja.height * 0.5 } })
    await mapa.dblclick({ position: { x: caja.width * 0.6, y: caja.height * 0.6 } })
    const panel = page.getByRole("region", { name: "Medir distancia" })
    await expect(panel.getByText("Medición 1")).toBeVisible()
    await expect(panel.getByText(/\d km$/).first()).toBeVisible()
  })

  test("agrega un punto con atributos a la capa editable", async ({ page }) => {
    borrarElementosDePrueba()
    try {
      await page.keyboard.press("a")
      const panel = page.getByRole("region", { name: "Agregar elemento" })
      await expect(panel.getByText("Dibujá el elemento en el mapa")).toBeVisible()
      const mapa = page.getByRole("region", { name: "Mapa" })
      const caja = (await mapa.boundingBox())!
      await mapa.click({ position: { x: caja.width * 0.6, y: caja.height * 0.55 } })
      await panel.getByRole("button", { name: "Guardar elemento" }).click()
      await expect(panel.getByText("Completá este campo.")).toBeVisible()
      await panel.getByRole("textbox", { name: "Nombre" }).fill(NOMBRE_PRUEBA)
      await panel.getByRole("textbox", { name: "Categoría" }).fill("Obra vial")
      await panel.getByRole("button", { name: "Guardar elemento" }).click()
      await expect(page.getByText(/Elemento guardado en Elementos relevados/)).toBeVisible()
      await expect(page.getByRole("switch", { name: "Elementos relevados" })).toBeChecked()
    } finally {
      borrarElementosDePrueba()
    }
  })
})

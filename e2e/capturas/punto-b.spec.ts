import path from "node:path"
import { expect, test, type Page } from "@playwright/test"
import { archivoSesion, raizProyecto } from "../utilidades/django"

// Capturas del punto b para el informe: panel con los resultados y visor con el tema "Obra RN 11".
// Necesita el análisis en PostGIS (scripts/analisis_rn11_qgis.py y publicar_analisis_rn11.py) y GeoServer en marcha.
// Uso: pnpm --dir e2e exec playwright test --project=capturas punto-b
const destino = path.join(raizProyecto, "docs", "tpi", "punto-b", "figuras")
const TAM = { width: 1440, height: 900 }

// Misma vista inicial que el visor (selectors.EXTENSION_CHACO y PADDING de use-mapa.ts).
const EXTENSION = [-63.5, -28.1, -58.2, -24.0]
const MARGEN = 48
const PUENTE_RIO_NEGRO = [-59.00949, -27.42203]
const CENTRO_CORREDOR = [-58.98, -27.28]
const CORREDOR = { desde: [-59.55, -26.5], hasta: [-58.4, -28.05] }

const mercator = ([lon, lat]: number[]) => [
  (lon * 20037508.34) / 180,
  ((Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * 20037508.34) / 180,
]

// Píxel de pantalla de una coordenada con la vista inicial del visor.
async function enPantalla(page: Page, coordenada: number[]) {
  const caja = (await page.getByRole("region", { name: "Mapa" }).boundingBox())!
  const [x0, y0] = mercator([EXTENSION[0], EXTENSION[1]])
  const [x1, y1] = mercator([EXTENSION[2], EXTENSION[3]])
  const resolucion = Math.max((x1 - x0) / (caja.width - 2 * MARGEN), (y1 - y0) / (caja.height - 2 * MARGEN))
  const [x, y] = mercator(coordenada)
  return {
    x: caja.x + caja.width / 2 + (x - (x0 + x1) / 2) / resolucion,
    y: caja.y + caja.height / 2 - (y - (y0 + y1) / 2) / resolucion,
  }
}

// Acerca con la rueda sobre una coordenada: el punto queda fijo bajo el cursor.
async function acercar(page: Page, coordenada: number[], pasos: number) {
  const punto = await enPantalla(page, coordenada)
  await page.mouse.move(punto.x, punto.y)
  for (let paso = 0; paso < pasos; paso++) {
    await page.mouse.wheel(0, -400)
    await page.waitForTimeout(500)
  }
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)
  return punto
}

async function abrirVisorConTema(page: Page) {
  await page.goto("/administracion/visor/")
  await expect(page.getByRole("button", { name: "Ocultar Provincias" })).toBeVisible()
  await page.getByRole("button", { name: "Obra RN 11" }).click()
  await expect(page.getByRole("button", { name: "Ocultar Puentes de la RN 11" })).toBeVisible()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)
}

const foto = (page: Page, nombre: string, completa = false) =>
  page.screenshot({ path: path.join(destino, `${nombre}.png`), fullPage: completa })

test.describe("Punto b", () => {
  test.use({ storageState: archivoSesion, viewport: TAM, deviceScaleFactor: 2, locale: "es-AR", colorScheme: "light" })

  test("panel con los resultados", async ({ page }) => {
    await page.goto("/administracion/")
    await expect(page.getByText("172,39 km")).toBeVisible()
    await page.waitForLoadState("networkidle")
    await foto(page, "app-panel", true)
  })

  test("visor con el tema Obra RN 11", async ({ page }) => {
    await abrirVisorConTema(page)
    await acercar(page, CENTRO_CORREDOR, 3)
    await foto(page, "app-visor-tema")
  })

  test("consulta por área de los puentes de la traza", async ({ page }) => {
    await abrirVisorConTema(page)
    await page.keyboard.press("r")
    const desde = await enPantalla(page, CORREDOR.desde)
    const hasta = await enPantalla(page, CORREDOR.hasta)
    await page.mouse.move(desde.x, desde.y)
    await page.mouse.down()
    await page.mouse.move(hasta.x, hasta.y, { steps: 10 })
    await page.mouse.up()
    const tabla = page.getByRole("region", { name: "Tabla de atributos" })
    await tabla.getByRole("tab", { name: /Puentes de la RN 11/ }).click()
    await page.waitForTimeout(800)
    await foto(page, "app-visor-tabla-puentes")
  })

  test("detalle de un puente", async ({ page }) => {
    await abrirVisorConTema(page)
    const puente = await acercar(page, PUENTE_RIO_NEGRO, 4)
    await page.getByRole("radio", { name: "Consultar punto" }).or(page.getByRole("button", { name: "Consultar punto" })).click()
    await page.mouse.click(puente.x, puente.y)
    await expect(page.getByRole("dialog", { name: /^Detalle de Puente/ })).toBeVisible()
    await page.waitForTimeout(800)
    await foto(page, "app-visor-puente")
  })
})

import { randomUUID } from "node:crypto"
import type { Page } from "@playwright/test"
import { conSesion, expect, test } from "../fixtures/prueba"

// GeoServer y el fondo del IGN se simulan: la prueba no depende de servicios externos
// ni de tener las capas cargadas, y ve siempre las mismas capas.
const CAPAS = [
  ["provincias", "Provincias"],
  ["localidades", "Localidades"],
  ["red_vial", "Red Vial"],
  ["puente_red_vial_puntos", "Puente Red Vial Puntos"],
  ["curso_de_agua_hid", "Curso de Agua Hid"],
  ["veg_hidrofila", "Veg Hidrofila"],
]

const CAPABILITIES = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms">
  <Service><Name>WMS</Name><Title>Prueba</Title></Service>
  <Capability><Layer><Title>ign</Title>
    ${CAPAS.map(([nombre, titulo]) => `<Layer queryable="1"><Name>${nombre}</Name><Title>${titulo}</Title></Layer>`).join("")}
  </Layer></Capability>
</WMS_Capabilities>`

// PNG transparente de 1×1 para teselas y leyendas.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
)

const punto = (id: string, propiedades: Record<string, unknown>) => ({
  type: "Feature",
  id,
  geometry: { type: "Point", coordinates: [-6566000, -3175000] },
  properties: { ogc_fid: 1, igds_color: 0, ...propiedades },
})

// Respuestas de consulta por capa: provincias tiene un elemento en el punto, localidades ninguno.
const FEATURE_INFO: Record<string, object[]> = {
  // Como en el IGN: la capa de provincias no tiene "nombre", sino "provincia".
  provincias: [punto("provincias.7", { gid: 8, prov: 22, provincia: "Chaco" })],
  localidades: [],
}

// En el rectángulo, localidades devuelve 3 de 39 (como si hubiera tope por capa).
const WFS = {
  type: "FeatureCollection",
  numberMatched: 39,
  numberReturned: 3,
  features: ["Resistencia", "Barranqueras", "Fontana"].map((nombre, i) => punto(`localidades.${i}`, { nombre })),
}

function responderWms(url: URL) {
  const pedido = url.searchParams.get("REQUEST") ?? url.searchParams.get("request")
  if (pedido === "GetCapabilities") return { contentType: "text/xml", body: CAPABILITIES }
  if (pedido === "GetFeatureInfo") {
    const features = FEATURE_INFO[url.searchParams.get("QUERY_LAYERS") ?? ""] ?? []
    return { contentType: "application/json", body: JSON.stringify({ type: "FeatureCollection", features }) }
  }
  return { contentType: "image/png", body: PNG }
}

async function simularServicios(page: Page) {
  await page.route("https://wms.ign.gob.ar/**", (ruta) => ruta.fulfill({ contentType: "image/png", body: PNG }))
  await page.route(/\/wms\?/i, (ruta) => ruta.fulfill(responderWms(new URL(ruta.request().url()))))
  await page.route(/\/wfs\?/i, (ruta) => ruta.fulfill({ contentType: "application/json", body: JSON.stringify(WFS) }))
}

async function centroDelMapa(page: Page) {
  const caja = (await page.getByRole("region", { name: "Mapa" }).boundingBox())!
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 }
}

test.describe("Visor", () => {
  test.use(conSesion)

  test.beforeEach(async ({ page }) => {
    await simularServicios(page)
    await page.goto("/administracion/visor/")
  })

  test("agrupa las capas por tema y abre solo límites y localidades", async ({ page }) => {
    const panel = page.getByRole("complementary", { name: "Capas y leyenda" })
    for (const grupo of ["Límites y localidades", "Transporte", "Hidrografía", "Vegetación"]) {
      await expect(panel.getByRole("button", { name: new RegExp(grupo) })).toBeVisible()
    }
    await expect(panel.getByRole("switch", { name: "Provincias", exact: true })).toBeVisible()
    await expect(panel.getByRole("switch", { name: "Red Vial", exact: true })).toBeHidden()

    await panel.getByRole("button", { name: /Transporte/ }).click()
    await expect(panel.getByRole("switch", { name: "Red Vial", exact: true })).toBeVisible()
  })

  test("el buscador filtra sin importar tildes y avisa si no hay resultados", async ({ page }) => {
    const panel = page.getByRole("complementary", { name: "Capas y leyenda" })
    const buscador = panel.getByRole("searchbox", { name: "Buscar capa" })

    await buscador.fill("vial")
    await expect(panel.getByRole("switch", { name: "Red Vial", exact: true })).toBeVisible()
    await expect(panel.getByRole("switch", { name: "Puente Red Vial Puntos", exact: true })).toBeVisible()
    await expect(panel.getByRole("switch", { name: "Provincias", exact: true })).toBeHidden()

    await buscador.fill("hidrografia")
    await expect(panel.getByRole("switch", { name: "Curso de Agua Hid", exact: true })).toBeVisible()

    await buscador.fill("zzz")
    await expect(panel.getByText("Sin resultados")).toBeVisible()

    await panel.getByRole("button", { name: "Limpiar búsqueda" }).click()
    await expect(buscador).toHaveValue("")
    await expect(panel.getByRole("switch", { name: "Provincias", exact: true })).toBeVisible()
  })

  test("mide una distancia y la borra", async ({ page }) => {
    const barra = page.getByRole("toolbar", { name: "Herramientas del mapa" })
    await barra.getByRole("button", { name: "Medir" }).click()
    await expect(page.getByText("doble clic para terminar")).toBeVisible()

    const mapa = page.getByRole("region", { name: "Mapa" })
    const caja = (await mapa.boundingBox())!
    const y = caja.y + caja.height / 2
    const etiqueta = page.locator(".ol-overlay-container").getByText(/\d km$/)
    await page.mouse.click(caja.x + caja.width * 0.3, y)
    // Mientras se dibuja, la distancia acompaña al cursor.
    await page.mouse.move(caja.x + caja.width * 0.6, y, { steps: 5 })
    await expect(etiqueta).toHaveCount(1)
    await page.mouse.dblclick(caja.x + caja.width * 0.7, y)
    await expect(etiqueta).toHaveCount(1)

    // Esc cancela una línea en curso sin dejar etiqueta.
    await page.mouse.click(caja.x + caja.width * 0.3, y + 60)
    await page.mouse.move(caja.x + caja.width * 0.6, y + 60, { steps: 5 })
    await expect(etiqueta).toHaveCount(2)
    await page.keyboard.press("Escape")
    await expect(etiqueta).toHaveCount(1)

    await barra.getByRole("button", { name: "Borrar mediciones" }).click()
    await expect(etiqueta).toHaveCount(0)
    await expect(barra.getByRole("button", { name: "Borrar mediciones" })).toBeHidden()
  })
  test("la consulta por punto avisa si no hay capas encendidas", async ({ page }) => {
    await page.getByRole("toolbar").getByRole("button", { name: "Punto" }).click()
    const centro = await centroDelMapa(page)
    await page.mouse.click(centro.x, centro.y)
    const resultados = page.getByRole("region", { name: "Resultados de la consulta" })
    await expect(resultados.getByText("No hay capas encendidas")).toBeVisible()
  })

  test("la consulta por punto muestra los atributos de cada capa encendida", async ({ page }) => {
    const panel = page.getByRole("complementary", { name: "Capas y leyenda" })
    await panel.getByRole("switch", { name: "Provincias", exact: true }).click()
    await panel.getByRole("switch", { name: "Localidades", exact: true }).click()
    await page.getByRole("toolbar").getByRole("button", { name: "Punto" }).click()
    const centro = await centroDelMapa(page)
    await page.mouse.click(centro.x, centro.y)

    const resultados = page.getByRole("region", { name: "Resultados de la consulta" })
    await expect(resultados.getByRole("heading", { name: "Consulta por punto" })).toBeVisible()
    await expect(resultados.getByText("1 elemento en 1 capa")).toBeVisible()
    await expect(resultados.getByText("Sin elementos en: Localidades.")).toBeVisible()

    await resultados.getByRole("button", { name: "Chaco" }).click()
    await expect(resultados.getByText("Código de provincia")).toBeVisible()
    // Los atributos de control del IGN no se muestran.
    await expect(resultados.getByText(/ogc_fid|igds|^gid$/i)).toHaveCount(0)

    await resultados.getByRole("button", { name: "Cerrar resultados" }).click()
    await expect(resultados).toBeHidden()
  })

  test("la consulta por rectángulo informa cuántos elementos hay en total", async ({ page }) => {
    const panel = page.getByRole("complementary", { name: "Capas y leyenda" })
    await panel.getByRole("switch", { name: "Localidades", exact: true }).click()
    await page.getByRole("toolbar").getByRole("button", { name: "Rectángulo" }).click()
    const centro = await centroDelMapa(page)
    await page.mouse.move(centro.x - 80, centro.y - 60)
    await page.mouse.down()
    await page.mouse.move(centro.x + 80, centro.y + 60, { steps: 8 })
    await page.mouse.up()

    const resultados = page.getByRole("region", { name: "Resultados de la consulta" })
    await expect(resultados.getByRole("heading", { name: "Consulta por rectángulo" })).toBeVisible()
    await expect(resultados.getByText("39 elementos en 1 capa")).toBeVisible()
    await expect(resultados.getByText("3 de 39")).toBeVisible()
    await expect(resultados.getByRole("button", { name: "Resistencia" })).toBeVisible()
  })

  test("dibuja un punto, guarda sus atributos y lo recupera al recargar", async ({ page }) => {
    const nombre = `Relevamiento E2E ${randomUUID()}`
    const barra = page.getByRole("toolbar", { name: "Herramientas del mapa" })
    await barra.getByRole("button", { name: "Agregar elemento" }).click()
    const centro = await centroDelMapa(page)
    await page.mouse.click(centro.x, centro.y)

    const formulario = page.getByRole("dialog", { name: "Atributos del elemento" })
    const guardar = formulario.getByRole("button", { name: "Guardar elemento" })
    await formulario.getByLabel("Descripción (opcional)").fill("Acceso de prueba")
    await formulario.getByLabel("Nombre").fill(nombre)
    await guardar.click()
    await expect(formulario).toBeHidden()
    await expect(page.getByRole("switch", { name: "Relevamientos" })).toBeChecked()

    const carga = page.waitForResponse((respuesta) =>
      respuesta.ok() && new URL(respuesta.url()).pathname === "/administracion/visor/elementos/",
    )
    await page.reload()
    await carga
    await page.getByRole("switch", { name: "Relevamientos" }).click()
    await barra.getByRole("button", { name: "Punto", exact: true }).click()
    await page.mouse.click(centro.x, centro.y)
    const resultados = page.getByRole("region", { name: "Resultados de la consulta" })
    await resultados.getByRole("button", { name: nombre }).click()
    await expect(resultados.getByText("Acceso de prueba")).toBeVisible()
  })

  test("dibuja una línea y un polígono desde el mapa", async ({ page }) => {
    const barra = page.getByRole("toolbar", { name: "Herramientas del mapa" })
    const controles = page.getByRole("group", { name: "Tipo de geometría" })
    const formulario = page.getByRole("dialog", { name: "Atributos del elemento" })
    const centro = await centroDelMapa(page)
    for (const [titulo, tipo] of [["Línea", "LineString"], ["Polígono", "Polygon"]]) {
      await barra.getByRole("button", { name: "Agregar elemento" }).click()
      await controles.getByRole("button", { name: titulo }).click()
      await page.mouse.click(centro.x - 75, centro.y + 60)
      if (tipo === "LineString") {
        await page.mouse.dblclick(centro.x + 75, centro.y + 60)
      } else {
        await page.mouse.click(centro.x + 75, centro.y + 60)
        await page.mouse.click(centro.x, centro.y)
        await page.mouse.click(centro.x - 75, centro.y + 60)
      }
      await formulario.getByLabel("Nombre").fill(titulo)
      const guardado = page.waitForResponse((respuesta) =>
        respuesta.status() === 201 && new URL(respuesta.url()).pathname === "/administracion/visor/elementos/",
      )
      await formulario.getByRole("button", { name: "Guardar elemento" }).click()
      expect((await (await guardado).json()).geometry.type).toBe(tipo)
      await expect(formulario).toBeHidden()
    }
  })
})

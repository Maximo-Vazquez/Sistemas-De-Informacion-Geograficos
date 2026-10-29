import path from "node:path"
import { test, type Page } from "@playwright/test"
import { archivoSesion, raizProyecto } from "../utilidades/django"

// Genera capturas reproducibles de las pantallas para la bitácora y el informe.
// Uso: pnpm --dir e2e capturas   → docs/capturas/<pantalla>-<tema>-<dispositivo>.png
const destino = path.join(raizProyecto, "docs", "capturas")

type Pantalla = { nombre: string; url: string; sesion?: boolean }
const PANTALLAS: Pantalla[] = [
  { nombre: "inicio", url: "/" },
  { nombre: "login", url: "/accounts/login/" },
  { nombre: "panel", url: "/administracion/", sesion: true },
]
const VARIANTES = [
  { tema: "claro" as const, dispositivo: "escritorio", viewport: { width: 1440, height: 900 } },
  { tema: "oscuro" as const, dispositivo: "escritorio", viewport: { width: 1440, height: 900 } },
  { tema: "claro" as const, dispositivo: "celular", viewport: { width: 390, height: 844 } },
]

async function esperarPantallaLista(page: Page) {
  await page.waitForLoadState("networkidle")
  await page.evaluate(() => document.fonts.ready)
  // El globo aparece con un fundido de 500 ms.
  await page.waitForTimeout(1200)
}

for (const pantalla of PANTALLAS) {
  for (const variante of VARIANTES) {
    test(`${pantalla.nombre} · ${variante.tema} · ${variante.dispositivo}`, async ({ browser }) => {
      const contexto = await browser.newContext({
        viewport: variante.viewport,
        deviceScaleFactor: 2,
        colorScheme: variante.tema === "oscuro" ? "dark" : "light",
        locale: "es-AR",
        storageState: pantalla.sesion ? archivoSesion : undefined,
      })
      const page = await contexto.newPage()
      await page.goto(pantalla.url)
      await esperarPantallaLista(page)
      const archivo = `${pantalla.nombre}-${variante.tema}-${variante.dispositivo}.png`
      await page.screenshot({ path: path.join(destino, archivo) })
      await contexto.close()
    })
  }
}

import { defineConfig, devices } from "@playwright/test"
import { entornoE2E, puerto, python, raizProyecto, urlBase } from "./utilidades/django"
import { argsGpu } from "./utilidades/gpu"

// Servidor propio en el puerto 8030 con la base gis_tpi_e2e: no toca los datos ni el servidor de desarrollo.
export default defineConfig({
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: "./utilidades/preparacion_global.ts",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: urlBase,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    colorScheme: "light",
    actionTimeout: 10_000,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: `"${python}" manage.py preparar_e2e && "${python}" manage.py runserver 127.0.0.1:${puerto} --noreload --skip-migrate`,
    cwd: raizProyecto,
    env: entornoE2E,
    url: `${urlBase}/__e2e__/salud/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    // Pruebas de comportamiento.
    { name: "pruebas", testDir: "./pruebas", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } },
    // Capturas para la bitácora (no son pruebas: generan imágenes). Usan la GPU real:
    // con la GPU por software del modo headless (SwiftShader) el globo WebGL sale negro.
    { name: "capturas", testDir: "./capturas", use: { ...devices["Desktop Chrome"], launchOptions: { args: argsGpu } } },
  ],
})

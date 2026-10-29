import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

// Raíz del repositorio, Python del entorno virtual y servidor exclusivo de las pruebas.
export const raizProyecto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const pythonVenv = process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python"
export const python = process.env.PYTHON ?? (existsSync(path.join(raizProyecto, pythonVenv)) ? path.join(raizProyecto, pythonVenv) : "python")
export const puerto = Number(process.env.E2E_PUERTO ?? 8030)
export const urlBase = `http://127.0.0.1:${puerto}`
export const archivoSesion = path.join(raizProyecto, "e2e", ".auth", "admin.json")

export const entornoE2E: Record<string, string> = {
  ...(process.env as Record<string, string>),
  DJANGO_SETTINGS_MODULE: "config.settings.e2e",
  PYTHONUTF8: "1",
}

export function ejecutarDjango(argumentos: string[]): void {
  execFileSync(python, ["manage.py", ...argumentos], { cwd: raizProyecto, env: entornoE2E, stdio: "inherit" })
}

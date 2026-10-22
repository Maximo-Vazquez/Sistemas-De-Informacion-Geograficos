// Chequeo del patrón visual (skill admin-visual-style): las features y los componentes de la
// aplicación no escriben colores; usan tokens de index.css y componentes compartidos.
// Uso: pnpm check:colores   (sale con código 1 si encuentra infracciones)
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src")
// Primitivos generados por shadcn/coss (components/ui, components/coss) y estilos globales quedan fuera.
const carpetas = [
  "features",
  "components/admin",
  "components/app",
  "components/data-table",
  "components/dashboard",
  "components/detail",
  "components/upload",
]
const paleta =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone"
const reglas = [
  {
    nombre: "clase de paleta cruda",
    patron: new RegExp(
      `\\b(?:text|bg|border|ring|fill|stroke|from|to|via|outline|decoration|divide|shadow)-(?:${paleta})-\\d{2,3}\\b`,
      "g",
    ),
  },
  { nombre: "color hexadecimal", patron: /["'`\s(]#[0-9a-fA-F]{3,8}\b/g },
  { nombre: "función de color suelta", patron: /\b(?:oklch|rgb|rgba|hsl|hsla|color-mix)\(/g },
  // Excluye tamaños arbitrarios (text-[0.7rem], border-[2px]): solo valores de color.
  {
    nombre: "clase arbitraria de color",
    patron: /\b(?:text|bg|border|ring|fill|stroke)-\[(?![\d.]|length:)[^\]]*\]/g,
  },
]

function archivos(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = path.join(dir, nombre)
    if (statSync(ruta).isDirectory()) return archivos(ruta)
    return /\.(tsx?|css)$/.test(nombre) ? [ruta] : []
  })
}

const hallazgos = []
for (const carpeta of carpetas) {
  const dir = path.join(raiz, carpeta)
  let lista = []
  try {
    lista = archivos(dir)
  } catch {
    continue
  }
  for (const archivo of lista) {
    const lineas = readFileSync(archivo, "utf8").split(/\r?\n/)
    lineas.forEach((linea, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(linea)) return
      // Colores que son DATOS del negocio (p. ej. un color elegido por el administrador), nunca
      // estilos: la marca va en la misma línea o en la anterior.
      if (linea.includes("check-colores: dato") || lineas[i - 1]?.includes("check-colores: dato"))
        return
      for (const regla of reglas)
        for (const m of linea.matchAll(regla.patron))
          hallazgos.push(
            `${path.relative(raiz, archivo)}:${i + 1}  ${regla.nombre}: ${m[0].trim()}`,
          )
    })
  }
}

if (hallazgos.length) {
  console.error(`check:colores — ${hallazgos.length} uso(s) de color fuera de los tokens:\n`)
  console.error(hallazgos.join("\n"))
  console.error("\nUsá tokens de index.css y componentes compartidos (skill admin-visual-style).")
  process.exit(1)
}
console.log("check:colores — sin colores sueltos en features y componentes de la aplicación.")

import type { CapaWms } from "./types"

export type GrupoCapas = { id: string; titulo: string; capas: CapaWms[] }

type Regla = { id: string; titulo: string; coincide: (nombre: string) => boolean }

const en = (...nombres: string[]) => (nombre: string) => nombres.includes(nombre)
const empieza = (...prefijos: string[]) => (nombre: string) => prefijos.some((p) => nombre.startsWith(p))
const termina = (...sufijos: string[]) => (nombre: string) => sufijos.some((s) => nombre.endsWith(s))
const alguna =
  (...pruebas: ((nombre: string) => boolean)[]) =>
  (nombre: string) =>
    pruebas.some((prueba) => prueba(nombre))

// Temas del SIG IGN 250, por nombre de tabla. El orden define el orden del panel y la
// primera regla que coincide gana; lo que no coincide con ninguna va a "Otras capas".
const REGLAS: Regla[] = [
  {
    id: "limites",
    titulo: "Límites y localidades",
    coincide: alguna(termina("_lim"), en("provincias", "localidades", "ejido")),
  },
  {
    id: "transporte",
    titulo: "Transporte",
    coincide: alguna(
      empieza("red_", "vias_", "puente_", "infraestructura_aeroportuaria", "estructuras_portuarias"),
      en("obra_portuaria", "salvado_de_obstaculo", "senalizaciones", "marcas_y_senales", "edificios_ferroviarios"),
    ),
  },
  {
    id: "hidrografia",
    titulo: "Hidrografía",
    coincide: alguna(termina("_hid"), en("isla", "infraestructura_hidro", "muro_embalse")),
  },
  {
    id: "relieve",
    titulo: "Relieve y suelos",
    coincide: alguna(empieza("sue_", "puntos_de", "puntos_del"), en("curvas_de_nivel")),
  },
  { id: "vegetacion", titulo: "Vegetación", coincide: empieza("veg_") },
  {
    id: "edificios",
    titulo: "Edificios y servicios",
    coincide: alguna(empieza("edif_", "edificio_"), en("otras_edificaciones")),
  },
  {
    id: "energia",
    titulo: "Energía y comunicaciones",
    coincide: alguna(termina("_ene"), en("obra_de_comunicacion")),
  },
  { id: "actividades", titulo: "Actividades económicas", coincide: empieza("actividades_") },
]

export const GRUPO_INICIAL = "limites"

// GeoServer puede devolver "ign:red_vial" o, si hubo colisión, "sig2011_red_vial".
function nombreTabla(nombre: string) {
  return nombre.replace(/^[^:]+:/, "").replace(/^sig2011_/, "").toLowerCase()
}

export function agruparCapas(capas: CapaWms[]): GrupoCapas[] {
  const grupos = [...REGLAS, { id: "otras", titulo: "Otras capas", coincide: () => true }].map(
    ({ id, titulo }) => ({ id, titulo, capas: [] as CapaWms[] }),
  )
  for (const capa of capas) {
    const tabla = nombreTabla(capa.nombre)
    const indice = REGLAS.findIndex((regla) => regla.coincide(tabla))
    grupos[indice === -1 ? REGLAS.length : indice].capas.push(capa)
  }
  for (const grupo of grupos) grupo.capas.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"))
  return grupos.filter((grupo) => grupo.capas.length > 0)
}

// Minúsculas y sin tildes: "hidrografia" encuentra "Hidrografía" y "rio" encuentra "Río".
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
}

// Busca en el título de la capa, en su nombre técnico y en el nombre del grupo.
export function filtrarGrupos(grupos: GrupoCapas[], busqueda: string): GrupoCapas[] {
  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
  if (terminos.length === 0) return grupos
  return grupos
    .map((grupo) => ({
      ...grupo,
      capas: grupo.capas.filter((capa) => {
        const texto = normalizar(`${capa.titulo} ${capa.nombre.replace(/_/g, " ")} ${grupo.titulo}`)
        return terminos.every((termino) => texto.includes(termino))
      }),
    }))
    .filter((grupo) => grupo.capas.length > 0)
}

// Catálogo del SIG IGN 250 para el visor: grupos, nombres legibles, nombres de campos y temas.
// Los nombres técnicos (tablas y atributos del IGN) nunca se muestran tal cual al usuario.

const GRUPOS: { titulo: string; patron: RegExp }[] = [
  { titulo: "Análisis RN 11", patron: /^rn11_/ },
  { titulo: "Vegetación", patron: /^veg_/ },
  { titulo: "Relieve y suelos", patron: /^(sue_|curvas_de_nivel|puntos_de_alturas|puntos_del_terreno)/ },
  { titulo: "Límites", patron: /^(pais_lim|provincias|limite_politico|ejido)/ },
  { titulo: "Hidrografía", patron: /(_hid$|^isla$|^infraestructura_hidro|^muro_embalse)/ },
  {
    titulo: "Transporte",
    patron: /^(red_vial|vias_secundarias|red_ferroviaria|puente_|salvado_de_obstaculo|infraestructura_aeroportuaria|estructuras_portuarias|obra_portuaria|edificios_ferroviarios|senalizaciones|marcas_y_senales)/,
  },
  { titulo: "Energía y servicios", patron: /^(actividades_|complejo_de_energia|lineas_de_conduccion|obra_de_comunicacion)/ },
  { titulo: "Localidades y edificios", patron: /^(localidades|edif|otras_edificaciones)/ },
]

export const GRUPO_RELEVAMIENTO = "Relevamiento propio"
const GRUPO_OTRAS = "Otras capas"

// Orden de dibujo por defecto: los primeros grupos quedan abajo.
export const ORDEN_GRUPOS = [...GRUPOS.map((grupo) => grupo.titulo), GRUPO_OTRAS, GRUPO_RELEVAMIENTO]

export function grupoDeCapa(nombre: string, editable: boolean) {
  if (editable) return GRUPO_RELEVAMIENTO
  return GRUPOS.find((grupo) => grupo.patron.test(nombre))?.titulo ?? GRUPO_OTRAS
}

const TITULOS: Record<string, string> = {
  actividades_agropecuarias: "Actividades agropecuarias",
  actividades_economicas: "Actividades económicas",
  complejo_de_energia_ene: "Complejos de energía",
  curso_de_agua_hid: "Cursos de agua",
  curvas_de_nivel: "Curvas de nivel",
  edif_construcciones_turisticas: "Construcciones turísticas",
  edif_depor_y_esparcimiento: "Edificios deportivos y de esparcimiento",
  edif_educacion: "Edificios educativos",
  edif_religiosos: "Edificios religiosos",
  edificio_de_salud_ips: "Edificios de salud",
  edificio_de_seguridad_ips: "Edificios de seguridad",
  edificio_publico_ips: "Edificios públicos",
  edificios_ferroviarios: "Edificios ferroviarios",
  ejido: "Ejidos urbanos",
  espejo_de_agua_hid: "Lagos, lagunas y bañados",
  estructuras_portuarias: "Estructuras portuarias",
  infraestructura_aeroportuaria_punto: "Aeropuertos y aeródromos",
  infraestructura_hidro: "Infraestructura hidráulica",
  isla: "Islas",
  limite_politico_administrativo_lim: "Límites departamentales",
  localidades: "Localidades",
  lineas_de_conduccion_ene: "Líneas de conducción eléctrica",
  marcas_y_senales: "Marcas y señales",
  muro_embalse: "Muros de embalse",
  obra_de_comunicacion: "Obras de comunicación",
  obra_portuaria: "Obras portuarias",
  otras_edificaciones: "Otras edificaciones",
  pais_lim: "Límite internacional",
  provincias: "Provincias",
  puente_red_vial_puntos: "Puentes",
  puntos_de_alturas_topograficas: "Alturas topográficas",
  puntos_del_terreno: "Puntos del terreno",
  red_ferroviaria: "Red ferroviaria",
  red_vial: "Red vial",
  salvado_de_obstaculo: "Salvado de obstáculos",
  senalizaciones: "Señalizaciones",
  sue_congelado: "Suelo congelado",
  sue_consolidado: "Suelo consolidado",
  sue_costero: "Suelo costero",
  sue_hidromorfologico: "Suelo hidromórfico",
  sue_no_consolidado: "Suelo no consolidado",
  veg_arborea: "Vegetación arbórea",
  veg_arbustiva: "Vegetación arbustiva",
  veg_cultivos: "Cultivos",
  veg_hidrofila: "Vegetación hidrófila",
  veg_suelo_desnudo: "Suelo desnudo",
  vias_secundarias: "Vías secundarias",
  elementos_relevados: "Elementos relevados",
  rn11_chaco: "Traza de la RN 11",
  rn11_areas: "Áreas de influencia (10 y 20 km)",
  rn11_localidades: "Localidades afectadas",
  rn11_puentes: "Puentes de la RN 11",
}

export const tituloDeCapa = (nombre: string, respaldo: string) => TITULOS[nombre] ?? respaldo

// Capas encendidas al abrir (de arriba hacia abajo): dan contexto sin mapa de fondo.
export const CAPAS_INICIALES = ["localidades", "red_vial", "provincias"]

export const TEMAS: { id: string; titulo: string; capas: string[] }[] = [
  // Resultado del punto b (scripts/analisis_rn11_qgis.py): traza, áreas, localidades y puentes.
  { id: "tpi", titulo: "Obra RN 11", capas: ["rn11_puentes", "rn11_localidades", "rn11_chaco", "rn11_areas", "red_vial", "curso_de_agua_hid", "provincias"] },
  { id: "hidrografia", titulo: "Hidrografía", capas: ["localidades", "curso_de_agua_hid", "espejo_de_agua_hid", "isla", "provincias"] },
  { id: "transporte", titulo: "Transporte", capas: ["localidades", "puente_red_vial_puntos", "red_vial", "vias_secundarias", "red_ferroviaria", "provincias"] },
  { id: "limites", titulo: "Límites", capas: ["localidades", "limite_politico_administrativo_lim", "provincias", "pais_lim"] },
]

// Atributos: nombre legible y formato. Los que no figuran se muestran con su nombre ordenado;
// los de OCULTOS son técnicos del IGN o del visor y no se muestran.
type Campo = { etiqueta: string; formato?: "numero" | "metros" }
const CAMPOS: Record<string, Campo> = {
  nombre: { etiqueta: "Nombre" },
  tipo: { etiqueta: "Tipo" },
  provincia: { etiqueta: "Provincia" },
  departamen: { etiqueta: "Departamento" },
  canthab: { etiqueta: "Habitantes", formato: "numero" },
  nro_ruta: { etiqueta: "N.º de ruta" },
  "categoría": { etiqueta: "Categoría" },
  categoria: { etiqueta: "Categoría" },
  administra: { etiqueta: "Administración" },
  revestimie: { etiqueta: "Revestimiento" },
  carriles: { etiqueta: "Carriles", formato: "numero" },
  "tráfico": { etiqueta: "Tránsito" },
  km_inicial: { etiqueta: "Km inicial", formato: "numero" },
  "régimen": { etiqueta: "Régimen" },
  cuenca: { etiqueta: "Cuenca" },
  navegable: { etiqueta: "Navegable" },
  navegabili: { etiqueta: "Navegabilidad" },
  profundida: { etiqueta: "Profundidad" },
  contenido: { etiqueta: "Contenido" },
  uso: { etiqueta: "Uso" },
  salinidad: { etiqueta: "Salinidad" },
  material: { etiqueta: "Material" },
  largo: { etiqueta: "Largo", formato: "metros" },
  capacidad: { etiqueta: "Capacidad" },
  sist_uso: { etiqueta: "Sistema de uso" },
  libre_hz: { etiqueta: "Gálibo horizontal" },
  libre_vcal: { etiqueta: "Gálibo vertical" },
  "situación": { etiqueta: "Situación" },
  "precisión": { etiqueta: "Precisión" },
  precision: { etiqueta: "Precisión" },
  fuente: { etiqueta: "Fuente" },
  actualizac: { etiqueta: "Actualización" },
  descripcion: { etiqueta: "Descripción" },
  responsable: { etiqueta: "Responsable" },
  fecha: { etiqueta: "Fecha" },
  habitantes: { etiqueta: "Habitantes", formato: "numero" },
  departamento: { etiqueta: "Departamento" },
  distancia_km: { etiqueta: "Distancia a la RN 11 (km)", formato: "numero" },
  km: { etiqueta: "Largo (km)", formato: "numero" },
  km2: { etiqueta: "Superficie (km²)", formato: "numero" },
  km_traza: { etiqueta: "Km de la traza", formato: "numero" },
  numero: { etiqueta: "N.º de puente" },
  distancia_traza_m: { etiqueta: "Distancia a la traza", formato: "metros" },
  curso_de_agua: { etiqueta: "Curso de agua" },
  regimen: { etiqueta: "Régimen" },
  distancia_agua_m: { etiqueta: "Distancia al curso de agua", formato: "metros" },
  localidad_cercana: { etiqueta: "Localidad cercana" },
  distancia_localidad_km: { etiqueta: "Distancia a la localidad (km)", formato: "numero" },
  en_chaco: { etiqueta: "En el Chaco" },
}

const OCULTOS = /^(seleccionado|rectangulo|marco|geom|gid|prov|codloc|coddepto|igds_|cell_name|group|rotation|sp|datum|ac|coord|t_act|progreso|cargo|responsabl|operador|dataset|fclass|signo|escala|length|shape_area|coincide|cante_div|de_carga|con_dato|clase|partes|gid_ign)$|^igds_/

// Campos que se muestran en el globo de la consulta (el resto, en "Ver todo").
const DESTACADOS: Record<string, string[]> = {
  localidades: ["tipo", "canthab", "departamen", "provincia"],
  red_vial: ["tipo", "nro_ruta", "categoría", "revestimie"],
  puente_red_vial_puntos: ["tipo", "material", "largo", "carriles"],
  curso_de_agua_hid: ["tipo", "régimen", "cuenca", "navegable"],
  espejo_de_agua_hid: ["tipo", "régimen", "uso"],
  provincias: ["provincia"],
  elementos_relevados: ["categoria", "descripcion", "responsable", "fecha"],
  rn11_chaco: ["km"],
  rn11_areas: ["categoria", "km2"],
  rn11_localidades: ["categoria", "distancia_km", "habitantes", "provincia"],
  rn11_puentes: ["km_traza", "curso_de_agua", "regimen", "localidad_cercana"],
}

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 })

export type Atributo = { clave: string; etiqueta: string; valor: string }

function etiquetaDe(clave: string) {
  return CAMPOS[clave]?.etiqueta ?? (clave.charAt(0).toUpperCase() + clave.slice(1)).replaceAll("_", " ")
}

function formatear(clave: string, valor: unknown) {
  const formato = CAMPOS[clave]?.formato
  if (typeof valor === "boolean") return valor ? "Sí" : "No"
  if (typeof valor === "number" && formato === "metros") return `${numero.format(valor)} m`
  if (typeof valor === "number") return numero.format(valor)
  return String(valor).trim()
}

export function atributos(propiedades: Record<string, unknown>): Atributo[] {
  return Object.entries(propiedades)
    .filter(([clave, valor]) => !OCULTOS.test(clave) && valor !== null && valor !== "" && typeof valor !== "object")
    .map(([clave, valor]) => ({ clave, etiqueta: etiquetaDe(clave), valor: formatear(clave, valor) }))
    .filter((atributo) => atributo.valor !== "")
}

export const clavesDestacadas = (capa: string) => DESTACADOS[capa]

export function atributosDestacados(capa: string, propiedades: Record<string, unknown>) {
  const todos = atributos(propiedades).filter((atributo) => atributo.clave !== "nombre")
  const elegidos = DESTACADOS[capa]
  if (!elegidos) return todos.slice(0, 4)
  return elegidos.flatMap((clave) => todos.filter((atributo) => atributo.clave === clave))
}

// Capas del análisis sin campo `nombre`: puente por su curso de agua, área por su categoría.
function nombreDeAnalisis(propiedades: Record<string, unknown>, id: string) {
  if (id.startsWith("rn11_puentes")) return `Puente ${id.split(".").pop()} · ${propiedades.curso_de_agua ?? "sin curso cartografiado"}`
  if (id.startsWith("rn11_areas")) return `Área de ${propiedades.categoria}`
  return undefined
}

export function nombreElemento(propiedades: Record<string, unknown>, id: string) {
  const nombre = propiedades.nombre ?? nombreDeAnalisis(propiedades, id) ?? propiedades.provincia ?? propiedades.tipo
  return typeof nombre === "string" && nombre.trim() ? nombre : `Elemento ${id.split(".").pop()}`
}

export const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

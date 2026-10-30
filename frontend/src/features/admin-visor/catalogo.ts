// Agrupa las capas del SIG IGN 250 por tema. El orden de los grupos es también el orden de
// dibujo: los primeros quedan abajo (superficies) y los últimos arriba (puntos y relevamiento).
const GRUPOS: { titulo: string; patron: RegExp }[] = [
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

export const ORDEN_GRUPOS = [...GRUPOS.map((grupo) => grupo.titulo), GRUPO_OTRAS, GRUPO_RELEVAMIENTO]

export function grupoDeCapa(nombre: string, editable: boolean) {
  if (editable) return GRUPO_RELEVAMIENTO
  return GRUPOS.find((grupo) => grupo.patron.test(nombre))?.titulo ?? GRUPO_OTRAS
}

// Capas encendidas al abrir: dan contexto sin mapa de fondo.
export const CAPAS_INICIALES = ["provincias", "red_vial", "localidades"]

// Atributos técnicos del IGN que no aportan en la consulta.
const OCULTOS = /^(seleccionado|rectangulo|geom|gid|igds_|cell_name|group|rotation|sp|datum|ac|coord|t_act|progreso|cargo|responsabl|operador|dataset|fclass|signo|escala|length|shape_area)/

export function atributosVisibles(propiedades: Record<string, unknown>) {
  return Object.entries(propiedades).filter(
    ([clave, valor]) => !OCULTOS.test(clave) && valor !== null && valor !== "" && typeof valor !== "object",
  )
}

export function nombreElemento(propiedades: Record<string, unknown>, id: string) {
  const nombre = propiedades.nombre ?? propiedades.provincia ?? propiedades.tipo
  return typeof nombre === "string" && nombre.trim() ? nombre : `Elemento ${id.split(".").pop()}`
}

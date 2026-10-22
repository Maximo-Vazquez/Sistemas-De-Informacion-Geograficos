export type ServerParams = Record<string, string | string[] | undefined>

// Arma la URL GET que interpreta Django: omite vacíos y repite las claves multivalor.
export function serverListUrl(base: string, ...groups: ServerParams[]) {
  const merged: ServerParams = Object.assign({}, ...groups)
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
    else if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

// Orden de servidor con formato `<clave>_asc|desc`.
export function serverSort(orden: string, key: string) {
  const active = orden.startsWith(`${key}_`)
  return {
    active,
    descending: active && orden.endsWith("_desc"),
    next: `${key}_${orden === `${key}_asc` ? "desc" : "asc"}`,
  }
}

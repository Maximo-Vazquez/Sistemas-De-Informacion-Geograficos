// Formatos es-AR comunes a todas las pantallas de Administración.

const numberFormat = new Intl.NumberFormat("es-AR")

export const formatNumber = (value: number) => numberFormat.format(value)
// 1 decimal por defecto; los estados contables usan 2.
export const formatPct = (value: number, digits = 1) =>
  `${new Intl.NumberFormat("es-AR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)} %`

// Moneda real del dato (ARS, USD…); nunca convertir entre monedas en el cliente.
export const formatMoney = (value: number | string, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(Number(value))

// Las fechas sin hora llegan como YYYY-MM-DD; se construyen en hora local para no correr el día.
export const parseDate = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d)
}
export const formatDate = (
  value: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
) => parseDate(value).toLocaleDateString("es-AR", options)
export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
export const formatPeriod = (period: { desde: string; hasta: string }) =>
  `${formatDate(period.desde)} – ${formatDate(period.hasta)}`

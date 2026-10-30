// Colores del tema para estilos de OpenLayers (canvas). Lee los tokens de index.css en el
// momento de dibujar, así el mapa sigue al tema claro u oscuro sin colores escritos a mano.
export function tokenColor(token: string, alpha = 1) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
  if (!valor) return "currentColor"
  return alpha >= 1 ? valor : valor.replace(/\)\s*$/, ` / ${alpha})`)
}

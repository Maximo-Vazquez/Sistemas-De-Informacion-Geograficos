export type AdminNavLink = { label: string; href: string }
export type AdminNavItem = {
  id: string
  label: string
  icon: string
} & ({ href: string; children?: never } | { href?: never; children: AdminNavLink[] })
export type AdminNavSection = { id: string; label: string; items: AdminNavItem[] }
export type AdminUser = { nombre: string; email: string; iniciales: string; rol: string }
export type AdminPageData = {
  viewer: AdminUser & { id: number; superusuario: boolean }
  csrf: string
  currentUrl: string
  homeUrl: string
  brandName: string
  logoUrl: string
  navigation: AdminNavSection[]
  adminUrl: string
  accountUrl: string
  logoutUrl: string
  sidebarOpen: boolean
  messages: { level: string; text: string }[]
}

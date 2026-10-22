import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { AdminNav } from "./admin-nav"
import { AdminUserMenu } from "./admin-user-menu"
import type { AdminNavSection, AdminUser } from "./types"
import { useAdminNavigationState } from "./use-admin-navigation-state"

export type AdminSidebarProps = {
  navigation: AdminNavSection[]
  homeUrl: string
  brandName: string
  logoUrl: string
  currentUrl: string
  user: AdminUser
  accountUrl: string
  logoutUrl: string
  csrf: string
}

// Composición del bloque oficial sidebar-07, con las rutas del proyecto.
export function AdminSidebar({
  navigation,
  homeUrl,
  brandName,
  logoUrl,
  currentUrl,
  user,
  accountUrl,
  logoutUrl,
  csrf,
}: AdminSidebarProps) {
  const { state, isMobile } = useSidebar()
  const { expandedGroups, onExpandedChange, contentRef, onScroll } = useAdminNavigationState(user.email, navigation, currentUrl)
  return (
    <Sidebar collapsible="icon" variant="sidebar" expandOnHover aria-label="Panel de Administración">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
              tooltip={state === "collapsed" && !isMobile ? "Ir al inicio" : undefined}
              render={<a href={homeUrl} aria-label={`${brandName}, ir al inicio`} />}
            >
              <img
                src={logoUrl}
                alt={`Logo de ${brandName}`}
                className="size-8 shrink-0 rounded-lg bg-background object-contain p-0.5 shadow-xs ring-1 ring-sidebar-border"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{brandName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  Panel de administración
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent ref={contentRef} onScroll={onScroll} className="overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--muted-foreground)_transparent]">
        <AdminNav sections={navigation} currentUrl={currentUrl} expandedGroups={expandedGroups} onExpandedChange={onExpandedChange} />
      </SidebarContent>
      <SidebarFooter>
        <AdminUserMenu user={user} accountUrl={accountUrl} logoutUrl={logoutUrl} csrf={csrf} />
      </SidebarFooter>
    </Sidebar>
  )
}

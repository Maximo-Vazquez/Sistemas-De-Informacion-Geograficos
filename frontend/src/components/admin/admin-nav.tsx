import {
  BarChart3,
  ChevronRight,
  CircleDot,
  Layers,
  LayoutDashboard,
  Map as MapIcon,
  Route,
  Settings2,
  Users,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { AdminNavItem, AdminNavSection } from "./types"
import type { ExpandedGroups } from "./use-admin-navigation-state"

// Ítem activo: tinte y barra de acento en el color de marca, con transición suave.
const navButtonClass =
  "relative font-medium text-sidebar-foreground/80 hover:text-sidebar-accent-foreground [&>svg]:text-sidebar-foreground/60 [&>svg]:transition-colors hover:[&>svg]:text-sidebar-primary data-active:bg-sidebar-primary/10 data-active:font-semibold data-active:text-sidebar-primary data-active:[&>svg]:text-sidebar-primary before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:scale-y-0 before:rounded-full before:bg-sidebar-primary before:transition-transform before:duration-200 data-active:before:scale-y-100 motion-reduce:before:transition-none"

const ICONS = {
  dashboard: LayoutDashboard,
  layers: Layers,
  map: MapIcon,
  route: Route,
  analytics: BarChart3,
  users: Users,
  settings: Settings2,
}

function NavItem({ item, currentUrl, open, onOpenChange }: {
  item: AdminNavItem
  currentUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const Icon = ICONS[item.icon as keyof typeof ICONS] ?? CircleDot
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }
  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className={navButtonClass}
          tooltip={state === "collapsed" && !isMobile ? item.label : undefined}
          isActive={item.href === currentUrl}
          render={
            <a href={item.href} aria-current={item.href === currentUrl ? "page" : undefined} />
          }
          onClick={closeMobile}
        >
          <Icon />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  const active = item.children.some((child) => child.href === currentUrl)
  // El hover o el foco expanden el panel; mantener el mismo control evita
  // remontar el submenú bajo el puntero y perder foco/estado al salir del riel.
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} render={<SidebarMenuItem />} className="group/nav-section">
      <CollapsibleTrigger render={<SidebarMenuButton className={navButtonClass} isActive={active} />}>
        <Icon />
        <span>{item.label}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/nav-section:rotate-90 motion-reduce:transition-none" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="border-sidebar-primary/20">
          {item.children.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton
                isActive={child.href === currentUrl}
                className="text-sidebar-foreground/70 transition-colors data-active:bg-sidebar-primary/10 data-active:font-medium data-active:text-sidebar-primary"
                render={
                  <a
                    href={child.href}
                    aria-current={child.href === currentUrl ? "page" : undefined}
                  />
                }
                onClick={closeMobile}
              >
                <span>{child.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AdminNav({
  sections,
  currentUrl,
  expandedGroups,
  onExpandedChange,
}: {
  sections: AdminNavSection[]
  currentUrl: string
  expandedGroups: ExpandedGroups
  onExpandedChange: (id: string, open: boolean) => void
}) {
  return (
    <nav aria-label="Navegación de Administración">
      {sections.map((section) => (
        <SidebarGroup key={section.id}>
          <SidebarGroupLabel className="text-[0.7rem] font-semibold tracking-wider text-sidebar-foreground/50 uppercase transition-none">{section.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <NavItem key={item.id} item={item} currentUrl={currentUrl} open={expandedGroups[item.id] ?? false} onOpenChange={(open) => onExpandedChange(item.id, open)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  )
}

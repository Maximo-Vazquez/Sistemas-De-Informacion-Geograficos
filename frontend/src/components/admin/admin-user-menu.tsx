import { useId, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { ChevronsUpDown, CircleUserRound, LogOut, Monitor, Moon, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { changeTheme, originOf } from "@/lib/theme-transition"
import type { AdminUser } from "./types"

export function AdminUserMenu({
  user,
  accountUrl,
  logoutUrl,
  csrf,
}: {
  user: AdminUser
  accountUrl: string
  logoutUrl: string
  csrf: string
}) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const form = useRef<HTMLFormElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const formId = useId()
  const [open, setOpen] = useState(false)
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  ref={trigger}
                  size="lg"
                  aria-label={`Menú de ${user.nombre}`}
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{user.iniciales}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.nombre}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              className="min-w-64"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2 py-1">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback>{user.iniciales}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <span>{user.nombre}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.rol}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              {accountUrl && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<a href={accountUrl} />}>
                      <CircleUserRound />
                      Mi cuenta
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={theme || "system"}
                  onValueChange={(value) => {
                    setOpen(false)
                    changeTheme(setTheme, value, originOf(trigger.current))
                  }}
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun />
                    Claro
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon />
                    Oscuro
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor />
                    Sistema
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => form.current?.requestSubmit()}>
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <form ref={form} id={formId} action={logoutUrl} method="post" hidden>
        <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
      </form>
    </>
  )
}

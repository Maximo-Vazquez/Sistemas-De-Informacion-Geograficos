import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { changeTheme, originOf } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

// Alterna claro/oscuro con la transición circular del tema. Lo usan Administración y las pantallas públicas.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      className={cn("relative", className)}
      variant="ghost"
      size="icon-sm"
      aria-label="Cambiar tema"
      onClick={(event) =>
        changeTheme(setTheme, resolvedTheme === "dark" ? "light" : "dark", originOf(event.currentTarget))
      }
    >
      <Sun className="scale-100 rotate-0 transition-transform duration-500 ease-(--sidebar-ease) dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-transform duration-500 ease-(--sidebar-ease) dark:scale-100 dark:rotate-0" />
    </Button>
  )
}

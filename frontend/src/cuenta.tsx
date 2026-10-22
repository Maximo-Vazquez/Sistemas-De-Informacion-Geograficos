import { mountAdminPage } from "@/lib/mount-admin-page"
import { CuentaPage } from "@/features/cuenta/cuenta-page"
import type { CuentaData } from "@/features/cuenta/types"
import "./index.css"

// Login, cierre de sesión, error de Google y 403 comparten esta entrada.
mountAdminPage<CuentaData>("cuenta-root", "cuenta-data", CuentaPage)

import { mountAdminPage } from "@/lib/mount-admin-page"
import { InicioPage } from "@/features/inicio/inicio-page"
import type { InicioData } from "@/features/inicio/types"
import "./index.css"

mountAdminPage<InicioData>("inicio-root", "inicio-data", InicioPage)

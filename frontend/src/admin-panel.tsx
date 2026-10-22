import { mountAdminPage } from "@/lib/mount-admin-page"
import { PanelPage } from "@/features/admin-panel/panel-page"
import type { PanelData } from "@/features/admin-panel/types"
import "./index.css"

mountAdminPage<PanelData>("admin-panel-root", "admin-panel-data", PanelPage)

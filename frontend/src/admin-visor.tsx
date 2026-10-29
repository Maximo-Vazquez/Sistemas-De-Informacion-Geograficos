import { mountAdminPage } from "@/lib/mount-admin-page"
import { VisorPage } from "@/features/admin-visor/visor-page"
import type { VisorData } from "@/features/admin-visor/types"
import "ol/ol.css"
import "./index.css"

mountAdminPage<VisorData>("admin-visor-root", "admin-visor-data", VisorPage)

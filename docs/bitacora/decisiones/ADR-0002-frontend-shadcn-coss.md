---
id: ADR-0002
titulo: Frontend React con shadcn (Base UI) y coss
estado: aceptada
fecha: 2026-10-22
---

## Contexto

La aplicación necesita pantallas consistentes (inicio, Administración, paneles de datos y, más adelante, el visor) con accesibilidad, tema claro/oscuro y uso en móvil, sin diseñar cada control desde cero.

## Opciones consideradas

- Plantillas Django con Bootstrap.
- React con shadcn sobre Base UI, complementado con coss.
- React con una biblioteca cerrada de componentes.

## Decisión

React con shadcn (Base UI) y coss, más componentes compartidos propios (`data-table`, `dashboard`, `admin`, `detail`, `upload`, `app`) y skills de diseño (`admin-visual-style`, `admin-screens`, `data-tables`, `frontend-components`, `shadcn`, `coss`). Django monta cada pantalla React desde un `json_script`; las entradas `admin-*.tsx` se registran solas en Vite.

## Consecuencias

- Un único patrón visual para todas las pantallas, controlado por `check:colores`.
- Los primitivos se agregan o actualizan con el CLI de shadcn.
- Las pantallas públicas y Administración comparten el cambio de tema (`components/app/theme-toggle.tsx`).

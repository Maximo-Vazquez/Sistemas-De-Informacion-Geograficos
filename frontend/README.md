# Frontend del Visor SIG Chaco

React + TypeScript + Vite + Tailwind v4. Django monta cada pantalla: la plantilla entrega los datos con `json_script` y carga la entrada compilada con `{% vite_assets %}`.

## Desarrollo

Node 24 y pnpm 10.32.1 (versión declarada en `package.json`). Desde la raíz del repositorio:

```powershell
corepack enable
pnpm --dir frontend install --frozen-lockfile
pnpm --dir frontend typecheck
pnpm --dir frontend check:colores
$env:VITE_OUTPUT_DIR = "../static/frontend"; pnpm --dir frontend exec vite build
```

El build en `static/frontend/` es el que usa `runserver`. Docker compila el frontend en su propia etapa con el mismo lockfile.

## Entradas

- `src/inicio.tsx`: pantalla pública de inicio.
- `src/cuenta.tsx`: login, cierre de sesión, error de Google y acceso denegado.
- `src/admin-*.tsx`: pantallas de Administración; se registran solas en `vite.config.ts`.

## Componentes

- `src/components/ui/`: primitivos shadcn sobre Base UI, estilo `base-nova`. Primera opción.
- `src/components/coss/`: complementos coss para lo que shadcn no trae; sus duplicados de shadcn existen solo como soporte.
- `src/components/admin/`, `data-table/`, `dashboard/`, `detail/`, `upload/` y `app/`: componentes compartidos de la aplicación.
- `src/features/<seccion>/`: datos, reglas y composición de cada pantalla.

Base UI compone con `render`, no con `asChild`. Las notificaciones usan `Toaster` de `ui/sonner` y `toast` de `sonner`.

## Tema

`src/index.css` define los tokens de claro y oscuro (tema neutral de shadcn, Inter y colores semánticos). Las features no escriben colores: `pnpm check:colores` falla si encuentra colores fuera de los tokens. Ver `.agents/skills/admin-visual-style/SKILL.md`.

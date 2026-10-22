---
name: frontend-components
description: Construir, auditar o extender componentes del frontend del Visor SIG Chaco (shadcn sobre Base UI + coss), reutilizando los componentes compartidos y respetando los contratos con Django.
---

# Componentes del Visor SIG Chaco

Leer `AGENTS.md`. Antes de cambiar un componente, revisar sus consumidores y la plantilla Django que monta la pantalla.

## Bibliotecas
- `components/ui/`: primitivos shadcn sobre **Base UI**, estilo `base-nova` (`frontend/components.json`). Primera opción.
- `components/coss/`: complementos coss para lo que shadcn no trae (autocomplete, number-field, toolbar, composer…). Sus duplicados de shadcn existen solo como soporte de sus complementos.
- Compartidos de la aplicación: `components/admin/` (layout, sidebar, formularios, estados), `components/data-table/`, `components/dashboard/` (métricas, paneles, gráficos), `components/detail/`, `components/upload/` y `components/app/` (pantallas públicas y tema).
- No hay Radix: Base UI compone con `render`, no con `asChild`.

## Elegir la capa
- Reutilizar primero un componente compartido; agregar ahí capacidades comunes y dejar las reglas del dominio en la feature, por props, slots o callbacks.
- Si falta un primitivo: consultar `.agents/skills/shadcn/SKILL.md`, buscar en el registro y revisar dependencias antes de instalar con el CLI. Para faltantes, `coss` y `coss-particles`.
- Tres capas: primitivos → compartidos → feature (`features/<seccion>/` con `types.ts`). Props tipadas, defaults y composición; sin herencia ni condiciones por nombre de dominio en los genéricos.
- No modificar a mano `components/ui/` salvo un ajuste mínimo justificado; los primitivos nuevos se generan con el CLI.
- Una sola fuente de verdad por estado; hooks para lógica compartida cuando la presentación difiere.

## Montaje desde Django
- Cada pantalla es una entrada `frontend/src/<nombre>.tsx` que llama a `mountAdminPage(rootId, dataId, Page)`. Las entradas `admin-*.tsx` se registran solas en `vite.config.ts`.
- La plantilla incluye `templates/includes/react_page.html` (`json_script` + raíz + `{% vite_assets %}`); los datos los arma un `selectors.py`/`contexto.py` en Python.
- Formularios: `<form method="post">` real con `csrfmiddlewaretoken` y los mismos nombres de campo que espera Django.

## Mapas (etapa siguiente)
El visor del TPI (capas WMS/WFS, leyenda, escala, consultas, medición y edición) va en `features/visor/`, con la biblioteca de mapas elegida y registrada como ADR en la bitácora. Los controles del visor se arman con los primitivos de `components/ui/`.

## Cierre
`pnpm --dir frontend typecheck`, `build` y `check:colores`; probar claro/oscuro, teclado y móvil. Informar lo que no se pudo comprobar.

---
name: data-tables
description: Patrón único de tablas de Administración del Visor SIG Chaco (listados ABM con paginación de servidor, filtros, chips, resumen y vista móvil). Usar al crear, migrar o revisar cualquier pantalla con tabla para que todas se usen igual.
---

# Tablas de Administración

Principio: **si aprendiste a usar una pantalla, ya sabés usar las demás.** Toda tabla respeta la misma anatomía, los mismos lugares y las mismas palabras. Por dominio cambian columnas, filtros y acciones, nunca la disposición.

Leer antes `AGENTS.md` y `.agents/skills/frontend-components/SKILL.md`. Todavía no hay tablas en el proyecto: la primera (p. ej. features de capas o elementos cargados) debe usar `components/data-table/` tal como describe esta skill.

## Anatomía (de arriba a abajo)

1. **Encabezado** — `AdminPageHeader`: título, una línea de propósito y acciones de página. Alta con `variant="success"`; exportar el resultado completo en `outline`.
2. **Barra** — `DataTableToolbar`, siempre en este orden:
   - Búsqueda (label "Buscar <entidad>", se envía con Enter o "Buscar").
   - `quickFilters`: hasta **2** filtros rápidos. `DataTableSelectFilter` (un valor, aplica al elegir) o `DataTableFacetedFilter` con `onClose` (varios valores, aplica al cerrar).
   - `filterButton`: `DataTableFilterTrigger`. En escritorio dice "Más filtros" y cuenta grupos avanzados aplicados; en móvil dice "Filtros" y cuenta todos. Con `hasAdvanced={false}` solo aparece en móvil.
   - `actions` (solo escritorio): selección contextual y "Columnas", si la pantalla los necesita.
3. **Chips** — `DataTableActiveFilters`: un chip por valor aplicado ("Filtro: valor", también búsqueda, fechas y rangos con `rangeLabel`). La ✕ quita ese valor y vuelve a la página 1; "Limpiar todo" vuelve a la URL base. No hay otro botón de limpiar.
4. **Resumen (opcional)** — `DataTableSummary`: una línea de cifras sobre el **resultado filtrado completo** (`stats` del servidor). Cada cifra con `onSelect` aplica su filtro equivalente y se marca `active`. Usarlo solo cuando las cifras ayudan a decidir (no en ABM simples). Nunca tarjetas KPI encima de la tabla.
5. **Tabla** — `DataTable` + `useServerTable`:
   - Primera columna = identidad: `Button variant="link"` que abre la vista principal (Sheet de detalle o Dialog de edición) + dato secundario en `text-muted-foreground`.
   - Estados como `Badge`; fechas y números con `tabular-nums` y `es-AR`.
   - Orden solo desde encabezados (`DataTableColumnHeader` + `serverSort`).
   - Última columna: `DataTableRowActions` ("⋯", encabezado `sr-only`). Orden: ver → editar/relacionados → `DropdownMenuSeparator` → destructivas (siempre con confirmación). Reusar la misma función de acciones en tabla y tarjeta.
6. **Paginación** — `DataTablePagination`, siempre visible; único lugar del total ("1–12 de 33"). Cambiar filas por página vuelve a la página 1.
7. **Feedback** — mensajes de Django como toast de Sonner al montar.

## Panel de filtros (`DataTableFilterSheet`)
- Recibe `sections: FilterSection[]` (`id`, `title`, `count` del borrador, `content`, `quick`). Las secciones `quick` repiten los filtros rápidos y solo se muestran en móvil.
- Acordeón: abre la primera sección y las que tienen valor. Controles según el dato: `DataTableOptionList` (casillas con conteo; buscador interno con más de 8 opciones; `single` si el servidor acepta un valor), `DataTableDateRange` con `datePresets("past" | "future")`, `DataTableNumberRange`. Ambos rangos validan desde ≤ hasta.
- Edita un borrador (al abrir, copiar los filtros aplicados) y aplica todo junto. Pie fijo: "Limpiar" (recibe los `ids` visibles: en escritorio no borra los filtros rápidos) y "Aplicar filtros (n)".
- En móvil se abre desde abajo (máx. 88dvh) con todas las secciones.

## Móvil (< 768 px)
- Búsqueda a todo el ancho con botón de ícono; filtros rápidos y `actions` se ocultan; "Filtros" reúne todo.
- Chips con desplazamiento horizontal en una línea.
- `renderCard`: cada fila es una tarjeta (identidad + secundario, badges, 1–2 datos clave, "⋯"). `DataTable` monta una sola vista (tabla o tarjetas), nunca ambas.
- Paginación compacta: "‹ 1/3 ›", sin selector de filas ni primera/última.
- Sin scroll horizontal de página (`scrollWidth <= innerWidth`).

## Qué no agregar por defecto
KPIs en tarjetas, pestañas que duplican un filtro, selects de orden, selección masiva, exportación, opciones de columnas o contadores fuera de la paginación. Solo con una necesidad verificada y en el lugar que les da la anatomía.

## Contrato con Django
- Filtros, orden y página por GET. Navegar con `serverListUrl(base, aplicados, { page_size }, extras)`; todo cambio de filtro u orden manda `page: "1"`.
- Datos con `json_script` y un adaptador `*_ui.py`/`*_table.py` que resuelve filtros, facetas con conteos y `stats` sobre el queryset completo. No filtrar ni paginar en el cliente.
- Acciones POST con CSRF, `next` y endpoints existentes. La selección pertenece a la página cargada.

## Checklist de una pantalla nueva
- [ ] Encabezado, barra, chips, (resumen), tabla y paginación con los componentes de arriba.
- [ ] ≤ 2 filtros rápidos; el resto como secciones del panel; las rápidas también como secciones `quick`.
- [ ] Chips para cada filtro aplicado, incluida la búsqueda.
- [ ] `renderCard` para móvil, con las mismas acciones que la fila.
- [ ] Labels: "Buscar …", "Acciones de <nombre>", "Quitar filtro …".
- [ ] Tests (y E2E cuando exista la suite) con los textos comunes ("Buscar", "Más filtros", "Filtros", "Aplicar filtros (n)", "Limpiar todo", "1–N de T") y una prueba móvil.
- [ ] Capturas claro/oscuro/móvil revisadas.

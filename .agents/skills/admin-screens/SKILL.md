---
name: admin-screens
description: Patrón único de pantallas de Administración del Visor SIG Chaco (formularios, detalle, eliminación, paneles de datos, montaje y flujo con tests primero). Usar junto con data-tables al crear o revisar cualquier sección de Administración.
---

# Pantallas de Administración

Principio: **si aprendiste a usar una pantalla, ya sabés usar las demás.** Mismos lugares, mismas palabras, mismos componentes.

Leer antes: `AGENTS.md`, `.agents/skills/frontend-components/SKILL.md`, `.agents/skills/data-tables/SKILL.md` y `.agents/skills/django-backend/SKILL.md`. Referencia implementada: `features/admin-panel/` (panel de datos).

## Flujo: tests primero
1. **Contrato** de la pantalla: URL y nombre de ruta, método, campos, CSRF, `next`, mensajes, redirecciones y permiso (sesión requerida con `login_required`).
2. **Tests Django** en `apps/<app>/tests.py` (o `tests/` si crece): GET sin sesión (redirige al login) y con sesión (200); POST válido e inválido, efectos en base, filtros y paginación si existen.
3. **Implementación**. Si una aserción de comportamiento tiene que cambiar, detenerse y reportarlo.
4. Verificar: tests, `ruff`, `pnpm --dir frontend typecheck`, `build`, `check:colores` y capturas claro/oscuro/móvil.

## Montaje (Django → React)
- `apps/<app>/selectors.py` arma el diccionario de la página: `**datos_pagina_admin(request)` (contrato `AdminPageData` de `contexto.py`) más los datos propios, con URLs por `reverse`.
- Vista con `@login_required` que renderiza una plantilla de una línea con `templates/includes/react_page.html`.
- Entrada `frontend/src/admin-<seccion>.tsx` con `mountAdminPage(rootId, dataId, Page)`; Vite y `index.css` la registran solos.
- Feature en `frontend/src/features/admin-<seccion>/` (`types.ts`, página, formulario…). Página: `AdminLayout` + `AdminPageHeader`; mensajes con `useDjangoMessages(data.messages)`.
- Ítem del sidebar en `apps/administracion/navegacion.py`; su `icon` debe existir en `ICONS` de `components/admin/admin-nav.tsx`.

## Formularios
- Formularios cortos (≤ ~6 campos, sin dependencias): `Dialog` sobre la lista (`Accept: application/json` devuelve form/errores y sin header se conserva POST + redirect). Largos o con secciones: página propia con `contentWidth="form"`.
- Siempre `<form method="post" action=… noValidate>` con `csrfmiddlewaretoken` y los **mismos nombres de campo** que espera Django. Checkboxes/selects de Base UI se envían con `<input type="hidden">`.
- Estructura: `FormErrorSummary` arriba → `FieldGroup` con `Field`/`FieldLabel`/`FieldError` (id `<campo>-error`, `aria-invalid`, `aria-describedby`) → grupos con `FieldSet`/`FieldLegend` → `FormActions` abajo ("Cancelar" + "Guardar cambios"/"Crear …", estado "Guardando…").
- Controles: `Input`, `Textarea`, `Select` (≤ 10 opciones), `Combobox` (más), `Checkbox`/`Switch` (booleanos), `NumberField` de coss para montos/cantidades, `type="date"` para fechas. Montos con `es-AR` y moneda real.
- Errores del servidor se conservan con los valores ingresados; nunca cerrar el modal ni perder datos ante error. Comprobar `response.ok` y `redirected`.

### Formularios largos o complejos
- `contentWidth="editor"` + `FormLayout` (`components/admin/form-layout.tsx`): secciones a la izquierda y panel fijo a la derecha con **resumen en vivo**, `FormChecklist` (qué falta) y el botón principal siempre visible. En móvil, `mobileBar` fija abajo con lo esencial y el botón.
- Pocas secciones (≈5) agrupadas por cómo se piensa el objeto, con `FormSection`: plegable, `summary` cuando está cerrada, `invalid` la abre y la marca. Al crear se abren las clave; al editar, plegadas con su resumen. El contenido queda montado (inputs de archivo y valores siguen en el `<form>`).
- **Todo lo repetible** (planes, módulos, ítems…) con `EditableList` (`components/admin/editable-list.tsx`): una fila compacta por ítem y un **modal** para editar; validación por ítem en el modal; las filas con error muestran "Revisar". Los ítems viajan en el JSON oculto y se guardan con el resto. Los archivos **no** van en modales: quedan en una sección.
- Dependencias (tipo, categoría…): botón "+" junto al select que abre un modal y crea por `Accept: application/json` sin salir; el valor nuevo queda elegido.

## Detalle
- El nombre de la fila abre `DetailSheet` (`components/detail/detail-sheet.tsx`): título, descripción, `badges` de estado, `sections` de `DetailList` (etiqueta/valor) y `actions` en el pie (Editar → relacionadas → destructivas). Datos secundarios van acá, no como columnas.
- Si la entidad se edita en modal, el nombre abre la edición directamente.

## Eliminación
- `ConfirmDeleteDialog` (`components/admin/confirm-delete-dialog.tsx`) desde el menú "⋯" o el detalle: POST real al endpoint existente, `impact` con cantidades afectadas, `blockedReason` cuando el servidor lo impide (protegidos), `hiddenFields` para `next` u otros.

## Imágenes y archivos
- Siempre `MediaUpload` (`components/upload/media-upload.tsx`): arrastrar y soltar, vista previa en cuadrícula, ampliación en diálogo, quitar antes de subir y validación de tipo/tamaño. Envía un `<input type="file" name>` real con el mismo nombre que espera Django (form `multipart/form-data`).
- Simple (`multiple={false}`): `existing` muestra el archivo guardado; uno nuevo lo reemplaza; `removeName` envía `<removeName>=on` si el usuario lo quita (p. ej. `*_clear`). Múltiple: cada existente quitado envía `<removeName>=<id>`.
- `aspect="square"` para logos/avatares, `"video"` para portadas/banners. `accept="image/*,video/*"` cuando el campo admite video. Nunca inputs de archivo nativos sueltos.

## Ajustes del sistema (páginas de configuración)
- `AdminLayout` con `contentWidth="form"` + `AdminPageHeader` (título y para qué sirve). Si la página es larga, índice de anclas arriba.
- Cada grupo de opciones en `SettingsSection` (`components/admin/settings.tsx`) con título, descripción y `SettingsStatus` cuando hay una integración ("Configurado", "Falta configurar", "Modo prueba", "Error").
- Un solo `<form method="post">` por página (o uno por sección solo si Django ya separa los POST); `FormErrorSummary` arriba, `FormActions` fijo abajo (`sticky bottom-0`) y `useUnsavedChanges(dirty)`.
- Credenciales y tokens con `SecretField` (oculto, botón mostrar, `autoComplete="off"`). No cambiar qué devuelve el servidor: si hoy el template recibe el secreto, se mantiene pero se reporta como riesgo; no inventar "dejar vacío para conservar" si la vista no lo soporta.
- Booleanos con `Switch` + descripción de efecto. Acciones con efecto externo (probar conexión, sincronizar) como botones secundarios dentro de su sección, con resultado visible y sin éxito falso.
- Listas editables (preguntas frecuentes, etc.) usan el patrón `data-tables` + modal de alta/edición + `ConfirmDeleteDialog`. Textos largos (términos y condiciones) con `Textarea` amplia y vista previa si el contenido se renderiza como HTML/Markdown en el sitio.

## Color, estados y montos
Todo uso de color (estados, iconos de sección, avisos, acciones secundarias, montos) sigue `.agents/skills/admin-visual-style/SKILL.md`, la fuente de verdad del color, y debe pasar `pnpm --dir frontend check:colores`.

## Paneles de datos (estadísticas, ingresos, métricas, resultados)
- Piezas compartidas obligatorias (`components/dashboard/panel.tsx` y `lib/format.ts`): `PeriodRange` (presets + "Personalizado" por GET, con `params` para conservar otros filtros), `PanelViewNav` (vistas de un mismo panel), `PanelEmpty` (período sin datos), `DetailTable` + `numeric` (listados completos sin paginación), `DonutChart` (`components/dashboard/donut-chart.tsx`: parte de un todo con hasta 6 segmentos, total al centro y leyenda con importe y %) y formateadores `formatNumber`, `formatPct`, `formatMoney`, `formatDate`, `formatDateTime`, `formatPeriod`. Referencia: `features/admin-panel/`. No crear copias en la feature.
- Encabezado con `PeriodRange` (o `PeriodFilter` si no hay rango propio) en `actions` (GET; el servidor recalcula). Luego `MetricGrid` con 2–4 `MetricCard` (cifras que ayudan a decidir, con `hint` del alcance), después `ChartCard` con gráficos (`components/ui/chart` + Recharts; leer la skill `dataviz` antes de graficar) y al final una tabla de detalle con el patrón `data-tables` si hay registros.
- Sin datos: estado `Empty` explicando el período. Números `tabular-nums`, `es-AR`, moneda real.

## Reglas para agentes paralelos
- Tocar solo la feature, la entrada, la plantilla, los selectors/vistas/urls y los tests **de su sección**.
- **No modificar** `components/*`, `lib`, `vite.config.ts` ni `index.css` sin acordarlo: si falta algo compartido, implementar lo mínimo en la feature y proponerlo.
- No deploy ni push. Commits con Conventional Commits y entrada en la bitácora (`.agents/skills/bitacora/SKILL.md`).

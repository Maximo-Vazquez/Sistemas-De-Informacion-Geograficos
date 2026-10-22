---
name: admin-visual-style
description: Patrón visual de color del Visor SIG Chaco (Administración, inicio y pantallas React). Usar SIEMPRE al crear, migrar o revisar una pantalla, al elegir colores, estados, iconos, badges, avisos, botones o montos, y antes de entregar UI. Evita pantallas en blanco y negro sin saturar: base neutra con acentos de marca y semánticos con reglas fijas, tokens centralizados y un chequeo automático.
---

# Estilo visual del Visor SIG Chaco

**Base neutra, color con significado.** Las pantallas no deben quedar en blanco y negro, pero el color nunca decora: cada acento dice "esto se puede hacer", "esto está bien", "esto espera" o "esto falló". Referencias: `features/inicio/` (estados de consignas) y `features/admin-panel/` (paneles).

Usar junto con [admin-screens](../admin-screens/SKILL.md) (estructura de pantallas), [data-tables](../data-tables/SKILL.md) (tablas) y [frontend-components](../frontend-components/SKILL.md). Esta skill es la **fuente de verdad del color**; las demás remiten acá.

## 1. Qué color va dónde

| Papel | Color | Cómo |
|---|---|---|
| Fondo, tarjetas, campos, títulos, texto de cuerpo | Neutro | Tokens `background`, `card`, `muted`, `foreground`, `muted-foreground`. Nunca texto de cuerpo o títulos de color |
| Acción principal (una por vista) | Marca relleno | `Button` por defecto (`bg-primary`). Altas incluidas: no verde |
| Acciones secundarias | Texto de marca | `Button`/`Enlace` `variant="outline-primary"` ("Volver", "Administrar", "Extender") |
| Acciones terciarias y menús | Neutro | `ghost`/`outline`, menú "⋯" |
| Enlaces, navegación activa, foco, selección, interruptores | Marca | Lo dan los primitivos; no repintar |
| Identidad de una tarjeta o sección | Recuadro de icono | `IconTile` / `SettingsSection icon=` (marca tenue). Uno por tarjeta, nunca por campo |
| Estado de un registro | Icono semántico + texto neutro | `StatusIndicator tone=` |
| Dato secundario o etiqueta | Pastilla suave | `Badge` `secondary`/`outline`; `success`/`warning`/`destructive` suaves solo con significado |
| Aviso que requiere atención | Ámbar | `Alert variant="warning"` con icono y qué falta |
| Error o bloqueo | Rojo | `Alert variant="destructive"`, `ConfirmDeleteDialog`, botón `destructive` solo para la acción destructiva |
| Dinero | Por significado | `Amount` / `amountToneClass`: `income` verde, `expense` rojo, `auto` por signo, `pending` ámbar, cero gris |
| Gráficos | Paleta de gráficos | `--chart-*` vía `components/ui/chart` (skill `dataviz`) |

Tonos de `StatusIndicator`:
- `ok` ✓ verde: activo, completado, en posesión, configurado, público.
- `pending` ⏱ ámbar: pendiente de pago, reservado, en proceso.
- `warning` ámbar: requiere revisión, pausado, falta configurar.
- `error` ✕ rojo: inactivo, rechazado, caducado, falló.
- `neutral` gris: sin estado, sin crear, desactivado a propósito.
- `info` marca: autorizado o informativo.

## 2. Presupuesto de color por vista (no saturar)

- **1** botón primario relleno por vista (más uno por diálogo abierto).
- **Como máximo 1** superficie tintada grande (un `Alert` destacado o un callout). Si hay más avisos, el resto va neutro o se agrupa.
- Los estados **siempre** llevan icono y texto; el color nunca es la única señal.
- Recuadros de icono: uno por tarjeta de detalle o de ajustes. Las listas no llevan recuadros por fila.
- Las tablas llevan color solo en estados, montos con significado y enlaces. Las columnas de texto quedan neutras.
- No inventar KPIs, badges ni avisos para "sumar color". Un ABM simple puede tener pocos acentos y está bien.
- Prohibido pintar fondos de tarjetas enteras, títulos o filas completas con color semántico.

## 3. Mantenibilidad: dónde viven los colores

- **Tokens** en [index.css](../../../frontend/src/index.css): `--primary` (azul de marca del usuario, no cambiar sin pedido), `--success`, `--warning`, `--destructive` y los de texto semántico `--success-text` y `--warning-text` (mezcla con `foreground` para contraste AA en claro y oscuro). Cambiar un tono es editar **solo** ese archivo.
- **Componentes** que encapsulan el color:
  - [visual.tsx](../../../frontend/src/components/admin/visual.tsx): `StatusIndicator`, `IconTile`, `TileHeading`.
  - [amount.tsx](../../../frontend/src/components/admin/amount.tsx): `Amount`, `amountToneClass`.
  - [settings.tsx](../../../frontend/src/components/admin/settings.tsx): `SettingsSection icon`, `SettingsStatus appearance="soft"`.
  - Variantes de `Badge` (`success`, `warning` suaves), `Alert` (`warning`) y `Button` (`outline-primary`) en `components/ui/`.
- **Las features no escriben colores.** Prohibido en `features/` y en `components/` de la aplicación:
  - Clases de paleta cruda (`text-green-600`, `bg-blue-100`, `border-amber-*`…).
  - Hex, `rgb(`, `oklch(` o `color-mix(` sueltos.
  - Clases arbitrarias de color (`text-[...]`).

  Si falta un caso, se agrega una variante o un token en la capa compartida, revisando sus consumidores.
- **Mapeo de dominio a tono en la feature** (p. ej. `ESTADO_CONSIGNA` en `features/inicio/types.ts`): la feature decide el significado y el componente compartido decide el color.

## 4. Iconos

- Lucide, por función, peso y tamaño coherentes (los componentes fijan el tamaño).
- Iconos decorativos con `aria-hidden`; no duplicar el nombre accesible del título.
- Navegación y acciones secundarias: iconos neutros. El acento queda para el estado seleccionado o el foco.

## 4b. Tamaño de los controles (táctil)

- Estándar: **44 px** de área táctil en pantallas táctiles (Apple HIG 44 pt, WCAG 2.5.5 AAA; mínimo AA 2.5.8 = 24 px). En computadora, **36 px** (`h-9`, default de shadcn).
- Lo resuelven los componentes de `components/ui/` con la variante `pointer-coarse:`: Input, Select, NativeSelect, InputGroup, Combobox, Button, Toggle, ítems de menús y del sidebar. Checkbox y radio crecen a 20 px con un área invisible de 44 px.
- En las pantallas **no** fijar alturas (`h-8`, `size-7`…) sobre controles: usar los `size` del componente. Si hace falta un control nuevo, aplicar la misma regla en el primitivo.
- Texto de los campos: 16 px en táctil (evita el zoom de iOS al enfocar).

## 5. Chequeo automático (obligatorio antes de entregar)

`pnpm --dir frontend check:colores` falla si una feature o un componente de la aplicación usa colores fuera de los tokens. Corrérselo siempre junto con `typecheck`. No se silencia con excepciones por pantalla: si algo necesita color nuevo, se resuelve en tokens o componentes compartidos.

## 6. Verificación visual

- **Capturar el antes** de editar, con los mismos datos, tamaño, tema y scroll que el después. Mientras no haya suite E2E, capturar con el navegador a mano y guardar fuera del repositorio.
- Revisar claro, oscuro y móvil:
  - Contraste del texto e iconos.
  - Estados distinguibles sin depender del color.
  - El presupuesto de color de la sección 2.
  - Foco y teclado.
- Entregar comparaciones lado a lado. Compilar no es validar visualmente.
- "Configurado" significa que están los datos; no prueba una conexión. No mostrar "Conectado" ni éxito de una operación sin comprobarlo.

## Checklist

- [ ] Un solo botón primario relleno; secundarias en `outline-primary`.
- [ ] Estados con `StatusIndicator` (icono + texto) y tono por significado.
- [ ] Tarjetas de detalle o ajustes con `IconTile`/`SettingsSection icon`.
- [ ] Avisos pendientes en `Alert warning`; errores en `destructive`.
- [ ] Montos con `Amount`.
- [ ] Sin colores crudos: `check:colores` en verde.
- [ ] Controles sin alturas fijas en la pantalla: 44 px en táctil vía los componentes base.
- [ ] Capturas antes/después en claro, oscuro y móvil, revisadas.

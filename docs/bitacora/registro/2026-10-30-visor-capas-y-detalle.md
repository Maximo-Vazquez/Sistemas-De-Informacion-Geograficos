---
fecha: 2026-10-30
titulo: Visor - capas en el mapa, catálogo y detalle de elementos
autor: Vazquez Maximo Ezequiel
decisiones: []
---

## Objetivo

Simplificar la selección de capas (47 interruptores juntos) y mejorar cómo se ve el detalle de los elementos consultados.

## Trabajo realizado

- Panel de capas reorganizado: muestra solo las **capas en el mapa**, de arriba hacia abajo, con su leyenda, opacidad, ojo para ocultar y botón para quitar. Se reordenan arrastrando (dnd-kit 6.3.1, también con teclado).
- **Catálogo** para agregar capas: diálogo con buscador (`Command` de shadcn), agrupado por tema y con marca de las que ya están en el mapa. Se abre con "Agregar" o con la tecla C.
- **Temas rápidos**: Obra RN 11, Hidrografía, Transporte y Límites cambian las capas del mapa con un clic.
- Nombres legibles para las 47 capas y los atributos del IGN (`catalogo.ts`): por ejemplo `canthab` se muestra como "Habitantes" con separador de miles, y los campos técnicos se ocultan.
- Consulta por punto: **globo** junto al clic con el nombre, la capa y los datos clave; flechas para recorrer los elementos encontrados y "Ver todos los datos" abre el **panel de detalle** (`DetailSheet`, el mismo de Administración) con atributos y ubicación.
- Consulta por área: **tabla de atributos** bajo el mapa, con una pestaña por capa, orden por columna, exportación a CSV y la fila elegida resaltada en el mapa. El nombre abre el detalle.
- Al elegir un resultado, el mapa solo se desplaza si el elemento quedó fuera de la vista; ya no acerca de más.
- `DataTable` compartido: nueva opción `onRowClick` para hacer clic en la fila entera.

## Verificación

- Pruebas de navegador del visor (6): catálogo y leyenda, temas rápidos, globo y detalle, tabla de atributos y detalle, medición y carga de elementos. Suite completa: 15 en verde.
- Tests de Django (19), `pnpm typecheck`, `pnpm build` y `check:colores` en verde.
- Capturas revisadas en escritorio, tema claro.

## Problemas y soluciones

- El globo de una consulta por punto quedaba abierto al cambiar de herramienta: los resultados se limpian al elegir otra herramienta y se conservan al volver a Navegar.

## Pendientes

- Revisar el panel de capas en el celular.

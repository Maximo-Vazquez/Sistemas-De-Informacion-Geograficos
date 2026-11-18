---
fecha: 2026-11-17
titulo: Integración de mejoras del visor
autor: Asistencia técnica del proyecto
decisiones: []
---

## Objetivo

Integrar los cambios de la rama de Joaquín en la rama de trabajo que contiene la carga de capas IGN, conservando intacta `develop`.

## Trabajo realizado

- Se integró `feature/visor-buscador-grupos` en `feature/postgis-capas-ign` mediante un avance rápido de `b40b9de` a `984ef06`, sin conflictos.
- Se incorporaron la búsqueda y agrupación de capas, la medición de distancias y las consultas gráficas por punto y rectángulo, junto con las pruebas de navegador aportadas en esa rama.
- Se actualizaron los pendientes para distinguir las funciones implementadas de las que todavía necesitan validación con las capas reales.
- Pasaron la compilación del frontend con comprobación de TypeScript, el control de colores, Ruff y las 13 pruebas de Django. El control orientativo de largo de archivos informó un componente que supera la referencia.

## Problemas y soluciones

- La integración fue posible sin resolver conflictos porque la rama del visor ya incluía el trabajo de carga de capas.
- No se ejecutaron las pruebas de navegador durante esta integración. Las pruebas incorporadas para las herramientas del visor simulan las respuestas de los servicios de mapas.

## Pendientes

- Ejecutar las pruebas de navegador y verificar las herramientas, las leyendas y los interruptores con las capas reales del IGN.
- Implementar el alta de elementos con geometría y atributos; la consigna del visor continúa en curso.
- Completar los análisis y el mapa de las consignas restantes.

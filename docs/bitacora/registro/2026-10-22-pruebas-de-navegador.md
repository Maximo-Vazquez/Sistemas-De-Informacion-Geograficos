---
fecha: 2026-10-22
titulo: Pruebas de navegador y capturas
autor: Vazquez Maximo Ezequiel
decisiones: [ADR-0007]
---

## Objetivo

Integrar Playwright para probar la aplicación en el navegador y generar capturas para la bitácora y el informe.

## Trabajo realizado

- `e2e/`: Playwright 1.63 con Chromium, servidor propio en el puerto 8030 y base `gis_tpi_e2e` creada automáticamente (`preparar_e2e`).
- Login de prueba sin Google: `reiniciar_e2e` deja un usuario conocido y `sesion_e2e` guarda su sesión como `storageState`. Ambos viven en `apps/e2e`, que solo se instala con `config.settings.e2e`.
- Nueve pruebas: inicio (globo, botón de Google, consignas, celular sin scroll horizontal, tema oscuro persistente) y acceso (redirección al login, sin alta con contraseña, panel con sesión, ir a Administración y cierre de sesión).
- Capturas reproducibles en `docs/capturas/` (inicio, login y panel; claro, oscuro y celular).
- Workflow `3-pruebas-navegador.yaml`, solo manual.

## Verificación

- `pnpm --dir e2e probar`: 9 pruebas en verde.
- Capturas revisadas a mano en claro, oscuro y celular.

## Problemas y soluciones

- En las capturas el globo salía como un disco negro: la GPU por software del modo headless (SwiftShader) no renderiza bien cobe. Con la GPU real (`--use-angle=d3d11` en Windows) se ve correctamente; la app en un navegador normal no tenía el problema.
- La prueba de cierre de sesión invalidaba la sesión compartida: ahora crea una sesión propia.

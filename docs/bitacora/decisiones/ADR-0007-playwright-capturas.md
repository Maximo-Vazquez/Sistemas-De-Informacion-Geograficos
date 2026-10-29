---
id: ADR-0007
titulo: Playwright para pruebas de navegador y capturas de pantalla
estado: aceptada
fecha: 2026-10-22
---

## Contexto

La aplicación necesita pruebas que verifiquen los flujos reales en el navegador, y el punto b del TPI exige un informe con capturas de pantalla de los pasos. El login es solo con Google, que no se puede automatizar.

## Opciones consideradas

- Capturas manuales y sin pruebas de navegador.
- Playwright para pruebas y capturas reproducibles.
- Selenium o Cypress para las pruebas.

## Decisión

Playwright 1.63 en `e2e/` (pnpm, Chromium) con servidor Django y base propios (`gis_tpi_e2e`, puerto 8030). El login de Google se reemplaza en pruebas por los comandos `reiniciar_e2e` y `sesion_e2e` de `apps/e2e`, que solo existen con `config.settings.e2e`. Las capturas salen de `pnpm --dir e2e capturas`. Las pruebas en CI se lanzan solo a mano.

## Consecuencias

- Las capturas se regeneran con un comando cuando cambia la interfaz.
- Las capturas usan la GPU real: con la GPU por software del modo headless, el globo WebGL sale negro.
- El login de prueba no existe en producción: la app `apps.e2e` no está en los settings de la aplicación.

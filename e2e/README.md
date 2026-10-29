# Pruebas de navegador (Playwright)

Prueban la aplicación real en Chromium: Playwright levanta su propio Django en `http://127.0.0.1:8030` con la base `gis_tpi_e2e` (se crea sola), así que no toca `gis_tpi` ni el servidor de desarrollo.

## Primera vez

```powershell
pnpm --dir e2e install
pnpm --dir e2e instalar-navegadores
```

## Uso

| Comando | Qué hace |
|---|---|
| `pnpm --dir e2e probar` | Corre las pruebas (`pruebas/`) |
| `pnpm --dir e2e probar-visible` | Igual, con el navegador visible |
| `pnpm --dir e2e probar-interactivo` | Modo UI de Playwright para depurar |
| `pnpm --dir e2e capturas` | Genera capturas en `docs/capturas/` (claro, oscuro y celular) |
| `pnpm --dir e2e ver-informe` | Abre el último informe HTML |

## Cómo funciona

- `playwright.config.ts`: servidor propio (`preparar_e2e` + `runserver`), idioma `es-AR`, video y captura solo cuando falla una prueba.
- Login: Google no se puede automatizar. `utilidades/preparacion_global.ts` ejecuta `reiniciar_e2e` (datos conocidos) y `sesion_e2e`, que guarda la sesión del usuario de pruebas en `.auth/admin.json`. Las pruebas con sesión usan `test.use(conSesion)`.
- Esos comandos están en `apps/e2e/` y solo existen con `config.settings.e2e` (base terminada en `_e2e`).
- `fixtures/prueba.ts` hace fallar la prueba ante errores de JavaScript o respuestas 5xx.
- Las capturas usan la GPU real (`utilidades/gpu.ts`): con la GPU por software del modo headless, el globo WebGL sale negro.

En CI se corren a mano con el workflow **3. Pruebas de navegador (manual)**.

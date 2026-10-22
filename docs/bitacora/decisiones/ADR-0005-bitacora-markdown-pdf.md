---
id: ADR-0005
titulo: Bitácora generada desde Markdown con Python y WeasyPrint
estado: aceptada
fecha: 2026-10-22
---

## Contexto

El grupo necesita registrar trabajo y decisiones durante todo el TPI y presentar un informe con formato de documento técnico (portada, ficha, control de versiones, índice, encabezado y pie).

## Opciones consideradas

- Un documento de Word o Google Docs editado a mano.
- Markdown versionado en el repositorio y un script que genera el PDF.

## Decisión

Fuentes en `docs/bitacora/` (YAML y Markdown: secciones, ADR y una entrada por sesión). `scripts/generar_bitacora.py` arma `salida/bitacora.md` y lo convierte a PDF con WeasyPrint (HTML + CSS de impresión). CI verifica que el `.md` generado esté al día y publica el PDF como artifact.

## Consecuencias

- La bitácora se revisa en los mismos commits que el código.
- El formato vive en un solo lugar (`assets/estilos.css` y `assets/plantilla.html`).
- Generar el PDF en local requiere WeasyPrint y sus librerías del sistema (Pango); `--solo-md` funciona sin ellas.

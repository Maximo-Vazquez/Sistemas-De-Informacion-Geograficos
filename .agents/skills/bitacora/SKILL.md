---
name: bitacora
description: Mantener la bitácora técnica del proyecto (docs/bitacora/), que registra el trabajo de cada sesión, las decisiones (ADR), el stack y el estado del TPI, y se publica como PDF. Usar al terminar cualquier sesión de trabajo con cambios, al tomar una decisión técnica o cuando se pida actualizar o generar la bitácora o el informe técnico.
---

# Bitácora técnica

Documento vivo en `docs/bitacora/`. Las fuentes en Markdown/YAML se editan a mano; `scripts/generar_bitacora.py` arma `salida/bitacora.md` (versionado) y `salida/bitacora.pdf` (no versionado, CI lo publica como artifact).

Estándares:
- **ISO/IEC/IEEE 15289**: identificación, ficha y control de versiones del documento.
- **ADR en formato MADR**: contexto, opciones consideradas, decisión, consecuencias y estado.
- **SemVer** para la versión del documento y cambios al estilo **Keep a Changelog**.

## Al cerrar cada sesión de trabajo
1. **Registro**: crear `docs/bitacora/registro/AAAA-MM-DD-<tema>.md` (varias sesiones el mismo día: un archivo por tema) con front matter `fecha`, `titulo`, `autor`, `decisiones` (ids de ADR) y las secciones:
   `## Objetivo`, `## Trabajo realizado`, `## Problemas y soluciones`, `## Pendientes`.
   Escribir hechos verificables: qué se hizo, con qué comandos o archivos, qué quedó probado y qué no.
2. **Decisiones**: si se eligió una tecnología, un enfoque o se descartó una alternativa, crear `docs/bitacora/decisiones/ADR-NNNN-<slug>.md` (siguiente número libre) con front matter `id`, `titulo`, `estado` (`propuesta` | `aceptada` | `reemplazada` | `descartada`), `fecha` y opcional `reemplaza`. Secciones: `## Contexto`, `## Opciones consideradas`, `## Decisión`, `## Consecuencias`. Un ADR no se reescribe: si cambia la decisión, se crea otro que lo reemplaza y el viejo pasa a `reemplazada`.
3. **Stack y estado**: actualizar `secciones/03-arquitectura.md` si cambió una tecnología o versión, `estado-tpi.yaml` si avanzó una consigna y `secciones/07-riesgos-pendientes.md` con riesgos y dudas abiertas (marcar `[PENDIENTE]` lo que espera respuesta).
4. **Versión**: en `documento.yaml`, subir `version` (minor por contenido nuevo, patch por correcciones, major al cerrar una entrega) y agregar la entrada en `versiones` con fecha y cambios.
5. **Generar**: `python scripts/generar_bitacora.py` (o `--solo-md` si no está WeasyPrint) y commitear `salida/bitacora.md` junto con las fuentes. CI corre `--verificar` y falla si el `.md` generado quedó desactualizado.

## Estilo
- Español, oraciones cortas, voz activa; fechas `AAAA-MM-DD` en el front matter y `DD/MM/AAAA` en el PDF.
- No inventar resultados: si algo no se probó, decirlo.
- Las tablas en Markdown se renderizan con encabezado en negrita y filas alternadas; usar `[PENDIENTE]` para dudas abiertas (se destacan en naranja).
- El formato visual (portada, ficha, índice, encabezado y pie) lo define `docs/bitacora/assets/estilos.css` y la plantilla del script; no se toca por sesión.

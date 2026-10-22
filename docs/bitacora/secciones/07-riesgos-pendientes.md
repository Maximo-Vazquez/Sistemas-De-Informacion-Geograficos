# Riesgos y pendientes

## Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026) con PostGIS, servidor de mapas y visor sin empezar | Alto | Priorizar la carga de capas y el servidor OGC antes que funciones extra del visor |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google y del VPS | Medio | Solo en secrets de GitHub y `.env` local; nunca en el repositorio |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- [PENDIENTE] Cargar los secrets del deploy (`DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) y registrar la URI de redirección del dominio en Google.
- [PENDIENTE] Instalar la extensión PostGIS en el PostgreSQL local.
- [PENDIENTE] Definir el dominio de despliegue (nginx y `CSRF_TRUSTED_ORIGINS`).
- [PENDIENTE] Elegir servidor de mapas y biblioteca de mapas (ADR).

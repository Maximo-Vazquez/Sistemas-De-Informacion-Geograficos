# Riesgos y pendientes

## Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026 al 03/12/2026) con visor y análisis incompletos | Alto | Priorizar consultas, medición, alta de elementos y análisis de la ruta |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google y del VPS | Medio | Solo en secrets de GitHub y `.env` local; nunca en el repositorio |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- El usuario confirmó el acceso autenticado al visor con Google y la visualización del mapa base. El servicio local `web` de Compose recibe las credenciales mediante `env_file: .env`; tras cambiar ese archivo, recrear el servicio.
- [PENDIENTE] Cargar los secrets del deploy (`DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) y registrar la URI de redirección del dominio en Google.
- Las 47 capas del ZIP IGN están cargadas en el PostGIS local `gisdb` y publicadas por WMS/WFS. Los volúmenes locales no se distribuyen con el repositorio; una instalación nueva requiere el ZIP y la importación documentada en el README.
- [PENDIENTE] Definir el dominio de despliegue (nginx y `CSRF_TRUSTED_ORIGINS`).
- [PENDIENTE] Conectar Django al PostGIS del proyecto para alimentar el panel y realizar los cálculos geográficos.
- [PENDIENTE] Desplegar GeoServer en el VPS (manifiesto k8s) y definir su URL pública.
- [PENDIENTE] Completar consultas por punto y rectángulo, medición de distancias y alta de geometría con atributos; verificar interruptores y leyendas con capas reales.

# Riesgos y pendientes

## Riesgos

Tabla: Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fecha de entrega (01/12/2026 al 03/12/2026) con visor y análisis incompletos | Alto | Priorizar la demostración del visor con datos reales y el análisis de la ruta |
| Cálculo de distancias y áreas en coordenadas geográficas | Alto | Reproyectar a un CRS métrico (POSGAR 2007, faja correspondiente) antes de medir y de generar buffers |
| Categorías de población excluyentes (0–10 km y 10–20 km) mal calculadas | Medio | Usar anillos (buffer 20 km menos buffer 10 km) y documentar el criterio de asignación de localidades |
| Credenciales de Google | Medio | Guardarlas en el `.env` local |
| Administración abierta a cualquier cuenta de Google | Bajo | Aceptado para el TPI; agregar un permiso propio si se cargan datos sensibles |

## Pendientes

- [PENDIENTE] Completar los integrantes del grupo en `docs/bitacora/documento.yaml`.
- El usuario confirmó el acceso autenticado al visor con Google y la visualización del mapa base. El servicio local `web` de Compose recibe las credenciales mediante `env_file: .env`; tras cambiar ese archivo, recrear el servicio.
- Las 47 capas del ZIP IGN están cargadas en el PostGIS local `gisdb` y publicadas por WMS/WFS. Los volúmenes locales no se distribuyen con el repositorio; para reproducir la carga local se usa el ZIP y la importación documentada en el README.
- [PENDIENTE] Conectar Django al PostGIS del proyecto para alimentar el panel y realizar los cálculos geográficos.
- Las consultas por punto y rectángulo y la medición de distancias están implementadas. La rama incorporada incluye pruebas de navegador con servicios simulados.
- Las herramientas, los interruptores y las leyendas se verificaron con las capas reales del IGN. Las 47 capas tienen simbología propia y ocho se clasifican por atributo (ADR-0014).
- [PENDIENTE] Consultar al profesor si la capa Relevamientos debe estar en PostGIS y servida por GeoServer.

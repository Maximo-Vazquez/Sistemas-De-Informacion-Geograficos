---
name: django-backend
description: Estructura y calidad del backend Django del Visor SIG Chaco. Usar al crear o modificar apps, vistas, modelos, servicios, settings, permisos o tests de Python; mantiene baja la complejidad ciclomática y archivos de largo razonable. Basada en la documentación oficial de Django (no existe una skill oficial).
---

# Backend Django

Fuente de criterio: la documentación oficial de Django (docs.djangoproject.com, versión instalada en `requirements.txt`): estructura de apps, vistas, ORM, settings, seguridad y testing. Esta skill fija cómo aplicarla en este repositorio.

## Estructura de una app (`apps/<app>/`)
| Archivo | Responsabilidad |
|---|---|
| `urls.py` | Rutas con `app_name`; siempre `reverse("<app>:<nombre>")`, nunca URLs escritas a mano |
| `views.py` | Delgadas: permiso → leer request → llamar selector/servicio → responder. Sin reglas de negocio ni consultas complejas |
| `selectors.py` | Lecturas: querysets y diccionarios para las pantallas (lo que viaja por `json_script`) |
| `services.py` / `servicios.py` | Escrituras y reglas: crean, validan y modifican; transacciones con `transaction.atomic` |
| `forms.py` | Validación de entrada de POST |
| `permisos.py` | Decoradores o chequeos de acceso propios, si hacen falta más allá de `login_required` |
| `models.py` | Datos e invariantes simples (`clean`, constraints); sin lógica de pantallas |
| `tests.py` o `tests/` | Tests junto a la app |

Cuando un archivo crece, convertirlo en paquete por responsabilidad (`views/`, `services/`, `selectors/` con `__init__.py` que reexporta) en vez de sumar funciones al mismo módulo.

## Complejidad y tamaño
- **Complejidad ciclomática ≤ 10 por función** (`ruff` C901, regla obligatoria en CI). También `PLR0911/0912/0913/0915`: ≤ 4 returns, ≤ 10 ramas, ≤ 5 argumentos, ≤ 40 sentencias.
- Para bajar complejidad: retornos tempranos (guard clauses), tablas de despacho (`dict` de funciones en lugar de `if/elif` largos), funciones pequeñas con nombre de dominio, y mover reglas a `services`/`selectors`.
- **Largo de archivo de referencia: ~300 líneas en Python, ~250 en TS/TSX.** Es un estándar orientativo, no una regla: `scripts/check_file_length.py` solo avisa. Si un archivo lo supera, dividirlo cuando haya responsabilidades separables; si dividirlo empeora la lectura, puede extenderse.
- No silenciar ruff con `noqa` para esquivar complejidad: refactorizar. Las excepciones se justifican en el mismo comentario.

## Settings y secretos
- `config/settings/{base,local,production,test}.py`; leer el entorno solo con `config/settings/entorno.py` (`env_str`, `env_bool`, `env_list`).
- Secretos únicamente por variables de entorno (local: `.env`; producción: secret `sig-runtime-credentials` que crea el workflow de deploy). Nunca credenciales en el código.
- `production.py` falla si falta `DJANGO_SECRET_KEY`. Correr `manage.py check --deploy` con settings de producción antes de cambiar seguridad.

## Autenticación
- allauth estándar, solo Google (`SOCIALACCOUNT_ONLY`). Login y logout por POST con CSRF. Nada de JWT ni OIDC propio.
- Vistas de Administración con `@login_required`. Tests por cada vista: sin sesión → login, con sesión → 200.

## Base de datos y GIS
- PostgreSQL. Migraciones revisadas a mano antes de commitear; `makemigrations --check` corre en CI.
- Etapa GIS: `DB_ENGINE=django.contrib.gis.db.backends.postgis`, `django.contrib.gis` en `INSTALLED_APPS`, modelos con `PointField`/`LineStringField`/`PolygonField` y SRID explícito. Cálculos de distancia/área en un CRS proyectado (p. ej. POSGAR 2007 faja 5, EPSG:5347), nunca en grados. Dependencias de sistema (GDAL/GEOS/PROJ) indicadas en el Dockerfile.

## Tests
- `python manage.py test --settings=config.settings.test`. Un test por comportamiento, nombres en español que describan el resultado (`test_mail_fuera_de_la_lista_recibe_403`).
- Probar servicios y selectores directamente, y las vistas por su contrato HTTP.

## Antes de entregar
`ruff check .` · `python scripts/check_file_length.py` (aviso) · `python manage.py check` · `python manage.py test` · entrada en la bitácora (`.agents/skills/bitacora/SKILL.md`).

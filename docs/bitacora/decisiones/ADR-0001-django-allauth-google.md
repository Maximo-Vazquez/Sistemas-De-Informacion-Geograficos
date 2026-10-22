---
id: ADR-0001
titulo: Django con allauth y login de Google estándar
estado: aceptada
fecha: 2026-10-22
---

## Contexto

La aplicación necesita una sección de Administración que requiera iniciar sesión, sin administrar contraseñas.

## Opciones consideradas

- Proveedor OIDC propio con tokens JWT (login unificado entre aplicaciones).
- django-allauth estándar con Google como único proveedor.
- Usuario y contraseña propios de Django.

## Decisión

django-allauth con Google como único proveedor (`SOCIALACCOUNT_ONLY`), sin verificación por mail ni contraseñas. Cualquier cuenta de Google con sesión iniciada accede a Administración (`login_required`). Login y logout se hacen por POST con CSRF. Las credenciales de Google llegan por variables de entorno.

## Consecuencias

- Sin claves de firma, clientes OIDC ni envío de correos: menos secretos y menos código.
- Hay que crear credenciales OAuth en Google Cloud y registrar las URI de redirección de cada entorno.
- No hay lista de cuentas habilitadas: si más adelante hace falta restringir, se agrega un permiso propio.

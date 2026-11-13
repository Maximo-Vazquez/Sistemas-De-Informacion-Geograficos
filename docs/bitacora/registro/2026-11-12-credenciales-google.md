---
fecha: 2026-11-12
titulo: Configuración local de las credenciales de Google
autor: Asistencia técnica del proyecto
decisiones: []
---

## Objetivo

Aplicar el cliente OAuth proporcionado por el usuario para habilitar el acceso con Google en la aplicación local.

## Trabajo realizado

- Se leyó el JSON indicado por el usuario fuera del repositorio. Se validó que fuera un cliente web con ID, secreto y ambos callbacks locales autorizados.
- Se actualizaron únicamente las variables de Google en el `.env` local, ignorado por Git, sin imprimir sus valores. El JSON original no se copió al repositorio.
- Se comprobó que el contenedor Django no tenía variables OAuth que anularan el archivo. Se copió el `.env` a `/app/.env`, con propietario `app` y permisos `600`, y se reinició `visor-sig-web`. Las variables existentes del contenedor conservan prioridad, incluido `DB_HOST=db`.
- `manage.py check` finalizó sin problemas.
- Se probó el flujo HTTP real: GET del formulario, cookie CSRF y POST de inicio de Google con destino al visor. La respuesta fue HTTP 302 hacia Google, con el cliente correcto y `http://localhost:8000/accounts/google/login/callback/` como retorno.
- Se actualizaron la revisión del proyecto, los pendientes y la bitácora.

## Problemas y soluciones

- El archivo `.env` en Windows no era accesible desde el contenedor existente, que no tiene montajes. Se aplicó también dentro del contenedor sin modificar la imagen ni incluir secretos en archivos versionados.
- La verificación solo comprueba el inicio del flujo. No suplanta el ingreso del usuario a Google ni demuestra todavía el intercambio del código por una sesión autenticada.

## Pendientes

- Abrir `http://localhost:8000/administracion/visor/`, iniciar sesión con Google y comprobar el regreso al visor.
- Si se recrea el contenedor, pasar nuevamente las variables mediante `--env-file .env` o un mecanismo de secretos.
- Cargar y publicar las capas del IGN; el login no modifica el catálogo vacío de GeoServer.

# Automatización de QGIS: MCP y skill del equipo

Esta guía explica cómo conectar un cliente compatible con MCP a una sesión local de QGIS y cómo aprovechar las instrucciones de trabajo guardadas en este repositorio.

## Componentes

- El complemento QGIS MCP se ejecuta dentro de QGIS y expone operaciones de PyQGIS mediante un servidor TCP local.
- El proceso `qgis-mcp-server` se ejecuta como servidor MCP. El cliente MCP lo inicia y el servidor se comunica con el complemento.
- La skill `qgis-mcp-workflows` documenta el procedimiento del equipo para revisar y modificar proyectos, capas, sistemas de referencia, guardado y resultados. Es una guía de trabajo; por sí sola no instala QGIS ni habilita la conexión.
- Para procesamientos por lotes o tareas que no requieren una sesión gráfica abierta, también se puede usar PyQGIS directamente.

La versión 0.14.1 del servidor declara 118 herramientas para consultar proyectos y capas, administrar entidades, ejecutar geoprocesos, aplicar estilos y crear diseños o exportaciones. El [README de la etiqueta v0.14.1](https://github.com/nkarasiak/qgis-mcp/blob/v0.14.1/README.md) detalla sus capacidades.

## Procedencia y versiones

El complemento y el servidor provienen del proyecto de código abierto [nkarasiak/qgis-mcp](https://github.com/nkarasiak/qgis-mcp). La configuración de este equipo fija la etiqueta v0.14.1:

- Complemento QGIS: versión 0.14.1; origen declarado en sus metadatos: `https://github.com/nkarasiak/qgis-mcp`.
- Servidor MCP: se ejecuta desde el ZIP de la misma etiqueta mediante `uvx`.
- Compatibilidad declarada por el complemento: QGIS 3.28 o posterior y QGIS 4.
- Configuración de referencia verificada en este equipo: QGIS 4.2.2, perfil `QGIS4/default`, complemento 0.14.1.
- El complemento y el servidor deben conservar versiones compatibles. Actualizar uno sin el otro puede causar incompatibilidades.

La instalación y configuración oficial están en el [README de v0.14.1](https://github.com/nkarasiak/qgis-mcp/blob/v0.14.1/README.md), que también documenta la integración con clientes MCP.

## Instalación en cada computadora

Cada integrante instala QGIS MCP localmente. El perfil de QGIS, la conexión y la configuración del cliente MCP son propios de cada computadora.

### 1. Requisitos

- QGIS 3.28 o posterior.
- `uv` instalado, con `uvx` disponible en `PATH`. Consultá la [instalación oficial de uv](https://docs.astral.sh/uv/getting-started/installation/). `uvx` prepara y ejecuta el servidor sin instalar Python manualmente para este proyecto.
- Un cliente que admita el protocolo MCP y permita registrar servidores MCP por comando.

### 2. Instalar el complemento en QGIS

1. Abrí QGIS.
2. Entrá a **Complementos > Administrar e instalar complementos**.
3. Buscá **QGIS MCP** e instalalo.
4. Reiniciá QGIS y confirmá que el complemento esté habilitado.
5. Abrí el panel QGIS MCP y seleccioná **Start Server**.
6. En el administrador de complementos, comprobá que la versión sea 0.14.1, para que coincida con el servidor de esta guía.

De forma predeterminada, el complemento escucha en `localhost:9876`.

### 3. Registrar el servidor en el cliente MCP

Cloná el repositorio del equipo siguiendo el README. Después, agregá un servidor MCP con estos datos en la configuración que use tu cliente:

- Nombre: `qgis`
- Comando: `uvx`
- Argumentos:

      --from
      https://github.com/nkarasiak/qgis-mcp/archive/refs/tags/v0.14.1.zip
      qgis-mcp-server

Como referencia, esta es la misma configuración expresada en TOML:

    [mcp_servers.qgis]
    command = "uvx"
    args = ["--from", "https://github.com/nkarasiak/qgis-mcp/archive/refs/tags/v0.14.1.zip", "qgis-mcp-server"]
    startup_timeout_sec = 120

Los nombres de sección, el formato y la ubicación del archivo dependen del cliente MCP; usá la estructura equivalente que indique su documentación. Comprobá `uvx --version`. Si el cliente no encuentra `uvx`, en PowerShell ejecutá `Get-Command uvx` y configurá la ruta completa a ese ejecutable. No guardes en este repositorio configuraciones personales: pueden contener rutas, otros servidores y preferencias de cada integrante.

Después de registrar o cambiar un servidor, reiniciá o recargá el cliente para que tome la configuración nueva.

### 4. Verificar la conexión

1. Confirmá en el cliente MCP que el servidor `qgis` esté habilitado y conectado.
2. Con QGIS abierto y **Start Server** activo, invocá la herramienta `ping`. La respuesta esperada es `pong=true`.
3. Ejecutá `diagnose` y revisá que el servidor y el complemento sean compatibles.
4. Si no conecta, comprobá que QGIS siga abierto, que el complemento esté habilitado y que el puerto local 9876 esté disponible.

## Skill compartida del repositorio

La skill del equipo está en `.agents/skills/qgis-mcp-workflows/`. Su archivo `SKILL.md` describe cómo inspeccionar proyectos y capas, revisar los sistemas de referencia, hacer cambios, guardar y verificar los resultados. La skill es propia de este repositorio; no se descarga del proyecto externo `qgis-mcp`.

Al clonar el repositorio, las instrucciones quedan disponibles en esa carpeta. Si el cliente de trabajo reconoce skills versionadas en `.agents/skills/`, podrá cargarlas desde la raíz del repositorio. De lo contrario, seguí la documentación de ese cliente para vincular la carpeta a su directorio de skills. Podés indicar el nombre `qgis-mcp-workflows` al iniciar una tarea para que se apliquen esas pautas.

La skill documenta el procedimiento de trabajo; el servidor MCP aporta la conexión y las herramientas para interactuar con QGIS. Si el servidor MCP no está conectado, PyQGIS puede servir como alternativa para automatizar operaciones.

## Seguridad y límites

- De forma predeterminada, el servidor escucha solo en la computadora local y no usa un token. Cualquier proceso local que alcance `localhost:9876` puede enviar acciones a QGIS, incluida la ejecución de código PyQGIS. No expongas el socket a la red. Si una instalación compartida requiere acceso remoto, configurá `QGIS_MCP_TOKEN` tanto en QGIS como en el servidor.
- El MCP puede modificar capas y entidades, ejecutar geoprocesos y código PyQGIS. Antes de una operación que sobrescriba o elimine información, revisá el proyecto, las capas y la ruta de destino.
- Guardá el proyecto para conservar los cambios y comprobá el resultado después de cada operación relevante.
- Mantené compatibles las versiones del complemento y el servidor.
- No guardes tokens ni otros secretos en este repositorio.

## Actualización

La configuración del equipo fija la etiqueta v0.14.1 para que todas las computadoras partan de la misma versión. Antes de actualizar:

1. Revisá la versión nueva y sus instrucciones en el proyecto upstream.
2. Actualizá el complemento QGIS desde el administrador de complementos.
3. Cambiá la etiqueta v0.14.1 en la configuración del servidor MCP por la nueva etiqueta elegida.
4. Reiniciá QGIS y recargá el cliente MCP.
5. Ejecutá `diagnose` y `ping` antes de continuar el trabajo.

# Automatización de QGIS: MCP y skill del equipo

Esta guía describe cómo conectar Codex con la instancia local de QGIS y cómo usar las instrucciones compartidas del repositorio.

## Qué hace cada componente

- El plugin QGIS MCP corre dentro de QGIS y expone su API PyQGIS mediante un servidor TCP local.
- El proceso qgis-mcp-server corre como servidor MCP iniciado por Codex y traduce las llamadas de herramientas hacia el plugin.
- La skill qgis-mcp-workflows indica al agente cómo inspeccionar y modificar proyectos con cuidado. No instala QGIS, no inicia el plugin y no agrega herramientas por sí misma.

El agente opera la sesión de QGIS que tenga el plugin conectado. Para procesamiento por lotes o cuando no se necesite una ventana abierta, puede usarse PyQGIS directamente.

En v0.14.1 el servidor ofrece 118 herramientas para consultar proyectos y capas, gestionar entidades, ejecutar procesos de geoprocesamiento, aplicar estilos y crear diseños o exportaciones. El [README de la etiqueta v0.14.1](https://github.com/nkarasiak/qgis-mcp/blob/v0.14.1/README.md) enumera las capacidades.

## Procedencia y versiones del proyecto

El plugin y el servidor vienen del proyecto de código abierto [nkarasiak/qgis-mcp](https://github.com/nkarasiak/qgis-mcp). La instalación actual está fijada a la etiqueta v0.14.1:

- Plugin QGIS: versión 0.14.1; origen declarado por sus metadatos: https://github.com/nkarasiak/qgis-mcp.
- Servidor MCP: se ejecuta desde el ZIP de la misma etiqueta v0.14.1 en GitHub mediante uvx.
- Compatibilidad declarada por el plugin: QGIS 3.28 o posterior y QGIS 4.
- En la configuración de referencia: QGIS 4.2.2 y perfil QGIS4 default.
- En este equipo el plugin 0.14.1 está instalado y habilitado en el perfil QGIS4/default; el ajuste autostart está activado. Cada integrante instala el plugin en su propio perfil. Verificá siempre la conexión con ping, porque el ajuste de inicio automático no confirma por sí solo que el servidor esté escuchando.
- El plugin y el servidor deben conservar versiones compatibles. Actualizar uno sin el otro puede dejar herramientas incompatibles.

La documentación de instalación y configuración del proyecto original está en el [README de v0.14.1](https://github.com/nkarasiak/qgis-mcp/blob/v0.14.1/README.md) y la [guía de integración con agentes](https://github.com/nkarasiak/qgis-mcp/blob/v0.14.1/docs/agent-integration.md).

## Instalación para cada integrante

Cada persona instala QGIS MCP en su propia computadora y configura su propio Codex. No se comparten el perfil de QGIS ni la configuración de usuario de Codex.

### 1. Requisitos

- QGIS 3.28 o posterior.
- uv instalado, con uvx disponible en PATH. Seguí la [instalación oficial de uv](https://docs.astral.sh/uv/getting-started/installation/). uvx prepara y ejecuta el servidor sin una instalación manual de Python.
- Codex CLI o la aplicación Codex con acceso a la configuración MCP.

### 2. Instalar el plugin en QGIS

1. Abrí QGIS.
2. Entrá a Complementos > Administrar e instalar complementos.
3. Buscá QGIS MCP e instalalo.
4. Reiniciá QGIS y comprobá que QGIS MCP esté habilitado.
5. Abrí el panel acoplable QGIS MCP y elegí Start Server. En el administrador de complementos, confirmá que la versión del plugin coincida con v0.14.1; si instalás otra versión, actualizá coordinadamente el servidor MCP.

El servidor del plugin escucha en localhost:9876 de forma predeterminada. El perfil QGIS y el plugin son locales a cada instalación.

### 3. Registrar el servidor MCP en Codex

Cloná primero el repositorio del equipo siguiendo su README. En una terminal donde Codex CLI esté disponible, ejecutá:

    codex mcp add qgis -- uvx --from https://github.com/nkarasiak/qgis-mcp/archive/refs/tags/v0.14.1.zip qgis-mcp-server

Esto añade QGIS MCP a la configuración de usuario de Codex. La misma configuración se usa desde CLI y la aplicación Codex. Para editarla manualmente, agregá este bloque a %USERPROFILE%/.codex/config.toml:

    [mcp_servers.qgis]
    command = "uvx"
    args = ["--from", "https://github.com/nkarasiak/qgis-mcp/archive/refs/tags/v0.14.1.zip", "qgis-mcp-server"]
    startup_timeout_sec = 120

Comprobá que uvx esté instalado con uvx --version. Si Codex no lo encuentra, ejecutá Get-Command uvx en PowerShell y reemplazá command por la ruta completa al ejecutable de esa computadora. No copies al repositorio el config.toml global: puede contener rutas, servidores y preferencias propios de cada integrante.

Después de registrar el servidor, reiniciá Codex para que cargue la configuración nueva.

### 4. Verificar la conexión

1. En Codex ejecutá codex mcp list y confirmá que aparezca qgis.
2. Con QGIS abierto y el plugin en Start Server, pedile al agente que llame a ping. La respuesta esperada es pong=true.
3. Ejecutá diagnose y comprobá que el servidor y el plugin sean compatibles.
4. Si no conecta, verificá que QGIS siga abierto, que el plugin esté habilitado y que el puerto local 9876 esté libre y escuchando.

## Skill compartida del repositorio

La skill está en .agents/skills/qgis-mcp-workflows/:

- SKILL.md: cuándo y cómo inspeccionar proyectos, capas, CRS, cambios, guardado y verificación.
- agents/openai.yaml: nombre corto y descripción para la interfaz de Codex.

Esta skill fue creada para este equipo y vive en este repositorio; no se copió ni se descarga desde el proyecto externo qgis-mcp. Se apoya en el protocolo de trabajo de QGIS MCP y puede versionarse junto con el código.

Para instalarla, cloná el repositorio GIS y abrí la carpeta raíz GIS como proyecto en Codex. Codex descubre las skills versionadas en .agents/skills del repositorio; no hace falta copiarlas al perfil personal. Si el equipo trabaja desde un directorio sin el repositorio, la carpeta también puede copiarse a %USERPROFILE%/.agents/skills/qgis-mcp-workflows. En otros agentes, instalala o vinculala en la ubicación de skills que ese agente admita. En una tarea QGIS podés pedir explícitamente la skill qgis-mcp-workflows; la descripción de la skill también permite que Codex la seleccione cuando corresponda. La guía de [skills de Codex](https://developers.openai.com/codex/skills) describe la búsqueda de skills del repositorio y del usuario.

La skill enseña el flujo; el MCP proporciona la conexión y las acciones. Si el MCP no está conectado, la skill indica usar PyQGIS como alternativa cuando corresponda.

## Uso seguro y límites

- El servidor predeterminado escucha solo en la computadora local, sin autenticación por token. Cualquier proceso local que alcance localhost:9876 puede controlar QGIS, incluso ejecutar PyQGIS. No expongas el socket a la red; si una instalación compartida lo requiere, configurá QGIS_MCP_TOKEN tanto en QGIS como en el servidor.
- El MCP puede editar capas y entidades y ejecutar código PyQGIS. Confirmá el proyecto, las capas y el destino antes de operaciones destructivas o de sobrescritura.
- Guardá el proyecto explícitamente cuando se quieran conservar los cambios. La skill pide verificar el resultado y el guardado.
- Para operaciones MCP, mantené alineadas las versiones del plugin y del servidor.
- No guardes tokens ni secretos en este repositorio.

## Actualización

La instalación del equipo usa v0.14.1 fijada por URL para que todos partan de la misma versión. Antes de actualizar:

1. Revisá la nueva versión y sus instrucciones en el repositorio upstream.
2. Actualizá el plugin QGIS desde el administrador de complementos.
3. Cambiá la etiqueta v0.14.1 de la configuración MCP por la etiqueta elegida.
4. Reiniciá QGIS y Codex.
5. Ejecutá diagnose y ping antes de continuar el trabajo.

Para referencias adicionales, consultá [MCP en Codex](https://developers.openai.com/codex/mcp).

"""Template tags para incluir assets compilados por Vite.

El servidor de producción nunca depende de Node. Vite genera un manifest en
``static/frontend/.vite/manifest.json`` durante el build de Docker y Django
resuelve los nombres con hash desde ese archivo.
"""

import json
import os
import sys
from functools import lru_cache

from django import template
from django.conf import settings
from django.contrib.staticfiles import finders
from django.core.exceptions import ImproperlyConfigured
from django.templatetags.static import static
from django.utils.html import format_html
from django.utils.safestring import mark_safe

register = template.Library()
MANIFEST_PATH = "frontend/.vite/manifest.json"


def _manifest():
    path = finders.find(MANIFEST_PATH)
    if not path:
        return None
    # El nombre de los assets lleva hash y Vite reemplaza el manifest en cada
    # build. La marca de modificación permite que runserver use el build nuevo
    # sin quedar apuntando a un JS ya eliminado.
    return _leer_manifest(path, os.stat(path).st_mtime_ns)


@lru_cache(maxsize=2)
def _leer_manifest(path, _marca_modificacion):
    with open(path, encoding="utf-8") as manifest_file:
        return json.load(manifest_file)


@register.simple_tag
def vite_assets(entrypoint):
    """Renderiza CSS y JS para un entrypoint de Vite de forma segura."""
    # Django fuerza DEBUG=False al correr tests. El runner no necesita assets
    # reales y tampoco debe ocultar el chequeo estricto de producción.
    if getattr(settings, "VITE_SKIP_MANIFEST_CHECK", False) or "test" in sys.argv:
        return ""
    dev_server = getattr(settings, "VITE_DEV_SERVER_URL", "").rstrip("/")
    if settings.DEBUG and dev_server:
        return mark_safe(
            format_html(
                '<script type="module" src="{}/@vite/client"></script>'
                '<script type="module" src="{}/{}"></script>',
                dev_server,
                dev_server,
                entrypoint,
            )
        )

    manifest = _manifest()
    if manifest is None:
        if settings.DEBUG:
            # Permite ejecutar tests backend sin requerir que el frontend esté
            # compilado. En producción esto debe fallar temprano.
            return ""
        raise ImproperlyConfigured(
            "No se encontró el manifest de Vite. Ejecuta el build del frontend antes de desplegar."
        )

    asset = manifest.get(entrypoint)
    if not asset:
        raise ImproperlyConfigured(f"El entrypoint de Vite '{entrypoint}' no existe en el manifest.")

    hojas, precargas = _recolectar_dependencias(manifest, entrypoint)

    tags = [
        format_html('<link rel="stylesheet" href="{}">', static(f"frontend/{hoja}"))
        for hoja in hojas
    ]
    tags.extend(
        format_html('<link rel="modulepreload" href="{}">', static(f"frontend/{chunk}"))
        for chunk in precargas
    )
    tags.append(
        format_html(
            '<script type="module" src="{}"></script>',
            static(f"frontend/{asset['file']}"),
        )
    )
    return mark_safe("".join(tags))


def _recolectar_dependencias(manifest, entrypoint):
    """Hojas de estilo y chunks JS de los que depende un entrypoint.

    Vite mueve el CSS al chunk que lo importa, no al entrypoint. Cuando dos
    entrypoints comparten un componente, su CSS termina en un chunk comun y el
    entrypoint queda sin ``css``: hay que recorrer el arbol de ``imports`` o la
    pagina se sirve sin estilos.
    """
    hojas: list[str] = []
    precargas: list[str] = []
    visitados: set[str] = set()

    def recorrer(clave, es_entrypoint=False):
        if clave in visitados:
            return
        visitados.add(clave)
        chunk = manifest.get(clave)
        if not chunk:
            return
        for hoja in chunk.get("css", []):
            if hoja not in hojas:
                hojas.append(hoja)
        # El propio entrypoint se carga con <script>, no se precarga.
        if not es_entrypoint and chunk.get("file") and chunk["file"] not in precargas:
            precargas.append(chunk["file"])
        for dependencia in chunk.get("imports", []):
            recorrer(dependencia)

    recorrer(entrypoint, es_entrypoint=True)
    return hojas, precargas

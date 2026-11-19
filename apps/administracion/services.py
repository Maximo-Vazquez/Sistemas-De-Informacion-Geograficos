"""Escrituras del visor: carga de elementos nuevos por WFS-T en GeoServer.

El navegador arma la transacción con OpenLayers y Django la reenvía con las credenciales
de GeoServer, solo si inserta en capas habilitadas (GEOSERVER_CAPAS_EDITABLES).
"""

import base64
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

from django.conf import settings

TAMANIO_MAXIMO = 512 * 1024


class TransaccionInvalida(ValueError):
    pass


class GeoServerNoDisponible(RuntimeError):
    pass


def _nombre_local(etiqueta: str) -> str:
    return etiqueta.rsplit("}", 1)[-1]


def validar_transaccion(xml: bytes) -> None:
    """Acepta solo `Transaction` con `Insert` de capas editables; nada de Update ni Delete."""
    if not xml or len(xml) > TAMANIO_MAXIMO:
        raise TransaccionInvalida("La transacción está vacía o es demasiado grande.")
    try:
        raiz = ET.fromstring(xml)
    except ET.ParseError as error:
        raise TransaccionInvalida("La transacción no es XML válido.") from error
    if _nombre_local(raiz.tag) != "Transaction":
        raise TransaccionInvalida("Solo se aceptan transacciones WFS.")
    operaciones = list(raiz)
    if not operaciones or any(_nombre_local(op.tag) != "Insert" for op in operaciones):
        raise TransaccionInvalida("Solo se permite insertar elementos nuevos.")
    editables = set(settings.GEOSERVER_CAPAS_EDITABLES)
    capas = {_nombre_local(elemento.tag) for op in operaciones for elemento in op}
    if not capas or not capas <= editables:
        raise TransaccionInvalida("La capa no admite elementos nuevos.")


def enviar_transaccion(xml: bytes) -> tuple[int, bytes, str]:
    validar_transaccion(xml)
    credencial = base64.b64encode(
        f"{settings.GEOSERVER_ADMIN_USER}:{settings.GEOSERVER_ADMIN_PASSWORD}".encode()
    ).decode()
    pedido = urllib.request.Request(
        f"{settings.GEOSERVER_URL_INTERNA}/{settings.GEOSERVER_WORKSPACE}/wfs",
        data=xml,
        method="POST",
        headers={"Authorization": f"Basic {credencial}", "Content-Type": "text/xml"},
    )
    try:
        with urllib.request.urlopen(pedido, timeout=30) as respuesta:
            return respuesta.status, respuesta.read(), respuesta.headers.get_content_type()
    except urllib.error.HTTPError as error:
        return error.code, error.read(), "text/xml"
    except urllib.error.URLError as error:
        raise GeoServerNoDisponible("GeoServer no responde.") from error

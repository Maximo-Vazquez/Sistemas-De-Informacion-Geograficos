"""Datos de solo lectura que consumen las pantallas públicas."""

from django.conf import settings
from django.middleware.csrf import get_token
from django.templatetags.static import static
from django.urls import reverse

# Consignas del TPI (docs/tpi/practico.pdf) que la app irá cubriendo.
CONSIGNAS = [
    {"id": "a1", "titulo": "Servidor de bases de datos espaciales", "estado": "pendiente"},
    {"id": "a2", "titulo": "Servidor de mapas con WMS y WFS", "estado": "pendiente"},
    {"id": "a3", "titulo": "Visor web de capas", "estado": "pendiente"},
    {"id": "b", "titulo": "Análisis de la Ruta Nacional 11 en Chaco", "estado": "pendiente"},
    {"id": "c", "titulo": "Mapa A4 para impresión", "estado": "pendiente"},
]


def _usuario(user):
    if not user.is_authenticated:
        return None
    return {"nombre": user.get_full_name() or user.email, "email": user.email}


def datos_inicio(request):
    return {
        "brandName": settings.SITE_NAME,
        "logoUrl": static("imagenes/logo.svg"),
        "homeUrl": reverse("core:inicio"),
        "csrf": get_token(request),
        "loginUrl": reverse("google_login"),
        "logoutUrl": reverse("account_logout"),
        "adminUrl": reverse("administracion:panel"),
        "usuario": _usuario(request.user),
        "consignas": CONSIGNAS,
    }

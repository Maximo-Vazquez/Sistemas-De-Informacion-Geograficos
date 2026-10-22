"""Datos de las pantallas de cuenta (login, logout, errores) para la entrada React `cuenta`."""

from django import template
from django.conf import settings
from django.contrib.messages import get_messages
from django.middleware.csrf import get_token
from django.templatetags.static import static
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme

register = template.Library()
PANTALLAS = {"login", "logout", "error", "sin-permiso"}


def _destino_seguro(request) -> str:
    destino = request.GET.get("next") or request.POST.get("next") or ""
    if url_has_allowed_host_and_scheme(destino, {request.get_host()}, request.is_secure()):
        return destino
    return ""


@register.simple_tag(takes_context=True)
def datos_cuenta(context, pantalla):
    if pantalla not in PANTALLAS:
        raise template.TemplateSyntaxError(f"Pantalla de cuenta desconocida: {pantalla}")
    request = context["request"]
    user = request.user
    return {
        "pantalla": pantalla,
        "brandName": settings.SITE_NAME,
        "logoUrl": static("imagenes/logo.svg"),
        "csrf": get_token(request),
        "next": _destino_seguro(request),
        "googleUrl": reverse("google_login"),
        "logoutUrl": reverse("account_logout"),
        "homeUrl": reverse("core:inicio"),
        "adminUrl": reverse("administracion:panel"),
        "email": user.email if user.is_authenticated else "",
        "messages": [{"level": m.tags, "text": str(m)} for m in get_messages(request)],
    }

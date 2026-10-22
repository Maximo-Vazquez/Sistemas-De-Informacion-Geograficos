"""Contrato común de toda pantalla React de Administración (AdminPageData en el frontend)."""

from django.conf import settings
from django.contrib.messages import get_messages
from django.middleware.csrf import get_token
from django.templatetags.static import static
from django.urls import reverse

from .navegacion import navegacion_admin


def _iniciales(nombre: str) -> str:
    return "".join(parte[0] for parte in nombre.split()[:2]).upper() or "?"


def _viewer(user):
    nombre = user.get_full_name() or user.email
    return {
        "id": user.id,
        "superusuario": user.is_superuser,
        "nombre": nombre,
        "email": user.email,
        "iniciales": _iniciales(nombre),
        "rol": "Administración",
    }


def _url_actual(request, navigation):
    destinos = [
        link["href"]
        for seccion in navigation
        for item in seccion["items"]
        for link in item.get("children", [item])
    ]
    coincidencias = [href for href in destinos if request.path.startswith(href)]
    return max(coincidencias, key=len) if coincidencias else request.path


def datos_pagina_admin(request):
    navigation = navegacion_admin()
    return {
        "viewer": _viewer(request.user),
        "csrf": get_token(request),
        "currentUrl": _url_actual(request, navigation),
        "homeUrl": reverse("core:inicio"),
        "brandName": settings.SITE_NAME,
        "logoUrl": static("imagenes/logo.svg"),
        "navigation": navigation,
        "adminUrl": reverse("administracion:panel"),
        # La cuenta es la de Google: no hay pantalla propia de "Mi cuenta".
        "accountUrl": "",
        "logoutUrl": reverse("account_logout"),
        "sidebarOpen": request.COOKIES.get("sidebar_state") != "false",
        "messages": [{"level": m.tags, "text": str(m)} for m in get_messages(request)],
    }

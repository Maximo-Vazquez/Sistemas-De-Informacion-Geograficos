"""Crea una sesión para el usuario de pruebas y la guarda como storageState de Playwright.

Reemplaza al login con Google, que no se puede automatizar. Solo existe en config.settings.e2e.
"""

import json
from importlib import import_module
from pathlib import Path

from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, HASH_SESSION_KEY, SESSION_KEY, get_user_model
from django.core.management.base import BaseCommand

from apps.e2e.guardia import exigir_modo_e2e


def crear_sesion(user) -> str:
    sesion = import_module(settings.SESSION_ENGINE).SessionStore()
    sesion[SESSION_KEY] = str(user.pk)
    sesion[BACKEND_SESSION_KEY] = "django.contrib.auth.backends.ModelBackend"
    sesion[HASH_SESSION_KEY] = user.get_session_auth_hash()
    sesion.create()
    return sesion.session_key


def estado_playwright(clave: str, dominio: str) -> dict:
    cookie = {
        "name": settings.SESSION_COOKIE_NAME, "value": clave, "domain": dominio, "path": "/",
        "expires": -1, "httpOnly": True, "secure": False, "sameSite": "Lax",
    }
    return {"cookies": [cookie], "origins": []}


class Command(BaseCommand):
    help = "Escribe el storageState de Playwright con una sesión iniciada."

    def add_arguments(self, parser):
        parser.add_argument("salida", help="Ruta del JSON de storageState")
        parser.add_argument("--dominio", default="127.0.0.1")

    def handle(self, *args, **options):
        exigir_modo_e2e()
        user = get_user_model().objects.get(email=settings.E2E_USUARIO_EMAIL)
        destino = Path(options["salida"])
        destino.parent.mkdir(parents=True, exist_ok=True)
        estado = estado_playwright(crear_sesion(user), options["dominio"])
        destino.write_text(json.dumps(estado, indent=2), encoding="utf-8")
        self.stdout.write(self.style.SUCCESS(f"Sesión de pruebas en {destino}"))

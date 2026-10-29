"""Impide correr los comandos de pruebas fuera de config.settings.e2e."""

from django.conf import settings
from django.core.management.base import CommandError


def exigir_modo_e2e() -> None:
    nombre = settings.DATABASES["default"]["NAME"]
    if not getattr(settings, "E2E_MODE", False) or not str(nombre).endswith("_e2e"):
        raise CommandError("Solo con DJANGO_SETTINGS_MODULE=config.settings.e2e y una base terminada en _e2e.")

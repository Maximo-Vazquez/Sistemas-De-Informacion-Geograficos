"""Pruebas de navegador (Playwright): base propia y app de soporte apps.e2e.

Solo se usa desde e2e/ (DJANGO_SETTINGS_MODULE=config.settings.e2e). Nunca en producción.
"""

from .base import *  # noqa: F403
from .base import DATABASES, INSTALLED_APPS
from .entorno import env_str

DEBUG = True  # runserver sirve los estáticos y compila el frontend
E2E_MODE = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

DATABASES["default"] = {**DATABASES["default"], "NAME": env_str("DB_NAME_E2E", "gis_tpi_e2e")}
INSTALLED_APPS = [*INSTALLED_APPS, "apps.e2e"]
ROOT_URLCONF = "config.urls_e2e"

E2E_USUARIO_EMAIL = "admin@e2e.local"

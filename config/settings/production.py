"""Producción (k8s): nginx termina TLS y sirve /static/ desde el mismo pod."""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import SECRET_KEY
from .entorno import env_bool

DEBUG = False

if SECRET_KEY.startswith("solo-para-desarrollo"):
    raise ImproperlyConfigured("Definí DJANGO_SECRET_KEY en el entorno de producción.")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_CONTENT_TYPE_NOSNIFF = True
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"

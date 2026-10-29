"""URLs de la app más el chequeo de salud que espera Playwright antes de correr."""

from django.urls import path

from apps.e2e.views import salud

from .urls import handler403
from .urls import urlpatterns as urls_app

urlpatterns = [path("__e2e__/salud/", salud), *urls_app]

__all__ = ["urlpatterns", "handler403"]

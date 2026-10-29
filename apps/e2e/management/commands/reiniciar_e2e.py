"""Vacía la base de pruebas y deja un escenario conocido (por ahora, un usuario)."""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand

from apps.e2e.guardia import exigir_modo_e2e


class Command(BaseCommand):
    help = "Restaura los datos conocidos de las pruebas de navegador."

    def handle(self, *args, **options):
        exigir_modo_e2e()
        call_command("flush", interactive=False, verbosity=0)
        get_user_model().objects.create_user(
            username="admin-e2e", email=settings.E2E_USUARIO_EMAIL, first_name="Ana", last_name="Prueba",
        )
        self.stdout.write(self.style.SUCCESS("Escenario de pruebas restaurado."))

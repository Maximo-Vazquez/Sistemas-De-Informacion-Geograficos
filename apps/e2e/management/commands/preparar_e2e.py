"""Crea la base de pruebas si no existe y aplica las migraciones reales."""

import psycopg
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from psycopg import sql

from apps.e2e.guardia import exigir_modo_e2e


def crear_base_si_falta(config: dict) -> bool:
    conexion = psycopg.connect(
        dbname="postgres", user=config["USER"], password=config["PASSWORD"],
        host=config["HOST"], port=config["PORT"], autocommit=True,
    )
    with conexion:
        existe = conexion.execute("SELECT 1 FROM pg_database WHERE datname = %s", [config["NAME"]]).fetchone()
        if not existe:
            conexion.execute(sql.SQL("CREATE DATABASE {} ENCODING 'UTF8'").format(sql.Identifier(config["NAME"])))
    return not existe


class Command(BaseCommand):
    help = "Prepara la base de pruebas de navegador (crea y migra)."

    def handle(self, *args, **options):
        exigir_modo_e2e()
        if crear_base_si_falta(settings.DATABASES["default"]):
            self.stdout.write(f"Base {settings.DATABASES['default']['NAME']} creada.")
        call_command("migrate", interactive=False, verbosity=0)
        self.stdout.write(self.style.SUCCESS("Base de pruebas lista."))

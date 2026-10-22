"""Runserver de desarrollo: aplica migraciones y compila el frontend React antes de iniciar."""

import os
import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import Command as StaticfilesRunserverCommand
from django.core.management import call_command
from django.core.management.base import CommandError

FRONTEND_DIR = Path(settings.BASE_DIR) / "frontend"
DEV_OUTPUT_DIR = "../static/frontend"


def _pnpm() -> str:
    comando = shutil.which("pnpm.cmd") or shutil.which("pnpm")
    if not comando:
        raise CommandError("No se encontró pnpm (corepack enable). También podés usar --skip-frontend-build.")
    return comando


def compilar_frontend() -> None:
    """Instala dependencias si faltan y compila Vite en static/frontend."""
    pnpm = _pnpm()
    entorno = {**os.environ, "VITE_OUTPUT_DIR": DEV_OUTPUT_DIR}
    try:
        if not (FRONTEND_DIR / "node_modules").is_dir():
            subprocess.run([pnpm, "install", "--frozen-lockfile"], cwd=FRONTEND_DIR, check=True)
        subprocess.run([pnpm, "run", "build"], cwd=FRONTEND_DIR, env=entorno, check=True)
    except subprocess.CalledProcessError as error:
        raise CommandError("Falló la compilación del frontend React.") from error


class Command(StaticfilesRunserverCommand):
    help = "Inicia el servidor de desarrollo con migraciones y frontend React compilados."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument("--skip-frontend-build", action="store_true", help="No compila React.")
        parser.add_argument("--skip-migrate", action="store_true", help="No aplica migraciones.")

    def handle(self, *args, **options):
        omitir_front = options.pop("skip_frontend_build", False)
        omitir_migrate = options.pop("skip_migrate", False)
        # Solo en desarrollo y una vez: el autoreload relanza el proceso con RUN_MAIN=true.
        if settings.DEBUG and os.environ.get("RUN_MAIN") != "true":
            if not omitir_migrate:
                call_command("migrate", interactive=False, verbosity=1)
            if not omitir_front:
                self.stdout.write("Compilando frontend React…")
                compilar_frontend()
                self.stdout.write(self.style.SUCCESS("Frontend listo en /static/frontend/."))
        return super().handle(*args, **options)

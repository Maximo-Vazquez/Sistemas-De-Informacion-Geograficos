"""Lectura tipada de variables de entorno."""

import os

from dotenv import load_dotenv

load_dotenv()

VERDADEROS = {"1", "true", "yes", "si", "on"}


def env_str(nombre: str, defecto: str = "") -> str:
    return os.environ.get(nombre, defecto).strip()


def env_bool(nombre: str, defecto: bool = False) -> bool:
    valor = os.environ.get(nombre)
    if valor is None:
        return defecto
    return valor.strip().lower() in VERDADEROS


def env_list(nombre: str, defecto: str = "") -> list[str]:
    """Lista separada por comas, sin elementos vacíos."""
    return [parte.strip() for parte in env_str(nombre, defecto).split(",") if parte.strip()]

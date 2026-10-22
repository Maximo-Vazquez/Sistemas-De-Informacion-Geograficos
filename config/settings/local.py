"""Desarrollo local: DEBUG activo y PostgreSQL de docker-compose."""

from .base import *  # noqa: F403
from .entorno import env_bool

DEBUG = env_bool("DEBUG", True)

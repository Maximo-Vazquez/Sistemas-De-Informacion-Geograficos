"""Tests: sin assets de Vite y con contraseñas rápidas."""

from .base import *  # noqa: F403

DEBUG = False
VITE_SKIP_MANIFEST_CHECK = True
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

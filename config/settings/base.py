"""Configuración común a todos los entornos.

Cada entorno (local, production, test) importa este módulo y ajusta lo propio.
Los secretos llegan siempre por variables de entorno.
"""

from pathlib import Path

from .entorno import env_bool, env_list, env_str

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = env_str("DJANGO_SECRET_KEY", "solo-para-desarrollo-no-usar-en-produccion")
DEBUG = env_bool("DEBUG", False)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")

SITE_NAME = env_str("SITE_NAME", "Visor SIG Chaco")
SITE_ID = 1

# Servidor de mapas (GeoServer, ADR-0008). El visor lo consume desde el navegador.
GEOSERVER_URL = env_str("GEOSERVER_URL", "http://localhost:8085/geoserver").rstrip("/")
GEOSERVER_WORKSPACE = env_str("GEOSERVER_WORKSPACE", "ign")

INSTALLED_APPS = [
    # Primero: su runserver (migra y compila el frontend) reemplaza al de staticfiles.
    "apps.core",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # Autenticación estándar: allauth con Google como único proveedor.
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    # Apps del proyecto
    "apps.cuentas",
    "apps.administracion",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "apps.core.context_processors.sitio",
            ],
        },
    },
]

# PostgreSQL desde el inicio. Para GeoDjango alcanza con definir
# DB_ENGINE=django.contrib.gis.db.backends.postgis y usar la imagen postgis/postgis.
DATABASES = {
    "default": {
        "ENGINE": env_str("DB_ENGINE", "django.db.backends.postgresql"),
        "NAME": env_str("DB_NAME", "visor_sig"),
        "USER": env_str("DB_USER", "visor_sig"),
        "PASSWORD": env_str("DB_PASSWORD", "visor_sig"),
        "HOST": env_str("DB_HOST", "localhost"),
        "PORT": env_str("DB_PORT", "5432"),
        "CONN_MAX_AGE": 60,
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

LANGUAGE_CODE = "es-ar"
TIME_ZONE = "America/Argentina/Buenos_Aires"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

# --- Autenticación (allauth, solo Google) ---
LOGIN_URL = "account_login"
LOGIN_REDIRECT_URL = "administracion:panel"
ACCOUNT_LOGOUT_REDIRECT_URL = "core:inicio"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*"]
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGOUT_ON_GET = False
SOCIALACCOUNT_ONLY = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_LOGIN_ON_GET = False
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_ADAPTER = "apps.cuentas.adapters.CuentaSocialAdapter"
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": env_str("GOOGLE_CLIENT_ID", ""),
            "secret": env_str("GOOGLE_CLIENT_SECRET", ""),
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"prompt": "select_account"},
    }
}

# Vite: en desarrollo se puede apuntar al dev server; en producción se lee el manifest.
VITE_DEV_SERVER_URL = env_str("VITE_DEV_SERVER_URL", "")
VITE_SKIP_MANIFEST_CHECK = False

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env_str("LOG_LEVEL", "INFO")},
}

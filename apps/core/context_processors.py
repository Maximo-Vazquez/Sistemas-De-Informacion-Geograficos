from django.conf import settings


def sitio(request):
    """Nombre visible del sitio para títulos y encabezados."""
    return {"SITE_NAME": settings.SITE_NAME}

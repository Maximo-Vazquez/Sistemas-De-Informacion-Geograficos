from django.shortcuts import render

from .selectors import datos_inicio


def inicio(request):
    """Pantalla pública de presentación del proyecto."""
    return render(request, "core/inicio.html", {"inicio_app": datos_inicio(request)})


def sin_permiso(request, exception=None):
    """403 amable: la sesión es válida pero el mail no tiene acceso."""
    return render(request, "403.html", status=403)

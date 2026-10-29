from django.http import HttpResponse


def salud(request):
    """Responde 200 cuando el servidor de pruebas está listo."""
    return HttpResponse("ok")

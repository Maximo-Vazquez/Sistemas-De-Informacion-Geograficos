from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .selectors import datos_panel, datos_visor
from .services import GeoServerNoDisponible, TransaccionInvalida, enviar_transaccion


@login_required
def panel(request):
    """Panel de gráficos. En esta etapa muestra los paneles en estado vacío."""
    return render(request, "administracion/panel.html", {"panel_app": datos_panel(request)})


@login_required
def visor(request):
    """Visor de mapas con OpenLayers sobre los servicios WMS/WFS de GeoServer."""
    return render(request, "administracion/visor.html", {"visor_app": datos_visor(request)})


@require_POST
@login_required
def visor_transaccion(request):
    """Reenvía a GeoServer un WFS-T que solo inserta en capas editables."""
    try:
        estado, cuerpo, tipo = enviar_transaccion(request.body)
    except TransaccionInvalida as error:
        return JsonResponse({"error": str(error)}, status=400)
    except GeoServerNoDisponible as error:
        return JsonResponse({"error": str(error)}, status=502)
    return HttpResponse(cuerpo, status=estado, content_type=tipo)

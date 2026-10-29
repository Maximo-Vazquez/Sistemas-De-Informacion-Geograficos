from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .selectors import datos_panel, datos_visor


@login_required
def panel(request):
    """Panel de gráficos. En esta etapa muestra los paneles en estado vacío."""
    return render(request, "administracion/panel.html", {"panel_app": datos_panel(request)})


@login_required
def visor(request):
    """Visor de mapas con OpenLayers sobre los servicios WMS/WFS de GeoServer."""
    return render(request, "administracion/visor.html", {"visor_app": datos_visor(request)})

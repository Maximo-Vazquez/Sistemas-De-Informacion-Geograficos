from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .selectors import datos_panel


@login_required
def panel(request):
    """Panel de gráficos. En esta etapa muestra los paneles en estado vacío."""
    return render(request, "administracion/panel.html", {"panel_app": datos_panel(request)})

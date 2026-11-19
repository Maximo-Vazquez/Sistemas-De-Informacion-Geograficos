from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods

from .forms import AltaElementoForm
from .selectors import capa_relevamiento, datos_panel, datos_visor
from .servicios import guardar_elemento


@login_required
def panel(request):
    """Panel de gráficos. En esta etapa muestra los paneles en estado vacío."""
    return render(request, "administracion/panel.html", {"panel_app": datos_panel(request)})


@login_required
def visor(request):
    """Visor de mapas con OpenLayers sobre los servicios WMS/WFS de GeoServer."""
    return render(request, "administracion/visor.html", {"visor_app": datos_visor(request)})


@login_required
@require_http_methods(["GET", "POST"])
@never_cache
def elementos(request):
    if request.method == "GET":
        return JsonResponse(capa_relevamiento())

    formulario = AltaElementoForm(request.POST)
    if formulario.is_valid():
        try:
            elemento, creado = guardar_elemento(formulario.cleaned_data)
        except ValidationError as error:
            formulario.add_error(None, error)
        else:
            if request.get_preferred_type(["text/html", "application/json"]) == "application/json":
                return JsonResponse(elemento.como_feature(), status=201 if creado else 200)
            messages.success(request, "Elemento guardado en la capa de relevamiento.")
            return redirect("administracion:visor")

    errores = {campo: list(mensajes) for campo, mensajes in formulario.errors.items()}
    return JsonResponse({"errores": errores}, status=400)

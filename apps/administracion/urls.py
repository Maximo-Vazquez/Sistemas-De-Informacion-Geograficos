from django.urls import path

from . import views

app_name = "administracion"

urlpatterns = [
    path("", views.panel, name="panel"),
    path("visor/", views.visor, name="visor"),
    path("visor/transaccion/", views.visor_transaccion, name="visor_transaccion"),
]

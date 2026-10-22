from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("", include("apps.core.urls")),
    path("accounts/", include("allauth.urls")),
    path("administracion/", include("apps.administracion.urls")),
    path("django-admin/", admin.site.urls),
]

handler403 = "apps.core.views.sin_permiso"

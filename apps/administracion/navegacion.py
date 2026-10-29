"""Navegación del sidebar de Administración.

Cada sección nueva agrega aquí su ítem; `icon` debe existir en ICONS de
frontend/src/components/admin/admin-nav.tsx.
"""

from django.urls import reverse


def navegacion_admin():
    return [
        {
            "id": "general",
            "label": "General",
            "items": [
                {"id": "panel", "label": "Panel", "icon": "dashboard", "href": reverse("administracion:panel")},
                {"id": "visor", "label": "Visor", "icon": "map", "href": reverse("administracion:visor")},
            ],
        },
    ]

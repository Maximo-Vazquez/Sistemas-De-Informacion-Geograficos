from django.db import models


class ElementoVectorial(models.Model):
    """Elemento de la capa de relevamiento, con geometría GeoJSON en EPSG:4326."""

    solicitud = models.UUIDField(primary_key=True, editable=False)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, max_length=1000)
    geometria = models.JSONField()

    def __str__(self):
        return self.nombre

    def como_feature(self):
        return {
            "type": "Feature",
            "id": f"relevamiento.{self.pk}",
            "geometry": self.geometria,
            "properties": {"nombre": self.nombre, "descripcion": self.descripcion},
        }

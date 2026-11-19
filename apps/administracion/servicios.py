from django.core.exceptions import ValidationError

from .models import ElementoVectorial


def guardar_elemento(datos):
    atributos = {campo: datos[campo] for campo in ("nombre", "descripcion", "geometria")}
    # La clave primaria hace que los reintentos de la misma alta sean atómicos.
    elemento, creado = ElementoVectorial.objects.get_or_create(pk=datos["solicitud"], defaults=atributos)
    if not creado and any(getattr(elemento, campo) != valor for campo, valor in atributos.items()):
        raise ValidationError("Ya se guardó un elemento con este dibujo. Cancelá el formulario y volvé a dibujar.")
    return elemento, creado

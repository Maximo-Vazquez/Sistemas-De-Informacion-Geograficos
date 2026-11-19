from django import forms

from .models import ElementoVectorial


def _posicion_valida(coordenadas):
    return (
        isinstance(coordenadas, list)
        and len(coordenadas) == 2
        and all(type(valor) in (int, float) for valor in coordenadas)
        and -180 <= coordenadas[0] <= 180
        and -90 <= coordenadas[1] <= 90
    )


def _linea_valida(coordenadas):
    return (
        isinstance(coordenadas, list)
        and len(coordenadas) >= 2
        and all(_posicion_valida(posicion) for posicion in coordenadas)
        and any(posicion != coordenadas[0] for posicion in coordenadas[1:])
    )


def _anillo_valido(anillo):
    if not _linea_valida(anillo) or len(anillo) < 4 or anillo[0] != anillo[-1]:
        return False
    # Trasladar al primer vértice evita perder precisión al calcular el área de un anillo pequeño.
    x, y = anillo[0]
    area_doble = sum(
        (a[0] - x) * (b[1] - y) - (b[0] - x) * (a[1] - y)
        for a, b in zip(anillo, anillo[1:], strict=False)
    )
    return area_doble != 0


def _poligono_valido(coordenadas):
    return isinstance(coordenadas, list) and len(coordenadas) == 1 and _anillo_valido(coordenadas[0])


VALIDAR_COORDENADAS = {"Point": _posicion_valida, "LineString": _linea_valida, "Polygon": _poligono_valido}


class AltaElementoForm(forms.ModelForm):
    solicitud = forms.UUIDField()

    class Meta:
        model = ElementoVectorial
        fields = ["nombre", "descripcion", "geometria"]

    def clean_geometria(self):
        geometria = self.cleaned_data["geometria"]
        if not isinstance(geometria, dict) or not isinstance(geometria.get("type"), str):
            raise forms.ValidationError("Elegí un tipo de geometría y dibujala en el mapa.")
        tipo = geometria["type"]
        coordenadas = geometria.get("coordinates")
        validar = VALIDAR_COORDENADAS.get(tipo)
        if validar is None or not validar(coordenadas):
            raise forms.ValidationError("La geometría es inválida. Cancelá el formulario y volvé a dibujarla.")
        return {"type": tipo, "coordinates": coordenadas}

"""Reglas de escritura sobre usuarios."""


def completar_nombre(user, datos_google: dict) -> None:
    """Completa nombre y apellido desde el perfil de Google sin pisar datos existentes."""
    nombre = (datos_google.get("given_name") or "").strip()
    apellido = (datos_google.get("family_name") or "").strip()
    if not nombre and not apellido:
        partes = (datos_google.get("name") or "").strip().split(" ", 1)
        nombre, apellido = partes[0], partes[1] if len(partes) > 1 else ""
    user.first_name = user.first_name or nombre
    user.last_name = user.last_name or apellido

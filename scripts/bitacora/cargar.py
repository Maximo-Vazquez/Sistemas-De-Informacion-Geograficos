"""Lectura y validación de las fuentes de la bitácora (docs/bitacora/)."""

import datetime as dt
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ESTADOS_ADR = {"propuesta", "aceptada", "reemplazada", "descartada"}
ESTADOS_CONSIGNA = {"pendiente", "en curso", "completa"}


class ErrorFuente(ValueError):
    """Una fuente de la bitácora tiene un formato inválido."""


@dataclass
class Entrada:
    """Un archivo Markdown con front matter (ADR o sesión de registro)."""

    archivo: Path
    meta: dict
    cuerpo: str


@dataclass
class Fuentes:
    documento: dict
    secciones: dict[str, str]
    decisiones: list[Entrada] = field(default_factory=list)
    registro: list[Entrada] = field(default_factory=list)
    estado_tpi: list[dict] = field(default_factory=list)


def leer_yaml(ruta: Path):
    with open(ruta, encoding="utf-8") as archivo:
        return yaml.safe_load(archivo)


def leer_entrada(ruta: Path) -> Entrada:
    texto = ruta.read_text(encoding="utf-8")
    if not texto.startswith("---\n"):
        raise ErrorFuente(f"{ruta}: falta el front matter (bloque --- al inicio).")
    _, meta, cuerpo = texto.split("---\n", 2)
    return Entrada(ruta, yaml.safe_load(meta) or {}, cuerpo.strip())


def _exigir(entrada: Entrada, campos: tuple[str, ...]) -> None:
    faltan = [campo for campo in campos if campo not in entrada.meta]
    if faltan:
        raise ErrorFuente(f"{entrada.archivo}: faltan campos {', '.join(faltan)} en el front matter.")


def _como_fecha(valor, origen: Path) -> dt.date:
    if isinstance(valor, dt.date):
        return valor
    try:
        return dt.date.fromisoformat(str(valor))
    except ValueError as error:
        raise ErrorFuente(f"{origen}: fecha inválida '{valor}' (usar AAAA-MM-DD).") from error


def cargar_decisiones(carpeta: Path) -> list[Entrada]:
    decisiones = []
    for ruta in sorted(carpeta.glob("ADR-*.md")):
        entrada = leer_entrada(ruta)
        _exigir(entrada, ("id", "titulo", "estado", "fecha"))
        if entrada.meta["estado"] not in ESTADOS_ADR:
            raise ErrorFuente(f"{ruta}: estado '{entrada.meta['estado']}' no es uno de {sorted(ESTADOS_ADR)}.")
        entrada.meta["fecha"] = _como_fecha(entrada.meta["fecha"], ruta)
        decisiones.append(entrada)
    return sorted(decisiones, key=lambda entrada: entrada.meta["id"])


def cargar_registro(carpeta: Path) -> list[Entrada]:
    sesiones = []
    for ruta in sorted(carpeta.glob("*.md")):
        entrada = leer_entrada(ruta)
        _exigir(entrada, ("fecha", "titulo"))
        entrada.meta["fecha"] = _como_fecha(entrada.meta["fecha"], ruta)
        sesiones.append(entrada)
    return sorted(sesiones, key=lambda entrada: (entrada.meta["fecha"], entrada.archivo.name))


def cargar_estado(ruta: Path) -> list[dict]:
    consignas = leer_yaml(ruta) or []
    for consigna in consignas:
        if consigna.get("estado") not in ESTADOS_CONSIGNA:
            raise ErrorFuente(f"{ruta}: consigna {consigna.get('id')} con estado inválido.")
    return consignas


def cargar_documento(ruta: Path) -> dict:
    documento = leer_yaml(ruta)
    versiones = documento.get("versiones") or []
    if not versiones:
        raise ErrorFuente(f"{ruta}: hace falta al menos una entrada en 'versiones'.")
    for version in versiones:
        version["fecha"] = _como_fecha(version["fecha"], ruta)
    if versiones[-1]["version"] != documento["version"]:
        raise ErrorFuente(f"{ruta}: 'version' debe coincidir con la última entrada de 'versiones'.")
    documento["fecha_version"] = versiones[-1]["fecha"]
    return documento


def cargar(raiz: Path) -> Fuentes:
    return Fuentes(
        documento=cargar_documento(raiz / "documento.yaml"),
        secciones={ruta.stem: ruta.read_text(encoding="utf-8").strip() for ruta in sorted(raiz.glob("secciones/*.md"))},
        decisiones=cargar_decisiones(raiz / "decisiones"),
        registro=cargar_registro(raiz / "registro"),
        estado_tpi=cargar_estado(raiz / "estado-tpi.yaml"),
    )

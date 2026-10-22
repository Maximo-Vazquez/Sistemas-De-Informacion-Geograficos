"""Arma el Markdown completo de la bitácora a partir de las fuentes cargadas."""

import re

from .cargar import Entrada, Fuentes

MARCA_CUERPO = "<!-- cuerpo -->"
AVISO = "<!-- Generado por scripts/generar_bitacora.py. No editar: modificar las fuentes en docs/bitacora/. -->"
TITULO = re.compile(r"^(#{1,6})\s+(.*)$")


def fecha_larga(fecha) -> str:
    return fecha.strftime("%d/%m/%Y")


def _celda(valor) -> str:
    return str(valor).replace("|", "\\|").replace("\n", "<br>")


def tabla(encabezados: list[str], filas: list[list]) -> str:
    lineas = [
        "| " + " | ".join(encabezados) + " |",
        "|" + "|".join("---" for _ in encabezados) + "|",
    ]
    lineas += ["| " + " | ".join(_celda(valor) for valor in fila) + " |" for fila in filas]
    return "\n".join(lineas)


def bajar_titulos(texto: str, niveles: int = 1) -> str:
    """Baja los títulos de un cuerpo para que no compitan con la numeración del documento."""

    def bajar(linea: str) -> str:
        coincidencia = TITULO.match(linea)
        if not coincidencia:
            return linea
        nivel = min(len(coincidencia.group(1)) + niveles, 6)
        return f"{'#' * max(nivel, 3)} {coincidencia.group(2)}"

    return "\n".join(bajar(linea) for linea in texto.splitlines())


def numerar_titulos(texto: str) -> str:
    """Numera títulos de nivel 1 y 2 (1, 1.1) fuera de los bloques de código."""
    capitulo, apartado, en_codigo = 0, 0, False
    salida = []
    for linea in texto.splitlines():
        if linea.startswith("```"):
            en_codigo = not en_codigo
        coincidencia = None if en_codigo else TITULO.match(linea)
        if coincidencia and len(coincidencia.group(1)) == 1:
            capitulo, apartado = capitulo + 1, 0
            linea = f"# {capitulo} {coincidencia.group(2)}"
        elif coincidencia and len(coincidencia.group(1)) == 2:
            apartado += 1
            linea = f"## {capitulo}.{apartado} {coincidencia.group(2)}"
        salida.append(linea)
    return "\n".join(salida)


def preliminares(documento: dict) -> str:
    organizacion = "<br>".join(documento["organizacion"])
    datos = tabla(["", ""], [
        ["**Título del proyecto**", documento["titulo_proyecto"]],
        ["**Entregable**", documento["entregable"]],
        ["**Organización para quien se redacta**", organizacion],
        ["**Autor**", documento["autor"]],
    ])
    ficha = tabla(["", ""], [
        ["**Autor**", documento["autor"]],
        ["**Responsables**", "<br>".join(documento["responsables"])],
        ["**Integrantes**", "<br>".join(documento["integrantes"])],
        ["**Proyecto**", documento["titulo_proyecto"]],
        ["**Lugar de realización**", organizacion],
        ["**Nombre del documento**", documento["nombre_documento"]],
        ["**Versión/Edición**", documento["version"]],
        ["**Fecha de versión**", fecha_larga(documento["fecha_version"])],
    ])
    versiones = tabla(["Versión", "Fecha", "Cambios"], [
        [v["version"], fecha_larga(v["fecha"]), "; ".join(v["cambios"])] for v in reversed(documento["versiones"])
    ])
    return f"{datos}\n\n## Ficha del documento\n\n{ficha}\n\n## Control de versiones\n\n{versiones}"


def bloque_estado(consignas: list[dict]) -> str:
    filas = [[c["id"], c["descripcion"], c["estado"].capitalize(), c.get("referencia", "—")] for c in consignas]
    return (
        "# Estado de las consignas del TPI\n\n"
        "Avance de cada consigna de `docs/tpi/practico.pdf` al cierre de esta versión.\n\n"
        "Tabla: Estado de las consignas del TPI\n\n"
        + tabla(["Consigna", "Descripción", "Estado", "Referencia"], filas)
    )


def _adr(entrada: Entrada) -> str:
    meta = entrada.meta
    detalle = f"*Estado: {meta['estado']} · Fecha: {fecha_larga(meta['fecha'])}"
    detalle += f" · Reemplaza a {meta['reemplaza']}*" if meta.get("reemplaza") else "*"
    return f"## {meta['id']} — {meta['titulo']}\n\n{detalle}\n\n{bajar_titulos(entrada.cuerpo)}"


def bloque_decisiones(decisiones: list[Entrada]) -> str:
    resumen = tabla(
        ["ADR", "Decisión", "Estado", "Fecha"],
        [[d.meta["id"], d.meta["titulo"], d.meta["estado"], fecha_larga(d.meta["fecha"])] for d in decisiones],
    )
    detalle = "\n\n".join(_adr(entrada) for entrada in decisiones)
    return (
        "# Registro de decisiones (ADR)\n\n"
        "Cada decisión técnica sigue el formato MADR: contexto, opciones consideradas, decisión y consecuencias.\n\n"
        f"Tabla: Resumen de decisiones\n\n{resumen}\n\n{detalle}"
    )


def _sesion(entrada: Entrada) -> str:
    meta = entrada.meta
    datos = [meta.get("autor", "")]
    if meta.get("decisiones"):
        datos.append("Decisiones: " + ", ".join(meta["decisiones"]))
    linea = " · ".join(dato for dato in datos if dato)
    partes = [f"## {fecha_larga(meta['fecha'])} — {meta['titulo']}"]
    if linea:
        partes.append(f"*{linea}*")
    partes.append(bajar_titulos(entrada.cuerpo))
    return "\n\n".join(partes)


def bloque_registro(sesiones: list[Entrada]) -> str:
    cuerpo = "\n\n".join(_sesion(entrada) for entrada in sesiones)
    return f"# Bitácora de trabajo\n\nRegistro cronológico de las sesiones de trabajo.\n\n{cuerpo}"


def armar(fuentes: Fuentes) -> str:
    """Orden: secciones 01–03, bloques generados (04–06) y secciones 07 en adelante."""
    bloques = dict(fuentes.secciones)
    bloques["04-estado-tpi"] = bloque_estado(fuentes.estado_tpi)
    bloques["05-decisiones"] = bloque_decisiones(fuentes.decisiones)
    bloques["06-registro"] = bloque_registro(fuentes.registro)
    cuerpo = numerar_titulos("\n\n".join(bloques[clave] for clave in sorted(bloques)))
    return f"{AVISO}\n\n{preliminares(fuentes.documento)}\n\n{MARCA_CUERPO}\n\n{cuerpo}\n"

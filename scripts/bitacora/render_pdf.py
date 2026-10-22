"""Convierte el Markdown de la bitácora en HTML imprimible y PDF (WeasyPrint)."""

import html
import itertools
import re
from pathlib import Path
from string import Template

import markdown

from .armar_md import MARCA_CUERPO

EXTENSIONES = ["tables", "attr_list", "sane_lists", "fenced_code", "toc"]
PENDIENTE = re.compile(r"\[PENDIENTE\]([^<]*)")
LEYENDA = re.compile(r"<p>Tabla: (.*?)</p>")
THEAD_VACIO = re.compile(r"<thead>\s*<tr>(?:\s*<th>\s*</th>)+\s*</tr>\s*</thead>")


def _html(texto: str) -> markdown.Markdown:
    convertidor = markdown.Markdown(extensions=EXTENSIONES, extension_configs={"toc": {"toc_depth": "1-2"}})
    convertidor.convertido = convertidor.convert(texto)
    return convertidor


def _numerar_leyendas(contenido: str) -> str:
    contador = itertools.count(1)
    return LEYENDA.sub(lambda m: f'<p class="leyenda">Tabla {next(contador)} {m.group(1)}</p>', contenido)


def _postprocesar(contenido: str) -> str:
    contenido = THEAD_VACIO.sub("", contenido)
    contenido = PENDIENTE.sub(r'<span class="pendiente">[PENDIENTE]\1</span>', contenido)
    return _numerar_leyendas(contenido)


def _item_indice(token: dict, nivel: int) -> str:
    numero, _, texto = html.unescape(token["name"]).partition(" ")
    return (
        f'<li class="n{nivel}"><a href="#{token["id"]}"><span class="num">{html.escape(numero)}</span>'
        f'<span class="txt">{html.escape(texto)}</span></a></li>'
    )


def indice(tokens: list[dict]) -> str:
    items = []
    for capitulo in tokens:
        items.append(_item_indice(capitulo, 1))
        items.extend(_item_indice(apartado, 2) for apartado in capitulo.get("children", []))
    return f'<ul class="toc">{"".join(items)}</ul>'


def _logo(assets: Path, clase: str) -> str:
    return f'<img class="{clase}" src="logo.png" alt="">' if (assets / "logo.png").exists() else ""


def armar_html(texto_md: str, documento: dict, assets: Path) -> str:
    previo, cuerpo = texto_md.split(MARCA_CUERPO, 1)
    cuerpo_md = _html(cuerpo)
    plantilla = Template((assets / "plantilla.html").read_text(encoding="utf-8"))
    return plantilla.substitute(
        titulo=html.escape(documento["nombre_documento"]),
        css=(assets / "estilos.css").read_text(encoding="utf-8"),
        logo_portada=_logo(assets, "logo-portada"),
        logo_encabezado=_logo(assets, "logo-encabezado"),
        organizacion="".join(f"<p>{html.escape(linea)}</p>" for linea in documento["portada"]["organizacion"]),
        titulo_portada=html.escape(documento["portada"]["titulo"]),
        subtitulo=html.escape(documento["portada"]["subtitulo"]),
        descripcion=html.escape(documento["portada"]["descripcion"]),
        pie_portada="".join(f"<p>{html.escape(linea)}</p>" for linea in documento["portada"]["pie"]),
        encabezado_1=html.escape(documento["encabezado"][0]),
        encabezado_2=html.escape(documento["encabezado"][1]),
        version=html.escape(str(documento["version"])),
        area=html.escape(documento["area"]),
        preliminar=_postprocesar(_html(previo).convertido),
        indice=indice(cuerpo_md.toc_tokens),
        cuerpo=_postprocesar(cuerpo_md.convertido),
    )


def generar_pdf(texto_md: str, documento: dict, assets: Path, destino: Path) -> None:
    from weasyprint import HTML  # import diferido: --solo-md funciona sin WeasyPrint

    contenido = armar_html(texto_md, documento, assets)
    HTML(string=contenido, base_url=str(assets)).write_pdf(destino)

"""Genera la bitácora técnica (Markdown y PDF) desde las fuentes de docs/bitacora/.

Uso:
  python scripts/generar_bitacora.py            # escribe salida/bitacora.md y salida/bitacora.pdf
  python scripts/generar_bitacora.py --solo-md  # solo el Markdown (no requiere WeasyPrint)
  python scripts/generar_bitacora.py --verificar  # falla si salida/bitacora.md no está al día (CI)
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bitacora.armar_md import armar  # noqa: E402
from bitacora.cargar import ErrorFuente, cargar  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent / "docs" / "bitacora"
SALIDA = RAIZ / "salida"


def _argumentos() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    modo = parser.add_mutually_exclusive_group()
    modo.add_argument("--solo-md", action="store_true", help="genera solo el Markdown")
    modo.add_argument("--verificar", action="store_true", help="compara sin escribir")
    return parser.parse_args()


def verificar(texto: str) -> int:
    actual = (SALIDA / "bitacora.md").read_text(encoding="utf-8") if (SALIDA / "bitacora.md").exists() else ""
    if actual != texto:
        print("La bitácora generada no está al día: correr python scripts/generar_bitacora.py y commitear.")
        return 1
    print("Bitácora al día.")
    return 0


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    argumentos = _argumentos()
    try:
        fuentes = cargar(RAIZ)
    except ErrorFuente as error:
        print(f"Error en las fuentes: {error}")
        return 1
    texto = armar(fuentes)
    if argumentos.verificar:
        return verificar(texto)
    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "bitacora.md").write_text(texto, encoding="utf-8", newline="\n")
    print(f"Markdown: {SALIDA / 'bitacora.md'}")
    if argumentos.solo_md:
        return 0
    if not (RAIZ / "assets" / "logo.png").exists():
        print("Aviso: falta docs/bitacora/assets/logo.png; el PDF se genera sin logo.")
    from bitacora.render_pdf import generar_pdf

    generar_pdf(texto, fuentes.documento, RAIZ / "assets", SALIDA / "bitacora.pdf")
    print(f"PDF: {SALIDA / 'bitacora.pdf'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

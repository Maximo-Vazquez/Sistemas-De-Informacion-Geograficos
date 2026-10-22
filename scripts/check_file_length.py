"""Avisa qué archivos superan el largo de referencia de pyproject.toml ([tool.largo_archivos]).

El límite es un estándar orientativo, no una regla: un archivo puede extenderse si
dividirlo empeora la lectura. Solo informa; con --estricto sale con código 1.
Uso: python scripts/check_file_length.py [--estricto]
"""

import fnmatch
import subprocess
import sys
import tomllib
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
EXTENSIONES = {".py": "python", ".ts": "typescript", ".tsx": "typescript"}


def cargar_limites() -> dict:
    with open(RAIZ / "pyproject.toml", "rb") as archivo:
        return tomllib.load(archivo)["tool"]["largo_archivos"]


def archivos_versionados() -> list[str]:
    """Archivos que git conoce (versionados o nuevos sin ignorar)."""
    salida = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        cwd=RAIZ, capture_output=True, text=True, check=True,
    )
    return salida.stdout.splitlines()


def excluido(ruta: str, patrones: list[str]) -> bool:
    return any(ruta.startswith(patron) or fnmatch.fnmatch(ruta, f"{patron}*") for patron in patrones)


def excesos(limites: dict) -> list[tuple[str, int, int]]:
    hallazgos = []
    for ruta in archivos_versionados():
        tipo = EXTENSIONES.get(Path(ruta).suffix)
        archivo = RAIZ / ruta
        if not tipo or excluido(ruta, limites["excluir"]) or not archivo.exists():
            continue
        lineas = len(archivo.read_text(encoding="utf-8").splitlines())
        if lineas > limites[tipo]:
            hallazgos.append((ruta, lineas, limites[tipo]))
    return hallazgos


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    hallazgos = excesos(cargar_limites())
    for ruta, lineas, limite in hallazgos:
        print(f"Aviso: {ruta} tiene {lineas} líneas (referencia {limite}). Revisá si conviene dividirlo.")
    if not hallazgos:
        print("Largo de archivos: OK")
    return 1 if hallazgos and "--estricto" in sys.argv else 0


if __name__ == "__main__":
    sys.exit(main())

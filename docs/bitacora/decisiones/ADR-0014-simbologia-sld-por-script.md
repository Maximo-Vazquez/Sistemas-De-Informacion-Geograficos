---
id: ADR-0014
titulo: Simbología de las capas IGN en SLD generada por script
estado: aceptada
fecha: 2026-11-19
---

## Contexto

La consigna a.3 pide mostrar la leyenda de las capas con las clases de la simbología. Las 47 capas se publicaron con los estilos genéricos de GeoServer (`line`, `point`, `polygon`), cuya leyenda muestra un único símbolo sin clases. Además, en la vista de toda la provincia los 92.910 caminos de tierra tapaban el resto del mapa.

## Opciones consideradas

- Diseñar cada estilo a mano en la consola de GeoServer.
- Escribir 47 archivos SLD a mano y versionarlos.
- Definir la simbología como datos en Python y generar los SLD con un script que los cargue por la API REST.

## Decisión

La simbología se define en `scripts/simbologia_ign.py` y `scripts/estilos_ign.py` la carga en el espacio `ign` y la asigna como estilo por defecto de cada capa. Ocho capas se clasifican por un atributo con valores comprobados en PostGIS: red vial y vías secundarias por `tipo`, localidades por `tipo`, cursos de agua por `regimen`, espejos de agua, curvas de nivel, límites y puentes por `tipo`. Las demás reciben un símbolo propio según su tema. Las clases más densas se dibujan solo desde cierta escala, indicada en el título de la regla.

## Consecuencias

- La leyenda del visor muestra las clases con títulos en castellano, sin cambios en el frontend más allá del color del texto según el tema.
- Cualquier instalación aplica la misma simbología con un comando, después de `publicar_ign.py`. La consola de GeoServer no es la fuente de verdad: un cambio hecho a mano se pierde al volver a correr el script.
- Los colores de la simbología viven en el script, porque los dibuja GeoServer y no el frontend.

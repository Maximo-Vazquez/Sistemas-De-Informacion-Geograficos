# Chaco — departamentos e hidrografía

Proyecto QGIS editable que muestra los 25 departamentos del Chaco y la red hidrográfica recortada al área provincial.

## Archivos versionados

- Mapa_Chaco.qgz: proyecto QGIS.
- datos/procesados/chaco.gpkg: capas Departamentos y Cursos de agua; es la fuente de datos que usa el proyecto.
- salidas/Mapa_departamentos_hidrografia_Chaco.pdf y .png: exportaciones.
- scripts/generar_mapa_chaco.py: generador del proyecto y las exportaciones.

## Insumos originales

Los archivos se prepararon desde DATOS-LABQGIS2026 (1).rar. La capa departamental contiene 25 polígonos; la tabla DBF indica actualización 2017-09-06. La capa nacional de cursos de agua fue recortada a Chaco y produjo 750 tramos; su tabla DBF indica actualización 2011-05-20. Son datos provistos para este trabajo, no una cartografía oficial actualizada.

Los archivos originales extraídos se conservan localmente en datos/fuente/ y el RAR en insumos/. No se incluyen en Git: el archivo nacional descomprimido supera 170 MB y el GeoPackage versionado ya contiene las capas necesarias para abrir y trabajar con este mapa.

El TIFF 3420C_2010_327_RGB_LATLNG.tif está georreferenciado sobre el sureste de África. La escena Landsat incluida en el RAR cubre solo una parte del Chaco. Ambos se conservan localmente y se dejaron fuera del mapa provincial.

## Generación

El script scripts/generar_mapa_chaco.py requiere datos/procesados/chaco.gpkg y el Python incluido con QGIS. Al ejecutarlo, actualiza Mapa_Chaco.qgz y las exportaciones de salidas/.

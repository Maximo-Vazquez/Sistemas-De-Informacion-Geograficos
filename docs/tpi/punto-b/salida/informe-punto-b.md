<!-- Generado por scripts/generar_informe_b.py desde docs/tpi/punto-b/informe.md. No editar. -->

|  |  |
|---|---|
| **Título del proyecto** | Visor SIG Chaco |
| **Entregable** | Trabajo Práctico Integrador – consigna b |
| **Organización para quien se redacta** | Universidad Tecnológica Nacional – Facultad Regional Resistencia<br>French 414, Resistencia, Chaco, Argentina. |
| **Autor** | Vazquez Maximo Ezequiel |

## Ficha del documento

|  |  |
|---|---|
| **Autor** | Vazquez Maximo Ezequiel |
| **Responsables** | Ing. Ilse Hodapp<br>Ing. Rodrigo Valdés |
| **Integrantes** | Vazquez Maximo Ezequiel<br>[PENDIENTE] completar el resto del grupo (4 a 5 integrantes) |
| **Proyecto** | Visor SIG Chaco |
| **Lugar de realización** | Universidad Tecnológica Nacional – Facultad Regional Resistencia<br>French 414, Resistencia, Chaco, Argentina. |
| **Nombre del documento** | Informe del punto b – RN 11 en la Provincia del Chaco |
| **Versión/Edición** | 1.1.0 |
| **Fecha de versión** | 19/11/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.1.0 | 19/11/2026 | Versión resumida y en lenguaje más simple, con el código de QGIS de cada paso; el análisis se hace solo en QGIS (sin la repetición en SQL) |
| 1.0.0 | 19/11/2026 | Primera versión del informe con las tres respuestas, la metodología en PostGIS y QGIS, figuras y referencias |

<!-- cuerpo -->

# 1 Objetivo

El Ministerio de Planificación prevé obras de mantenimiento en la **Ruta Nacional 11 (RN 11)** dentro del Chaco. Para preparar los pliegos, la consigna b pide tres datos: cuántos kilómetros tiene la traza en la provincia, a cuánta gente afecta (hasta 10 km y de 10 a 20 km de la ruta, en categorías excluyentes) y cuántos puentes la cruzan.

Tabla: Respuestas a la consigna b

| Pregunta | Respuesta |
|---|---|
| Km de la traza en el Chaco | **172,39 km** |
| Población hasta 10 km | **360.983 habitantes** (21 localidades) |
| Población de 10 a 20 km | **26.080 habitantes** (15 localidades) |
| Puentes sobre la traza | **21 puentes** (detalle en la sección de resultados) |

# 2 Datos y herramientas

Se usaron las capas del **SIG IGN 250** (IGN, 2011) cargadas en PostGIS: provincias, red vial, localidades, puentes y cursos de agua. La población es el campo `canthab` de las localidades, que corresponde al Censo 2001 (INDEC, 2001).

Las capas vienen en grados (EPSG:4326), y en grados no se pueden medir kilómetros ni trazar un buffer en metros. Por eso todo se calcula en **POSGAR 2007 faja 5 (EPSG:5347)**, el marco oficial argentino en metros, cuyo meridiano central (60° O) pasa por el Chaco (IGN, s.f.).

El análisis se hizo en **QGIS 4.2** con las herramientas de **Procesamiento** (las de *Vectorial → Geoproceso*), escritas como un script de Python para poder repetirlo (`scripts/analisis_rn11_qgis.py`). QGIS lee las capas de PostGIS y guarda los resultados de nuevo en PostGIS, en el esquema `analisis`. Desde ahí GeoServer los publica y la aplicación web los muestra.

# 3 Pasos

Cada paso indica la herramienta de QGIS que se usó y el código del script que la ejecuta.

## 3.1 La traza

En la red vial hay dos rutas con el número 11: la nacional y una provincial distinta (RP 11). Se tomaron solo los tramos con `nro_ruta = '11'` y `administra = 'Nacional'`, se recortaron con el límite del Chaco y se unieron en una sola línea. Mide **172,39 km**, desde el límite con Santa Fe hasta el río Bermejo.

Herramientas: *Extraer por expresión*, *Cortar*, *Reproyectar capa*, *Disolver* y *Fusionar líneas*.

```python
rn11 = processing.run("native:extractbyexpression", {"INPUT": red_vial,
           "EXPRESSION": "\"nro_ruta\" = '11' AND \"administra\" = 'Nacional'"})
recorte = processing.run("native:clip", {"INPUT": rn11, "OVERLAY": chaco})
traza = processing.run("native:reprojectlayer", {"INPUT": recorte,
            "TARGET_CRS": "EPSG:5347"})              # POSGAR 2007 faja 5
traza = processing.run("native:mergelines", {"INPUT": disolver(traza)})
km = traza.geometry().length() / 1000                # 172,39 km
```

## 3.2 Las áreas de 10 y 20 km

Como las categorías son excluyentes, nadie puede contarse dos veces. Se armaron dos áreas que no se superponen, recortadas al Chaco:

- **Hasta 10 km:** buffer de 10 km alrededor de la traza.
- **De 10 a 20 km:** el buffer de 20 km menos el de 10 km, que queda como un anillo.

Herramientas: *Buffer*, *Cortar* y *Diferencia*.

```python
b10 = processing.run("native:buffer", {"INPUT": traza, "DISTANCE": 10000,
                                       "DISSOLVE": True})
b20 = processing.run("native:buffer", {"INPUT": traza, "DISTANCE": 20000,
                                       "DISSOLVE": True})
area10 = processing.run("native:clip", {"INPUT": b10, "OVERLAY": chaco})
anillo = processing.run("native:difference", {"INPUT": recortar(b20, chaco),
                                              "OVERLAY": b10})   # el anillo
```

![Paso 2](figuras/qgis-paso3-areas.png)

Figura: Áreas en QGIS: hasta 10 km (naranja) y de 10 a 20 km (amarillo).

## 3.3 La población

Se eligieron las localidades que caen dentro de cada área y se sumó su población. Solo se cuentan las del Chaco, según el atributo `provincia`. No se usó el polígono porque General Mansilla, de Formosa, queda dentro del límite del Chaco sobre el río Bermejo.

Herramientas: *Extraer por atributo* y *Extraer por localización* (predicado "está dentro").

```python
del_chaco = processing.run("native:extractbyattribute", {"INPUT": localidades,
                "FIELD": "provincia", "OPERATOR": 0, "VALUE": "Chaco"})
loc10 = processing.run("native:extractbylocation", {"INPUT": del_chaco,
            "PREDICATE": [6], "INTERSECT": area10})   # 6 = está dentro
poblacion_10 = sum(f["canthab"] or 0 for f in loc10.getFeatures())  # 360.983
```

## 3.4 Los puentes

La capa de puentes son puntos y no dice a qué ruta pertenece cada uno. Se consideró que un puente es de la RN 11 si está a **500 m o menos** de la traza y además su **camino más cercano es la RN 11**. Con eso se descartan 3 puentes de caminos vecinales cercanos. Cada puente se ubicó por su kilómetro sobre la traza y por el curso de agua que cruza.

Herramientas: *Extraer dentro de una distancia*, *Unir atributos por el más cercano* y *Extraer por expresión*.

```python
cerca = processing.run("native:extractwithindistance", {"INPUT": puentes,
            "REFERENCE": traza, "DISTANCE": 500})     # 24 puentes
unidos = processing.run("native:joinbynearest", {"INPUT": cerca,
             "INPUT_2": red_vial, "PREFIX": "via_",
             "FIELDS_TO_COPY": ["nro_ruta", "administra"]})
puentes_rn11 = processing.run("native:extractbyexpression", {"INPUT": unidos,
    "EXPRESSION": "via_nro_ruta = '11' AND via_administra = 'Nacional'"})  # 21
km = traza.lineLocatePoint(puente) / 1000            # kilómetro de cada puente
```

![Paso 4](figuras/qgis-paso5-puentes.png)

Figura: Puentes de la RN 11 en QGIS, rotulados con su kilómetro.

En el código se omite `["OUTPUT"]` y las funciones `disolver` y `recortar` resumen pasos con *Disolver* y *Cortar*; el script completo está en el repositorio.

# 4 Resultados

![Mapa general](figuras/mapa-general.png)

Figura: La RN 11 en el Chaco con sus áreas de influencia, las localidades y los puentes.

## 4.1 Población afectada

Tabla: Población afectada por categoría (solo Chaco)

| Categoría | Localidades | Con dato de población | Habitantes |
|---|---|---|---|
| Hasta 10 km | 21 | 7 | 360.983 |
| De 10 a 20 km | 15 | 8 | 26.080 |
| **Total** | 36 | 15 | **387.063** |

La obra afecta a **387.063 habitantes**, casi todos en el Gran Resistencia: la traza pasa a menos de 3 km del centro de la capital.

Tabla: Localidades del Chaco con dato de población

| Localidad | Categoría | Distancia (km) | Habitantes |
|---|---|---|---|
| Puerto Eva Perón | Hasta 10 km | 0,1 | 531 |
| Basail | Hasta 10 km | 0,4 | 1.960 |
| Margarita Belén | Hasta 10 km | 1,4 | 4.591 |
| Resistencia | Hasta 10 km | 2,7 | 274.490 |
| Fontana | Hasta 10 km | 3,6 | 26.745 |
| Colonia Benítez | Hasta 10 km | 4,1 | 1.928 |
| Barranqueras | Hasta 10 km | 8,3 | 50.738 |
| Puerto Tirol | De 10 a 20 km | 10,1 | 7.855 |
| General Vedia | De 10 a 20 km | 12,8 | 1.840 |
| Colonia Báranda | De 10 a 20 km | 13,8 | 391 |
| La Leonesa | De 10 a 20 km | 15,4 | 8.420 |
| Colonia Popular | De 10 a 20 km | 15,6 | 135 |
| Selvas Del Río De Oro | De 10 a 20 km | 18,3 | 502 |
| Las Palmas | De 10 a 20 km | 19,2 | 5.434 |
| Puerto Bermejo Nuevo | De 10 a 20 km | 19,9 | 1.503 |

Las otras 21 localidades son parajes y colonias sin dato de población. Dentro de los 20 km también hay localidades de otras provincias, como la ciudad de Corrientes, que no se cuentan porque la obra es en el Chaco. Suman 323.468 habitantes.

## 4.2 Puentes

**21 puentes** cruzan la traza:

Tabla: Puentes de la RN 11 en el Chaco, desde el límite con Santa Fe

| N.º | Km | Curso de agua | Localidad cercana |
|---|---|---|---|
| 1 | 9,9 | Arroyo Palmira | Playa Ford |
| 2 | 21,0 | Arroyo Saladillo | Basail |
| 3 | 34,0 | Río Palometa | Campo J. Billerio |
| 4 | 45,9 | Arroyo Saladito | Colonia Báranda |
| 5 | 56,2 | Río Salado | Los Palmares |
| 6 | 74,6 | Río Negro | Fontana |
| 7 | 86,5 | Río Tragadero | Colonia Benítez |
| 8 | 90,4 | Arroyo | Margarita Belén |
| 9 | 107,8 | Arroyo Costa Iné | Margarita Belén |
| 10 | 110,9 | Arroyo | Campo Las Palmas Del Chaco Austral |
| 11 | 112,3 | Arroyo Guaycurú | Campo Las Palmas Del Chaco Austral |
| 12 | 114,7 | Arroyo Guaycurú | Campo Las Palmas Del Chaco Austral |
| 13 | 126,0 | Arroyo | Lapacho |
| 14 | 130,3 | Arroyo Quía | Lapacho |
| 15 | 133,1 | Arroyo | Lapacho |
| 16 | 137,5 | Arroyo | Colonia Cabral Cue |
| 17 | 144,3 | Arroyo Zapirán | Colonia Cabral Cue |
| 18 | 155,8 | Arroyo | Tacuari |
| 19 | 160,0 | Arroyo Cangüí Grande | Tacuari |
| 20 | 164,6 | Arroyo Cangüí Chico | Sin Nombre |
| 21 | 171,4 | Río Bermejo | Puerto Eva Perón |

Para verificar, se contaron los cruces de la ruta con los cursos de agua: son 20. El del Río de Oro (km 141,7) no tiene un puente cargado en la capa del IGN.

![Visor con el tema Obra RN 11](figuras/app-visor-tema.png)

Figura: Los resultados en el visor web, con el tema "Obra RN 11".

# 5 Limitaciones

- La población es la del **Censo 2001**; con el Censo 2022 los valores serían mayores.
- Solo 15 de las 36 localidades tienen dato, así que la población rural queda **subestimada**.
- Las localidades son puntos: una ciudad se cuenta entera en la categoría donde cae su punto.
- A escala 1:250 000, un puente en el cruce de dos rutas podría asignarse a la otra.

# 6 Conclusión

La RN 11 recorre **172,39 km** en el Chaco. La obra afecta a **360.983 habitantes** hasta 10 km y a **26.080** de 10 a 20 km, **387.063** en total, concentrados en el Gran Resistencia. **21 puentes** cruzan la traza. El análisis se hizo con las herramientas de Procesamiento de QGIS y se puede repetir con el script del proyecto.

# 7 Referencias

- EPSG (s.f.). *EPSG:5347 – POSGAR 2007 / Argentina 5*. https://epsg.io/5347
- IGN – Instituto Geográfico Nacional (2011). *SIG IGN 250, escala 1:250 000*. https://www.ign.gob.ar/
- IGN – Instituto Geográfico Nacional (s.f.). *Marco de Referencia Geodésico Nacional POSGAR 2007*. https://www.ign.gob.ar/
- INDEC (2001). *Censo Nacional de Población, Hogares y Viviendas 2001*. https://www.indec.gob.ar/
- PostGIS (2025). *PostGIS 3.5 Manual*. https://postgis.net/docs/
- GeoServer (2025). *GeoServer 2.27 User Manual*. https://docs.geoserver.org/
- QGIS (2026). *QGIS User Guide: algoritmos de Procesamiento*. https://docs.qgis.org/
- UTN FRRe (2026). *Trabajo Práctico Integrador – Sistemas de Información Geográfica*. `docs/tpi/practico.pdf`.

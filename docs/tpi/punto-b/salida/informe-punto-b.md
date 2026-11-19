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
| **Versión/Edición** | 1.0.0 |
| **Fecha de versión** | 19/11/2026 |

## Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0.0 | 19/11/2026 | Primera versión del informe con las tres respuestas, la metodología en PostGIS y QGIS, figuras y referencias |

<!-- cuerpo -->

# 1 Objetivo y escenario

El Ministerio de Planificación de la Nación prevé obras de mantenimiento en la traza de la **Ruta Nacional 11 (RN 11)** dentro de la Provincia del Chaco. Para justificar la obra y preparar los pliegos de licitación, la consigna b del Trabajo Práctico Integrador pide tres datos:

1. Cuántos kilómetros tiene la traza de la ruta en la provincia.
2. A cuánta población afecta la obra de manera directa, en dos categorías excluyentes: la que vive **hasta 10 km** de la ruta y la que vive **hasta 20 km** (es decir, de 10 a 20 km).
3. Cuántos y cuáles puentes cruzan la traza en la provincia.

Este informe describe los pasos ejecutados, con capturas de cada uno, y presenta los resultados.

## 1.1 Respuestas en síntesis

Tabla: Respuestas a la consigna b

| Pregunta | Respuesta |
|---|---|
| Km de la traza en el Chaco | **172,39 km** |
| Población hasta 10 km | **360.983 habitantes** (21 localidades) |
| Población de 10 a 20 km | **26.080 habitantes** (15 localidades) |
| Puentes sobre la traza | **21 puentes** (detalle en la sección de resultados) |

# 2 Datos y herramientas

## 2.1 Capas utilizadas

Todas las capas provienen del **SIG IGN 250** del Instituto Geográfico Nacional, provisto por la cátedra (IGN, 2011). Están cargadas en PostGIS y publicadas por WMS y WFS en GeoServer (consignas a.1 y a.2).

Tabla: Capas del SIG IGN 250 usadas en el análisis

| Capa | Tabla PostGIS | Uso en el análisis |
|---|---|---|
| Provincias | `provincias` | Límite de la Provincia del Chaco para recortar |
| Red vial | `red_vial` | Traza de la RN 11 (`nro_ruta = '11'`, `administra = 'Nacional'`) |
| Localidades | `localidades` | Población por localidad (campo `canthab`) |
| Puentes de la red vial | `puente_red_vial_puntos` | Puentes sobre la traza |
| Cursos de agua | `curso_de_agua_hid` | Curso de agua que cruza cada puente y control |

## 2.2 Sistema de referencia

Las capas están en coordenadas geográficas (WGS 84, EPSG:4326). Una distancia o un buffer en grados no representa kilómetros reales, así que todas las medidas se hacen en **POSGAR 2007 / Argentina faja 5** (EPSG:5347). Es el marco oficial de la Argentina, con unidades en metros y meridiano central en 60° O, que atraviesa el este del Chaco (IGN, s.f.; EPSG, s.f.). Para pasar de WGS 84 a POSGAR 2007 se usa la transformación de mayor precisión que ofrece QGIS (0,5 m).

## 2.3 Herramientas

- **PostgreSQL 17 + PostGIS 3.5:** cálculo reproducible con SQL (`scripts/analisis_rn11.sql`).
- **QGIS 4.2.2:** los mismos pasos con algoritmos de Procesamiento, para validar el SQL y obtener las figuras (`scripts/analisis_rn11_qgis.py`).
- **GeoServer 2.27:** publica los resultados como capas WMS/WFS, que se ven en el visor web del proyecto.

El análisis se repite con dos comandos: `python scripts/analisis_rn11.py` en PostGIS y `scripts/analisis_rn11_qgis.py` con el Python de QGIS. Al final, el segundo compara sus números con los del primero.

# 3 Metodología

## 3.1 Paso 1. Extraer la RN 11 y recortarla al Chaco

En la red vial, el número de ruta **11** aparece con dos administraciones: la RN 11 (nacional, pavimentada) y la RP 11 (provincial, otra ruta, en gran parte de tierra). Se extraen solo los tramos con `nro_ruta = '11'` y `administra = 'Nacional'`, y se recortan con el polígono de la provincia.

```sql
SELECT ST_LineMerge(ST_CollectionExtract(
         ST_Intersection(ST_Union(ST_Transform(r.geom, 5347)), c.g), 2))
FROM red_vial r CROSS JOIN chaco c
WHERE r.nro_ruta = '11' AND r.administra = 'Nacional';
```

En QGIS: *Extraer por atributo* (provincia Chaco), *Extraer por expresión* (RN 11 nacional) y *Cortar*.

![Paso 1](figuras/qgis-paso1-extraccion.png)

Figura: Paso 1 en QGIS. En rojo, la RN 11 nacional; en negro, el límite de la Provincia del Chaco.

## 3.2 Paso 2. Reproyectar y medir la traza

La traza recortada se reproyecta a EPSG:5347, se disuelve y se fusiona en una sola línea (*Reproyectar capa*, *Disolver* y *Fusionar líneas*). El resultado es **una línea continua** entre el límite con Santa Fe y el río Bermejo (límite con Formosa), de **172,39 km**. El cálculo geodésico sobre el elipsoide da el mismo valor.

![Paso 2](figuras/qgis-paso2-traza.png)

Figura: Paso 2 en QGIS. La traza de la RN 11 dentro del Chaco, medida en POSGAR 2007 faja 5.

## 3.3 Paso 3. Áreas de influencia de 10 y 20 km

Las categorías de población son **excluyentes**, así que se usan dos áreas que no se superponen:

- **Hasta 10 km:** buffer de 10 km alrededor de la traza.
- **De 10 a 20 km:** anillo, que es el buffer de 20 km menos el de 10 km.

Las dos se recortan al Chaco. Ocupan 3.429 km² y 3.319 km², respectivamente.

```sql
ST_Buffer(traza, 10000, 'quad_segs=16')                         -- hasta 10 km
ST_Difference(ST_Intersection(ST_Buffer(traza, 20000), chaco),
              ST_Buffer(traza, 10000))                          -- de 10 a 20 km
```

En QGIS: *Buffer* (10 000 y 20 000 m, disuelto), *Cortar* con el Chaco y *Diferencia*.

![Paso 3](figuras/qgis-paso3-areas.png)

Figura: Paso 3 en QGIS. En naranja, el área hasta 10 km; en amarillo, el anillo de 10 a 20 km.

## 3.4 Paso 4. Localidades y población afectada

Se seleccionan las localidades **dentro** de cada área (*Extraer por localización*, predicado "está dentro") y se suma su población, que es el campo `canthab` de la capa del IGN. Esa cifra coincide con el Censo Nacional 2001 (INDEC, 2001); por ejemplo, Resistencia figura con 274 490 habitantes. Cada localidad cae en una sola categoría según su distancia a la traza.

Solo se cuentan las localidades cuyo atributo `provincia` es Chaco. Con el polígono solo, General Lucio V. Mansilla, de Formosa, quedaría adentro: está sobre el río Bermejo, que es el límite entre las dos provincias.

![Paso 4](figuras/qgis-paso4-localidades.png)

Figura: Paso 4 en QGIS. Localidades hasta 10 km (naranja) y de 10 a 20 km (amarillo).

## 3.5 Paso 5. Puentes sobre la traza

La capa de puentes es de puntos y no indica a qué camino pertenece cada uno. Un puente se considera de la RN 11 si cumple dos condiciones:

1. está a **500 m o menos** de la traza (*Extraer dentro de una distancia*);
2. su **camino más cercano** es la RN 11 (*Unir atributos por el más cercano* con la red vial). Así se descartan los puentes de caminos vecinales que solo pasan cerca.

Con el primer criterio quedan 24 puntos; el segundo descarta 3 de caminos vecinales. Cada puente se ubica después por su **kilómetro sobre la traza** (`ST_LineLocatePoint`, desde el límite con Santa Fe), el **curso de agua** más cercano y la **localidad** más cercana.

![Paso 5](figuras/qgis-paso5-puentes.png)

Figura: Paso 5 en QGIS. Puentes de la RN 11, rotulados con su kilómetro sobre la traza.

## 3.6 Validación entre PostGIS y QGIS

Los dos procedimientos llegan a los mismos valores:

Tabla: Comparación de resultados entre PostGIS y QGIS

| Dato | PostGIS | QGIS | Coincide |
|---|---|---|---|
| Km de traza | 172,39 | 172,39 | Sí |
| Población hasta 10 km | 360.983 | 360.983 | Sí |
| Población de 10 a 20 km | 26.080 | 26.080 | Sí |
| Localidades hasta 10 km | 21 | 21 | Sí |
| Localidades de 10 a 20 km | 15 | 15 | Sí |
| Puentes | 21 | 21 | Sí |

![Proyecto de QGIS](figuras/qgis-proyecto.png)

Figura: Proyecto `docs/tpi/punto-b/qgis/rn11.qgz` abierto en QGIS 4.2.2 con las capas de cada paso.

# 4 Resultados

## 4.1 Longitud de la traza

La RN 11 recorre **172,39 km** dentro de la Provincia del Chaco.

![Mapa general](figuras/mapa-general.png)

Figura: Traza de la RN 11 en el Chaco con sus áreas de influencia, las localidades afectadas y los puentes (GeoServer, capas del análisis).

## 4.2 Población afectada

Tabla: Población afectada por categoría (solo Provincia del Chaco)

| Categoría | Localidades | Con dato de población | Habitantes |
|---|---|---|---|
| Hasta 10 km | 21 | 7 | 360.983 |
| De 10 a 20 km | 15 | 8 | 26.080 |
| **Total** | 36 | 15 | **387.063** |

La obra afecta de manera directa a **387.063 habitantes**. La mayor parte de esa población está en el Gran Resistencia: Resistencia, Fontana y Barranqueras están a menos de 10 km de la traza.

![Detalle del Gran Resistencia](figuras/mapa-resistencia.png)

Figura: Detalle del Gran Resistencia: la traza pasa a menos de 3 km del centro de la capital.

Tabla: Localidades del Chaco hasta 10 km de la traza

| Localidad | Tipo | Departamento | Distancia (km) | Habitantes |
|---|---|---|---|---|
| Puerto Eva Perón | Lugar o Paraje | Bermejo | 0,1 | 531 |
| Sin Nombre | Lugar o Paraje | Bermejo | 0,3 | Sin dato |
| Basail | Localidad | San Fernando | 0,4 | 1.960 |
| Sin Nombre | Lugar o Paraje | Bermejo | 0,4 | Sin dato |
| Tacuari | Lugar o Paraje | Bermejo | 0,4 | Sin dato |
| Lapacho | Lugar o Paraje | Bermejo | 0,5 | Sin dato |
| Colonia Cabral Cue | Lugar o Paraje | Bermejo | 0,8 | Sin dato |
| Sin Nombre | Lugar o Paraje | Bermejo | 0,9 | Sin dato |
| Margarita Belén | Cabecera de Partido o Departamento | 1 De Mayo | 1,4 | 4.591 |
| Resistencia | Capital de Provincia | San Fernando | 2,7 | 274.490 |
| Playa Ford | Lugar o Paraje | San Fernando | 3,0 | Sin dato |
| Colonia Fiorencia | Lugar o Paraje | San Fernando | 3,2 | Sin dato |
| Fontana | Ciudad | San Fernándo | 3,6 | 26.745 |
| Colonia Benítez | Localidad | 1 De Mayo | 4,1 | 1.928 |
| Colonia Palmira | Lugar o Paraje | San Fernando | 4,8 | Sin dato |
| Campo Las Palmas Del Chaco Austral | Lugar o Paraje | Bermejo | 5,8 | Sin dato |
| Los Palmares | Lugar o Paraje | San Fernando | 6,8 | Sin dato |
| Loma Alta | Lugar o Paraje | Bermejo | 6,8 | Sin dato |
| Rincón De Luna | Lugar o Paraje | Bermejo | 8,0 | Sin dato |
| El Retiro | Lugar o Paraje | Bermejo | 8,1 | Sin dato |
| Barranqueras | Ciudad | San Fernando | 8,3 | 50.738 |

Tabla: Localidades del Chaco de 10 a 20 km de la traza

| Localidad | Tipo | Departamento | Distancia (km) | Habitantes |
|---|---|---|---|---|
| Puerto Tirol | Cabecera de Partido o Departamento | Libertad | 10,1 | 7.855 |
| Campo Bravo | Lugar o Paraje | San Fernando | 11,9 | Sin dato |
| Colonia Las Mercedes | Lugar o Paraje | San Fernando | 12,6 | Sin dato |
| General Vedia | Localidad | Bermejo | 12,8 | 1.840 |
| Campo J. Billerio | Lugar o Paraje | San Fernando | 13,1 | Sin dato |
| Campo Varela | Lugar o Paraje | San Fernando | 13,4 | Sin dato |
| Colonia Báranda | Lugar o Paraje | San Fernando | 13,8 | 391 |
| Colonia El Fiscal | Lugar o Paraje | Libertador General San Martín | 14,0 | Sin dato |
| La Leonesa | Cabecera de Partido o Departamento | Bermejo | 15,4 | 8.420 |
| La Pelegrina | Lugar o Paraje | Libertador General San Martín | 15,5 | Sin dato |
| Colonia Popular | Lugar o Paraje | Libertad | 15,6 | 135 |
| Selvas Del Río De Oro | Localidad | Bermejo | 18,3 | 502 |
| Las Palmas | Ciudad | Bermejo | 19,2 | 5.434 |
| Colonia Cancha Larga | Lugar o Paraje | Bermejo | 19,6 | Sin dato |
| Puerto Bermejo Nuevo | Localidad | Bermejo | 19,9 | 1.503 |

**Fuera del Chaco.** Dentro de los 20 km también hay localidades de otras provincias que no se cuentan, porque la consigna se refiere a la traza en el Chaco. Suman 323.468 habitantes; la mayor es la ciudad de Corrientes, a unos 18 km, del otro lado del río Paraná.

Tabla: Localidades de otras provincias dentro de los 20 km (no se cuentan)

| Localidad | Provincia | Distancia (km) | Habitantes |
|---|---|---|---|
| General Lucio Victorio Mansilla | Formosa | 0,2 | 2.337 |
| Paralelo 28 | Santa Fé | 2,9 | Sin dato |
| Km 60 | Formosa | 4,4 | Sin dato |
| Florencia | Santa Fé | 5,0 | 3.088 |
| Villa Escolar | Formosa | 5,5 | 1.261 |
| Colonia Guadalupe | Santa Fé | 10,0 | Sin dato |
| Colonia El 25 | Santa Fé | 13,4 | Sin dato |
| Colonia Gola | Santa Fé | 15,3 | Sin dato |
| Hardy | Santa Fé | 15,9 | Sin dato |
| J.Galeano | Formosa | 17,8 | Sin dato |
| Potrero De Los Caballos | Formosa | 17,9 | Sin dato |
| Corrientes | Corrientes | 18,4 | 316.782 |

## 4.3 Puentes sobre la traza

**21 puentes** cruzan la traza de la RN 11 en el Chaco:

Tabla: Puentes de la RN 11 en el Chaco, desde el límite con Santa Fe

| N.º | Km de la traza | Curso de agua | Régimen | Localidad cercana |
|---|---|---|---|---|
| 1 | 9,9 | Arroyo Palmira | Permanente | Playa Ford (3,7 km) |
| 2 | 21,0 | Arroyo Saladillo | Permanente | Basail (7,0 km) |
| 3 | 34,0 | Río Palometa | Permanente | Campo J. Billerio (13,6 km) |
| 4 | 45,9 | Arroyo Saladito | Permanente | Colonia Báranda (14,0 km) |
| 5 | 56,2 | Río Salado | Permanente | Los Palmares (12,7 km) |
| 6 | 74,6 | Río Negro | Permanente | Fontana (3,7 km) |
| 7 | 86,5 | Río Tragadero | Permanente | Colonia Benítez (4,2 km) |
| 8 | 90,4 | Arroyo | Permanente | Margarita Belén (3,3 km) |
| 9 | 107,8 | Arroyo Costa Iné | Permanente | Margarita Belén (14,6 km) |
| 10 | 110,9 | Arroyo | Permanente | Campo Las Palmas Del Chaco Austral (15,7 km) |
| 11 | 112,3 | Arroyo Guaycurú | Permanente | Campo Las Palmas Del Chaco Austral (14,2 km) |
| 12 | 114,7 | Arroyo Guaycurú | Permanente | Campo Las Palmas Del Chaco Austral (12,1 km) |
| 13 | 126,0 | Arroyo | Intermitente | Lapacho (1,8 km) |
| 14 | 130,3 | Arroyo Quía | Permanente | Lapacho (2,7 km) |
| 15 | 133,1 | Arroyo | Intermitente | Lapacho (5,3 km) |
| 16 | 137,5 | Arroyo | Intermitente | Colonia Cabral Cue (2,5 km) |
| 17 | 144,3 | Arroyo Zapirán | Permanente | Colonia Cabral Cue (4,3 km) |
| 18 | 155,8 | Arroyo | Intermitente | Tacuari (3,2 km) |
| 19 | 160,0 | Arroyo Cangüí Grande | Permanente | Tacuari (1,1 km) |
| 20 | 164,6 | Arroyo Cangüí Chico | Permanente | Sin Nombre (0,7 km) |
| 21 | 171,4 | Río Bermejo | Permanente | Puerto Eva Perón (0,3 km) |

Para controlar, se contaron los cruces de la traza con la capa de cursos de agua: hay 20. Diecinueve tienen un puente a menos de 1 km. El cruce del **Río de Oro** (km 141,7) no tiene un punto de puente en la capa del IGN. Los puentes 8 y 12 no tienen un curso de agua cartografiado cerca, probablemente porque cruzan cauces menores o canales que la escala 1:250 000 no representa.

# 5 Resultados en el visor web

Los resultados también se publican como capas en GeoServer y se ven en el visor del proyecto con el tema rápido **Obra RN 11**. El Panel de Administración muestra los indicadores y las tablas, leídos directamente de PostGIS.

![Visor con el tema Obra RN 11](figuras/app-visor-tema.png)

Figura: Visor web con el tema "Obra RN 11": traza, áreas, localidades y puentes numerados, con su leyenda.

![Consulta de un puente](figuras/app-visor-puente.png)

Figura: Consulta por punto de un puente: el globo muestra su kilómetro, el curso de agua y la localidad cercana.

![Tabla de puentes en el visor](figuras/app-visor-tabla-puentes.png)

Figura: Consulta por rectángulo sobre el corredor: la tabla de atributos lista los puentes de la RN 11.

# 6 Limitaciones

- **Fecha de los datos:** la población es la del Censo 2001 que trae la capa del IGN. Una actualización con el Censo 2022 elevaría los valores.
- **Localidades sin dato:** solo 15 de las 36 localidades del Chaco dentro de los 20 km tienen población cargada. Las demás son parajes y colonias rurales sin dato, así que la población rural dispersa queda subestimada.
- **Localidades como puntos:** la distancia se mide al punto de cada localidad, no a su ejido. Una ciudad cuyo punto cae dentro de un área se cuenta completa en esa categoría.
- **Asignación de puentes:** el criterio del camino más cercano depende de la precisión de la escala 1:250 000. Un puente en el cruce de dos rutas podría asignarse a la otra ruta.

# 7 Conclusión

La RN 11 recorre **172,39 km** en el Chaco, desde el límite con Santa Fe hasta el río Bermejo. La obra afecta de manera directa a **360.983 habitantes** que viven hasta 10 km de la ruta y a **26.080 habitantes** que viven de 10 a 20 km, **387.063** en total. Esa población se concentra en el Gran Resistencia. **21 puentes** cruzan la traza, casi todos sobre arroyos y ríos; el último, en el km 171,4, es el del río Bermejo, en el límite con Formosa.

Los números se obtuvieron con dos herramientas independientes, PostGIS y QGIS, y coinciden. El procedimiento queda en scripts que cualquier integrante puede repetir.

# 8 Referencias

- EPSG (s.f.). *EPSG:5347 – POSGAR 2007 / Argentina 5*. https://epsg.io/5347
- GeoServer (2025). *GeoServer 2.27 User Manual*. Open Source Geospatial Foundation. https://docs.geoserver.org/
- IGN – Instituto Geográfico Nacional (2011). *SIG IGN 250: capas vectoriales de información geográfica de la República Argentina, escala 1:250 000*. Provistas por la cátedra (enlace en la consigna). https://www.ign.gob.ar/
- IGN – Instituto Geográfico Nacional (s.f.). *Marco de Referencia Geodésico Nacional POSGAR 2007*. https://www.ign.gob.ar/
- INDEC – Instituto Nacional de Estadística y Censos (2001). *Censo Nacional de Población, Hogares y Viviendas 2001*. https://www.indec.gob.ar/
- Open Geospatial Consortium (2006). *OpenGIS Web Map Server Implementation Specification 1.3.0* (OGC 06-042). https://www.ogc.org/standards/wms
- Open Geospatial Consortium (2010). *OpenGIS Web Feature Service 2.0 Interface Standard* (OGC 09-025r1). https://www.ogc.org/standards/wfs
- PostGIS Project Steering Committee (2025). *PostGIS 3.5 Manual*: `ST_Buffer`, `ST_Difference`, `ST_Intersection`, `ST_LineLocatePoint`. https://postgis.net/docs/
- QGIS Development Team (2026). *QGIS User Guide: algoritmos de Procesamiento* (Buffer, Cortar, Diferencia, Extraer por localización, Unir atributos por el más cercano). https://docs.qgis.org/latest/es/docs/user_manual/processing_algs/qgis/
- UTN FRRe (2026). *Trabajo Práctico Integrador – Sistemas de Información Geográfica*. Ing. Ilse Hodapp e Ing. Rodrigo Valdés. `docs/tpi/practico.pdf`.

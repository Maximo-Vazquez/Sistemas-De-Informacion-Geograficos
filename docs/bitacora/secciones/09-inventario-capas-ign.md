# Carga y publicación de las capas IGN

Este apartado describe los cambios para que el equipo pueda revisarlos y repetir la carga. Los resultados corresponden a la instalación local comprobada el 13/11/2026.

## Cómo se carga

La primera carga (13/11/2026) usó el servicio `gisdb` y los scripts `importar_ign.py`, `publicar_ign.py` y `estilos_ign.py`. Al unir las ramas en `develop` (19/11/2026) quedó un solo flujo (ADR-0015):

- **`docker-compose.yml`:** servicio `postgis` (PostgreSQL 17 + PostGIS 3.5, base `sig_ign`, puerto 5433, volumen `datos_postgis`). GeoServer espera a que PostGIS esté disponible. El servicio opcional `web` (perfil `web`) ejecuta Django en un contenedor.
- **`scripts/cargar_capas_ign.py`:** descomprime el ZIP, carga los 47 shapefiles con `ogr2ogr` de la imagen oficial de GDAL, crea la capa editable `elementos_relevados`, publica todo en el espacio `ign` (almacén `sig_ign`) y aplica la simbología de `scripts/simbologia_ign.py` (ADR-0014).
- **`docs/tpi/catalogo_ign.json`:** inventario de la primera carga (nombres, conteos y SHA-256 del ZIP). Se conserva como referencia.
- **Documentación de la revisión:** `docs/revision-2026-11-12.md` registra el diagnóstico del proyecto y su actualización posterior a la carga.

## Origen y resultado

El archivo local usado fue `D:/TPI/sig_ign.zip`, con 47 shapefiles y sus componentes. El directorio interno se llama `SIG_IGN2011`: ese nombre identifica el contenido comprobado y no permite afirmar que el paquete sea una edición de 2021.

| Dato | Resultado local |
|---|---|
| Capa y escala indicadas | SIG IGN 250 |
| Cantidad de capas | 47 |
| Elementos cargados | 570.443 |
| Sistema de referencia | WGS 84, EPSG:4326 |
| Base y esquema | `sig_ign`, esquema `public` |
| GeoServer | Puerto 8085; espacio `ign`; almacén `sig_ign` |
| SHA-256 del ZIP | `f9e1c4368fae85d58a51fcf074163babb270d5560cb2b3481ef7d370967c0797` |

La base `db` contiene las cuentas y sesiones de Django; la base `postgis` contiene las capas. La carga con `cargar_capas_ign.py` dio los mismos 570.443 elementos. La imagen Docker aporta el software de base de datos: los datos importados y la configuración de GeoServer viven en volúmenes locales, que no se comparten al subir el código a Git.

## Inventario de las 47 capas

La cantidad corresponde a los elementos del shapefile y a los contados en PostGIS durante la carga. La geometría indica su familia general; GDAL puede almacenarla como geometría múltiple.

Tabla: Capas importadas desde el ZIP IGN

| Capa del ZIP | Geometría | Tabla PostGIS | Elementos |
|---|---|---|---:|
| Actividades_Agropecuarias | Punto | `actividades_agropecuarias` | 21 |
| Actividades_Economicas | Punto | `actividades_economicas` | 4.530 |
| Complejo_de_Energia_Ene | Punto | `complejo_de_energia_ene` | 247 |
| Curso_de_Agua_Hid | Línea | `curso_de_agua_hid` | 87.419 |
| Curvas_de_Nivel | Línea | `curvas_de_nivel` | 120.470 |
| Edif_Construcciones_Turisticas | Punto | `edif_construcciones_turisticas` | 63 |
| Edif_Depor_y_Esparcimiento | Punto | `edif_depor_y_esparcimiento` | 90 |
| Edif_Educacion | Punto | `edif_educacion` | 5.260 |
| Edif_Religiosos | Punto | `edif_religiosos` | 855 |
| Edificio_Publico_IPS | Punto | `edificio_publico_ips` | 32 |
| Edificio_de_Salud_IPS | Punto | `edificio_de_salud_ips` | 15 |
| Edificio_de_Seguridad_IPS | Punto | `edificio_de_seguridad_ips` | 1.453 |
| Edificios_Ferroviarios | Punto | `edificios_ferroviarios` | 1.892 |
| Ejido | Polígono | `ejido` | 2.258 |
| Espejo_de_Agua_Hid | Polígono | `espejo_de_agua_hid` | 26.515 |
| Estructuras_portuarias | Punto | `estructuras_portuarias` | 98 |
| Infraestructura_Aeroportuaria_Punto | Punto | `infraestructura_aeroportuaria_punto` | 1.079 |
| Infraestructura_Hidro | Punto | `infraestructura_hidro` | 142 |
| Isla | Polígono | `isla` | 2.866 |
| Limite_Politico_Administrativo_Lim | Línea | `limite_politico_administrativo_lim` | 483 |
| Localidades | Punto | `localidades` | 10.804 |
| Líneas_de_Conducción_Ene | Línea | `lineas_de_conduccion_ene` | 41 |
| Marcas_y_Señales | Punto | `marcas_y_senales` | 10.090 |
| Muro_Embalse | Línea | `muro_embalse` | 9 |
| Obra_Portuaria | Punto | `obra_portuaria` | 17 |
| Obra_de_Comunicación | Punto | `obra_de_comunicacion` | 513 |
| Otras_Edificaciones | Punto | `otras_edificaciones` | 96.056 |
| Pais_Lim | Polígono | `pais_lim` | 541 |
| Provincias | Polígono | `provincias` | 25 |
| Puente_Red_Vial_Puntos | Punto | `puente_red_vial_puntos` | 3.852 |
| Puntos_de_Alturas_Topograficas | Punto | `puntos_de_alturas_topograficas` | 4.323 |
| Puntos_del_Terreno | Punto | `puntos_del_terreno` | 8.644 |
| Red_Vial | Línea | `red_vial` | 118.955 |
| Red_ferroviaria | Línea | `red_ferroviaria` | 968 |
| Salvado_de_Obstaculo | Punto | `salvado_de_obstaculo` | 1.550 |
| Señalizaciones | Punto | `senalizaciones` | 142 |
| Sue_Costero | Polígono | `sue_costero` | 1.033 |
| Sue_Hidromorfologico | Polígono | `sue_hidromorfologico` | 3.208 |
| Sue_No_Consolidado | Polígono | `sue_no_consolidado` | 12.276 |
| Sue_congelado | Polígono | `sue_congelado` | 334 |
| Sue_consolidado | Polígono | `sue_consolidado` | 2.611 |
| Veg_Arborea | Polígono | `veg_arborea` | 6.730 |
| Veg_Arbustiva | Polígono | `veg_arbustiva` | 358 |
| Veg_Cultivos | Polígono | `veg_cultivos` | 3.463 |
| Veg_Suelo_Desnudo | Polígono | `veg_suelo_desnudo` | 14 |
| Vias_Secundarias | Línea | `vias_secundarias` | 22.353 |
| veg_Hidrofila | Polígono | `veg_hidrofila` | 5.745 |

Todas las capas se publican con `ign:` seguido del nombre de la tabla. La primera carga usó el prefijo `sig2011_` en cinco capas porque convivía con capas anteriores del laboratorio; el flujo actual no lo necesita.

## Cómo volver a levantarlo

1. Preparar `.env` a partir de `.env.example` y configurar un cliente OAuth de Google válido, como explica el README.
2. Desde la carpeta del proyecto, ejecutar `docker compose up -d db postgis geoserver`.
3. Con el ZIP en `docs/tpi/sig_ign.zip`, ejecutar `python scripts/cargar_capas_ign.py`. Para rehacer solo la publicación y los estilos: `python scripts/cargar_capas_ign.py --solo-publicar`.
4. Ejecutar `python manage.py runserver` y entrar al visor en `http://localhost:8000/administracion/visor/` con Google.

El ZIP del IGN, `.env` y los volúmenes de Docker no forman parte del commit. Quien prepare una instalación necesita el ZIP y sus propias credenciales. El ADR-0011 planteaba un entorno compartido con las capas ya cargadas; quedó descartado al elegir la ejecución local (ADR-0012).

## Qué se verificó y qué falta

Se contrastaron las cantidades de las 47 tablas con los archivos DBF del ZIP. Para cada capa publicada se comprobó un `GetFeature` WFS con su conteo, un `GetMap` WMS y una leyenda PNG; también se verificó CORS para el origen local. Se probaron geometrías de provincias, localidades, puentes, rutas, agua y vegetación, y se generó un mapa combinado de las cinco primeras. Pasaron 13 tests de Django, Ruff, TypeScript, la compilación del frontend y el control de colores.

Después de la unión de ramas, las 47 capas tienen su simbología por clases y la carga de elementos usa `elementos_relevados` por WFS-T (ADR-0016). Siguen pendientes el enlace de Django con PostGIS para los indicadores y el análisis de la Ruta Nacional 11.

-- Punto b del TPI: Ruta Nacional 11 en la Provincia del Chaco (ADR-0017).
-- Las medidas se hacen en POSGAR 2007 faja 5 (EPSG:5347, metros); las capas se guardan en
-- EPSG:4326 para publicarlas en GeoServer. Se ejecuta con scripts/analisis_rn11.py y se puede
-- repetir: recrea el esquema `analisis` completo.

DROP SCHEMA IF EXISTS analisis CASCADE;
CREATE SCHEMA analisis;

-- Paso 1. Polígono de la provincia (en metros).
CREATE TEMP TABLE chaco AS
SELECT ST_Transform(geom, 5347) AS g FROM public.provincias WHERE provincia = 'Chaco';

-- Paso 2. Traza: tramos de la red vial con número 11 y administración nacional (la RP 11 es otra
-- ruta), unidos, recortados al Chaco y fusionados en una sola línea.
CREATE TEMP TABLE traza AS
SELECT ST_LineMerge(ST_CollectionExtract(ST_Intersection(ST_Union(ST_Transform(r.geom, 5347)), c.g), 2)) AS g
FROM public.red_vial r CROSS JOIN chaco c
WHERE r.nro_ruta = '11' AND r.administra = 'Nacional'
  AND ST_Intersects(r.geom, ST_Transform(c.g, 4326))
GROUP BY c.g;

CREATE TABLE analisis.rn11_chaco AS
SELECT 1 AS gid,
       'Ruta Nacional 11'::varchar(40) AS nombre,
       round((ST_Length(g) / 1000)::numeric, 2) AS km,
       ST_NumGeometries(g) AS partes,
       ST_Multi(ST_Transform(g, 4326))::geometry(MultiLineString, 4326) AS geom
FROM traza;

-- Paso 3. Áreas de influencia excluyentes: hasta 10 km, y el anillo de 10 a 20 km
-- (buffer de 20 km menos el de 10 km). Las dos se recortan al Chaco.
CREATE TEMP TABLE buffers AS
SELECT ST_Buffer(t.g, 10000, 'quad_segs=16') AS b10, ST_Buffer(t.g, 20000, 'quad_segs=16') AS b20
FROM traza t;

CREATE TABLE analisis.rn11_areas AS
SELECT 1 AS gid, '0 a 10 km'::varchar(20) AS categoria,
       round((ST_Area(ST_Intersection(b.b10, c.g)) / 1e6)::numeric, 1) AS km2,
       ST_Multi(ST_Transform(ST_Intersection(b.b10, c.g), 4326))::geometry(MultiPolygon, 4326) AS geom
FROM buffers b CROSS JOIN chaco c
UNION ALL
SELECT 2, '10 a 20 km',
       round((ST_Area(ST_Difference(ST_Intersection(b.b20, c.g), b.b10)) / 1e6)::numeric, 1),
       ST_Multi(ST_Transform(ST_Difference(ST_Intersection(b.b20, c.g), b.b10), 4326))::geometry(MultiPolygon, 4326)
FROM buffers b CROSS JOIN chaco c;

-- Paso 4. Localidades a 20 km o menos de la traza, con su categoría por distancia. Las de otras
-- provincias se guardan como contexto (en_chaco = false) y no suman a la población afectada. La
-- provincia sale del atributo y no del polígono: sobre el río Bermejo, que es el límite, el punto de
-- General Lucio V. Mansilla (Formosa) cae dentro del polígono del Chaco.
CREATE TABLE analisis.rn11_localidades AS
SELECT row_number() OVER (ORDER BY d.distancia)::int AS gid,
       l.nombre, l.tipo, l.departamen AS departamento, l.provincia,
       coalesce(l.canthab, 0)::int AS habitantes,
       l.canthab IS NOT NULL AND l.canthab > 0 AS con_dato,
       round((d.distancia / 1000)::numeric, 2) AS distancia_km,
       CASE WHEN d.distancia <= 10000 THEN '0 a 10 km' ELSE '10 a 20 km' END::varchar(20) AS categoria,
       l.provincia = 'Chaco' AS en_chaco,
       CASE WHEN l.provincia IS DISTINCT FROM 'Chaco' THEN 'Fuera del Chaco'
            WHEN d.distancia <= 10000 THEN '0 a 10 km' ELSE '10 a 20 km' END::varchar(20) AS clase,
       ST_Multi(l.geom)::geometry(MultiPoint, 4326) AS geom
FROM public.localidades l
CROSS JOIN traza t CROSS JOIN chaco c
CROSS JOIN LATERAL (SELECT ST_Distance(ST_Transform(l.geom, 5347), t.g) AS distancia) d
WHERE ST_DWithin(ST_Transform(l.geom, 5347), t.g, 20000);

-- Paso 5. Puentes de la traza: puntos de puente a 500 m o menos cuyo camino más cercano es la
-- RN 11 (así se descartan los puentes de caminos que solo pasan cerca). Cada uno se identifica
-- por su kilómetro desde el límite con Santa Fe, el curso de agua más cercano y la localidad
-- más cercana.
CREATE TEMP TABLE puentes_rn11 AS
SELECT b.gid AS gid_ign, ST_Transform(ST_GeometryN(b.geom, 1), 5347) AS g, b.geom
FROM public.puente_red_vial_puntos b CROSS JOIN traza t
CROSS JOIN LATERAL (
    SELECT r.nro_ruta, r.administra FROM public.red_vial r
    WHERE ST_DWithin(r.geom, b.geom, 0.02)
    ORDER BY ST_Distance(ST_Transform(r.geom, 5347), ST_Transform(b.geom, 5347)) LIMIT 1
) via
WHERE ST_DWithin(ST_Transform(b.geom, 5347), t.g, 500)
  AND via.nro_ruta = '11' AND via.administra = 'Nacional';

CREATE TABLE analisis.rn11_puentes AS
SELECT row_number() OVER (ORDER BY ST_LineLocatePoint(ST_GeometryN(t.g, 1), p.g))::int AS gid,
       p.gid_ign,
       round((ST_LineLocatePoint(ST_GeometryN(t.g, 1), p.g) * ST_Length(t.g) / 1000)::numeric, 1) AS km_traza,
       round(ST_Distance(p.g, t.g)::numeric) AS distancia_traza_m,
       agua.nombre AS curso_de_agua, agua.regimen, round(agua.distancia::numeric) AS distancia_agua_m,
       loc.nombre AS localidad_cercana, round((loc.distancia / 1000)::numeric, 1) AS distancia_localidad_km,
       p.geom::geometry(MultiPoint, 4326) AS geom
FROM puentes_rn11 p CROSS JOIN traza t
LEFT JOIN LATERAL (
    SELECT c.nombre, c."régimen" AS regimen, ST_Distance(ST_Transform(c.geom, 5347), p.g) AS distancia
    FROM public.curso_de_agua_hid c WHERE ST_DWithin(c.geom, p.geom, 0.05)
    ORDER BY ST_Distance(ST_Transform(c.geom, 5347), p.g) LIMIT 1
) agua ON true
LEFT JOIN LATERAL (
    SELECT l.nombre, ST_Distance(ST_Transform(l.geom, 5347), p.g) AS distancia
    FROM public.localidades l WHERE ST_DWithin(l.geom, p.geom, 0.5)
    ORDER BY ST_Distance(ST_Transform(l.geom, 5347), p.g) LIMIT 1
) loc ON true;

-- Control: cursos de agua que cruza la traza (para contrastar con los puentes).
CREATE TABLE analisis.rn11_cruces_agua AS
SELECT c.gid AS gid_ign, c.nombre, c."régimen" AS regimen
FROM public.curso_de_agua_hid c CROSS JOIN traza t
WHERE ST_Intersects(ST_Transform(c.geom, 5347), t.g);

-- Paso 6. Resumen: la única fuente de los números del informe, del panel y del video.
CREATE TABLE analisis.rn11_resumen AS
SELECT (SELECT km FROM analisis.rn11_chaco) AS km_traza,
       (SELECT partes FROM analisis.rn11_chaco) AS partes_traza,
       sum(habitantes) FILTER (WHERE en_chaco AND categoria = '0 a 10 km')::int AS poblacion_0_10,
       sum(habitantes) FILTER (WHERE en_chaco AND categoria = '10 a 20 km')::int AS poblacion_10_20,
       count(*) FILTER (WHERE en_chaco AND categoria = '0 a 10 km')::int AS localidades_0_10,
       count(*) FILTER (WHERE en_chaco AND categoria = '10 a 20 km')::int AS localidades_10_20,
       count(*) FILTER (WHERE en_chaco AND con_dato)::int AS localidades_con_dato,
       sum(habitantes) FILTER (WHERE NOT en_chaco)::int AS poblacion_fuera_del_chaco,
       (SELECT count(*) FROM analisis.rn11_puentes)::int AS puentes,
       (SELECT count(*) FROM analisis.rn11_cruces_agua)::int AS cruces_con_cursos_de_agua
FROM analisis.rn11_localidades;

-- Claves primarias: GeoServer las usa como identificador estable de cada elemento (WFS).
ALTER TABLE analisis.rn11_chaco ADD PRIMARY KEY (gid);
ALTER TABLE analisis.rn11_areas ADD PRIMARY KEY (gid);
ALTER TABLE analisis.rn11_localidades ADD PRIMARY KEY (gid);
ALTER TABLE analisis.rn11_puentes ADD PRIMARY KEY (gid);
-- GeoServer no expone la clave como atributo: el número del puente va también en su propia columna.
ALTER TABLE analisis.rn11_puentes ADD COLUMN numero int;
UPDATE analisis.rn11_puentes SET numero = gid;

CREATE INDEX ON analisis.rn11_chaco USING gist (geom);
CREATE INDEX ON analisis.rn11_areas USING gist (geom);
CREATE INDEX ON analisis.rn11_localidades USING gist (geom);
CREATE INDEX ON analisis.rn11_puentes USING gist (geom);

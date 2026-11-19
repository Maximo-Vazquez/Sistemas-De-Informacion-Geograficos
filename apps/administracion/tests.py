import json
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse


class PanelAccesoTests(TestCase):
    url = reverse("administracion:panel")

    def _login(self, email):
        usuario = get_user_model().objects.create_user(email.split("@")[0], email)
        self.client.force_login(usuario)

    def test_sin_sesion_redirige_al_login(self):
        respuesta = self.client.get(self.url)
        self.assertRedirects(respuesta, f"{reverse('account_login')}?next={self.url}", fetch_redirect_response=False)

    def test_cualquier_cuenta_con_sesion_ve_el_panel(self):
        self._login("ana@example.com")
        respuesta = self.client.get(self.url)
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.context["panel_app"]
        self.assertEqual(datos["currentUrl"], self.url)
        self.assertTrue(all(indicador["valor"] is None for indicador in datos["indicadores"]))


class VisorTests(TestCase):
    url = reverse("administracion:visor")

    def test_sin_sesion_redirige_al_login(self):
        respuesta = self.client.get(self.url)
        self.assertRedirects(respuesta, f"{reverse('account_login')}?next={self.url}", fetch_redirect_response=False)

    def test_con_sesion_recibe_los_servicios_de_geoserver(self):
        usuario = get_user_model().objects.create_user("ana", "ana@example.com")
        self.client.force_login(usuario)
        respuesta = self.client.get(self.url)
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.context["visor_app"]
        self.assertEqual(datos["currentUrl"], self.url)
        self.assertTrue(datos["geoserver"]["wmsUrl"].endswith("/wms"))
        self.assertTrue(datos["geoserver"]["wfsUrl"].endswith("/wfs"))
        self.assertEqual(datos["elementosUrl"], reverse("administracion:elementos"))


class ElementosTests(TestCase):
    url = reverse("administracion:elementos")

    def setUp(self):
        self.usuario = get_user_model().objects.create_user("ana", "ana@example.com")

    def datos(self, tipo="Point", coordenadas=None):
        return {
            "solicitud": str(uuid4()),
            "nombre": "Relevamiento de campo",
            "descripcion": "Acceso principal",
            "geometria": json.dumps(
                {"type": tipo, "coordinates": [-59, -27] if coordenadas is None else coordenadas}
            ),
        }

    def test_consulta_y_alta_requieren_sesion(self):
        for respuesta in (self.client.get(self.url), self.client.post(self.url, self.datos())):
            self.assertRedirects(
                respuesta, f"{reverse('account_login')}?next={self.url}", fetch_redirect_response=False
            )

    def test_alta_requiere_csrf(self):
        cliente = Client(enforce_csrf_checks=True)
        cliente.force_login(self.usuario)
        self.assertEqual(cliente.post(self.url, self.datos()).status_code, 403)

    def test_guarda_geometrias_y_atributos_en_la_capa(self):
        self.client.force_login(self.usuario)
        self.assertEqual(self.client.get(self.url).json(), {"type": "FeatureCollection", "features": []})
        tipos = {
            "Point": [-59, -27],
            "LineString": [[-59, -27], [-58, -26]],
            "Polygon": [[[-59, -27], [-58, -26], [-58, -27], [-59, -27]]],
        }
        for tipo, coordenadas in tipos.items():
            with self.subTest(tipo=tipo):
                respuesta = self.client.post(self.url, self.datos(tipo, coordenadas), HTTP_ACCEPT="application/json")
                self.assertEqual(respuesta.status_code, 201)
                feature = respuesta.json()
                self.assertEqual(feature["geometry"], {"type": tipo, "coordinates": coordenadas})
                self.assertEqual(
                    feature["properties"], {"nombre": "Relevamiento de campo", "descripcion": "Acceso principal"}
                )
                self.assertIn(feature, self.client.get(self.url).json()["features"])
        self.assertEqual(len(self.client.get(self.url).json()["features"]), len(tipos))

    def test_reintentar_la_misma_solicitud_no_duplica_el_elemento(self):
        self.client.force_login(self.usuario)
        datos = self.datos()
        primera = self.client.post(self.url, datos, HTTP_ACCEPT="application/json")
        segunda = self.client.post(self.url, datos, HTTP_ACCEPT="application/json")
        self.assertEqual(primera.status_code, 201)
        self.assertEqual(segunda.status_code, 200)
        self.assertEqual(primera.json(), segunda.json())
        self.assertEqual(self.client.get(self.url).json()["features"], [primera.json()])

    def test_rechaza_atributos_y_geometrias_invalidos_sin_guardar(self):
        self.client.force_login(self.usuario)
        datos_invalidos = [
            ({**self.datos(), "nombre": "   "}, "nombre"),
            (self.datos("Point", [-181, -27]), "geometria"),
            (self.datos("LineString", [[-59, -27], [-59, -27]]), "geometria"),
            (self.datos("Polygon", [[[-59, -27], [-58, -26], [-58, -27], [-59, -26]]]), "geometria"),
            (self.datos("MultiPoint", [[-59, -27]]), "geometria"),
        ]
        for datos, campo in datos_invalidos:
            with self.subTest(datos=datos):
                respuesta = self.client.post(self.url, datos, HTTP_ACCEPT="application/json")
                self.assertEqual(respuesta.status_code, 400)
                self.assertIn(campo, respuesta.json()["errores"])
        self.assertEqual(self.client.get(self.url).json()["features"], [])

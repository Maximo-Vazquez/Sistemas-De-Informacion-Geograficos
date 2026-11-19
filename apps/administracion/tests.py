from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse

from .postgis import consultar


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
        self.assertIsNone(datos["analisis"])


RESUMEN = {
    "km_traza": Decimal("172.39"), "partes_traza": 1, "poblacion_0_10": 363320, "poblacion_10_20": 26080,
    "localidades_0_10": 22, "localidades_10_20": 15, "localidades_con_dato": 16,
    "poblacion_fuera_del_chaco": 321131, "puentes": 21, "cruces_con_cursos_de_agua": 20,
}
LOCALIDAD = {"nombre": "Resistencia", "tipo": "Capital de Provincia", "departamento": "San Fernando",
             "habitantes": 274490, "con_dato": True, "distancia_km": Decimal("2.70"), "categoria": "0 a 10 km"}
PUENTE = {"numero": 21, "km_traza": Decimal("171.4"), "curso_de_agua": "Río Bermejo", "regimen": "Permanente",
          "localidad_cercana": "Puerto Eva Perón"}


class PanelAnalisisTests(TestCase):
    url = reverse("administracion:panel")

    def setUp(self):
        self.client.force_login(get_user_model().objects.create_user("ana", "ana@example.com"))

    @patch("apps.administracion.selectors.consultar")
    def test_muestra_los_resultados_del_analisis_de_la_rn11(self, consultar):
        consultar.return_value = [[RESUMEN], [LOCALIDAD], [PUENTE]]
        datos = self.client.get(self.url).context["panel_app"]
        valores = {indicador["id"]: indicador["valor"] for indicador in datos["indicadores"]}
        self.assertEqual(valores, {"km": 172.39, "poblacion10": 363320, "poblacion20": 26080, "puentes": 21})
        pistas = {indicador["id"]: indicador["hint"] for indicador in datos["indicadores"]}
        self.assertEqual(pistas["puentes"], "Sobre 20 cruces con cursos de agua")
        self.assertEqual(datos["analisis"]["localidades"][0]["distancia_km"], 2.7)
        self.assertEqual(datos["analisis"]["puentes"][0]["km_traza"], 171.4)

    @patch("apps.administracion.selectors.consultar", return_value=None)
    def test_sin_analisis_el_panel_queda_vacio(self, _consultar):
        datos = self.client.get(self.url).context["panel_app"]
        self.assertIsNone(datos["analisis"])
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


INSERTAR = (
    b'<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0">'
    b'<Insert><elementos_relevados xmlns="http://ign"><nombre>Obra</nombre></elementos_relevados></Insert>'
    b"</Transaction>"
)


class TransaccionVisorTests(TestCase):
    url = reverse("administracion:visor_transaccion")

    def setUp(self):
        self.client.force_login(get_user_model().objects.create_user("ana", "ana@example.com"))

    def _post(self, cuerpo):
        return self.client.post(self.url, cuerpo, content_type="text/xml")

    def test_sin_sesion_redirige_al_login(self):
        self.client.logout()
        self.assertEqual(self._post(INSERTAR).status_code, 302)

    def test_get_no_esta_permitido(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)

    def test_rechaza_borrar_elementos(self):
        cuerpo = INSERTAR.replace(b"Insert", b"Delete")
        self.assertEqual(self._post(cuerpo).status_code, 400)

    def test_rechaza_capas_no_editables(self):
        cuerpo = INSERTAR.replace(b"elementos_relevados", b"red_vial")
        self.assertEqual(self._post(cuerpo).status_code, 400)

    def test_rechaza_xml_invalido(self):
        self.assertEqual(self._post(b"<Transaction>").status_code, 400)

    @patch("apps.administracion.services.urllib.request.urlopen")
    def test_reenvia_la_insercion_a_geoserver_con_credenciales(self, urlopen):
        respuesta = MagicMock(status=200)
        respuesta.read.return_value = b"<TransactionResponse/>"
        respuesta.headers.get_content_type.return_value = "text/xml"
        urlopen.return_value.__enter__.return_value = respuesta
        resultado = self._post(INSERTAR)
        self.assertEqual(resultado.status_code, 200)
        pedido = urlopen.call_args.args[0]
        self.assertTrue(pedido.full_url.endswith("/ign/wfs"))
        self.assertTrue(pedido.get_header("Authorization").startswith("Basic "))


class PostgisTests(SimpleTestCase):
    @override_settings(POSTGIS={"host": "127.0.0.1", "port": "1", "dbname": "x", "user": "x", "password": "x"})
    def test_si_postgis_no_responde_devuelve_none(self):
        with self.assertLogs("apps.administracion.postgis", level="WARNING"):
            self.assertIsNone(consultar("SELECT 1"))

    @override_settings(POSTGIS=None)
    def test_sin_configuracion_no_intenta_conectar(self):
        self.assertIsNone(consultar("SELECT 1"))

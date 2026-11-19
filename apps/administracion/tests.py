from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
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

    @override_settings(GEOSERVER_URL_INTERNA="http://geoserver:8080/geoserver")
    @patch("apps.administracion.services.urllib.request.urlopen")
    def test_usa_la_url_interna_de_geoserver(self, urlopen):
        respuesta = MagicMock(status=200)
        respuesta.read.return_value = b"<TransactionResponse/>"
        respuesta.headers.get_content_type.return_value = "text/xml"
        urlopen.return_value.__enter__.return_value = respuesta
        self._post(INSERTAR)
        self.assertEqual(urlopen.call_args.args[0].full_url, "http://geoserver:8080/geoserver/ign/wfs")

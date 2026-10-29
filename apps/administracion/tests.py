from django.contrib.auth import get_user_model
from django.test import TestCase
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

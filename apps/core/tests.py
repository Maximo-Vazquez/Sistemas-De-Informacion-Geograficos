from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


class InicioTests(TestCase):
    def test_inicio_es_publico(self):
        respuesta = self.client.get(reverse("core:inicio"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertIsNone(respuesta.context["inicio_app"]["usuario"])

    def test_inicio_muestra_el_usuario_con_sesion(self):
        usuario = get_user_model().objects.create_user("ana", "ana@example.com")
        self.client.force_login(usuario)
        respuesta = self.client.get(reverse("core:inicio"))
        self.assertEqual(respuesta.context["inicio_app"]["usuario"]["email"], "ana@example.com")

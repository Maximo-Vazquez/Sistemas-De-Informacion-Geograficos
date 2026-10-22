from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import NoReverseMatch, reverse

from .servicios import completar_nombre


class LoginTests(TestCase):
    def test_login_muestra_ingreso_con_google(self):
        respuesta = self.client.get(reverse("account_login"), {"next": "/administracion/"})
        self.assertEqual(respuesta.status_code, 200)
        datos = respuesta.context["datos"]
        self.assertEqual(datos["pantalla"], "login")
        self.assertEqual(datos["googleUrl"], reverse("google_login"))
        self.assertEqual(datos["next"], "/administracion/")

    def test_login_descarta_next_externo(self):
        respuesta = self.client.get(reverse("account_login"), {"next": "https://malicioso.example/"})
        self.assertEqual(respuesta.context["datos"]["next"], "")

    def test_registro_con_contrasena_no_esta_disponible(self):
        # SOCIALACCOUNT_ONLY: allauth no registra la URL de alta con contraseña.
        with self.assertRaises(NoReverseMatch):
            reverse("account_signup")
        self.assertEqual(self.client.get("/accounts/signup/").status_code, 404)

    def test_logout_por_post_cierra_la_sesion(self):
        usuario = get_user_model().objects.create_user("ana", "ana@example.com")
        self.client.force_login(usuario)
        self.client.post(reverse("account_logout"))
        self.assertNotIn("_auth_user_id", self.client.session)


class CompletarNombreTests(TestCase):
    def test_usa_nombre_y_apellido_de_google(self):
        usuario = get_user_model()(email="ana@example.com")
        completar_nombre(usuario, {"given_name": "Ana", "family_name": "Pérez"})
        self.assertEqual((usuario.first_name, usuario.last_name), ("Ana", "Pérez"))

    def test_divide_el_nombre_completo_si_faltan_partes(self):
        usuario = get_user_model()(email="ana@example.com")
        completar_nombre(usuario, {"name": "Ana María Pérez"})
        self.assertEqual((usuario.first_name, usuario.last_name), ("Ana", "María Pérez"))

    def test_no_pisa_datos_existentes(self):
        usuario = get_user_model()(email="ana@example.com", first_name="Anita")
        completar_nombre(usuario, {"given_name": "Ana", "family_name": "Pérez"})
        self.assertEqual(usuario.first_name, "Anita")

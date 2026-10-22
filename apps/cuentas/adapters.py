"""Adaptador de allauth para el login con Google."""

from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib import messages
from django.shortcuts import redirect

from .servicios import completar_nombre


class CuentaSocialAdapter(DefaultSocialAccountAdapter):
    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        # "access_denied" es el botón Cancelar de Google: vuelve al login con un aviso suave.
        if error == "access_denied":
            messages.info(request, "Cancelaste el inicio de sesión con Google.")
            raise ImmediateHttpResponse(redirect("account_login"))
        return super().on_authentication_error(
            request, provider, error=error, exception=exception, extra_context=extra_context
        )

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        completar_nombre(user, sociallogin.account.extra_data or {})
        return user

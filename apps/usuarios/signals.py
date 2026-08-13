from django.dispatch import receiver
from django.contrib import messages
from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount
from .models import Usuario


@receiver(user_logged_in)
def procesar_login_google(request, user, **kwargs):
    """
    Se ejecuta cuando alguien inicia sesión (incluye login con Google).

    IMPORTANTE: toda la lógica real (setear la sesión de tu sistema y
    decidir a qué portal redirigir) ya vive en
    CustomAccountAdapter.get_login_redirect_url, porque este signal
    dispara DESPUÉS de que esa URL de redirect ya se calculó, así que acá
    llegaríamos tarde para eso.

    Este signal ahora solo se ocupa de avisarle al usuario si su cuenta
    todavía está pendiente de aprobación.
    """
    try:
        social_account = SocialAccount.objects.filter(user=user, provider='google').first()
        if not social_account:
            return  # Login normal, no es por Google

        try:
            usuario_db = Usuario.objects.get(correoElectronico=user.email)
        except Usuario.DoesNotExist:
            return

        if usuario_db.estado != 'activo':
            messages.info(
                request,
                'Tu cuenta todavía está pendiente de aprobación por un administrador.'
            )

    except Exception as e:
        print(f"Error al sincronizar usuario de Google en signals: {e}")
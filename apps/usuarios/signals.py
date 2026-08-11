from django.dispatch import receiver
from django.contrib import messages
from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount
from .models import Usuario


@receiver(user_logged_in)
def procesar_login_google(request, user, **kwargs):
    """
    Se ejecuta cuando alguien inicia sesión (incluye login con Google).

    IMPORTANTE: este signal NO crea ni activa usuarios. La creación de la
    fila en `usuarios` (con estado 'pendiente') ya la hace
    CustomSocialAccountAdapter.save_user en el momento del registro.

    Acá solo:
    1. Si el usuario ya está 'activo', inyecta las variables de sesión
       que tu sistema manual (login_view) espera encontrar.
    2. Si todavía está 'pendiente' o 'inactivo', lo saca de la sesión de
       Google/allauth y lo manda de vuelta al login con un aviso, en vez
       de dejarlo pasar.
    """
    try:
        social_account = SocialAccount.objects.filter(user=user, provider='google').first()
        if not social_account:
            return  # Login normal, no es por Google, no corresponde tocar nada acá

        correo = user.email

        try:
            usuario_db = Usuario.objects.get(correoElectronico=correo)
        except Usuario.DoesNotExist:
            # No debería pasar si el adapter hizo su trabajo en el registro,
            # pero por las dudas no rompemos el login.
            return

        if usuario_db.estado != 'activo':
            # Todavía no lo aprobó un administrador: no le damos acceso al
            # sistema aunque Google ya lo haya autenticado.
            messages.info(
                request,
                'Tu cuenta todavía está pendiente de aprobación por un administrador.'
            )
            request.session.flush()
            return

        # Usuario ya aprobado: inyectamos las variables de sesión que usa
        # tu sistema manual (login_view), regenerando el id de sesión antes
        # (mismo criterio de seguridad que ya usás contra session fixation).
        request.session.cycle_key()
        request.session['usuario_id'] = usuario_db.idUsuario
        request.session['usuario_nombre'] = usuario_db.nombre
        request.session['usuario_rol'] = usuario_db.rol

        if usuario_db.rol == 'operario':
            try:
                from apps.operarios.models import Operario
                operario = Operario.objects.get(idUsuario=usuario_db.idUsuario)
                request.session['idOperario'] = operario.idOperario
            except Exception:
                pass

    except Exception as e:
        print(f"Error al sincronizar usuario de Google en signals: {e}")
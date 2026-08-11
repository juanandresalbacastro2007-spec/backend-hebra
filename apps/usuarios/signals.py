from django.dispatch import receiver
from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount
from .models import Usuario

@receiver(user_logged_in)
def procesar_login_google(request, user, **kwargs):
    """
    Se ejecuta automáticamente cuando un usuario inicia sesión correctamente con Google.
    1. Vincula o crea el registro en la tabla de tu modelo Usuario.
    2. Inyecta los datos de sesión requeridos por tu sistema.
    """
    try:
        # Verificar si el inicio de sesión fue a través de una cuenta social (Google)
        social_account = SocialAccount.objects.filter(user=user, provider='google').first()
        
        if social_account:
            extra_data = social_account.extra_data
            correo = user.email
            nombre = extra_data.get('given_name', user.first_name)
            apellido = extra_data.get('family_name', user.last_name)

            # Buscar si el usuario ya existe en tu modelo personalizado 'Usuario'
            usuario_db, created = Usuario.objects.get_or_create(
                correoElectronico=correo,
                defaults={
                    'nombre': nombre,
                    'apellido': apellido,
                    'contrasena': '',  # Autenticado por Google (OAuth)
                    'rol': 'cliente',   # Rol por defecto para nuevos usuarios de Google
                    'estado': 'activo'
                }
            )

            # Si el usuario ya existía pero estaba en 'pendiente', lo activamos
            if not created and usuario_db.estado == 'pendiente':
                usuario_db.estado = 'activo'
                usuario_db.save()

            # Llenar las variables de sesión usadas en las vistas del backend
            request.session['usuario_id'] = usuario_db.idUsuario
            request.session['usuario_nombre'] = usuario_db.nombre
            request.session['usuario_rol'] = usuario_db.rol

            # Si el rol es operario, obtenemos su idOperario
            if usuario_db.rol == 'operario':
                try:
                    from apps.operarios.models import Operario
                    operario = Operario.objects.get(idUsuario=usuario_db.idUsuario)
                    request.session['idOperario'] = operario.idOperario
                except Exception:
                    pass

    except Exception as e:
        # Manejo preventivo para no bloquear el inicio de sesión
        print(f"Error al sincronizar usuario de Google en signals: {e}")
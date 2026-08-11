from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.hashers import make_password
from django.db import connection


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Puentea el registro por Google (allauth) con la tabla `usuarios` propia
    de HebraTech (managed=False). El usuario queda con rol 'sin_asignar' y
    estado 'pendiente', igual que en el registro manual (registro_view),
    esperando aprobación de un administrador.
    """

    def save_user(self, request, sociallogin, form=None):
        # 1. Dejar que allauth cree/guarde el usuario Django estándar
        #    (necesario internamente para que allauth funcione).
        user = super().save_user(request, sociallogin, form=form)

        from apps.usuarios.models import Usuario

        correo = user.email

        # 2. Evitar duplicar si ya existe una fila con ese correo
        #    (por ejemplo si ya se había registrado manualmente antes).
        if Usuario.objects.filter(correoElectronico=correo).exists():
            return user

        # 3. Datos: priorizar lo que la persona escribió en el formulario;
        #    si no vino formulario (por algún flujo alternativo), usar lo
        #    que trae Google.
        extra_data = sociallogin.account.extra_data or {}

        if form is not None:
            nombre = form.cleaned_data.get('nombre', '')
            apellido = form.cleaned_data.get('apellido', '')
            contrasena_plana = form.cleaned_data.get('contrasena')
        else:
            nombre = extra_data.get('given_name', '')
            apellido = extra_data.get('family_name', '')
            contrasena_plana = None

        contrasena_hash = make_password(contrasena_plana)

        # 4. Insertar en `usuarios` (managed=False, así que insert manual
        #    igual que hace registro_view con su cursor crudo).
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO usuarios
                    (nombre, apellido, correoElectronico, contrasena, rol, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [nombre, apellido, correo, contrasena_hash, 'sin_asignar', 'pendiente'])

        return user
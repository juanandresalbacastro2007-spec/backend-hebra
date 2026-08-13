from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.hashers import make_password
from django.db import connection
from django.urls import reverse


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Controla a dónde se redirige después de un login (incluye login con
    Google).

    OJO: no depende del signal `procesar_login_google` para esto, porque
    el signal `allauth.account.signals.user_logged_in` dispara DESPUÉS de
    que este método ya calculó la URL de redirect (allauth arma la
    respuesta de redirect y recién ahí manda el signal). Si dependiéramos
    de que el signal ya haya escrito 'usuario_rol' en la sesión, siempre
    llegaríamos tarde y caeríamos al home por más que el usuario ya
    estuviera activo. Por eso acá consultamos la tabla `usuarios`
    directamente y, de paso, dejamos la sesión lista nosotros mismos.
    """

    def get_login_redirect_url(self, request):
        if not request.user.is_authenticated:
            return super().get_login_redirect_url(request)

        from apps.usuarios.models import Usuario

        try:
            usuario_db = Usuario.objects.get(correoElectronico=request.user.email)
        except Usuario.DoesNotExist:
            return super().get_login_redirect_url(request)

        if usuario_db.estado != 'activo':
            # Pendiente/sin_asignar: no le damos portal todavía.
            return super().get_login_redirect_url(request)

        # Dejamos la sesión lista con las claves que usa tu sistema manual
        # (login_view), por si algún signal más tarde no llega a tiempo.
        request.session['usuario_id'] = usuario_db.idUsuario
        request.session['usuario_nombre'] = usuario_db.nombre
        request.session['usuario_rol'] = usuario_db.rol

        if usuario_db.rol == 'cliente':
            return reverse('cliente_portal')
        elif usuario_db.rol == 'administrador':
            return reverse('admin_portal')
        elif usuario_db.rol == 'operario':
            try:
                from apps.operarios.models import Operario
                operario = Operario.objects.get(idUsuario=usuario_db.idUsuario)
                request.session['idOperario'] = operario.idOperario
            except Exception:
                pass
            return reverse('operarios:tablero')

        return super().get_login_redirect_url(request)


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
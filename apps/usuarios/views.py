# usuarios/views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.db import connection
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Usuario, PasswordResetToken


def login_view(request):
    if request.method == 'POST':
        correo = request.POST.get('correo')
        contrasena = request.POST.get('contrasena')

        # ✅ Mensaje genérico de error para no revelar si el correo existe
        # o no en la base (evita enumeración de usuarios).
        error_generico = 'Correo o contraseña incorrectos.'

        try:
            usuario = Usuario.objects.get(
                correoElectronico=correo,
                estado='activo'
            )

            if check_password(contrasena, usuario.contrasena):
                # ✅ Regenerar el ID de sesión antes de guardar datos del
                # usuario autenticado, para prevenir session fixation.
                request.session.cycle_key()

                # Guardar datos clave en la sesión
                request.session['usuario_id'] = usuario.idUsuario
                request.session['usuario_nombre'] = usuario.nombre
                request.session['usuario_rol'] = usuario.rol

                # Si es operario, guardar también su idOperario en sesión
                if usuario.rol == 'operario':
                    try:
                        from apps.operarios.models import Operario
                        operario = Operario.objects.get(idUsuario=usuario.idUsuario)
                        request.session['idOperario'] = operario.idOperario
                    except Exception:
                        pass

                # Redirigir según el rol real guardado en la BD
                if usuario.rol == 'cliente':
                    return redirect('cliente_portal')
                elif usuario.rol == 'administrador':
                    return redirect('admin_portal')
                elif usuario.rol == 'operario':
                    return redirect('operarios:tablero')
                else:
                    messages.error(request, 'Rol de usuario no reconocido.')
            else:
                messages.error(request, error_generico)

        except Usuario.DoesNotExist:
            messages.error(request, error_generico)

    return render(request, 'usuarios/login.html')


def registro_view(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        correo = request.POST.get('correo')
        contrasena = request.POST.get('contrasena')
        confirmar = request.POST.get('confirmar')

        if contrasena != confirmar:
            messages.error(request, 'Las contraseñas no coinciden.')
            return render(request, 'usuarios/login.html')

        if Usuario.objects.filter(correoElectronico=correo).exists():
            messages.error(request, 'Ya existe una cuenta con ese correo.')
            return render(request, 'usuarios/login.html')

        with connection.cursor() as cursor:
            # 1. Crear el usuario base
            cursor.execute("""
                INSERT INTO usuarios 
                    (nombre, apellido, correoElectronico, contrasena, rol, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [nombre, apellido, correo, make_password(contrasena), 'cliente', 'activo'])

            # 2. Tomar el idUsuario recién generado
            id_usuario_nuevo = cursor.lastrowid

            # 3. Crear automáticamente su fila correspondiente en clientes
            cursor.execute("""
                INSERT INTO clientes
                    (idUsuario, tipoCliente, nombre, correoElectronico, estado)
                VALUES (%s, %s, %s, %s, %s)
            """, [id_usuario_nuevo, 'Natural', f'{nombre} {apellido}', correo, 'activo'])

        messages.success(request, '¡Cuenta creada! Ya puedes iniciar sesión.')
        return redirect('login')

    return redirect('login')


def home_view(request):
    return render(request, 'usuarios/home.html')


def logout_view(request):
    request.session.flush()
    return redirect('login')


def recuperar_view(request):
    if request.method == 'POST':
        correo = request.POST.get('correo', '').strip()

        try:
            usuario = Usuario.objects.get(
                correoElectronico=correo,
                estado='activo'
            )

            reset_token = PasswordResetToken.generar_para_usuario(usuario.idUsuario)

            enlace = request.build_absolute_uri(
                f'/recuperar/{reset_token.token}/'
            )

            html_content = render_to_string('usuarios/email_recuperar.html', {
                'nombre': usuario.nombre,
                'enlace': enlace,
            })
            texto_plano = strip_tags(html_content)

            send_mail(
                subject='Recuperación de contraseña - HebraTech',
                message=texto_plano,
                from_email=None,  # usa DEFAULT_FROM_EMAIL
                recipient_list=[usuario.correoElectronico],
                html_message=html_content,
                fail_silently=False,
            )

        except Usuario.DoesNotExist:
            # ✅ No revelamos si el correo existe o no (mismo criterio que el login)
            pass

        # Siempre mostramos el mismo mensaje de éxito, exista o no el correo
        messages.success(
            request,
            'Si el correo está registrado, te enviamos un enlace de recuperación.'
        )
        return redirect('recuperar')

    return render(request, 'usuarios/recuperar.html')


def validar_reset_view(request, token):
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        messages.error(request, 'El enlace de recuperación no es válido.')
        return redirect('recuperar')

    if not reset_token.es_valido():
        messages.error(request, 'El enlace de recuperación expiró o ya fue utilizado.')
        return redirect('recuperar')

    return render(request, 'usuarios/nueva_contrasena.html', {'token': token})


def procesar_reset_view(request, token):
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        messages.error(request, 'El enlace de recuperación no es válido.')
        return redirect('recuperar')

    if not reset_token.es_valido():
        messages.error(request, 'El enlace de recuperación expiró o ya fue utilizado.')
        return redirect('recuperar')

    if request.method == 'POST':
        nueva = request.POST.get('nueva_contrasena', '')
        repetir = request.POST.get('repetir_contrasena', '')

        if len(nueva) < 8:
            messages.error(request, 'La contraseña debe tener al menos 8 caracteres.')
            return render(request, 'usuarios/nueva_contrasena.html', {'token': token})

        if nueva != repetir:
            messages.error(request, 'Las contraseñas no coinciden.')
            return render(request, 'usuarios/nueva_contrasena.html', {'token': token})

        try:
            usuario = Usuario.objects.get(idUsuario=reset_token.idUsuario)
        except Usuario.DoesNotExist:
            messages.error(request, 'No se encontró el usuario asociado.')
            return redirect('recuperar')

        usuario.contrasena = make_password(nueva)
        usuario.save()

        reset_token.usado = True
        reset_token.save()

        messages.success(request, 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.')
        return redirect('login')

    return redirect('validar_reset', token=token)
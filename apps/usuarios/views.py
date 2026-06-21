# usuarios/views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.db import connection
from .models import Usuario


def login_view(request):
    if request.method == 'POST':
        correo = request.POST.get('correo')
        contrasena = request.POST.get('contrasena')

        try:
            usuario = Usuario.objects.get(
                correoElectronico=correo,
                estado='activo'
            )

            if check_password(contrasena, usuario.contrasena):
                # Guardar datos clave en la sesión
                request.session['usuario_id'] = usuario.idUsuario
                request.session['usuario_nombre'] = usuario.nombre
                request.session['usuario_rol'] = usuario.rol

                # Redirigir según el rol real guardado en la BD
                if usuario.rol == 'cliente':
                    return redirect('cliente_portal')
                elif usuario.rol == 'administrador':
                    return redirect('home')  # placeholder hasta que exista el panel admin
                elif usuario.rol == 'operario':
                    return redirect('home')  # placeholder hasta que exista el panel operario
                else:
                    messages.error(request, 'Rol de usuario no reconocido.')
            else:
                messages.error(request, 'Contraseña incorrecta.')

        except Usuario.DoesNotExist:
            messages.error(request, 'No existe una cuenta con ese correo.')

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


def recuperar_view(request):
    return render(request, 'usuarios/recuperar.html')


def home_view(request):
    return render(request, 'usuarios/home.html')


def logout_view(request):
    request.session.flush()
    return redirect('login')
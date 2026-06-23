# apps/administrador/views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.db import connection
from .models import (
    Usuario, Operario, Tarea,
    AsignacionTarea, Orden, Cliente
)


# ── Decorador simple de protección por rol ──────────────────
def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('usuario_id'):
            messages.error(request, 'Debes iniciar sesión.')
            return redirect('login')
        if request.session.get('usuario_rol') != 'administrador':
            messages.error(request, 'No tienes permisos para acceder.')
            return redirect('login')
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


# ── Portal principal ─────────────────────────────────────────
@admin_required
def admin_portal(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])

    # Contadores para el dashboard
    total_usuarios = Usuario.objects.count()
    total_clientes = Cliente.objects.count()
    total_operarios = Operario.objects.filter(estado='activo').count()
    total_ordenes = Orden.objects.count()
    ordenes_pendientes = Orden.objects.filter(estado='Pendiente').count()
    tareas_pendientes = AsignacionTarea.objects.filter(estado='Pendiente').count()

    # Últimas 5 órdenes
    ultimas_ordenes = Orden.objects.order_by('-fechaCreacion')[:5]

    # Últimas 5 asignaciones
    ultimas_asignaciones = AsignacionTarea.objects.order_by('-fechaAsignacion')[:5]

    return render(request, 'administrador/admin_portal.html', {
        'usuario': usuario,
        'total_usuarios': total_usuarios,
        'total_clientes': total_clientes,
        'total_operarios': total_operarios,
        'total_ordenes': total_ordenes,
        'ordenes_pendientes': ordenes_pendientes,
        'tareas_pendientes': tareas_pendientes,
        'ultimas_ordenes': ultimas_ordenes,
        'ultimas_asignaciones': ultimas_asignaciones,
    })


# ── Usuarios ─────────────────────────────────────────────────
@admin_required
def usuarios_lista(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    usuarios = Usuario.objects.all().order_by('rol', 'nombre')
    return render(request, 'administrador/usuarios_lista.html', {
        'usuario': usuario,
        'usuarios': usuarios,
    })


@admin_required
def usuario_crear(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])

    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        correo = request.POST.get('correoElectronico')
        contrasena = request.POST.get('contrasena')
        telefono = request.POST.get('telefono', '')
        rol = request.POST.get('rol', 'cliente')

        if Usuario.objects.filter(correoElectronico=correo).exists():
            messages.error(request, 'Ya existe un usuario con ese correo.')
            return redirect('admin_usuario_crear')

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO usuarios
                    (nombre, apellido, correoElectronico, contrasena, telefono, rol, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, [nombre, apellido, correo, make_password(contrasena),
                  telefono or None, rol, 'activo'])

            id_nuevo = cursor.lastrowid

            # Si es cliente, crear su fila en clientes
            if rol == 'cliente':
                cursor.execute("""
                    INSERT INTO clientes (idUsuario, tipoCliente, nombre, correoElectronico, estado)
                    VALUES (%s, %s, %s, %s, %s)
                """, [id_nuevo, 'Natural', f'{nombre} {apellido}', correo, 'activo'])

            # Si es operario, crear su fila en operarios
            elif rol == 'operario':
                especialidad = request.POST.get('especialidad', 'General')
                cursor.execute("""
                    INSERT INTO operarios (idUsuario, especialidad, fechaIngreso, estado)
                    VALUES (%s, %s, CURDATE(), %s)
                """, [id_nuevo, especialidad, 'activo'])

        messages.success(request, f'Usuario {nombre} {apellido} creado correctamente.')
        return redirect('admin_usuarios')

    return render(request, 'administrador/usuario_form.html', {
        'usuario': usuario,
        'accion': 'Crear',
    })


@admin_required
def usuario_editar(request, idUsuario):
    usuario_admin = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    usuario_editar = Usuario.objects.get(idUsuario=idUsuario)

    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        correo = request.POST.get('correoElectronico')
        telefono = request.POST.get('telefono', '')
        rol = request.POST.get('rol')
        estado = request.POST.get('estado')

        usuario_editar.nombre = nombre
        usuario_editar.apellido = apellido
        usuario_editar.correoElectronico = correo
        usuario_editar.telefono = telefono or None
        usuario_editar.rol = rol
        usuario_editar.estado = estado
        usuario_editar.save()

        messages.success(request, f'Usuario {nombre} actualizado correctamente.')
        return redirect('admin_usuarios')

    return render(request, 'administrador/usuario_form.html', {
        'usuario': usuario_admin,
        'usuario_editar': usuario_editar,
        'accion': 'Editar',
    })


@admin_required
def usuario_eliminar(request, idUsuario):
    if request.method == 'POST':
        usuario_obj = Usuario.objects.get(idUsuario=idUsuario)
        nombre = f'{usuario_obj.nombre} {usuario_obj.apellido}'
        usuario_obj.delete()
        messages.success(request, f'Usuario {nombre} eliminado correctamente.')
    return redirect('admin_usuarios')


# ── Órdenes ──────────────────────────────────────────────────
@admin_required
def ordenes_lista(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    ordenes = Orden.objects.all().order_by('-fechaCreacion')

    # Filtro por estado
    estado_filtro = request.GET.get('estado', '')
    if estado_filtro:
        ordenes = ordenes.filter(estado=estado_filtro)

    return render(request, 'administrador/ordenes_lista.html', {
        'usuario': usuario,
        'ordenes': ordenes,
        'estado_filtro': estado_filtro,
    })


# ── Tareas ───────────────────────────────────────────────────
@admin_required
def tareas_lista(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    asignaciones = AsignacionTarea.objects.all().order_by('-fechaAsignacion')
    return render(request, 'administrador/tareas_lista.html', {
        'usuario': usuario,
        'asignaciones': asignaciones,
    })


@admin_required
def tarea_asignar(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    operarios = Operario.objects.filter(estado='activo')
    tareas = Tarea.objects.all()

    if request.method == 'POST':
        id_tarea = request.POST.get('tarea')
        id_operario = request.POST.get('operario')
        descripcion = request.POST.get('descripcion')
        fecha_inicio = request.POST.get('fechaInicio')
        prioridad = request.POST.get('prioridad', 'Media')
        horas_estimadas = request.POST.get('horasEstimadas')

        try:
            tarea = Tarea.objects.get(idTarea=id_tarea)
            operario = Operario.objects.get(idOperario=id_operario)

            asignacion = AsignacionTarea(
                idTarea=tarea,
                idOperario=operario,
                descripcion=descripcion,
                fechaInicio=fecha_inicio,
                prioridad=prioridad,
                horasEstimadas=horas_estimadas,
                estado='Pendiente'
            )
            asignacion.save()

            messages.success(
                request,
                f'Tarea "{tarea.nombreTarea}" asignada a '
                f'{operario.idUsuario.nombre} correctamente.'
            )
            return redirect('admin_tareas')

        except Exception as e:
            messages.error(request, f'Error al asignar tarea: {str(e)}')

    return render(request, 'administrador/tarea_asignar.html', {
        'usuario': usuario,
        'operarios': operarios,
        'tareas': tareas,
    })


# ── Placeholders ─────────────────────────────────────────────
@admin_required
def produccion_placeholder(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    return render(request, 'administrador/placeholder.html', {
        'usuario': usuario,
        'seccion': 'Producción',
        'icono': 'bi-gear-wide-connected',
    })


@admin_required
def proveedores_placeholder(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    return render(request, 'administrador/placeholder.html', {
        'usuario': usuario,
        'seccion': 'Proveedores',
        'icono': 'bi-truck',
    })
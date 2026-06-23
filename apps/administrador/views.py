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
def produccion_placeholder(request):
    usuario_id = request.session.get('usuario_id')
    if not usuario_id or request.session.get('usuario_rol') != 'administrador':
        return redirect('login')
    return redirect('produccion_portal')


@admin_required
def proveedores_placeholder(request):
    return redirect('proveedores')

# ── Nuevas vistas para la Gestión de Órdenes ──────────────────
@admin_required
def orden_editar(request, idOrden):
    from django.shortcuts import get_object_or_404
    if request.method == 'POST':
        orden = get_object_or_404(Orden, pk=idOrden)
        
        # Captura de todos los parámetros enviados por el modal
        cantidad = request.POST.get('cantidad')
        precio_unitario = request.POST.get('precio_unitario')
        fecha_entrega = request.POST.get('fecha_entrega')
        prioridad = request.POST.get('prioridad')
        estado = request.POST.get('estado')
        
        # Guardar condicionalmente si vienen vacíos o con datos
        orden.cantidad = int(cantidad) if cantidad else None
        orden.precioUnitario = float(precio_unitario) if precio_unitario else None
        orden.fechaEntregaEstimada = fecha_entrega if fecha_entrega else None
        orden.prioridad = prioridad
        orden.estado = estado
        
        orden.save()
        messages.success(request, f'La orden #{idOrden} se ha modificado detalladamente con éxito.')
        
    return redirect('admin_ordenes')


@admin_required
def orden_eliminar(request, idOrden):
    from django.shortcuts import get_object_or_404
    try:
        orden = get_object_or_404(Orden, pk=idOrden)
        orden.delete()
        messages.success(request, f'La orden #{idOrden} se eliminó correctamente.')
    except Exception as e:
        messages.error(request, f'Error al intentar eliminar la orden: {str(e)}')
        
    return redirect('admin_ordenes')
# ── Nuevas vistas para la Gestión de Tareas ──────────────────
@admin_required
def tarea_editar(request, idAsignacion):
    from django.shortcuts import get_object_or_404
    if request.method == 'POST':
        asignacion = get_object_or_404(AsignacionTarea, pk=idAsignacion)
        
        # Captura de todos los datos modificables del modal
        descripcion = request.POST.get('descripcion')
        fecha_inicio = request.POST.get('fecha_inicio')
        horas_estimadas = request.POST.get('horas_estimadas')
        prioridad = request.POST.get('prioridad')
        estado = request.POST.get('estado')
        
        # Asignación y guardado en la base de datos
        asignacion.descripcion = descripcion
        asignacion.fechaInicio = fecha_inicio if fecha_inicio else None
        asignacion.horasEstimadas = horas_estimadas if horas_estimadas else None
        asignacion.prioridad = prioridad
        asignacion.estado = estado
        
        asignacion.save()
        messages.success(request, f'La asignación de tarea #{idAsignacion} ha sido modificada con éxito.')
        
    return redirect('admin_tareas')

@admin_required
def tarea_eliminar(request, idAsignacion):
    from django.shortcuts import get_object_or_404
    try:
        asignacion = get_object_or_404(AsignacionTarea, pk=idAsignacion)
        asignacion.delete()
        messages.success(request, f'La asignación de tarea #{idAsignacion} se eliminó correctamente.')
    except Exception as e:
        messages.error(request, f'Error al intentar eliminar la asignación: {str(e)}')
        
    return redirect('admin_tareas')
# clientes/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Orden, Cliente, Producto, Usuario

from apps.core.decorators import login_required_rol

# ── Decorador de protección por rol ─────────────────────────
cliente_required = login_required_rol(rol_esperado='cliente', session_key='usuario_id')


@cliente_required
def cliente_portal(request):
    usuario_id = request.session['usuario_id']

    try:
        cliente = Cliente.objects.get(idUsuario=usuario_id)
    except Cliente.DoesNotExist:
        messages.error(request, 'Tu usuario no tiene un perfil de cliente asociado.')
        return redirect('login')

    usuario = Usuario.objects.get(idUsuario=usuario_id)

    ordenes = Orden.objects.filter(idCliente=cliente).order_by('-fechaCreacion')
    productos = Producto.objects.all()

    # Contadores para el resumen
    ordenes_activas = ordenes.filter(estado__in=['Procesando', 'Enviado']).count()
    ordenes_completadas = ordenes.filter(estado='Entregado').count()
    ordenes_pendientes = ordenes.filter(estado='Pendiente').count()

    # Próxima entrega (la más cercana que no esté entregada/cancelada)
    proxima_entrega = ordenes.exclude(
        estado__in=['Entregado', 'Cancelado']
    ).exclude(
        fechaEntregaEstimada__isnull=True
    ).order_by('fechaEntregaEstimada').first()

    # Últimas 3 órdenes para notificaciones
    ordenes_recientes = ordenes[:3]

    return render(request, 'clientes/cliente_portal.html', {
        'cliente': cliente,
        'usuario': usuario,
        'ordenes': ordenes,
        'productos': productos,
        'ordenes_activas': ordenes_activas,
        'ordenes_completadas': ordenes_completadas,
        'ordenes_pendientes': ordenes_pendientes,
        'proxima_entrega': proxima_entrega,
        'ordenes_recientes': ordenes_recientes,
    })


@cliente_required
def registrar_orden(request):
    usuario_id = request.session['usuario_id']

    if request.method == 'POST':
        try:
            cliente = Cliente.objects.get(idUsuario=usuario_id)
        except Cliente.DoesNotExist:
            messages.error(request, 'Tu usuario no tiene un perfil de cliente asociado.')
            return redirect('login')

        producto_id = request.POST.get('producto')
        cantidad = request.POST.get('cantidad')
        instrucciones = request.POST.get('instrucciones', '')
        prioridad = request.POST.get('prioridad', 'Normal')

        try:
            producto = Producto.objects.get(idProducto=producto_id)
            orden = Orden(
                idCliente=cliente,
                idProducto=producto,
                cantidad=int(cantidad),
                precioUnitario=producto.precio,
                fechaEntregaEstimada=None,  # lo define producción/administración
                instrucciones=instrucciones or 'Sin instrucciones',
                prioridad=prioridad,
                estado='Pendiente'
            )
            orden.save()
            messages.success(request, f'¡Orden #{orden.idOrden} registrada exitosamente!')
            return redirect('orden_exitosa', idOrden=orden.idOrden)

        except Exception as e:
            messages.error(request, f'Error al registrar la orden: {str(e)}')
            return redirect('cliente_portal')

    return redirect('cliente_portal')


@cliente_required
def orden_exitosa(request, idOrden):
    usuario_id = request.session['usuario_id']

    # ✅ Se filtra por idCliente__idUsuario para evitar que un cliente vea
    # el detalle de una orden ajena cambiando el número en la URL (IDOR).
    orden = get_object_or_404(
        Orden, idOrden=idOrden, idCliente__idUsuario=usuario_id
    )
    return render(request, 'clientes/orden_exitosa.html', {'orden': orden})


@cliente_required
def editar_orden(request, idOrden):
    usuario_id = request.session['usuario_id']

    # ✅ Misma corrección: solo puede editar órdenes propias.
    orden = get_object_or_404(
        Orden, idOrden=idOrden, idCliente__idUsuario=usuario_id
    )

    # Solo se puede editar si está Pendiente
    if orden.estado != 'Pendiente':
        messages.error(request, 'Solo puedes editar órdenes en estado Pendiente.')
        return redirect('cliente_portal')

    productos = Producto.objects.all()

    if request.method == 'POST':
        producto_id = request.POST.get('producto')
        cantidad = request.POST.get('cantidad')
        prioridad = request.POST.get('prioridad', 'Normal')
        instrucciones = request.POST.get('instrucciones', '')

        try:
            producto = Producto.objects.get(idProducto=producto_id)
            orden.idProducto = producto
            orden.cantidad = int(cantidad)
            orden.precioUnitario = producto.precio
            orden.prioridad = prioridad
            orden.instrucciones = instrucciones or 'Sin instrucciones'
            orden.save()

            messages.success(request, f'Orden #{orden.idOrden} actualizada correctamente.')
            return redirect('cliente_portal')

        except Exception as e:
            messages.error(request, f'Error al actualizar la orden: {str(e)}')

    return render(request, 'clientes/editar_orden.html', {
        'orden': orden,
        'productos': productos,
    })


@cliente_required
def eliminar_orden(request, idOrden):
    usuario_id = request.session['usuario_id']

    # ✅ Misma corrección: solo puede eliminar órdenes propias.
    orden = get_object_or_404(
        Orden, idOrden=idOrden, idCliente__idUsuario=usuario_id
    )

    if orden.estado != 'Pendiente':
        messages.error(request, 'Solo puedes eliminar órdenes en estado Pendiente.')
        return redirect('cliente_portal')

    if request.method == 'POST':
        orden.delete()
        messages.success(request, f'Orden #{idOrden} eliminada correctamente.')
        return redirect('cliente_portal')

    return redirect('cliente_portal')
# clientes/views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Orden, Cliente, Producto, Usuario


def cliente_portal(request):
    # Por ahora cliente fijo — en Paso 4 lo conectamos al login
    cliente = Cliente.objects.get(idCliente=1)
    usuario = Usuario.objects.get(idUsuario=cliente.idUsuario_id)

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


def registrar_orden(request):
    if request.method == 'POST':
        cliente = Cliente.objects.get(idCliente=1)

        producto_id = request.POST.get('producto')
        cantidad = request.POST.get('cantidad')
        fecha_entrega = None
        instrucciones = request.POST.get('instrucciones', '')
        prioridad = request.POST.get('prioridad', 'Normal')

        try:
            producto = Producto.objects.get(idProducto=producto_id)
            orden = Orden(
                idCliente=cliente,
                cantidad=int(cantidad),
                precioUnitario=producto.precio,
                fechaEntregaEstimada=fecha_entrega,
                instrucciones=instrucciones or 'Sin instrucciones',
                prioridad=prioridad,
                estado='Pendiente'
            )
            orden.save()
            messages.success(request, f'¡Orden #{orden.idOrden} registrada exitosamente!')
            return redirect('orden_exitosa', idOrden=orden.idOrden)

        # clientes/views.py
        except Exception as e:
            # ── ¡AGREGA ESTA LÍNEA DE ABAJO! ──
            print("❌ EL ERROR REAL ES:", str(e)) 
            
            messages.error(request, f'Error al registrar la orden: {str(e)}')
            return redirect('cliente_portal')

    return redirect('cliente_portal')


def orden_exitosa(request, idOrden):
    orden = Orden.objects.get(idOrden=idOrden)
    return render(request, 'clientes/orden_exitosa.html', {'orden': orden})

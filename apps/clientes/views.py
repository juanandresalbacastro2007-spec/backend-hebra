# clientes/views.py

import os
from datetime import datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.conf import settings
from django.template.loader import render_to_string
from django.http import FileResponse, Http404
from xhtml2pdf import pisa

from .models import Orden, Cliente, Producto, Usuario, Factura
from apps.core.decorators import login_required_rol

# ── Decorador de protección por rol ─────────────────────────
cliente_required = login_required_rol(rol_esperado='cliente', session_key='usuario_id')


# ── FASE 4: Helper para generar la factura en PDF ────────────
def _generar_factura_pdf(orden):
    """Genera el PDF de la orden, lo guarda en media/facturas/ y crea el registro en BD."""
    subtotal = (orden.precioUnitario or 0) * (orden.cantidad or 0)
    numero_factura = f'F-{datetime.now().strftime("%Y%m%d")}-{orden.idOrden:04d}'

    html = render_to_string('clientes/factura_pdf.html', {
        'orden': orden,
        'subtotal': subtotal,
        'factura': {'numeroFactura': numero_factura, 'fechaEmision': datetime.now()},
    })

    carpeta = os.path.join(settings.MEDIA_ROOT, 'facturas')
    os.makedirs(carpeta, exist_ok=True)
    nombre_archivo = f'{numero_factura}.pdf'
    ruta_absoluta = os.path.join(carpeta, nombre_archivo)

    with open(ruta_absoluta, 'wb') as f:
        pisa.CreatePDF(html, dest=f)

    factura = Factura.objects.create(
        idOrden=orden,
        idCliente=orden.idCliente,
        numeroFactura=numero_factura,
        rutaPDF=f'facturas/{nombre_archivo}',
        total=subtotal,
        estado='Emitida'
    )
    return factura


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

    # ✅ FASE 3: Traer la orden activa concreta (si existe) para el template
    orden_activa = ordenes.filter(
        estado__in=['Pendiente', 'Procesando', 'Enviado']
    ).first()

    # Próxima entrega (la más cercana que no esté entregada/cancelada)
    proxima_entrega = ordenes.exclude(
        estado__in=['Entregado', 'Cancelado']
    ).exclude(
        fechaEntregaEstimada__isnull=True
    ).order_by('fechaEntregaEstimada').first()

    # Últimas 3 órdenes para notificaciones
    ordenes_recientes = ordenes[:3]

    # ✅ FASE 4: Facturas del cliente, para el apartado de facturas
    facturas = Factura.objects.filter(idCliente=cliente).order_by('-fechaEmision')

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
        'orden_activa': orden_activa,
        'facturas': facturas,
    })


# ── FASE 1: Editar Perfil del Cliente ────────────────────────
@cliente_required
def editar_perfil_cliente(request):
    """
    Vista para editar el perfil del cliente.
    Actualiza: nombre, empresa, teléfono, ciudad, dirección
    Todos estos campos están en la tabla `clientes`, no en `usuarios`
    """
    usuario_id = request.session['usuario_id']

    try:
        cliente = Cliente.objects.get(idUsuario=usuario_id)
    except Cliente.DoesNotExist:
        messages.error(request, 'Tu usuario no tiene un perfil de cliente asociado.')
        return redirect('login')

    if request.method == 'POST':
        try:
            # Obtener datos del formulario
            nombre = request.POST.get('nombre', '').strip()
            empresa = request.POST.get('empresa', '').strip()
            telefono = request.POST.get('telefono', '').strip()
            ciudad = request.POST.get('ciudad', '').strip()
            direccion = request.POST.get('direccion', '').strip()

            # Validaciones básicas
            if not nombre:
                messages.error(request, 'El nombre es requerido.')
                return redirect('editar_perfil_cliente')

            # Actualizar campos del cliente
            cliente.nombre = nombre
            cliente.empresa = empresa or None
            cliente.telefono = telefono or None
            cliente.ciudad = ciudad or None
            cliente.direccion = direccion or None
            cliente.save()

            messages.success(request, '✅ Tu perfil ha sido actualizado correctamente.')
            return redirect('cliente_portal')

        except Exception as e:
            messages.error(request, f'❌ Error al actualizar perfil: {str(e)}')
            return redirect('editar_perfil_cliente')

    return render(request, 'clientes/editar_perfil_cliente.html', {
        'cliente': cliente,
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

        # ✅ FASE 3: Validar que no haya ya una orden activa
        orden_activa = Orden.objects.filter(
            idCliente=cliente,
            estado__in=['Pendiente', 'Procesando', 'Enviado']
        ).first()

        if orden_activa:
            messages.error(
                request,
                f'⚠️ Ya tienes una orden activa (#{orden_activa.idOrden}). '
                f'Espera a que se complete antes de registrar otra.'
            )
            return redirect('cliente_portal')

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

            # ✅ FASE 4: Generar factura PDF automáticamente
            try:
                _generar_factura_pdf(orden)
            except Exception as e:
                messages.warning(
                    request,
                    f'La orden se registró, pero hubo un problema generando la factura: {str(e)}'
                )

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

    # ✅ FASE 4: Traer la factura asociada, si ya se generó
    factura = Factura.objects.filter(idOrden=orden).first()

    return render(request, 'clientes/orden_exitosa.html', {
        'orden': orden,
        'factura': factura,
    })


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


# ── FASE 4: Descargar factura en PDF ─────────────────────────
@cliente_required
def descargar_factura(request, idFactura):
    usuario_id = request.session['usuario_id']

    # ✅ Solo puede descargar facturas propias (mismo criterio IDOR que en órdenes).
    factura = get_object_or_404(
        Factura, idFactura=idFactura, idCliente__idUsuario=usuario_id
    )

    ruta = os.path.join(settings.MEDIA_ROOT, factura.rutaPDF)
    if not os.path.exists(ruta):
        raise Http404('El archivo de la factura no fue encontrado.')

    return FileResponse(
        open(ruta, 'rb'),
        as_attachment=True,
        filename=os.path.basename(ruta)
    )

from django.http import JsonResponse

@cliente_required
def actualizar_ordenes(request):
    """Devuelve el HTML actualizado de la tabla de órdenes, para refrescar por AJAX."""
    usuario_id = request.session['usuario_id']

    try:
        cliente = Cliente.objects.get(idUsuario=usuario_id)
    except Cliente.DoesNotExist:
        return JsonResponse({'error': 'Cliente no encontrado'}, status=404)

    ordenes = Orden.objects.filter(idCliente=cliente).order_by('-fechaCreacion')
    html = render_to_string('clientes/_tabla_ordenes.html', {'ordenes': ordenes})

    return JsonResponse({'html': html})
import json
import unicodedata
from datetime import date

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.administrador.models import Usuario
from apps.core.decorators import login_required_api, login_required_rol
from apps.operarios.models import AsignacionTarea, Operario

from .models import Produccion, Producto

# ── Decoradores de protección (solo administrador) ──────────────────
admin_required = login_required_rol(rol_esperado='administrador', session_key='usuario_id')
admin_required_api = login_required_api(rol_esperado='administrador', session_key='usuario_id')


def _normalizar(texto):
    """
    Normaliza un texto para comparar nombres de forma robusta:
    quita espacios extra, pasa a minúsculas y elimina tildes/acentos.
    """
    texto = (texto or '').strip().lower()
    texto = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in texto if not unicodedata.combining(c))


# ── PORTAL (Template HTML) ───────────────────────────
@admin_required
def produccion_portal(request):
    try:
        usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    except Usuario.DoesNotExist:
        usuario = None

    return render(request, 'produccion/produccion_portal.html', {
        'usuario': usuario,
        'seccion_activa': 'produccion',
    })


# ── UTILIDADES DE SERIALIZACIÓN ─────────────────────
def producto_to_dict(p):
    return {
        'idProducto': p.idProducto,
        'id': p.idProducto,  # Alias para compatibilidad frontend
        'nombre': p.nombre,
        'descripcion': p.descripcion or '',
        'precio': float(p.precio) if p.precio is not None else 0.0,
        'categoria': p.categoria or '',
    }


def produccion_to_dict(o):
    return {
        'idProduccion': o.idProduccion,
        'id': o.idOrden or f"ORD-{o.idProduccion}",  # Fallback si idOrden es nulo
        'idOrden': o.idOrden,
        'idProducto': o.idProducto_id,
        'producto': o.idProducto.nombre if o.idProducto else 'Sin Producto',
        'descripcion': o.descripcion or '',
        'cantidadRequerida': o.cantidadRequerida,
        'cantidad': o.cantidadRequerida,  # Alias para compatibilidad
        'fechaInicio': str(o.fechaInicio) if o.fechaInicio else '',
        'fecha_inicio': str(o.fechaInicio) if o.fechaInicio else '',
        'fechaEstimadaFin': str(o.fechaEstimadaFin) if o.fechaEstimadaFin else '',
        'fecha_fin': str(o.fechaEstimadaFin) if o.fechaEstimadaFin else '',
        'fechaRealFin': str(o.fechaRealFin) if o.fechaRealFin else None,
        'estado': o.estado,
    }


# ── PRODUCTOS ────────────────────────────────────────
@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def productos(request):
    if request.method == 'GET':
        lista = Producto.objects.all().order_by('nombre')
        return JsonResponse([producto_to_dict(p) for p in lista], safe=False)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'Cuerpo de la petición JSON inválido.'}, status=400)

    nombre = (data.get('nombre') or '').strip()
    categoria = (data.get('categoria') or '').strip()

    if not nombre:
        return JsonResponse({'error': 'El nombre del producto es obligatorio.'}, status=400)

    if not categoria:
        return JsonResponse({'error': 'La categoría del producto es obligatoria.'}, status=400)

    nombre_normalizado = _normalizar(nombre)
    duplicado = any(
        _normalizar(p_nombre) == nombre_normalizado
        for p_nombre in Producto.objects.values_list('nombre', flat=True)
    )

    if duplicado:
        return JsonResponse(
            {'error': f'Ya existe un producto llamado "{nombre}". Usa otro nombre.'},
            status=400
        )

    p = Producto.objects.create(
        nombre=nombre,
        descripcion=data.get('descripcion', ''),
        precio=data.get('precio', 0),
        categoria=categoria,
    )
    return JsonResponse(producto_to_dict(p), status=201)


@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def producto_detalle(request, id):
    try:
        p = Producto.objects.get(pk=id)
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)

    if request.method == 'GET':
        return JsonResponse(producto_to_dict(p))

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, TypeError):
            return JsonResponse({'error': 'Cuerpo JSON inválido.'}, status=400)

        if 'nombre' in data:
            nuevo_nombre = (data['nombre'] or '').strip()
            if not nuevo_nombre:
                return JsonResponse({'error': 'El nombre del producto es obligatorio.'}, status=400)

            nuevo_normalizado = _normalizar(nuevo_nombre)
            duplicado = any(
                _normalizar(otro_nombre) == nuevo_normalizado
                for otro_nombre in Producto.objects.exclude(pk=p.pk).values_list('nombre', flat=True)
            )
            if duplicado:
                return JsonResponse(
                    {'error': f'Ya existe un producto llamado "{nuevo_nombre}". Usa otro nombre.'},
                    status=400
                )
            p.nombre = nuevo_nombre

        for campo in ['descripcion', 'precio', 'categoria']:
            if campo in data:
                setattr(p, campo, data[campo])

        p.save()
        return JsonResponse(producto_to_dict(p))

    p.delete()
    return JsonResponse({'mensaje': 'Producto eliminado correctamente'})


# ── PRODUCCIÓN / ÓRDENES ─────────────────────────────
@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def ordenes(request):
    if request.method == 'GET':
        lista = Produccion.objects.select_related('idProducto').all().order_by('-idProduccion')
        return JsonResponse([produccion_to_dict(o) for o in lista], safe=False)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'Cuerpo de la petición JSON inválido.'}, status=400)

    # Resolución flexible de idProducto por ID o por Nombre del producto
    id_producto = data.get('idProducto')
    if not id_producto:
        nombre_prod = data.get('producto')
        if nombre_prod:
            prod_obj = Producto.objects.filter(nombre__iexact=nombre_prod).first()
            if prod_obj:
                id_producto = prod_obj.idProducto

    if not id_producto:
        return JsonResponse({'error': 'Debe seleccionar un producto válido para la orden.'}, status=400)

    activo = Produccion.objects.filter(
        idProducto_id=id_producto,
        estado__in=['Pendiente', 'En Progreso']
    ).exists()

    if activo:
        try:
            nombre_p = Producto.objects.get(pk=id_producto).nombre
        except Producto.DoesNotExist:
            nombre_p = 'Este producto'
        return JsonResponse(
            {'error': f'"{nombre_p}" ya tiene otra tarea/orden activa. No se puede asignar otra hasta completarla.'},
            status=400
        )

    cantidad = data.get('cantidadRequerida') or data.get('cantidad') or 0
    fecha_inicio = data.get('fechaInicio') or data.get('fecha_inicio') or date.today().isoformat()
    fecha_fin = data.get('fechaEstimadaFin') or data.get('fecha_fin') or date.today().isoformat()

    o = Produccion.objects.create(
        idOrden=data.get('idOrden') or data.get('id'),
        idProducto_id=id_producto,
        descripcion=data.get('descripcion', ''),
        cantidadRequerida=cantidad,
        fechaInicio=fecha_inicio,
        fechaEstimadaFin=fecha_fin,
        estado=data.get('estado', 'Pendiente'),
    )
    return JsonResponse(produccion_to_dict(o), status=201)


@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def orden_detalle(request, id):
    try:
        # Búsqueda por ID numérico o por código 'idOrden'
        if str(id).isdigit():
            o = Produccion.objects.select_related('idProducto').get(pk=id)
        else:
            o = Produccion.objects.select_related('idProducto').get(idOrden=id)
    except Produccion.DoesNotExist:
        return JsonResponse({'error': 'Registro de producción no encontrado'}, status=404)

    if request.method == 'GET':
        return JsonResponse(produccion_to_dict(o))

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, TypeError):
            return JsonResponse({'error': 'Cuerpo JSON inválido.'}, status=400)

        nuevo_estado = data.get('estado', o.estado)
        if nuevo_estado in ['Pendiente', 'En Progreso'] and o.estado not in ['Pendiente', 'En Progreso']:
            otro_activo = Produccion.objects.filter(
                idProducto=o.idProducto,
                estado__in=['Pendiente', 'En Progreso']
            ).exclude(pk=o.pk).exists()

            if otro_activo:
                return JsonResponse(
                    {'error': f'"{o.idProducto.nombre}" ya tiene otro proceso activo.'},
                    status=400
                )

        # Mapeo adaptable de campos entre Backend y Frontend
        if 'idOrden' in data or 'id' in data:
            o.idOrden = data.get('idOrden') or data.get('id')
        if 'descripcion' in data:
            o.descripcion = data['descripcion']
        if 'cantidadRequerida' in data or 'cantidad' in data:
            o.cantidadRequerida = data.get('cantidadRequerida') or data.get('cantidad')
        if 'fechaInicio' in data or 'fecha_inicio' in data:
            o.fechaInicio = data.get('fechaInicio') or data.get('fecha_inicio')
        if 'fechaEstimadaFin' in data or 'fecha_fin' in data:
            o.fechaEstimadaFin = data.get('fechaEstimadaFin') or data.get('fecha_fin')
        if 'fechaRealFin' in data:
            o.fechaRealFin = data['fechaRealFin']
        if 'estado' in data:
            o.estado = data['estado']

        o.save()
        return JsonResponse(produccion_to_dict(o))

    o.delete()
    return JsonResponse({'mensaje': 'Registro de producción eliminado correctamente'})


# ── AVANCE DE OPERARIOS ───────────────────────────────
@admin_required_api
@require_http_methods(['GET'])
def avance_operarios(request):
    operarios = (
        Operario.objects
        .select_related('idUsuario')
        .filter(estado='activo')
        .order_by('idUsuario__nombre', 'idUsuario__apellido')
    )

    asignaciones = (
        AsignacionTarea.objects
        .select_related('idTarea', 'idOperario')
        .order_by('fechaInicio')
    )

    tareas_por_operario = {}
    for a in asignaciones:
        tareas_por_operario.setdefault(a.idOperario_id, []).append(a)

    resultado = []
    for op in operarios:
        tareas = tareas_por_operario.get(op.idOperario, [])

        pendientes = sum(1 for t in tareas if t.estado == 'Pendiente')
        en_progreso = sum(1 for t in tareas if t.estado == 'En Progreso')
        completadas = sum(1 for t in tareas if t.estado == 'Completada')
        canceladas = sum(1 for t in tareas if t.estado == 'Cancelada')
        total_activas = len(tareas) - canceladas
        avance_pct = round((completadas / total_activas) * 100) if total_activas > 0 else 0

        nombre_completo = f"{op.idUsuario.nombre} {op.idUsuario.apellido}".strip() if op.idUsuario else "Operario sin nombre"

        resultado.append({
            'idOperario': op.idOperario,
            'nombre': nombre_completo,
            'especialidad': op.especialidad or 'General',
            'estado': op.estado,
            'contadores': {
                'pendiente': pendientes,
                'enProgreso': en_progreso,
                'completada': completadas,
                'cancelada': canceladas,
            },
            'avancePct': avance_pct,
            'tareas': [
                {
                    'idAsignacion': t.idAsignacion,
                    'nombreTarea': t.idTarea.nombreTarea if t.idTarea else 'Tarea Sin Nombre',
                    'proceso': t.idTarea.proceso if t.idTarea else 'General',
                    'tipoPrenda': t.tipoPrenda,
                    'cantidadPrendas': t.cantidadPrendas,
                    'estado': t.estado,
                    'prioridad': t.prioridad,
                    'fechaInicio': str(t.fechaInicio) if t.fechaInicio else '',
                    'fechaFinalizacion': str(t.fechaFinalizacion) if t.fechaFinalizacion else None,
                    'horasEstimadas': float(t.horasEstimadas) if t.horasEstimadas is not None else None,
                    'horasReales': float(t.horasReales) if t.horasReales is not None else None,
                }
                for t in sorted(tareas, key=lambda x: str(x.fechaInicio))
            ],
        })

    return JsonResponse({'operarios': resultado})


# ── ACTIVIDAD RECIENTE ────────────────────────────────
@admin_required_api
@require_http_methods(['GET'])
def actividad_reciente(request):
    """
    Endpoint para alimentar el feed de actividad reciente del Dashboard JavaScript.
    """
    actividades = []
    ordenes_recientes = Produccion.objects.select_related('idProducto').order_by('-idProduccion')[:5]

    for ord_obj in ordenes_recientes:
        prod_nombre = ord_obj.idProducto.nombre if ord_obj.idProducto else 'Producto'
        if ord_obj.estado == 'Completado':
            icono = '✅'
            titulo = f"Orden #{ord_obj.idOrden or ord_obj.idProduccion} Finalizada"
        elif ord_obj.estado == 'En Progreso':
            icono = '⚙️'
            titulo = f"Orden #{ord_obj.idOrden or ord_obj.idProduccion} en Confección"
        else:
            icono = '📋'
            titulo = f"Nueva Orden #{ord_obj.idOrden or ord_obj.idProduccion}"

        actividades.append({
            'id': f"ord-{ord_obj.idProduccion}",
            'titulo': titulo,
            'descripcion': f"{prod_nombre} - {ord_obj.cantidadRequerida} pcs",
            'fecha': str(ord_obj.fechaInicio),
            'icono': icono
        })

    return JsonResponse(actividades, safe=False)


# ── KPIS ─────────────────────────────────────────────
@admin_required_api
@require_http_methods(['GET'])
def kpis(request):
    total_productos = Producto.objects.count()
    en_progreso = Produccion.objects.filter(estado='En Progreso').count()
    pendientes = Produccion.objects.filter(estado='Pendiente').count()
    completados = Produccion.objects.filter(estado='Completado').count()
    detenidos = Produccion.objects.filter(estado='Detenido').count()

    return JsonResponse({
        'totalProductos': total_productos,
        'ordenesEnProceso': en_progreso,
        'ordenesPendientes': pendientes,
        'ordenesCompletadas': completados,
        'ordenesDetenidas': detenidos,
        'saludScore': 94,
        'incidenciasAbiertas': 0,
        'stockStatus': 'Normal',
    })
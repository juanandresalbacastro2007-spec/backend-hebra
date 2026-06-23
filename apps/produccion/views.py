from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
from .models import Producto, Produccion
from datetime import date


# ── PORTAL (Template HTML) ───────────────────────────
def produccion_portal(request):
    return render(request, 'produccion/produccion_portal.html')


# ── UTILIDADES ───────────────────────────────────────
def producto_to_dict(p):
    return {
        'idProducto':  p.idProducto,
        'nombre':      p.nombre,
        'descripcion': p.descripcion,
        'precio':      float(p.precio),
        'categoria':   p.categoria,
    }

def produccion_to_dict(o):
    return {
        'idProduccion':      o.idProduccion,
        'idOrden':           o.idOrden,
        'idProducto':        o.idProducto_id,
        'producto':          o.idProducto.nombre,
        'descripcion':       o.descripcion,
        'cantidadRequerida': o.cantidadRequerida,
        'fechaInicio':       str(o.fechaInicio),
        'fechaEstimadaFin':  str(o.fechaEstimadaFin),
        'fechaRealFin':      str(o.fechaRealFin) if o.fechaRealFin else None,
        'costoEstimado':     float(o.costoEstimado) if o.costoEstimado else None,
        'costoReal':         float(o.costoReal) if o.costoReal else None,
        'estado':            o.estado,
    }


# ── PRODUCTOS ────────────────────────────────────────
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def productos(request):
    if request.method == 'GET':
        lista = list(Producto.objects.all())
        return JsonResponse([producto_to_dict(p) for p in lista], safe=False)

    data = json.loads(request.body)
    p = Producto.objects.create(
        nombre      = data['nombre'],
        descripcion = data.get('descripcion', ''),
        precio      = data.get('precio', 0),
        categoria   = data['categoria'],
    )
    return JsonResponse(producto_to_dict(p), status=201)


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
        data = json.loads(request.body)
        for campo in ['nombre', 'descripcion', 'precio', 'categoria']:
            if campo in data:
                setattr(p, campo, data[campo])
        p.save()
        return JsonResponse(producto_to_dict(p))

    p.delete()
    return JsonResponse({'mensaje': 'Producto eliminado'})


# ── PRODUCCIÓN ────────────────────────────────────────
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def ordenes(request):
    if request.method == 'GET':
        lista = Produccion.objects.select_related('idProducto').all()
        return JsonResponse([produccion_to_dict(o) for o in lista], safe=False)

    data = json.loads(request.body)
    try:
        producto = Producto.objects.get(pk=data['idProducto'])
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)

    o = Produccion.objects.create(
        idOrden           = data.get('idOrden', None),
        idProducto        = producto,
        descripcion       = data.get('descripcion', ''),
        cantidadRequerida = data['cantidadRequerida'],
        fechaInicio       = data['fechaInicio'],
        fechaEstimadaFin  = data['fechaEstimadaFin'],
        fechaRealFin      = data.get('fechaRealFin', None),
        costoEstimado     = data.get('costoEstimado', None),
        costoReal         = data.get('costoReal', None),
        estado            = data.get('estado', 'Pendiente'),
    )
    return JsonResponse(produccion_to_dict(o), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def orden_detalle(request, id):
    try:
        o = Produccion.objects.select_related('idProducto').get(pk=id)
    except Produccion.DoesNotExist:
        return JsonResponse({'error': 'Producción no encontrada'}, status=404)

    if request.method == 'GET':
        return JsonResponse(produccion_to_dict(o))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for campo in ['idOrden', 'descripcion', 'cantidadRequerida',
                      'fechaInicio', 'fechaEstimadaFin', 'fechaRealFin',
                      'costoEstimado', 'costoReal', 'estado']:
            if campo in data:
                setattr(o, campo, data[campo])
        o.save()
        return JsonResponse(produccion_to_dict(o))

    o.delete()
    return JsonResponse({'mensaje': 'Registro eliminado'})


# ── KPIs ─────────────────────────────────────────────
def kpis(request):
    total_productos = Producto.objects.count()
    en_progreso     = Produccion.objects.filter(estado='En Progreso').count()
    pendientes      = Produccion.objects.filter(estado='Pendiente').count()
    completados     = Produccion.objects.filter(estado='Completado').count()
    return JsonResponse({
        'totalProductos':    total_productos,
        'ordenesEnProceso':  en_progreso,
        'ordenesPendientes': pendientes,
        'ordenesCompletadas': completados,
    })
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
from .models import Prenda, OrdenProduccion
from datetime import date


# ── PORTAL (Template HTML) ───────────────────────────
def produccion_portal(request):
    """Vista principal del portal de producción."""
    return render(request, 'produccion/produccion_portal.html')


# ── UTILIDADES ───────────────────────────────────────
def prenda_to_dict(p):
    return {
        'idPrenda':      p.idPrenda,
        'nombre':        p.nombre,
        'codigo':        p.codigo,
        'categoria':     p.categoria,
        'tallas':        p.tallas,
        'tiempoMinutos': p.tiempoMinutos,
        'stockObjetivo': p.stockObjetivo,
        'descripcion':   p.descripcion,
        'estado':        p.estado,
    }

def orden_to_dict(o):
    return {
        'idOrdenProduccion': o.idOrdenProduccion,
        'numero':            o.numero,
        'idPrenda':          o.idPrenda_id,
        'prenda':            o.idPrenda.nombre,
        'cliente':           o.cliente,
        'cantidad':          o.cantidad,
        'producidas':        o.producidas,
        'operario':          o.operario,
        'lineaProduccion':   o.lineaProduccion,
        'fechaEntrega':      str(o.fechaEntrega),
        'prioridad':         o.prioridad,
        'estado':            o.estado,
        'observaciones':     o.observaciones,
        'fechaCreacion':     str(o.fechaCreacion),
    }

def generar_numero():
    year = date.today().year
    ultimo = OrdenProduccion.objects.filter(
        numero__startswith=f'OP-{year}-'
    ).count()
    return f'OP-{year}-{str(ultimo + 1).zfill(3)}'


# ── PRENDAS ──────────────────────────────────────────
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def prendas(request):
    if request.method == 'GET':
        lista = list(Prenda.objects.all())
        return JsonResponse([prenda_to_dict(p) for p in lista], safe=False)

    data = json.loads(request.body)
    p = Prenda.objects.create(
        nombre        = data['nombre'],
        codigo        = data.get('codigo', ''),
        categoria     = data['categoria'],
        tallas        = data.get('tallas', 'Única'),
        tiempoMinutos = data.get('tiempoMinutos', 30),
        stockObjetivo = data.get('stockObjetivo', 100),
        descripcion   = data.get('descripcion', ''),
        estado        = data.get('estado', 'Activo'),
    )
    return JsonResponse(prenda_to_dict(p), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def prenda_detalle(request, id):
    try:
        p = Prenda.objects.get(pk=id)
    except Prenda.DoesNotExist:
        return JsonResponse({'error': 'Prenda no encontrada'}, status=404)

    if request.method == 'GET':
        return JsonResponse(prenda_to_dict(p))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for campo in ['nombre', 'codigo', 'categoria', 'tallas',
                      'tiempoMinutos', 'stockObjetivo', 'descripcion', 'estado']:
            if campo in data:
                setattr(p, campo, data[campo])
        p.save()
        return JsonResponse(prenda_to_dict(p))

    p.delete()
    return JsonResponse({'mensaje': 'Prenda eliminada'})


# ── ÓRDENES DE PRODUCCIÓN ─────────────────────────────
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def ordenes(request):
    if request.method == 'GET':
        lista = OrdenProduccion.objects.select_related('idPrenda').all()
        return JsonResponse([orden_to_dict(o) for o in lista], safe=False)

    data = json.loads(request.body)
    try:
        prenda = Prenda.objects.get(pk=data['idPrenda'])
    except Prenda.DoesNotExist:
        return JsonResponse({'error': 'Prenda no encontrada'}, status=404)

    o = OrdenProduccion.objects.create(
        numero           = generar_numero(),
        idPrenda         = prenda,
        cliente          = data.get('cliente', 'Sin cliente'),
        cantidad         = data['cantidad'],
        producidas       = 0,
        operario         = data.get('operario', 'Sin asignar'),
        lineaProduccion  = data.get('lineaProduccion', ''),
        fechaEntrega     = data['fechaEntrega'],
        prioridad        = data.get('prioridad', 'Normal'),
        estado           = 'Pendiente',
        observaciones    = data.get('observaciones', ''),
    )
    return JsonResponse(orden_to_dict(o), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def orden_detalle(request, id):
    try:
        o = OrdenProduccion.objects.select_related('idPrenda').get(pk=id)
    except OrdenProduccion.DoesNotExist:
        return JsonResponse({'error': 'Orden no encontrada'}, status=404)

    if request.method == 'GET':
        return JsonResponse(orden_to_dict(o))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for campo in ['cliente', 'cantidad', 'producidas', 'operario',
                      'lineaProduccion', 'fechaEntrega', 'prioridad',
                      'estado', 'observaciones']:
            if campo in data:
                setattr(o, campo, data[campo])
        if o.producidas >= o.cantidad:
            o.estado = 'Completado'
        o.save()
        return JsonResponse(orden_to_dict(o))

    o.delete()
    return JsonResponse({'mensaje': 'Orden eliminada'})


# ── KPIs / RESUMEN ───────────────────────────────────
def kpis(request):
    prendas_count = Prenda.objects.count()
    prod_hoy      = sum(p.stockObjetivo for p in Prenda.objects.all())
    en_proceso    = OrdenProduccion.objects.filter(estado='En Proceso').count()
    pendientes    = OrdenProduccion.objects.filter(estado='Pendiente').count()
    return JsonResponse({
        'totalPrendas':       prendas_count,
        'unidadesHoy':        prod_hoy,
        'ordenesEnProceso':   en_proceso,
        'ordenesPendientes':  pendientes,
    })
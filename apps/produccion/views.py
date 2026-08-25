from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
import unicodedata
from .models import Producto, Produccion
from datetime import date

from apps.core.decorators import login_required_rol, login_required_api
from apps.administrador.models import Usuario
from apps.operarios.models import Operario, AsignacionTarea

# ── Decoradores de protección (solo administrador) ──────────────────
admin_required = login_required_rol(rol_esperado='administrador', session_key='usuario_id')
admin_required_api = login_required_api(rol_esperado='administrador', session_key='usuario_id')


def _normalizar(texto):
    """
    Normaliza un texto para comparar nombres de forma robusta:
    quita espacios extra, pasa a minúsculas y elimina tildes/acentos.
    Así "Camiseta Básica" y "camiseta basica" se detectan como el mismo nombre.
    """
    texto = (texto or '').strip().lower()
    texto = unicodedata.normalize('NFKD', texto)
    texto = ''.join(c for c in texto if not unicodedata.combining(c))
    return texto


# ── PORTAL (Template HTML) ───────────────────────────
@admin_required
def produccion_portal(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    return render(request, 'produccion/produccion_portal.html', {
        'usuario': usuario,
        'seccion_activa': 'produccion',
    })


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
        'estado':            o.estado,
    }


# ── PRODUCTOS ────────────────────────────────────────
@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def productos(request):
    if request.method == 'GET':
        lista = list(Producto.objects.all())
        return JsonResponse([producto_to_dict(p) for p in lista], safe=False)

    data = json.loads(request.body)
    nombre = (data.get('nombre') or '').strip()

    if not nombre:
        return JsonResponse({'error': 'El nombre del producto es obligatorio.'}, status=400)

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
        nombre      = nombre,
        descripcion = data.get('descripcion', ''),
        precio      = data.get('precio', 0),
        categoria   = data['categoria'],
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
        data = json.loads(request.body)

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
            data['nombre'] = nuevo_nombre

        for campo in ['nombre', 'descripcion', 'precio', 'categoria']:
            if campo in data:
                setattr(p, campo, data[campo])
        p.save()
        return JsonResponse(producto_to_dict(p))

    p.delete()
    return JsonResponse({'mensaje': 'Producto eliminado'})


# ── PRODUCCIÓN ────────────────────────────────────────
@admin_required_api
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def ordenes(request):
    if request.method == 'GET':
        lista = Produccion.objects.select_related('idProducto').all()
        return JsonResponse([produccion_to_dict(o) for o in lista], safe=False)

    data = json.loads(request.body)

    activo = Produccion.objects.filter(
        idProducto_id=data['idProducto'],
        estado__in=['Pendiente', 'En Progreso']
    ).exists()
    if activo:
        try:
            nombre_prod = Producto.objects.get(pk=data['idProducto']).nombre
        except Producto.DoesNotExist:
            nombre_prod = 'Este producto'
        return JsonResponse(
            {'error': f'"{nombre_prod}" ya tiene otra tarea/orden activa. No se puede asignar otra hasta completarla.'},
            status=400
        )

    o = Produccion.objects.create(
        idOrden           = data.get('idOrden'),
        idProducto_id     = data['idProducto'],
        descripcion       = data['descripcion'],
        cantidadRequerida = data['cantidadRequerida'],
        fechaInicio       = data['fechaInicio'],
        fechaEstimadaFin  = data['fechaEstimadaFin'],
        estado            = data.get('estado', 'Pendiente'),
    )
    return JsonResponse(produccion_to_dict(o), status=201)


@admin_required_api
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

        for campo in ['idOrden', 'descripcion', 'cantidadRequerida',
                      'fechaInicio', 'fechaEstimadaFin', 'fechaRealFin', 'estado']:
            if campo in data:
                setattr(o, campo, data[campo])
        o.save()
        return JsonResponse(produccion_to_dict(o))

    o.delete()
    return JsonResponse({'mensaje': 'Registro eliminado'})


# ── AVANCE DE OPERARIOS (proceso de confección) ───────
@admin_required_api
def avance_operarios(request):
    """
    GET /produccion/operarios-avance/
    Devuelve, por cada operario activo, el estado de sus tareas de
    confección (asignaciones) para que Producción vea el proceso
    completo de forma organizada.
    """
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

        pendientes  = sum(1 for t in tareas if t.estado == 'Pendiente')
        en_progreso = sum(1 for t in tareas if t.estado == 'En Progreso')
        completadas = sum(1 for t in tareas if t.estado == 'Completada')
        canceladas  = sum(1 for t in tareas if t.estado == 'Cancelada')
        total_activas = len(tareas) - canceladas
        avance_pct = round((completadas / total_activas) * 100) if total_activas > 0 else 0

        resultado.append({
            'idOperario':   op.idOperario,
            'nombre':       f'{op.idUsuario.nombre} {op.idUsuario.apellido}'.strip(),
            'especialidad': op.especialidad,
            'estado':       op.estado,
            'contadores': {
                'pendiente':   pendientes,
                'enProgreso':  en_progreso,
                'completada':  completadas,
                'cancelada':   canceladas,
            },
            'avancePct': avance_pct,
            'tareas': [
                {
                    'idAsignacion':      t.idAsignacion,
                    'nombreTarea':       t.idTarea.nombreTarea,
                    'proceso':           t.idTarea.proceso,
                    'tipoPrenda':        t.tipoPrenda,
                    'cantidadPrendas':   t.cantidadPrendas,
                    'estado':            t.estado,
                    'prioridad':         t.prioridad,
                    'fechaInicio':       str(t.fechaInicio),
                    'fechaFinalizacion': str(t.fechaFinalizacion) if t.fechaFinalizacion else None,
                    'horasEstimadas':    float(t.horasEstimadas) if t.horasEstimadas is not None else None,
                    'horasReales':       float(t.horasReales) if t.horasReales is not None else None,
                }
                for t in sorted(tareas, key=lambda t: t.fechaInicio)
            ],
        })

    return JsonResponse({'operarios': resultado})


# ── KPIs ─────────────────────────────────────────────
@admin_required_api
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


# ── VISTA GENERAL DEL SISTEMA (panorama cross-módulo) ─
@admin_required_api
def vista_general(request):
    """
    GET /produccion/vista-general/
    Panorama consolidado de TODO el sistema HebraTech: usuarios, clientes,
    órdenes comerciales, producción, operarios/tareas, incidencias,
    inventario y proveedores. Pensado para que el administrador vea de
    un vistazo qué está pasando en cada módulo sin tener que entrar
    a cada uno por separado.
    """
    from apps.administrador.models import Orden, Incidencia

    def _count(modelo, **filtros):
        try:
            return modelo.objects.filter(**filtros).count() if filtros else modelo.objects.count()
        except Exception:
            return 0

    def _safe_import(ruta_modulo, nombre_modelo):
        try:
            modulo = __import__(ruta_modulo, fromlist=[nombre_modelo])
            return getattr(modulo, nombre_modelo)
        except Exception:
            return None

    Cliente = _safe_import('apps.clientes.models', 'Cliente')
    Proveedor = _safe_import('apps.proveedores.models', 'Proveedor')

    # ── KPIs globales por módulo ──
    kpis_globales = {
        'usuarios':          _count(Usuario),
        'usuariosPendientes': _count(Usuario, estado='pendiente'),
        'clientes':          _count(Cliente) if Cliente else None,
        'operariosActivos':  _count(Operario, estado='activo'),
        'ordenesTotales':    _count(Orden),
        'ordenesPendientes': _count(Orden, estado='Pendiente'),
        'ordenesUrgentes':   _count(Orden, prioridad='Urgente'),
        'tareasPendientes':  _count(AsignacionTarea, estado='Pendiente'),
        'tareasEnProgreso':  _count(AsignacionTarea, estado='En Progreso'),
        'incidenciasAbiertas': _count(Incidencia, estado='Pendiente') + _count(Incidencia, estado='En Progreso'),
        'productos':         _count(Producto),
        'produccionActiva':  _count(Produccion, estado='En Progreso') + _count(Produccion, estado='Pendiente'),
        'proveedores':       _count(Proveedor) if Proveedor else None,
    }

    # ── Actividad reciente (feed unificado, últimos eventos por módulo) ──
    actividad = []

    for o in Orden.objects.select_related('idCliente').order_by('-fechaCreacion')[:5]:
        cliente_nombre = '—'
        try:
            cliente_nombre = o.idCliente.empresa or o.idCliente.nombre or '—'
        except Exception:
            pass
        actividad.append({
            'modulo': 'ordenes', 'icono': '🧾',
            'titulo': f'Orden #{o.idOrden} · {cliente_nombre}',
            'detalle': f'Estado: {o.estado} · Prioridad: {o.prioridad}',
            'fecha': str(o.fechaCreacion) if o.fechaCreacion else None,
            'estado': o.estado,
        })

    for p in Produccion.objects.select_related('idProducto').order_by('-fechaInicio')[:5]:
        actividad.append({
            'modulo': 'produccion', 'icono': '🧵',
            'titulo': f'Producción: {p.idProducto.nombre}',
            'detalle': f'{p.cantidadRequerida} unidades · {p.descripcion or "Sin descripción"}',
            'fecha': str(p.fechaInicio),
            'estado': p.estado,
        })

    try:
        for i in Incidencia.objects.order_by('-idIncidencia')[:5]:
            actividad.append({
                'modulo': 'incidencias', 'icono': '⚠️',
                'titulo': getattr(i, 'titulo', None) or getattr(i, 'descripcion', 'Incidencia')[:60],
                'detalle': f'Estado: {getattr(i, "estado", "—")}',
                'fecha': str(getattr(i, 'fechaReporte', '') or ''),
                'estado': getattr(i, 'estado', None),
            })
    except Exception:
        pass

    # Ordenar todo el feed por fecha descendente y quedarnos con los 10 más recientes
    actividad = [a for a in actividad if a['fecha']]
    actividad.sort(key=lambda a: a['fecha'], reverse=True)
    actividad = actividad[:10]

    # ── Alertas operativas (lo que necesita atención YA) ──
    alertas = []
    hoy = date.today()

    ordenes_retrasadas = Orden.objects.filter(
        fechaEntregaEstimada__lt=hoy
    ).exclude(estado='Completada').count()
    if ordenes_retrasadas:
        alertas.append({
            'tipo': 'danger', 'icono': '⏰',
            'texto': f'{ordenes_retrasadas} orden(es) con entrega vencida',
            'modulo': 'ordenes',
        })

    if kpis_globales['ordenesUrgentes']:
        alertas.append({
            'tipo': 'warning', 'icono': '🔥',
            'texto': f'{kpis_globales["ordenesUrgentes"]} orden(es) marcadas como urgentes',
            'modulo': 'ordenes',
        })

    if kpis_globales['usuariosPendientes']:
        alertas.append({
            'tipo': 'info', 'icono': '👤',
            'texto': f'{kpis_globales["usuariosPendientes"]} usuario(s) esperando aprobación de rol',
            'modulo': 'usuarios',
        })

    if kpis_globales['incidenciasAbiertas']:
        alertas.append({
            'tipo': 'warning', 'icono': '⚠️',
            'texto': f'{kpis_globales["incidenciasAbiertas"]} incidencia(s) sin resolver',
            'modulo': 'incidencias',
        })

    return JsonResponse({
        'kpis': kpis_globales,
        'actividad': actividad,
        'alertas': alertas,
        'generadoEn': str(hoy),
    })
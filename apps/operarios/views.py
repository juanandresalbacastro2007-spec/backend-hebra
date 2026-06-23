import json
import logging
from datetime import date

from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from .models import Operario, AsignacionTarea, Incidencia

logger = logging.getLogger(__name__)

ESTADOS_VALIDOS_ASIGNACION = ['Pendiente', 'En Progreso', 'Completada', 'Cancelada']
TIPO_INCIDENCIA_MAX_LEN = 50


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_operario_actual(request):
    """
    Obtiene el Operario logueado desde la sesión.
    La sesión debe tener 'idOperario' guardado al hacer login.
    """
    id_operario = request.session.get('idOperario')
    if not id_operario:
        return None
    try:
        return Operario.objects.select_related('idUsuario').get(
            idOperario=id_operario,
            estado='activo'
        )
    except Operario.DoesNotExist:
        return None


def _get_operario_o_dev(request):
    """
    En desarrollo (DEBUG=True) usa el operario id=1 como fallback.
    En producción, si no hay sesión, devuelve None.
    """
    operario = _get_operario_actual(request)
    if operario is None and settings.DEBUG:
        try:
            operario = Operario.objects.select_related('idUsuario').get(idOperario=1)
            logger.warning("Usando operario id=1 de fallback (DEBUG=True). No usar en producción.")
        except Operario.DoesNotExist:
            operario = None
    return operario


# ---------------------------------------------------------------------------
# Vista principal — Tablero Kanban
# ---------------------------------------------------------------------------

def tablero_operario(request):
    """GET /operarios/"""
    operario = _get_operario_o_dev(request)

    asignaciones = []
    if operario:
        asignaciones = (
            AsignacionTarea.objects
            .filter(idOperario=operario)
            .select_related('idTarea')
            .order_by('fechaInicio')
        )

    contadores = {
        'pendiente':   sum(1 for a in asignaciones if a.estado == 'Pendiente'),
        'en_progreso': sum(1 for a in asignaciones if a.estado == 'En Progreso'),
        'completada':  sum(1 for a in asignaciones if a.estado == 'Completada'),
    }

    context = {
        'operario':     operario,
        'asignaciones': asignaciones,
        'contadores':   contadores,
    }

    return render(request, 'operarios/operario.html', context)


# ---------------------------------------------------------------------------
# API — Tareas del operario
# ---------------------------------------------------------------------------

def api_tareas(request):
    """GET /operarios/api/tareas/"""
    operario = _get_operario_o_dev(request)

    if operario is None:
        return JsonResponse({'tareas': [], 'error': 'Sesión no válida'}, status=401)

    asignaciones = (
        AsignacionTarea.objects
        .filter(idOperario=operario)
        .select_related('idTarea')
        .order_by('fechaInicio')
    )

    tareas = [
        {
            'idAsignacion':      a.idAsignacion,
            'idTarea':           a.idTarea.idTarea,
            'nombreTarea':       a.idTarea.nombreTarea,
            'descripcionTarea':  a.idTarea.descripcionTarea,
            'proceso':           a.idTarea.proceso,
            'complejidad':       a.idTarea.complejidad,
            'descripcion':       a.descripcion,
            'fechaInicio':       str(a.fechaInicio),
            'fechaFinalizacion': str(a.fechaFinalizacion) if a.fechaFinalizacion else None,
            'estado':            a.estado,
            'prioridad':         a.prioridad,
            'horasEstimadas':    float(a.horasEstimadas),
            'horasReales':       float(a.horasReales) if a.horasReales else None,
        }
        for a in asignaciones
    ]

    return JsonResponse({'tareas': tareas})


# ---------------------------------------------------------------------------
# API — Registrar incidencia
# ✅ CORREGIDO: @csrf_exempt DEBE ir antes que @require_POST
# ---------------------------------------------------------------------------

@csrf_exempt
@require_POST
def api_guardar_reporte(request):
    """POST /operarios/api/reporte/"""
    operario = _get_operario_o_dev(request)
    if operario is None:
        return JsonResponse({'ok': False, 'error': 'Sesión no válida'}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'JSON inválido'}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({'ok': False, 'error': 'Formato de datos inválido'}, status=400)

    tipo        = (data.get('tipoIncidencia') or '').strip()
    descripcion = (data.get('descripcion') or '').strip()
    periodo     = (data.get('periodoEvaluado') or '').strip() or None

    errores = {}
    if not tipo:
        errores['tipoIncidencia'] = 'El tipo de incidencia es obligatorio'
    elif len(tipo) > TIPO_INCIDENCIA_MAX_LEN:
        errores['tipoIncidencia'] = f'Máximo {TIPO_INCIDENCIA_MAX_LEN} caracteres'

    if not descripcion:
        errores['descripcion'] = 'La descripción es obligatoria'
    elif len(descripcion) < 10:
        errores['descripcion'] = 'La descripción debe tener al menos 10 caracteres'
    elif len(descripcion) > 2000:
        errores['descripcion'] = 'La descripción no puede superar los 2000 caracteres'

    if periodo and len(periodo) > 50:
        errores['periodoEvaluado'] = 'El periodo evaluado no puede superar los 50 caracteres'

    if errores:
        return JsonResponse({'ok': False, 'errores': errores}, status=400)

    try:
        incidencia = Incidencia.objects.create(
            idUsuario       = operario,       # ✅ CORREGIDO: nombre del campo en el modelo
            tipoIncidencia  = tipo,
            descripcion     = descripcion,
            periodoEvaluado = periodo,
            estado          = 'Generado',
            fechaGeneracion = date.today(),
        )
    except Exception:
        logger.exception("Error al crear incidencia para operario id=%s", operario.idOperario)
        return JsonResponse({'ok': False, 'error': 'No se pudo guardar el reporte. Intenta de nuevo.'}, status=500)

    return JsonResponse({
        'ok':           True,
        'idIncidencia': incidencia.idIncidencia,
        'mensaje':      'Reporte guardado correctamente',
        'fecha':        str(incidencia.fechaGeneracion),
    }, status=201)


# ---------------------------------------------------------------------------
# API — Historial de reportes
# ---------------------------------------------------------------------------

def api_historial_reportes(request):
    """GET /operarios/api/reportes/"""
    operario = _get_operario_o_dev(request)
    if operario is None:
        return JsonResponse({'reportes': [], 'error': 'Sesión no válida'}, status=401)

    reportes_qs = (
        Incidencia.objects
        .filter(idUsuario=operario)           # ✅ CORREGIDO: idUsuario en vez de idOperario
        .order_by('-fechaGeneracion')[:20]
    )

    reportes = [
        {
            'idIncidencia':    r.idIncidencia,
            'tipoIncidencia':  r.tipoIncidencia,
            'descripcion':     (r.descripcion[:100] + '...') if len(r.descripcion) > 100 else r.descripcion,
            'periodoEvaluado': r.periodoEvaluado,
            'estado':          r.estado,
            'fechaGeneracion': str(r.fechaGeneracion),
            'fechaRevision':   str(r.fechaRevision) if r.fechaRevision else None,
        }
        for r in reportes_qs
    ]

    return JsonResponse({'reportes': reportes})


# ---------------------------------------------------------------------------
# API — Actualizar estado de una asignación (drag & drop)
# ✅ CORREGIDO: @csrf_exempt DEBE ir antes que @require_POST
# ---------------------------------------------------------------------------

@csrf_exempt
@require_POST
def api_actualizar_estado(request, id_asignacion):
    """POST /operarios/api/tarea/<id_asignacion>/estado/"""
    operario = _get_operario_o_dev(request)
    if operario is None:
        return JsonResponse({'ok': False, 'error': 'Sesión no válida'}, status=401)

    asignacion = get_object_or_404(
        AsignacionTarea, idAsignacion=id_asignacion, idOperario=operario
    )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'JSON inválido'}, status=400)

    nuevo_estado = (data.get('estado') or '').strip()
    if nuevo_estado not in ESTADOS_VALIDOS_ASIGNACION:
        return JsonResponse({
            'ok': False,
            'error': f'Estado inválido. Opciones: {ESTADOS_VALIDOS_ASIGNACION}'
        }, status=400)

    asignacion.estado = nuevo_estado
    if nuevo_estado == 'Completada' and not asignacion.fechaFinalizacion:
        asignacion.fechaFinalizacion = date.today()

    asignacion.save()

    return JsonResponse({
        'ok':     True,
        'estado': asignacion.estado,
        'fecha':  str(asignacion.fechaFinalizacion) if asignacion.fechaFinalizacion else None,
    })

    # ─── AGREGAR estos dos endpoints al views.py existente ───────────────────────
# Pegalos al final del archivo, antes de api_actualizar_estado o después.


@csrf_exempt
@require_POST
def api_editar_reporte(request, id_incidencia):
    """
    POST /operarios/api/reporte/<id_incidencia>/editar/
    Permite al operario editar una incidencia que él mismo generó.
    Solo se puede editar si el estado es 'Generado' (no revisado aún).
    """
    operario = _get_operario_o_dev(request)
    if operario is None:
        return JsonResponse({'ok': False, 'error': 'Sesión no válida'}, status=401)

    try:
        incidencia = Incidencia.objects.get(
            idIncidencia=id_incidencia,
            idUsuario=operario
        )
    except Incidencia.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Reporte no encontrado'}, status=404)

    # Solo se puede editar si todavía no fue revisado
    if incidencia.estado != 'Generado':
        return JsonResponse({
            'ok': False,
            'error': 'No se puede editar un reporte que ya fue revisado'
        }, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'JSON inválido'}, status=400)

    tipo        = (data.get('tipoIncidencia') or '').strip()
    descripcion = (data.get('descripcion') or '').strip()
    periodo     = (data.get('periodoEvaluado') or '').strip() or None

    errores = {}
    if not tipo:
        errores['tipoIncidencia'] = 'El tipo de incidencia es obligatorio'
    elif len(tipo) > 50:
        errores['tipoIncidencia'] = 'Máximo 50 caracteres'

    if not descripcion:
        errores['descripcion'] = 'La descripción es obligatoria'
    elif len(descripcion) < 10:
        errores['descripcion'] = 'La descripción debe tener al menos 10 caracteres'
    elif len(descripcion) > 2000:
        errores['descripcion'] = 'La descripción no puede superar los 2000 caracteres'

    if periodo and len(periodo) > 50:
        errores['periodoEvaluado'] = 'El periodo evaluado no puede superar los 50 caracteres'

    if errores:
        return JsonResponse({'ok': False, 'errores': errores}, status=400)

    try:
        incidencia.tipoIncidencia  = tipo
        incidencia.descripcion     = descripcion
        incidencia.periodoEvaluado = periodo
        incidencia.save()
    except Exception:
        logger.exception("Error al editar incidencia id=%s", id_incidencia)
        return JsonResponse({'ok': False, 'error': 'No se pudo actualizar el reporte'}, status=500)

    return JsonResponse({
        'ok':      True,
        'mensaje': 'Reporte actualizado correctamente',
    })


@csrf_exempt
@require_POST
def api_eliminar_reporte(request, id_incidencia):
    """
    POST /operarios/api/reporte/<id_incidencia>/eliminar/
    Elimina una incidencia generada por el operario.
    Solo se puede eliminar si el estado es 'Generado' (no revisado aún).
    """
    operario = _get_operario_o_dev(request)
    if operario is None:
        return JsonResponse({'ok': False, 'error': 'Sesión no válida'}, status=401)

    try:
        incidencia = Incidencia.objects.get(
            idIncidencia=id_incidencia,
            idUsuario=operario
        )
    except Incidencia.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Reporte no encontrado'}, status=404)

    if incidencia.estado != 'Generado':
        return JsonResponse({
            'ok': False,
            'error': 'No se puede eliminar un reporte que ya fue revisado'
        }, status=400)

    try:
        incidencia.delete()
    except Exception:
        logger.exception("Error al eliminar incidencia id=%s", id_incidencia)
        return JsonResponse({'ok': False, 'error': 'No se pudo eliminar el reporte'}, status=500)

    return JsonResponse({'ok': True, 'mensaje': 'Reporte eliminado correctamente'})
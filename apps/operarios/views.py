import json
import logging
import io
from datetime import date, datetime

from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

# --- Imports nuevos para el PDF (ReportLab) ---
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER

from .models import Operario, AsignacionTarea, Incidencia
from apps.core.decorators import login_required_rol, login_required_api

logger = logging.getLogger(__name__)

ESTADOS_VALIDOS_ASIGNACION = ['Pendiente', 'En Progreso', 'Completada', 'Cancelada']
TIPO_INCIDENCIA_MAX_LEN = 50

# ── Decoradores de protección (centralizados en apps.core) ─────────
# session_key='idOperario' porque el login guarda ahí el id específico
# del operario (ver apps.usuarios.views.login_view), además del rol.
operario_login_required = login_required_rol(rol_esperado='operario', session_key='idOperario')
operario_login_required_api = login_required_api(rol_esperado='operario', session_key='idOperario')

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


# ---------------------------------------------------------------------------
# Vista principal — Tablero Kanban
# ---------------------------------------------------------------------------

@operario_login_required
def tablero_operario(request):
    """GET /operarios/"""
    operario = _get_operario_actual(request)

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

@operario_login_required_api
def api_tareas(request):
    """GET /operarios/api/tareas/"""
    operario = _get_operario_actual(request)

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
# ---------------------------------------------------------------------------

@operario_login_required_api
@require_POST
def api_guardar_reporte(request):
    """POST /operarios/api/reporte/"""
    operario = _get_operario_actual(request)

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
            idUsuario       = operario,       # nombre del campo en el modelo
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

@operario_login_required_api
def api_historial_reportes(request):
    """GET /operarios/api/reportes/"""
    operario = _get_operario_actual(request)

    reportes_qs = (
        Incidencia.objects
        .filter(idUsuario=operario)
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
# ---------------------------------------------------------------------------

@operario_login_required_api
@require_POST
def api_actualizar_estado(request, id_asignacion):
    """POST /operarios/api/tarea/<id_asignacion>/estado/"""
    operario = _get_operario_actual(request)

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


@operario_login_required_api
@require_POST
def api_editar_reporte(request, id_incidencia):
    """
    POST /operarios/api/reporte/<id_incidencia>/editar/
    Permite al operario editar una incidencia que él mismo generó.
    Solo se puede editar si el estado es 'Generado' (no revisado aún).
    """
    operario = _get_operario_actual(request)

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


@operario_login_required_api
@require_POST
def api_eliminar_reporte(request, id_incidencia):
    """
    POST /operarios/api/reporte/<id_incidencia>/eliminar/
    Elimina una incidencia generada por el operario.
    Solo se puede eliminar si el estado es 'Generado' (no revisado aún).
    """
    operario = _get_operario_actual(request)

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


# ── PDF — Generar y descargar incidencia ────────────────────────────────
@operario_login_required
def generar_pdf_reporte(request, id_incidencia):
    operario = _get_operario_actual(request)

    # ✅ Se filtra también por idUsuario=operario para evitar que un
    # operario pueda descargar el PDF de una incidencia ajena cambiando
    # el número en la URL (IDOR).
    incidencia = get_object_or_404(
        Incidencia, idIncidencia=id_incidencia, idUsuario=operario
    )

    usuario         = operario.idUsuario              # instancia Usuario
    nombre_completo = f"{usuario.nombre} {usuario.apellido}"
    especialidad    = operario.especialidad or '—'

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=3*cm,   bottomMargin=2*cm,
    )
    story  = []
    styles = getSampleStyleSheet()

    story.append(Spacer(1, 0.5*cm))

    # ── Paleta HebraTech ──────────────────────────────────────────────
    C_PURPLE = colors.HexColor('#7c3aed')
    C_PINK   = colors.HexColor('#db2777')
    C_LIGHT  = colors.HexColor('#f5f0ff')
    C_BORDER = colors.HexColor('#c4b5fd')
    C_GRAY   = colors.HexColor('#6b7280')
    C_DARK   = colors.HexColor('#111827')

    def st(nombre, **kw):
        return ParagraphStyle(nombre, parent=styles['Normal'], **kw)

    lbl = st('Lbl', fontSize=9,  fontName='Helvetica-Bold', textColor=C_GRAY)
    val = st('Val', fontSize=10, fontName='Helvetica',      textColor=C_DARK)

    def bloque_encabezado(texto, color):
        t = Table(
            [[Paragraph(texto, st('Th', fontSize=10, fontName='Helvetica-Bold',
                                  textColor=colors.white, alignment=TA_CENTER))]],
            colWidths=[16*cm]
        )
        t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), color),
            ('TOPPADDING',    (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ]))
        return t

    def bloque_filas(filas):
        t = Table(filas, colWidths=[4.5*cm, 11.5*cm])
        t.setStyle(TableStyle([
            ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_LIGHT, colors.white]),
            ('BOX',            (0,0), (-1,-1), 1, C_BORDER),
            ('LINEBELOW',      (0,0), (-1,-2), 0.5, C_BORDER),
            ('TOPPADDING',     (0,0), (-1,-1), 8),
            ('BOTTOMPADDING',  (0,0), (-1,-1), 8),
            ('LEFTPADDING',    (0,0), (-1,-1), 12),
            ('VALIGN',         (0,0), (-1,-1), 'MIDDLE'),
        ]))
        return t

    # ── Fecha ─────────────────────────────────────────────────────────
    if incidencia.fechaGeneracion and hasattr(incidencia.fechaGeneracion, 'strftime'):
        fecha_str = incidencia.fechaGeneracion.strftime('%d/%m/%Y')
    else:
        fecha_str = str(incidencia.fechaGeneracion) if incidencia.fechaGeneracion else datetime.now().strftime('%d/%m/%Y')

    # ── ENCABEZADO ────────────────────────────────────────────────────
    story.append(Paragraph(
        "HebraTech",
        st('Brand', fontSize=26, leading=32, fontName='Helvetica-Bold',
           textColor=C_PURPLE, alignment=TA_CENTER, spaceAfter=2)
    ))
    story.append(Paragraph(
        "Sistema de Gestión de Incidencias Operativas",
        st('Sub', fontSize=10, textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=6)
    ))
    story.append(HRFlowable(width='100%', thickness=2, color=C_PURPLE, spaceAfter=10))
    story.append(Paragraph(
        f"REPORTE DE INCIDENCIA  #<b>{incidencia.idIncidencia:04d}</b>",
        st('RID', fontSize=13, textColor=C_PURPLE,
           fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=4)
    ))
    story.append(Paragraph(
        f"Generado el {fecha_str}",
        st('Fecha', fontSize=9, textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=18)
    ))

    # ── INFORMACIÓN DEL OPERARIO ──────────────────────────────────────
    story.append(bloque_encabezado('INFORMACIÓN DEL OPERARIO', C_PURPLE))
    story.append(bloque_filas([
        [Paragraph('Nombre:',       lbl), Paragraph(nombre_completo, val)],
        [Paragraph('Especialidad:', lbl), Paragraph(especialidad,    val)],
    ]))
    story.append(Spacer(1, 0.5*cm))

    # ── DETALLE DE LA INCIDENCIA ──────────────────────────────────────
    story.append(bloque_encabezado('DETALLE DE LA INCIDENCIA', C_PINK))
    story.append(bloque_filas([
        [Paragraph('Tipo de incidencia:', lbl), Paragraph(incidencia.tipoIncidencia or '—', val)],
        [Paragraph('Período evaluado:',   lbl), Paragraph(incidencia.periodoEvaluado or '—', val)],
        [Paragraph('Estado:',             lbl), Paragraph(incidencia.estado or '—', val)],
        [Paragraph('Fecha generación:',   lbl), Paragraph(fecha_str, val)],
    ]))
    story.append(Spacer(1, 0.4*cm))

    # ── DESCRIPCIÓN ───────────────────────────────────────────────────
    story.append(bloque_encabezado('DESCRIPCIÓN DE LA INCIDENCIA', C_PURPLE))
    t_desc = Table(
        [[Paragraph(incidencia.descripcion or 'Sin descripción.',
                    st('Body', fontSize=10, leading=16, textColor=C_DARK))]],
        colWidths=[16*cm]
    )
    t_desc.setStyle(TableStyle([
        ('BOX',           (0,0), (-1,-1), 1, C_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ('RIGHTPADDING',  (0,0), (-1,-1), 12),
    ]))
    story.append(t_desc)
    story.append(Spacer(1, 1.2*cm))

    # ── FIRMA ─────────────────────────────────────────────────────────
    story.append(Table([
        [Paragraph('_______________________________',
                   st('Ln', fontSize=10, alignment=TA_CENTER))],
        [Paragraph(nombre_completo,
                   st('FN', fontSize=9, fontName='Helvetica-Bold',
                      textColor=C_DARK, alignment=TA_CENTER))],
        [Paragraph('Firma del Operario',
                   st('FL', fontSize=8, textColor=C_GRAY, alignment=TA_CENTER))],
    ], colWidths=[16*cm]))
    story.append(Spacer(1, 0.8*cm))

    # ── PIE DE PÁGINA ─────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1, color=C_BORDER, spaceAfter=6))
    story.append(Paragraph(
        f"HebraTech  ·  Reporte #{incidencia.idIncidencia:04d}  ·  "
        f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}  ·  Documento de uso interno",
        st('Foot', fontSize=8, textColor=C_GRAY, alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)

    filename = f"HebraTech_Incidencia_{incidencia.idIncidencia:04d}_{datetime.now().strftime('%Y%m%d')}.pdf"
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
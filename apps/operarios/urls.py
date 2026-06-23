from django.urls import path
from . import views

app_name = 'operarios'

urlpatterns = [

    # ------------------------------------------------------------------
    # Tablero principal — renderiza el HTML del Kanban
    # GET /operarios/
    # ------------------------------------------------------------------
    path(
        '',
        views.tablero_operario,
        name='tablero'
    ),

    # ------------------------------------------------------------------
    # API — Tareas asignadas al operario logueado
    # GET /operarios/api/tareas/
    # ------------------------------------------------------------------
    path(
        'api/tareas/',
        views.api_tareas,
        name='api_tareas'
    ),

    # ------------------------------------------------------------------
    # API — Guardar nuevo reporte (incidencia)
    # POST /operarios/api/reporte/
    # ------------------------------------------------------------------
    path(
        'api/reporte/',
        views.api_guardar_reporte,
        name='api_guardar_reporte'
    ),

    # ------------------------------------------------------------------
    # API — Historial de reportes del operario
    # GET /operarios/api/reportes/
    # ------------------------------------------------------------------
    path(
        'api/reportes/',
        views.api_historial_reportes,
        name='api_historial_reportes'
    ),

    # ------------------------------------------------------------------
    # API — Actualizar estado de una asignación (drag & drop Kanban)
    # POST /operarios/api/tarea/<id_asignacion>/estado/
    # ------------------------------------------------------------------
    path(
        'api/tarea/<int:id_asignacion>/estado/',
        views.api_actualizar_estado,
        name='api_actualizar_estado'
    ),

    path(
        'api/reporte/<int:id_incidencia>/editar/',
        views.api_editar_reporte,
        name='api_editar_reporte'
    ),
 
    # ------------------------------------------------------------------
    # API — Eliminar un reporte (solo si estado = 'Generado')
    # POST /operarios/api/reporte/<id>/eliminar/
    # ------------------------------------------------------------------
    path(
        'api/reporte/<int:id_incidencia>/eliminar/',
        views.api_eliminar_reporte,
        name='api_eliminar_reporte'
    ),
 

]
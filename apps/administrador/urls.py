from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_portal, name='admin_portal'),
    path('usuarios/', views.usuarios_lista, name='admin_usuarios'),
    path('usuarios/crear/', views.usuario_crear, name='admin_usuario_crear'),
    path('usuarios/<int:idUsuario>/editar/', views.usuario_editar, name='admin_usuario_editar'),
    path('usuarios/<int:idUsuario>/eliminar/', views.usuario_eliminar, name='admin_usuario_eliminar'),
    
    # RUTA DE ÓRDENES Y SUS NUEVAS ACCIONES
    path('ordenes/', views.ordenes_lista, name='admin_ordenes'),
    path('ordenes/<int:idOrden>/editar/', views.orden_editar, name='admin_editar_orden'),
    path('ordenes/<int:idOrden>/eliminar/', views.orden_eliminar, name='admin_eliminar_orden'),
    
    path('tareas/', views.tareas_lista, name='admin_tareas'),
    path('tareas/asignar/', views.tarea_asignar, name='admin_tarea_asignar'),
    path('tareas/<int:idAsignacion>/editar/', views.tarea_editar, name='admin_editar_tarea'),
    path('tareas/<int:idAsignacion>/eliminar/', views.tarea_eliminar, name='admin_eliminar_tarea'),
    path('produccion/', views.produccion_placeholder, name='admin_produccion'),
    path('proveedores/', views.proveedores_placeholder, name='admin_proveedores'),
]
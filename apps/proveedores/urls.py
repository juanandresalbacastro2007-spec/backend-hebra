# apps/proveedores/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.listar_proveedores, name='admin_proveedores'),
    path('crear/', views.crear_proveedor, name='crear_proveedor'),
    path('editar/<int:id>/', views.editar_proveedor, name='editar_proveedor'),
    path('eliminar/<int:id>/', views.eliminar_proveedor, name='eliminar_proveedor'),
    path('cambiar-estado/<int:id>/', views.cambiar_estado_proveedor, name='cambiar_estado'),
]
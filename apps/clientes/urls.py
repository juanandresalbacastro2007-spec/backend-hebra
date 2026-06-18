# clientes/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.cliente_portal, name='cliente_portal'),
    path('registrar/', views.registrar_orden, name='registrar_orden'),
    path('orden-exitosa/<int:idOrden>/', views.orden_exitosa, name='orden_exitosa'),
]

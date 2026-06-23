from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.usuarios.urls')),
    path('clientes/', include('apps.clientes.urls')),
    path('produccion/', include('apps.produccion.urls')),
     path('administrador/', include('apps.administrador.urls')),
     path('proveedores/', include('apps.proveedores.urls')),
]
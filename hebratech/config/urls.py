from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.usuarios.urls')),   # Tus urls de usuarios
    path('clientes/', include('apps.clientes.urls')), # <── ¡ESTA LINEA ES CLAVE!
]
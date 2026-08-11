from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Panel de administración de Django
    path('admin/', admin.site.urls),

    # Autenticación con Google / Allauth (Obligatorio para el flujo OAuth y callbacks)
    path('accounts/', include('allauth.urls')),

    # Rutas de tus aplicaciones
    path('', include('apps.usuarios.urls')),
    path('clientes/', include('apps.clientes.urls')),
    path('produccion/', include('apps.produccion.urls')),
    path('administrador/', include('apps.administrador.urls')),
    path('proveedores/', include('apps.proveedores.urls')),
    path('operarios/', include('apps.operarios.urls')),
]

# Servir archivos estáticos y de media durante desarrollo local
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
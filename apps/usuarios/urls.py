# apps/usuarios/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Ahora la raíz ('') cargará el Home de inmediato
    path('', views.home_view, name='home'),
    
    # El login ahora tendrá su propia ruta en '/login/'
    path('login/', views.login_view, name='login'),
    
    path('recuperar/', views.recuperar_view, name='recuperar'),
]
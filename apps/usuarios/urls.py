from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro_view, name='registro'),
    path('recuperar/', views.recuperar_view, name='recuperar'),
    path('recuperar/<str:token>/', views.validar_reset_view, name='validar_reset'),
    path('recuperar/<str:token>/procesar/', views.procesar_reset_view, name='procesar_reset'),
    path('logout/', views.logout_view, name='logout'),
]
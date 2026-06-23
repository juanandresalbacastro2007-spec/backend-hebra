from django.urls import path
from . import views

urlpatterns = [
    # ── Portal HTML ──────────────────────────────────
    path('', views.produccion_portal, name='produccion_portal'),

    # ── API Productos ────────────────────────────────
    path('productos/',          views.productos,        name='productos'),
    path('productos/<int:id>/', views.producto_detalle, name='producto-detalle'),

    # ── API Producción ───────────────────────────────
    path('ordenes/',          views.ordenes,       name='ordenes-produccion'),
    path('ordenes/<int:id>/', views.orden_detalle, name='orden-detalle'),

    # ── API KPIs ─────────────────────────────────────
    path('kpis/', views.kpis, name='kpis'),
]
from django.urls import path
from . import views

urlpatterns = [
    # ── Portal HTML ──────────────────────────────────
    path('', views.produccion_portal, name='produccion_portal'),

    # ── API Prendas ──────────────────────────────────
    path('prendas/',          views.prendas,        name='prendas'),
    path('prendas/<int:id>/', views.prenda_detalle, name='prenda-detalle'),

    # ── API Órdenes ──────────────────────────────────
    path('ordenes/',          views.ordenes,        name='ordenes-produccion'),
    path('ordenes/<int:id>/', views.orden_detalle,  name='orden-detalle'),

    # ── API KPIs ─────────────────────────────────────
    path('kpis/',             views.kpis,           name='kpis'),
]
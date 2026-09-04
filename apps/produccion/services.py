# apps/produccion/services.py
from django.utils import timezone
from apps.administrador.models import Orden

ESTADO_CLIENTE_MAP = {
    'Pendiente':   'Pendiente',
    'En Progreso': 'En producción',
    'Completado':  'Enviado',
    'Detenido':    'Pendiente',
}

def sincronizar_estado_cliente(produccion, usuario=None):
    """Traduce el estado interno de producción al estado que ve el cliente."""
    if not produccion.idOrden:
        return None

    nuevo_estado = ESTADO_CLIENTE_MAP.get(produccion.estado)
    if not nuevo_estado:
        return None

    try:
        orden = Orden.objects.get(pk=produccion.idOrden)
    except Orden.DoesNotExist:
        return None

    if orden.estado != nuevo_estado:
        anterior = orden.estado
        orden.estado = nuevo_estado
        orden.save(update_fields=['estado'])
        registrar_historial(produccion, anterior, nuevo_estado, usuario)

    return orden


def registrar_historial(produccion, estado_anterior, estado_nuevo, usuario=None):
    # simple_history ya registra el cambio de Orden.estado automáticamente
    # (queda en HistoricalOrden con el usuario si el middleware está activo).
    # Esta función queda como gancho para eventos adicionales, ej. notificar
    # por email al cliente cuando pase a "Enviado" o "Entregado".
    if estado_nuevo == 'Enviado':
        pass  # enganchar aquí tu notificación Gmail SMTP existente
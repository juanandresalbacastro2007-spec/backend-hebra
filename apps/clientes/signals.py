# clientes/signals.py
"""
Señales Django para el módulo de clientes.

Flujo:
  1. El administrador cambia el estado de una Orden y hace .save()
  2. Django dispara post_save sobre el modelo Orden
  3. Esta señal detecta si el campo `estado` cambió respecto al valor anterior
  4. Si cambió → crea un registro en Notificacion para el cliente dueño de esa orden
  5. El portal del cliente consulta sus notificaciones no leídas via AJAX y
     actualiza el contador del campanita + el tracker de órdenes
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Orden, Notificacion


# ── Mensajes por estado ──────────────────────────────────────
# Cada estado tiene un título corto y un mensaje descriptivo
# que el cliente verá en su panel de notificaciones.
MENSAJES_ESTADO = {
    'Procesando': {
        'titulo': '🔧 Tu orden está en producción',
        'mensaje': (
            'El equipo de HebraTech ha comenzado a procesar tu orden #{id}. '
            'Te notificaremos cuando esté lista para envío.'
        ),
    },
    'Enviado': {
        'titulo': '🚚 Tu orden fue enviada',
        'mensaje': (
            'Tu orden #{id} salió de nuestras instalaciones y está en camino. '
            'Pronto la recibirás en la dirección registrada.'
        ),
    },
    'Entregado': {
        'titulo': '✅ Orden entregada exitosamente',
        'mensaje': (
            '¡Tu orden #{id} fue marcada como entregada! '
            'Gracias por confiar en HebraTech. Puedes descargar tu factura desde el panel.'
        ),
    },
    'Cancelado': {
        'titulo': '❌ Orden cancelada',
        'mensaje': (
            'Tu orden #{id} fue cancelada por el equipo de administración. '
            'Si tienes dudas, contáctanos directamente.'
        ),
    },
    # 'Pendiente' no genera notificación: es el estado inicial al crear la orden,
    # y el cliente ya recibe confirmación en la página orden_exitosa.html
}


# ── Guardar el estado anterior antes de hacer .save() ────────
# pre_save nos permite comparar el valor viejo con el nuevo.
# Usamos un atributo interno __estado_anterior__ en la instancia.
@receiver(pre_save, sender=Orden)
def orden_guardar_estado_anterior(sender, instance, **kwargs):
    """
    Antes de que se guarde la Orden, consultamos el estado
    que tiene actualmente en la BD y lo guardamos en el objeto.
    Si la orden es nueva (no tiene PK aún) guardamos None.
    """
    if instance.pk:
        try:
            anterior = Orden.objects.get(pk=instance.pk)
            instance.__estado_anterior__ = anterior.estado
        except Orden.DoesNotExist:
            instance.__estado_anterior__ = None
    else:
        instance.__estado_anterior__ = None


# ── Crear notificación si el estado cambió ────────────────────
@receiver(post_save, sender=Orden)
def orden_notificar_cambio_estado(sender, instance, created, **kwargs):
    """
    Después de guardar la Orden:
    - Si es una orden nueva (created=True) → no hace nada (el cliente
      ya ve la confirmación en orden_exitosa.html)
    - Si es una actualización y el estado cambió → crea una Notificacion
      para el cliente dueño de esa orden
    """
    if created:
        return  # Orden nueva: sin notificación de estado

    estado_anterior = getattr(instance, '__estado_anterior__', None)
    estado_nuevo = instance.estado

    # Sin cambio de estado → nada que notificar
    if estado_anterior == estado_nuevo:
        return

    # El nuevo estado no tiene mensaje definido → ignorar
    plantilla = MENSAJES_ESTADO.get(estado_nuevo)
    if not plantilla:
        return

    try:
        Notificacion.objects.create(
            idCliente=instance.idCliente,
            tipo='orden',
            titulo=plantilla['titulo'],
            mensaje=plantilla['mensaje'].format(id=instance.idOrden),
        )
    except Exception as e:
        # No interrumpir el flujo del admin si falla la notificación
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            f'[HebraTech] No se pudo crear notificación para orden '
            f'#{instance.idOrden}: {e}'
        )
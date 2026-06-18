from django.apps import AppConfig

class ClientesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clientes'

    def ready(self):
        # ── ¡AGREGA ESTAS LÍNEAS AQUÍ! ──
        from django.db.backends.mysql.features import DatabaseFeatures
        DatabaseFeatures.can_return_columns_from_insert = property(lambda self: False)
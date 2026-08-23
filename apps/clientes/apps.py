# clientes/apps.py

from django.apps import AppConfig


class ClientesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clientes'   # ← ajusta al path real de tu app si difiere
    verbose_name = 'Portal de Clientes'

    def ready(self):
        """
        Django llama a ready() una sola vez al arrancar el servidor.
        Importar signals aquí conecta los @receiver al ciclo de vida
        de los modelos sin necesidad de importarlos en ningún otro lado.
        """
        import apps.clientes.signals  # noqa: F401
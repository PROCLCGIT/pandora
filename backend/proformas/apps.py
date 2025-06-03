from django.apps import AppConfig


class ProformasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'proformas'
    verbose_name = 'Gestión de Proformas'

    def ready(self):
        """
        Importa las signals cuando la aplicación está lista.
        """
        try:
            import proformas.signals  # noqa F401
        except ImportError:
            pass

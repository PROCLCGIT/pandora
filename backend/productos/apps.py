from django.apps import AppConfig


class ProductosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'productos'

    def ready(self):
        """
        Método ejecutado cuando Django inicia la aplicación.
        Inicializa configuraciones y estructuras necesarias.
        """
        # Importar aquí para evitar importaciones circulares
        from .media_setup import setup_media_directories

        # Configurar directorios de medios
        setup_media_directories()

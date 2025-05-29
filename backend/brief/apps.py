from django.apps import AppConfig


class BriefConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'brief'
    verbose_name = 'Gestión de Briefs'
    
    def ready(self):
        # Importar signals si los necesitas
        import brief.signals

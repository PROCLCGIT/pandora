# backend/basic/management/commands/load_sample_procedencia.py
from django.core.management.base import BaseCommand
from basic.models import Procedencia

class Command(BaseCommand):
    help = 'Carga 30 procedencias de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"PROC-{i:03}"
            Procedencia.objects.get_or_create(
                code=code,
                defaults={'nombre': f"Procedencia {i+1}"}
            )
        self.stdout.write(self.style.SUCCESS('✅ Procedencias de prueba cargadas.'))
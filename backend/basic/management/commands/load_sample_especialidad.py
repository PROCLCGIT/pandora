
# backend/basic/management/commands/load_sample_especialidad.py
from django.core.management.base import BaseCommand
from basic.models import Especialidad

class Command(BaseCommand):
    help = 'Carga 30 especialidades de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"ESP-{i:03}"
            Especialidad.objects.get_or_create(
                code=code,
                defaults={'nombre': f"Especialidad {i+1}"}
            )
        self.stdout.write(self.style.SUCCESS('✅ Especialidades de prueba cargadas.'))
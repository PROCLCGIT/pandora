# backend/basic/management/commands/load_sample_unidad.py
from django.core.management.base import BaseCommand
from basic.models import Unidad

class Command(BaseCommand):
    help = 'Carga 30 unidades de medida de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"UND-{i:03}"
            Unidad.objects.get_or_create(
                code=code,
                defaults={'nombre': f"Unidad {i+1}"}
            )
        self.stdout.write(self.style.SUCCESS('✅ Unidades de medida de prueba cargadas.'))
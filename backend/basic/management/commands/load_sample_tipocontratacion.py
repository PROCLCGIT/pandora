# backend/basic/management/commands/load_sample_tipocontratacion.py
from django.core.management.base import BaseCommand
from basic.models import TipoContratacion

class Command(BaseCommand):
    help = 'Carga 30 tipos de contratación de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"TCON-{i:03}"
            TipoContratacion.objects.get_or_create(
                code=code,
                defaults={'nombre': f"Tipo Contratación {i+1}"}
            )
        self.stdout.write(self.style.SUCCESS('✅ Tipos de contratación de prueba cargados.'))
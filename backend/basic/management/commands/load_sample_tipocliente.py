# backend/basic/management/commands/load_sample_tipocliente.py
from django.core.management.base import BaseCommand
from basic.models import TipoCliente

class Command(BaseCommand):
    help = 'Carga 30 tipos de cliente de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"TCLI-{i:03}"
            TipoCliente.objects.get_or_create(
                code=code,
                defaults={'nombre': f"Tipo Cliente {i+1}"}
            )
        self.stdout.write(self.style.SUCCESS('✅ Tipos de cliente de prueba cargados.'))
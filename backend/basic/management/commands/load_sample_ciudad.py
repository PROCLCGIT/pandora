# backend/basic/management/commands/load_sample_ciudad.py
from django.core.management.base import BaseCommand
from faker import Faker
from basic.models import Ciudad

fake = Faker('es_ES')

class Command(BaseCommand):
    help = 'Carga 30 ciudades de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"CIUD-{i:03}"
            Ciudad.objects.get_or_create(
                code=code,
                defaults={
                    'nombre': fake.city(),
                    'provincia': fake.state(),
                }
            )
        self.stdout.write(self.style.SUCCESS('✅ Ciudades de prueba cargadas.'))
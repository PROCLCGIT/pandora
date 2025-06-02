# backend/basic/management/commands/load_sample_marca.py
from django.core.management.base import BaseCommand
from faker import Faker
from basic.models import Marca

fake = Faker('es_ES')

class Command(BaseCommand):
    help = 'Carga 30 marcas de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"MRK-{i:03}"
            Marca.objects.get_or_create(
                code=code,
                defaults={
                    'nombre': f"Marca {i+1}",
                    'description': fake.text(),
                    'proveedores': fake.company(),
                    'country_origin': fake.country(),
                    'website': fake.url(),
                    'contact_info': fake.phone_number()
                }
            )
        self.stdout.write(self.style.SUCCESS('✅ Marcas de prueba cargadas.'))

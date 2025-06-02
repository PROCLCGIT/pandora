
# backend/basic/management/commands/load_sample_empresa.py
from django.core.management.base import BaseCommand
from faker import Faker
from random import randint
from basic.models import EmpresaClc

fake = Faker('es_ES')

class Command(BaseCommand):
    help = 'Carga 30 empresas CLC de ejemplo'

    def handle(self, *args, **kwargs):
        for i in range(30):
            code = f"EMP-{i:03}"
            EmpresaClc.objects.get_or_create(
                code=code,
                defaults={
                    'nombre': f"Empresa {i+1}",
                    'razon_social': f"Razón Social {i+1} Cía. Ltda.",
                    'ruc': f"09{randint(100000000, 999999999)}{i % 10}",
                    'direccion': fake.address(),
                    'telefono': f"09{randint(10000000, 99999999)}",
                    'correo': f"empresa{i}@clc.com",
                    'representante_legal': fake.name()
                }
            )
        self.stdout.write(self.style.SUCCESS('✅ Empresas CLC de prueba cargadas.'))
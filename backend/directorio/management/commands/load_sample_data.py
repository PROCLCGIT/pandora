# backend/directorio/management/commands/load_sample_data.py

from django.core.management.base import BaseCommand
from faker import Faker
from random import choice, randint
from basic.models import Zona, Ciudad, TipoCliente
from directorio.models import Cliente, Proveedor, Vendedor, Contacto, Tag, ClienteTag, ProveedorTag, ContactoTag, RelacionBlue
from django.utils.text import slugify

fake = Faker('es_ES')


class Command(BaseCommand):
    help = 'Carga 30 datos de prueba por tabla en el módulo Directorio'

    def handle(self, *args, **kwargs):
        zona = Zona.objects.first() or Zona.objects.create(nombre="Costa")
        ciudad = Ciudad.objects.first() or Ciudad.objects.create(nombre="Guayaquil")
        tipo_cliente = TipoCliente.objects.first() or TipoCliente.objects.create(nombre="Hospital Público")

        # Crear algunos tags base
        tags = [
            Tag.objects.create(name="VIP", color_code="#22C55E"),
            Tag.objects.create(name="Moroso", color_code="#EF4444"),
            Tag.objects.create(name="Nuevo", color_code="#3B82F6"),
        ]

        clientes = []
        proveedores = []
        contactos = []

        for i in range(30):
            nombre_cliente = f"{fake.company()} {i}"
            cliente = Cliente.objects.create(
                zona=zona,
                ciudad=ciudad,
                tipo_cliente=tipo_cliente,
                nombre=nombre_cliente,
                alias=slugify(nombre_cliente)[:100],
                razon_social=f"{nombre_cliente} S.A.",
                ruc=f"09{randint(100000000, 999999999)}{i % 10}",
                email=f"cliente{i}@empresa.com",
                telefono=f"09{randint(10000000, 99999999)}",
                direccion=fake.address(),
                nota=fake.sentence(),
            )
            ClienteTag.objects.create(cliente=cliente, tag=choice(tags))
            clientes.append(cliente)

        for i in range(30):
            nombre_proveedor = f"{fake.company()} Proveedor {i}"
            proveedor = Proveedor.objects.create(
                ciudad=ciudad,
                ruc=f"09{randint(100000000, 999999999)}{i % 10}",
                razon_social=f"{nombre_proveedor} Cía. Ltda.",
                nombre=nombre_proveedor,
                direccion1=fake.address(),
                direccion2=fake.secondary_address(),
                correo=f"proveedor{i}@proveedores.com",
                telefono=f"09{randint(10000000, 99999999)}",
                tipo_primario=bool(i % 2),
            )
            ProveedorTag.objects.create(proveedor=proveedor, tag=choice(tags))
            proveedores.append(proveedor)

        for i in range(30):
            Vendedor.objects.create(
                proveedor=choice(proveedores),
                nombre=fake.name(),
                correo=f"vendedor{i}@proveedores.com",
                telefono=f"09{randint(10000000, 99999999)}",
                observacion=fake.sentence()
            )

        for i in range(30):
            nombre_contacto = fake.name()
            contacto = Contacto.objects.create(
                nombre=nombre_contacto,
                alias=slugify(nombre_contacto)[:100],
                telefono=f"09{randint(10000000, 99999999)}",
                telefono2=f"02{randint(1000000, 9999999)}",
                email=f"contacto{i}@clientes.com",
                direccion=fake.address(),
                obserbacion=fake.text(max_nb_chars=50),
                ingerencia=fake.job()
            )
            ContactoTag.objects.create(contacto=contacto, tag=choice(tags))
            contactos.append(contacto)

        for i in range(30):
            RelacionBlue.objects.create(
                cliente=choice(clientes),
                contacto=choice(contactos),
                nivel=randint(1, 10)
            )

        self.stdout.write(self.style.SUCCESS('✅ 30 datos de prueba creados en cada tabla del módulo Directorio.'))

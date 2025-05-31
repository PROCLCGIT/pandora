# backend/productos/management/commands/load_sample_products.py

from django.core.management.base import BaseCommand
from faker import Faker
from random import randint, choice
from django.contrib.auth import get_user_model
from basic.models import Categoria, Marca, Procedencia, Unidad, Especialidad
from productos.models import ProductoOfertado, ProductoDisponible

User = get_user_model()
fake = Faker('es_ES')


class Command(BaseCommand):
    help = 'Carga 30 productos de ejemplo en ProductoOfertado y ProductoDisponible'

    def handle(self, *args, **kwargs):
        user = User.objects.filter(is_superuser=True).first() or User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR("❌ No hay usuarios disponibles."))
            return

        categoria = Categoria.objects.first() or Categoria.objects.create(nombre='Categoría Prueba')
        especialidad = Especialidad.objects.first() or Especialidad.objects.create(nombre='General')
        marca = Marca.objects.first() or Marca.objects.create(nombre='MarcaTest')
        unidad = Unidad.objects.first() or Unidad.objects.create(nombre='UnidadTest')
        procedencia = Procedencia.objects.first() or Procedencia.objects.create(nombre='ProcedenciaTest')

        ofertados = []

        for i in range(30):
            code = f"OFERTA-{1000 + i}"
            cudim = f"CUD-{2000 + i}"
            nombre = f"Producto Ofertado {i+1}"

            producto = ProductoOfertado.objects.create(
                id_categoria=categoria,
                code=code,
                cudim=cudim,
                nombre=nombre,
                descripcion=fake.text(max_nb_chars=100),
                especialidad=especialidad,
                especialidad_texto=especialidad.nombre,
                referencias=fake.sentence(),
                created_by=user,
                updated_by=user,
            )
            ofertados.append(producto)

        for i in range(30):
            code = f"DISP-{3000 + i}"
            nombre = f"Producto Disponible {i+1}"

            ProductoDisponible.objects.create(
                id_categoria=categoria,
                id_producto_ofertado=choice(ofertados),
                code=code,
                nombre=nombre,
                id_marca=marca,
                modelo=f"Modelo {i+1}",
                unidad_presentacion=unidad,
                procedencia=procedencia,
                referencia=fake.lexify(text="REF-?????"),
                id_especialidad=especialidad,
                tz_oferta=randint(1, 5),
                tz_demanda=randint(1, 5),
                tz_inflacion=randint(1, 5),
                tz_calidad=randint(1, 5),
                tz_eficiencia=randint(1, 5),
                tz_referencial=randint(1, 5),
                costo_referencial=round(fake.pydecimal(left_digits=4, right_digits=2), 2),
                precio_sie_referencial=round(fake.pydecimal(left_digits=4, right_digits=2), 2),
                precio_sie_tipob=round(fake.pydecimal(left_digits=4, right_digits=2), 2),
                precio_venta_privado=round(fake.pydecimal(left_digits=4, right_digits=2), 2),
                created_by=user,
                updated_by=user,
            )

        self.stdout.write(self.style.SUCCESS('✅ Se han creado 30 productos ofertados y 30 disponibles.'))

from django.test import TestCase

from .models import Cliente, Proveedor, Contacto, Tag


class TagModelTests(TestCase):
    def test_create_tag(self):
        tag = Tag.objects.create(name="VIP")
        self.assertEqual(str(tag), "VIP")


class TagRelationTests(TestCase):
    def setUp(self):
        # Crear objetos base sin FKs opcionales
        self.cliente = Cliente.objects.create(
            nombre="Cliente X",
            alias="cX",
            razon_social="Cliente X SA",
            ruc="1717171717171",
            email="contacto@company.com",
            telefono="0999999999",
            direccion="Dir",
        )
        self.proveedor = Proveedor.objects.create(
            ruc="1818181818181",
            razon_social="Prov SA",
            nombre="Proveedor P",
            direccion1="Dir1",
            correo="prov@company.com",
            telefono="0999999998",
        )
        self.contacto = Contacto.objects.create(
            nombre="Juan",
            alias="juan",
            telefono="0999999997",
            email="juan@company.com",
            ingerencia="ventas",
        )

    def test_assign_tags(self):
        tag = Tag.objects.create(name="Importante")
        self.cliente.tags.add(tag)
        self.proveedor.tags.add(tag)
        self.contacto.tags.add(tag)

        self.assertIn(tag, self.cliente.tags.all())
        self.assertIn(tag, self.proveedor.tags.all())
        self.assertIn(tag, self.contacto.tags.all())


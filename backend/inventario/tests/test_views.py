from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from ..models import Almacen, Stock, TipoMovimiento
from productos.models import Producto, Categoria
from basic.models import UnidadMedida

class StockViewSetTest(TestCase):
    def setUp(self):
        # Crear usuario y autenticar
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Crear datos de prueba
        self.categoria = Categoria.objects.create(nombre='Test')
        self.unidad = UnidadMedida.objects.create(
            nombre='Unidad',
            abreviatura='UND'
        )
        self.producto = Producto.objects.create(
            codigo='PROD-001',
            nombre='Producto Test',
            categoria=self.categoria,
            unidad_medida_default=self.unidad
        )
        self.almacen = Almacen.objects.create(
            codigo='ALM-001',
            nombre='Almacén Test'
        )
        
    def test_listar_stocks(self):
        # Crear stock
        Stock.objects.create(
            producto=self.producto,
            almacen=self.almacen,
            cantidad=100,
            stock_minimo=10
        )
        
        # Hacer petición
        response = self.client.get('/api/inventario/stocks/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_obtener_resumen(self):
        # Crear varios stocks
        Stock.objects.create(
            producto=self.producto,
            almacen=self.almacen,
            cantidad=100,
            stock_minimo=10,
            costo_promedio=5.00
        )
        
        # Hacer petición
        response = self.client.get('/api/inventario/stocks/resumen/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_productos', response.data)
        self.assertIn('valor_total', response.data)
        self.assertIn('alertas', response.data)

class AlmacenViewSetTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
    def test_crear_almacen(self):
        data = {
            'codigo': 'ALM-002',
            'nombre': 'Nuevo Almacén',
            'direccion': 'Nueva dirección',
            'activo': True
        }
        
        response = self.client.post('/api/inventario/almacenes/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Almacen.objects.count(), 1)
        self.assertEqual(Almacen.objects.first().nombre, 'Nuevo Almacén')
        
    def test_actualizar_almacen(self):
        almacen = Almacen.objects.create(
            codigo='ALM-001',
            nombre='Almacén Original'
        )
        
        data = {
            'codigo': 'ALM-001',
            'nombre': 'Almacén Actualizado',
            'activo': True
        }
        
        response = self.client.put(
            f'/api/inventario/almacenes/{almacen.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        almacen.refresh_from_db()
        self.assertEqual(almacen.nombre, 'Almacén Actualizado')

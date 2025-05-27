from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import datetime, timedelta
from ..models import Almacen, Stock, TipoMovimiento, Movimiento, DetalleMovimiento
from productos.models import Producto, Categoria
from basic.models import UnidadMedida

class AlmacenModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
    def test_crear_almacen(self):
        almacen = Almacen.objects.create(
            codigo='ALM-TEST',
            nombre='Almacén de Prueba',
            direccion='Dirección de prueba',
            responsable=self.user
        )
        
        self.assertEqual(almacen.codigo, 'ALM-TEST')
        self.assertEqual(almacen.nombre, 'Almacén de Prueba')
        self.assertTrue(almacen.activo)
        self.assertEqual(str(almacen), 'ALM-TEST - Almacén de Prueba')

class StockModelTest(TestCase):
    def setUp(self):
        # Crear datos necesarios
        self.categoria = Categoria.objects.create(
            nombre='Medicamentos',
            descripcion='Categoría de medicamentos'
        )
        
        self.unidad = UnidadMedida.objects.create(
            nombre='Unidad',
            abreviatura='UND'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD-001',
            nombre='Producto de Prueba',
            categoria=self.categoria,
            unidad_medida_default=self.unidad
        )
        
        self.almacen = Almacen.objects.create(
            codigo='ALM-001',
            nombre='Almacén Principal'
        )
        
    def test_crear_stock(self):
        stock = Stock.objects.create(
            producto=self.producto,
            almacen=self.almacen,
            cantidad=100,
            stock_minimo=10,
            stock_maximo=200,
            costo_promedio=5.50
        )
        
        self.assertEqual(stock.cantidad, 100)
        self.assertEqual(stock.cantidad_disponible, 100)
        self.assertEqual(stock.estado_stock, 'normal')
        
    def test_estado_stock_critico(self):
        stock = Stock.objects.create(
            producto=self.producto,
            almacen=self.almacen,
            cantidad=5,
            stock_minimo=10
        )
        
        self.assertEqual(stock.estado_stock, 'critico')
        
    def test_estado_stock_agotado(self):
        stock = Stock.objects.create(
            producto=self.producto,
            almacen=self.almacen,
            cantidad=0,
            stock_minimo=10
        )
        
        self.assertEqual(stock.estado_stock, 'agotado')

class MovimientoModelTest(TestCase):
    def setUp(self):
        # Crear usuario
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Crear categoría y unidad
        self.categoria = Categoria.objects.create(
            nombre='Medicamentos'
        )
        
        self.unidad = UnidadMedida.objects.create(
            nombre='Unidad',
            abreviatura='UND'
        )
        
        # Crear producto
        self.producto = Producto.objects.create(
            codigo='PROD-001',
            nombre='Producto de Prueba',
            categoria=self.categoria,
            unidad_medida_default=self.unidad
        )
        
        # Crear almacenes
        self.almacen1 = Almacen.objects.create(
            codigo='ALM-001',
            nombre='Almacén 1'
        )
        
        self.almacen2 = Almacen.objects.create(
            codigo='ALM-002',
            nombre='Almacén 2'
        )
        
        # Crear tipo de movimiento
        self.tipo_entrada = TipoMovimiento.objects.create(
            codigo='ENT-001',
            nombre='Entrada por Compra',
            tipo='entrada'
        )
        
    def test_crear_movimiento_entrada(self):
        # Crear movimiento
        movimiento = Movimiento.objects.create(
            tipo_movimiento=self.tipo_entrada,
            fecha=datetime.now(),
            numero_documento='FAC-001',
            almacen_destino=self.almacen1,
            usuario=self.user
        )
        
        # Crear detalle
        detalle = DetalleMovimiento.objects.create(
            movimiento=movimiento,
            producto=self.producto,
            cantidad=50,
            unidad_medida=self.unidad,
            costo_unitario=10.00
        )
        
        # Confirmar movimiento
        movimiento.confirmar()
        
        # Verificar stock
        stock = Stock.objects.get(
            producto=self.producto,
            almacen=self.almacen1
        )
        
        self.assertEqual(stock.cantidad, 50)
        self.assertEqual(stock.costo_promedio, 10.00)
        self.assertEqual(movimiento.estado, 'confirmado')

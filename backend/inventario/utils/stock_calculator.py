from decimal import Decimal
from django.db.models import Sum, F
from ..models import Stock, Movimiento, DetalleMovimiento

class StockCalculator:
    """Clase para realizar cálculos relacionados con el stock"""
    
    @staticmethod
    def calcular_costo_promedio(cantidad_actual, costo_actual, cantidad_nueva, costo_nuevo):
        """
        Calcula el costo promedio ponderado
        """
        cantidad_actual = Decimal(str(cantidad_actual))
        costo_actual = Decimal(str(costo_actual))
        cantidad_nueva = Decimal(str(cantidad_nueva))
        costo_nuevo = Decimal(str(costo_nuevo))
        
        if cantidad_actual + cantidad_nueva == 0:
            return Decimal('0')
        
        total_anterior = cantidad_actual * costo_actual
        total_nuevo = cantidad_nueva * costo_nuevo
        
        return (total_anterior + total_nuevo) / (cantidad_actual + cantidad_nueva)
    
    @staticmethod
    def verificar_disponibilidad(producto, almacen, cantidad_requerida, lote=''):
        """
        Verifica si hay suficiente stock disponible
        """
        try:
            stock = Stock.objects.get(
                producto=producto,
                almacen=almacen,
                lote=lote
            )
            return stock.cantidad_disponible >= cantidad_requerida
        except Stock.DoesNotExist:
            return False
    
    @staticmethod
    def obtener_stock_total_producto(producto):
        """
        Obtiene el stock total de un producto en todos los almacenes
        """
        return Stock.objects.filter(
            producto=producto
        ).aggregate(
            total=Sum('cantidad'),
            disponible=Sum(F('cantidad') - F('cantidad_reservada'))
        )
    
    @staticmethod
    def obtener_valor_inventario(almacen=None):
        """
        Calcula el valor total del inventario
        """
        queryset = Stock.objects.all()
        if almacen:
            queryset = queryset.filter(almacen=almacen)
        
        return queryset.aggregate(
            valor_total=Sum(F('cantidad') * F('costo_promedio'))
        )['valor_total'] or Decimal('0')

from datetime import timedelta
from django.utils import timezone
from ..models import Stock, AlertaStock

class AlertManager:
    """Gestión de alertas de inventario"""
    
    @staticmethod
    def verificar_alertas_stock():
        """
        Verifica todos los stocks y genera alertas según sea necesario
        """
        stocks = Stock.objects.all()
        alertas_generadas = []
        
        for stock in stocks:
            # Verificar stock mínimo
            if stock.cantidad <= stock.stock_minimo:
                alerta = AlertManager._crear_alerta_stock_minimo(stock)
                if alerta:
                    alertas_generadas.append(alerta)
            
            # Verificar vencimiento
            if stock.fecha_vencimiento:
                alerta = AlertManager._crear_alerta_vencimiento(stock)
                if alerta:
                    alertas_generadas.append(alerta)
            
            # Verificar stock máximo
            if stock.stock_maximo and stock.cantidad >= stock.stock_maximo:
                alerta = AlertManager._crear_alerta_stock_maximo(stock)
                if alerta:
                    alertas_generadas.append(alerta)
        
        return alertas_generadas
    
    @staticmethod
    def _crear_alerta_stock_minimo(stock):
        """
        Crea una alerta si el stock está por debajo del mínimo
        """
        # Verificar si ya existe una alerta no leída similar
        existe_alerta = AlertaStock.objects.filter(
            stock=stock,
            tipo_alerta='minimo' if stock.cantidad > 0 else 'agotado',
            leida=False,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).exists()
        
        if not existe_alerta:
            tipo = 'minimo' if stock.cantidad > 0 else 'agotado'
            mensaje = f"Stock {'bajo' if stock.cantidad > 0 else 'agotado'} para {stock.producto.nombre} en {stock.almacen.nombre}"
            
            return AlertaStock.objects.create(
                stock=stock,
                tipo_alerta=tipo,
                mensaje=mensaje
            )
        return None
    
    @staticmethod
    def _crear_alerta_vencimiento(stock):
        """
        Crea una alerta si el producto está próximo a vencer
        """
        dias_para_vencer = (stock.fecha_vencimiento - timezone.now().date()).days
        
        if dias_para_vencer <= 30:
            # Verificar si ya existe una alerta no leída similar
            existe_alerta = AlertaStock.objects.filter(
                stock=stock,
                tipo_alerta='vencimiento',
                leida=False,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).exists()
            
            if not existe_alerta:
                mensaje = f"Producto {stock.producto.nombre} próximo a vencer en {dias_para_vencer} días"
                
                return AlertaStock.objects.create(
                    stock=stock,
                    tipo_alerta='vencimiento',
                    mensaje=mensaje
                )
        return None
    
    @staticmethod
    def _crear_alerta_stock_maximo(stock):
        """
        Crea una alerta si el stock supera el máximo
        """
        # Verificar si ya existe una alerta no leída similar
        existe_alerta = AlertaStock.objects.filter(
            stock=stock,
            tipo_alerta='maximo',
            leida=False,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).exists()
        
        if not existe_alerta:
            mensaje = f"Stock excedido para {stock.producto.nombre} en {stock.almacen.nombre}"
            
            return AlertaStock.objects.create(
                stock=stock,
                tipo_alerta='maximo',
                mensaje=mensaje
            )
        return None
    
    @staticmethod
    def limpiar_alertas_antiguas(dias=30):
        """
        Elimina alertas leídas más antiguas que el número de días especificado
        """
        fecha_limite = timezone.now() - timedelta(days=dias)
        return AlertaStock.objects.filter(
            leida=True,
            created_at__lt=fecha_limite
        ).delete()

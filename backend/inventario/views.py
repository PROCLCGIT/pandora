from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, F
from django.utils import timezone
from datetime import timedelta
from .models import (
    Almacen, Stock, TipoMovimiento, 
    Movimiento, DetalleMovimiento, AlertaStock
)
from .serializers import (
    AlmacenSerializer, StockSerializer, TipoMovimientoSerializer,
    MovimientoSerializer, MovimientoCreateSerializer, AlertaStockSerializer
)

class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['activo', 'responsable']
    search_fields = ['codigo', 'nombre']
    ordering_fields = ['nombre', 'created_at']

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['producto', 'almacen']
    search_fields = ['producto__nombre', 'producto__codigo', 'lote']
    ordering_fields = ['cantidad', 'ultimo_movimiento']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro por estado de stock
        estado = self.request.query_params.get('estado_stock', None)
        if estado:
            if estado == 'agotado':
                queryset = queryset.filter(cantidad=0)
            elif estado == 'critico':
                queryset = queryset.filter(cantidad__gt=0, cantidad__lte=F('stock_minimo'))
            elif estado == 'bajo':
                queryset = queryset.filter(
                    cantidad__gt=F('stock_minimo'),
                    cantidad__lte=F('stock_minimo') * 1.5
                )
            elif estado == 'alto':
                queryset = queryset.filter(stock_maximo__isnull=False, cantidad__gte=F('stock_maximo'))
            elif estado == 'normal':
                queryset = queryset.filter(
                    cantidad__gt=F('stock_minimo') * 1.5
                ).exclude(
                    stock_maximo__isnull=False,
                    cantidad__gte=F('stock_maximo')
                )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def alertas(self, request):
        """Obtiene productos con alertas de stock"""
        stocks_criticos = self.get_queryset().filter(
            Q(cantidad__lte=F('stock_minimo')) |
            Q(fecha_vencimiento__lte=timezone.now() + timedelta(days=30))
        )
        serializer = self.get_serializer(stocks_criticos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Resumen general del inventario"""
        queryset = self.get_queryset()
        
        resumen = {
            'total_productos': queryset.values('producto').distinct().count(),
            'total_almacenes': queryset.values('almacen').distinct().count(),
            'valor_total': queryset.aggregate(
                total=Sum(F('cantidad') * F('costo_promedio'))
            )['total'] or 0,
            'alertas': {
                'criticos': queryset.filter(cantidad__lte=F('stock_minimo')).count(),
                'por_vencer': queryset.filter(
                    fecha_vencimiento__lte=timezone.now() + timedelta(days=30)
                ).count(),
                'agotados': queryset.filter(cantidad=0).count(),
            }
        }
        
        return Response(resumen)
    
    @action(detail=True, methods=['post'])
    def ajustar_minimos(self, request, pk=None):
        """Ajusta stocks mínimos y máximos"""
        stock = self.get_object()
        stock.stock_minimo = request.data.get('stock_minimo', stock.stock_minimo)
        stock.stock_maximo = request.data.get('stock_maximo', stock.stock_maximo)
        stock.save()
        
        return Response({'status': 'stocks actualizados'})

class TipoMovimientoViewSet(viewsets.ModelViewSet):
    queryset = TipoMovimiento.objects.all()
    serializer_class = TipoMovimientoSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tipo', 'activo']

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tipo_movimiento', 'estado', 'almacen_origen', 'almacen_destino']
    search_fields = ['numero_documento', 'observaciones']
    ordering_fields = ['fecha', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MovimientoCreateSerializer
        return MovimientoSerializer
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Confirma un movimiento y actualiza el stock"""
        movimiento = self.get_object()
        
        try:
            movimiento.confirmar()
            # Generar alertas si es necesario
            self._verificar_alertas_stock(movimiento)
            
            return Response(
                {'status': 'movimiento confirmado'},
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        """Anula un movimiento confirmado"""
        movimiento = self.get_object()
        
        if movimiento.estado != 'confirmado':
            return Response(
                {'error': 'Solo se pueden anular movimientos confirmados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Aquí implementarías la lógica para revertir el movimiento
        movimiento.estado = 'anulado'
        movimiento.save()
        
        return Response({'status': 'movimiento anulado'})
    
    def _verificar_alertas_stock(self, movimiento):
        """Verifica y genera alertas después de un movimiento"""
        for detalle in movimiento.detalles.all():
            stocks = Stock.objects.filter(producto=detalle.producto)
            
            for stock in stocks:
                # Verificar stock mínimo
                if stock.cantidad <= stock.stock_minimo:
                    AlertaStock.objects.create(
                        stock=stock,
                        tipo_alerta='minimo' if stock.cantidad > 0 else 'agotado',
                        mensaje=f"Stock {'bajo' if stock.cantidad > 0 else 'agotado'} para {stock.producto.nombre} en {stock.almacen.nombre}"
                    )
                
                # Verificar vencimiento
                if stock.fecha_vencimiento:
                    dias_para_vencer = (stock.fecha_vencimiento - timezone.now().date()).days
                    if dias_para_vencer <= 30:
                        AlertaStock.objects.create(
                            stock=stock,
                            tipo_alerta='vencimiento',
                            mensaje=f"Producto {stock.producto.nombre} próximo a vencer en {dias_para_vencer} días"
                        )

class AlertaStockViewSet(viewsets.ModelViewSet):
    queryset = AlertaStock.objects.all()
    serializer_class = AlertaStockSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tipo_alerta', 'leida', 'usuario_asignado']
    ordering_fields = ['created_at']
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marca una alerta como leída"""
        alerta = self.get_object()
        alerta.leida = True
        alerta.save()
        return Response({'status': 'alerta marcada como leída'})
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marca todas las alertas del usuario como leídas"""
        AlertaStock.objects.filter(
            usuario_asignado=request.user,
            leida=False
        ).update(leida=True)
        return Response({'status': 'todas las alertas marcadas como leídas'})

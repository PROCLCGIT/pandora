# backend/inventario/views.py

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from .models import (
    Unidad, Categoria, ProductoInventario, Almacen, Ubicacion, 
    Existencia, MovimientoInventario, Proveedor, OrdenCompra,
    LineaOrdenCompra, Cliente, OrdenVenta, LineaOrdenVenta,
    ReservaInventario, TipoMovimiento, TablaReferencia, EstadoOrdenCompra,
    EstadoOrdenVenta, EstadoReserva
)
from .serializers import (
    UnidadSerializer, CategoriaSerializer, ProductoInventarioSerializer, 
    AlmacenSerializer, UbicacionSerializer, ExistenciaSerializer,
    MovimientoInventarioSerializer, ProveedorSerializer, OrdenCompraSerializer,
    LineaOrdenCompraSerializer, ClienteSerializer, OrdenVentaSerializer,
    LineaOrdenVentaSerializer, ReservaInventarioSerializer,
    ProductoInventarioDetalleSerializer, OrdenCompraDetalleSerializer,
    OrdenVentaDetalleSerializer
)
from django.db import transaction
from django.db.models import F, Sum
from decimal import Decimal

# Vistas básicas
class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nombre', 'abreviatura']

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nombre']
    filterset_fields = ['padre']

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nombre', 'ruc', 'email']

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nombre', 'ruc', 'email']

class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['codigo', 'nombre']

class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['codigo', 'descripcion']
    filterset_fields = ['almacen']

# Vistas con lógica de negocio
class ProductoInventarioViewSet(viewsets.ModelViewSet):
    queryset = ProductoInventario.objects.all()
    serializer_class = ProductoInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['sku', 'nombre']
    filterset_fields = ['categoria', 'activo']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductoInventarioDetalleSerializer
        return ProductoInventarioSerializer
    
    @action(detail=True, methods=['get'])
    def existencias(self, request, pk=None):
        """Obtener todas las existencias del producto"""
        producto = self.get_object()
        existencias = Existencia.objects.filter(producto=producto)
        serializer = ExistenciaSerializer(existencias, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def movimientos(self, request, pk=None):
        """Obtener el historial de movimientos del producto"""
        producto = self.get_object()
        movimientos = MovimientoInventario.objects.filter(producto=producto)
        serializer = MovimientoInventarioSerializer(movimientos, many=True)
        return Response(serializer.data)

class ExistenciaViewSet(viewsets.ModelViewSet):
    queryset = Existencia.objects.all()
    serializer_class = ExistenciaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['producto', 'almacen', 'ubicacion']
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def ajustar(self, request, pk=None):
        """Ajustar la cantidad disponible de una existencia"""
        existencia = self.get_object()
        nueva_cantidad = Decimal(request.data.get('cantidad', 0))
        cantidad_actual = existencia.cantidad_disponible
        
        # Calcular la diferencia
        diferencia = nueva_cantidad - cantidad_actual
        
        if diferencia == 0:
            return Response({'detail': 'No hay cambios en la cantidad'})
        
        # Crear el movimiento de ajuste
        MovimientoInventario.objects.create(
            producto=existencia.producto,
            almacen=existencia.almacen,
            ubicacion=existencia.ubicacion,
            tipo_movimiento=TipoMovimiento.AJUSTE,
            tabla_referencia=TablaReferencia.AJ,
            cantidad=abs(diferencia),
            costo_unitario=existencia.producto.costo,
            observaciones=f"Ajuste de {cantidad_actual} a {nueva_cantidad}"
        )
        
        # Actualizar la existencia
        existencia.cantidad_disponible = nueva_cantidad
        existencia.save()
        
        return Response({
            'detail': f'Existencia ajustada de {cantidad_actual} a {nueva_cantidad}',
            'existencia': ExistenciaSerializer(existencia).data
        })

class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['producto', 'almacen', 'tipo_movimiento', 'tabla_referencia']
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def entrada_manual(self, request):
        """Registrar una entrada manual de inventario"""
        producto_id = request.data.get('producto')
        almacen_id = request.data.get('almacen')
        ubicacion_id = request.data.get('ubicacion')
        cantidad = Decimal(request.data.get('cantidad', 0))
        costo_unitario = Decimal(request.data.get('costo_unitario', 0))
        observaciones = request.data.get('observaciones', '')
        
        if cantidad <= 0:
            return Response({'error': 'La cantidad debe ser mayor a cero'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el movimiento
        movimiento = MovimientoInventario.objects.create(
            producto_id=producto_id,
            almacen_id=almacen_id,
            ubicacion_id=ubicacion_id,
            tipo_movimiento=TipoMovimiento.ENTRADA,
            tabla_referencia=TablaReferencia.MANUAL,
            cantidad=cantidad,
            costo_unitario=costo_unitario,
            observaciones=observaciones
        )
        
        # Actualizar existencia
        existencia, created = Existencia.objects.get_or_create(
            producto_id=producto_id,
            almacen_id=almacen_id,
            ubicacion_id=ubicacion_id,
            defaults={'cantidad_disponible': 0, 'cantidad_reservada': 0}
        )
        
        existencia.cantidad_disponible += cantidad
        existencia.save()
        
        return Response({
            'detail': f'Entrada registrada correctamente',
            'movimiento': MovimientoInventarioSerializer(movimiento).data,
            'existencia': ExistenciaSerializer(existencia).data
        })
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def salida_manual(self, request):
        """Registrar una salida manual de inventario"""
        producto_id = request.data.get('producto')
        almacen_id = request.data.get('almacen')
        ubicacion_id = request.data.get('ubicacion')
        cantidad = Decimal(request.data.get('cantidad', 0))
        costo_unitario = Decimal(request.data.get('costo_unitario', 0))
        observaciones = request.data.get('observaciones', '')
        
        if cantidad <= 0:
            return Response({'error': 'La cantidad debe ser mayor a cero'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar existencia
        try:
            existencia = Existencia.objects.get(
                producto_id=producto_id,
                almacen_id=almacen_id,
                ubicacion_id=ubicacion_id
            )
        except Existencia.DoesNotExist:
            return Response({'error': 'No existe inventario en la ubicación especificada'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if existencia.cantidad_disponible < cantidad:
            return Response({'error': 'No hay suficiente inventario disponible'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el movimiento
        movimiento = MovimientoInventario.objects.create(
            producto_id=producto_id,
            almacen_id=almacen_id,
            ubicacion_id=ubicacion_id,
            tipo_movimiento=TipoMovimiento.SALIDA,
            tabla_referencia=TablaReferencia.MANUAL,
            cantidad=cantidad,
            costo_unitario=costo_unitario if costo_unitario > 0 else existencia.producto.costo,
            observaciones=observaciones
        )
        
        # Actualizar existencia
        existencia.cantidad_disponible -= cantidad
        existencia.save()
        
        return Response({
            'detail': f'Salida registrada correctamente',
            'movimiento': MovimientoInventarioSerializer(movimiento).data,
            'existencia': ExistenciaSerializer(existencia).data
        })

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.all()
    serializer_class = OrdenCompraSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['proveedor', 'almacen', 'estado']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrdenCompraDetalleSerializer
        return OrdenCompraSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def aprobar(self, request, pk=None):
        """Aprobar una orden de compra"""
        orden = self.get_object()
        
        if orden.estado != EstadoOrdenCompra.BORRADOR:
            return Response({'error': 'Solo se pueden aprobar órdenes en estado borrador'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Cambiar estado
        orden.estado = EstadoOrdenCompra.APROBADA
        orden.save()
        
        return Response({'detail': 'Orden de compra aprobada correctamente'})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def recibir(self, request, pk=None):
        """Recibir una orden de compra (parcial o total)"""
        orden = self.get_object()
        
        if orden.estado not in [EstadoOrdenCompra.APROBADA, EstadoOrdenCompra.RECIBIDA]:
            return Response({'error': 'Solo se pueden recibir órdenes aprobadas o parcialmente recibidas'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Datos de recepción
        recepciones = request.data.get('recepciones', [])
        if not recepciones:
            return Response({'error': 'Debe especificar al menos una línea para recibir'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        for recepcion in recepciones:
            linea_id = recepcion.get('linea_id')
            cantidad_recibida = Decimal(recepcion.get('cantidad', 0))
            
            if cantidad_recibida <= 0:
                return Response({'error': f'La cantidad para la línea {linea_id} debe ser mayor a cero'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            try:
                linea = LineaOrdenCompra.objects.get(id=linea_id, orden_compra=orden)
            except LineaOrdenCompra.DoesNotExist:
                return Response({'error': f'La línea {linea_id} no existe o no pertenece a esta orden'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar que no exceda la cantidad pedida
            cantidad_restante = linea.cantidad_pedida - linea.cantidad_recibida
            if cantidad_recibida > cantidad_restante:
                return Response({'error': f'La cantidad recibida excede la cantidad pendiente para la línea {linea_id}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Registrar recepción
            linea.cantidad_recibida += cantidad_recibida
            linea.save()
            
            # Actualizar inventario
            existencia, created = Existencia.objects.get_or_create(
                producto=linea.producto,
                almacen=orden.almacen,
                ubicacion=None,  # Se podría especificar una ubicación por defecto
                defaults={'cantidad_disponible': 0, 'cantidad_reservada': 0}
            )
            
            existencia.cantidad_disponible += cantidad_recibida
            existencia.save()
            
            # Registrar movimiento
            MovimientoInventario.objects.create(
                producto=linea.producto,
                almacen=orden.almacen,
                ubicacion=None,  # Misma ubicación que arriba
                tipo_movimiento=TipoMovimiento.ENTRADA,
                referencia=f"OC-{orden.id}",
                tabla_referencia=TablaReferencia.OC,
                cantidad=cantidad_recibida,
                costo_unitario=linea.costo_unitario,
                observaciones=f"Recepción de orden de compra #{orden.id}"
            )
        
        # Verificar si todas las líneas están completamente recibidas
        total_pedido = orden.lineas.aggregate(total=Sum('cantidad_pedida'))['total'] or 0
        total_recibido = orden.lineas.aggregate(total=Sum('cantidad_recibida'))['total'] or 0
        
        if total_recibido >= total_pedido:
            orden.estado = EstadoOrdenCompra.RECIBIDA
            orden.save()
        
        return Response({'detail': 'Recepción registrada correctamente'})

class LineaOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = LineaOrdenCompra.objects.all()
    serializer_class = LineaOrdenCompraSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['orden_compra', 'producto']

class OrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = OrdenVenta.objects.all()
    serializer_class = OrdenVentaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['cliente', 'almacen', 'estado']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrdenVentaDetalleSerializer
        return OrdenVentaSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def confirmar(self, request, pk=None):
        """Confirmar una orden de venta"""
        orden = self.get_object()
        
        if orden.estado != EstadoOrdenVenta.BORRADOR:
            return Response({'error': 'Solo se pueden confirmar órdenes en estado borrador'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar disponibilidad de inventario
        for linea in orden.lineas.all():
            existencias = Existencia.objects.filter(
                producto=linea.producto,
                almacen=orden.almacen
            ).aggregate(total=Sum('cantidad_disponible'))
            
            disponible = existencias['total'] or 0
            
            if disponible < linea.cantidad_pedida:
                return Response({
                    'error': f'No hay suficiente inventario para el producto {linea.producto.nombre}',
                    'disponible': disponible,
                    'requerido': linea.cantidad_pedida
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reservar el inventario
        for linea in orden.lineas.all():
            # Crear reserva
            ReservaInventario.objects.create(
                producto=linea.producto,
                almacen=orden.almacen,
                cantidad=linea.cantidad_pedida,
                estado=EstadoReserva.ACTIVA,
                referencia=f"OV-{orden.id}",
                tabla_referencia=TablaReferencia.PV
            )
            
            # Actualizar existencias (distribuyendo entre ubicaciones si es necesario)
            cantidad_a_reservar = linea.cantidad_pedida
            existencias = Existencia.objects.filter(
                producto=linea.producto,
                almacen=orden.almacen
            ).order_by('ubicacion')
            
            for existencia in existencias:
                if cantidad_a_reservar <= 0:
                    break
                
                cant_disponible = existencia.cantidad_disponible - existencia.cantidad_reservada
                
                if cant_disponible > 0:
                    cantidad_reservar_aqui = min(cant_disponible, cantidad_a_reservar)
                    existencia.cantidad_reservada += cantidad_reservar_aqui
                    existencia.save()
                    
                    cantidad_a_reservar -= cantidad_reservar_aqui
        
        # Cambiar estado
        orden.estado = EstadoOrdenVenta.CONFIRMADA
        orden.save()
        
        return Response({'detail': 'Orden de venta confirmada y stock reservado correctamente'})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def enviar(self, request, pk=None):
        """Registrar el envío de una orden de venta"""
        orden = self.get_object()
        
        if orden.estado != EstadoOrdenVenta.CONFIRMADA:
            return Response({'error': 'Solo se pueden enviar órdenes confirmadas'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Datos de envío
        envios = request.data.get('envios', [])
        if not envios:
            return Response({'error': 'Debe especificar al menos una línea para enviar'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        for envio in envios:
            linea_id = envio.get('linea_id')
            cantidad_enviada = Decimal(envio.get('cantidad', 0))
            ubicacion_id = envio.get('ubicacion')
            
            if cantidad_enviada <= 0:
                return Response({'error': f'La cantidad para la línea {linea_id} debe ser mayor a cero'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            try:
                linea = LineaOrdenVenta.objects.get(id=linea_id, orden_venta=orden)
            except LineaOrdenVenta.DoesNotExist:
                return Response({'error': f'La línea {linea_id} no existe o no pertenece a esta orden'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar que no exceda la cantidad pedida
            cantidad_restante = linea.cantidad_pedida - linea.cantidad_enviada
            if cantidad_enviada > cantidad_restante:
                return Response({'error': f'La cantidad enviada excede la cantidad pendiente para la línea {linea_id}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Buscar existencia
            try:
                existencia = Existencia.objects.get(
                    producto=linea.producto,
                    almacen=orden.almacen,
                    ubicacion_id=ubicacion_id
                )
            except Existencia.DoesNotExist:
                return Response({'error': f'No hay existencias en la ubicación especificada para el producto {linea.producto.nombre}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            if (existencia.cantidad_disponible - existencia.cantidad_reservada + cantidad_enviada) < cantidad_enviada:
                return Response({'error': f'No hay suficiente inventario disponible en la ubicación para {linea.producto.nombre}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Registrar envío
            linea.cantidad_enviada += cantidad_enviada
            linea.save()
            
            # Actualizar inventario
            existencia.cantidad_disponible -= cantidad_enviada
            existencia.cantidad_reservada -= cantidad_enviada
            existencia.save()
            
            # Registrar movimiento
            MovimientoInventario.objects.create(
                producto=linea.producto,
                almacen=orden.almacen,
                ubicacion_id=ubicacion_id,
                tipo_movimiento=TipoMovimiento.SALIDA,
                referencia=f"OV-{orden.id}",
                tabla_referencia=TablaReferencia.PV,
                cantidad=cantidad_enviada,
                costo_unitario=linea.producto.costo,
                observaciones=f"Envío de orden de venta #{orden.id}"
            )
            
            # Actualizar reservas
            reservas = ReservaInventario.objects.filter(
                producto=linea.producto,
                almacen=orden.almacen,
                estado=EstadoReserva.ACTIVA,
                referencia=f"OV-{orden.id}"
            )
            
            cantidad_a_utilizar = cantidad_enviada
            for reserva in reservas:
                if cantidad_a_utilizar <= 0:
                    break
                
                if reserva.cantidad <= cantidad_a_utilizar:
                    # Utilizar toda la reserva
                    cantidad_a_utilizar -= reserva.cantidad
                    reserva.estado = EstadoReserva.UTILIZADA
                    reserva.save()
                else:
                    # Utilizar parcialmente la reserva
                    reserva.cantidad -= cantidad_a_utilizar
                    reserva.save()
                    
                    # Crear una nueva reserva para la parte utilizada
                    ReservaInventario.objects.create(
                        producto=reserva.producto,
                        almacen=reserva.almacen,
                        ubicacion=reserva.ubicacion,
                        cantidad=cantidad_a_utilizar,
                        estado=EstadoReserva.UTILIZADA,
                        referencia=reserva.referencia,
                        tabla_referencia=reserva.tabla_referencia,
                        observaciones="Parte utilizada de la reserva original"
                    )
                    
                    cantidad_a_utilizar = 0
        
        # Verificar si todas las líneas están completamente enviadas
        total_pedido = orden.lineas.aggregate(total=Sum('cantidad_pedida'))['total'] or 0
        total_enviado = orden.lineas.aggregate(total=Sum('cantidad_enviada'))['total'] or 0
        
        if total_enviado >= total_pedido:
            orden.estado = EstadoOrdenVenta.ENVIADA
            orden.save()
        
        return Response({'detail': 'Envío registrado correctamente'})

class LineaOrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = LineaOrdenVenta.objects.all()
    serializer_class = LineaOrdenVentaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['orden_venta', 'producto']

class ReservaInventarioViewSet(viewsets.ModelViewSet):
    queryset = ReservaInventario.objects.all()
    serializer_class = ReservaInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['producto', 'almacen', 'estado', 'tabla_referencia']
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancelar(self, request, pk=None):
        """Cancelar una reserva de inventario"""
        reserva = self.get_object()
        
        if reserva.estado != EstadoReserva.ACTIVA:
            return Response({'error': 'Solo se pueden cancelar reservas activas'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Liberar inventario reservado
        existencias = Existencia.objects.filter(
            producto=reserva.producto,
            almacen=reserva.almacen
        )
        
        cantidad_a_liberar = reserva.cantidad
        for existencia in existencias:
            if cantidad_a_liberar <= 0:
                break
            
            if existencia.cantidad_reservada > 0:
                cantidad_liberar_aqui = min(existencia.cantidad_reservada, cantidad_a_liberar)
                existencia.cantidad_reservada -= cantidad_liberar_aqui
                existencia.save()
                
                cantidad_a_liberar -= cantidad_liberar_aqui
        
        # Cambiar estado de la reserva
        reserva.estado = EstadoReserva.CANCELADA
        reserva.save()
        
        return Response({'detail': 'Reserva cancelada correctamente'})
# backend/proformas/views.py

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q

from .models import (
    Proforma, ProformaItem, ProformaHistorial, 
    SecuenciaProforma, ConfiguracionProforma
)
from .serializers import (
    ProformaSerializer, ProformaDetalladoSerializer, ProformaReporteSerializer,
    ProformaItemSerializer, ProformaItemDetalladoSerializer,
    ProformaHistorialSerializer, SecuenciaProformaSerializer,
    ConfiguracionProformaSerializer
)
from basic.pagination import BasicStandardResultsSetPagination


class ProformaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar proformas o cotizaciones.
    
    Permite crear, ver, editar y eliminar proformas en el sistema.
    """
    queryset = Proforma.objects.all()
    serializer_class = ProformaSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cliente', 'empresa', 'tipo_contratacion', 'estado', 'tiene_orden']
    search_fields = ['numero', 'nombre', 'atencion_a', 'notas']
    ordering_fields = ['fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'created_at']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Determina qué serializer usar basado en la acción"""
        if self.action == 'retrieve':
            return ProformaDetalladoSerializer
        elif self.action == 'generar_reporte':
            return ProformaReporteSerializer
        return ProformaSerializer
    
    def perform_create(self, serializer):
        """Guardar proforma y crear registro en el historial"""
        proforma = serializer.save()
        # Crear registro en el historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion=ProformaHistorial.TipoAccion.CREACION,
            estado_anterior='',
            estado_nuevo=proforma.estado,
            created_by=self.request.user
        )
    
    def perform_update(self, serializer):
        """Guardar proforma actualizada y registrar el cambio"""
        proforma = self.get_object()
        estado_anterior = proforma.estado
        proforma_actualizada = serializer.save()
        
        # Si el estado cambió, registrar en el historial
        if estado_anterior != proforma_actualizada.estado:
            ProformaHistorial.objects.create(
                proforma=proforma_actualizada,
                accion=ProformaHistorial.TipoAccion.MODIFICACION,
                estado_anterior=estado_anterior,
                estado_nuevo=proforma_actualizada.estado,
                created_by=self.request.user
            )
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas por estado",
        manual_parameters=[
            openapi.Parameter(
                'estado', openapi.IN_QUERY,
                description="Estado de la proforma (borrador, enviada, aprobada, rechazada, vencida, convertida)",
                type=openapi.TYPE_STRING,
                required=True
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            400: "Parámetro estado inválido",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        """
        Devuelve las proformas filtradas por estado.
        Requiere el parámetro estado en la URL.
        """
        estado = request.query_params.get('estado', None)
        estados_validos = [choice[0] for choice in Proforma.EstadoProforma.choices]
        
        if estado and estado in estados_validos:
            proformas = Proforma.objects.filter(estado=estado)
            page = self.paginate_queryset(proformas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(proformas, many=True)
            return Response(serializer.data)
        return Response(
            {"error": f"Estado inválido. Valores permitidos: {', '.join(estados_validos)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas que vencen pronto",
        manual_parameters=[
            openapi.Parameter(
                'dias', openapi.IN_QUERY,
                description="Días hasta el vencimiento (default: 7)",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_vencer(self, request):
        """
        Devuelve las proformas que vencerán en un número específico de días.
        Por defecto, muestra las que vencen en los próximos 7 días.
        """
        dias = request.query_params.get('dias', 7)
        try:
            dias = int(dias)
        except ValueError:
            dias = 7
        
        fecha_limite = timezone.now().date() + timedelta(days=dias)
        hoy = timezone.now().date()
        
        proformas = Proforma.objects.filter(
            fecha_vencimiento__gte=hoy,
            fecha_vencimiento__lte=fecha_limite,
            estado__in=['borrador', 'enviada']  # Solo proformas activas
        )
        
        page = self.paginate_queryset(proformas)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(proformas, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas por cliente",
        manual_parameters=[
            openapi.Parameter(
                'cliente_id', openapi.IN_QUERY,
                description="ID del cliente",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            400: "Parámetro cliente_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """
        Devuelve las proformas asociadas a un cliente específico.
        Requiere el parámetro cliente_id en la URL.
        """
        cliente_id = request.query_params.get('cliente_id', None)
        if cliente_id:
            proformas = Proforma.objects.filter(cliente_id=cliente_id)
            page = self.paginate_queryset(proformas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(proformas, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro cliente_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Genera una copia de una proforma existente",
        responses={
            201: ProformaSerializer,
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['post'])
    def duplicar(self, request, pk=None):
        """
        Crea una copia de la proforma actual con un nuevo número.
        Todos los ítems son también copiados.
        """
        proforma_original = self.get_object()
        
        # Crear una copia de la proforma
        proforma_nueva = Proforma.objects.create(
            nombre=f"Copia de {proforma_original.nombre}",
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timedelta(days=30),
            cliente=proforma_original.cliente,
            empresa=proforma_original.empresa,
            tipo_contratacion=proforma_original.tipo_contratacion,
            atencion_a=proforma_original.atencion_a,
            condiciones_pago=proforma_original.condiciones_pago,
            tiempo_entrega=proforma_original.tiempo_entrega,
            porcentaje_impuesto=proforma_original.porcentaje_impuesto,
            notas=proforma_original.notas,
            estado=Proforma.EstadoProforma.BORRADOR,
            subtotal=0,
            impuesto=0,
            total=0
        )
        
        # Copiar los ítems de la proforma original
        for item_original in proforma_original.items.all():
            ProformaItem.objects.create(
                proforma=proforma_nueva,
                tipo_item=item_original.tipo_item,
                producto_ofertado=item_original.producto_ofertado,
                producto_disponible=item_original.producto_disponible,
                inventario=item_original.inventario,
                codigo=item_original.codigo,
                descripcion=item_original.descripcion,
                unidad=item_original.unidad,
                cantidad=item_original.cantidad,
                precio_unitario=item_original.precio_unitario,
                porcentaje_descuento=item_original.porcentaje_descuento,
                total=item_original.total,
                orden=item_original.orden
            )
        
        # Actualizar los totales
        proforma_nueva.save()
        
        # Registrar en el historial
        ProformaHistorial.objects.create(
            proforma=proforma_nueva,
            accion=ProformaHistorial.TipoAccion.CREACION,
            estado_anterior='',
            estado_nuevo=proforma_nueva.estado,
            notas=f"Duplicada de la proforma {proforma_original.numero}",
            created_by=request.user
        )
        
        serializer = ProformaSerializer(proforma_nueva)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Cambia el estado de una proforma",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['estado'],
            properties={
                'estado': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nuevo estado de la proforma"
                ),
                'notas': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Notas sobre el cambio de estado"
                ),
            }
        ),
        responses={
            200: ProformaSerializer,
            400: "Estado inválido",
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado de una proforma y registra el cambio en el historial.
        Requiere el parámetro estado en el cuerpo de la solicitud.
        """
        proforma = self.get_object()
        estado = request.data.get('estado', None)
        notas = request.data.get('notas', '')
        estados_validos = [choice[0] for choice in Proforma.EstadoProforma.choices]
        
        if estado and estado in estados_validos:
            estado_anterior = proforma.estado
            proforma.estado = estado
            
            # Lógica adicional según el estado
            if estado == Proforma.EstadoProforma.ENVIADA:
                pass  # Lógica para proformas enviadas
            elif estado == Proforma.EstadoProforma.APROBADA:
                pass  # Lógica para proformas aprobadas
            elif estado == Proforma.EstadoProforma.CONVERTIDA:
                proforma.tiene_orden = True
            
            proforma.save()
            
            # Registrar en el historial
            tipo_accion = None
            if estado == Proforma.EstadoProforma.ENVIADA:
                tipo_accion = ProformaHistorial.TipoAccion.ENVIO
            elif estado == Proforma.EstadoProforma.APROBADA:
                tipo_accion = ProformaHistorial.TipoAccion.APROBACION
            elif estado == Proforma.EstadoProforma.RECHAZADA:
                tipo_accion = ProformaHistorial.TipoAccion.RECHAZO
            elif estado == Proforma.EstadoProforma.VENCIDA:
                tipo_accion = ProformaHistorial.TipoAccion.VENCIMIENTO
            elif estado == Proforma.EstadoProforma.CONVERTIDA:
                tipo_accion = ProformaHistorial.TipoAccion.CONVERSION
            else:
                tipo_accion = ProformaHistorial.TipoAccion.MODIFICACION
            
            ProformaHistorial.objects.create(
                proforma=proforma,
                accion=tipo_accion,
                estado_anterior=estado_anterior,
                estado_nuevo=estado,
                notas=notas,
                created_by=request.user
            )
            
            serializer = ProformaSerializer(proforma)
            return Response(serializer.data)
        return Response(
            {"error": f"Estado inválido. Valores permitidos: {', '.join(estados_validos)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @swagger_auto_schema(
        operation_description="Obtiene el reporte completo de una proforma",
        responses={
            200: ProformaReporteSerializer,
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['get'])
    def generar_reporte(self, request, pk=None):
        """
        Devuelve todos los datos necesarios para generar un reporte o PDF de la proforma.
        """
        proforma = self.get_object()
        serializer = ProformaReporteSerializer(proforma)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene un resumen de las proformas por estado",
        responses={
            200: "Resumen con conteo por estado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def resumen_estados(self, request):
        """
        Devuelve un conteo de proformas agrupadas por estado.
        """
        # Obtener el conteo por estado
        conteo = Proforma.objects.values('estado').annotate(
            total=Count('id')
        ).order_by('estado')
        
        # Construir el resumen con nombres de estado legibles
        resumen = {}
        for item in conteo:
            estado_display = dict(Proforma.EstadoProforma.choices).get(item['estado'], item['estado'])
            resumen[estado_display] = item['total']
        
        # Añadir el total general
        resumen['Total'] = Proforma.objects.count()
        
        return Response(resumen)


class ProformaItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar los ítems de las proformas.
    
    Permite crear, ver, editar y eliminar ítems en las proformas.
    """
    queryset = ProformaItem.objects.all()
    serializer_class = ProformaItemSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['proforma', 'tipo_item', 'producto_ofertado', 'producto_disponible', 'inventario']
    search_fields = ['codigo', 'descripcion']
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Determina qué serializer usar basado en la acción"""
        if self.action == 'retrieve':
            return ProformaItemDetalladoSerializer
        return ProformaItemSerializer
    
    def perform_create(self, serializer):
        """Guardar ítem y actualizar la proforma relacionada"""
        item = serializer.save()
        # Actualizar totales de la proforma
        item.proforma.save()
    
    def perform_update(self, serializer):
        """Guardar ítem actualizado y actualizar la proforma"""
        item = serializer.save()
        # Actualizar totales de la proforma
        item.proforma.save()
    
    def perform_destroy(self, instance):
        """Eliminar ítem y actualizar la proforma"""
        proforma = instance.proforma
        instance.delete()
        # Actualizar totales de la proforma
        proforma.save()
    
    @swagger_auto_schema(
        operation_description="Obtiene los ítems de una proforma específica",
        manual_parameters=[
            openapi.Parameter(
                'proforma_id', openapi.IN_QUERY,
                description="ID de la proforma",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaItemSerializer(many=True),
            400: "Parámetro proforma_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_proforma(self, request):
        """
        Devuelve los ítems asociados a una proforma específica.
        Requiere el parámetro proforma_id en la URL.
        """
        proforma_id = request.query_params.get('proforma_id', None)
        if proforma_id:
            items = ProformaItem.objects.filter(proforma_id=proforma_id).order_by('orden')
            page = self.paginate_queryset(items)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proforma_id"}, status=status.HTTP_400_BAD_REQUEST)


class ProformaHistorialViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar el historial de proformas.
    Solo permite operaciones de lectura.
    """
    queryset = ProformaHistorial.objects.all()
    serializer_class = ProformaHistorialSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'accion', 'created_by']
    ordering_fields = ['created_at']
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de una proforma específica",
        manual_parameters=[
            openapi.Parameter(
                'proforma_id', openapi.IN_QUERY,
                description="ID de la proforma",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaHistorialSerializer(many=True),
            400: "Parámetro proforma_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_proforma(self, request):
        """
        Devuelve el historial de una proforma específica.
        Requiere el parámetro proforma_id en la URL.
        """
        proforma_id = request.query_params.get('proforma_id', None)
        if proforma_id:
            historial = ProformaHistorial.objects.filter(proforma_id=proforma_id).order_by('-created_at')
            page = self.paginate_queryset(historial)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(historial, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proforma_id"}, status=status.HTTP_400_BAD_REQUEST)


class SecuenciaProformaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar las secuencias de numeración de proformas.
    Solo permite operaciones de lectura.
    """
    queryset = SecuenciaProforma.objects.all()
    serializer_class = SecuenciaProformaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ConfiguracionProformaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar la configuración global de proformas.
    """
    queryset = ConfiguracionProforma.objects.all()
    serializer_class = ConfiguracionProformaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def actual(self, request):
        """
        Devuelve la configuración activa de proformas.
        Si no existe ninguna, crea una configuración predeterminada.
        """
        config = ConfiguracionProforma.get_active_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Sum
from django.utils import timezone
from django.db import transaction
from .models import Brief, BriefItem, BriefHistory
from .serializers import (
    BriefListSerializer,
    BriefDetailSerializer,
    BriefCreateUpdateSerializer,
    BriefItemSerializer,
    BriefHistorySerializer
)


class BriefViewSet(viewsets.ModelViewSet):
    queryset = Brief.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'title', 'description', 'client__nombre']
    ordering_fields = ['fecha_emision', 'priority', 'estado', 'due_date']
    ordering = ['-fecha_emision']
    filterset_fields = ['estado', 'priority', 'client', 'operador', 'origin', 'destino']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BriefListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BriefCreateUpdateSerializer
        return BriefDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('client', 'operador', 'created_by')
        queryset = queryset.prefetch_related('items', 'history')
        
        # Filtros adicionales
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        my_briefs = self.request.query_params.get('my_briefs')
        active_only = self.request.query_params.get('active_only')
        
        if fecha_desde:
            queryset = queryset.filter(fecha_emision__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_emision__lte=fecha_hasta)
        if my_briefs:
            queryset = queryset.filter(
                Q(created_by=self.request.user) | Q(operador=self.request.user)
            )
        if active_only:
            queryset = queryset.exclude(estado__in=['completed', 'cancelled'])
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """Obtener las opciones disponibles para los campos choice"""
        return Response({
            'origin': [{'value': k, 'label': v} for k, v in Brief.BriefOrigin.choices],
            'priority': [{'value': k, 'label': v} for k, v in Brief.BriefPriority.choices],
            'forma_pago': [{'value': k, 'label': v} for k, v in Brief.BriefFormaPago.choices],
            'destino': [{'value': k, 'label': v} for k, v in Brief.BriefDestino.choices],
            'status': [{'value': k, 'label': v} for k, v in Brief.BriefStatus.choices],
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de briefs"""
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        stats = {
            'total': queryset.count(),
            'by_status': {},
            'by_priority': {},
            'by_origin': {},
            'vencidos': 0,
            'sin_presupuesto': 0,
            'total_presupuesto': 0
        }
        
        # Por estado
        for estado, _ in Brief.BriefStatus.choices:
            stats['by_status'][estado] = queryset.filter(estado=estado).count()
            
        # Por prioridad
        for priority, _ in Brief.BriefPriority.choices:
            stats['by_priority'][priority] = queryset.filter(priority=priority).count()
            
        # Por origen
        for origin, _ in Brief.BriefOrigin.choices:
            stats['by_origin'][origin] = queryset.filter(origin=origin).count()
            
        # Briefs vencidos
        stats['vencidos'] = queryset.filter(
            due_date__lt=timezone.now(),
            estado__in=['draft', 'pending', 'approved', 'processing']
        ).count()
        
        # Sin presupuesto
        stats['sin_presupuesto'] = queryset.filter(
            Q(presupuesto__isnull=True) | Q(presupuesto=0)
        ).count()
        
        # Total presupuesto
        total = queryset.aggregate(total=Sum('presupuesto'))['total']
        stats['total_presupuesto'] = float(total) if total else 0
            
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Cambiar el estado de un brief"""
        brief = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        
        if new_status not in dict(Brief.BriefStatus.choices):
            return Response(
                {'error': 'Estado inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = brief.estado
        
        # Guardar historial
        BriefHistory.objects.create(
            brief=brief,
            changed_by=request.user,
            field_changed='estado',
            old_value=old_status,
            new_value=new_status,
            change_reason=reason
        )
        
        brief.estado = new_status
        brief.save()
        
        serializer = self.get_serializer(brief)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicar un brief"""
        original = self.get_object()
        
        with transaction.atomic():
            # Crear copia del brief
            new_brief = Brief.objects.create(
                title=f"Copia de {original.title}",
                client=original.client,
                origin=original.origin,
                description=original.description,
                priority=original.priority,
                presupuesto=original.presupuesto,
                tiempo_entrega=original.tiempo_entrega,
                forma_pago=original.forma_pago,
                destino=original.destino,
                estado='draft',
                operador=request.user,
                created_by=request.user,
                observaciones_internas=original.observaciones_internas
            )
            
            # Copiar items
            for item in original.items.all():
                BriefItem.objects.create(
                    brief=new_brief,
                    product=item.product,
                    product_reference=item.product_reference,
                    quantity=item.quantity,
                    unit=item.unit,
                    specifications=item.specifications,
                    notes=item.notes,
                    precio_estimado=item.precio_estimado,
                    orden=item.orden
                )
        
        serializer = BriefDetailSerializer(new_brief)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Obtener el historial de un brief"""
        brief = self.get_object()
        history = brief.history.all().order_by('-change_date')
        serializer = BriefHistorySerializer(history, many=True)
        return Response(serializer.data)


class BriefItemViewSet(viewsets.ModelViewSet):
    queryset = BriefItem.objects.all()
    serializer_class = BriefItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['brief', 'unit']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        brief_id = self.request.query_params.get('brief')
        
        if brief_id:
            queryset = queryset.filter(brief_id=brief_id)
            
        return queryset.select_related('brief', 'unit', 'product_reference')
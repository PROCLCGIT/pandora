import django_filters
from django.db.models import Q
from .models import Brief, BriefItem

class BriefFilter(django_filters.FilterSet):
    # Filtros básicos
    code = django_filters.CharFilter(lookup_expr='icontains')
    title = django_filters.CharFilter(lookup_expr='icontains')
    client = django_filters.CharFilter(field_name='client__nombre', lookup_expr='icontains')
    
    # Filtros de fecha
    fecha_desde = django_filters.DateFilter(field_name='fecha_emision', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha_emision', lookup_expr='lte')
    due_date_desde = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_hasta = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    
    # Filtros múltiples
    priority = django_filters.MultipleChoiceFilter(
        field_name='priority',
        choices=Brief._meta.get_field('priority').choices
    )
    estado = django_filters.MultipleChoiceFilter(
        field_name='estado',
        choices=Brief._meta.get_field('estado').choices
    )
    origin = django_filters.MultipleChoiceFilter(
        field_name='origin',
        choices=Brief._meta.get_field('origin').choices
    )
    destino = django_filters.MultipleChoiceFilter(
        field_name='destino',
        choices=Brief._meta.get_field('destino').choices
    )
    
    # Filtros de rango
    presupuesto_min = django_filters.NumberFilter(field_name='presupuesto', lookup_expr='gte')
    presupuesto_max = django_filters.NumberFilter(field_name='presupuesto', lookup_expr='lte')
    tiempo_entrega_min = django_filters.NumberFilter(field_name='tiempo_entrega', lookup_expr='gte')
    tiempo_entrega_max = django_filters.NumberFilter(field_name='tiempo_entrega', lookup_expr='lte')
    
    # Filtro de operador
    operador = django_filters.CharFilter(field_name='operador__username', lookup_expr='icontains')
    created_by = django_filters.CharFilter(field_name='created_by__username', lookup_expr='icontains')
    
    # Búsqueda general
    search = django_filters.CharFilter(method='filter_search')
    
    # Filtros de estado especiales
    vencidos = django_filters.BooleanFilter(method='filter_vencidos')
    sin_presupuesto = django_filters.BooleanFilter(method='filter_sin_presupuesto')
    prioritarios = django_filters.BooleanFilter(method='filter_prioritarios')
    
    class Meta:
        model = Brief
        fields = [
            'code', 'title', 'client', 'priority', 'estado', 'origin',
            'destino', 'operador', 'created_by'
        ]
    
    def filter_search(self, queryset, name, value):
        """Búsqueda general en múltiples campos"""
        return queryset.filter(
            Q(code__icontains=value) |
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(client__nombre__icontains=value) |
            Q(operador__username__icontains=value) |
            Q(items__product__icontains=value)
        ).distinct()
    
    def filter_vencidos(self, queryset, name, value):
        """Filtrar briefs vencidos"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now(),
                estado__in=['draft', 'pending', 'approved', 'processing']
            )
        return queryset
    
    def filter_sin_presupuesto(self, queryset, name, value):
        """Filtrar briefs sin presupuesto"""
        if value:
            return queryset.filter(Q(presupuesto__isnull=True) | Q(presupuesto=0))
        return queryset
    
    def filter_prioritarios(self, queryset, name, value):
        """Filtrar briefs prioritarios"""
        if value:
            return queryset.filter(priority__in=['alta', 'urgente', 'critica'])
        return queryset

class BriefItemFilter(django_filters.FilterSet):
    brief = django_filters.UUIDFilter(field_name='brief__id')
    product = django_filters.CharFilter(lookup_expr='icontains')
    quantity_min = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    quantity_max = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    
    class Meta:
        model = BriefItem
        fields = ['brief', 'product', 'unit']
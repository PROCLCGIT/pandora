from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import NombreEntidad, DatosInstitucionales
from .serializers import (
    NombreEntidadSerializer, 
    DatosInstitucionalesSerializer,
    DatosInstitucionalesCreateUpdateSerializer
)

class NombreEntidadViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar CRUD de nombres de entidades
    """
    queryset = NombreEntidad.objects.all()
    serializer_class = NombreEntidadSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['codigo', 'nombre', 'descripcion']
    ordering_fields = ['codigo', 'nombre', 'created_at']
    ordering = ['nombre']

    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Endpoint para obtener solo entidades activas"""
        queryset = self.get_queryset().filter(activo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DatosInstitucionalesViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar CRUD de datos institucionales
    """
    queryset = DatosInstitucionales.objects.select_related('nombre_entidad').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['nombre_entidad', 'activo']
    search_fields = ['ruc', 'usuario', 'correo', 'representante', 'nombre_entidad__nombre']
    ordering_fields = ['ruc', 'usuario', 'created_at', 'fecha_ultima_actualizacion']
    ordering = ['nombre_entidad__nombre', 'ruc']

    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return DatosInstitucionalesCreateUpdateSerializer
        return DatosInstitucionalesSerializer

    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Endpoint para obtener solo datos institucionales activos"""
        queryset = self.get_queryset().filter(activo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_entidad(self, request):
        """Endpoint para obtener datos por tipo de entidad"""
        entidad_id = request.query_params.get('entidad_id')
        if not entidad_id:
            return Response({'error': 'Se requiere entidad_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(nombre_entidad_id=entidad_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def verificar_contrasena(self, request, pk=None):
        """Endpoint para verificar contraseña"""
        datos = self.get_object()
        contrasena = request.data.get('contrasena')
        
        if not contrasena:
            return Response({'error': 'Se requiere contraseña'}, status=status.HTTP_400_BAD_REQUEST)
        
        es_valida = datos.verificar_contrasena(contrasena)
        return Response({'valida': es_valida})

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Endpoint para obtener estadísticas generales"""
        total = self.get_queryset().count()
        activos = self.get_queryset().filter(activo=True).count()
        inactivos = total - activos
        
        # Estadísticas por tipo de entidad
        por_entidad = {}
        for entidad in NombreEntidad.objects.filter(activo=True):
            count = self.get_queryset().filter(nombre_entidad=entidad).count()
            por_entidad[entidad.nombre] = count
        
        return Response({
            'total': total,
            'activos': activos,
            'inactivos': inactivos,
            'por_entidad': por_entidad
        })
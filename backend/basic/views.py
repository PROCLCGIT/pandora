# backend/basic/views.py

from rest_framework import viewsets, filters, status, permissions, throttling
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Categoria, Ciudad, EmpresaClc, Especialidad, Marca, 
    Procedencia, TipoCliente, TipoContratacion, Unidad, Zona, ZonaCiudad
)
from .serializers import (
    CategoriaSerializer, CiudadSerializer, EmpresaClcSerializer, 
    EspecialidadSerializer, MarcaSerializer, ProcedenciaSerializer,
    TipoClienteSerializer, TipoContratacionSerializer, UnidadSerializer,
    ZonaSerializer, ZonaCiudadSerializer, ZonaDetalleSerializer,
    CategoriaDetalleSerializer
)
from .pagination import BasicStandardResultsSetPagination


class BaseCrudViewSet(viewsets.ModelViewSet):
    """ViewSet base con funcionalidades comunes para todos los modelos"""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    pagination_class = BasicStandardResultsSetPagination
    # Usar la clase de permisos estándar de DRF
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [
        throttling.UserRateThrottle,
        throttling.AnonRateThrottle,
    ]
    

class CategoriaViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Categoria"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    filterset_fields = ['nombre', 'code', 'parent', 'level', 'is_active']
    search_fields = ['nombre', 'code', 'path']
    ordering_fields = ['nombre', 'code', 'level', 'path']
    permission_classes = [permissions.IsAuthenticated]  # Requerir autenticación
    
    @action(detail=True, methods=['get'])
    def hijos(self, request, pk=None):
        """Obtener las categorías hijas de una categoría específica"""
        categoria = self.get_object()
        serializer = CategoriaDetalleSerializer(categoria)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def raices(self, request):
        """Obtener solo las categorías raíz (sin padre)"""
        categorias = Categoria.objects.filter(parent=None)
        serializer = self.get_serializer(categorias, many=True)
        return Response(serializer.data)


class CiudadViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Ciudad"""
    queryset = Ciudad.objects.all()
    serializer_class = CiudadSerializer
    filterset_fields = ['nombre', 'provincia', 'code']
    search_fields = ['nombre', 'provincia', 'code']
    ordering_fields = ['nombre', 'provincia']


class EmpresaClcViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de EmpresaClc"""
    queryset = EmpresaClc.objects.all()
    serializer_class = EmpresaClcSerializer
    filterset_fields = ['nombre', 'razon_social', 'code', 'ruc']
    search_fields = ['nombre', 'razon_social', 'code', 'ruc', 'direccion']
    ordering_fields = ['nombre', 'razon_social']


class EspecialidadViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Especialidad"""
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre']


class MarcaViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Marca"""
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    filterset_fields = ['nombre', 'code', 'is_active', 'country_origin']
    search_fields = ['nombre', 'code', 'description', 'proveedores']
    ordering_fields = ['nombre', 'country_origin']


class ProcedenciaViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Procedencia"""
    queryset = Procedencia.objects.all()
    serializer_class = ProcedenciaSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre']


class TipoClienteViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de TipoCliente"""
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre']


class TipoContratacionViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de TipoContratacion"""
    queryset = TipoContratacion.objects.all()
    serializer_class = TipoContratacionSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre']


class UnidadViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Unidad"""
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre']


class ZonaViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de Zona"""
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer
    filterset_fields = ['nombre', 'code']
    search_fields = ['nombre', 'code', 'cobertura']
    ordering_fields = ['nombre']
    
    @action(detail=True, methods=['get'])
    def ciudades(self, request, pk=None):
        """Obtener los detalles de una zona con sus ciudades relacionadas"""
        zona = self.get_object()
        serializer = ZonaDetalleSerializer(zona)
        return Response(serializer.data)


class ZonaCiudadViewSet(BaseCrudViewSet):
    """ViewSet para operaciones CRUD de ZonaCiudad"""
    queryset = ZonaCiudad.objects.all()
    serializer_class = ZonaCiudadSerializer
    filterset_fields = ['zona', 'ciudad']
    ordering_fields = ['zona', 'ciudad']
    
    @action(detail=False, methods=['post'])
    def asignar_multiples(self, request):
        """Asignar múltiples ciudades a una zona en una sola operación"""
        zona_id = request.data.get('zona_id')
        ciudad_ids = request.data.get('ciudad_ids', [])
        
        try:
            zona = Zona.objects.get(id=zona_id)
        except Zona.DoesNotExist:
            return Response(
                {'error': 'Zona no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        resultados = []
        for ciudad_id in ciudad_ids:
            try:
                ciudad = Ciudad.objects.get(id=ciudad_id)
                # Crear relación si no existe
                zona_ciudad, created = ZonaCiudad.objects.get_or_create(
                    zona=zona,
                    ciudad=ciudad
                )
                resultados.append({
                    'ciudad_id': ciudad_id,
                    'creado': created
                })
            except Ciudad.DoesNotExist:
                resultados.append({
                    'ciudad_id': ciudad_id,
                    'error': 'Ciudad no encontrada'
                })
        
        return Response(
            {
                'zona_id': zona_id,
                'resultados': resultados
            },
            status=status.HTTP_200_OK
        )
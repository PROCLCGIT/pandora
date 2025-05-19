# backend/directorio/views.py

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Cliente, Proveedor, Vendedor, Contacto, RelacionBlue
from .serializers import (
    ClienteSerializer, ClienteDetalladoSerializer,
    ProveedorSerializer, ProveedorDetalladoSerializer,
    VendedorSerializer,
    ContactoSerializer, ContactoDetalladoSerializer,
    RelacionBlueSerializer
)
from .pagination import StandardResultsSetPagination, LargeResultsSetPagination, CustomLimitOffsetPagination
# Utilizamos los permisos estándar de DRF en lugar de redefiniciones personalizadas
from .throttling import BurstRateThrottle, SustainedRateThrottle, UserBurstRateThrottle, UserSustainedRateThrottle

class ClienteViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar clientes.
    
    Permite crear, ver, editar y eliminar clientes en el sistema.
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['zona', 'ciudad', 'tipo_cliente', 'activo']
    search_fields = ['nombre', 'alias', 'razon_social', 'ruc', 'email']
    ordering_fields = ['nombre', 'created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserBurstRateThrottle, UserSustainedRateThrottle]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClienteDetalladoSerializer
        return ClienteSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de clientes activos",
        responses={
            200: ClienteSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los clientes activos.
        """
        clientes = Cliente.objects.filter(activo=True)
        page = self.paginate_queryset(clientes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(clientes, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los contactos asociados a un cliente específico",
        responses={
            200: ContactoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Cliente no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def contactos(self, request, pk=None):
        """
        Devuelve los contactos asociados a un cliente específico.
        """
        cliente = self.get_object()
        relaciones = RelacionBlue.objects.filter(cliente=cliente)
        contactos = [relacion.contacto for relacion in relaciones]
        page = self.paginate_queryset(contactos)
        if page is not None:
            serializer = ContactoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ContactoSerializer(contactos, many=True)
        return Response(serializer.data)

class ProveedorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar proveedores.
    
    Permite crear, ver, editar y eliminar proveedores en el sistema.
    """
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ciudad', 'tipo_primario', 'activo']
    search_fields = ['nombre', 'razon_social', 'ruc', 'correo']
    ordering_fields = ['nombre', 'created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserBurstRateThrottle, UserSustainedRateThrottle]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProveedorDetalladoSerializer
        return ProveedorSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de proveedores activos",
        responses={
            200: ProveedorSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los proveedores activos.
        """
        proveedores = Proveedor.objects.filter(activo=True)
        page = self.paginate_queryset(proveedores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(proveedores, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de proveedores primarios activos",
        responses={
            200: ProveedorSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def primarios(self, request):
        """
        Devuelve solo los proveedores primarios y activos.
        """
        proveedores = Proveedor.objects.filter(tipo_primario=True, activo=True)
        page = self.paginate_queryset(proveedores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(proveedores, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los vendedores asociados a un proveedor específico",
        responses={
            200: VendedorSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proveedor no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def vendedores(self, request, pk=None):
        """
        Devuelve los vendedores asociados a un proveedor específico.
        """
        proveedor = self.get_object()
        vendedores = Vendedor.objects.filter(proveedor=proveedor)
        page = self.paginate_queryset(vendedores)
        if page is not None:
            serializer = VendedorSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VendedorSerializer(vendedores, many=True)
        return Response(serializer.data)

class VendedorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar vendedores.
    
    Permite crear, ver, editar y eliminar vendedores en el sistema.
    """
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['proveedor', 'activo']
    search_fields = ['nombre', 'correo', 'telefono']
    ordering_fields = ['nombre', 'created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserBurstRateThrottle, UserSustainedRateThrottle]
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de vendedores activos",
        responses={
            200: VendedorSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los vendedores activos.
        """
        vendedores = Vendedor.objects.filter(activo=True)
        page = self.paginate_queryset(vendedores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(vendedores, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los vendedores asociados a un proveedor específico",
        manual_parameters=[
            openapi.Parameter(
                'proveedor_id', openapi.IN_QUERY,
                description="ID del proveedor",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: VendedorSerializer(many=True),
            400: "Parámetro proveedor_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_proveedor(self, request):
        """
        Devuelve los vendedores asociados a un proveedor específico.
        Requiere el parámetro proveedor_id en la URL.
        """
        proveedor_id = request.query_params.get('proveedor_id', None)
        if proveedor_id:
            vendedores = Vendedor.objects.filter(proveedor_id=proveedor_id, activo=True)
            page = self.paginate_queryset(vendedores)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(vendedores, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proveedor_id"}, status=status.HTTP_400_BAD_REQUEST)

class ContactoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar contactos.
    
    Permite crear, ver, editar y eliminar contactos en el sistema.
    """
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'alias', 'email', 'telefono', 'ingerencia']
    ordering_fields = ['nombre', 'created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserBurstRateThrottle, UserSustainedRateThrottle]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContactoDetalladoSerializer
        return ContactoSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene los clientes asociados a un contacto específico",
        responses={
            200: ClienteSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Contacto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def clientes(self, request, pk=None):
        """
        Devuelve los clientes asociados a un contacto específico.
        """
        contacto = self.get_object()
        relaciones = RelacionBlue.objects.filter(contacto=contacto)
        clientes = [relacion.cliente for relacion in relaciones]
        page = self.paginate_queryset(clientes)
        if page is not None:
            serializer = ClienteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data)

class RelacionBlueViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar relaciones entre clientes y contactos.
    
    Permite crear, ver, editar y eliminar relaciones en el sistema.
    """
    queryset = RelacionBlue.objects.all()
    serializer_class = RelacionBlueSerializer
    pagination_class = CustomLimitOffsetPagination  # Usando paginación de tipo límite/offset
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cliente', 'contacto', 'nivel']
    ordering_fields = ['nivel', 'created_at', 'updated_at']
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserBurstRateThrottle, UserSustainedRateThrottle]
    
    @swagger_auto_schema(
        operation_description="Obtiene las relaciones asociadas a un cliente específico",
        manual_parameters=[
            openapi.Parameter(
                'cliente_id', openapi.IN_QUERY,
                description="ID del cliente",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: RelacionBlueSerializer(many=True),
            400: "Parámetro cliente_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """
        Devuelve las relaciones asociadas a un cliente específico.
        Requiere el parámetro cliente_id en la URL.
        """
        cliente_id = request.query_params.get('cliente_id', None)
        if cliente_id:
            relaciones = RelacionBlue.objects.filter(cliente_id=cliente_id)
            page = self.paginate_queryset(relaciones)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(relaciones, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro cliente_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Obtiene las relaciones asociadas a un contacto específico",
        manual_parameters=[
            openapi.Parameter(
                'contacto_id', openapi.IN_QUERY,
                description="ID del contacto",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: RelacionBlueSerializer(many=True),
            400: "Parámetro contacto_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_contacto(self, request):
        """
        Devuelve las relaciones asociadas a un contacto específico.
        Requiere el parámetro contacto_id en la URL.
        """
        contacto_id = request.query_params.get('contacto_id', None)
        if contacto_id:
            relaciones = RelacionBlue.objects.filter(contacto_id=contacto_id)
            page = self.paginate_queryset(relaciones)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(relaciones, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro contacto_id"}, status=status.HTTP_400_BAD_REQUEST)
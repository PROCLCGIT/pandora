"""
Vistas para la API de usuarios.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestión de usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser]  # Para manejar carga de imágenes
    
    def get_permissions(self):
        """
        Permisos específicos según la acción:
        - Para crear usuarios: No requiere autenticación (si se desea permitir registro público)
        - Para el resto de operaciones: Requiere ser administrador
        - Para perfil (me, update_profile, change_password): Requiere estar autenticado
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['me', 'update_profile', 'change_password']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción.
        """
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'me' or self.action == 'update_profile':
            return UserProfileSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        Endpoint para obtener los datos del usuario autenticado.
        """
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        """
        Endpoint para actualizar el perfil del usuario autenticado.
        """
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        Endpoint para cambiar la contraseña del usuario autenticado.
        """
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            # Verificar la contraseña actual
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Contraseña incorrecta']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Establecer la nueva contraseña
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Contraseña actualizada correctamente'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def activate(self, request, pk=None):
        """
        Endpoint para activar/desactivar un usuario.
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'status': 'user status updated'})
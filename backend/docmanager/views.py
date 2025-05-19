from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count, F
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from rest_framework.decorators import api_view
import uuid
import zipfile
import io
import os
from .models import (
    Category, Tag, Document, DocumentVersion, DocumentTag, 
    DocumentActivity, DocumentPermission, DocumentComment,
    Collection, CollectionDocument, CollectionPermission, CollectionActivity,
    Group, GroupMember
)
from .serializers import (
    # Serializadores de categorías
    CategorySerializer, CategoryDetalladoSerializer,
    # Serializadores de etiquetas
    TagSerializer, TagDetalladoSerializer,
    # Serializadores de documentos
    DocumentListSerializer, DocumentDetailSerializer, DocumentCreateSerializer,
    DocumentVersionSerializer, DocumentCommentSerializer, DocumentPermissionSerializer,
    DocumentActivitySerializer, DocumentTagSerializer,
    # Serializadores de colecciones
    CollectionListSerializer, CollectionDetailSerializer, CollectionCreateSerializer,
    CollectionDocumentSerializer, CollectionPermissionSerializer, CollectionActivitySerializer,
    # Serializadores de grupos
    GroupSerializer, GroupDetalladoSerializer, GroupCreateSerializer, GroupMemberSerializer
)
from .pagination import (
    StandardResultsSetPagination, SmallResultsSetPagination, LargeResultsSetPagination
)
from .throttling import (
    # Throttling para usuarios autenticados
    CategoryRateThrottle, TagRateThrottle, DocumentRateThrottle,
    GroupRateThrottle, CollectionRateThrottle,
    # Throttling para usuarios anónimos
    CategoryAnonRateThrottle, TagAnonRateThrottle, DocumentAnonRateThrottle,
    GroupAnonRateThrottle, CollectionAnonRateThrottle
)


@api_view(['GET'])
@permission_classes([AllowAny])
def debug_auth(request):
    """Endpoint de debug para verificar autenticación"""
    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "username": request.user.username,
            "user_id": request.user.id,
            "is_staff": request.user.is_staff,
            "auth_header": request.headers.get('Authorization', None),
        })
    else:
        return Response({
            "authenticated": False,
            "auth_header": request.headers.get('Authorization', None),
        })


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar categorías de documentos.
    
    list:
        Devuelve una lista paginada de todas las categorías.
        
    retrieve:
        Devuelve una categoría específica con información detallada.
        
    create:
        Crea una nueva categoría.
        
    update:
        Actualiza una categoría existente.
        
    partial_update:
        Actualiza parcialmente una categoría existente.
        
    destroy:
        Elimina una categoría existente.
    """
    queryset = Category.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Selecciona el serializador adecuado según la acción"""
        if self.action == 'retrieve':
            return CategoryDetalladoSerializer
        return CategorySerializer
    
    def get_permissions(self):
        """
        Permitir acceso público a la lista y detalle de categorías para depuración
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_throttles(self):
        """Aplicar throttling basado en si el usuario está autenticado o no"""
        if self.request.user.is_authenticated:
            return [CategoryRateThrottle()]
        return [CategoryAnonRateThrottle()]


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar etiquetas de documentos.
    
    list:
        Devuelve una lista paginada de todas las etiquetas.
        
    retrieve:
        Devuelve una etiqueta específica con información detallada.
        
    create:
        Crea una nueva etiqueta.
        
    update:
        Actualiza una etiqueta existente.
        
    partial_update:
        Actualiza parcialmente una etiqueta existente.
        
    destroy:
        Elimina una etiqueta existente.
    """
    queryset = Tag.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Selecciona el serializador adecuado según la acción"""
        if self.action == 'retrieve':
            return TagDetalladoSerializer
        return TagSerializer
    
    def get_permissions(self):
        """
        Permitir acceso público a la lista y detalle de etiquetas para depuración
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_throttles(self):
        """Aplicar throttling basado en si el usuario está autenticado o no"""
        if self.request.user.is_authenticated:
            return [TagRateThrottle()]
        return [TagAnonRateThrottle()]


class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar documentos.
    
    list:
        Devuelve una lista paginada de documentos filtrados.
        
    retrieve:
        Devuelve un documento específico con toda su información.
        
    create:
        Crea un nuevo documento.
        
    update:
        Actualiza un documento existente.
        
    partial_update:
        Actualiza parcialmente un documento existente.
        
    destroy:
        Elimina un documento existente (borrado físico).
        
    soft_delete:
        Elimina lógicamente un documento.
        
    restore:
        Restaura un documento eliminado lógicamente.
        
    toggle_favorite:
        Marca/desmarca un documento como favorito.
        
    download:
        Descarga un documento.
        
    public_download:
        Obtiene la URL de descarga pública de un documento.
        
    versions:
        Obtiene todas las versiones de un documento.
        
    add_version:
        Añade una nueva versión a un documento.
        
    comments:
        Obtiene los comentarios de un documento.
        
    add_comment:
        Añade un comentario a un documento.
        
    add_tags:
        Añade etiquetas a un documento.
        
    remove_tag:
        Elimina una etiqueta de un documento.
        
    activities:
        Obtiene el historial de actividades de un documento.
        
    file_types:
        Obtiene los tipos de archivos disponibles para filtrado.
    """
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'file_name', 'tags__name']
    ordering_fields = ['title', 'created_at', 'updated_at', 'file_size']
    ordering = ['-updated_at']
    
    def get_permissions(self):
        """Permisos basados en la acción"""
        if self.action in ['list', 'public_download', 'retrieve', 'file_types']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_throttles(self):
        """Throttling basado en autenticación"""
        if self.request.user.is_authenticated:
            return [DocumentRateThrottle()]
        return [DocumentAnonRateThrottle()]
    
    def get_queryset(self):
        """Filtrar documentos según parámetros y estado de eliminación"""
        queryset = Document.objects.filter(is_deleted=False)
        
        # Filtrado por categoría
        category_id = self.request.query_params.get('category', None)
        if category_id and category_id != 'all':
            queryset = queryset.filter(category_id=category_id)
        
        # Filtrado por etiquetas
        tag_id = self.request.query_params.get('tag', None)
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        
        # Filtrado por favoritos
        is_favorite = self.request.query_params.get('favorite', None)
        if is_favorite and is_favorite.lower() == 'true':
            queryset = queryset.filter(is_favorite=True)
            
        # Filtrado por tipo de archivo
        file_type = self.request.query_params.get('file_type', None)
        if file_type:
            queryset = queryset.filter(file_type=file_type)
            
        # Filtrado por grupo
        group_id = self.request.query_params.get('group', None)
        if group_id:
            queryset = queryset.filter(group_id=group_id)
            
        # Búsqueda por texto
        query = self.request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(file_name__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct()
            
        return queryset
    
    def get_serializer_class(self):
        """Selecciona el serializador adecuado según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return DocumentCreateSerializer
        elif self.action == 'retrieve':
            return DocumentDetailSerializer
        return DocumentListSerializer
    
    def get_serializer_context(self):
        """Proporciona el contexto al serializador"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Asigna el usuario actual como uploader"""
        serializer.save(uploader=self.request.user)
        
    @action(detail=True, methods=['get'], url_path='public-download')
    def public_download(self, request, pk=None):
        """Endpoint público para obtener la URL de descarga sin autenticación"""
        document = self.get_object()
        
        # Registro opcional de actividad (comentado porque requiere usuario)
        # DocumentActivity.objects.create(
        #     document=document,
        #     user=request.user,
        #     activity_type='download',
        #     details="Documento descargado públicamente"
        # )
        
        # Devolver URL pública
        return Response({
            'success': True,
            'file_url': request.build_absolute_uri(document.file.url) if document.file else None,
            'file_name': document.file_name,
            'title': document.title,
            'id': document.id
        })
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Marca o desmarca un documento como favorito"""
        document = self.get_object()
        document.is_favorite = not document.is_favorite
        document.save()
        
        # Registrar actividad
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            activity_type='favorite' if document.is_favorite else 'unfavorite',
            details=f"Documento {'marcado como favorito' if document.is_favorite else 'desmarcado como favorito'}"
        )
        
        return Response({'is_favorite': document.is_favorite})
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Elimina un documento de forma lógica"""
        document = self.get_object()
        document.soft_delete()
        
        # Registrar actividad
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            activity_type='delete',
            details="Documento eliminado"
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaura un documento eliminado lógicamente"""
        document = self.get_object()
        document.restore()
        
        # Registrar actividad
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            activity_type='restore',
            details="Documento restaurado"
        )
        
        return Response(status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def add_tags(self, request, pk=None):
        """Añade etiquetas a un documento"""
        document = self.get_object()
        tag_ids = request.data.get('tags', [])
        
        tags_added = []
        for tag_id in tag_ids:
            tag = get_object_or_404(Tag, id=tag_id)
            doc_tag, created = DocumentTag.objects.get_or_create(document=document, tag=tag)
            if created:
                tags_added.append(tag.name)
        
        if tags_added:
            # Registrar actividad
            DocumentActivity.objects.create(
                document=document,
                user=request.user,
                activity_type='edit',
                details=f"Etiquetas añadidas: {', '.join(tags_added)}"
            )
        
        return Response({'added_tags': tags_added})
    
    @action(detail=True, methods=['post'])
    def remove_tag(self, request, pk=None):
        """Elimina una etiqueta de un documento"""
        document = self.get_object()
        tag_id = request.data.get('tag_id')
        
        if not tag_id:
            return Response({'error': 'Se requiere tag_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        doc_tag = get_object_or_404(DocumentTag, document=document, tag_id=tag_id)
        tag_name = doc_tag.tag.name
        doc_tag.delete()
        
        # Registrar actividad
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            activity_type='edit',
            details=f"Etiqueta eliminada: {tag_name}"
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Registra y facilita la descarga de un documento"""
        document = self.get_object()
        
        # Registrar actividad de descarga
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            activity_type='download',
            details="Documento descargado"
        )
        
        # Aquí normalmente enviarías el archivo para descargar
        # Pero como respuesta JSON, solo confirmamos la solicitud
        return Response({
            'success': True,
            'file_url': request.build_absolute_uri(document.file.url) if document.file else None,
            'file_name': document.file_name
        })
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Obtiene todas las versiones de un documento"""
        document = self.get_object()
        versions = document.versions.all()
        serializer = DocumentVersionSerializer(versions, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_version(self, request, pk=None):
        """Añade una nueva versión a un documento"""
        document = self.get_object()
        serializer = DocumentVersionSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(
                document=document,
                created_by=request.user
            )
            
            # Actualizar documento con la nueva versión
            if 'file' in request.data:
                document.file = request.data['file']
                document.save()
            
            # Registrar actividad
            DocumentActivity.objects.create(
                document=document,
                user=request.user,
                activity_type='version',
                details=f"Nueva versión añadida: {serializer.data['version_number']}"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Obtiene los comentarios de nivel superior de un documento"""
        document = self.get_object()
        # Solo obtenemos comentarios de nivel superior (no respuestas)
        comments = document.comments.filter(parent_comment=None)
        serializer = DocumentCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Añade un comentario a un documento"""
        document = self.get_object()
        serializer = DocumentCommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(
                document=document,
                user=request.user
            )
            
            # Registrar actividad
            DocumentActivity.objects.create(
                document=document,
                user=request.user,
                activity_type='comment',
                details="Nuevo comentario añadido"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Obtiene el historial de actividades de un documento"""
        document = self.get_object()
        activities = document.activities.all().order_by('-created_at')[:50]  # Limitar a las 50 actividades más recientes
        serializer = DocumentActivitySerializer(activities, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def file_types(self, request):
        """Retorna los tipos de archivo disponibles para filtrado"""
        types = Document.objects.filter(is_deleted=False).values_list('file_type', flat=True).distinct()
        return Response(list(types))


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar grupos de documentos.
    
    list:
        Devuelve una lista paginada de grupos.
        
    retrieve:
        Devuelve un grupo específico con información detallada.
        
    create:
        Crea un nuevo grupo.
        
    update:
        Actualiza un grupo existente.
        
    partial_update:
        Actualiza parcialmente un grupo existente.
        
    destroy:
        Elimina un grupo existente.
        
    add_document:
        Añade un documento al grupo.
        
    remove_document:
        Quita un documento del grupo.
        
    documents:
        Obtiene los documentos de un grupo.
        
    members:
        Obtiene los miembros de un grupo.
        
    add_member:
        Añade un miembro al grupo.
        
    remove_member:
        Elimina un miembro del grupo.
    """
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_permissions(self):
        """Permisos basados en la acción"""
        if self.action in ['create', 'list', 'retrieve', 'documents']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_throttles(self):
        """Throttling basado en autenticación"""
        if self.request.user.is_authenticated:
            return [GroupRateThrottle()]
        return [GroupAnonRateThrottle()]
    
    def get_queryset(self):
        """Filtrado de grupos basado en usuario y parámetros"""
        if not self.request.user.is_authenticated:
            # Para pruebas, permitir ver todos los grupos
            return Group.objects.all()
        
        # Por defecto, mostrar grupos creados por el usuario y los que es miembro
        queryset = Group.objects.filter(
            Q(creator=self.request.user) | 
            Q(members__user=self.request.user) |
            Q(is_public=True)
        ).distinct()
        
        # Filtrar por is_public si se proporciona
        is_public = self.request.query_params.get('is_public', None)
        if is_public is not None:
            is_public = is_public.lower() == 'true'
            queryset = queryset.filter(is_public=is_public)
        
        # Añadir anotaciones para contar documentos
        queryset = queryset.annotate(
            documents_count=Count('documents', distinct=True)
        )
        
        # Filtrado por nombre o descripción
        query = self.request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | 
                Q(description__icontains=query)
            )
        
        return queryset
    
    def get_serializer_class(self):
        """Selecciona el serializador adecuado según la acción"""
        if self.action == 'create':
            return GroupCreateSerializer
        elif self.action == 'retrieve':
            return GroupDetalladoSerializer
        return GroupSerializer
    
    def get_serializer_context(self):
        """Proporciona el contexto al serializador"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Asigna el usuario o admin por defecto como creador"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if self.request.user.is_authenticated:
            creator = self.request.user
        else:
            # Usar el primer usuario como fallback para pruebas
            creator = User.objects.first()
            if not creator:
                # Si no hay usuarios, crear uno
                creator = User.objects.create_user(
                    username="admin",
                    password="admin123",
                    email="admin@example.com"
                )
                
        serializer.save(creator=creator)
    
    @action(detail=True, methods=['post'])
    def add_document(self, request, pk=None):
        """Añade un documento al grupo"""
        group = self.get_object()
        document_id = request.data.get('document_id')
        
        if not document_id:
            return Response(
                {'error': 'Se requiere document_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            document = Document.objects.get(pk=document_id)
            
            # Verificar que el usuario tiene permiso sobre el documento
            if document.uploader != request.user and not DocumentPermission.objects.filter(
                document=document, user=request.user, permission_type__in=['edit', 'admin']
            ).exists():
                return Response(
                    {'error': 'No tiene permiso para añadir este documento al grupo'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Asignar el documento al grupo
            document.group = group
            document.save()
            
            return Response({'success': True})
        except Document.DoesNotExist:
            return Response(
                {'error': 'Documento no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_document(self, request, pk=None):
        """Quita un documento del grupo"""
        group = self.get_object()
        document_id = request.data.get('document_id')
        
        if not document_id:
            return Response(
                {'error': 'Se requiere document_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            document = Document.objects.get(pk=document_id, group=group)
            
            # Verificar que el usuario tiene permiso para quitar el documento
            if document.uploader != request.user and not DocumentPermission.objects.filter(
                document=document, user=request.user, permission_type__in=['edit', 'admin']
            ).exists() and group.creator != request.user:
                return Response(
                    {'error': 'No tiene permiso para quitar este documento del grupo'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Quitar el documento del grupo
            document.group = None
            document.save()
            
            return Response({'success': True})
        except Document.DoesNotExist:
            return Response(
                {'error': 'Documento no encontrado o no pertenece al grupo'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Obtiene todos los documentos de un grupo"""
        group = self.get_object()
        documents = Document.objects.filter(group=group, is_deleted=False)
        
        page = self.paginate_queryset(documents)
        if page is not None:
            serializer = DocumentListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = DocumentListSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Obtiene todos los miembros de un grupo"""
        group = self.get_object()
        members = GroupMember.objects.filter(group=group)
        
        serializer = GroupMemberSerializer(members, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Añade un miembro al grupo"""
        group = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'viewer')
        
        if not user_id:
            return Response(
                {'error': 'Se requiere user_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el usuario actual es el creador o un administrador del grupo
        if group.creator != request.user and not GroupMember.objects.filter(
            group=group, user=request.user, role='admin'
        ).exists():
            return Response(
                {'error': 'No tiene permiso para añadir miembros al grupo'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(pk=user_id)
            
            # Verificar si el usuario ya es miembro
            if GroupMember.objects.filter(group=group, user=user).exists():
                return Response(
                    {'error': 'El usuario ya es miembro del grupo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Añadir al usuario como miembro
            member = GroupMember.objects.create(
                group=group,
                user=user,
                role=role
            )
            
            serializer = GroupMemberSerializer(member, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Elimina un miembro del grupo"""
        group = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'Se requiere user_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el usuario actual es el creador o un administrador del grupo
        if group.creator != request.user and not GroupMember.objects.filter(
            group=group, user=request.user, role='admin'
        ).exists():
            return Response(
                {'error': 'No tiene permiso para eliminar miembros del grupo'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            member = GroupMember.objects.get(group=group, user__id=user_id)
            member.delete()
            return Response({'success': True})
        except GroupMember.DoesNotExist:
            return Response(
                {'error': 'Miembro no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CollectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar colecciones de documentos.
    
    list:
        Devuelve una lista paginada de colecciones.
        
    retrieve:
        Devuelve una colección específica con información detallada.
        
    create:
        Crea una nueva colección.
        
    update:
        Actualiza una colección existente.
        
    partial_update:
        Actualiza parcialmente una colección existente.
        
    destroy:
        Elimina una colección existente.
        
    documents:
        Obtiene los documentos de una colección.
        
    add_documents:
        Añade documentos a una colección.
        
    remove_document:
        Quita un documento de una colección.
        
    reorder_documents:
        Reordena los documentos de una colección.
        
    update_document_notes:
        Actualiza las notas de un documento en una colección.
        
    share:
        Comparte una colección con otro usuario o genera un nuevo token.
        
    remove_permission:
        Elimina un permiso de una colección.
        
    export:
        Exporta una colección como archivo ZIP.
        
    public_access:
        Permite acceso público a una colección mediante token.
        
    public_download:
        Permite la descarga pública de una colección mediante token.
    """
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_permissions(self):
        """Permisos basados en la acción"""
        if self.action in ['public_access', 'public_download', 'create', 'list', 'retrieve', 'documents']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_throttles(self):
        """Throttling basado en autenticación"""
        if self.request.user.is_authenticated:
            return [CollectionRateThrottle()]
        return [CollectionAnonRateThrottle()]
    
    def get_queryset(self):
        """Filtrado de colecciones basado en usuario y parámetros"""
        if not self.request.user.is_authenticated:
            # Para pruebas, permitir ver todas las colecciones
            return Collection.objects.all()
        
        # Por defecto, mostrar colecciones creadas por el usuario y las que tiene permiso
        queryset = Collection.objects.filter(
            Q(creator=self.request.user) | 
            Q(permissions__user=self.request.user) |
            Q(is_public=True)
        ).distinct()
        
        # Filtrar por is_public si se proporciona
        is_public = self.request.query_params.get('is_public', None)
        if is_public is not None:
            is_public = is_public.lower() == 'true'
            queryset = queryset.filter(is_public=is_public)
        
        # Filtrado por nombre o descripción
        query = self.request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | 
                Q(description__icontains=query)
            )
        
        # Añadir anotaciones para contar documentos y calcular tamaño total
        queryset = queryset.annotate(
            documents_count=Count('documents', distinct=True),
            documents_total_size=Sum('documents__file_size')
        )
        
        return queryset
    
    def get_serializer_class(self):
        """Selecciona el serializador adecuado según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return CollectionCreateSerializer
        elif self.action == 'retrieve':
            return CollectionDetailSerializer
        return CollectionListSerializer
    
    def get_serializer_context(self):
        """Proporciona el contexto al serializador"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Asigna el usuario o admin por defecto como creador"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if self.request.user.is_authenticated:
            creator = self.request.user
        else:
            # Usar el primer usuario como fallback para pruebas
            creator = User.objects.first()
            if not creator:
                # Si no hay usuarios, crear uno
                creator = User.objects.create_user(
                    username="admin",
                    password="admin123",
                    email="admin@example.com"
                )
                
        serializer.save(creator=creator)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Retorna los documentos de una colección"""
        collection = self.get_object()
        collection_documents = CollectionDocument.objects.filter(collection=collection).order_by('order')
        serializer = CollectionDocumentSerializer(collection_documents, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_documents(self, request, pk=None):
        """Añade documentos a una colección"""
        collection = self.get_object()
        document_ids = request.data.get('documents', [])
        
        # Obtener el último orden
        last_order = CollectionDocument.objects.filter(collection=collection).order_by('-order').first()
        order_start = last_order.order + 1 if last_order else 0
        
        documents_added = []
        for i, doc_id in enumerate(document_ids):
            document = get_object_or_404(Document, id=doc_id, is_deleted=False)
            collection_doc, created = CollectionDocument.objects.get_or_create(
                collection=collection,
                document=document,
                defaults={'order': order_start + i}
            )
            if created:
                documents_added.append(document.title)
                
                # Registrar actividad
                CollectionActivity.objects.create(
                    collection=collection,
                    user=request.user,
                    activity_type='add',
                    details=f"Documento añadido: {document.title}"
                )
        
        return Response({
            'success': True,
            'added_documents': documents_added,
            'count': len(documents_added)
        })
    
    @action(detail=True, methods=['post'])
    def remove_document(self, request, pk=None):
        """Elimina un documento de una colección"""
        collection = self.get_object()
        document_id = request.data.get('document_id')
        
        if not document_id:
            return Response({'error': 'Se requiere document_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            collection_doc = CollectionDocument.objects.get(collection=collection, document_id=document_id)
            document_title = collection_doc.document.title
            collection_doc.delete()
            
            # Registrar actividad
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user,
                activity_type='remove',
                details=f"Documento eliminado: {document_title}"
            )
            
            return Response({'success': True})
        except CollectionDocument.DoesNotExist:
            return Response({'error': 'El documento no existe en esta colección'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def reorder_documents(self, request, pk=None):
        """Reordena los documentos de una colección"""
        collection = self.get_object()
        document_orders = request.data.get('document_orders', [])
        
        if not document_orders:
            return Response({'error': 'Se requiere document_orders'}, status=status.HTTP_400_BAD_REQUEST)
        
        # document_orders debe ser una lista de diccionarios: [{"document_id": 1, "order": 0}, ...]
        try:
            for item in document_orders:
                doc_id = item.get('document_id')
                order = item.get('order')
                if doc_id is not None and order is not None:
                    CollectionDocument.objects.filter(
                        collection=collection,
                        document_id=doc_id
                    ).update(order=order)
            
            # Registrar actividad
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user,
                activity_type='edit',
                details="Documentos reordenados"
            )
            
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_document_notes(self, request, pk=None):
        """Actualiza las notas de un documento en una colección"""
        collection = self.get_object()
        document_id = request.data.get('document_id')
        notes = request.data.get('notes', '')
        
        if not document_id:
            return Response({'error': 'Se requiere document_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            collection_doc = CollectionDocument.objects.get(collection=collection, document_id=document_id)
            collection_doc.notes = notes
            collection_doc.save()
            
            # Registrar actividad
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user,
                activity_type='edit',
                details=f"Notas actualizadas para el documento: {collection_doc.document.title}"
            )
            
            return Response({'success': True})
        except CollectionDocument.DoesNotExist:
            return Response({'error': 'El documento no existe en esta colección'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Comparte una colección con otro usuario o genera un nuevo token de compartición"""
        collection = self.get_object()
        user_id = request.data.get('user_id')
        permission_type = request.data.get('permission_type', 'view')
        regenerate_token = request.data.get('regenerate_token', False)
        expiry_days = request.data.get('expiry_days')
        
        # Si se solicita regenerar el token
        if regenerate_token:
            new_token = collection.generate_new_share_token()
            
            # Actualizar fecha de expiración si se proporciona
            if expiry_days is not None:
                collection.expiry_date = timezone.now() + timezone.timedelta(days=int(expiry_days))
                collection.save(update_fields=['expiry_date'])
            
            # Registrar actividad
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user,
                activity_type='share',
                details="Nuevo token de compartición generado"
            )
            
            return Response({
                'share_token': new_token,
                'expiry_date': collection.expiry_date
            })
        
        # Si se proporciona un usuario para compartir
        if user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            try:
                user = User.objects.get(id=user_id)
                
                # Crear o actualizar permiso
                perm, created = CollectionPermission.objects.update_or_create(
                    collection=collection,
                    user=user,
                    defaults={'permission_type': permission_type}
                )
                
                # Registrar actividad
                CollectionActivity.objects.create(
                    collection=collection,
                    user=request.user,
                    activity_type='share',
                    details=f"Colección compartida con {user.username} con permiso de {perm.get_permission_type_display()}"
                )
                
                return Response({
                    'success': True,
                    'shared_with': user.username,
                    'permission_type': permission_type
                })
                
            except User.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Se requiere user_id o regenerate_token=true'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        """Elimina un permiso de una colección"""
        collection = self.get_object()
        permission_id = request.data.get('permission_id')
        
        if not permission_id:
            return Response({'error': 'Se requiere permission_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            permission = CollectionPermission.objects.get(id=permission_id, collection=collection)
            username = permission.user.username
            permission.delete()
            
            # Registrar actividad
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user,
                activity_type='edit',
                details=f"Permiso eliminado para {username}"
            )
            
            return Response({'success': True})
        except CollectionPermission.DoesNotExist:
            return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Exporta una colección como un archivo ZIP con todos los documentos"""
        collection = self.get_object()
        
        # Crear un buffer para el archivo ZIP
        buffer = io.BytesIO()
        
        # Crear el archivo ZIP en memoria
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Obtener documentos de la colección ordenados
            collection_documents = CollectionDocument.objects.filter(
                collection=collection
            ).order_by('order')
            
            # Añadir un archivo README con información de la colección
            readme_content = f"""
            Colección: {collection.name}
            Descripción: {collection.description}
            Creada por: {collection.creator.username}
            Fecha de creación: {collection.created_at}
            Fecha de exportación: {timezone.now()}
            Número de documentos: {collection_documents.count()}
            """
            zip_file.writestr('README.txt', readme_content)
            
            # Añadir cada documento al ZIP
            for coll_doc in collection_documents:
                doc = coll_doc.document
                if doc.file:
                    # Obtener la ruta completa del archivo
                    file_path = doc.file.path
                    
                    # Verificar si el archivo existe
                    if os.path.isfile(file_path):
                        # Añadir al ZIP con un nombre de archivo adecuado
                        safe_filename = f"{doc.title.replace(' ', '_')}.{doc.file_type}"
                        zip_file.write(file_path, safe_filename)
                    
                    # Si el archivo no existe, podríamos añadir un marcador de error
                    else:
                        zip_file.writestr(
                            f"ERROR_{doc.title.replace(' ', '_')}.txt",
                            f"El archivo {doc.file_name} no se pudo encontrar en el sistema."
                        )
            
            # Incluir notas de los documentos si existen
            notes_content = ""
            for coll_doc in collection_documents:
                if coll_doc.notes:
                    notes_content += f"\n\nDocumento: {coll_doc.document.title}\n"
                    notes_content += f"Notas:\n{coll_doc.notes}"
            
            if notes_content:
                zip_file.writestr('NOTAS.txt', notes_content)
        
        # Obtener el contenido del buffer
        buffer.seek(0)
        
        # Registrar actividad
        CollectionActivity.objects.create(
            collection=collection,
            user=request.user,
            activity_type='export',
            details="Colección exportada como ZIP"
        )
        
        # Crear respuesta HTTP con el archivo ZIP
        response = HttpResponse(buffer.read(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{collection.name.replace(" ", "_")}.zip"'
        return response
    
    @action(detail=True, methods=['get'], url_path='public-access/(?P<token>[^/.]+)')
    def public_access(self, request, pk=None, token=None):
        """Acceso público a la colección mediante token"""
        try:
            # Verificar que exista una colección con el ID y token proporcionados
            collection = Collection.objects.get(id=pk, share_token=token)
            
            # Verificar que no haya expirado
            if collection.expiry_date and collection.expiry_date < timezone.now():
                return Response({
                    'error': 'El enlace de acceso a esta colección ha expirado'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Devolver los datos de la colección
            serializer = CollectionDetailSerializer(collection, context={'request': request})
            
            # Registrar actividad (con usuario anónimo)
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user if request.user.is_authenticated else collection.creator,
                activity_type='view',
                details="Colección accedida mediante enlace público"
            )
            
            return Response(serializer.data)
            
        except Collection.DoesNotExist:
            return Response({
                'error': 'Colección no encontrada o token inválido'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'], url_path='public-download/(?P<token>[^/.]+)')
    def public_download(self, request, pk=None, token=None):
        """Descarga pública de una colección mediante token"""
        try:
            # Verificar que exista una colección con el ID y token proporcionados
            collection = Collection.objects.get(id=pk, share_token=token)
            
            # Verificar que no haya expirado
            if collection.expiry_date and collection.expiry_date < timezone.now():
                return Response({
                    'error': 'El enlace de acceso a esta colección ha expirado'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Crear un buffer para el archivo ZIP
            buffer = io.BytesIO()
            
            # Crear el archivo ZIP
            with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Obtener documentos de la colección ordenados
                collection_documents = CollectionDocument.objects.filter(
                    collection=collection
                ).order_by('order')
                
                # Añadir cada documento al ZIP
                for coll_doc in collection_documents:
                    doc = coll_doc.document
                    if doc.file:
                        # Obtener la ruta completa del archivo
                        file_path = doc.file.path
                        
                        # Verificar si el archivo existe
                        if os.path.isfile(file_path):
                            # Añadir al ZIP con un nombre de archivo adecuado
                            safe_filename = f"{doc.title.replace(' ', '_')}.{doc.file_type}"
                            zip_file.write(file_path, safe_filename)
            
            # Obtener el contenido del buffer
            buffer.seek(0)
            
            # Registrar actividad (con usuario anónimo)
            CollectionActivity.objects.create(
                collection=collection,
                user=request.user if request.user.is_authenticated else collection.creator,
                activity_type='export',
                details="Colección descargada mediante enlace público"
            )
            
            # Crear respuesta HTTP con el archivo ZIP
            response = HttpResponse(buffer.read(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="{collection.name.replace(" ", "_")}.zip"'
            return response
            
        except Collection.DoesNotExist:
            return Response({
                'error': 'Colección no encontrada o token inválido'
            }, status=status.HTTP_404_NOT_FOUND)
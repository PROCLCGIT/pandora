from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Category, Tag, Document, DocumentVersion, DocumentTag, 
    DocumentActivity, DocumentPermission, DocumentComment,
    Collection, CollectionDocument, CollectionPermission, CollectionActivity,
    Group, GroupMember
)

User = get_user_model()

# Serializadores auxiliares
class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializador mínimo de usuarios para uso en relaciones anidadas"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# Serializadores de Tag (Etiqueta)
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color_code', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class TagDetalladoSerializer(TagSerializer):
    document_count = serializers.SerializerMethodField()
    
    class Meta(TagSerializer.Meta):
        fields = TagSerializer.Meta.fields + ['document_count']
    
    def get_document_count(self, obj):
        return obj.documents.filter(is_deleted=False).count()

# Serializadores de Category (Categoría)
class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.ReadOnlyField(source='parent.name')
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color_code', 'parent', 'parent_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CategoryDetalladoSerializer(CategorySerializer):
    subcategories = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    
    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ['subcategories', 'document_count']
    
    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.all(), many=True).data
    
    def get_document_count(self, obj):
        return obj.documents.filter(is_deleted=False).count()

# Serializadores de Group (Grupo)
class GroupMemberSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = GroupMember
        fields = ['id', 'user', 'user_details', 'role', 'role_display', 'joined_at']
        read_only_fields = ['joined_at']

class GroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.username')
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color_code', 
                  'is_public', 'creator', 'creator_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'slug']

class GroupCreateSerializer(GroupSerializer):
    class Meta(GroupSerializer.Meta):
        read_only_fields = GroupSerializer.Meta.read_only_fields + ['creator']

class GroupDetalladoSerializer(GroupSerializer):
    members = GroupMemberSerializer(source='members.all', many=True, read_only=True)
    documents_count = serializers.IntegerField(read_only=True)
    
    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members', 'documents_count']

# Serializadores de Document (Documento)
class DocumentTagSerializer(serializers.ModelSerializer):
    tag_details = TagSerializer(source='tag', read_only=True)
    
    class Meta:
        model = DocumentTag
        fields = ['id', 'tag', 'tag_details', 'created_at']
        read_only_fields = ['created_at']

class DocumentVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'version_number', 'file_path', 'file_size', 
                  'change_notes', 'created_by', 'created_by_name', 'created_at', 'file_url']
        read_only_fields = ['created_at', 'file_path', 'file_size', 'created_by']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class DocumentCommentSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentComment
        fields = ['id', 'content', 'user', 'user_details', 'parent_comment', 
                  'created_at', 'updated_at', 'replies']
        read_only_fields = ['created_at', 'updated_at', 'user']
    
    def get_replies(self, obj):
        if obj.is_reply:
            return []
        replies = DocumentComment.objects.filter(parent_comment=obj.id)
        return DocumentCommentSerializer(replies, many=True, context=self.context).data

class DocumentPermissionSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    permission_type_display = serializers.CharField(source='get_permission_type_display', read_only=True)
    
    class Meta:
        model = DocumentPermission
        fields = ['id', 'user', 'user_details', 'permission_type', 'permission_type_display', 
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class DocumentActivitySerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = DocumentActivity
        fields = ['id', 'user', 'user_details', 'activity_type', 'activity_type_display', 
                  'details', 'created_at']
        read_only_fields = ['created_at']

class DocumentListSerializer(serializers.ModelSerializer):
    uploader_name = serializers.ReadOnlyField(source='uploader.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    group_name = serializers.ReadOnlyField(source='group.name')
    tags = TagSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file_name', 'file_type', 'file_size', 
                  'file_path', 'is_favorite', 'is_deleted', 'category', 'category_name', 
                  'group', 'group_name', 'uploader', 'uploader_name', 'created_at', 
                  'updated_at', 'tags', 'file_url']
        read_only_fields = ['created_at', 'updated_at', 'deleted_at', 'is_deleted']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class DocumentDetailSerializer(DocumentListSerializer):
    versions = DocumentVersionSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    permissions = DocumentPermissionSerializer(many=True, read_only=True)
    
    class Meta(DocumentListSerializer.Meta):
        fields = DocumentListSerializer.Meta.fields + ['versions', 'comments', 'permissions']
    
    def get_comments(self, obj):
        # Solo obtenemos comentarios de nivel superior
        comments = obj.comments.filter(parent_comment=None)
        return DocumentCommentSerializer(comments, many=True, context=self.context).data

class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'category', 'group', 'is_favorite']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        # El campo uploader se asigna en el viewset
        return super().create(validated_data)

# Serializadores de Collection (Colección)
class CollectionDocumentSerializer(serializers.ModelSerializer):
    document_details = DocumentListSerializer(source='document', read_only=True)
    
    class Meta:
        model = CollectionDocument
        fields = ['id', 'document', 'document_details', 'order', 'notes', 'created_at']
        read_only_fields = ['created_at']

class CollectionPermissionSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    permission_type_display = serializers.CharField(source='get_permission_type_display', read_only=True)
    
    class Meta:
        model = CollectionPermission
        fields = ['id', 'user', 'user_details', 'permission_type', 'permission_type_display', 'created_at']
        read_only_fields = ['created_at']

class CollectionActivitySerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = CollectionActivity
        fields = ['id', 'user', 'user_details', 'activity_type', 'activity_type_display', 
                  'details', 'created_at']
        read_only_fields = ['created_at']

class CollectionListSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.username')
    documents_count = serializers.IntegerField(read_only=True)
    documents_total_size = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'icon', 'color_code', 'cover_image', 
                  'is_public', 'creator', 'creator_name', 'created_at', 'updated_at', 
                  'documents_count', 'documents_total_size']
        read_only_fields = ['created_at', 'updated_at', 'id']

class CollectionDetailSerializer(CollectionListSerializer):
    documents = serializers.SerializerMethodField()
    permissions = CollectionPermissionSerializer(many=True, read_only=True)
    
    class Meta(CollectionListSerializer.Meta):
        fields = CollectionListSerializer.Meta.fields + ['documents', 'permissions', 
                                                       'expiry_date', 'include_annotations', 
                                                       'include_comments']
    
    def get_documents(self, obj):
        collection_documents = CollectionDocument.objects.filter(collection=obj).order_by('order')
        return CollectionDocumentSerializer(collection_documents, many=True, context=self.context).data

class CollectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['name', 'description', 'icon', 'color_code', 'cover_image', 
                  'is_public', 'include_annotations', 'include_comments']
    
    def create(self, validated_data):
        # El campo creator se asigna en el viewset
        return super().create(validated_data)
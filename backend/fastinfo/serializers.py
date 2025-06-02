from rest_framework import serializers
from .models import NombreEntidad, DatosInstitucionales

class NombreEntidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = NombreEntidad
        fields = ['id', 'codigo', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_codigo(self, value):
        """Validar que el código sea único"""
        if self.instance:
            # Si estamos editando, excluir el registro actual
            if NombreEntidad.objects.filter(codigo=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Ya existe una entidad con este código")
        else:
            # Si estamos creando
            if NombreEntidad.objects.filter(codigo=value).exists():
                raise serializers.ValidationError("Ya existe una entidad con este código")
        return value


class DatosInstitucionalesSerializer(serializers.ModelSerializer):
    nombre_entidad_texto = serializers.CharField(source='nombre_entidad.nombre', read_only=True)
    codigo_entidad = serializers.CharField(source='nombre_entidad.codigo', read_only=True)
    contrasena_visible = serializers.SerializerMethodField()
    
    class Meta:
        model = DatosInstitucionales
        fields = [
            'id', 'nombre_entidad', 'nombre_entidad_texto', 'codigo_entidad', 
            'ruc', 'usuario', 'contrasena_visible', 'correo', 'telefono', 
            'representante', 'direccion', 'sitio_web', 'observaciones',
            'activo', 'fecha_ultima_actualizacion', 'created_at', 'updated_at'
        ]
        read_only_fields = ['fecha_ultima_actualizacion', 'created_at', 'updated_at']
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }
    
    def get_contrasena_visible(self, obj):
        return obj.get_contrasena_visible()

    def validate_ruc(self, value):
        """Validar que el RUC sea único"""
        if self.instance:
            # Si estamos editando, excluir el registro actual
            if DatosInstitucionales.objects.filter(ruc=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Ya existe una entidad con este RUC")
        else:
            # Si estamos creando
            if DatosInstitucionales.objects.filter(ruc=value).exists():
                raise serializers.ValidationError("Ya existe una entidad con este RUC")
        return value


class DatosInstitucionalesCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer específico para crear/actualizar con contraseña"""
    
    class Meta:
        model = DatosInstitucionales
        fields = [
            'id', 'nombre_entidad', 'ruc', 'usuario', 'contrasena', 
            'correo', 'telefono', 'representante', 'direccion', 
            'sitio_web', 'observaciones', 'activo'
        ]
        
    def validate_ruc(self, value):
        """Validar que el RUC sea único"""
        if self.instance:
            if DatosInstitucionales.objects.filter(ruc=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Ya existe una entidad con este RUC")
        else:
            if DatosInstitucionales.objects.filter(ruc=value).exists():
                raise serializers.ValidationError("Ya existe una entidad con este RUC")
        return value
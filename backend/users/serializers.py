"""
Serializadores para la aplicación de usuarios.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer básico para el modelo de usuario.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'position', 'department', 'profile_image',
                  'is_active', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para la creación de usuarios.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 
                  'last_name', 'phone', 'position', 'department')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para la actualización de usuarios.
    """
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'position', 'department', 'profile_image')

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil del usuario actual.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'position', 'department', 'profile_image',
                  'date_joined', 'last_login')
        read_only_fields = ('id', 'username', 'date_joined', 'last_login')

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña del usuario.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Las nuevas contraseñas no coinciden"})
        return attrs

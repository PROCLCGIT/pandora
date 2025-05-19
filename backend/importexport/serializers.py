from rest_framework import serializers
from .models import ImportTask

class ImportTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportTask
        fields = '__all__'
        read_only_fields = ('estado', 'mensaje', 'registros_procesados', 
                           'registros_exitosos', 'registros_fallidos')

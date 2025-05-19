import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import ImportTask
from .serializers import ImportTaskSerializer
from .utils import (
    validar_dataframe_productos_ofertados, validar_dataframe_productos_disponibles,
    importar_productos_ofertados, importar_productos_disponibles,
    exportar_productos_ofertados, exportar_productos_disponibles
)

class ImportTaskViewSet(viewsets.ModelViewSet):
    queryset = ImportTask.objects.all()
    serializer_class = ImportTaskSerializer
    
    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
    
    @action(detail=True, methods=['post'])
    def procesar(self, request, pk=None):
        """Procesar archivo de importación"""
        tarea = self.get_object()
        
        if tarea.estado != 'pendiente':
            return Response(
                {"error": "Esta tarea ya ha sido procesada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Cambiar estado a procesando
            tarea.estado = 'procesando'
            tarea.save()
            
            # Leer el archivo Excel
            if tarea.archivo.name.endswith('.xlsx'):
                df = pd.read_excel(tarea.archivo.path)
            elif tarea.archivo.name.endswith('.csv'):
                df = pd.read_csv(tarea.archivo.path)
            else:
                tarea.estado = 'error'
                tarea.mensaje = "Formato de archivo no soportado. Use .xlsx o .csv"
                tarea.save()
                return Response(
                    {"error": tarea.mensaje},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar datos
            errores = []
            if tarea.tipo == 'producto_ofertado':
                errores = validar_dataframe_productos_ofertados(df)
            elif tarea.tipo == 'producto_disponible':
                errores = validar_dataframe_productos_disponibles(df)
            
            if errores:
                tarea.estado = 'error'
                tarea.mensaje = "\n".join(errores)
                tarea.save()
                return Response(
                    {"error": tarea.mensaje},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Procesar importación
            resultados = {}
            if tarea.tipo == 'producto_ofertado':
                resultados = importar_productos_ofertados(df, request.user)
            elif tarea.tipo == 'producto_disponible':
                resultados = importar_productos_disponibles(df, request.user)
            
            # Actualizar estado de la tarea
            tarea.registros_procesados = len(df)
            tarea.registros_exitosos = resultados['exitosos']
            tarea.registros_fallidos = resultados['fallidos']
            
            if resultados['errores']:
                tarea.mensaje = "\n".join(resultados['errores'])
                tarea.estado = 'completado' if resultados['exitosos'] > 0 else 'error'
            else:
                tarea.mensaje = "Importación completada exitosamente"
                tarea.estado = 'completado'
            
            tarea.save()
            
            return Response({
                "estado": tarea.estado,
                "mensaje": tarea.mensaje,
                "registros_procesados": tarea.registros_procesados,
                "registros_exitosos": tarea.registros_exitosos,
                "registros_fallidos": tarea.registros_fallidos
            })
            
        except Exception as e:
            tarea.estado = 'error'
            tarea.mensaje = f"Error en el proceso de importación: {str(e)}"
            tarea.save()
            return Response(
                {"error": tarea.mensaje},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def plantilla(self, request):
        """Descargar plantilla para importación"""
        tipo = request.query_params.get('tipo')
        
        if tipo not in ['producto_ofertado', 'producto_disponible']:
            return Response(
                {"error": "Tipo de plantilla no válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear DataFrame con columnas requeridas
        if tipo == 'producto_ofertado':
            df = pd.DataFrame(columns=[
                'code', 'cudim', 'nombre', 'id_categoria', 'descripcion',
                'especialidad', 'referencias', 'is_active'
            ])
        else:  # producto_disponible
            df = pd.DataFrame(columns=[
                'code', 'nombre', 'id_categoria', 'id_producto_ofertado', 
                'id_marca', 'modelo', 'unidad_presentacion', 'procedencia',
                'referencia', 'costo_referencial', 'precio_sie_referencial',
                'precio_sie_tipob', 'precio_venta_privado', 'is_active'
            ])
        
        # Convertir a Excel en memoria
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="plantilla_{tipo}.xlsx"'
        
        df.to_excel(response, index=False)
        return response

class ExportViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def productos_ofertados(self, request):
        """Exportar productos ofertados a Excel"""
        df = exportar_productos_ofertados()
        
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="productos_ofertados.xlsx"'
        
        df.to_excel(response, index=False)
        return response
    
    @action(detail=False, methods=['get'])
    def productos_disponibles(self, request):
        """Exportar productos disponibles a Excel"""
        df = exportar_productos_disponibles()
        
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="productos_disponibles.xlsx"'
        
        df.to_excel(response, index=False)
        return response

# backend/proformas/views.py

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
# PDF generator will be imported in the method to handle potential import errors

from .models import (
    Proforma, ProformaItem, ProformaHistorial, 
    SecuenciaProforma, ConfiguracionProforma
)
from .serializers import (
    ProformaSerializer, ProformaDetalladoSerializer, ProformaReporteSerializer,
    ProformaItemSerializer, ProformaItemDetalladoSerializer,
    ProformaHistorialSerializer, SecuenciaProformaSerializer,
    ConfiguracionProformaSerializer, ModeloTemplateChoicesSerializer,
    ProformaItemsValidacionSerializer
)
from basic.pagination import BasicStandardResultsSetPagination


class ProformaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar proformas o cotizaciones.
    
    Permite crear, ver, editar y eliminar proformas en el sistema.
    """
    queryset = Proforma.objects.all()
    serializer_class = ProformaSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cliente', 'empresa', 'tipo_contratacion', 'estado', 'tiene_orden', 'modelo_template']
    search_fields = ['numero', 'nombre', 'atencion_a', 'notas']
    ordering_fields = ['fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'created_at']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Determina qué serializer usar basado en la acción"""
        if self.action == 'retrieve':
            return ProformaDetalladoSerializer
        elif self.action == 'generar_reporte':
            return ProformaReporteSerializer
        return ProformaSerializer
    
    def perform_create(self, serializer):
        """Guardar proforma y crear registro en el historial"""
        proforma = serializer.save()
        # Crear registro en el historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion=ProformaHistorial.TipoAccion.CREACION,
            estado_anterior='',
            estado_nuevo=proforma.estado,
            notas=f"Proforma creada con modelo {proforma.get_titulo_modelo()}",
            created_by=self.request.user
        )
    
    def perform_update(self, serializer):
        """Guardar proforma actualizada y registrar el cambio"""
        proforma = self.get_object()
        estado_anterior = proforma.estado
        modelo_anterior = proforma.modelo_template
        
        proforma_actualizada = serializer.save()
        
        # Si el estado cambió, registrar en el historial
        if estado_anterior != proforma_actualizada.estado:
            ProformaHistorial.objects.create(
                proforma=proforma_actualizada,
                accion=ProformaHistorial.TipoAccion.MODIFICACION,
                estado_anterior=estado_anterior,
                estado_nuevo=proforma_actualizada.estado,
                created_by=self.request.user
            )
        
        # Si el modelo de template cambió, registrar en el historial
        if modelo_anterior != proforma_actualizada.modelo_template:
            ProformaHistorial.objects.create(
                proforma=proforma_actualizada,
                accion=ProformaHistorial.TipoAccion.CAMBIO_MODELO,
                estado_anterior=estado_anterior,
                estado_nuevo=proforma_actualizada.estado,
                campo_modificado='modelo_template',
                valor_anterior=dict(Proforma.ModeloTemplate.choices).get(modelo_anterior, modelo_anterior),
                valor_nuevo=dict(Proforma.ModeloTemplate.choices).get(proforma_actualizada.modelo_template, proforma_actualizada.modelo_template),
                notas=f"Modelo cambiado de {dict(Proforma.ModeloTemplate.choices).get(modelo_anterior)} a {proforma_actualizada.get_titulo_modelo()}",
                created_by=self.request.user
            )
    
    @swagger_auto_schema(
        operation_description="Obtiene las opciones disponibles de modelos de template",
        responses={
            200: "Lista de modelos de template disponibles",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def modelos_template(self, request):
        """
        Devuelve todas las opciones disponibles de modelos de template con su configuración.
        """
        opciones = ModeloTemplateChoicesSerializer.get_opciones()
        return Response({
            'modelos_disponibles': opciones,
            'modelo_default': Proforma.ModeloTemplate.BASICO
        })
    
    @swagger_auto_schema(
        operation_description="Vista previa de cambio de modelo de template",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['modelo_template'],
            properties={
                'modelo_template': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nuevo modelo de template"
                ),
            }
        ),
        responses={
            200: "Vista previa del cambio",
            400: "Modelo de template inválido",
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['post'])
    def preview_cambio_modelo(self, request, pk=None):
        """
        Obtiene una vista previa de cómo quedaría la proforma con un nuevo modelo de template.
        No realiza cambios, solo muestra qué campos serían requeridos y cuáles ítems tienen problemas.
        """
        proforma = self.get_object()
        nuevo_modelo = request.data.get('modelo_template', None)
        modelos_validos = [choice[0] for choice in Proforma.ModeloTemplate.choices]
        
        if nuevo_modelo not in modelos_validos:
            return Response(
                {"error": f"Modelo inválido. Valores permitidos: {', '.join(modelos_validos)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear una proforma temporal para obtener la nueva configuración
        temp_proforma = Proforma(modelo_template=nuevo_modelo)
        nueva_config = temp_proforma.get_campos_visibles()
        config_actual = proforma.get_campos_visibles()
        
        # Validar que los ítems existentes cumplan con los nuevos requerimientos
        items_con_errores = []
        items_validos = []
        
        for item in proforma.items.all():
            errores_item = []
            for campo in nueva_config['requeridos']:
                valor = getattr(item, campo, None)
                if not valor or (isinstance(valor, str) and not valor.strip()):
                    errores_item.append({
                        'campo': campo,
                        'header': nueva_config['headers'][nueva_config['campos'].index(campo)] if campo in nueva_config['campos'] else campo
                    })
            
            if errores_item:
                items_con_errores.append({
                    'item_id': item.id,
                    'descripcion': item.descripcion[:50],
                    'identificador': item.get_campo_identificador(),
                    'campos_faltantes': errores_item
                })
            else:
                items_validos.append({
                    'item_id': item.id,
                    'descripcion': item.descripcion[:50],
                    'identificador': item.get_campo_identificador()
                })
        
        return Response({
            'modelo_actual': {
                'valor': proforma.modelo_template,
                'titulo': proforma.get_titulo_modelo(),
                'config': config_actual
            },
            'modelo_nuevo': {
                'valor': nuevo_modelo,
                'titulo': temp_proforma.get_titulo_modelo(),
                'config': nueva_config
            },
            'compatibilidad': {
                'es_compatible': len(items_con_errores) == 0,
                'total_items': proforma.items.count(),
                'items_validos': len(items_validos),
                'items_con_errores': len(items_con_errores)
            },
            'items_validos': items_validos,
            'items_con_errores': items_con_errores,
            'recomendaciones': self._generar_recomendaciones_cambio_modelo(config_actual, nueva_config, items_con_errores)
        })
    
    def _generar_recomendaciones_cambio_modelo(self, config_actual, nueva_config, items_con_errores):
        """Genera recomendaciones para el cambio de modelo."""
        recomendaciones = []
        
        if len(items_con_errores) > 0:
            recomendaciones.append(
                f"Debe completar {len(items_con_errores)} ítem(s) antes de cambiar al nuevo modelo."
            )
            
            # Agrupar campos faltantes más comunes
            campos_faltantes = {}
            for item in items_con_errores:
                for campo_info in item['campos_faltantes']:
                    campo = campo_info['header']
                    if campo not in campos_faltantes:
                        campos_faltantes[campo] = 0
                    campos_faltantes[campo] += 1
            
            campo_mas_faltante = max(campos_faltantes, key=campos_faltantes.get)
            recomendaciones.append(
                f"El campo '{campo_mas_faltante}' es el que más falta en los ítems ({campos_faltantes[campo_mas_faltante]} ítems)."
            )
        
        # Campos nuevos que se vuelven requeridos
        campos_nuevos_requeridos = set(nueva_config['requeridos']) - set(config_actual['requeridos'])
        if campos_nuevos_requeridos:
            headers_nuevos = [nueva_config['headers'][nueva_config['campos'].index(campo)] 
                             for campo in campos_nuevos_requeridos if campo in nueva_config['campos']]
            recomendaciones.append(
                f"El nuevo modelo requiere los siguientes campos adicionales: {', '.join(headers_nuevos)}"
            )
        
        return recomendaciones
    
    @swagger_auto_schema(
        operation_description="Valida todos los ítems de la proforma contra su modelo actual",
        responses={
            200: "Resultado de la validación",
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['get'])
    def validar_items_modelo(self, request, pk=None):
        """
        Valida que todos los ítems de la proforma cumplan con los campos requeridos del modelo actual.
        """
        proforma = self.get_object()
        items_con_errores = proforma.validar_items_segun_modelo()
        config = proforma.get_campos_visibles()
        
        return Response({
            'modelo_actual': {
                'valor': proforma.modelo_template,
                'titulo': proforma.get_titulo_modelo(),
                'campos_requeridos': config['requeridos']
            },
            'validacion': {
                'es_valida': len(items_con_errores) == 0,
                'total_items': proforma.items.count(),
                'items_validos': proforma.items.count() - len(items_con_errores),
                'items_con_errores': len(items_con_errores)
            },
            'items_con_errores': [
                {
                    'item_id': error['item'].id,
                    'descripcion': error['item'].descripcion[:50],
                    'identificador': error['item'].get_campo_identificador(),
                    'campos_faltantes': [
                        {
                            'campo': campo,
                            'header': config['headers'][config['campos'].index(campo)] if campo in config['campos'] else campo
                        }
                        for campo in error['campos_faltantes']
                    ]
                }
                for error in items_con_errores
            ],
            'puede_ser_enviada': proforma.puede_ser_enviada()
        })
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas por estado",
        manual_parameters=[
            openapi.Parameter(
                'estado', openapi.IN_QUERY,
                description="Estado de la proforma (borrador, enviada, aprobada, rechazada, vencida, convertida)",
                type=openapi.TYPE_STRING,
                required=True
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            400: "Parámetro estado inválido",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        """
        Devuelve las proformas filtradas por estado.
        Requiere el parámetro estado en la URL.
        """
        estado = request.query_params.get('estado', None)
        estados_validos = [choice[0] for choice in Proforma.EstadoProforma.choices]
        
        if estado and estado in estados_validos:
            proformas = Proforma.objects.filter(estado=estado)
            page = self.paginate_queryset(proformas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(proformas, many=True)
            return Response(serializer.data)
        return Response(
            {"error": f"Estado inválido. Valores permitidos: {', '.join(estados_validos)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas que vencen pronto",
        manual_parameters=[
            openapi.Parameter(
                'dias', openapi.IN_QUERY,
                description="Días hasta el vencimiento (default: 7)",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_vencer(self, request):
        """
        Devuelve las proformas que vencerán en un número específico de días.
        Por defecto, muestra las que vencen en los próximos 7 días.
        """
        dias = request.query_params.get('dias', 7)
        try:
            dias = int(dias)
        except ValueError:
            dias = 7
        
        fecha_limite = timezone.now().date() + timedelta(days=dias)
        hoy = timezone.now().date()
        
        proformas = Proforma.objects.filter(
            fecha_vencimiento__gte=hoy,
            fecha_vencimiento__lte=fecha_limite,
            estado__in=['borrador', 'enviada']  # Solo proformas activas
        )
        
        page = self.paginate_queryset(proformas)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(proformas, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene las proformas por cliente",
        manual_parameters=[
            openapi.Parameter(
                'cliente_id', openapi.IN_QUERY,
                description="ID del cliente",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaSerializer(many=True),
            400: "Parámetro cliente_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """
        Devuelve las proformas asociadas a un cliente específico.
        Requiere el parámetro cliente_id en la URL.
        """
        cliente_id = request.query_params.get('cliente_id', None)
        if cliente_id:
            proformas = Proforma.objects.filter(cliente_id=cliente_id)
            page = self.paginate_queryset(proformas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(proformas, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro cliente_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Obtiene estadísticas de uso de modelos de template",
        responses={
            200: "Estadísticas de modelos de template",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def estadisticas_modelos(self, request):
        """
        Devuelve estadísticas de uso de los diferentes modelos de template.
        """
        # Obtener el conteo por modelo de template
        conteo = Proforma.objects.values('modelo_template').annotate(
            total=Count('id')
        ).order_by('modelo_template')
        
        # Construir el resumen con nombres de modelo legibles
        estadisticas = {}
        total_proformas = 0
        
        for item in conteo:
            modelo_display = dict(Proforma.ModeloTemplate.choices).get(item['modelo_template'], item['modelo_template'])
            estadisticas[modelo_display] = {
                'total': item['total'],
                'valor': item['modelo_template']
            }
            total_proformas += item['total']
        
        # Añadir porcentajes
        for modelo, datos in estadisticas.items():
            datos['porcentaje'] = round((datos['total'] / total_proformas * 100), 2) if total_proformas > 0 else 0
        
        return Response({
            'estadisticas_por_modelo': estadisticas,
            'total_proformas': total_proformas,
            'modelo_mas_usado': max(estadisticas.keys(), key=lambda k: estadisticas[k]['total']) if estadisticas else None
        })
    
    @swagger_auto_schema(
        operation_description="Genera una copia de una proforma existente",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'mantener_modelo': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="Si mantener el mismo modelo de template (default: true)"
                ),
                'nuevo_modelo': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nuevo modelo de template para la copia"
                ),
            }
        ),
        responses={
            201: ProformaSerializer,
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['post'])
    def duplicar(self, request, pk=None):
        """
        Crea una copia de la proforma actual con un nuevo número.
        Todos los ítems son también copiados.
        Permite cambiar el modelo de template en la copia.
        """
        proforma_original = self.get_object()
        mantener_modelo = request.data.get('mantener_modelo', True)
        nuevo_modelo = request.data.get('nuevo_modelo', proforma_original.modelo_template)
        
        # Validar nuevo modelo si se especifica
        if not mantener_modelo and nuevo_modelo not in [choice[0] for choice in Proforma.ModeloTemplate.choices]:
            return Response(
                {"error": f"Modelo inválido: {nuevo_modelo}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear una copia de la proforma
        proforma_nueva = Proforma.objects.create(
            nombre=f"Copia de {proforma_original.nombre}",
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timedelta(days=30),
            cliente=proforma_original.cliente,
            empresa=proforma_original.empresa,
            tipo_contratacion=proforma_original.tipo_contratacion,
            modelo_template=nuevo_modelo,
            atencion_a=proforma_original.atencion_a,
            condiciones_pago=proforma_original.condiciones_pago,
            tiempo_entrega=proforma_original.tiempo_entrega,
            porcentaje_impuesto=proforma_original.porcentaje_impuesto,
            notas=proforma_original.notas,
            estado=Proforma.EstadoProforma.BORRADOR,
            subtotal=0,
            impuesto=0,
            total=0
        )
        
        # Copiar los ítems de la proforma original
        for item_original in proforma_original.items.all():
            ProformaItem.objects.create(
                proforma=proforma_nueva,
                tipo_item=item_original.tipo_item,
                producto_ofertado=item_original.producto_ofertado,
                producto_disponible=item_original.producto_disponible,
                # inventario=item_original.inventario,
                codigo=item_original.codigo,
                descripcion=item_original.descripcion,
                unidad=item_original.unidad,
                # Copiar todos los campos adicionales
                cpc=item_original.cpc,
                cudim=item_original.cudim,
                nombre_generico=item_original.nombre_generico,
                especificaciones_tecnicas=item_original.especificaciones_tecnicas,
                presentacion=item_original.presentacion,
                lote=item_original.lote,
                fecha_vencimiento=item_original.fecha_vencimiento,
                registro_sanitario=item_original.registro_sanitario,
                serial=item_original.serial,
                modelo=item_original.modelo,
                marca=item_original.marca,
                notas=item_original.notas,
                observaciones=item_original.observaciones,
                cantidad=item_original.cantidad,
                precio_unitario=item_original.precio_unitario,
                porcentaje_descuento=item_original.porcentaje_descuento,
                total=item_original.total,
                orden=item_original.orden
            )
        
        # Actualizar los totales
        proforma_nueva.save()
        
        # Registrar en el historial
        notas_historial = f"Duplicada de la proforma {proforma_original.numero}"
        if not mantener_modelo:
            notas_historial += f" con cambio de modelo a {proforma_nueva.get_titulo_modelo()}"
        
        ProformaHistorial.objects.create(
            proforma=proforma_nueva,
            accion=ProformaHistorial.TipoAccion.DUPLICACION,
            estado_anterior='',
            estado_nuevo=proforma_nueva.estado,
            notas=notas_historial,
            created_by=request.user
        )
        
        serializer = ProformaSerializer(proforma_nueva)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Cambia el estado de una proforma",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['estado'],
            properties={
                'estado': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nuevo estado de la proforma"
                ),
                'notas': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Notas sobre el cambio de estado"
                ),
            }
        ),
        responses={
            200: ProformaSerializer,
            400: "Estado inválido o validación fallida",
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado de una proforma y registra el cambio en el historial.
        Requiere el parámetro estado en el cuerpo de la solicitud.
        Valida que la proforma cumpla con los requerimientos del modelo antes de enviarla.
        """
        proforma = self.get_object()
        estado = request.data.get('estado', None)
        notas = request.data.get('notas', '')
        estados_validos = [choice[0] for choice in Proforma.EstadoProforma.choices]
        
        if estado and estado in estados_validos:
            # Validación especial para envío de proformas
            if estado == Proforma.EstadoProforma.ENVIADA:
                if not proforma.puede_ser_enviada():
                    items_con_errores = proforma.validar_items_segun_modelo()
                    return Response({
                        "error": "No se puede enviar la proforma porque algunos ítems no cumplen con los campos requeridos del modelo actual.",
                        "items_con_errores": len(items_con_errores),
                        "modelo_actual": proforma.get_titulo_modelo(),
                        "detalles": "Use el endpoint 'validar_items_modelo' para obtener más detalles."
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            estado_anterior = proforma.estado
            proforma.estado = estado
            
            # Lógica adicional según el estado
            if estado == Proforma.EstadoProforma.ENVIADA:
                pass  # Lógica para proformas enviadas
            elif estado == Proforma.EstadoProforma.APROBADA:
                pass  # Lógica para proformas aprobadas
            elif estado == Proforma.EstadoProforma.CONVERTIDA:
                proforma.tiene_orden = True
            
            proforma.save()
            
            # Registrar en el historial
            tipo_accion = None
            if estado == Proforma.EstadoProforma.ENVIADA:
                tipo_accion = ProformaHistorial.TipoAccion.ENVIO
            elif estado == Proforma.EstadoProforma.APROBADA:
                tipo_accion = ProformaHistorial.TipoAccion.APROBACION
            elif estado == Proforma.EstadoProforma.RECHAZADA:
                tipo_accion = ProformaHistorial.TipoAccion.RECHAZO
            elif estado == Proforma.EstadoProforma.VENCIDA:
                tipo_accion = ProformaHistorial.TipoAccion.VENCIMIENTO
            elif estado == Proforma.EstadoProforma.CONVERTIDA:
                tipo_accion = ProformaHistorial.TipoAccion.CONVERSION
            else:
                tipo_accion = ProformaHistorial.TipoAccion.MODIFICACION
            
            ProformaHistorial.objects.create(
                proforma=proforma,
                accion=tipo_accion,
                estado_anterior=estado_anterior,
                estado_nuevo=estado,
                notas=notas,
                created_by=request.user
            )
            
            serializer = ProformaSerializer(proforma)
            return Response(serializer.data)
        return Response(
            {"error": f"Estado inválido. Valores permitidos: {', '.join(estados_validos)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @swagger_auto_schema(
        operation_description="Obtiene el reporte completo de una proforma",
        responses={
            200: ProformaReporteSerializer,
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['get'])
    def generar_reporte(self, request, pk=None):
        """
        Devuelve todos los datos necesarios para generar un reporte o PDF de la proforma.
        """
        proforma = self.get_object()
        serializer = ProformaReporteSerializer(proforma)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene un resumen de las proformas por estado",
        responses={
            200: "Resumen con conteo por estado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def resumen_estados(self, request):
        """
        Devuelve un conteo de proformas agrupadas por estado.
        """
        # Obtener el conteo por estado
        conteo = Proforma.objects.values('estado').annotate(
            total=Count('id')
        ).order_by('estado')
        
        # Construir el resumen con nombres de estado legibles
        resumen = {}
        for item in conteo:
            estado_display = dict(Proforma.EstadoProforma.choices).get(item['estado'], item['estado'])
            resumen[estado_display] = item['total']
        
        # Añadir el total general
        resumen['Total'] = Proforma.objects.count()
        
        return Response(resumen)
    
    @swagger_auto_schema(
        operation_description="Genera un PDF de la proforma",
        manual_parameters=[
            openapi.Parameter(
                'template', openapi.IN_QUERY,
                description="Plantilla de PDF a usar (classic, modern). Default: classic",
                type=openapi.TYPE_STRING,
                required=False
            ),
        ],
        responses={
            200: "PDF generado exitosamente",
            400: "Plantilla no válida",
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Proforma no encontrada"
        }
    )
    @action(detail=True, methods=['get'])
    def generar_pdf(self, request, pk=None):
        """
        Genera y devuelve un PDF de la proforma.
        Permite seleccionar entre diferentes plantillas: classic, modern.
        El PDF se adapta automáticamente al modelo de template de la proforma.
        """
        try:
            proforma = self.get_object()
            
            # Obtener la plantilla solicitada (default: classic)
            template_name = request.query_params.get('template', 'classic').lower()
            
            # Validar plantilla
            templates_disponibles = ['classic', 'modern']
            if template_name not in templates_disponibles:
                return Response({
                    "error": f"Plantilla '{template_name}' no válida. Plantillas disponibles: {', '.join(templates_disponibles)}"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Importar las plantillas
            if template_name == 'classic':
                from .pdf_templates.classic_template import PremiumTemplate
                pdf_generator = PremiumTemplate(proforma)
            elif template_name == 'modern':
                from .pdf_templates.modern_template import ModernTemplate
                pdf_generator = ModernTemplate(proforma)
            
            # Generar el PDF con configuración del modelo de template
            pdf_buffer = pdf_generator.generate()
            
            # Preparar la respuesta
            response = HttpResponse(
                pdf_buffer.getvalue(),
                content_type='application/pdf'
            )
            
            # Establecer el nombre del archivo incluyendo la plantilla y modelo
            filename = f"proforma_{proforma.numero}_{template_name}_{proforma.modelo_template}_{proforma.fecha_emision.strftime('%Y%m%d')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except ImportError as e:
            return Response({
                "error": "Error: reportlab no está instalado. Por favor instale la dependencia."
            }, status=status.HTTP_501_NOT_IMPLEMENTED)
        except Exception as e:
            return Response({
                "error": f"Error generando PDF: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Obtiene las plantillas de PDF disponibles",
        responses={
            200: "Lista de plantillas disponibles",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def plantillas_pdf(self, request):
        """
        Devuelve la lista de plantillas de PDF disponibles.
        """
        plantillas = [
            {
                'nombre': 'classic',
                'descripcion': 'Plantilla clásica profesional con colores azules',
                'preview': 'Diseño conservador y formal',
                'soporta_modelos': 'Todos los modelos de template'
            },
            {
                'nombre': 'modern',
                'descripcion': 'Plantilla moderna minimalista con colores verdes',
                'preview': 'Diseño contemporáneo y limpio',
                'soporta_modelos': 'Todos los modelos de template'
            }
        ]
        
        return Response({
            'plantillas_disponibles': plantillas,
            'plantilla_default': 'classic',
            'nota': 'Las plantillas se adaptan automáticamente al modelo de template de la proforma'
        })


class ProformaItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar los ítems de las proformas.
    
    Permite crear, ver, editar y eliminar ítems en las proformas.
    """
    queryset = ProformaItem.objects.all()
    serializer_class = ProformaItemSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['proforma', 'tipo_item', 'producto_ofertado', 'producto_disponible']
    search_fields = ['codigo', 'cudim', 'descripcion', 'modelo', 'marca']
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Determina qué serializer usar basado en la acción"""
        if self.action == 'retrieve':
            return ProformaItemDetalladoSerializer
        return ProformaItemSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create para debugging"""
        print(f"[DEBUG] ProformaItemViewSet.create - Request data: {request.data}")
        print(f"[DEBUG] Request user: {request.user}")
        print(f"[DEBUG] Request headers: {request.headers}")
        
        try:
            response = super().create(request, *args, **kwargs)
            print(f"[DEBUG] Item created successfully: {response.data}")
            return response
        except Exception as e:
            print(f"[DEBUG] Error creating item: {str(e)}")
            print(f"[DEBUG] Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def perform_create(self, serializer):
        """Guardar ítem y actualizar la proforma relacionada"""
        print(f"[DEBUG] perform_create - Validated data: {serializer.validated_data}")
        item = serializer.save()
        # Actualizar totales de la proforma
        item.proforma.save()
    
    def perform_update(self, serializer):
        """Guardar ítem actualizado y actualizar la proforma"""
        item = serializer.save()
        # Actualizar totales de la proforma
        item.proforma.save()
    
    def perform_destroy(self, instance):
        """Eliminar ítem y actualizar la proforma"""
        proforma = instance.proforma
        instance.delete()
        # Actualizar totales de la proforma
        proforma.save()
    
    @swagger_auto_schema(
        operation_description="Valida múltiples ítems contra un modelo de template específico",
        request_body=ProformaItemsValidacionSerializer,
        responses={
            200: "Validación exitosa",
            400: "Error en la validación",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['post'])
    def validar_items_masivo(self, request):
        """
        Valida múltiples ítems contra un modelo de template específico.
        Útil para validar antes de crear/actualizar múltiples ítems.
        """
        serializer = ProformaItemsValidacionSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                "validacion": "exitosa",
                "mensaje": "Todos los ítems cumplen con los requerimientos del modelo",
                "modelo_template": serializer.validated_data['modelo_template']
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Obtiene los ítems de una proforma específica",
        manual_parameters=[
            openapi.Parameter(
                'proforma_id', openapi.IN_QUERY,
                description="ID de la proforma",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaItemSerializer(many=True),
            400: "Parámetro proforma_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'], url_path='por_proforma/(?P<proforma_id>[^/.]+)')
    def por_proforma(self, request, proforma_id=None):
        """
        Devuelve los ítems asociados a una proforma específica.
        El proforma_id se pasa como parte de la URL.
        """
        if proforma_id:
            items = ProformaItem.objects.filter(proforma_id=proforma_id).order_by('orden')
            page = self.paginate_queryset(items)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proforma_id"}, status=status.HTTP_400_BAD_REQUEST)


class ProformaHistorialViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar el historial de proformas.
    Solo permite operaciones de lectura.
    """
    queryset = ProformaHistorial.objects.all()
    serializer_class = ProformaHistorialSerializer
    pagination_class = BasicStandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'accion', 'created_by']
    ordering_fields = ['created_at']
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de una proforma específica",
        manual_parameters=[
            openapi.Parameter(
                'proforma_id', openapi.IN_QUERY,
                description="ID de la proforma",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProformaHistorialSerializer(many=True),
            400: "Parámetro proforma_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_proforma(self, request):
        """
        Devuelve el historial de una proforma específica.
        Requiere el parámetro proforma_id en la URL.
        """
        proforma_id = request.query_params.get('proforma_id', None)
        if proforma_id:
            historial = ProformaHistorial.objects.filter(proforma_id=proforma_id).order_by('-created_at')
            page = self.paginate_queryset(historial)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(historial, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proforma_id"}, status=status.HTTP_400_BAD_REQUEST)


class SecuenciaProformaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar las secuencias de numeración de proformas.
    Solo permite operaciones de lectura.
    """
    queryset = SecuenciaProforma.objects.all()
    serializer_class = SecuenciaProformaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ConfiguracionProformaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar la configuración global de proformas.
    """
    queryset = ConfiguracionProforma.objects.all()
    serializer_class = ConfiguracionProformaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def actual(self, request):
        """
        Devuelve la configuración activa de proformas.
        Si no existe ninguna, crea una configuración predeterminada.
        """
        config = ConfiguracionProforma.get_active_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)

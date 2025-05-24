# backend/productos/views.py

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import os
from django.conf import settings

from .models import (
    ProductoOfertado, ImagenReferenciaProductoOfertado, DocumentoProductoOfertado,
    ProductoDisponible, ImagenProductoDisponible, DocumentoProductoDisponible,
    ProductsPrice, HistorialDeCompras, HistorialDeVentas
)
from .serializers import (
    ProductoOfertadoSerializer, ProductoOfertadoDetalladoSerializer,
    ImagenReferenciaProductoOfertadoSerializer, DocumentoProductoOfertadoSerializer,
    ProductoDisponibleSerializer, ProductoDisponibleDetalladoSerializer,
    ImagenProductoDisponibleSerializer, DocumentoProductoDisponibleSerializer,
    ProductsPriceSerializer, HistorialDeComprasSerializer, HistorialDeVentasSerializer,
    CompraDetalladaSerializer, VentaDetalladaSerializer
)

# Clase base para todos los ViewSets
class ProductsBaseCrudViewSet(viewsets.ModelViewSet):
    """ViewSet base con funcionalidades comunes para todos los modelos de productos"""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Guarda el usuario que crea el registro"""
        try:
            # Enhanced error handling in create
            if not hasattr(self.request, 'user') or not self.request.user.is_authenticated:
                print("⚠️ WARNING: Request user not authenticated in perform_create")
                serializer.save()
                return

            if hasattr(serializer.Meta.model, 'created_by'):
                print(f"✅ Setting created_by to user: {self.request.user.username}")
                serializer.save(created_by=self.request.user)
            else:
                print("ℹ️ Model does not have created_by field")
                serializer.save()
        except Exception as e:
            import traceback
            print(f"❌ ERROR IN PERFORM_CREATE: {str(e)}")
            print(traceback.format_exc())
            # Re-raise to be caught by the main error handler
            raise

    def perform_update(self, serializer):
        """Guarda el usuario que actualiza el registro"""
        try:
            # Enhanced error handling in update
            if not hasattr(self.request, 'user') or not self.request.user.is_authenticated:
                print("⚠️ WARNING: Request user not authenticated in perform_update")
                serializer.save()
                return

            if hasattr(serializer.Meta.model, 'updated_by'):
                print(f"✅ Setting updated_by to user: {self.request.user.username}")
                serializer.save(updated_by=self.request.user)
            else:
                print("ℹ️ Model does not have updated_by field")
                serializer.save()
        except Exception as e:
            import traceback
            print(f"❌ ERROR IN PERFORM_UPDATE: {str(e)}")
            print(traceback.format_exc())
            # Re-raise to be caught by the main error handler
            raise


class ProductoOfertadoViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar productos ofertados.

    Permite crear, ver, editar y eliminar productos ofertados en el sistema.
    """
    queryset = ProductoOfertado.objects.all()
    serializer_class = ProductoOfertadoSerializer
    parser_classes = [MultiPartParser, FormParser]  # Add parser classes for file uploads
    filterset_fields = ['id_categoria', 'code', 'cudim', 'is_active']
    search_fields = ['nombre', 'code', 'cudim', 'descripcion', 'especialidad__nombre', 'especialidad__code', 'referencias']
    ordering_fields = ['nombre', 'code', 'created_at', 'updated_at']
    
    def get_queryset(self):
        """Personaliza el queryset base según se necesite"""
        queryset = ProductoOfertado.objects.all()
        
        # Optimizar consultas incluyendo relaciones necesarias
        queryset = queryset.select_related('id_categoria', 'especialidad')
        queryset = queryset.prefetch_related('imagenes')
        
        # Si estamos en retrieve o en la acción que necesita el conteo, lo añadimos
        if self.action == 'retrieve' or self.action == 'listado_detallado':
            queryset = queryset.annotate(productos_disponibles_count=Count('productos_disponibles'))
            
        return queryset
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'retrieve' or self.action == 'listado_detallado':
            return ProductoOfertadoDetalladoSerializer
        return ProductoOfertadoSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de productos ofertados activos",
        responses={
            200: ProductoOfertadoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los productos ofertados activos.
        """
        productos = ProductoOfertado.objects.filter(is_active=True)
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene un listado detallado de productos ofertados",
        responses={
            200: ProductoOfertadoDetalladoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def listado_detallado(self, request):
        """
        Devuelve un listado detallado de productos ofertados con sus relaciones.
        """
        productos = self.get_queryset()
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = ProductoOfertadoDetalladoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductoOfertadoDetalladoSerializer(productos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene las imágenes asociadas a un producto ofertado",
        responses={
            200: ImagenReferenciaProductoOfertadoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def imagenes(self, request, pk=None):
        """
        Devuelve las imágenes asociadas a un producto ofertado.
        """
        producto = self.get_object()
        imagenes = ImagenReferenciaProductoOfertado.objects.filter(producto_ofertado=producto)
        serializer = ImagenReferenciaProductoOfertadoSerializer(imagenes, many=True)
        
        # Asegurarnos de que cada imagen tenga sus propias URLs correctas con su timestamp único
        data = serializer.data
        for i, imagen_data in enumerate(data):
            if 'urls' in imagen_data:
                imagen = imagenes[i]
                # Extraer el timestamp de la imagen para obtener versiones específicas
                timestamp = imagen.extract_timestamp()
                imagen_data['urls'] = imagen.get_version_urls()
                # Añadir el timestamp para depuración
                imagen_data['timestamp'] = timestamp
        
        return Response(data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los documentos asociados a un producto ofertado",
        responses={
            200: DocumentoProductoOfertadoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        """
        Devuelve los documentos asociados a un producto ofertado.
        """
        producto = self.get_object()
        documentos = DocumentoProductoOfertado.objects.filter(producto_ofertado=producto)
        serializer = DocumentoProductoOfertadoSerializer(documentos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los productos disponibles asociados a un producto ofertado",
        responses={
            200: ProductoDisponibleSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def productos_disponibles(self, request, pk=None):
        """
        Devuelve los productos disponibles asociados a un producto ofertado.
        """
        producto = self.get_object()
        productos_disponibles = ProductoDisponible.objects.filter(id_producto_ofertado=producto)
        serializer = ProductoDisponibleSerializer(productos_disponibles, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Crea un producto ofertado y procesa las imágenes y documentos adjuntos.
        """
        # HOTFIX START - Capture any errors and log them in detail
        import traceback
        import sys

        try:
            # Enhanced request logging for debugging
            print(f"🔄 CREATE REQUEST RECEIVED METHOD: {request.method}")
            print(f"🔄 CREATE REQUEST CONTENT TYPE: {request.content_type}")

            # Log request data
            print(f"🔄 CREATE REQUEST DATA KEYS: {request.data.keys()}")
            print(f"🔄 CREATE REQUEST FILES KEYS: {request.FILES.keys()}")

            # Log important field values for debugging
            print(f"🔄 REQUEST DATA VALUES:")
            for key in ['code', 'cudim', 'nombre', 'id_categoria', 'especialidad']:
                if key in request.data:
                    print(f"  - {key}: {request.data.get(key, 'NOT PROVIDED')} ({type(request.data.get(key)).__name__})")
                else:
                    print(f"  - {key}: MISSING FROM REQUEST")

            # Initialize data structures
            images_data = []
            documents_data = []
            uploaded_images = request.FILES.getlist('uploaded_images', [])
            uploaded_documents = request.FILES.getlist('uploaded_documents', [])

            # Get image metadata if provided
            image_descriptions = request.POST.getlist('image_descriptions', [])
            image_is_primary = request.POST.getlist('image_is_primary', [])
            image_orden = request.POST.getlist('image_orden', [])

            # Get document metadata if provided
            document_titles = request.POST.getlist('document_titles', [])
            document_types = request.POST.getlist('document_types', [])
            document_descriptions = request.POST.getlist('document_descriptions', [])

            # Log for debugging
            print(f"📁 Received {len(uploaded_images)} images and {len(uploaded_documents)} documents")

            # Verify especialidad handling - common source of errors
            if 'especialidad' in request.data:
                especialidad_value = request.data.get('especialidad')
                print(f"🔍 ESPECIALIDAD VALUE: {especialidad_value} (type: {type(especialidad_value).__name__})")

                # Attempt to validate it's a valid ID if provided
                if especialidad_value and str(especialidad_value).strip() and str(especialidad_value).lower() != 'none':
                    from basic.models import Especialidad
                    try:
                        especialidad_id = int(especialidad_value)
                        especialidad_exists = Especialidad.objects.filter(id=especialidad_id).exists()
                        print(f"🔍 Especialidad ID {especialidad_id} exists: {especialidad_exists}")
                        
                        # Si no existe, eliminar del request data para evitar errores
                        if not especialidad_exists:
                            print(f"⚠️ Removing invalid especialidad ID {especialidad_id} from request")
                            # Si estamos usando request.data._mutable, necesitamos habilitarlo
                            if hasattr(request.data, '_mutable'):
                                original_mutable = request.data._mutable
                                request.data._mutable = True
                                request.data['especialidad'] = None
                                request.data._mutable = original_mutable
                            else:
                                # Si es un dict normal o un QueryDict ya mutable
                                request.data['especialidad'] = None
                    except (ValueError, TypeError) as e:
                        print(f"⚠️ Error converting especialidad to integer: {str(e)}")
                        # Eliminar del request para evitar errores
                        if hasattr(request.data, '_mutable'):
                            original_mutable = request.data._mutable
                            request.data._mutable = True
                            request.data['especialidad'] = None
                            request.data._mutable = original_mutable
                        else:
                            request.data['especialidad'] = None
                else:
                    print("🔍 Especialidad is empty, None, or 'none' - setting to null")
                    # Establecer explícitamente a null/None
                    if hasattr(request.data, '_mutable'):
                        original_mutable = request.data._mutable
                        request.data._mutable = True
                        request.data['especialidad'] = None
                        request.data._mutable = original_mutable
                    else:
                        request.data['especialidad'] = None

            # Create the product first
            print("🔄 Validando datos con serializer...")
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print("❌ ERRORES DE VALIDACIÓN:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            print("✅ Datos validados correctamente:", serializer.validated_data)

            try:
                producto = serializer.save()
                print(f"✅ Producto guardado exitosamente con ID: {producto.id}")
            except Exception as save_error:
                import traceback
                print(f"❌ ERROR AL GUARDAR PRODUCTO: {str(save_error)}")
                print(f"❌ TRACEBACK: {traceback.format_exc()}")
                return Response({"error": str(save_error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Ya no intentamos importar el FileHandler, procesaremos directamente

            # Defino funciones auxiliares directamente aquí para evitar dependencias externas
            def process_image_directly(image_file, producto, index=0, metadata=None, user=None):
                print(f"🖼️ Procesando imagen {image_file.name} directamente")

                # Preparar metadatos
                if metadata is None:
                    metadata = {}

                descripcion = metadata.get('descripcion', f"Imagen {index+1} para {producto.nombre}")
                is_primary = metadata.get('is_primary', index == 0)
                orden = metadata.get('orden', index)

                try:
                    # Crear registro de imagen - El modelo manejará el procesamiento
                    from .models import ImagenReferenciaProductoOfertado
                    imagen = ImagenReferenciaProductoOfertado(
                        producto_ofertado=producto,
                        imagen=image_file,  # El método save() del modelo procesará la imagen
                        descripcion=descripcion,
                        is_primary=is_primary,
                        orden=orden
                    )

                    if user:
                        imagen.created_by = user

                    # El método save() del modelo utilizará ImageProcessor para crear las versiones
                    imagen.save()
                    print(f"✅ Imagen guardada con ID: {imagen.id}")
                    print(f"   - Original: {imagen.imagen_original}")
                    print(f"   - Miniatura: {imagen.imagen_thumbnail}")
                    print(f"   - WebP: {imagen.imagen_webp}")

                    return True, "", imagen
                except Exception as e:
                    import traceback
                    print(f"❌ Error guardando imagen: {str(e)}")
                    print(traceback.format_exc())
                    return False, str(e), None

            def process_document_directly(document_file, producto, index=0, metadata=None, user=None):
                print(f"📄 Procesando documento {document_file.name} directamente")

                # Preparar metadatos
                if metadata is None:
                    metadata = {}

                titulo = metadata.get('titulo', f"Documento {index+1}")
                tipo_documento = metadata.get('tipo_documento', 'otros')
                descripcion = metadata.get('descripcion', f"Documento para {producto.nombre}")
                is_public = metadata.get('is_public', True)

                try:
                    # Crear registro de documento - Django manejará el guardado del archivo
                    from .models import DocumentoProductoOfertado
                    documento = DocumentoProductoOfertado(
                        producto_ofertado=producto,
                        documento=document_file,  # Django manejará el guardado automáticamente
                        titulo=titulo,
                        tipo_documento=tipo_documento,
                        descripcion=descripcion,
                        is_public=is_public
                    )

                    if user:
                        documento.created_by = user

                    documento.save()
                    print(f"✅ Documento guardado en base de datos con ID: {documento.id}")

                    return True, "", documento
                except Exception as e:
                    import traceback
                    print(f"❌ Error guardando documento: {str(e)}")
                    print(traceback.format_exc())
                    return False, str(e), None

            # Creamos un objeto con la misma interfaz que FileHandler
            class FileHandler:
                @staticmethod
                def process_image(image_file, producto, index=0, metadata=None, user=None, log_prefix=""):
                    return process_image_directly(image_file, producto, index, metadata, user)

                @staticmethod
                def process_document(document_file, producto, index=0, metadata=None, user=None, log_prefix=""):
                    return process_document_directly(document_file, producto, index, metadata, user)

            # Process uploaded images
            try:
                print(f"🖼️ Processing {len(uploaded_images)} images using FileHandler")

                for i, img_file in enumerate(uploaded_images):
                    print(f"🖼️ Processing image {i+1}/{len(uploaded_images)}: {img_file.name}")

                    # Preparar metadatos para esta imagen
                    img_metadata = {
                        'descripcion': image_descriptions[i] if i < len(image_descriptions) else f"Imagen {i+1} para {producto.nombre}",
                        'is_primary': image_is_primary[i].lower() == 'true' if i < len(image_is_primary) else i==0,
                        'orden': int(image_orden[i]) if i < len(image_orden) and image_orden[i].isdigit() else i
                    }

                    # Obtener el usuario autenticado si existe
                    user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                    # Utilizar el manejador de archivos para procesar la imagen
                    success, error, img_obj = FileHandler.process_image(
                        img_file,
                        producto,
                        i,
                        metadata=img_metadata,
                        user=user,
                        log_prefix="🖼️"
                    )

                    if not success:
                        print(f"⚠️ Error en imagen {i+1}, pero continuamos con las siguientes: {error}")

                print(f"✅ Procesamiento de imágenes completado")
            except Exception as img_error:
                import traceback
                print(f"❌ CRITICAL ERROR PROCESSING IMAGES: {str(img_error)}")
                print(f"❌ IMAGE ERROR TRACEBACK: {traceback.format_exc()}")
                # Continue to documents despite image errors - product record already exists

            # Process uploaded documents
            try:
                print(f"📄 Processing {len(uploaded_documents)} documents using FileHandler")

                for i, doc_file in enumerate(uploaded_documents):
                    print(f"📄 Processing document {i+1}/{len(uploaded_documents)}: {doc_file.name}")

                    # Preparar metadatos para este documento
                    doc_metadata = {
                        'titulo': document_titles[i] if i < len(document_titles) else f"Documento {i+1}",
                        'tipo_documento': document_types[i] if i < len(document_types) else "otros",
                        'descripcion': document_descriptions[i] if i < len(document_descriptions) else f"Documento para {producto.nombre}",
                        'is_public': True
                    }

                    # Obtener el usuario autenticado si existe
                    user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                    # Utilizar el manejador de archivos para procesar el documento
                    success, error, doc_obj = FileHandler.process_document(
                        doc_file,
                        producto,
                        i,
                        metadata=doc_metadata,
                        user=user,
                        log_prefix="📄"
                    )

                    if not success:
                        print(f"⚠️ Error en documento {i+1}, pero continuamos con los siguientes: {error}")

                print(f"✅ Procesamiento de documentos completado")
            except Exception as doc_error:
                import traceback
                print(f"❌ CRITICAL ERROR PROCESSING DOCUMENTS: {str(doc_error)}")
                print(f"❌ DOCUMENT ERROR TRACEBACK: {traceback.format_exc()}")
                # Return product even if document processing failed

            print("✅ PRODUCTO CREADO EXITOSAMENTE - Returning HTTP 201")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as general_error:
            # Capture any other exceptions not caught above
            import traceback
            import sys

            # Get detailed error information
            exc_type, exc_value, exc_traceback = sys.exc_info()
            tb_frames = traceback.extract_tb(exc_traceback)

            # Print super detailed error info
            print("\n\n❌❌❌ CRITICAL ERROR IN PRODUCTO CREATE ❌❌❌")
            print(f"❌ ERROR TYPE: {exc_type.__name__}")
            print(f"❌ ERROR VALUE: {exc_value}")
            print(f"❌ ERROR LOCATION: {tb_frames[-1].filename}:{tb_frames[-1].lineno} in {tb_frames[-1].name}")

            # Print contextual information
            print("\n❌ CONTEXT INFORMATION:")
            print(f"❌ Method: {request.method}")
            print(f"❌ Content Type: {request.content_type}")
            print(f"❌ Data keys: {list(request.data.keys())}")

            # Try to determine if there's an issue with especialidad
            if 'especialidad' in request.data:
                especialidad_value = request.data.get('especialidad')
                print(f"❌ Especialidad value: {especialidad_value} (type: {type(especialidad_value).__name__})")
                if especialidad_value:
                    try:
                        from basic.models import Especialidad
                        try:
                            especialidad_id = int(especialidad_value)
                            exists = Especialidad.objects.filter(id=especialidad_id).exists()
                            print(f"❌ Especialidad ID {especialidad_id} exists in database: {exists}")
                        except (ValueError, TypeError):
                            print(f"❌ Could not convert especialidad value '{especialidad_value}' to integer")
                    except Exception as e:
                        print(f"❌ Error checking especialidad: {e}")

            # Print the full traceback
            print("\n❌ FULL TRACEBACK:")
            traceback.print_exc(file=sys.stdout)

            # Return error response
            return Response(
                {"error": f"Error del servidor: {str(general_error)}. Por favor contacte soporte técnico."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Actualiza un producto ofertado y procesa las imágenes y documentos adjuntos.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Log request for debugging
        print(f"⚡ UPDATE REQUEST para producto ID {instance.id}")
        print(f"⚡ REQUEST DATA KEYS: {request.data.keys()}")
        print(f"⚡ REQUEST FILES KEYS: {request.FILES.keys()}")
        print(f"⚡ REQUEST CONTENT TYPE: {request.content_type}")
        print(f"⚡ REQUEST METHOD: {request.method}")

        try:
            # Intentar obtener el content-type del header
            print(f"⚡ Content-Type header: {request.headers.get('Content-Type', 'No Content-Type header')}")
        except:
            print("⚡ No se pudo leer el header Content-Type")

        uploaded_images = request.FILES.getlist('uploaded_images', [])
        uploaded_documents = request.FILES.getlist('uploaded_documents', [])

        print(f"⚡ Processing {len(uploaded_images)} images and {len(uploaded_documents)} documents")

        # Handle existing images
        existing_images = request.data.get('existing_images', None)
        if existing_images:
            try:
                # Convert from JSON string if necessary
                if isinstance(existing_images, str):
                    import json
                    existing_images = json.loads(existing_images)

                print(f"Keeping existing images with IDs: {existing_images}")
                # Delete images not in the list
                ImagenReferenciaProductoOfertado.objects.filter(
                    producto_ofertado=instance
                ).exclude(id__in=existing_images).delete()
            except Exception as e:
                print(f"Error processing existing_images: {e}")

        # Handle existing documents
        existing_documents = request.data.get('existing_documents', None)
        if existing_documents:
            try:
                # Convert from JSON string if necessary
                if isinstance(existing_documents, str):
                    import json
                    existing_documents = json.loads(existing_documents)

                print(f"Keeping existing documents with IDs: {existing_documents}")
                # Delete documents not in the list
                DocumentoProductoOfertado.objects.filter(
                    producto_ofertado=instance
                ).exclude(id__in=existing_documents).delete()
            except Exception as e:
                print(f"Error processing existing_documents: {e}")

        # Get image metadata if provided
        image_descriptions = request.POST.getlist('image_descriptions', [])
        image_is_primary = request.POST.getlist('image_is_primary', [])
        image_orden = request.POST.getlist('image_orden', [])

        # Get document metadata if provided
        document_titles = request.POST.getlist('document_titles', [])
        document_types = request.POST.getlist('document_types', [])
        document_descriptions = request.POST.getlist('document_descriptions', [])

        # Ya no intentamos importar el FileHandler, procesaremos directamente en el lugar
        class FileHandler:
            @staticmethod
            def process_image(image_file, producto, index=0, metadata=None, user=None, log_prefix=""):
                print(f"{log_prefix} Procesando imagen {image_file.name} directamente en update()")
                # Crear registro de imagen
                from .models import ImagenReferenciaProductoOfertado

                if metadata is None:
                    metadata = {}
                descripcion = metadata.get('descripcion', f"Imagen para {producto.nombre}")
                is_primary = metadata.get('is_primary', index == 0)
                orden = metadata.get('orden', index)

                try:
                    # Crear modelo - Django manejará el guardado del archivo
                    imagen = ImagenReferenciaProductoOfertado(
                        producto_ofertado=producto,
                        imagen=image_file,  # Django manejará el guardado automáticamente
                        descripcion=descripcion,
                        is_primary=is_primary,
                        orden=orden
                    )
                    if user:
                        imagen.created_by = user
                    imagen.save()

                    return True, "", imagen
                except Exception as e:
                    import traceback
                    print(f"❌ Error guardando imagen: {str(e)}")
                    print(traceback.format_exc())
                    return False, str(e), None
            @staticmethod
            def process_document(document_file, producto, index=0, metadata=None, user=None, log_prefix=""):
                print(f"{log_prefix} Procesando documento {document_file.name} directamente en update()")
                # Crear registro de documento
                from .models import DocumentoProductoOfertado

                if metadata is None:
                    metadata = {}
                titulo = metadata.get('titulo', f"Documento {index+1}")
                tipo_documento = metadata.get('tipo_documento', 'otros')
                descripcion = metadata.get('descripcion', f"Documento para {producto.nombre}")
                is_public = metadata.get('is_public', True)

                try:
                    # Crear modelo - Django manejará el guardado del archivo
                    documento = DocumentoProductoOfertado(
                        producto_ofertado=producto,
                        documento=document_file,  # Django manejará el guardado automáticamente
                        titulo=titulo,
                        tipo_documento=tipo_documento,
                        descripcion=descripcion,
                        is_public=is_public
                    )
                    if user:
                        documento.created_by = user
                    documento.save()

                    return True, "", documento
                except Exception as e:
                    import traceback
                    print(f"❌ Error guardando documento: {str(e)}")
                    print(traceback.format_exc())
                    return False, str(e), None

        # Process uploaded images
        try:
            print(f"⚡ Processing {len(uploaded_images)} images using FileHandler")

            for i, img_file in enumerate(uploaded_images):
                print(f"⚡ Processing image {i+1}/{len(uploaded_images)}: {img_file.name}")

                # Preparar metadatos para esta imagen
                img_metadata = {
                    'descripcion': image_descriptions[i] if i < len(image_descriptions) else f"Imagen {i+1} para {instance.nombre}",
                    'is_primary': image_is_primary[i].lower() == 'true' if i < len(image_is_primary) else False,
                    'orden': int(image_orden[i]) if i < len(image_orden) and image_orden[i].isdigit() else i
                }

                # Obtener el usuario autenticado si existe
                user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                # Utilizar el manejador de archivos para procesar la imagen
                success, error, img_obj = FileHandler.process_image(
                    img_file,
                    instance,
                    i,
                    metadata=img_metadata,
                    user=user,
                    log_prefix="⚡"
                )

                if not success:
                    print(f"⚠️ Error en imagen {i+1}, pero continuamos con las siguientes: {error}")

            print(f"✅ Procesamiento de imágenes completado")
        except Exception as img_error:
            import traceback
            print(f"❌ ERROR PROCESSING IMAGES IN UPDATE: {str(img_error)}")
            print(f"❌ IMAGE ERROR TRACEBACK: {traceback.format_exc()}")

        # Process uploaded documents
        try:
            print(f"⚡ Processing {len(uploaded_documents)} documents using FileHandler")

            for i, doc_file in enumerate(uploaded_documents):
                print(f"⚡ Processing document {i+1}/{len(uploaded_documents)}: {doc_file.name}")

                # Preparar metadatos para este documento
                doc_metadata = {
                    'titulo': document_titles[i] if i < len(document_titles) else f"Documento {i+1}",
                    'tipo_documento': document_types[i] if i < len(document_types) else "otros",
                    'descripcion': document_descriptions[i] if i < len(document_descriptions) else f"Documento para {instance.nombre}",
                    'is_public': True
                }

                # Obtener el usuario autenticado si existe
                user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None

                # Utilizar el manejador de archivos para procesar el documento
                success, error, doc_obj = FileHandler.process_document(
                    doc_file,
                    instance,
                    i,
                    metadata=doc_metadata,
                    user=user,
                    log_prefix="⚡"
                )

                if not success:
                    print(f"⚠️ Error en documento {i+1}, pero continuamos con los siguientes: {error}")

            print(f"✅ Procesamiento de documentos completado")
        except Exception as doc_error:
            import traceback
            print(f"❌ ERROR PROCESSING DOCUMENTS IN UPDATE: {str(doc_error)}")
            print(f"❌ DOCUMENT ERROR TRACEBACK: {traceback.format_exc()}")

        # Debugging del estado antes de la actualización
        print(f"⚡ Actualizando producto {instance.id} - {instance.nombre}")
        print(f"⚡ Datos básicos a actualizar: {[k for k in request.data.keys() if not k.startswith('image') and not k.startswith('document') and not k in ['existing_images', 'existing_documents']]}")

        # Update the product itself
        try:
            # Verificar datos de entrada
            print(f"⚡ Datos antes de validar serializer:", {k: request.data.get(k) for k in ['code', 'cudim', 'nombre'] if k in request.data})

            serializer = self.get_serializer(instance, data=request.data, partial=partial)

            # Verificar si el serializer es válido
            if not serializer.is_valid():
                print(f"⚡ ERRORES EN SERIALIZER: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Si llegamos aquí, el serializer es válido
            print("⚡ Serializer válido, guardando cambios...")
            self.perform_update(serializer)
            print("⚡ Producto actualizado correctamente")

            return Response(serializer.data)
        except Exception as e:
            # Capturar cualquier excepción durante la actualización
            print(f"⚡ ERROR DURANTE LA ACTUALIZACIÓN: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImagenReferenciaProductoOfertadoViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar imágenes de referencia de productos ofertados.
    """
    queryset = ImagenReferenciaProductoOfertado.objects.all()
    serializer_class = ImagenReferenciaProductoOfertadoSerializer
    filterset_fields = ['producto_ofertado', 'is_primary']
    search_fields = ['descripcion']
    ordering_fields = ['orden', 'created_at']
    
    def retrieve(self, request, *args, **kwargs):
        """Sobreescribir retrieve para asegurar que se use get_version_urls"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Asegurar que las URLs de las imágenes incluyan el timestamp
        if 'urls' in data:
            data['urls'] = instance.get_version_urls()
            
        return Response(data)


class DocumentoProductoOfertadoViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar documentos de productos ofertados.
    """
    queryset = DocumentoProductoOfertado.objects.all()
    serializer_class = DocumentoProductoOfertadoSerializer
    filterset_fields = ['producto_ofertado', 'tipo_documento', 'is_public']
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['titulo', 'created_at']


class ProductoDisponibleViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar productos disponibles.
    
    Permite crear, ver, editar y eliminar productos disponibles en el sistema.
    """
    queryset = ProductoDisponible.objects.all()
    serializer_class = ProductoDisponibleSerializer
    filterset_fields = [
        'id_categoria', 'id_producto_ofertado', 'code', 'id_marca',
        'unidad_presentacion', 'procedencia', 'is_active'
    ]
    search_fields = ['nombre', 'code', 'modelo', 'referencia']
    ordering_fields = ['nombre', 'code', 'created_at', 'updated_at']
    
    def get_serializer_context(self):
        """Añadir request al contexto para generar URLs absolutas"""
        context = super().get_serializer_context()
        # Asegurar que request siempre esté en el contexto
        if 'request' not in context and hasattr(self, 'request'):
            context['request'] = self.request
        return context
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'retrieve' or self.action == 'listado_detallado':
            return ProductoDisponibleDetalladoSerializer
        return ProductoDisponibleSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to handle errors gracefully"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(f"ERROR EN RETRIEVE PRODUCTO DISPONIBLE: {str(e)}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            # Intentar con serializer simple si falla el detallado
            try:
                instance = self.get_object()
                serializer = ProductoDisponibleSerializer(instance, context={'request': request})
                return Response(serializer.data)
            except Exception as e2:
                print(f"ERROR TAMBIÉN CON SERIALIZER SIMPLE: {str(e2)}")
                return Response(
                    {"error": "Error al obtener el producto", "detail": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    def create(self, request, *args, **kwargs):
        """
        Crea un producto disponible y procesa las imágenes y documentos adjuntos.
        """
        try:
            print(f"🔄 CREATE PRODUCTO DISPONIBLE REQUEST RECEIVED")
            print(f"🔄 REQUEST CONTENT TYPE: {request.content_type}")
            print(f"🔄 REQUEST DATA KEYS: {request.data.keys()}")
            print(f"🔄 REQUEST FILES KEYS: {request.FILES.keys()}")
            
            # Obtener archivos subidos
            uploaded_images = request.FILES.getlist('uploaded_images', [])
            uploaded_documents = request.FILES.getlist('uploaded_documents', [])
            
            # Obtener metadatos de imágenes
            image_descriptions = request.POST.getlist('image_descriptions', [])
            image_is_primary = request.POST.getlist('image_is_primary', [])
            image_orden = request.POST.getlist('image_orden', [])
            
            # Obtener metadatos de documentos
            document_titles = request.POST.getlist('document_titles', [])
            document_types = request.POST.getlist('document_types', [])
            document_descriptions = request.POST.getlist('document_descriptions', [])
            
            print(f"🖼️ Received {len(uploaded_images)} images and {len(uploaded_documents)} documents")
            
            # Crear el producto primero
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            producto = serializer.instance
            
            print(f"✅ Producto disponible creado con ID: {producto.id}")
            
            # Procesar imágenes
            for i, img_file in enumerate(uploaded_images):
                try:
                    print(f"🖼️ Procesando imagen {i+1}/{len(uploaded_images)}: {img_file.name}")
                    
                    descripcion = image_descriptions[i] if i < len(image_descriptions) else f"Imagen {i+1}"
                    is_primary = image_is_primary[i].lower() == 'true' if i < len(image_is_primary) else i == 0
                    orden = int(image_orden[i]) if i < len(image_orden) and image_orden[i].isdigit() else i
                    
                    # Crear la imagen
                    imagen = ImagenProductoDisponible(
                        producto_disponible=producto,
                        imagen=img_file,
                        descripcion=descripcion,
                        is_primary=is_primary,
                        orden=orden
                    )
                    
                    if request.user.is_authenticated:
                        imagen.created_by = request.user
                    
                    imagen.save()
                    print(f"✅ Imagen guardada con ID: {imagen.id}")
                    
                except Exception as e:
                    import traceback
                    print(f"❌ Error al procesar imagen {i+1}: {str(e)}")
                    print(traceback.format_exc())
            
            # Procesar documentos
            for i, doc_file in enumerate(uploaded_documents):
                try:
                    print(f"📄 Procesando documento {i+1}/{len(uploaded_documents)}: {doc_file.name}")
                    
                    titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                    tipo_documento = document_types[i] if i < len(document_types) else "otros"
                    descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                    
                    # Crear el documento
                    documento = DocumentoProductoDisponible(
                        producto_disponible=producto,
                        documento=doc_file,
                        titulo=titulo,
                        tipo_documento=tipo_documento,
                        descripcion=descripcion,
                        is_public=True
                    )
                    
                    if request.user.is_authenticated:
                        documento.created_by = request.user
                    
                    documento.save()
                    print(f"✅ Documento guardado con ID: {documento.id}")
                    
                except Exception as e:
                    import traceback
                    print(f"❌ Error al procesar documento {i+1}: {str(e)}")
                    print(traceback.format_exc())
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            import traceback
            print(f"❌ ERROR EN CREATE PRODUCTO DISPONIBLE: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Error al crear el producto: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualiza un producto disponible y procesa las imágenes y documentos adjuntos.
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            print(f"⚡ UPDATE PRODUCTO DISPONIBLE REQUEST para ID {instance.id}")
            print(f"⚡ REQUEST FILES KEYS: {request.FILES.keys()}")
            
            # Obtener archivos subidos
            uploaded_images = request.FILES.getlist('uploaded_images', [])
            uploaded_documents = request.FILES.getlist('uploaded_documents', [])
            
            # Manejar imágenes existentes
            existing_images = request.data.get('existing_images', None)
            if existing_images:
                try:
                    if isinstance(existing_images, str):
                        import json
                        existing_images = json.loads(existing_images)
                    
                    print(f"Manteniendo imágenes existentes con IDs: {existing_images}")
                    # Eliminar imágenes no incluidas en la lista
                    ImagenProductoDisponible.objects.filter(
                        producto_disponible=instance
                    ).exclude(id__in=existing_images).delete()
                except Exception as e:
                    print(f"Error procesando existing_images: {e}")
            
            # Manejar documentos existentes
            existing_documents = request.data.get('existing_documents', None)
            if existing_documents:
                try:
                    if isinstance(existing_documents, str):
                        import json
                        existing_documents = json.loads(existing_documents)
                    
                    print(f"Manteniendo documentos existentes con IDs: {existing_documents}")
                    # Eliminar documentos no incluidos en la lista
                    DocumentoProductoDisponible.objects.filter(
                        producto_disponible=instance
                    ).exclude(id__in=existing_documents).delete()
                except Exception as e:
                    print(f"Error procesando existing_documents: {e}")
            
            # Obtener metadatos
            image_descriptions = request.POST.getlist('image_descriptions', [])
            image_is_primary = request.POST.getlist('image_is_primary', [])
            image_orden = request.POST.getlist('image_orden', [])
            
            document_titles = request.POST.getlist('document_titles', [])
            document_types = request.POST.getlist('document_types', [])
            document_descriptions = request.POST.getlist('document_descriptions', [])
            
            # Procesar nuevas imágenes
            for i, img_file in enumerate(uploaded_images):
                try:
                    print(f"⚡ Procesando imagen {i+1}/{len(uploaded_images)}: {img_file.name}")
                    
                    descripcion = image_descriptions[i] if i < len(image_descriptions) else f"Imagen {i+1}"
                    is_primary = image_is_primary[i].lower() == 'true' if i < len(image_is_primary) else False
                    orden = int(image_orden[i]) if i < len(image_orden) and image_orden[i].isdigit() else i
                    
                    # Crear la imagen
                    imagen = ImagenProductoDisponible(
                        producto_disponible=instance,
                        imagen=img_file,
                        descripcion=descripcion,
                        is_primary=is_primary,
                        orden=orden
                    )
                    
                    if request.user.is_authenticated:
                        imagen.created_by = request.user
                    
                    imagen.save()
                    print(f"✅ Imagen guardada con ID: {imagen.id}")
                    
                except Exception as e:
                    import traceback
                    print(f"❌ Error al procesar imagen {i+1}: {str(e)}")
                    print(traceback.format_exc())
            
            # Procesar nuevos documentos
            for i, doc_file in enumerate(uploaded_documents):
                try:
                    print(f"⚡ Procesando documento {i+1}/{len(uploaded_documents)}: {doc_file.name}")
                    
                    titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                    tipo_documento = document_types[i] if i < len(document_types) else "otros"
                    descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                    
                    # Crear el documento
                    documento = DocumentoProductoDisponible(
                        producto_disponible=instance,
                        documento=doc_file,
                        titulo=titulo,
                        tipo_documento=tipo_documento,
                        descripcion=descripcion,
                        is_public=True
                    )
                    
                    if request.user.is_authenticated:
                        documento.created_by = request.user
                    
                    documento.save()
                    print(f"✅ Documento guardado con ID: {documento.id}")
                    
                except Exception as e:
                    import traceback
                    print(f"❌ Error al procesar documento {i+1}: {str(e)}")
                    print(traceback.format_exc())
            
            # Actualizar el producto
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}
            
            return Response(serializer.data)
            
        except Exception as e:
            import traceback
            print(f"❌ ERROR EN UPDATE PRODUCTO DISPONIBLE: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Error al actualizar el producto: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @swagger_auto_schema(
        operation_description="Obtiene la lista de productos disponibles activos",
        responses={
            200: ProductoDisponibleSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los productos disponibles activos.
        """
        productos = ProductoDisponible.objects.filter(is_active=True)
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene un listado detallado de productos disponibles",
        responses={
            200: ProductoDisponibleDetalladoSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def listado_detallado(self, request):
        """
        Devuelve un listado detallado de productos disponibles con sus relaciones.
        """
        productos = ProductoDisponible.objects.all()
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = ProductoDisponibleDetalladoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductoDisponibleDetalladoSerializer(productos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene las imágenes asociadas a un producto disponible",
        responses={
            200: ImagenProductoDisponibleSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def imagenes(self, request, pk=None):
        """
        Devuelve las imágenes asociadas a un producto disponible.
        """
        producto = self.get_object()
        imagenes = ImagenProductoDisponible.objects.filter(producto_disponible=producto)
        serializer = ImagenProductoDisponibleSerializer(imagenes, many=True, context={'request': request})
        
        # Asegurarnos de que cada imagen tenga sus propias URLs correctas con su timestamp único
        data = serializer.data
        for i, imagen_data in enumerate(data):
            if 'urls' in imagen_data:
                imagen = imagenes[i]
                # Extraer el timestamp de la imagen para obtener versiones específicas
                timestamp = imagen.extract_timestamp()
                imagen_data['urls'] = imagen.get_version_urls()
                # Añadir el timestamp para depuración
                imagen_data['timestamp'] = timestamp
        
        return Response(data)
    
    @swagger_auto_schema(
        operation_description="Obtiene los documentos asociados a un producto disponible",
        responses={
            200: DocumentoProductoDisponibleSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        """
        Devuelve los documentos asociados a un producto disponible.
        """
        producto = self.get_object()
        documentos = DocumentoProductoDisponible.objects.filter(producto_disponible=producto)
        serializer = DocumentoProductoDisponibleSerializer(documentos, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de precios de un producto disponible",
        responses={
            200: ProductsPriceSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def historial_precios(self, request, pk=None):
        """
        Devuelve el historial de precios de un producto disponible.
        """
        producto = self.get_object()
        precios = ProductsPrice.objects.filter(producto_disponible=producto).order_by('-created_at')
        serializer = ProductsPriceSerializer(precios, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de compras de un producto disponible",
        responses={
            200: HistorialDeComprasSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def historial_compras(self, request, pk=None):
        """
        Devuelve el historial de compras de un producto disponible.
        """
        producto = self.get_object()
        compras = HistorialDeCompras.objects.filter(producto=producto).order_by('-fecha')
        serializer = HistorialDeComprasSerializer(compras, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de ventas de un producto disponible",
        responses={
            200: HistorialDeVentasSerializer(many=True),
            401: "No autenticado",
            403: "Permiso denegado",
            404: "Producto no encontrado"
        }
    )
    @action(detail=True, methods=['get'])
    def historial_ventas(self, request, pk=None):
        """
        Devuelve el historial de ventas de un producto disponible.
        """
        producto = self.get_object()
        ventas = HistorialDeVentas.objects.filter(producto=producto).order_by('-fecha')
        serializer = HistorialDeVentasSerializer(ventas, many=True)
        return Response(serializer.data)


class ImagenProductoDisponibleViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar imágenes de productos disponibles.
    """
    queryset = ImagenProductoDisponible.objects.all()
    serializer_class = ImagenProductoDisponibleSerializer
    filterset_fields = ['producto_disponible', 'is_primary']
    search_fields = ['descripcion']
    ordering_fields = ['orden', 'created_at']
    
    def get_serializer_context(self):
        """Añadir request al contexto para generar URLs absolutas"""
        context = super().get_serializer_context()
        # Asegurar que request siempre esté en el contexto
        if 'request' not in context and hasattr(self, 'request'):
            context['request'] = self.request
        return context
    
    def retrieve(self, request, *args, **kwargs):
        """Sobreescribir retrieve para asegurar que se use get_version_urls"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        data = serializer.data
        
        # Asegurar que las URLs de las imágenes incluyan el timestamp
        if 'urls' in data:
            version_urls = instance.get_version_urls()
            
            # Convertir las URLs relativas a absolutas
            for key in ['original', 'thumbnail', 'webp', 'default']:
                if key in version_urls and version_urls[key]:
                    # Solo convertir si no es una URL absoluta
                    if not version_urls[key].startswith('http'):
                        version_urls[key] = request.build_absolute_uri(version_urls[key])
            
            data['urls'] = version_urls
            
        return Response(data)


class DocumentoProductoDisponibleViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar documentos de productos disponibles.
    """
    queryset = DocumentoProductoDisponible.objects.all()
    serializer_class = DocumentoProductoDisponibleSerializer
    filterset_fields = ['producto_disponible', 'tipo_documento', 'is_public']
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['titulo', 'created_at']


class ProductsPriceViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar precios de productos.
    """
    queryset = ProductsPrice.objects.all()
    serializer_class = ProductsPriceSerializer
    filterset_fields = ['producto_disponible']
    ordering_fields = ['created_at']
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de precios por producto",
        manual_parameters=[
            openapi.Parameter(
                'producto_id', openapi.IN_QUERY,
                description="ID del producto disponible",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: ProductsPriceSerializer(many=True),
            400: "Parámetro producto_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """
        Devuelve el historial de precios por producto.
        Requiere el parámetro producto_id en la URL.
        """
        producto_id = request.query_params.get('producto_id', None)
        if producto_id:
            precios = ProductsPrice.objects.filter(producto_disponible_id=producto_id).order_by('-created_at')
            page = self.paginate_queryset(precios)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(precios, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro producto_id"}, status=status.HTTP_400_BAD_REQUEST)


class HistorialDeComprasViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar el historial de compras.
    """
    queryset = HistorialDeCompras.objects.all()
    serializer_class = HistorialDeComprasSerializer
    filterset_fields = ['producto', 'proveedor', 'empresa', 'fecha']
    search_fields = ['factura']
    ordering_fields = ['fecha', 'created_at']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'retrieve':
            return CompraDetalladaSerializer
        return HistorialDeComprasSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de compras por producto",
        manual_parameters=[
            openapi.Parameter(
                'producto_id', openapi.IN_QUERY,
                description="ID del producto disponible",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: HistorialDeComprasSerializer(many=True),
            400: "Parámetro producto_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """
        Devuelve el historial de compras por producto.
        Requiere el parámetro producto_id en la URL.
        """
        producto_id = request.query_params.get('producto_id', None)
        if producto_id:
            compras = HistorialDeCompras.objects.filter(producto_id=producto_id).order_by('-fecha')
            page = self.paginate_queryset(compras)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(compras, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro producto_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de compras por proveedor",
        manual_parameters=[
            openapi.Parameter(
                'proveedor_id', openapi.IN_QUERY,
                description="ID del proveedor",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: HistorialDeComprasSerializer(many=True),
            400: "Parámetro proveedor_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_proveedor(self, request):
        """
        Devuelve el historial de compras por proveedor.
        Requiere el parámetro proveedor_id en la URL.
        """
        proveedor_id = request.query_params.get('proveedor_id', None)
        if proveedor_id:
            compras = HistorialDeCompras.objects.filter(proveedor_id=proveedor_id).order_by('-fecha')
            page = self.paginate_queryset(compras)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(compras, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro proveedor_id"}, status=status.HTTP_400_BAD_REQUEST)


class HistorialDeVentasViewSet(ProductsBaseCrudViewSet):
    """
    API endpoint para gestionar el historial de ventas.
    """
    queryset = HistorialDeVentas.objects.all()
    serializer_class = HistorialDeVentasSerializer
    filterset_fields = ['producto', 'cliente', 'empresa', 'fecha']
    search_fields = ['factura']
    ordering_fields = ['fecha', 'created_at']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'retrieve':
            return VentaDetalladaSerializer
        return HistorialDeVentasSerializer
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de ventas por producto",
        manual_parameters=[
            openapi.Parameter(
                'producto_id', openapi.IN_QUERY,
                description="ID del producto disponible",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: HistorialDeVentasSerializer(many=True),
            400: "Parámetro producto_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """
        Devuelve el historial de ventas por producto.
        Requiere el parámetro producto_id en la URL.
        """
        producto_id = request.query_params.get('producto_id', None)
        if producto_id:
            ventas = HistorialDeVentas.objects.filter(producto_id=producto_id).order_by('-fecha')
            page = self.paginate_queryset(ventas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(ventas, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro producto_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Obtiene el historial de ventas por cliente",
        manual_parameters=[
            openapi.Parameter(
                'cliente_id', openapi.IN_QUERY,
                description="ID del cliente",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: HistorialDeVentasSerializer(many=True),
            400: "Parámetro cliente_id no proporcionado",
            401: "No autenticado",
            403: "Permiso denegado"
        }
    )
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """
        Devuelve el historial de ventas por cliente.
        Requiere el parámetro cliente_id en la URL.
        """
        cliente_id = request.query_params.get('cliente_id', None)
        if cliente_id:
            ventas = HistorialDeVentas.objects.filter(cliente_id=cliente_id).order_by('-fecha')
            page = self.paginate_queryset(ventas)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(ventas, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere el parámetro cliente_id"}, status=status.HTTP_400_BAD_REQUEST)


# Controlador simplificado para crear productos ofertados sin depender de file_handler
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_producto_ofertado_simple(request):
    """
    Endpoint simplificado para crear productos ofertados.
    No depende del módulo file_handler.
    """
    print("📣 Recibida petición para crear producto ofertado simplificado")
    print(f"📣 MÉTODO: {request.method}")
    print(f"📣 CONTENT TYPE: {request.content_type}")
    print(f"📣 DATA KEYS: {request.data.keys()}")
    print(f"📣 FILES KEYS: {request.FILES.keys()}")

    # Validar datos básicos del producto
    serializer = ProductoOfertadoSerializer(data=request.data)
    if not serializer.is_valid():
        print("❌ ERRORES DE VALIDACIÓN:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Verificar especialidad para evitar errores comunes
    if 'especialidad' in request.data:
        especialidad_value = request.data.get('especialidad')
        print(f"🔍 ESPECIALIDAD VALUE: {especialidad_value} (type: {type(especialidad_value).__name__})")

        if especialidad_value and str(especialidad_value).strip() and str(especialidad_value).lower() != 'none':
            from basic.models import Especialidad
            try:
                especialidad_id = int(especialidad_value)
                especialidad_exists = Especialidad.objects.filter(id=especialidad_id).exists()
                print(f"🔍 Especialidad ID {especialidad_id} exists: {especialidad_exists}")

                if not especialidad_exists:
                    print(f"⚠️ Removing invalid especialidad ID {especialidad_id} from request")
                    if hasattr(request.data, '_mutable'):
                        original_mutable = request.data._mutable
                        request.data._mutable = True
                        request.data['especialidad'] = None
                        request.data._mutable = original_mutable
                    else:
                        request.data['especialidad'] = None
            except (ValueError, TypeError) as e:
                print(f"⚠️ Error converting especialidad to integer: {str(e)}")
                if hasattr(request.data, '_mutable'):
                    original_mutable = request.data._mutable
                    request.data._mutable = True
                    request.data['especialidad'] = None
                    request.data._mutable = original_mutable
                else:
                    request.data['especialidad'] = None
        else:
            print("🔍 Especialidad is empty, None, or 'none' - setting to null")
            if hasattr(request.data, '_mutable'):
                original_mutable = request.data._mutable
                request.data._mutable = True
                request.data['especialidad'] = None
                request.data._mutable = original_mutable
            else:
                request.data['especialidad'] = None

    # Crear el producto
    try:
        producto = serializer.save()
        if hasattr(request, 'user') and request.user.is_authenticated and hasattr(producto, 'created_by'):
            producto.created_by = request.user
            producto.save()
        print(f"✅ Producto guardado exitosamente con ID: {producto.id}")
    except Exception as e:
        import traceback
        print(f"❌ ERROR AL GUARDAR PRODUCTO: {str(e)}")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Procesar imágenes
    uploaded_images = request.FILES.getlist('uploaded_images', [])
    image_descriptions = request.POST.getlist('image_descriptions', [])
    image_is_primary = request.POST.getlist('image_is_primary', [])
    image_orden = request.POST.getlist('image_orden', [])

    print(f"📣 Procesando {len(uploaded_images)} imágenes")

    for i, img_file in enumerate(uploaded_images):
        print(f"🖼️ Procesando imagen {i+1}/{len(uploaded_images)}: {img_file.name}")

        try:
            # Preparar metadatos
            descripcion = image_descriptions[i] if i < len(image_descriptions) else f"Imagen {i+1} para {producto.nombre}"
            is_primary = image_is_primary[i].lower() == 'true' if i < len(image_is_primary) else i == 0
            orden = int(image_orden[i]) if i < len(image_orden) and image_orden[i].isdigit() else i

            # Crear modelo - Django manejará el guardado del archivo
            from .models import ImagenReferenciaProductoOfertado
            imagen = ImagenReferenciaProductoOfertado(
                producto_ofertado=producto,
                imagen=img_file,  # Django manejará el guardado automáticamente
                descripcion=descripcion,
                is_primary=is_primary,
                orden=orden
            )

            if hasattr(request, 'user') and request.user.is_authenticated:
                imagen.created_by = request.user

            imagen.save()
            print(f"✅ Imagen registrada con ID: {imagen.id}")
        except Exception as e:
            import traceback
            print(f"❌ Error al procesar imagen {i+1}: {str(e)}")
            print(traceback.format_exc())
            # Continuamos con la siguiente imagen

    # Procesar documentos
    uploaded_documents = request.FILES.getlist('uploaded_documents', [])
    document_titles = request.POST.getlist('document_titles', [])
    document_types = request.POST.getlist('document_types', [])
    document_descriptions = request.POST.getlist('document_descriptions', [])

    print(f"📣 Procesando {len(uploaded_documents)} documentos")

    for i, doc_file in enumerate(uploaded_documents):
        print(f"📄 Procesando documento {i+1}/{len(uploaded_documents)}: {doc_file.name}")

        try:
            # Preparar metadatos
            titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
            tipo_documento = document_types[i] if i < len(document_types) else "otros"
            descripcion = document_descriptions[i] if i < len(document_descriptions) else f"Documento para {producto.nombre}"

            # Crear modelo - Django manejará el guardado del archivo
            from .models import DocumentoProductoOfertado
            documento = DocumentoProductoOfertado(
                producto_ofertado=producto,
                documento=doc_file,  # Django manejará el guardado automáticamente
                titulo=titulo,
                tipo_documento=tipo_documento,
                descripcion=descripcion,
                is_public=True
            )

            if hasattr(request, 'user') and request.user.is_authenticated:
                documento.created_by = request.user

            documento.save()
            print(f"✅ Documento registrado con ID: {documento.id}")
        except Exception as e:
            import traceback
            print(f"❌ Error al procesar documento {i+1}: {str(e)}")
            print(traceback.format_exc())
            # Continuamos con el siguiente documento

    print("✅ PRODUCTO CREADO EXITOSAMENTE - Returning HTTP 201")
    return Response(serializer.data, status=status.HTTP_201_CREATED)
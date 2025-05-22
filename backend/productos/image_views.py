from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import ProductoOfertado, ProductoDisponible, ImagenReferenciaProductoOfertado, ImagenProductoDisponible
from .image_processor import ImageProcessor
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_product_image(request, product_id, product_type='ofertado'):
    """
    Vista para subir una imagen a un producto.
    Procesa la imagen creando versiones: original, miniatura y webp.
    """
    try:
        # Obtener el producto
        if product_type == 'ofertado':
            producto = ProductoOfertado.objects.get(pk=product_id)
            ImageModel = ImagenReferenciaProductoOfertado
        else:
            producto = ProductoDisponible.objects.get(pk=product_id)
            ImageModel = ImagenProductoDisponible
        
        # Verificar archivo de imagen
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No se proporcionó ninguna imagen'}, status=400)
        
        image_file = request.FILES['image']
        
        # Obtener metadatos si se proporcionan
        metadata = {
            'titulo': request.POST.get('titulo', ''),
            'descripcion': request.POST.get('descripcion', ''),
            'orden': int(request.POST.get('orden', 0)),
            'is_primary': request.POST.get('is_primary', 'false').lower() == 'true'
        }
        
        # Crear instancia de imagen
        kwargs = {'imagen': image_file,
                  'titulo': metadata['titulo'],
                  'descripcion': metadata['descripcion'],
                  'orden': metadata['orden'],
                  'is_primary': metadata['is_primary'],
                  'created_by': request.user}
        
        if product_type == 'ofertado':
            kwargs['producto_ofertado'] = producto
        else:
            kwargs['producto_disponible'] = producto
        
        imagen = ImageModel(**kwargs)
        
        # Guardar - el procesamiento se hace automáticamente en el método save()
        imagen.save()
        
        # Verificar que se hayan guardado correctamente las rutas de imagen
        if not imagen.imagen_webp or not imagen.imagen_original or not imagen.imagen_thumbnail:
            logger.error(f"Imagen guardada pero faltan rutas: webp={imagen.imagen_webp}, original={imagen.imagen_original}, thumbnail={imagen.imagen_thumbnail}")
            # Si falta alguna ruta, intentar procesarla de nuevo
            from productos.image_processor import ImageProcessor
            from django.core.files.storage import default_storage
            import os
            
            # Verificar si la imagen original todavía está disponible
            if not hasattr(imagen.imagen, 'file') or not imagen.imagen:
                return JsonResponse({
                    'error': 'No se pudo procesar la imagen correctamente. La imagen original no está disponible.'
                }, status=500)
            
            # Obtener la ruta base para las imágenes
            codigo = producto.code
            base_path = f'productos/{"productosofertados" if product_type == "ofertado" else "productosdisponibles"}/imagenes/{codigo}'
            media_root = settings.MEDIA_ROOT
            full_base_path = os.path.join(media_root, base_path)
            
            # Volver a procesar la imagen
            processor = ImageProcessor()
            versions = processor.process_image(imagen.imagen, full_base_path)
            
            # Actualizar las rutas
            if 'original' in versions:
                imagen.imagen_original = os.path.relpath(versions['original'], media_root)
            if 'thumbnail' in versions:
                imagen.imagen_thumbnail = os.path.relpath(versions['thumbnail'], media_root)
            if 'webp' in versions:
                imagen.imagen_webp = os.path.relpath(versions['webp'], media_root)
            
            # Guardar el modelo actualizado
            imagen.save(update_fields=['imagen_original', 'imagen_thumbnail', 'imagen_webp'])
        
        # Extraer el timestamp para la consistencia entre versiones
        timestamp = imagen.extract_timestamp()
        
        # Preparar respuesta
        response_data = {
            'id': imagen.id,
            'titulo': imagen.titulo,
            'descripcion': imagen.descripcion,
            'orden': imagen.orden,
            'is_primary': imagen.is_primary,
            'urls': imagen.get_version_urls(),
            'imagen_original': imagen.imagen_original,
            'imagen_thumbnail': imagen.imagen_thumbnail,
            'imagen_webp': imagen.imagen_webp,
            'timestamp': timestamp,
            'metadata': {
                'width': imagen.width,
                'height': imagen.height,
                'size': imagen.file_size,
                'format': imagen.format
            }
        }
        
        return JsonResponse(response_data, status=201)
        
    except (ProductoOfertado.DoesNotExist, ProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error al subir imagen: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product_images(request, product_id, product_type='ofertado'):
    """
    Obtiene todas las imágenes de un producto.
    """
    try:
        # Obtener el producto
        if product_type == 'ofertado':
            producto = ProductoOfertado.objects.get(pk=product_id)
            imagenes = producto.imagenes.all().order_by('orden')
        else:
            producto = ProductoDisponible.objects.get(pk=product_id)
            imagenes = producto.imagenes.all().order_by('orden')
        
        # Serializar imágenes
        images_data = []
        for imagen in imagenes:
            images_data.append({
                'id': imagen.id,
                'titulo': imagen.titulo,
                'descripcion': imagen.descripcion,
                'orden': imagen.orden,
                'is_primary': imagen.is_primary,
                'urls': imagen.get_version_urls(),
                'metadata': {
                    'width': imagen.width,
                    'height': imagen.height,
                    'size': imagen.file_size,
                    'format': imagen.format
                }
            })
        
        return JsonResponse({'images': images_data})
        
    except (ProductoOfertado.DoesNotExist, ProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error al obtener imágenes: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_image(request, image_id, product_type='ofertado'):
    """
    Elimina una imagen de producto.
    """
    try:
        # Obtener la imagen
        if product_type == 'ofertado':
            imagen = ImagenReferenciaProductoOfertado.objects.get(pk=image_id)
        else:
            imagen = ImagenProductoDisponible.objects.get(pk=image_id)
        
        # Verificar permisos (opcional - agregar lógica de permisos aquí)
        # if not request.user.has_perm('productos.delete_imagen'):
        #     return JsonResponse({'error': 'Sin permisos para eliminar'}, status=403)
        
        # Eliminar la imagen
        imagen.delete()
        
        return JsonResponse({'success': True, 'message': 'Imagen eliminada correctamente'})
        
    except (ImagenReferenciaProductoOfertado.DoesNotExist, ImagenProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Imagen no encontrada'}, status=404)
    except Exception as e:
        logger.error(f"Error al eliminar imagen: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_image_order(request, product_id, product_type='ofertado'):
    """
    Actualiza el orden de las imágenes de un producto.
    """
    try:
        # Obtener el producto
        if product_type == 'ofertado':
            producto = ProductoOfertado.objects.get(pk=product_id)
            ImageModel = ImagenReferenciaProductoOfertado
        else:
            producto = ProductoDisponible.objects.get(pk=product_id)
            ImageModel = ImagenProductoDisponible
        
        # Obtener el nuevo orden de las imágenes
        image_order = request.data.get('image_order', [])
        
        # Actualizar el orden
        for index, image_id in enumerate(image_order):
            filter_kwargs = {'id': image_id}
            if product_type == 'ofertado':
                filter_kwargs['producto_ofertado'] = producto
            else:
                filter_kwargs['producto_disponible'] = producto
            
            ImageModel.objects.filter(**filter_kwargs).update(orden=index)
        
        return JsonResponse({'success': True, 'message': 'Orden actualizado correctamente'})
        
    except (ProductoOfertado.DoesNotExist, ProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error al actualizar orden: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
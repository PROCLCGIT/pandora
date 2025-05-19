from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .product_images import ProductImage
from .models import ProductoOfertado, ProductoDisponible
import json

@csrf_exempt
def upload_product_image(request, product_id, product_type='ofertado'):
    """
    Vista para subir una imagen a un producto.
    Args:
        request: Objeto HttpRequest
        product_id: ID del producto
        product_type: Tipo de producto ('ofertado' o 'disponible')
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        if product_type == 'ofertado':
            product = ProductoOfertado.objects.get(id=product_id)
            product_field = 'producto_ofertado'
        else:  # 'disponible'
            product = ProductoDisponible.objects.get(id=product_id)
            product_field = 'producto_disponible'
    except (ProductoOfertado.DoesNotExist, ProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'No se proporcionó ninguna imagen'}, status=400)
    
    image_file = request.FILES['image']
    title = request.POST.get('title', '')
    alt_text = request.POST.get('alt_text', '')
    is_featured = json.loads(request.POST.get('is_featured', 'false').lower())
    
    # Datos para crear la nueva imagen
    image_data = {
        product_field: product,
        'title': title,
        'alt_text': alt_text,
        'original': image_file,
        'is_featured': is_featured,
        'order': ProductImage.objects.filter(**{product_field: product}).count(),  # Orden al final
        'created_by': request.user if request.user.is_authenticated else None
    }
    
    # Crear la nueva imagen
    image = ProductImage(**image_data)
    image.save()
    
    # Devolver URLs de las diferentes versiones
    return JsonResponse({
        'id': image.id,
        'original': request.build_absolute_uri(image.original.url),
        'thumbnail': request.build_absolute_uri(image.thumbnail.url),
        'standard': request.build_absolute_uri(image.standard.url),
        'large': request.build_absolute_uri(image.large.url),
        'title': image.title,
        'alt_text': image.alt_text,
        'is_featured': image.is_featured,
    }, status=201)

@csrf_exempt
def delete_product_image(request, image_id):
    """
    Vista para eliminar una imagen de un producto.
    Args:
        request: Objeto HttpRequest
        image_id: ID de la imagen a eliminar
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        image = ProductImage.objects.get(id=image_id)
    except ProductImage.DoesNotExist:
        return JsonResponse({'error': 'Imagen no encontrada'}, status=404)
    
    # Verificar los permisos aquí si es necesario
    
    image.delete()
    return JsonResponse({'success': True}, status=200)

@csrf_exempt
def update_product_image(request, image_id):
    """
    Vista para actualizar una imagen de un producto.
    Args:
        request: Objeto HttpRequest
        image_id: ID de la imagen a actualizar
    """
    if request.method != 'PATCH':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        image = ProductImage.objects.get(id=image_id)
    except ProductImage.DoesNotExist:
        return JsonResponse({'error': 'Imagen no encontrada'}, status=404)
    
    data = json.loads(request.body)
    
    # Actualizar campos según los datos recibidos
    if 'title' in data:
        image.title = data['title']
    
    if 'alt_text' in data:
        image.alt_text = data['alt_text']
    
    if 'is_featured' in data and data['is_featured']:
        image.is_featured = True
    
    image.save()  # El método save se encarga de actualizar el estado "is_featured" de otras imágenes
    
    return JsonResponse({
        'id': image.id,
        'original': request.build_absolute_uri(image.original.url),
        'thumbnail': request.build_absolute_uri(image.thumbnail.url),
        'standard': request.build_absolute_uri(image.standard.url),
        'large': request.build_absolute_uri(image.large.url),
        'title': image.title,
        'alt_text': image.alt_text,
        'is_featured': image.is_featured,
    })

@csrf_exempt
def reorder_product_images(request, product_id, product_type='ofertado'):
    """
    Vista para reordenar las imágenes de un producto.
    Args:
        request: Objeto HttpRequest
        product_id: ID del producto
        product_type: Tipo de producto ('ofertado' o 'disponible')
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    data = json.loads(request.body)
    image_id = data.get('image_id')
    new_order = data.get('new_order')
    
    if image_id is None or new_order is None:
        return JsonResponse({'error': 'Faltan parámetros requeridos'}, status=400)
    
    try:
        if product_type == 'ofertado':
            product = ProductoOfertado.objects.get(id=product_id)
            product_field = 'producto_ofertado'
        else:  # 'disponible'
            product = ProductoDisponible.objects.get(id=product_id)
            product_field = 'producto_disponible'
    except (ProductoOfertado.DoesNotExist, ProductoDisponible.DoesNotExist):
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    
    try:
        image = ProductImage.objects.get(id=image_id, **{product_field: product})
    except ProductImage.DoesNotExist:
        return JsonResponse({'error': 'Imagen no encontrada'}, status=404)
    
    # Obtener todas las imágenes ordenadas
    images = list(ProductImage.objects.filter(**{product_field: product}).order_by('order'))
    
    # Remover la imagen a reordenar
    images.remove(image)
    
    # Insertar en la nueva posición
    new_order = max(0, min(new_order, len(images)))
    images.insert(new_order, image)
    
    # Actualizar el orden de todas las imágenes
    for i, img in enumerate(images):
        img.order = i
        img.save(update_fields=['order'])
    
    return JsonResponse({'success': True})

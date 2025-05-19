# backend/productos/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import image_views

# Crear router para registrar los viewsets
router = DefaultRouter()

# Registrar los viewsets
router.register(r'productos-ofertados', views.ProductoOfertadoViewSet, basename='producto-ofertado')
router.register(r'imagenes-referencia', views.ImagenReferenciaProductoOfertadoViewSet, basename='imagen-referencia')
router.register(r'documentos-ofertados', views.DocumentoProductoOfertadoViewSet, basename='documento-ofertado')
router.register(r'productos-disponibles', views.ProductoDisponibleViewSet, basename='producto-disponible')
router.register(r'imagenes-disponibles', views.ImagenProductoDisponibleViewSet, basename='imagen-disponible')
router.register(r'documentos-disponibles', views.DocumentoProductoDisponibleViewSet, basename='documento-disponible')
router.register(r'precios', views.ProductsPriceViewSet, basename='precio')
router.register(r'compras', views.HistorialDeComprasViewSet, basename='compra')
router.register(r'ventas', views.HistorialDeVentasViewSet, basename='venta')

# Patrón URL para incluir en urls.py del proyecto
app_name = 'products'

urlpatterns = [
    # Incluir todas las rutas generadas por el router
    path('', include(router.urls)),


    # Nueva ruta para evitar problemas con file_handler
    path('productos-ofertados-simple/', views.create_producto_ofertado_simple, name='create-producto-ofertado-simple'),

    # Rutas personalizadas adicionales si son necesarias
    path('productos-ofertados/<int:pk>/imagenes/', 
         views.ProductoOfertadoViewSet.as_view({'get': 'imagenes'}), 
         name='producto-ofertado-imagenes'),
    
    path('productos-ofertados/<int:pk>/documentos/', 
         views.ProductoOfertadoViewSet.as_view({'get': 'documentos'}), 
         name='producto-ofertado-documentos'),
    
    path('productos-ofertados/<int:pk>/productos-disponibles/', 
         views.ProductoOfertadoViewSet.as_view({'get': 'productos_disponibles'}), 
         name='producto-ofertado-productos-disponibles'),
    
    path('productos-disponibles/<int:pk>/imagenes/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'imagenes'}), 
         name='producto-disponible-imagenes'),
    
    path('productos-disponibles/<int:pk>/documentos/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'documentos'}), 
         name='producto-disponible-documentos'),
    
    path('productos-disponibles/<int:pk>/historial-precios/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'historial_precios'}), 
         name='producto-disponible-historial-precios'),
    
    path('productos-disponibles/<int:pk>/historial-compras/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'historial_compras'}), 
         name='producto-disponible-historial-compras'),
    
    path('productos-disponibles/<int:pk>/historial-ventas/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'historial_ventas'}), 
         name='producto-disponible-historial-ventas'),
    
    # Rutas adicionales para acciones filtradas
    path('productos-ofertados/activos/', 
         views.ProductoOfertadoViewSet.as_view({'get': 'activos'}), 
         name='productos-ofertados-activos'),
    
    path('productos-ofertados/listado-detallado/', 
         views.ProductoOfertadoViewSet.as_view({'get': 'listado_detallado'}), 
         name='productos-ofertados-detallados'),
    
    path('productos-disponibles/activos/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'activos'}), 
         name='productos-disponibles-activos'),
    
    path('productos-disponibles/listado-detallado/', 
         views.ProductoDisponibleViewSet.as_view({'get': 'listado_detallado'}), 
         name='productos-disponibles-detallados'),
    
    path('precios/por-producto/', 
         views.ProductsPriceViewSet.as_view({'get': 'por_producto'}), 
         name='precios-por-producto'),
    
    path('compras/por-producto/', 
         views.HistorialDeComprasViewSet.as_view({'get': 'por_producto'}), 
         name='compras-por-producto'),
    
    path('compras/por-proveedor/', 
         views.HistorialDeComprasViewSet.as_view({'get': 'por_proveedor'}), 
         name='compras-por-proveedor'),
    
    path('ventas/por-producto/', 
         views.HistorialDeVentasViewSet.as_view({'get': 'por_producto'}), 
         name='ventas-por-producto'),
    
    path('ventas/por-cliente/', 
         views.HistorialDeVentasViewSet.as_view({'get': 'por_cliente'}), 
         name='ventas-por-cliente'),
    
    # Nuevas rutas para la gestión de imágenes procesadas
    path('products/<int:product_id>/images/upload/', 
         image_views.upload_product_image, 
         name='upload-product-image-ofertado'),
    
    path('products/<int:product_id>/disponible/images/upload/', 
         lambda request, product_id: image_views.upload_product_image(request, product_id, 'disponible'), 
         name='upload-product-image-disponible'),
    
    path('images/<int:image_id>/', 
         image_views.delete_product_image, 
         name='delete-product-image'),
    
    path('products/<int:product_id>/images/order/', 
         image_views.update_image_order, 
         name='update-image-order-ofertado'),
    
    path('products/<int:product_id>/disponible/images/order/', 
         lambda request, product_id: image_views.update_image_order(request, product_id, 'disponible'), 
         name='update-image-order-disponible'),
]
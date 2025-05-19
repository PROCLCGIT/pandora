# backend/inventario/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UnidadViewSet, CategoriaViewSet, ProductoInventarioViewSet, 
    AlmacenViewSet, UbicacionViewSet, ExistenciaViewSet,
    MovimientoInventarioViewSet, ProveedorViewSet, OrdenCompraViewSet,
    LineaOrdenCompraViewSet, ClienteViewSet, OrdenVentaViewSet,
    LineaOrdenVentaViewSet, ReservaInventarioViewSet
)

app_name = 'inventario'

router = DefaultRouter()
router.register(r'unidades', UnidadViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoInventarioViewSet)
router.register(r'almacenes', AlmacenViewSet)
router.register(r'ubicaciones', UbicacionViewSet)
router.register(r'existencias', ExistenciaViewSet)
router.register(r'movimientos', MovimientoInventarioViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'ordenes-compra', OrdenCompraViewSet)
router.register(r'lineas-compra', LineaOrdenCompraViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'ordenes-venta', OrdenVentaViewSet)
router.register(r'lineas-venta', LineaOrdenVentaViewSet)
router.register(r'reservas', ReservaInventarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClienteViewSet,
    ProveedorViewSet,
    VendedorViewSet,
    ContactoViewSet,
    RelacionBlueViewSet,
    TagViewSet,
)

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'vendedores', VendedorViewSet)
router.register(r'contactos', ContactoViewSet)
router.register(r'relaciones', RelacionBlueViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]



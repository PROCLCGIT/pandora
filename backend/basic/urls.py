# backend/basic/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet, CiudadViewSet, EmpresaClcViewSet, EspecialidadViewSet,
    MarcaViewSet, ProcedenciaViewSet, TipoClienteViewSet, TipoContratacionViewSet,
    UnidadViewSet, ZonaViewSet, ZonaCiudadViewSet
)

# Crear router y registrar ViewSets
router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'ciudades', CiudadViewSet)
router.register(r'empresas', EmpresaClcViewSet)
router.register(r'especialidades', EspecialidadViewSet)
router.register(r'marcas', MarcaViewSet)
router.register(r'procedencias', ProcedenciaViewSet)
router.register(r'tipos-cliente', TipoClienteViewSet)
router.register(r'tipos-contratacion', TipoContratacionViewSet)
router.register(r'unidades', UnidadViewSet)
router.register(r'zonas', ZonaViewSet)
router.register(r'zona-ciudad', ZonaCiudadViewSet)

app_name = 'basic'

urlpatterns = [
    path('', include(router.urls)),
]
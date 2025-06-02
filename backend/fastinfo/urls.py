from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NombreEntidadViewSet, DatosInstitucionalesViewSet

router = DefaultRouter()
router.register(r'nombres-entidad', NombreEntidadViewSet)
router.register(r'datos-institucionales', DatosInstitucionalesViewSet)

app_name = 'fastinfo'

urlpatterns = [
    path('', include(router.urls)),
]
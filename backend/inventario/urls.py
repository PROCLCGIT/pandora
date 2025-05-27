from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'almacenes', views.AlmacenViewSet)
router.register(r'stocks', views.StockViewSet)
router.register(r'tipos-movimiento', views.TipoMovimientoViewSet)
router.register(r'movimientos', views.MovimientoViewSet)
router.register(r'alertas', views.AlertaStockViewSet)

app_name = 'inventario'

urlpatterns = [
    path('', include(router.urls)),
]

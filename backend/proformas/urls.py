# backend/proformas/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Crear un router para registrar los ViewSets
router = DefaultRouter()
router.register(r'proformas', views.ProformaViewSet, basename='proforma')
router.register(r'items', views.ProformaItemViewSet, basename='proforma-item')
router.register(r'historial', views.ProformaHistorialViewSet, basename='proforma-historial')
router.register(r'secuencias', views.SecuenciaProformaViewSet, basename='secuencia-proforma')
router.register(r'configuracion', views.ConfiguracionProformaViewSet, basename='configuracion-proforma')

app_name = 'proformas'

urlpatterns = [
    # Incluir URLs generadas automáticamente por el router
    path('', include(router.urls)),
    
    # Atajo para acceder a la configuración actual
    path('configuracion-actual/', views.ConfiguracionProformaViewSet.as_view({'get': 'actual'}), name='configuracion-actual'),
    
    # Atajo para resumen de estados de proformas
    path('resumen-estados/', views.ProformaViewSet.as_view({'get': 'resumen_estados'}), name='resumen-estados'),
    
    # Atajos para filtros comunes
    path('proformas-por-vencer/', views.ProformaViewSet.as_view({'get': 'por_vencer'}), name='proformas-por-vencer'),
    path('proformas-por-estado/<str:estado>/', views.ProformaViewSet.as_view({'get': 'por_estado'}), name='proformas-por-estado'),
    path('proformas-por-cliente/<int:cliente_id>/', views.ProformaViewSet.as_view({'get': 'por_cliente'}), name='proformas-por-cliente'),
    
    # Acción para generar reporte
    path('proformas/<int:pk>/reporte/', views.ProformaViewSet.as_view({'get': 'generar_reporte'}), name='proforma-reporte'),
    
    # Acción para generar PDF
    path('proformas/<int:pk>/generar_pdf/', views.ProformaViewSet.as_view({'get': 'generar_pdf'}), name='proforma-generar-pdf'),
    
    # Acción para duplicar proforma
    path('proformas/<int:pk>/duplicar/', views.ProformaViewSet.as_view({'post': 'duplicar'}), name='proforma-duplicar'),
    
    # Acción para cambiar estado
    path('proformas/<int:pk>/cambiar-estado/', views.ProformaViewSet.as_view({'post': 'cambiar_estado'}), name='proforma-cambiar-estado'),
    
    # Atajos para ítems por proforma
    path('items-por-proforma/<int:proforma_id>/', views.ProformaItemViewSet.as_view({'get': 'por_proforma'}), name='items-por-proforma'),
    
    # Atajos para historial por proforma
    path('historial-por-proforma/<int:proforma_id>/', views.ProformaHistorialViewSet.as_view({'get': 'por_proforma'}), name='historial-por-proforma'),
]
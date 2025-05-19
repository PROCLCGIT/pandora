from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImportTaskViewSet, ExportViewSet

router = DefaultRouter()
router.register(r'import-tasks', ImportTaskViewSet)
router.register(r'export', ExportViewSet, basename='export')

urlpatterns = [
    path('', include(router.urls)),
]

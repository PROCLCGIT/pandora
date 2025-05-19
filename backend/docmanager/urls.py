from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, TagViewSet, DocumentViewSet, CollectionViewSet, GroupViewSet,
    debug_auth
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'collections', CollectionViewSet, basename='collection')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('', include(router.urls)),
    path('debug/auth/', debug_auth, name='debug_auth'),
]
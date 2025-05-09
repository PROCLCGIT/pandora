"""
URLs para la aplicación de usuarios.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet)

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
]
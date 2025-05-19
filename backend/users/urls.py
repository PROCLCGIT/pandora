"""
URLs para la aplicación de usuarios.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .auth_views import (
    CookieTokenObtainPairView, 
    CookieTokenRefreshView,
    CookieTokenVerifyView,
    CookieTokenLogoutView,
    AuthDebugView,
    RequestDebugView
)

router = DefaultRouter()
router.register(r'', UserViewSet)

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
    # Rutas de autenticación
    path('auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', CookieTokenVerifyView.as_view(), name='token_verify'),
    path('auth/logout/', CookieTokenLogoutView.as_view(), name='token_logout'),
    # Diagnóstico (solo en DEBUG)
    path('auth/debug/', AuthDebugView.as_view(), name='auth_debug'),
    path('auth/request-debug/', RequestDebugView.as_view(), name='request_debug'),
]
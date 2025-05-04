# pandora/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# Configuración de la documentación Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="Pandora API",
        default_version='v1',
        description="API para la gestión integral de insumos médicos y servicios de mantenimiento",
        terms_of_service="https://www.tusitio.com/terms/",
        contact=openapi.Contact(email="contacto@tusitio.com"),
        license=openapi.License(name="Licencia Privada"),
    ),
    public=True,
    permission_classes=(permissions.IsAuthenticated,),  # Cambiado para requerir autenticación
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # APIs de las aplicaciones
    path('api/users/', include('users.urls')),
    path('api/basic/', include('basic.urls')),
    path('api/directorio/', include('directorio.urls')),
    
    # URLs para autenticación JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # URLs para la documentación con Swagger/OpenAPI
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
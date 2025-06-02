# pandora/urls.py
import sys
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from users.auth_views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CookieTokenVerifyView,
    CookieTokenLogoutView,
    AuthDebugView,
    RequestDebugView,
)

urlpatterns = [
    # Redirect root URL to admin
    path('', RedirectView.as_view(url='/admin/', permanent=True), name='index'),
    
    path('admin/', admin.site.urls),
    
    # APIs de las aplicaciones
    path('api/users/', include('users.urls')),
    path('api/basic/', include('basic.urls')),
    path('api/directorio/', include('directorio.urls')),
    path('api/productos/', include('productos.urls', namespace='productos')),
    path('api/importexport/', include('importexport.urls')),
    path('api/docmanager/', include('docmanager.urls')),  # Añadida esta línea
    path('api/proformas/', include('proformas.urls')),
    path('api/brief/', include('brief.urls')),  # Módulo de gestión de briefs
    path('api/inventario/', include('inventario.urls')),
    path('api/fastinfo/', include('fastinfo.urls')),  # Módulo de información rápida institucional
    
    # URLs para autenticación JWT con cookies (nuevas)
    path('api/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair_cookie'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh_cookie'),
    path('api/auth/verify/', CookieTokenVerifyView.as_view(), name='token_verify_cookie'),
    path('api/auth/logout/', CookieTokenLogoutView.as_view(), name='token_logout_cookie'),
    path('api/auth/debug/', AuthDebugView.as_view(), name='auth_debug'),
    path('api/auth/log-request/', RequestDebugView.as_view(), name='request_debug'),
    
    # URLs para autenticación JWT tradicional (mantener para compatibilidad)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

# --- Inicio: Configuración retardada de drf-yasg ---
# Solo importar y configurar drf-yasg si no estamos en una fase temprana de carga
# que cause problemas (esto es una heurística, podría necesitar ajuste)
if 'runserver' in settings.INSTALLED_APPS or 'manage.py' not in sys.argv[0]: # Evitar ejecutar durante checks iniciales si es posible
    try:
        from drf_yasg.views import get_schema_view
        from drf_yasg import openapi

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
           permission_classes=(permissions.IsAuthenticated,), 
        )

        # Añadir URLs de drf-yasg a urlpatterns
        urlpatterns += [
            re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
            path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
            path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
        ]
    except ImportError as e:
        print(f"Could not import drf-yasg, API documentation will be unavailable: {e}")
# --- Fin: Configuración retardada de drf-yasg ---


# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

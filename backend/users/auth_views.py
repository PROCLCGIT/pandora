"""
Vistas personalizadas para autenticación con JWT usando cookies HttpOnly.
"""
from datetime import datetime
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.conf import settings
from django.middleware import csrf

logger = logging.getLogger(__name__)

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT (login) y almacenarlos en cookies HttpOnly.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # Obtenemos la respuesta original que genera los tokens
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                data = response.data
                
                # Usa SECURE_COOKIES de la configuración global para cookies seguras
                secure_cookies = settings.SECURE_COOKIES
                
                # Configuramos el token de acceso como una cookie HttpOnly
                access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
                response.set_cookie(
                    key=access_cookie_name,
                    value=data['access'],
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    httponly=True,  # Importante: Siempre httpOnly para proteger el token
                    samesite='Lax',  # Compromiso entre seguridad y usabilidad
                    secure=secure_cookies,  # Configurable: True en producción
                    path='/'
                )
                
                # Configuramos el token de refresco como una cookie HttpOnly
                refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
                response.set_cookie(
                    key=refresh_cookie_name,
                    value=data['refresh'],
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                    httponly=True,  # Importante: Siempre httpOnly para proteger el token
                    samesite='Lax',  # Compromiso entre seguridad y usabilidad
                    secure=secure_cookies,  # Configurable: True en producción
                    path='/'
                )
                
                # Generamos token CSRF para protección contra CSRF
                csrf_token = csrf.get_token(request)
                response.set_cookie(
                    key='csrftoken',
                    value=csrf_token,
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    samesite='Lax',
                    secure=secure_cookies,  # Configurable: True en producción
                    path='/',
                    httponly=False  # Debe ser accesible por JavaScript para CSRF
                )
                
                # Incluir información útil del usuario en la respuesta
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(data['access'])
                user_id = token.get('user_id')
                
                # Devolvemos información mínima en la respuesta JSON
                response.data = {
                    'success': True,
                    'user_id': user_id,
                    'detail': 'Autenticación exitosa',
                    'csrf_token': csrf_token,
                }
            
            return response
        
        except Exception as e:
            # Log de errores para diagnóstico
            logger.error(f"Error en CookieTokenObtainPairView: {str(e)}")
            return Response({
                'success': False,
                'detail': 'Error de autenticación',
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class CookieTokenRefreshView(TokenRefreshView):
    """
    Vista personalizada para refrescar tokens JWT usando cookies.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        # Obtenemos el token de refresco de la cookie usando el nombre definido en settings
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name)
        
        if not refresh_token:
            return Response({'detail': 'No se encontró el token de refresco'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Creamos una copia mutable de los datos de la solicitud
        mutable_data = request.data.copy()
        mutable_data['refresh'] = refresh_token
        
        # Reemplazamos el cuerpo de la solicitud con nuestra versión mutable
        request._full_data = mutable_data
        
        try:
            # Procesamos el token como lo haría la vista original
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                data = response.data
                
                # Usa SECURE_COOKIES de la configuración global para cookies seguras
                secure_cookies = settings.SECURE_COOKIES
                
                # Actualizamos la cookie de acceso
                access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
                response.set_cookie(
                    key=access_cookie_name,
                    value=data['access'],
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    httponly=True,  # Importante: Siempre httpOnly para proteger el token
                    samesite='Lax',  # Compromiso entre seguridad y usabilidad
                    secure=secure_cookies,  # Configurable: True en producción
                    path='/'
                )
                
                # Si la rotación de tokens está activada, actualizamos también el token de refresco
                if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False):
                    refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
                    response.set_cookie(
                        key=refresh_cookie_name,
                        value=data['refresh'],
                        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                        httponly=True,  # Importante: Siempre httpOnly para proteger el token
                        samesite='Lax',  # Compromiso entre seguridad y usabilidad
                        secure=secure_cookies,  # Configurable: True en producción
                        path='/'
                    )
                
                # Generamos token CSRF para protección contra CSRF
                csrf_token = csrf.get_token(request)
                response.set_cookie(
                    key='csrftoken',
                    value=csrf_token,
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    samesite='Lax',
                    secure=secure_cookies,  # Configurable: True en producción
                    path='/',
                    httponly=False  # Debe ser accesible por JavaScript para CSRF
                )
                
                # Devolvemos información mínima en la respuesta JSON
                response.data = {
                    'detail': 'Token refrescado exitosamente',
                    'csrf_token': csrf_token,
                }
                
                return response
            
        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Error inesperado en CookieTokenRefreshView: {str(e)}")
            return Response({
                'detail': 'Error al refrescar token',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return response


class CookieTokenVerifyView(APIView):
    """
    Vista personalizada para verificar tokens JWT usando cookies.
    """
    permission_classes = [AllowAny]
    # Desactivar throttling para este endpoint específico
    throttle_classes = []
    
    def post(self, request, *args, **kwargs):
        # Implementar rate limiting manual más inteligente por IP
        ip = self._get_client_ip(request)
        cache_key = f'verify_throttle_{ip}'
        time_key = f'verify_throttle_time_{ip}'
        
        from django.core.cache import cache
        import time
        
        # Obtener último timestamp y contador
        last_request_time = cache.get(time_key, 0)
        request_count = cache.get(cache_key, 0)
        current_time = time.time()
        
        # Calcular tiempo desde la última solicitud en segundos
        time_diff = current_time - last_request_time
        
        # Estrategia de rate limiting adaptativa:
        # - Si las solicitudes están muy espaciadas (>10s), reiniciar el contador
        # - Permitir ráfagas iniciales (hasta 10 solicitudes) sin restricción
        # - Después, aplicar límites más estrictos (hasta 1000 solicitudes/min)
        
        # Reiniciar contador si ha pasado suficiente tiempo
        if time_diff > 10 and request_count > 0:
            request_count = 0
        
        # Verificar si hay demasiadas solicitudes
        # Umbral más alto para las primeras solicitudes, luego más restrictivo
        limit = 1000 if request_count < 10 else 30  # Permitir más al inicio
        
        if request_count > limit:
            # Tiempo de espera basado en cuánto se ha excedido el límite
            retry_after = min(60, max(5, request_count // 10))
            
            # Incluir cabecera Retry-After para clientes que la respeten
            headers = {'Retry-After': str(retry_after)}
            
            return Response(
                {
                    'detail': 'Demasiadas solicitudes, por favor intente más tarde.',
                    'retry_after_seconds': retry_after
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers=headers
            )
        
        # Incrementar contador solo si la solicitud es reciente (últimos 60s)
        if time_diff < 60:
            cache.set(cache_key, request_count + 1, 60)  # 1 minuto de caducidad
        else:
            # Primera solicitud en un periodo nuevo
            cache.set(cache_key, 1, 60)
        
        # Actualizar timestamp
        cache.set(time_key, current_time, 120)  # 2 minutos de caducidad
        
        # Para depuración (solo si no es excesivo)
        if request_count < 10 or request_count % 10 == 0:
            print(f"Rate limit para {ip}: {request_count + 1}/{limit}")
        
        # Obtener el token de acceso de la cookie usando el nombre definido en settings
        access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        access_token = request.COOKIES.get(access_cookie_name)
        
        if not access_token:
            return Response(
                {'detail': 'No se encontró el token de acceso'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Validamos el token con la clase correcta (AccessToken)
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(access_token)
            
            # Extraemos información útil del token
            user_id = token.get('user_id')
            exp = datetime.fromtimestamp(token.get('exp'))
            now = datetime.now()
            
            # Calculamos tiempo restante en minutos
            remaining_time = (exp - now).total_seconds() / 60
            
            # Incluir cabecera de caché para evitar verificaciones frecuentes
            # Cache-Control solo aplica si el cliente respeta las cabeceras HTTP
            cache_time = min(int(remaining_time * 60), 120)  # En segundos, máximo 2 minutos
            headers = {
                'Cache-Control': f'private, max-age={cache_time}',
                'X-Auth-Expires-In': str(int(remaining_time * 60))
            }
            
            # Si llegamos aquí, el token es válido
            return Response({
                'detail': 'Token válido',
                'user_id': user_id,
                'expires_in_minutes': round(remaining_time, 1)
            }, status=status.HTTP_200_OK, headers=headers)
            
        except (InvalidToken, TokenError) as e:
            # Errores específicos de validación de token
            return Response({
                'detail': f'Token inválido o expirado: {str(e)}'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            # Otros errores inesperados que deberían ser registrados
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error inesperado en verificación de token: {str(e)}")
            return Response({
                'detail': 'Error al procesar la verificación del token'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    def _get_client_ip(self, request):
        """Obtener la IP del cliente teniendo en cuenta posibles proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class CookieTokenLogoutView(APIView):
    """
    Vista para cerrar sesión y eliminar tokens JWT.
    """
    permission_classes = [AllowAny]  # Permitir cerrar sesión incluso sin tokens válidos
    throttle_classes = []  # No limitar cierre de sesión
    
    def post(self, request, *args, **kwargs):
        # Obtenemos el token de refresco de la cookie usando el nombre definido en settings
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name)
        
        success = True
        message = 'Sesión cerrada exitosamente'
        
        # Verificar que la app token_blacklist esté instalada
        blacklist_enabled = 'rest_framework_simplejwt.token_blacklist' in settings.INSTALLED_APPS
        
        if refresh_token and blacklist_enabled:
            try:
                # Comprobar si las tablas de blacklist están creadas
                from django.db import connection
                with connection.cursor() as cursor:
                    try:
                        # Intentar consultar si la tabla existe
                        cursor.execute(
                            "SELECT 1 FROM information_schema.tables WHERE table_name=%s",
                            ['token_blacklist_blacklistedtoken']
                        )
                        table_exists = cursor.fetchone() is not None
                    except Exception:
                        # En caso de error, asumimos que la tabla no existe
                        table_exists = False
                
                if table_exists:
                    # Añadimos el token a la lista negra
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                else:
                    logger.warning(
                        "La tabla de blacklist no existe. Ejecuta 'python manage.py migrate' "
                        "para completar la configuración del blacklist de tokens."
                    )
                    message = 'Sesión cerrada (blacklist no migrado)'
            except (InvalidToken, TokenError):
                # Si el token ya está en la lista negra o es inválido, lo ignoramos
                success = True  # Seguimos considerando éxito
                message = 'Sesión cerrada (token inválido)'
            except Exception as e:
                # Capturamos otras excepciones pero seguimos con el proceso
                logger.error(f"Error inesperado al invalidar token: {str(e)}")
                success = True  # Seguimos considerando éxito para asegurar el borrado de cookies
                message = 'Sesión cerrada (error al invalidar token)'
        elif not blacklist_enabled and refresh_token:
            logger.warning(
                "rest_framework_simplejwt.token_blacklist no está en INSTALLED_APPS. "
                "Los tokens no serán invalidados al cerrar sesión."
            )
            message = 'Sesión cerrada (blacklist no habilitado)'
        else:
            message = 'Sesión cerrada (no había token)'
        
        # Creamos la respuesta y eliminamos las cookies
        response = Response({
            'success': success,
            'detail': message
        }, status=status.HTTP_200_OK)
        
        # Asegurarnos de eliminar todas las cookies independientemente del resultado
        # Usando nombres de cookies desde settings
        access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        response.delete_cookie(access_cookie_name, path='/')
        response.delete_cookie(refresh_cookie_name, path='/')
        response.delete_cookie('csrftoken', path='/')
        
        return response


class AuthDebugView(APIView):
    """
    Vista de diagnóstico para problemas de autenticación.
    Solo disponible si DEBUG=True.
    """
    permission_classes = [AllowAny]
    throttle_classes = []
    
    def get(self, request, *args, **kwargs):
        if not settings.DEBUG:
            return Response({
                'error': 'Esta ruta solo está disponible en modo DEBUG'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Recopilar información de diagnóstico
        # Obtener nombres de cookies desde settings
        access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        
        debug_info = {
            'cookies': {k: v for k, v in request.COOKIES.items() if k not in [access_cookie_name, refresh_cookie_name]},
            'cookies_present': {
                access_cookie_name: access_cookie_name in request.COOKIES,
                refresh_cookie_name: refresh_cookie_name in request.COOKIES,
                'csrftoken': 'csrftoken' in request.COOKIES,
            },
            'headers': {k: v for k, v in request.headers.items() if k.lower() != 'authorization'},
            'auth_header_present': 'authorization' in [k.lower() for k in request.headers.keys()],
            'csrf_token': csrf.get_token(request),
            'server_time': datetime.now().isoformat(),
            'cookie_settings': {
                'secure': settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', not settings.DEBUG),
                'httponly': True,
                'samesite': 'Lax',
                'access_max_age': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                'refresh_max_age': settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            },
            'cors_settings': {
                'cors_allow_credentials': getattr(settings, 'CORS_ALLOW_CREDENTIALS', None),
                'cors_allow_all_origins': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', None),
                'cors_allowed_origins': getattr(settings, 'CORS_ALLOWED_ORIGINS', None),
            }
        }
        
        # Verificar presencia y validez de tokens
        access_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        access_token = request.COOKIES.get(access_cookie_name)
        if access_token:
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(access_token)
                user_id = token.get('user_id')
                exp = datetime.fromtimestamp(token.get('exp'))
                now = datetime.now()
                remaining_time = (exp - now).total_seconds() / 60
                
                debug_info['access_token_info'] = {
                    'valid': True,
                    'user_id': user_id,
                    'expires_at': exp.isoformat(),
                    'expires_in_minutes': round(remaining_time, 1),
                }
            except Exception as e:
                debug_info['access_token_info'] = {
                    'valid': False,
                    'error': str(e)
                }
        
        return Response(debug_info)


class RequestDebugView(APIView):
    """
    Vista para log detallado de solicitudes.
    Solo para diagnóstico en desarrollo.
    """
    permission_classes = [AllowAny]
    throttle_classes = []
    
    def post(self, request, *args, **kwargs):
        if not settings.DEBUG:
            return Response({
                'error': 'Esta ruta solo está disponible en modo DEBUG'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Recopilar información detallada de la solicitud
        request_data = {
            'method': request.method,
            'path': request.path,
            'headers': dict(request.headers.items()),
            'cookies': request.COOKIES,
            'client_ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
            'body': request.data if hasattr(request, 'data') else None,
            'time': datetime.now().isoformat(),
            'referrer': request.META.get('HTTP_REFERER', None),
            'is_ajax': request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest',
            'is_secure': request.is_secure(),
        }
        
        # Log detallado
        print("\n=== DETAILED REQUEST LOG ===")
        print(f"TIME: {request_data['time']}")
        print(f"IP: {request_data['client_ip']}")
        print(f"PATH: {request_data['method']} {request_data['path']}")
        print(f"USER AGENT: {request_data['user_agent']}")
        print(f"REFERRER: {request_data['referrer']}")
        print("HEADERS:")
        for key, value in request_data['headers'].items():
            print(f"  {key}: {value}")
        print("=== END REQUEST LOG ===\n")
        
        return Response({
            'message': 'Request logged successfully',
            'request_info': request_data
        })
    
    def _get_client_ip(self, request):
        """Obtener la IP del cliente teniendo en cuenta posibles proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
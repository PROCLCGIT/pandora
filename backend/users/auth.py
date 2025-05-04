"""
Vistas personalizadas para autenticación con JWT usando cookies HttpOnly.
"""
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.conf import settings
from django.middleware import csrf

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT (login) y almacenarlos en cookies HttpOnly.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Obtenemos la respuesta original que genera los tokens
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            data = response.data
            
            # Configuramos el token de acceso como una cookie HttpOnly
            response.set_cookie(
                key='access_token',
                value=data['access'],
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                samesite='Lax',  # 'Lax' es un buen compromiso entre seguridad y usabilidad
                secure=not settings.DEBUG,  # Solo HTTPS en producción
                path='/'
            )
            
            # Configuramos el token de refresco como una cookie HttpOnly
            response.set_cookie(
                key='refresh_token',
                value=data['refresh'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                path='/'
            )
            
            # Generamos token CSRF para protección contra CSRF
            csrf_token = csrf.get_token(request)
            response.set_cookie(
                key='csrftoken',
                value=csrf_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                samesite='Lax',
                secure=not settings.DEBUG,
                path='/'
            )
            
            # Devolvemos información mínima en la respuesta JSON
            response.data = {
                'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'detail': 'Autenticación exitosa',
                'csrf_token': csrf_token,
            }
        
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Vista personalizada para refrescar tokens JWT usando cookies.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        # Obtenemos el token de refresco de la cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'detail': 'No se encontró el token de refresco'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Reemplazamos el cuerpo de la solicitud para incluir el token obtenido de la cookie
        request.data['refresh'] = refresh_token
        
        try:
            # Procesamos el token como lo haría la vista original
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                data = response.data
                
                # Actualizamos la cookie de acceso
                response.set_cookie(
                    key='access_token',
                    value=data['access'],
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    httponly=True,
                    samesite='Lax',
                    secure=not settings.DEBUG,
                    path='/'
                )
                
                # Si la rotación de tokens está activada, actualizamos también el token de refresco
                if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False):
                    response.set_cookie(
                        key='refresh_token',
                        value=data['refresh'],
                        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                        httponly=True,
                        samesite='Lax',
                        secure=not settings.DEBUG,
                        path='/'
                    )
                
                # Generamos token CSRF para protección contra CSRF
                csrf_token = csrf.get_token(request)
                response.set_cookie(
                    key='csrftoken',
                    value=csrf_token,
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                    samesite='Lax',
                    secure=not settings.DEBUG,
                    path='/'
                )
                
                # Devolvemos información mínima en la respuesta JSON
                response.data = {
                    'detail': 'Token refrescado exitosamente',
                    'csrf_token': csrf_token,
                }
                
                return response
            
        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
        return response


class CookieTokenVerifyView(APIView):
    """
    Vista personalizada para verificar tokens JWT usando cookies.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        # Obtenemos el token de acceso de la cookie
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return Response({'detail': 'No se encontró el token de acceso'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Validamos el token
            RefreshToken(access_token)
            
            # Si llegamos aquí, el token es válido
            return Response({'detail': 'Token válido'}, status=status.HTTP_200_OK)
            
        except TokenError:
            return Response({'detail': 'Token inválido o expirado'}, status=status.HTTP_401_UNAUTHORIZED)


class CookieTokenLogoutView(APIView):
    """
    Vista para cerrar sesión y eliminar tokens JWT.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Obtenemos el token de refresco de la cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                # Añadimos el token a la lista negra
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                # Si el token ya está en la lista negra o es inválido, lo ignoramos
                pass
        
        # Creamos la respuesta y eliminamos las cookies
        response = Response({'detail': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)
        
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        response.delete_cookie('csrftoken', path='/')
        
        return response


class CookieTokenAuthenticationBackend:
    """
    Backend de autenticación personalizado para procesar tokens JWT desde cookies.
    
    Este backend puede registrarse en settings.py para que Django Rest Framework
    pueda autenticar automáticamente a los usuarios usando cookies HttpOnly.
    """
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return None
        
        try:
            # Validamos el token y obtenemos el payload
            from rest_framework_simplejwt.authentication import JWTAuthentication
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(access_token)
            user = jwt_auth.get_user(validated_token)
            
            return (user, validated_token)
        except:
            return None
    
    def get_user(self, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
"""
Modelo de usuario personalizado para la aplicación.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Modelo de usuario personalizado que extiende el modelo base de Django.
    Permite añadir campos adicionales específicos de la aplicación.
    """
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(_('phone number'), max_length=15, blank=True, null=True)
    position = models.CharField(_('position'), max_length=100, blank=True)
    department = models.CharField(_('department'), max_length=100, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Campos adicionales para seguimiento
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    # Define el campo para iniciar sesión
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        db_table = 'auth_user'  # Explicitly use the auth_user table

    def __str__(self):
        return self.username
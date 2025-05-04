"""
Señales para la aplicación de usuarios.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Señal para realizar acciones adicionales cuando se crea un usuario.
    Por ejemplo, enviar un correo de bienvenida o crear perfiles asociados.
    """
    if created:
        # Aquí puedes añadir lógica adicional al crear un usuario
        pass
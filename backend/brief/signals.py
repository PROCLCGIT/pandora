from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Brief, BriefHistory

@receiver(pre_save, sender=Brief)
def brief_pre_save(sender, instance, **kwargs):
    """Signal antes de guardar brief para registrar cambios"""
    if instance.pk:  # Solo si es una actualización
        try:
            old_instance = Brief.objects.get(pk=instance.pk)
            
            # Comparar campos importantes y registrar cambios
            fields_to_track = [
                'estado', 'priority', 'operador', 'presupuesto',
                'tiempo_entrega', 'due_date'
            ]
            
            for field in fields_to_track:
                old_value = getattr(old_instance, field)
                new_value = getattr(instance, field)
                
                if old_value != new_value:
                    # El registro del cambio se hará en post_save
                    # para tener acceso al usuario que hace el cambio
                    pass
                    
        except Brief.DoesNotExist:
            pass

@receiver(post_save, sender=Brief)
def brief_post_save(sender, instance, created, **kwargs):
    """Signal después de guardar brief"""
    if created:
        # Lógica para cuando se crea un nuevo brief
        # Por ejemplo, enviar notificaciones
        pass
    else:
        # Lógica para cuando se actualiza un brief
        pass
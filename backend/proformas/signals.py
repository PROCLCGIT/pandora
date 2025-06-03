# backend/proformas/signals.py

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
import logging

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=ProformaItem)
def actualizar_totales_proforma_on_item_save(sender, instance, created, **kwargs):
    """
    Actualiza totales de la proforma cuando se guarda un ítem.
    """
    if instance.proforma_id:
        # Usar transaction.on_commit para evitar loops en save()
        transaction.on_commit(lambda: instance.proforma.recalcular_totales())
        
        # Log para auditoría
        if created:
            logger.info(f"Nuevo ítem agregado a proforma {instance.proforma.numero}: {instance.codigo}")
        else:
            logger.info(f"Ítem actualizado en proforma {instance.proforma.numero}: {instance.codigo}")


@receiver(post_delete, sender=ProformaItem)
def actualizar_totales_proforma_on_item_delete(sender, instance, **kwargs):
    """
    Actualiza totales de la proforma cuando se elimina un ítem.
    """
    if instance.proforma_id:
        try:
            proforma = Proforma.objects.get(pk=instance.proforma_id)
            proforma.recalcular_totales()
            logger.info(f"Ítem eliminado de proforma {proforma.numero}: {instance.codigo}")
        except Proforma.DoesNotExist:
            logger.warning(f"Proforma no encontrada al eliminar ítem: {instance.proforma_id}")


@receiver(pre_save, sender=Proforma)
def track_proforma_changes(sender, instance, **kwargs):
    """
    Rastrea cambios en la proforma para crear historial.
    """
    if instance.pk:
        try:
            # Obtener el estado anterior
            original = Proforma.objects.get(pk=instance.pk)
            instance._original_estado = original.estado
            instance._original_total = original.total
        except Proforma.DoesNotExist:
            instance._original_estado = None
            instance._original_total = None
    else:
        instance._original_estado = None
        instance._original_total = None


@receiver(post_save, sender=Proforma)
def crear_historial_proforma(sender, instance, created, **kwargs):
    """
    Crea entrada en el historial cuando se modifica una proforma.
    """
    user = getattr(instance, 'modified_by', None) or getattr(instance, 'created_by', None)
    
    if not user:
        # Fallback a un usuario admin si no se especifica
        user = User.objects.filter(is_superuser=True).first()
    
    if created:
        # Proforma creada
        ProformaHistorial.objects.create(
            proforma=instance,
            accion=ProformaHistorial.TipoAccion.CREACION,
            estado_nuevo=instance.estado,
            notas=f"Proforma creada con número {instance.numero}",
            created_by=user
        )
        logger.info(f"Proforma creada: {instance.numero} por {user}")
        
    else:
        # Proforma modificada
        estado_anterior = getattr(instance, '_original_estado', None)
        total_anterior = getattr(instance, '_original_total', None)
        
        # Crear historial si cambió el estado
        if estado_anterior and estado_anterior != instance.estado:
            # Determinar el tipo de acción basado en el cambio de estado
            tipo_accion = ProformaHistorial.TipoAccion.MODIFICACION
            
            if instance.estado == Proforma.EstadoProforma.ENVIADA:
                tipo_accion = ProformaHistorial.TipoAccion.ENVIO
            elif instance.estado == Proforma.EstadoProforma.APROBADA:
                tipo_accion = ProformaHistorial.TipoAccion.APROBACION
            elif instance.estado == Proforma.EstadoProforma.RECHAZADA:
                tipo_accion = ProformaHistorial.TipoAccion.RECHAZO
            elif instance.estado == Proforma.EstadoProforma.VENCIDA:
                tipo_accion = ProformaHistorial.TipoAccion.VENCIMIENTO
            elif instance.estado == Proforma.EstadoProforma.CONVERTIDA:
                tipo_accion = ProformaHistorial.TipoAccion.CONVERSION
            
            ProformaHistorial.objects.create(
                proforma=instance,
                accion=tipo_accion,
                estado_anterior=estado_anterior,
                estado_nuevo=instance.estado,
                notas=f"Estado cambiado de {estado_anterior} a {instance.estado}",
                created_by=user
            )
            
            logger.info(f"Estado de proforma {instance.numero} cambiado: {estado_anterior} -> {instance.estado}")
        
        # Crear historial si cambió el total significativamente
        elif total_anterior and abs(instance.total - total_anterior) > 0.01:
            ProformaHistorial.objects.create(
                proforma=instance,
                accion=ProformaHistorial.TipoAccion.MODIFICACION,
                estado_anterior=instance.estado,
                estado_nuevo=instance.estado,
                campo_modificado='total',
                valor_anterior=str(total_anterior),
                valor_nuevo=str(instance.total),
                notas=f"Total modificado de ${total_anterior} a ${instance.total}",
                created_by=user
            )
            
            logger.info(f"Total de proforma {instance.numero} modificado: {total_anterior} -> {instance.total}")


@receiver(post_save, sender=User)
def crear_configuracion_proforma_default(sender, instance, created, **kwargs):
    """
    Crea configuración de proforma por defecto si es el primer usuario admin.
    """
    if created and instance.is_superuser:
        # Verificar si ya existe una configuración
        if not ConfiguracionProforma.objects.exists():
            try:
                from basic.models import EmpresaClc
                empresa = EmpresaClc.objects.first()
                
                if empresa:
                    ConfiguracionProforma.objects.create(
                        empresa_predeterminada=empresa,
                        texto_condiciones_pago="Pago a 30 días de la fecha de emisión",
                        texto_tiempo_entrega="Entrega inmediata después de aprobación",
                        dias_validez=30,
                        porcentaje_impuesto_default=15.0
                    )
                    logger.info("Configuración de proformas creada automáticamente")
                    
            except Exception as e:
                logger.error(f"Error al crear configuración de proformas: {e}")


# Signal para actualizar proformas vencidas automáticamente
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta


def marcar_proformas_vencidas():
    """
    Función para marcar proformas como vencidas.
    Debe ser llamada periódicamente (ej: tarea cron).
    """
    hoy = timezone.now().date()
    
    # Obtener proformas enviadas que han vencido
    proformas_vencidas = Proforma.objects.filter(
        estado=Proforma.EstadoProforma.ENVIADA,
        fecha_vencimiento__lt=hoy
    )
    
    count = 0
    for proforma in proformas_vencidas:
        proforma.estado = Proforma.EstadoProforma.VENCIDA
        proforma.save()
        
        # Crear entrada en historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion=ProformaHistorial.TipoAccion.VENCIMIENTO,
            estado_anterior=Proforma.EstadoProforma.ENVIADA,
            estado_nuevo=Proforma.EstadoProforma.VENCIDA,
            notas="Proforma marcada como vencida automáticamente",
            created_by=User.objects.filter(is_superuser=True).first()
        )
        
        count += 1
    
    if count > 0:
        logger.info(f"Se marcaron {count} proformas como vencidas")
    
    return count


def notificar_proformas_por_vencer():
    """
    Función para notificar proformas que están por vencer.
    Debe ser llamada periódicamente (ej: tarea cron diaria).
    """
    try:
        config = ConfiguracionProforma.get_active_config()
        if not config or not config.notificar_vencimiento:
            return 0
        
        fecha_limite = timezone.now().date() + timedelta(days=config.dias_aviso_vencimiento)
        
        # Obtener proformas que vencerán pronto
        proformas_por_vencer = Proforma.objects.filter(
            estado=Proforma.EstadoProforma.ENVIADA,
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=timezone.now().date()
        )
        
        count = 0
        for proforma in proformas_por_vencer:
            # Aquí se podría implementar el envío de notificaciones
            # por email, SMS, etc.
            logger.warning(
                f"Proforma {proforma.numero} vencerá el {proforma.fecha_vencimiento}"
            )
            count += 1
        
        return count
        
    except Exception as e:
        logger.error(f"Error al verificar proformas por vencer: {e}")
        return 0


# Funciones para limpiar datos antiguos
def limpiar_historial_antiguo(dias=365):
    """
    Limpia el historial de proformas más antiguo que X días.
    """
    fecha_limite = timezone.now() - timedelta(days=dias)
    
    # Mantener siempre el historial de creación
    historial_antiguo = ProformaHistorial.objects.filter(
        created_at__lt=fecha_limite
    ).exclude(
        accion=ProformaHistorial.TipoAccion.CREACION
    )
    
    count = historial_antiguo.count()
    historial_antiguo.delete()
    
    if count > 0:
        logger.info(f"Se eliminaron {count} registros de historial antiguos")
    
    return count


# Función para backup de datos críticos
def backup_proformas_importantes():
    """
    Función para hacer backup de proformas importantes.
    Se puede usar antes de operaciones de limpieza.
    """
    try:
        # Obtener proformas convertidas a órdenes
        proformas_importantes = Proforma.objects.filter(
            estado__in=[
                Proforma.EstadoProforma.CONVERTIDA,
                Proforma.EstadoProforma.APROBADA
            ]
        ).select_related('cliente', 'empresa').prefetch_related('items')
        
        # Aquí se podría implementar la lógica de backup
        # (ej: exportar a JSON, enviar a S3, etc.)
        
        logger.info(f"Backup realizado para {proformas_importantes.count()} proformas importantes")
        return proformas_importantes.count()
        
    except Exception as e:
        logger.error(f"Error en backup de proformas: {e}")
        return 0

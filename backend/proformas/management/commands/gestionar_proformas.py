# backend/proformas/management/commands/gestionar_proformas.py

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging

from proformas.models import Proforma, ProformaHistorial, ConfiguracionProforma
from proformas.signals import (
    marcar_proformas_vencidas, 
    notificar_proformas_por_vencer,
    limpiar_historial_antiguo,
    backup_proformas_importantes
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Gestiona tareas periódicas de proformas: vencimiento, notificaciones, limpieza'

    def add_arguments(self, parser):
        parser.add_argument(
            'accion',
            choices=['vencidas', 'notificar', 'limpiar', 'backup', 'all'],
            help='Acción a realizar'
        )
        
        parser.add_argument(
            '--dias',
            type=int,
            default=365,
            help='Días para operaciones de limpieza (default: 365)'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Ejecutar en modo simulación sin hacer cambios'
        )
        
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Mostrar información detallada'
        )

    def handle(self, *args, **options):
        accion = options['accion']
        dias = options['dias']
        dry_run = options['dry_run']
        verbose = options['verbose']
        
        if verbose:
            self.stdout.write(f"Ejecutando acción: {accion}")
            if dry_run:
                self.stdout.write(self.style.WARNING("MODO SIMULACIÓN - No se harán cambios"))
        
        try:
            if accion == 'vencidas':
                self._marcar_vencidas(dry_run, verbose)
            elif accion == 'notificar':
                self._notificar_vencimiento(dry_run, verbose)
            elif accion == 'limpiar':
                self._limpiar_historial(dias, dry_run, verbose)
            elif accion == 'backup':
                self._hacer_backup(dry_run, verbose)
            elif accion == 'all':
                self._ejecutar_todas(dias, dry_run, verbose)
            
        except Exception as e:
            logger.error(f"Error en comando gestionar_proformas: {e}")
            raise CommandError(f"Error al ejecutar la acción {accion}: {e}")

    def _marcar_vencidas(self, dry_run=False, verbose=False):
        """Marca proformas vencidas."""
        hoy = timezone.now().date()
        
        proformas_vencidas = Proforma.objects.filter(
            estado=Proforma.EstadoProforma.ENVIADA,
            fecha_vencimiento__lt=hoy
        )
        
        count = proformas_vencidas.count()
        
        if verbose:
            self.stdout.write(f"Proformas a marcar como vencidas: {count}")
            
            for proforma in proformas_vencidas[:5]:  # Mostrar solo las primeras 5
                self.stdout.write(f"  - {proforma.numero} (vence: {proforma.fecha_vencimiento})")
            
            if count > 5:
                self.stdout.write(f"  ... y {count - 5} más")
        
        if not dry_run and count > 0:
            with transaction.atomic():
                resultado = marcar_proformas_vencidas()
                self.stdout.write(
                    self.style.SUCCESS(f"Se marcaron {resultado} proformas como vencidas")
                )
        elif dry_run:
            self.stdout.write(
                self.style.WARNING(f"[SIMULACIÓN] Se marcarían {count} proformas como vencidas")
            )
        else:
            self.stdout.write("No hay proformas para marcar como vencidas")

    def _notificar_vencimiento(self, dry_run=False, verbose=False):
        """Notifica proformas por vencer."""
        try:
            config = ConfiguracionProforma.get_active_config()
            if not config:
                self.stdout.write(self.style.WARNING("No hay configuración de proformas"))
                return
            
            if not config.notificar_vencimiento:
                self.stdout.write("Las notificaciones están deshabilitadas")
                return
            
            fecha_limite = timezone.now().date() + timedelta(days=config.dias_aviso_vencimiento)
            
            proformas_por_vencer = Proforma.objects.filter(
                estado=Proforma.EstadoProforma.ENVIADA,
                fecha_vencimiento__lte=fecha_limite,
                fecha_vencimiento__gte=timezone.now().date()
            )
            
            count = proformas_por_vencer.count()
            
            if verbose:
                self.stdout.write(f"Proformas por vencer en {config.dias_aviso_vencimiento} días: {count}")
                
                for proforma in proformas_por_vencer:
                    dias_restantes = (proforma.fecha_vencimiento - timezone.now().date()).days
                    self.stdout.write(
                        f"  - {proforma.numero} (vence en {dias_restantes} días)"
                    )
            
            if not dry_run:
                resultado = notificar_proformas_por_vencer()
                self.stdout.write(
                    self.style.SUCCESS(f"Se procesaron {resultado} notificaciones")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"[SIMULACIÓN] Se enviarían {count} notificaciones")
                )
                
        except Exception as e:
            logger.error(f"Error en notificaciones: {e}")
            self.stdout.write(self.style.ERROR(f"Error al procesar notificaciones: {e}"))

    def _limpiar_historial(self, dias, dry_run=False, verbose=False):
        """Limpia historial antiguo."""
        fecha_limite = timezone.now() - timedelta(days=dias)
        
        # Contar registros a eliminar
        historial_antiguo = ProformaHistorial.objects.filter(
            created_at__lt=fecha_limite
        ).exclude(
            accion=ProformaHistorial.TipoAccion.CREACION
        )
        
        count = historial_antiguo.count()
        
        if verbose:
            self.stdout.write(f"Registros de historial anteriores a {fecha_limite.date()}: {count}")
            
            # Mostrar estadísticas por tipo de acción
            from django.db.models import Count
            stats = historial_antiguo.values('accion').annotate(
                total=Count('id')
            ).order_by('-total')
            
            for stat in stats:
                self.stdout.write(f"  - {stat['accion']}: {stat['total']} registros")
        
        if not dry_run and count > 0:
            with transaction.atomic():
                resultado = limpiar_historial_antiguo(dias)
                self.stdout.write(
                    self.style.SUCCESS(f"Se eliminaron {resultado} registros de historial")
                )
        elif dry_run:
            self.stdout.write(
                self.style.WARNING(f"[SIMULACIÓN] Se eliminarían {count} registros de historial")
            )
        else:
            self.stdout.write("No hay registros de historial para limpiar")

    def _hacer_backup(self, dry_run=False, verbose=False):
        """Hace backup de proformas importantes."""
        proformas_importantes = Proforma.objects.filter(
            estado__in=[
                Proforma.EstadoProforma.CONVERTIDA,
                Proforma.EstadoProforma.APROBADA
            ]
        )
        
        count = proformas_importantes.count()
        
        if verbose:
            self.stdout.write(f"Proformas importantes para backup: {count}")
            
            # Estadísticas por estado
            from django.db.models import Count
            stats = proformas_importantes.values('estado').annotate(
                total=Count('id')
            )
            
            for stat in stats:
                self.stdout.write(f"  - {stat['estado']}: {stat['total']} proformas")
        
        if not dry_run and count > 0:
            resultado = backup_proformas_importantes()
            self.stdout.write(
                self.style.SUCCESS(f"Backup realizado para {resultado} proformas")
            )
        elif dry_run:
            self.stdout.write(
                self.style.WARNING(f"[SIMULACIÓN] Se haría backup de {count} proformas")
            )
        else:
            self.stdout.write("No hay proformas importantes para backup")

    def _ejecutar_todas(self, dias, dry_run=False, verbose=False):
        """Ejecuta todas las tareas de mantenimiento."""
        self.stdout.write(self.style.HTTP_INFO("=== EJECUTANDO TODAS LAS TAREAS DE MANTENIMIENTO ==="))
        
        self.stdout.write(self.style.HTTP_INFO("\n1. Marcando proformas vencidas..."))
        self._marcar_vencidas(dry_run, verbose)
        
        self.stdout.write(self.style.HTTP_INFO("\n2. Procesando notificaciones..."))
        self._notificar_vencimiento(dry_run, verbose)
        
        self.stdout.write(self.style.HTTP_INFO("\n3. Haciendo backup..."))
        self._hacer_backup(dry_run, verbose)
        
        self.stdout.write(self.style.HTTP_INFO(f"\n4. Limpiando historial (>{dias} días)..."))
        self._limpiar_historial(dias, dry_run, verbose)
        
        self.stdout.write(self.style.SUCCESS("\n=== MANTENIMIENTO COMPLETADO ==="))

    def _mostrar_estadisticas(self):
        """Muestra estadísticas generales del sistema."""
        self.stdout.write(self.style.HTTP_INFO("\n=== ESTADÍSTICAS DEL SISTEMA ==="))
        
        # Estadísticas de proformas por estado
        from django.db.models import Count, Sum
        
        stats_estado = Proforma.objects.values('estado').annotate(
            total=Count('id'),
            valor_total=Sum('total')
        ).order_by('estado')
        
        self.stdout.write("Proformas por estado:")
        for stat in stats_estado:
            self.stdout.write(
                f"  - {stat['estado']}: {stat['total']} proformas "
                f"(${stat['valor_total'] or 0:,.2f})"
            )
        
        # Estadísticas de historial
        total_historial = ProformaHistorial.objects.count()
        self.stdout.write(f"\nTotal registros de historial: {total_historial}")
        
        # Proformas por vencer
        hoy = timezone.now().date()
        fecha_limite = hoy + timedelta(days=7)
        
        por_vencer = Proforma.objects.filter(
            estado=Proforma.EstadoProforma.ENVIADA,
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=hoy
        ).count()
        
        self.stdout.write(f"Proformas por vencer (próximos 7 días): {por_vencer}")

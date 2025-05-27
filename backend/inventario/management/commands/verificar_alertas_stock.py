from django.core.management.base import BaseCommand
from django.utils import timezone
from inventario.utils.alerts import AlertManager

class Command(BaseCommand):
    help = 'Verifica y genera alertas de stock según los parámetros configurados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Limpia alertas antiguas antes de generar nuevas',
        )
        parser.add_argument(
            '--dias',
            type=int,
            default=30,
            help='Días para considerar alertas como antiguas (default: 30)',
        )

    def handle(self, *args, **options):
        self.stdout.write('Iniciando verificación de alertas de inventario...')
        
        # Limpiar alertas antiguas si se especifica
        if options['limpiar']:
            self.stdout.write(f"Limpiando alertas leídas más antiguas de {options['dias']} días...")
            eliminadas = AlertManager.limpiar_alertas_antiguas(dias=options['dias'])
            self.stdout.write(
                self.style.SUCCESS(f"Se eliminaron {eliminadas[0]} alertas antiguas")
            )
        
        # Verificar y generar nuevas alertas
        self.stdout.write('Verificando stocks y generando alertas...')
        
        try:
            alertas_generadas = AlertManager.verificar_alertas_stock()
            
            if alertas_generadas:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Se generaron {len(alertas_generadas)} nuevas alertas:"
                    )
                )
                
                # Mostrar resumen de alertas
                tipos_alerta = {}
                for alerta in alertas_generadas:
                    tipo = alerta.tipo_alerta
                    tipos_alerta[tipo] = tipos_alerta.get(tipo, 0) + 1
                
                for tipo, cantidad in tipos_alerta.items():
                    self.stdout.write(f"  - {tipo}: {cantidad}")
            else:
                self.stdout.write(
                    self.style.WARNING("No se generaron nuevas alertas")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error al verificar alertas: {str(e)}")
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS("Verificación de alertas completada")
        )

from django.core.management.base import BaseCommand
from basic.models import Unidad

class Command(BaseCommand):
    help = 'Creates default Unidad if it does not exist'

    def handle(self, *args, **kwargs):
        unidad, created = Unidad.objects.get_or_create(
            nombre='Unidad no definida',
            defaults={
                'code': 'NDEF',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created default Unidad'))
        else:
            self.stdout.write(self.style.SUCCESS('Default Unidad already exists'))
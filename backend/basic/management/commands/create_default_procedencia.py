from django.core.management.base import BaseCommand
from basic.models import Procedencia

class Command(BaseCommand):
    help = 'Creates default Procedencia if it does not exist'

    def handle(self, *args, **kwargs):
        procedencia, created = Procedencia.objects.get_or_create(
            nombre='Procedencia no definida',
            defaults={
                'code': 'PND',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created default Procedencia'))
        else:
            self.stdout.write(self.style.SUCCESS('Default Procedencia already exists'))
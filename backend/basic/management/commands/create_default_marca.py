from django.core.management.base import BaseCommand
from basic.models import Marca

class Command(BaseCommand):
    help = 'Creates default Marca if it does not exist'

    def handle(self, *args, **kwargs):
        marca, created = Marca.objects.get_or_create(
            nombre='Marca no definida',
            defaults={
                'code': 'MNDEF',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created default Marca'))
        else:
            self.stdout.write(self.style.SUCCESS('Default Marca already exists'))
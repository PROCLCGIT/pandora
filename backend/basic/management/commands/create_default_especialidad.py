from django.core.management.base import BaseCommand
from basic.models import Especialidad

class Command(BaseCommand):
    help = 'Creates default Especialidad if it does not exist'

    def handle(self, *args, **kwargs):
        especialidad, created = Especialidad.objects.get_or_create(
            nombre='Especialidad no definida',
            defaults={
                'code': 'ENDEF',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created default Especialidad'))
        else:
            self.stdout.write(self.style.SUCCESS('Default Especialidad already exists'))
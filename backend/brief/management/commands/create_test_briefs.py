from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from brief.models import Brief, BriefItem
from directorio.models import Cliente
from users.models import User
from basic.models import Unidad
import random


class Command(BaseCommand):
    help = 'Crea briefs de prueba'

    def handle(self, *args, **kwargs):
        # Obtener datos necesarios
        try:
            # Obtener el primer usuario admin
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.first()
            
            if not admin_user:
                self.stdout.write(self.style.ERROR('No se encontraron usuarios. Crea un usuario primero.'))
                return
                
            # Obtener algunos clientes
            clientes = list(Cliente.objects.all()[:5])
            if not clientes:
                self.stdout.write(self.style.ERROR('No se encontraron clientes. Crea clientes primero.'))
                return
                
            # Obtener unidades
            unidades = list(Unidad.objects.all()[:3])
            if not unidades:
                self.stdout.write(self.style.ERROR('No se encontraron unidades. Crea unidades primero.'))
                return
            
            # Crear briefs de prueba
            briefs_data = [
                {
                    'title': 'Equipos médicos para UCI',
                    'description': 'Requerimiento urgente de equipos médicos para la unidad de cuidados intensivos',
                    'priority': 'urgente',
                    'estado': 'pending',
                    'presupuesto': 50000.00,
                    'tiempo_entrega': 15,
                },
                {
                    'title': 'Insumos quirúrgicos mensuales',
                    'description': 'Pedido mensual de insumos quirúrgicos básicos',
                    'priority': 'media',
                    'estado': 'approved',
                    'presupuesto': 25000.00,
                    'tiempo_entrega': 30,
                },
                {
                    'title': 'Material de laboratorio',
                    'description': 'Reactivos y material de laboratorio para análisis clínicos',
                    'priority': 'alta',
                    'estado': 'processing',
                    'presupuesto': 15000.00,
                    'tiempo_entrega': 20,
                },
            ]
            
            created_count = 0
            
            for brief_data in briefs_data:
                client = random.choice(clientes)
                
                brief = Brief.objects.create(
                    client=client,
                    title=brief_data['title'],
                    origin='email',
                    description=brief_data['description'],
                    priority=brief_data['priority'],
                    presupuesto=brief_data['presupuesto'],
                    tiempo_entrega=brief_data['tiempo_entrega'],
                    forma_pago='credito_30',
                    destino='cot_cliente',
                    estado=brief_data['estado'],
                    operador=admin_user,
                    created_by=admin_user,
                    due_date=timezone.now() + timedelta(days=brief_data['tiempo_entrega'])
                )
                
                # Crear algunos items para cada brief
                items_data = [
                    {'product': 'Ventilador mecánico', 'quantity': 2, 'precio_estimado': 15000},
                    {'product': 'Monitor multiparámetros', 'quantity': 5, 'precio_estimado': 3000},
                    {'product': 'Jeringas descartables 10ml', 'quantity': 1000, 'precio_estimado': 0.50},
                    {'product': 'Guantes quirúrgicos', 'quantity': 500, 'precio_estimado': 0.80},
                    {'product': 'Reactivo PCR', 'quantity': 100, 'precio_estimado': 25.00},
                ]
                
                # Seleccionar aleatoriamente 2-3 items
                selected_items = random.sample(items_data, random.randint(2, 3))
                
                for idx, item_data in enumerate(selected_items):
                    BriefItem.objects.create(
                        brief=brief,
                        product=item_data['product'],
                        quantity=item_data['quantity'],
                        unit=random.choice(unidades),
                        precio_estimado=item_data['precio_estimado'],
                        orden=idx + 1,
                        specifications='Especificaciones estándar del producto'
                    )
                
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Brief creado: {brief.code} - {brief.title}'))
            
            self.stdout.write(self.style.SUCCESS(f'\nSe crearon {created_count} briefs de prueba exitosamente.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al crear briefs de prueba: {str(e)}'))
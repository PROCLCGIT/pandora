from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Brief, BriefItem, BriefOrigin, BriefPriority, BriefFormaPago, BriefDestino, BriefStatus
from directorio.models import Client, User as DirectorioUser
from basic.models import Unit

class BriefModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client_obj = Client.objects.create(name='Test Client')
        self.operador = DirectorioUser.objects.create(
            username='operador',
            full_name='Operador Test'
        )
    
    def test_brief_creation(self):
        brief = Brief.objects.create(
            client=self.client_obj,
            title='Test Brief',
            origin='telefono',
            description='Test description',
            priority='media',
            tiempo_entrega=5,
            forma_pago='contado',
            destino='cot_cliente',
            operador=self.operador,
            created_by=self.user
        )
        
        self.assertTrue(brief.code.startswith('BRF'))
        self.assertEqual(brief.title, 'Test Brief')
        self.assertEqual(brief.priority_color, '#F59E0B')

class BriefChoicesTest(TestCase):
    def test_brief_origin_choices(self):
        expected_choices = {
            'telefono': 'Telefónico',
            'email': 'Correo Electrónico',
            'presencial': 'Visita Presencial',
            'whatsapp': 'WhatsApp',
            'web': 'Sitio Web',
            'referido': 'Referido',
            'redes': 'Redes Sociales'
        }
        self.assertEqual(len(BriefOrigin.choices), len(expected_choices))
        for value, label in BriefOrigin.choices:
            self.assertEqual(label, expected_choices[value])

    def test_brief_priority_choices(self):
        expected_choices = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta',
            'urgente': 'Urgente',
            'critica': 'Crítica'
        }
        self.assertEqual(len(BriefPriority.choices), len(expected_choices))
        for value, label in BriefPriority.choices:
            self.assertEqual(label, expected_choices[value])

    def test_brief_forma_pago_choices(self):
        # Simplified check for brevity, you can expand this
        self.assertTrue(len(BriefFormaPago.choices) > 0)
        self.assertIn(('contado', 'Contado'), BriefFormaPago.choices)

    def test_brief_destino_choices(self):
        # Simplified check
        self.assertTrue(len(BriefDestino.choices) > 0)
        self.assertIn(('cot_cliente', 'Cotización a Cliente'), BriefDestino.choices)

    def test_brief_status_choices(self):
        expected_choices = {
            'draft': 'Borrador',
            'pending': 'Pendiente',
            'approved': 'Aprobado',
            'processing': 'En Proceso',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        }
        self.assertEqual(len(BriefStatus.choices), len(expected_choices))
        for value, label in BriefStatus.choices:
            self.assertEqual(label, expected_choices[value])

class BriefAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_brief(self):
        data = {
            'title': 'API Test Brief',
            'origin': 'email',
            'description': 'Test via API',
            'priority': 'alta',
            'tiempo_entrega': 3,
            'forma_pago': 'credito_30',
            'destino': 'proforma'
        }
        
        response = self.client.post('/brief/api/v1/briefs/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
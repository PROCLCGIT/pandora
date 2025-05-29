from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Brief, BriefItem
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
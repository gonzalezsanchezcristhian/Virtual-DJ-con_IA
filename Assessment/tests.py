from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import EmocionDetectada
import json


class RegistrarEmocionTest(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(username='tester', password='password123')

	def test_registrar_emocion(self):
		# Logueamos forzadamente (evita depender de CSRF en test client)
		self.client.force_login(self.user)

		payload = json.dumps({"emocion": "happy"})
		response = self.client.post('/assessment/registrar_emocion/', data=payload, content_type='application/json')

		# Respuesta esperada JSON con success True
		self.assertEqual(response.status_code, 200)
		data = json.loads(response.content)
		self.assertTrue(data.get('success'))

		# Verificar que se creó el registro en la BD
		exists = EmocionDetectada.objects.filter(usuario=self.user, emocion='happy').exists()
		self.assertTrue(exists)

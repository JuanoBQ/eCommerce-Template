"""
Tests para el módulo de pagos.
"""

import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from unittest.mock import patch, MagicMock

from ..users.factories import UserFactory, AdminUserFactory
from ..orders.factories import OrderFactory
from .factories import PaymentFactory
from .models import Payment


class PaymentModelTest(TestCase):
    """Tests para el modelo Payment."""
    
    def test_payment_creation(self):
        """Test crear pago."""
        payment = PaymentFactory()
        self.assertTrue(isinstance(payment, Payment))
        self.assertIsNotNone(payment.payment_id)
        self.assertEqual(payment.status, 'pending')
    
    def test_payment_str(self):
        """Test string representation del pago."""
        payment = PaymentFactory()
        expected = f"Payment {payment.payment_id} - {payment.order.order_number}"
        self.assertEqual(str(payment), expected)
    
    def test_payment_generate_payment_id(self):
        """Test generación automática de payment_id."""
        payment = PaymentFactory()
        self.assertIsNotNone(payment.payment_id)
        self.assertTrue(payment.payment_id.startswith('PAY-'))


class PaymentAPITest(APITestCase):
    """Tests para la API de pagos."""
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.user = UserFactory()
        self.admin = AdminUserFactory()
        self.order = OrderFactory(user=self.user)
        self.payment = PaymentFactory(order=self.order, user=self.user)
    
    def test_payment_list_unauthorized(self):
        """Test listar pagos sin autenticación."""
        url = reverse('payment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_payment_list_authorized(self):
        """Test listar pagos con autenticación."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_payment_list_user_own_payments(self):
        """Test que un usuario solo ve sus propios pagos."""
        other_user = UserFactory()
        other_order = OrderFactory(user=other_user)
        other_payment = PaymentFactory(order=other_order, user=other_user)
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        payment_ids = [payment['id'] for payment in response.data['results']]
        self.assertIn(self.payment.id, payment_ids)
        self.assertNotIn(other_payment.id, payment_ids)
    
    def test_payment_list_admin_all_payments(self):
        """Test que un admin ve todos los pagos."""
        other_user = UserFactory()
        other_order = OrderFactory(user=other_user)
        other_payment = PaymentFactory(order=other_order, user=other_user)
        
        self.client.force_authenticate(user=self.admin)
        url = reverse('payment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        payment_ids = [payment['id'] for payment in response.data['results']]
        self.assertIn(self.payment.id, payment_ids)
        self.assertIn(other_payment.id, payment_ids)
    
    def test_payment_detail_unauthorized(self):
        """Test detalle de pago sin autenticación."""
        url = reverse('payment-detail', kwargs={'pk': self.payment.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_payment_detail_authorized(self):
        """Test detalle de pago con autenticación."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-detail', kwargs={'pk': self.payment.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_id'], self.payment.payment_id)
    
    def test_payment_detail_other_user(self):
        """Test detalle de pago de otro usuario."""
        other_user = UserFactory()
        other_order = OrderFactory(user=other_user)
        other_payment = PaymentFactory(order=other_order, user=other_user)
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-detail', kwargs={'pk': other_payment.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_payment_detail_admin(self):
        """Test detalle de pago como admin."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('payment-detail', kwargs={'pk': self.payment.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_id'], self.payment.payment_id)
    
    @patch('ecommerce.apps.payments.services.wompi_service.WompiService.create_payment_intent')
    def test_create_payment_intent_wompi(self, mock_create_payment_intent):
        """Test crear intención de pago con Wompi."""
        mock_create_payment_intent.return_value = {
            'success': True,
            'payment_url': 'https://wompi.co/pay/test123',
            'transaction_id': 'test123',
            'expires_at': '2024-12-31T23:59:59Z'
        }
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            'provider': 'wompi'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('payment_url', response.data)
        self.assertEqual(response.data['provider'], 'wompi')
    
    @patch('ecommerce.apps.payments.services.mercadopago_service.MercadoPagoService.create_payment_intent')
    def test_create_payment_intent_mercadopago(self, mock_create_payment_intent):
        """Test crear intención de pago con MercadoPago."""
        mock_create_payment_intent.return_value = {
            'success': True,
            'payment_url': 'https://mercadopago.com/checkout/test123',
            'preference_id': 'test123',
            'expires_at': '2024-12-31T23:59:59Z'
        }
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            'provider': 'mercadopago'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('payment_url', response.data)
        self.assertEqual(response.data['provider'], 'mercadopago')
    
    def test_create_payment_intent_invalid_provider(self):
        """Test crear intención de pago con proveedor inválido."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            'provider': 'invalid_provider'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('Proveedor invalid_provider no disponible', response.data['error'])
    
    def test_create_payment_intent_missing_data(self):
        """Test crear intención de pago con datos faltantes."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            # provider faltante
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('order_id y provider son requeridos', response.data['error'])
    
    def test_create_payment_intent_invalid_order(self):
        """Test crear intención de pago con orden inválida."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': 99999,  # Orden que no existe
            'provider': 'wompi'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertIn('Orden no encontrada', response.data['error'])
    
    def test_create_payment_intent_other_user_order(self):
        """Test crear intención de pago con orden de otro usuario."""
        other_user = UserFactory()
        other_order = OrderFactory(user=other_user)
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': other_order.id,
            'provider': 'wompi'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertIn('Orden no encontrada', response.data['error'])
    
    def test_create_payment_intent_unauthorized(self):
        """Test crear intención de pago sin autenticación."""
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            'provider': 'wompi'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    @patch('ecommerce.apps.payments.services.wompi_service.WompiService.create_payment_intent')
    def test_create_payment_intent_service_error(self, mock_create_payment_intent):
        """Test crear intención de pago con error del servicio."""
        mock_create_payment_intent.return_value = {
            'success': False,
            'error': 'Error del servicio',
            'error_code': 'SERVICE_ERROR'
        }
        
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-create-payment-intent')
        data = {
            'order_id': self.order.id,
            'provider': 'wompi'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('Error del servicio', response.data['error'])
    
    def test_payment_providers_list(self):
        """Test listar proveedores de pago disponibles."""
        url = reverse('payment-providers')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('providers', response.data)
        self.assertIn('wompi', response.data['providers'])
        self.assertIn('mercadopago', response.data['providers'])
    
    def test_payment_providers_for_currency(self):
        """Test obtener proveedores para una moneda específica."""
        url = reverse('payment-providers')
        response = self.client.get(url, {'currency': 'COP'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('providers', response.data)
        self.assertIn('wompi', response.data['providers'])
    
    def test_payment_providers_for_country(self):
        """Test obtener proveedores para un país específico."""
        url = reverse('payment-providers')
        response = self.client.get(url, {'country': 'CO'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('providers', response.data)
        self.assertIn('wompi', response.data['providers'])
    
    def test_payment_status_update(self):
        """Test actualizar estado de pago."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('payment-detail', kwargs={'pk': self.payment.pk})
        data = {
            'status': 'completed'
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'completed')
    
    def test_payment_status_update_unauthorized(self):
        """Test actualizar estado de pago sin autorización."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-detail', kwargs={'pk': self.payment.pk})
        data = {
            'status': 'completed'
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_payment_filter_by_status(self):
        """Test filtrar pagos por estado."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url, {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        for payment in response.data['results']:
            self.assertEqual(payment['status'], 'pending')
    
    def test_payment_filter_by_provider(self):
        """Test filtrar pagos por proveedor."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url, {'provider': 'wompi'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        for payment in response.data['results']:
            self.assertEqual(payment['provider'], 'wompi')
    
    def test_payment_filter_by_order(self):
        """Test filtrar pagos por orden."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url, {'order': self.order.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        for payment in response.data['results']:
            self.assertEqual(payment['order'], self.order.id)
    
    def test_payment_ordering_by_created_at(self):
        """Test ordenar pagos por fecha de creación."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url, {'ordering': '-created_at'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        created_dates = [payment['created_at'] for payment in response.data['results']]
        self.assertEqual(created_dates, sorted(created_dates, reverse=True))
    
    def test_payment_ordering_by_amount(self):
        """Test ordenar pagos por monto."""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-list')
        response = self.client.get(url, {'ordering': 'amount'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        amounts = [Decimal(payment['amount']) for payment in response.data['results']]
        self.assertEqual(amounts, sorted(amounts))

"""
Tests para el módulo de usuarios.
"""

import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .factories import UserFactory, AdminUserFactory, VendorUserFactory, CustomerUserFactory
from .models import User

User = get_user_model()


class UserModelTest(TestCase):
    """Tests para el modelo User."""
    
    def test_user_creation(self):
        """Test crear usuario."""
        user = UserFactory()
        self.assertTrue(isinstance(user, User))
        self.assertEqual(user.email, f"{user.username}@example.com")
        self.assertTrue(user.is_customer)
        self.assertFalse(user.is_vendor)
    
    def test_user_str(self):
        """Test string representation del usuario."""
        user = UserFactory()
        expected = f"{user.first_name} {user.last_name}"
        self.assertEqual(str(user), expected)
    
    def test_user_full_name(self):
        """Test método get_full_name."""
        user = UserFactory(first_name="Juan", last_name="Pérez")
        self.assertEqual(user.get_full_name(), "Juan Pérez")
    
    def test_user_short_name(self):
        """Test método get_short_name."""
        user = UserFactory(first_name="Juan", last_name="Pérez")
        self.assertEqual(user.get_short_name(), "Juan")
    
    def test_admin_user_creation(self):
        """Test crear usuario administrador."""
        admin = AdminUserFactory()
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertFalse(admin.is_customer)
        self.assertFalse(admin.is_vendor)
    
    def test_vendor_user_creation(self):
        """Test crear usuario vendedor."""
        vendor = VendorUserFactory()
        self.assertTrue(vendor.is_vendor)
        self.assertTrue(vendor.is_customer)
        self.assertFalse(vendor.is_staff)
    
    def test_customer_user_creation(self):
        """Test crear usuario cliente."""
        customer = CustomerUserFactory()
        self.assertTrue(customer.is_customer)
        self.assertFalse(customer.is_vendor)
        self.assertFalse(customer.is_staff)


class UserAPITest(APITestCase):
    """Tests para la API de usuarios."""
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.user = UserFactory()
        self.admin = AdminUserFactory()
        self.vendor = VendorUserFactory()
        self.customer = CustomerUserFactory()
    
    def test_user_registration(self):
        """Test registro de usuario."""
        url = reverse('rest_register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'terms_accepted': True,
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test registro con contraseñas que no coinciden."""
        url = reverse('rest_register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
            'terms_accepted': True,
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Las contraseñas no coinciden', str(response.data))
    
    def test_user_registration_terms_not_accepted(self):
        """Test registro sin aceptar términos."""
        url = reverse('rest_register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'terms_accepted': False,
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Debes aceptar los términos y condiciones', str(response.data))
    
    def test_user_login(self):
        """Test login de usuario."""
        url = reverse('rest_login')
        data = {
            'email': self.user.email,
            'password': 'testpass123',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test login con credenciales inválidas."""
        url = reverse('rest_login')
        data = {
            'email': self.user.email,
            'password': 'wrongpassword',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_profile_retrieve(self):
        """Test obtener perfil de usuario."""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
    
    def test_user_profile_retrieve_unauthorized(self):
        """Test obtener perfil sin autenticación."""
        url = reverse('user-profile')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_profile_update(self):
        """Test actualizar perfil de usuario."""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone': '+1234567890',
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.phone, '+1234567890')
    
    def test_user_profile_update_unauthorized(self):
        """Test actualizar perfil sin autenticación."""
        url = reverse('user-profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_change_password(self):
        """Test cambio de contraseña."""
        self.client.force_authenticate(user=self.user)
        url = reverse('change-password')
        data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la contraseña cambió
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))
    
    def test_change_password_wrong_old_password(self):
        """Test cambio de contraseña con contraseña antigua incorrecta."""
        self.client.force_authenticate(user=self.user)
        url = reverse('change-password')
        data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Contraseña actual incorrecta', str(response.data))
    
    def test_change_password_mismatch(self):
        """Test cambio de contraseña con contraseñas nuevas que no coinciden."""
        self.client.force_authenticate(user=self.user)
        url = reverse('change-password')
        data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'differentpass',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Las contraseñas nuevas no coinciden', str(response.data))
    
    def test_user_logout(self):
        """Test logout de usuario."""
        self.client.force_authenticate(user=self.user)
        url = reverse('rest_logout')
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_logout_unauthorized(self):
        """Test logout sin autenticación."""
        url = reverse('rest_logout')
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserPermissionsTest(APITestCase):
    """Tests para permisos de usuarios."""
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.user = UserFactory()
        self.admin = AdminUserFactory()
        self.vendor = VendorUserFactory()
        self.customer = CustomerUserFactory()
    
    def test_customer_can_access_own_profile(self):
        """Test que un cliente puede acceder a su propio perfil."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('user-profile')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.customer.email)
    
    def test_customer_cannot_access_other_profile(self):
        """Test que un cliente no puede acceder al perfil de otro usuario."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('user-detail', kwargs={'pk': self.user.pk})
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_access_any_profile(self):
        """Test que un admin puede acceder a cualquier perfil."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-detail', kwargs={'pk': self.user.pk})
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
    
    def test_vendor_can_access_own_profile(self):
        """Test que un vendedor puede acceder a su propio perfil."""
        self.client.force_authenticate(user=self.vendor)
        url = reverse('user-profile')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.vendor.email)

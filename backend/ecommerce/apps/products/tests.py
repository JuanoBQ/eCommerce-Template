"""
Tests para el módulo de productos.
"""

import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from ..users.factories import UserFactory, AdminUserFactory, VendorUserFactory
from .factories import ProductFactory, ProductImageFactory, ProductVariantFactory, ProductReviewFactory
from .models import Product, ProductImage, ProductVariant, ProductReview


class ProductModelTest(TestCase):
    """Tests para el modelo Product."""
    
    def test_product_creation(self):
        """Test crear producto."""
        product = ProductFactory()
        self.assertTrue(isinstance(product, Product))
        self.assertIsNotNone(product.slug)
        self.assertTrue(product.track_inventory)
        self.assertEqual(product.status, 'draft')
    
    def test_product_str(self):
        """Test string representation del producto."""
        product = ProductFactory(name="Test Product")
        self.assertEqual(str(product), "Test Product")
    
    def test_product_slug_generation(self):
        """Test generación automática de slug."""
        product = ProductFactory(name="Test Product Name")
        expected_slug = "test-product-name"
        self.assertEqual(product.slug, expected_slug)
    
    def test_product_in_stock(self):
        """Test verificación de stock."""
        product = ProductFactory(inventory_quantity=10)
        self.assertTrue(product.in_stock)
        
        product.inventory_quantity = 0
        self.assertFalse(product.in_stock)
    
    def test_product_low_stock(self):
        """Test verificación de stock bajo."""
        product = ProductFactory(inventory_quantity=3, low_stock_threshold=5)
        self.assertTrue(product.is_low_stock)
        
        product.inventory_quantity = 10
        self.assertFalse(product.is_low_stock)
    
    def test_product_discount_percentage(self):
        """Test cálculo de porcentaje de descuento."""
        product = ProductFactory(price=Decimal('100.00'), compare_price=Decimal('120.00'))
        expected_discount = Decimal('16.67')
        self.assertEqual(product.discount_percentage, expected_discount)
    
    def test_product_no_discount(self):
        """Test producto sin descuento."""
        product = ProductFactory(price=Decimal('100.00'), compare_price=None)
        self.assertEqual(product.discount_percentage, Decimal('0.00'))


class ProductImageModelTest(TestCase):
    """Tests para el modelo ProductImage."""
    
    def test_product_image_creation(self):
        """Test crear imagen de producto."""
        product = ProductFactory()
        image = ProductImageFactory(product=product)
        self.assertTrue(isinstance(image, ProductImage))
        self.assertEqual(image.product, product)
    
    def test_product_image_str(self):
        """Test string representation de la imagen."""
        product = ProductFactory(name="Test Product")
        image = ProductImageFactory(product=product, alt_text="Test Image")
        expected = "Test Product - Test Image"
        self.assertEqual(str(image), expected)


class ProductVariantModelTest(TestCase):
    """Tests para el modelo ProductVariant."""
    
    def test_product_variant_creation(self):
        """Test crear variante de producto."""
        product = ProductFactory()
        variant = ProductVariantFactory(product=product)
        self.assertTrue(isinstance(variant, ProductVariant))
        self.assertEqual(variant.product, product)
    
    def test_product_variant_str(self):
        """Test string representation de la variante."""
        product = ProductFactory(name="Test Product")
        variant = ProductVariantFactory(product=product, name="Size", value="M")
        expected = "Test Product - Size: M"
        self.assertEqual(str(variant), expected)
    
    def test_product_variant_final_price(self):
        """Test cálculo de precio final de la variante."""
        product = ProductFactory(price=Decimal('100.00'))
        variant = ProductVariantFactory(
            product=product,
            price_adjustment=Decimal('10.00')
        )
        expected_price = Decimal('110.00')
        self.assertEqual(variant.final_price, expected_price)


class ProductReviewModelTest(TestCase):
    """Tests para el modelo ProductReview."""
    
    def test_product_review_creation(self):
        """Test crear reseña de producto."""
        product = ProductFactory()
        user = UserFactory()
        review = ProductReviewFactory(product=product, user=user)
        self.assertTrue(isinstance(review, ProductReview))
        self.assertEqual(review.product, product)
        self.assertEqual(review.user, user)
    
    def test_product_review_str(self):
        """Test string representation de la reseña."""
        product = ProductFactory(name="Test Product")
        user = UserFactory(first_name="John", last_name="Doe")
        review = ProductReviewFactory(product=product, user=user, title="Great Product")
        expected = "Test Product - Great Product by John Doe"
        self.assertEqual(str(review), expected)


class ProductAPITest(APITestCase):
    """Tests para la API de productos."""
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.user = UserFactory()
        self.admin = AdminUserFactory()
        self.vendor = VendorUserFactory()
        self.product = ProductFactory()
        self.published_product = ProductFactory(status='published')
    
    def test_product_list_public(self):
        """Test listar productos (público)."""
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_product_list_published_only(self):
        """Test listar solo productos publicados."""
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que solo se muestran productos publicados
        for product in response.data['results']:
            self.assertEqual(product['status'], 'published')
    
    def test_product_detail_public(self):
        """Test detalle de producto (público)."""
        url = reverse('product-detail', kwargs={'pk': self.published_product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.published_product.name)
    
    def test_product_detail_draft_unauthorized(self):
        """Test detalle de producto borrador sin autenticación."""
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_product_detail_draft_authorized(self):
        """Test detalle de producto borrador con autenticación."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.product.name)
    
    def test_product_create_unauthorized(self):
        """Test crear producto sin autenticación."""
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'Test description',
            'price': '100.00',
            'category': self.product.category.pk,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_product_create_admin(self):
        """Test crear producto como administrador."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'Test description',
            'price': '100.00',
            'category': self.product.category.pk,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(name='New Product').exists())
    
    def test_product_create_vendor(self):
        """Test crear producto como vendedor."""
        self.client.force_authenticate(user=self.vendor)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'Test description',
            'price': '100.00',
            'category': self.product.category.pk,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(name='New Product').exists())
    
    def test_product_create_customer(self):
        """Test crear producto como cliente."""
        self.client.force_authenticate(user=self.user)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'Test description',
            'price': '100.00',
            'category': self.product.category.pk,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_product_update_admin(self):
        """Test actualizar producto como administrador."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        data = {
            'name': 'Updated Product',
            'description': self.product.description,
            'price': str(self.product.price),
            'category': self.product.category.pk,
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Updated Product')
    
    def test_product_delete_admin(self):
        """Test eliminar producto como administrador."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())
    
    def test_product_search(self):
        """Test búsqueda de productos."""
        url = reverse('product-list')
        response = self.client.get(url, {'search': self.published_product.name})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_product_filter_by_category(self):
        """Test filtrar productos por categoría."""
        url = reverse('product-list')
        response = self.client.get(url, {'category': self.published_product.category.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for product in response.data['results']:
            self.assertEqual(product['category'], self.published_product.category.pk)
    
    def test_product_filter_by_brand(self):
        """Test filtrar productos por marca."""
        url = reverse('product-list')
        response = self.client.get(url, {'brand': self.published_product.brand.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for product in response.data['results']:
            self.assertEqual(product['brand'], self.published_product.brand.pk)
    
    def test_product_filter_by_price_range(self):
        """Test filtrar productos por rango de precio."""
        url = reverse('product-list')
        response = self.client.get(url, {
            'price_min': '50.00',
            'price_max': '200.00'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for product in response.data['results']:
            price = Decimal(product['price'])
            self.assertGreaterEqual(price, Decimal('50.00'))
            self.assertLessEqual(price, Decimal('200.00'))
    
    def test_product_ordering_by_price(self):
        """Test ordenar productos por precio."""
        url = reverse('product-list')
        response = self.client.get(url, {'ordering': 'price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        prices = [Decimal(product['price']) for product in response.data['results']]
        self.assertEqual(prices, sorted(prices))
    
    def test_product_ordering_by_name(self):
        """Test ordenar productos por nombre."""
        url = reverse('product-list')
        response = self.client.get(url, {'ordering': 'name'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        names = [product['name'] for product in response.data['results']]
        self.assertEqual(names, sorted(names))
    
    def test_product_ordering_by_created_at(self):
        """Test ordenar productos por fecha de creación."""
        url = reverse('product-list')
        response = self.client.get(url, {'ordering': '-created_at'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        created_dates = [product['created_at'] for product in response.data['results']]
        self.assertEqual(created_dates, sorted(created_dates, reverse=True))

"""
Factories para los modelos de productos.
"""

import factory
from decimal import Decimal
from factory.django import DjangoModelFactory
from faker import Faker

from ..categories.factories import CategoryFactory, BrandFactory
from .models import Product, ProductImage, ProductVariant, ProductReview

fake = Faker()


class ProductFactory(DjangoModelFactory):
    """Factory para crear productos."""
    
    class Meta:
        model = Product
    
    name = factory.Faker('sentence', nb_words=3)
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(' ', '-'))
    description = factory.Faker('text', max_nb_chars=500)
    short_description = factory.Faker('text', max_nb_chars=200)
    sku = factory.Sequence(lambda n: f"SKU{n:06d}")
    category = factory.SubFactory(CategoryFactory)
    brand = factory.SubFactory(BrandFactory)
    gender = factory.Iterator(['masculino', 'femenino', 'unisex'])
    price = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=3, right_digits=2, positive=True)))
    compare_price = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=3, right_digits=2, positive=True)))
    cost_price = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=2, right_digits=2, positive=True)))
    track_inventory = True
    inventory_quantity = factory.Faker('random_int', min=0, max=100)
    low_stock_threshold = factory.Faker('random_int', min=1, max=10)
    allow_backorder = False
    status = factory.Iterator(['draft', 'published', 'archived'])
    is_featured = False
    is_digital = False
    requires_shipping = True
    weight = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=2, right_digits=2, positive=True)))
    meta_title = factory.Faker('sentence', nb_words=4)
    meta_description = factory.Faker('text', max_nb_chars=160)


class ProductImageFactory(DjangoModelFactory):
    """Factory para crear imágenes de productos."""
    
    class Meta:
        model = ProductImage
    
    product = factory.SubFactory(ProductFactory)
    image = factory.django.ImageField(color='blue')
    alt_text = factory.Faker('sentence', nb_words=3)
    is_primary = False
    sort_order = factory.Sequence(lambda n: n)


class ProductVariantFactory(DjangoModelFactory):
    """Factory para crear variantes de productos."""
    
    class Meta:
        model = ProductVariant
    
    product = factory.SubFactory(ProductFactory)
    sku = factory.Sequence(lambda n: f"VAR{n:06d}")
    name = factory.Faker('word')
    value = factory.Faker('word')
    price_adjustment = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=2, right_digits=2, positive=True)))
    inventory_quantity = factory.Faker('random_int', min=0, max=50)
    is_active = True


class ProductReviewFactory(DjangoModelFactory):
    """Factory para crear reseñas de productos."""
    
    class Meta:
        model = ProductReview
    
    product = factory.SubFactory(ProductFactory)
    user = factory.SubFactory('ecommerce.apps.users.factories.UserFactory')
    rating = factory.Faker('random_int', min=1, max=5)
    title = factory.Faker('sentence', nb_words=4)
    comment = factory.Faker('text', max_nb_chars=300)
    is_verified_purchase = factory.Faker('boolean')
    is_approved = True

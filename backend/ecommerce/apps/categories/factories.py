"""
Factories para los modelos de categorías.
"""

import factory
from factory.django import DjangoModelFactory
from faker import Faker

from .models import Category, Brand

fake = Faker()


class CategoryFactory(DjangoModelFactory):
    """Factory para crear categorías."""
    
    class Meta:
        model = Category
    
    name = factory.Faker('word')
    slug = factory.LazyAttribute(lambda obj: obj.name.lower())
    description = factory.Faker('text', max_nb_chars=200)
    icon = factory.Iterator(['shirt', 'pants', 'shoes', 'hat', 'bag'])
    is_active = True
    sort_order = factory.Sequence(lambda n: n)
    meta_title = factory.Faker('sentence', nb_words=3)
    meta_description = factory.Faker('text', max_nb_chars=160)


class BrandFactory(DjangoModelFactory):
    """Factory para crear marcas."""
    
    class Meta:
        model = Brand
    
    name = factory.Faker('company')
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(' ', '-'))
    description = factory.Faker('text', max_nb_chars=200)
    logo = factory.django.ImageField(color='red')
    website = factory.Faker('url')
    is_active = True
    sort_order = factory.Sequence(lambda n: n)
    meta_title = factory.Faker('sentence', nb_words=3)
    meta_description = factory.Faker('text', max_nb_chars=160)

"""
Factories para el modelo User.
"""

import factory
from django.contrib.auth import get_user_model
from factory.django import DjangoModelFactory
from faker import Faker

fake = Faker()
User = get_user_model()


class UserFactory(DjangoModelFactory):
    """Factory para crear usuarios de prueba."""
    
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    phone = factory.Faker('phone_number')
    birth_date = factory.Faker('date_of_birth', minimum_age=18, maximum_age=80)
    is_active = True
    is_customer = True
    is_vendor = False
    terms_accepted = True
    email_notifications = True
    sms_notifications = False
    
    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        password = extracted or 'testpass123'
        self.set_password(password)
        self.save()


class AdminUserFactory(UserFactory):
    """Factory para crear usuarios administradores."""
    
    is_staff = True
    is_superuser = True
    is_customer = False
    is_vendor = False


class VendorUserFactory(UserFactory):
    """Factory para crear usuarios vendedores."""
    
    is_vendor = True
    is_customer = True


class CustomerUserFactory(UserFactory):
    """Factory para crear usuarios clientes."""
    
    is_customer = True
    is_vendor = False

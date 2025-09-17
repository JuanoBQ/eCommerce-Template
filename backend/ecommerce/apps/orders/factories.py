"""
Factories para los modelos de órdenes.
"""

import factory
from decimal import Decimal
from factory.django import DjangoModelFactory
from faker import Faker

from ..users.factories import UserFactory
from ..products.factories import ProductFactory
from .models import Order, OrderItem

fake = Faker()


class OrderFactory(DjangoModelFactory):
    """Factory para crear órdenes."""
    
    class Meta:
        model = Order
    
    user = factory.SubFactory(UserFactory)
    order_number = factory.Sequence(lambda n: f"ORD{n:06d}")
    status = factory.Iterator(['pending', 'confirmed', 'processing', 'shipped', 'delivered'])
    payment_status = factory.Iterator(['pending', 'paid', 'failed', 'refunded'])
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    document_id = factory.Faker('numerify', text='##########')
    email = factory.Faker('email')
    phone = factory.Faker('phone_number')
    shipping_first_name = factory.Faker('first_name')
    shipping_last_name = factory.Faker('last_name')
    shipping_address = factory.Faker('address')
    shipping_city = factory.Faker('city')
    shipping_state = factory.Faker('state')
    shipping_country = factory.Faker('country')
    shipping_postal_code = factory.Faker('postcode')
    billing_first_name = factory.Faker('first_name')
    billing_last_name = factory.Faker('last_name')
    billing_address = factory.Faker('address')
    billing_city = factory.Faker('city')
    billing_state = factory.Faker('state')
    billing_country = factory.Faker('country')
    billing_postal_code = factory.Faker('postcode')
    subtotal = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=3, right_digits=2, positive=True)))
    tax_amount = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=2, right_digits=2, positive=True)))
    shipping_amount = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=2, right_digits=2, positive=True)))
    total_amount = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=3, right_digits=2, positive=True)))
    notes = factory.Faker('text', max_nb_chars=200)


class OrderItemFactory(DjangoModelFactory):
    """Factory para crear items de órdenes."""
    
    class Meta:
        model = OrderItem
    
    order = factory.SubFactory(OrderFactory)
    product = factory.SubFactory(ProductFactory)
    quantity = factory.Faker('random_int', min=1, max=5)
    unit_price = factory.LazyFunction(lambda: Decimal(fake.pydecimal(left_digits=3, right_digits=2, positive=True)))
    total_price = factory.LazyAttribute(lambda obj: obj.unit_price * obj.quantity)
    variant_name = factory.Faker('word')
    variant_value = factory.Faker('word')

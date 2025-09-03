from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ecommerce.apps.reports.models import Claim
from ecommerce.apps.products.models import Product
from ecommerce.apps.orders.models import Order
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea reclamos de prueba para testing'

    def handle(self, *args, **options):
        # Obtener usuarios
        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.ERROR('No hay usuarios en la base de datos'))
            return

        # Obtener productos
        products = Product.objects.all()
        
        # Obtener órdenes
        orders = Order.objects.all()

        claim_types = ['product_issue', 'shipping_issue', 'payment_issue', 'service_issue']
        statuses = ['pending', 'in_review', 'resolved', 'rejected']
        priorities = ['low', 'medium', 'high', 'urgent']

        claims_data = [
            {
                'title': 'Producto defectuoso',
                'description': 'El producto llegó con defectos de fabricación',
                'claim_type': 'product_issue',
                'priority': 'high'
            },
            {
                'title': 'Envío tardío',
                'description': 'El pedido no llegó en la fecha prometida',
                'claim_type': 'shipping_issue',
                'priority': 'medium'
            },
            {
                'title': 'Cargo incorrecto',
                'description': 'Se me cobró un monto diferente al mostrado',
                'claim_type': 'payment_issue',
                'priority': 'urgent'
            },
            {
                'title': 'Mala atención al cliente',
                'description': 'El servicio al cliente no fue satisfactorio',
                'claim_type': 'service_issue',
                'priority': 'low'
            },
            {
                'title': 'Producto no coincide con la descripción',
                'description': 'El producto recibido es diferente al mostrado en la página',
                'claim_type': 'product_issue',
                'priority': 'high'
            }
        ]

        created_count = 0
        for i, claim_data in enumerate(claims_data):
            user = users[i % users.count()]
            product = products[i % products.count()] if products.exists() else None
            order = orders[i % orders.count()] if orders.exists() else None
            
            claim = Claim.objects.create(
                user=user,
                title=claim_data['title'],
                description=claim_data['description'],
                claim_type=claim_data['claim_type'],
                priority=claim_data['priority'],
                status=random.choice(statuses),
                product=product,
                order=order
            )
            created_count += 1
            self.stdout.write(f'Creado reclamo: {claim.title}')

        self.stdout.write(
            self.style.SUCCESS(f'Se crearon {created_count} reclamos de prueba')
        )

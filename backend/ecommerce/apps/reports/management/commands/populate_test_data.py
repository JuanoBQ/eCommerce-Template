from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random
from ecommerce.apps.reports.models import Claim
from ecommerce.apps.products.models import Product, ProductReview
from ecommerce.apps.orders.models import Order

User = get_user_model()


class Command(BaseCommand):
    help = 'Poblar datos de prueba para reportes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--claims',
            type=int,
            default=20,
            help='Número de reclamos a crear'
        )
        parser.add_argument(
            '--reviews',
            type=int,
            default=50,
            help='Número de reviews a crear'
        )

    def handle(self, *args, **options):
        self.stdout.write('Creando datos de prueba para reportes...')

        # Obtener usuarios existentes
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR('No hay usuarios en el sistema. Crea algunos usuarios primero.')
            )
            return

        # Obtener productos existentes
        products = list(Product.objects.all())
        if not products:
            self.stdout.write(
                self.style.ERROR('No hay productos en el sistema. Crea algunos productos primero.')
            )
            return

        # Obtener órdenes existentes
        orders = list(Order.objects.all())

        # Crear reclamos de prueba
        claims_count = options['claims']
        claim_types = ['product_issue', 'shipping_issue', 'payment_issue', 'service_issue', 'other']
        claim_statuses = ['pending', 'in_review', 'resolved', 'rejected']
        claim_priorities = ['low', 'medium', 'high', 'urgent']

        claim_titles = [
            'Producto defectuoso',
            'Problema con el envío',
            'Error en el pago',
            'Mala atención al cliente',
            'Producto no llegó',
            'Talla incorrecta',
            'Color diferente al esperado',
            'Producto dañado en tránsito',
            'Problema con la garantía',
            'Reembolso no procesado'
        ]

        for i in range(claims_count):
            user = random.choice(users)
            product = random.choice(products) if random.choice([True, False]) else None
            order = random.choice(orders) if orders and random.choice([True, False]) else None
            
            claim = Claim.objects.create(
                user=user,
                claim_type=random.choice(claim_types),
                title=random.choice(claim_titles),
                description=f'Descripción detallada del reclamo #{i+1}. Este es un reclamo de prueba generado automáticamente.',
                status=random.choice(claim_statuses),
                priority=random.choice(claim_priorities),
                product=product,
                order=order,
                created_at=timezone.now() - timedelta(days=random.randint(1, 90))
            )

            # Si el reclamo está resuelto, agregar fecha de resolución
            if claim.status == 'resolved':
                claim.resolved_at = claim.created_at + timedelta(days=random.randint(1, 7))
                claim.resolved_by = random.choice(users)
                claim.admin_response = f'Reclamo resuelto satisfactoriamente. Se ha tomado la acción correspondiente.'
                claim.save()

        self.stdout.write(
            self.style.SUCCESS(f'Creados {claims_count} reclamos de prueba')
        )

        # Crear reviews de prueba
        reviews_count = options['reviews']
        review_titles = [
            'Excelente producto',
            'Muy buena calidad',
            'Cumple expectativas',
            'Buen precio',
            'Recomendado',
            'Producto regular',
            'No me gustó',
            'Calidad regular',
            'Podría ser mejor',
            'Excelente servicio'
        ]

        for i in range(reviews_count):
            user = random.choice(users)
            product = random.choice(products)
            rating = random.randint(1, 5)
            
            # Verificar si ya existe una review de este usuario para este producto
            if ProductReview.objects.filter(user=user, product=product).exists():
                continue

            ProductReview.objects.create(
                user=user,
                product=product,
                rating=rating,
                title=random.choice(review_titles),
                comment=f'Esta es una review de prueba #{i+1}. El producto tiene una calificación de {rating} estrellas.',
                is_verified_purchase=random.choice([True, False]),
                is_approved=random.choice([True, False]),
                created_at=timezone.now() - timedelta(days=random.randint(1, 60))
            )

        self.stdout.write(
            self.style.SUCCESS(f'Creadas {reviews_count} reviews de prueba')
        )

        self.stdout.write(
            self.style.SUCCESS('Datos de prueba creados exitosamente!')
        )

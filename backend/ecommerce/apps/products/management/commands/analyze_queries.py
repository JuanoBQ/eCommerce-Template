"""
Comando para analizar queries N+1 en el sistema.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
from django.test import RequestFactory
from django.contrib.auth import get_user_model

from ecommerce.apps.products.views import ProductListView, ProductDetailView
from ecommerce.apps.orders.views import OrderViewSet
from ecommerce.apps.payments.views import PaymentViewSet

User = get_user_model()


class Command(BaseCommand):
    help = 'Analiza queries N+1 en endpoints críticos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--endpoint',
            type=str,
            help='Endpoint específico a analizar (products, orders, payments)',
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='ID del usuario para simular autenticación',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Límite de productos/órdenes/pagos a analizar',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Iniciando análisis de queries N+1...'))
        
        # Configurar usuario si se proporciona
        user = None
        if options['user_id']:
            try:
                user = User.objects.get(id=options['user_id'])
                self.stdout.write(f'👤 Usuario: {user.email}')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ Usuario con ID {options["user_id"]} no encontrado'))
                return
        
        # Analizar endpoints
        if options['endpoint']:
            self.analyze_endpoint(options['endpoint'], user, options['limit'])
        else:
            self.analyze_all_endpoints(user, options['limit'])
        
        self.stdout.write(self.style.SUCCESS('✅ Análisis completado'))
    
    def analyze_all_endpoints(self, user, limit):
        """Analizar todos los endpoints."""
        endpoints = ['products', 'orders', 'payments']
        for endpoint in endpoints:
            self.analyze_endpoint(endpoint, user, limit)
    
    def analyze_endpoint(self, endpoint, user, limit):
        """Analizar un endpoint específico."""
        self.stdout.write(f'\n📊 Analizando endpoint: {endpoint}')
        
        if endpoint == 'products':
            self.analyze_products_endpoint(user, limit)
        elif endpoint == 'orders':
            self.analyze_orders_endpoint(user, limit)
        elif endpoint == 'payments':
            self.analyze_payments_endpoint(user, limit)
        else:
            self.stdout.write(self.style.ERROR(f'❌ Endpoint desconocido: {endpoint}'))
    
    def analyze_products_endpoint(self, user, limit):
        """Analizar endpoint de productos."""
        factory = RequestFactory()
        
        # Test listado de productos
        self.stdout.write('  📋 Analizando listado de productos...')
        request = factory.get('/api/products/')
        if user:
            request.user = user
        
        with self.monitor_queries():
            view = ProductListView()
            view.setup(request)
            queryset = view.get_queryset()[:limit]
            list(queryset)  # Ejecutar queryset
        
        # Test detalle de producto
        self.stdout.write('  🔍 Analizando detalle de producto...')
        from ecommerce.apps.products.models import Product
        product = Product.objects.first()
        if product:
            request = factory.get(f'/api/products/{product.id}/')
            if user:
                request.user = user
            
            with self.monitor_queries():
                view = ProductDetailView()
                view.setup(request)
                view.get_object()
    
    def analyze_orders_endpoint(self, user, limit):
        """Analizar endpoint de órdenes."""
        if not user:
            self.stdout.write('  ⚠️ Se requiere usuario para analizar órdenes')
            return
        
        factory = RequestFactory()
        request = factory.get('/api/orders/')
        request.user = user
        
        with self.monitor_queries():
            view = OrderViewSet()
            view.setup(request)
            queryset = view.get_queryset()[:limit]
            list(queryset)  # Ejecutar queryset
    
    def analyze_payments_endpoint(self, user, limit):
        """Analizar endpoint de pagos."""
        if not user:
            self.stdout.write('  ⚠️ Se requiere usuario para analizar pagos')
            return
        
        factory = RequestFactory()
        request = factory.get('/api/payments/')
        request.user = user
        
        with self.monitor_queries():
            view = PaymentViewSet()
            view.setup(request)
            queryset = view.get_queryset()[:limit]
            list(queryset)  # Ejecutar queryset
    
    def monitor_queries(self):
        """Context manager para monitorear queries."""
        class QueryMonitor:
            def __init__(self, command):
                self.command = command
                self.initial_query_count = len(connection.queries)
            
            def __enter__(self):
                return self
            
            def __exit__(self, exc_type, exc_val, exc_tb):
                final_query_count = len(connection.queries)
                query_count = final_query_count - self.initial_query_count
                
                if query_count > 10:
                    self.command.stdout.write(
                        self.command.style.WARNING(f'    ⚠️ {query_count} queries ejecutadas')
                    )
                else:
                    self.command.stdout.write(
                        self.command.style.SUCCESS(f'    ✅ {query_count} queries ejecutadas')
                    )
                
                # Mostrar queries lentas
                queries = connection.queries[self.initial_query_count:]
                slow_queries = [q for q in queries if float(q['time']) > 0.1]
                if slow_queries:
                    self.command.stdout.write(
                        self.command.style.WARNING(f'    🐌 {len(slow_queries)} queries lentas detectadas')
                    )
        
        return QueryMonitor(self)

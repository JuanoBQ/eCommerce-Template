"""
Comando de gestión para operaciones de cache.
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings
from ecommerce.utils.cache_decorators import CacheManager
from ecommerce.apps.products.models import Product
from ecommerce.apps.categories.models import Category
from ecommerce.apps.orders.models import Order
import time


class Command(BaseCommand):
    help = 'Gestiona operaciones de cache del sistema'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            type=str,
            choices=['warm', 'clear', 'stats', 'invalidate'],
            required=True,
            help='Acción a realizar: warm, clear, stats, invalidate'
        )
        parser.add_argument(
            '--pattern',
            type=str,
            help='Patrón para invalidar cache (solo para invalidate)'
        )
        parser.add_argument(
            '--cache-alias',
            type=str,
            default='default',
            help='Alias del cache a usar'
        )

    def handle(self, *args, **options):
        action = options['action']
        pattern = options.get('pattern')
        cache_alias = options['cache_alias']
        
        # Usar cache fallback si Redis no está disponible
        try:
            cache_manager = CacheManager(cache_alias)
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'Cache {cache_alias} no disponible, usando fallback: {e}')
            )
            cache_manager = CacheManager('fallback')
        
        if action == 'warm':
            self.warm_cache(cache_manager)
        elif action == 'clear':
            self.clear_cache(cache_manager)
        elif action == 'stats':
            self.show_stats(cache_manager)
        elif action == 'invalidate':
            if not pattern:
                self.stdout.write(
                    self.style.ERROR('Se requiere --pattern para invalidate')
                )
                return
            self.invalidate_pattern(cache_manager, pattern)

    def warm_cache(self, cache_manager):
        """
        Pre-calienta el cache con datos frecuentemente accedidos.
        """
        self.stdout.write('Pre-calentando cache...')
        
        start_time = time.time()
        
        # Usar cache local directamente
        from django.core.cache import cache
        
        # Pre-calentar productos populares
        popular_products = Product.objects.filter(
            is_featured=True,
            status='published'
        ).select_related('category', 'brand').prefetch_related('images')[:20]
        
        for product in popular_products:
            cache_key = f"product_detail:{product.id}"
            product_data = {
                'id': product.id,
                'name': product.name,
                'price': float(product.price),
                'category': product.category.name if product.category else None,
                'brand': product.brand.name if product.brand else None,
                'images': [img.image.url for img in product.images.all()],
            }
            cache.set(cache_key, product_data, 3600)  # 1 hora
        
        # Pre-calentar categorías
        categories = Category.objects.filter(parent__isnull=True).prefetch_related('children')
        for category in categories:
            cache_key = f"category_tree:{category.id}"
            category_data = {
                'id': category.id,
                'name': category.name,
                'children': [
                    {
                        'id': child.id,
                        'name': child.name,
                        'slug': child.slug
                    } for child in category.children.all()
                ]
            }
            cache.set(cache_key, category_data, 7200)  # 2 horas
        
        # Pre-calentar estadísticas básicas
        stats_key = "basic_stats"
        stats_data = {
            'total_products': Product.objects.filter(status='published').count(),
            'total_categories': Category.objects.count(),
            'total_orders': Order.objects.count(),
        }
        cache.set(stats_key, stats_data, 300)  # 5 minutos
        
        elapsed_time = time.time() - start_time
        self.stdout.write(
            self.style.SUCCESS(f'Cache pre-calentado en {elapsed_time:.2f} segundos')
        )

    def clear_cache(self, cache_manager):
        """
        Limpia todo el cache.
        """
        self.stdout.write('Limpiando cache...')
        cache_manager.invalidate_pattern('*')
        self.stdout.write(self.style.SUCCESS('Cache limpiado exitosamente'))

    def show_stats(self, cache_manager):
        """
        Muestra estadísticas del cache.
        """
        self.stdout.write('Estadísticas del cache:')
        
        # Estadísticas básicas
        stats = cache_manager.get_stats()
        self.stdout.write(f"Cache Alias: {stats['cache_alias']}")
        self.stdout.write(f"Backend: {stats['backend']}")
        
        # Contar claves en cache (aproximado)
        try:
            # Esto depende del backend de cache
            if hasattr(cache, '_cache'):
                cache_info = cache._cache.get_backend_timeout()
                self.stdout.write(f"Timeout: {cache_info}")
        except:
            self.stdout.write("Información de timeout no disponible")

    def invalidate_pattern(self, cache_manager, pattern):
        """
        Invalida claves que coincidan con el patrón.
        """
        self.stdout.write(f'Invalidando patrón: {pattern}')
        cache_manager.invalidate_pattern(pattern)
        self.stdout.write(self.style.SUCCESS('Patrón invalidado exitosamente'))

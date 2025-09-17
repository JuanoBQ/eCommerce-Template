"""
Comando para sincronizar el stock de productos con sus variantes.
Útil para corregir inconsistencias en el stock.
"""

from django.core.management.base import BaseCommand
from django.db import transaction, models
from ecommerce.apps.products.models import Product
from ecommerce.apps.inventory.autostock_service import AutoStockService


class Command(BaseCommand):
    help = 'Sincroniza el stock de productos con la suma de sus variantes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--product-id',
            type=int,
            help='ID específico del producto a sincronizar'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Sincronizar todos los productos'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar qué se haría sin hacer cambios'
        )

    def handle(self, *args, **options):
        product_id = options.get('product_id')
        sync_all = options.get('all', False)
        dry_run = options.get('dry_run', False)

        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 MODO DRY-RUN: No se realizarán cambios'))

        if product_id:
            # Sincronizar producto específico
            try:
                product = Product.objects.get(id=product_id)
                self.sync_single_product(product, dry_run)
            except Product.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'❌ Producto con ID {product_id} no encontrado')
                )
        elif sync_all:
            # Sincronizar todos los productos
            products = Product.objects.filter(track_inventory=True)
            total_products = products.count()
            
            self.stdout.write(f'🔄 Sincronizando {total_products} productos...')
            
            synced_count = 0
            for product in products:
                if self.sync_single_product(product, dry_run):
                    synced_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Sincronización completada: {synced_count}/{total_products} productos')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Debes especificar --product-id ID o --all')
            )

    def sync_single_product(self, product, dry_run=False):
        """
        Sincroniza un producto individual.
        
        Returns:
            bool: True si se sincronizó, False si no
        """
        if not product.track_inventory:
            self.stdout.write(f'⏭️  Saltando {product.name} (no rastrea inventario)')
            return False

        # Calcular stock actual de variantes
        total_variant_stock = product.variants.filter(
            is_active=True
        ).aggregate(
            total=models.Sum('inventory_quantity')
        )['total'] or 0

        current_stock = product.inventory_quantity
        
        if current_stock == total_variant_stock:
            self.stdout.write(f'✅ {product.name}: Stock ya sincronizado ({current_stock})')
            return False

        if dry_run:
            self.stdout.write(
                f'🔍 {product.name}: {current_stock} -> {total_variant_stock} '
                f'(diferencia: {total_variant_stock - current_stock})'
            )
            return True

        # Sincronizar stock
        try:
            with transaction.atomic():
                AutoStockService.sync_product_stock(product)
                
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ {product.name}: {current_stock} -> {total_variant_stock}'
                )
            )
            return True
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error sincronizando {product.name}: {str(e)}')
            )
            return False

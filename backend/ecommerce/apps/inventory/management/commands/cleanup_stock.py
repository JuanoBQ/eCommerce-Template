"""
Comando de gestión para limpieza y mantenimiento del sistema de stock.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from ecommerce.apps.inventory.autostock_service import AutoStockService
from ecommerce.apps.inventory.models import StockReservation, StockAlert


class Command(BaseCommand):
    help = 'Limpia y mantiene el sistema de stock'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--cleanup-reservations',
            action='store_true',
            help='Limpiar reservas expiradas'
        )
        parser.add_argument(
            '--check-alerts',
            action='store_true',
            help='Verificar y crear alertas de stock bajo'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Ejecutar todas las tareas de limpieza'
        )
    
    def handle(self, *args, **options):
        """Ejecuta el comando de limpieza de stock."""
        self.stdout.write(
            self.style.SUCCESS('🧹 INICIANDO LIMPIEZA DEL SISTEMA DE STOCK')
        )
        self.stdout.write('=' * 50)
        
        if options['cleanup_reservations'] or options['all']:
            self.cleanup_reservations()
        
        if options['check_alerts'] or options['all']:
            self.check_alerts()
        
        if not any([options['cleanup_reservations'], options['check_alerts'], options['all']]):
            self.stdout.write(
                self.style.WARNING('No se especificaron tareas. Use --help para ver opciones.')
            )
    
    def cleanup_reservations(self):
        """Limpia las reservas expiradas."""
        self.stdout.write('🔄 Limpiando reservas expiradas...')
        
        try:
            count = AutoStockService.cleanup_expired_reservations()
            self.stdout.write(
                self.style.SUCCESS(f'✅ {count} reservas expiradas liberadas')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error limpiando reservas: {str(e)}')
            )
    
    def check_alerts(self):
        """Verifica y crea alertas de stock bajo."""
        self.stdout.write('⚠️  Verificando alertas de stock...')
        
        try:
            from ecommerce.apps.products.models import Product
            
            from django.db import models
            
            # Obtener productos con stock bajo
            products = Product.objects.filter(
                track_inventory=True,
                inventory_quantity__lte=models.F('low_stock_threshold')
            )
            
            alerts_created = 0
            for product in products:
                # Verificar si ya existe una alerta activa
                existing_alert = StockAlert.objects.filter(
                    product=product,
                    status='active'
                ).first()
                
                if not existing_alert:
                    # Crear alerta
                    StockAlert.objects.create(
                        product=product,
                        current_quantity=product.inventory_quantity,
                        threshold_quantity=product.low_stock_threshold,
                        alert_type='low_stock',
                        message=f"El producto {product.name} tiene stock bajo. Actual: {product.inventory_quantity}, Umbral: {product.low_stock_threshold}"
                    )
                    alerts_created += 1
            
            # Verificar variantes con stock bajo
            from ecommerce.apps.products.models import ProductVariant
            
            variants = ProductVariant.objects.filter(
                product__track_inventory=True,
                inventory_quantity__lte=models.F('low_stock_threshold')
            )
            
            for variant in variants:
                existing_alert = StockAlert.objects.filter(
                    product=variant.product,
                    variant=variant,
                    status='active'
                ).first()
                
                if not existing_alert:
                    StockAlert.objects.create(
                        product=variant.product,
                        variant=variant,
                        current_quantity=variant.inventory_quantity,
                        threshold_quantity=variant.low_stock_threshold,
                        alert_type='low_stock',
                        message=f"La variante {variant} del producto {variant.product.name} tiene stock bajo. Actual: {variant.inventory_quantity}, Umbral: {variant.low_stock_threshold}"
                    )
                    alerts_created += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ {alerts_created} alertas de stock creadas')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error verificando alertas: {str(e)}')
            )

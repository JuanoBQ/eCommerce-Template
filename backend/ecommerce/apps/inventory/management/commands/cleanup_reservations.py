from django.core.management.base import BaseCommand
from ecommerce.apps.inventory.services import InventoryService


class Command(BaseCommand):
    help = 'Limpia las reservas de stock expiradas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra qué se haría sin ejecutar los cambios',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write('Modo dry-run: No se realizarán cambios')
        
        try:
            count = InventoryService.cleanup_expired_reservations()
            
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(f'Se limpiarían {count} reservas expiradas')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'Se limpiaron {count} reservas expiradas')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error limpiando reservas: {str(e)}')
            )

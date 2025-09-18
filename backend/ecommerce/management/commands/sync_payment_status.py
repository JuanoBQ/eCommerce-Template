from django.core.management.base import BaseCommand
from django.utils import timezone
from ecommerce.apps.orders.models import Order
from ecommerce.apps.payments.models import Payment
from ecommerce.apps.payments.services import PaymentServiceFactory
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sincroniza el estado de los pagos con las pasarelas de pago'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Sincronizar pagos de las últimas N horas (default: 24)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar qué se haría sin ejecutar cambios'
        )

    def handle(self, *args, **options):
        hours = options['hours']
        dry_run = options['dry_run']
        
        # Calcular fecha límite
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours)
        
        self.stdout.write(
            self.style.SUCCESS(f'Sincronizando pagos de las ultimas {hours} horas...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('MODO DRY-RUN: No se realizarán cambios reales')
            )
        
        # Obtener pagos pendientes de las últimas N horas
        pending_payments = Payment.objects.filter(
            status='pending',
            created_at__gte=cutoff_time,
            provider__in=['wompi', 'mercadopago']
        ).select_related('order')
        
        self.stdout.write(f'Encontrados {pending_payments.count()} pagos pendientes')
        
        synced_count = 0
        error_count = 0
        
        for payment in pending_payments:
            try:
                self.sync_payment_status(payment, dry_run)
                synced_count += 1
            except Exception as e:
                error_count += 1
                logger.error(f'Error sincronizando pago {payment.id}: {e}')
                self.stdout.write(
                    self.style.ERROR(f'Error en pago {payment.id}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Sincronizacion completada: {synced_count} exitosos, {error_count} errores'
            )
        )

    def sync_payment_status(self, payment, dry_run=False):
        """Sincroniza el estado de un pago específico"""
        try:
            # Crear servicio de pago
            payment_service = PaymentServiceFactory.create_service(payment.provider)
            if not payment_service or not payment.provider_payment_id:
                self.stdout.write(
                    self.style.WARNING(f'Pago {payment.id}: No se puede verificar (sin provider_payment_id)')
                )
                return
            
            # Verificar con la pasarela
            verify_result = payment_service.verify_payment(payment.provider_payment_id)
            
            if not verify_result.get('success'):
                self.stdout.write(
                    self.style.WARNING(f'Pago {payment.id}: Error verificando con {payment.provider}')
                )
                return
            
            # Mapear estado de la pasarela al estado interno
            provider_status = verify_result.get('status', 'pending')
            new_status = self.map_provider_status(payment.provider, provider_status)
            
            if new_status != payment.status:
                self.stdout.write(
                    f'Pago {payment.id}: {payment.status} → {new_status}'
                )
                
                if not dry_run:
                    # Actualizar estado del pago
                    old_status = payment.status
                    payment.status = new_status
                    
                    if new_status == 'completed':
                        payment.processed_at = timezone.now()
                        payment.save()
                        
                        # Actualizar orden
                        order = payment.order
                        order.status = 'confirmed'
                        order.payment_status = 'paid'
                        order.save()
                        
                        # Procesar stock
                        try:
                            order.process_stock()
                            self.stdout.write(
                                self.style.SUCCESS(f'Stock procesado para orden {order.order_number}')
                            )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'Error procesando stock: {e}')
                            )
                            
                    elif new_status == 'failed':
                        payment.save()
                        
                        # Actualizar orden
                        order = payment.order
                        order.status = 'cancelled'
                        order.payment_status = 'failed'
                        order.save()
                        
                    else:
                        payment.save()
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Pago {payment.id} actualizado: {old_status} → {new_status}')
                    )
            else:
                self.stdout.write(f'Pago {payment.id}: Sin cambios ({new_status})')
                
        except Exception as e:
            raise Exception(f'Error sincronizando pago {payment.id}: {e}')

    def map_provider_status(self, provider, provider_status):
        """Mapea el estado de la pasarela al estado interno"""
        status_mapping = {
            'wompi': {
                'APPROVED': 'completed',
                'PENDING': 'pending',
                'DECLINED': 'failed',
                'REJECTED': 'failed',
                'VOIDED': 'failed',
            },
            'mercadopago': {
                'approved': 'completed',
                'pending': 'pending',
                'rejected': 'failed',
                'cancelled': 'failed',
                'refunded': 'refunded',
            }
        }
        
        return status_mapping.get(provider, {}).get(provider_status.lower(), 'pending')

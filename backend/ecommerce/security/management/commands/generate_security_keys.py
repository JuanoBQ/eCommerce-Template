"""
Comando de gestión para generar claves de seguridad.
Genera SECRET_KEY, API keys y otros secretos para el proyecto.
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from ecommerce.security.key_generator import (
    generate_django_secret_key,
    generate_api_key,
    generate_csp_nonce
)


class Command(BaseCommand):
    help = 'Genera claves de seguridad para el proyecto eCommerce'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['secret', 'api', 'otp', 'all'],
            default='all',
            help='Tipo de clave a generar'
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Archivo de salida para guardar las claves'
        )
        parser.add_argument(
            '--env-format',
            action='store_true',
            help='Formato de salida para archivo .env'
        )
    
    def handle(self, *args, **options):
        """Ejecuta el comando de generación de claves."""
        key_type = options['type']
        output_file = options['output']
        env_format = options['env_format']
        
        keys = {}
        
        if key_type in ['secret', 'all']:
            keys['SECRET_KEY'] = generate_django_secret_key()
            keys['JWT_SECRET_KEY'] = generate_django_secret_key()
        
        if key_type in ['api', 'all']:
            keys['API_KEY'] = generate_api_key(32)
            keys['WOMPI_INTEGRITY_KEY'] = generate_api_key(32)
            keys['MERCADOPAGO_WEBHOOK_SECRET'] = generate_api_key(32)
        
        
        if key_type == 'all':
            keys['CSP_NONCE'] = generate_csp_nonce()
            keys['ENCRYPTION_KEY'] = generate_api_key(64)
        
        # Mostrar claves generadas
        self.stdout.write(
            self.style.SUCCESS('🔐 CLAVES DE SEGURIDAD GENERADAS')
        )
        self.stdout.write('=' * 50)
        
        for key_name, key_value in keys.items():
            self.stdout.write(f'{key_name}: {key_value}')
        
        # Guardar en archivo si se especifica
        if output_file:
            self._save_to_file(keys, output_file, env_format)
            self.stdout.write(
                self.style.SUCCESS(f'✅ Claves guardadas en: {output_file}')
            )
        
        # Mostrar recomendaciones de seguridad
        self._show_security_recommendations()
    
    def _save_to_file(self, keys, filename, env_format=False):
        """Guarda las claves en un archivo."""
        with open(filename, 'w') as f:
            if env_format:
                f.write('# Claves de seguridad generadas automáticamente\n')
                f.write('# NO compartir este archivo en repositorios públicos\n\n')
                for key_name, key_value in keys.items():
                    f.write(f'{key_name}={key_value}\n')
            else:
                f.write('# Claves de seguridad generadas\n')
                f.write('# Fecha: {}\n'.format(
                    __import__('datetime').datetime.now().isoformat()
                ))
                f.write('=' * 50 + '\n\n')
                for key_name, key_value in keys.items():
                    f.write(f'{key_name}: {key_value}\n')
    
    def _show_security_recommendations(self):
        """Muestra recomendaciones de seguridad."""
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.WARNING('⚠️  RECOMENDACIONES DE SEGURIDAD:'))
        self.stdout.write('=' * 50)
        
        recommendations = [
            '1. Guarda las claves en variables de entorno (.env)',
            '2. NUNCA commites las claves al repositorio',
            '3. Usa diferentes claves para desarrollo y producción',
            '4. Rota las claves regularmente (cada 90 días)',
            '5. Usa un gestor de secretos en producción (AWS Secrets Manager, etc.)',
            '6. Configura alertas de seguridad en Sentry',
            '7. Configura autenticación robusta para administradores',
            '8. Revisa regularmente los logs de seguridad',
        ]
        
        for rec in recommendations:
            self.stdout.write(f'  {rec}')
        
        self.stdout.write('\n' + self.style.SUCCESS('✅ Configuración de seguridad completada'))

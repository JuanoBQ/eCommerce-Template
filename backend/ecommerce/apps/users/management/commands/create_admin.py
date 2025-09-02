from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Crea un usuario administrador con permisos de vendor'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@tienda.com', help='Email del administrador')
        parser.add_argument('--password', type=str, default='admin123', help='Contraseña del administrador')
        parser.add_argument('--first-name', type=str, default='Admin', help='Nombre del administrador')
        parser.add_argument('--last-name', type=str, default='Usuario', help='Apellido del administrador')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Verificar si el usuario ya existe
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'El usuario con email {email} ya existe')
            )
            return

        # Crear el usuario administrador
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True,
            is_vendor=True,
            is_customer=True,
            terms_accepted=True
        )

        self.stdout.write(
            self.style.SUCCESS(f'Usuario administrador creado exitosamente: {email}')
        )
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Contraseña: {password}')
        self.stdout.write('Permisos: Superusuario, Staff, Vendor, Customer')

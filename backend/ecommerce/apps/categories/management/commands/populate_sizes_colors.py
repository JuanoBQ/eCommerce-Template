from django.core.management.base import BaseCommand
from ecommerce.apps.categories.models import Size, Color


class Command(BaseCommand):
    help = 'Poblar la base de datos con tallas y colores básicos'

    def handle(self, *args, **options):
        # Crear tallas de ropa
        clothing_sizes = [
            ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), 
            ('XXL', 6), ('XXXL', 7)
        ]
        
        for size_name, sort_order in clothing_sizes:
            size, created = Size.objects.get_or_create(
                name=size_name,
                type='clothing',
                defaults={'sort_order': sort_order}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Creada talla: {size_name}')
                )
        
        # Crear tallas de zapatos
        shoe_sizes = [
            ('35', 1), ('36', 2), ('37', 3), ('38', 4), ('39', 5),
            ('40', 6), ('41', 7), ('42', 8), ('43', 9), ('44', 10),
            ('45', 11), ('46', 12)
        ]
        
        for size_name, sort_order in shoe_sizes:
            size, created = Size.objects.get_or_create(
                name=size_name,
                type='shoes',
                defaults={'sort_order': sort_order}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Creada talla de zapato: {size_name}')
                )
        
        # Crear colores básicos
        colors = [
            ('Negro', '#000000', 1),
            ('Blanco', '#FFFFFF', 2),
            ('Gris', '#808080', 3),
            ('Azul', '#0000FF', 4),
            ('Rojo', '#FF0000', 5),
            ('Verde', '#008000', 6),
            ('Amarillo', '#FFFF00', 7),
            ('Naranja', '#FFA500', 8),
            ('Rosa', '#FFC0CB', 9),
            ('Marrón', '#A52A2A', 10),
            ('Beige', '#F5F5DC', 11),
            ('Azul Marino', '#000080', 12),
            ('Verde Oliva', '#808000', 13),
            ('Púrpura', '#800080', 14),
            ('Turquesa', '#40E0D0', 15),
        ]
        
        for color_name, hex_code, sort_order in colors:
            color, created = Color.objects.get_or_create(
                name=color_name,
                defaults={'hex_code': hex_code, 'sort_order': sort_order}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Creado color: {color_name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('¡Datos de tallas y colores creados exitosamente!')
        )

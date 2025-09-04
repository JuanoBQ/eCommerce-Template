from django.apps import AppConfig


class AdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ecommerce.apps.admin'
    verbose_name = 'Configuración del Sistema'

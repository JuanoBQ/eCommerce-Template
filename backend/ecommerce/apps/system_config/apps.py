from django.apps import AppConfig


class SystemConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ecommerce.apps.system_config'
    verbose_name = 'Configuración del Sistema'

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Configuración del admin para el modelo User personalizado.
    """
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'is_customer', 'is_vendor', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'is_customer', 'is_vendor', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('Información personal'), {
            'fields': ('first_name', 'last_name', 'phone', 'birth_date', 'avatar')
        }),
        (_('Tipo de usuario'), {
            'fields': ('is_customer', 'is_vendor')
        }),
        (_('Dirección por defecto'), {
            'fields': ('default_address', 'default_city', 'default_state', 'default_country', 'default_postal_code'),
            'classes': ('collapse',)
        }),
        (_('Notificaciones'), {
            'fields': ('email_notifications', 'sms_notifications'),
            'classes': ('collapse',)
        }),
        (_('Permisos'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Fechas importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )




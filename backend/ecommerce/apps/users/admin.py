from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, Address


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


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo UserProfile.
    """
    list_display = ['user', 'preferred_size', 'preferred_brand', 'created_at']
    list_filter = ['created_at', 'show_email', 'show_phone']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'bio']
    raw_id_fields = ['user']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Usuario'), {'fields': ('user',)}),
        (_('Información personal'), {
            'fields': ('bio', 'website')
        }),
        (_('Preferencias de compra'), {
            'fields': ('favorite_categories', 'preferred_size', 'preferred_brand'),
            'classes': ('collapse',)
        }),
        (_('Configuración de privacidad'), {
            'fields': ('show_email', 'show_phone'),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Address.
    """
    list_display = ['user', 'type', 'city', 'country', 'is_default', 'created_at']
    list_filter = ['type', 'is_default', 'country', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'address_line_1', 'city']
    raw_id_fields = ['user']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Usuario'), {'fields': ('user',)}),
        (_('Tipo de dirección'), {
            'fields': ('type', 'is_default')
        }),
        (_('Dirección'), {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Si se marca como dirección por defecto, desmarcar las otras
        if obj.is_default:
            Address.objects.filter(user=obj.user, is_default=True).update(is_default=False)
        super().save_model(request, obj, form, change)

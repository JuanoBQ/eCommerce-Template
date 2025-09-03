from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
import json
from .models import Report, Claim


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Report.
    """
    list_display = ['name', 'report_type', 'generated_by', 'data_preview', 'created_at']
    list_filter = ['report_type', 'created_at', 'generated_by']
    search_fields = ['name', 'description', 'generated_by__email']
    readonly_fields = ['generated_by', 'data_preview', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Información del reporte'), {
            'fields': ('name', 'description', 'report_type', 'generated_by')
        }),
        (_('Datos'), {
            'fields': ('data', 'data_preview'),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def data_preview(self, obj):
        """
        Muestra una vista previa de los datos del reporte.
        """
        if obj.data:
            try:
                data = json.loads(obj.data) if isinstance(obj.data, str) else obj.data
                if isinstance(data, dict):
                    # Mostrar las primeras claves del diccionario
                    keys = list(data.keys())[:5]
                    preview = {key: data[key] for key in keys}
                    preview_str = json.dumps(preview, indent=2)[:200]
                    if len(preview_str) >= 200:
                        preview_str += "..."
                    return format_html('<pre>{}</pre>', preview_str)
                elif isinstance(data, list):
                    # Mostrar los primeros elementos de la lista
                    preview = data[:3]
                    preview_str = json.dumps(preview, indent=2)[:200]
                    if len(preview_str) >= 200:
                        preview_str += "..."
                    return format_html('<pre>{}</pre>', preview_str)
                else:
                    return format_html('<pre>{}</pre>', str(data)[:200])
            except (json.JSONDecodeError, TypeError):
                return format_html('<pre>{}</pre>', str(obj.data)[:200])
        return "Sin datos"
    data_preview.short_description = _('Vista previa de datos')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('generated_by')
    
    def save_model(self, request, obj, form, change):
        if not obj.generated_by:
            obj.generated_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['export_reports']
    
    def export_reports(self, request, queryset):
        """
        Acción personalizada para exportar reportes.
        """
        # Aquí podrías implementar la lógica de exportación
        self.message_user(request, f"{queryset.count()} reportes seleccionados para exportación.")
    export_reports.short_description = _("Exportar reportes seleccionados")


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Claim.
    """
    list_display = ['title', 'user', 'claim_type', 'status', 'priority', 'created_at', 'resolved_at']
    list_filter = ['claim_type', 'status', 'priority', 'created_at', 'resolved_at']
    search_fields = ['title', 'description', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['user', 'created_at', 'updated_at', 'resolved_at']
    
    fieldsets = (
        (_('Información del reclamo'), {
            'fields': ('user', 'claim_type', 'title', 'description')
        }),
        (_('Estado y prioridad'), {
            'fields': ('status', 'priority')
        }),
        (_('Relaciones'), {
            'fields': ('order', 'product'),
            'classes': ('collapse',)
        }),
        (_('Respuesta del administrador'), {
            'fields': ('admin_response', 'resolved_by'),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'order', 'product', 'resolved_by')
    
    def save_model(self, request, obj, form, change):
        # Si se marca como resuelto y no tiene resolved_by, asignar el usuario actual
        if obj.status == 'resolved' and not obj.resolved_by:
            obj.resolved_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['mark_as_resolved', 'mark_as_rejected', 'mark_as_pending']
    
    def mark_as_resolved(self, request, queryset):
        """
        Marcar reclamos como resueltos.
        """
        updated = queryset.update(status='resolved', resolved_by=request.user)
        self.message_user(request, f"{updated} reclamos marcados como resueltos.")
    mark_as_resolved.short_description = _("Marcar como resueltos")
    
    def mark_as_rejected(self, request, queryset):
        """
        Marcar reclamos como rechazados.
        """
        updated = queryset.update(status='rejected', resolved_by=request.user)
        self.message_user(request, f"{updated} reclamos marcados como rechazados.")
    mark_as_rejected.short_description = _("Marcar como rechazados")
    
    def mark_as_pending(self, request, queryset):
        """
        Marcar reclamos como pendientes.
        """
        updated = queryset.update(status='pending', resolved_by=None, resolved_at=None)
        self.message_user(request, f"{updated} reclamos marcados como pendientes.")
    mark_as_pending.short_description = _("Marcar como pendientes")

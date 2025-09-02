from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
import json
from .models import Report


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

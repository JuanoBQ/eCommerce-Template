from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer para reportes.
    """
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    generated_by_email = serializers.EmailField(source='generated_by.email', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'name', 'report_type', 'generated_by', 'generated_by_name', 
            'generated_by_email', 'data', 'filters', 'is_scheduled', 
            'schedule_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'generated_by', 'created_at', 'updated_at']

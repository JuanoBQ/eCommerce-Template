from rest_framework import serializers
from .models import Category, Brand, Size, Color


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías.
    """
    children = serializers.SerializerMethodField()
    parent_name = serializers.StringRelatedField(source='parent', read_only=True)
    full_path = serializers.ReadOnlyField()
    level = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'icon',
            'parent', 'parent_name', 'is_active', 'sort_order',
            'meta_title', 'meta_description', 'created_at', 'updated_at',
            'children', 'full_path', 'level'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """
        Retorna las categorías hijas.
        """
        children = obj.get_children()
        return CategorySerializer(children, many=True, context=self.context).data


class BrandSerializer(serializers.ModelSerializer):
    """
    Serializer para marcas.
    """
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'website',
            'is_active', 'sort_order', 'meta_title', 'meta_description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class SizeSerializer(serializers.ModelSerializer):
    """
    Serializer para tallas.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Size
        fields = [
            'id', 'name', 'type', 'type_display', 'sort_order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ColorSerializer(serializers.ModelSerializer):
    """
    Serializer para colores.
    """
    class Meta:
        model = Color
        fields = [
            'id', 'name', 'hex_code', 'is_active', 'sort_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
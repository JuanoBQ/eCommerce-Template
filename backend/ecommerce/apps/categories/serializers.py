from rest_framework import serializers
from .models import Category, Brand, Size, Color


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías.
    """
    children = serializers.SerializerMethodField()
    level = serializers.ReadOnlyField()
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'icon',
            'parent', 'is_active', 'sort_order', 'meta_title',
            'meta_description', 'created_at', 'updated_at',
            'children', 'level', 'full_path'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


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
        read_only_fields = ['id', 'created_at', 'updated_at']


class SizeSerializer(serializers.ModelSerializer):
    """
    Serializer para tallas.
    """
    class Meta:
        model = Size
        fields = [
            'id', 'name', 'type', 'sort_order', 'is_active',
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

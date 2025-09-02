from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant, ProductReview, ProductTag, ProductTagRelation
from ecommerce.apps.categories.models import Category, Brand, Size, Color
from ecommerce.apps.users.models import User


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer para imágenes de productos.
    """
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    """
    Serializer para variantes de productos.
    """
    size_details = serializers.StringRelatedField(source='size', read_only=True)
    color_details = serializers.StringRelatedField(source='color', read_only=True)
    final_price = serializers.ReadOnlyField()
    final_compare_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'size', 'color', 'price', 'compare_price',
            'inventory_quantity', 'low_stock_threshold', 'is_active',
            'weight', 'created_at', 'updated_at', 'size_details',
            'color_details', 'final_price', 'final_compare_price',
            'is_in_stock', 'is_low_stock'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    """
    Serializer para reseñas de productos.
    """
    user_details = serializers.StringRelatedField(source='user', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'rating', 'title', 'comment',
            'is_verified_purchase', 'is_approved', 'created_at',
            'updated_at', 'user_details'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProductTagSerializer(serializers.ModelSerializer):
    """
    Serializer para etiquetas de productos.
    """
    class Meta:
        model = ProductTag
        fields = ['id', 'name', 'slug', 'color', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de productos.
    """
    category_details = serializers.StringRelatedField(source='category', read_only=True)
    brand_details = serializers.StringRelatedField(source='brand', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'sku', 'category',
            'brand', 'price', 'compare_price', 'status', 'is_featured',
            'is_digital', 'requires_shipping', 'created_at', 'updated_at',
            'category_details', 'brand_details', 'primary_image',
            'discount_percentage', 'is_in_stock', 'is_low_stock',
            'average_rating', 'total_reviews'
        ]
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg_rating=serializers.Avg('rating'))['avg_rating'], 1)
        return 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para productos.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    tags = ProductTagSerializer(many=True, read_only=True)
    category_details = serializers.StringRelatedField(source='category', read_only=True)
    brand_details = serializers.StringRelatedField(source='brand', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    margin_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'sku',
            'category', 'brand', 'price', 'compare_price', 'cost_price',
            'track_inventory', 'inventory_quantity', 'low_stock_threshold',
            'allow_backorder', 'status', 'is_featured', 'is_digital',
            'requires_shipping', 'weight', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at', 'images', 'variants',
            'reviews', 'tags', 'category_details', 'brand_details',
            'discount_percentage', 'margin_percentage', 'is_in_stock',
            'is_low_stock', 'average_rating', 'total_reviews'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at']
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg_rating=serializers.Avg('rating'))['avg_rating'], 1)
        return 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar productos.
    """
    images = ProductImageSerializer(many=True, required=False)
    variants = ProductVariantSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'short_description', 'sku', 'category',
            'brand', 'price', 'compare_price', 'cost_price', 'track_inventory',
            'inventory_quantity', 'low_stock_threshold', 'allow_backorder',
            'status', 'is_featured', 'is_digital', 'requires_shipping',
            'weight', 'meta_title', 'meta_description', 'images', 'variants'
        ]
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        
        product = Product.objects.create(**validated_data)
        
        # Crear imágenes
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        # Crear variantes
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        
        # Actualizar producto
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar imágenes si se proporcionan
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                ProductImage.objects.create(product=instance, **image_data)
        
        # Actualizar variantes si se proporcionan
        if variants_data:
            instance.variants.all().delete()
            for variant_data in variants_data:
                ProductVariant.objects.create(product=instance, **variant_data)
        
        return instance


class ProductSearchSerializer(serializers.ModelSerializer):
    """
    Serializer para búsqueda de productos.
    """
    category_details = serializers.StringRelatedField(source='category', read_only=True)
    brand_details = serializers.StringRelatedField(source='brand', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'price', 'compare_price',
            'category_details', 'brand_details', 'primary_image', 'discount_percentage'
        ]
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None

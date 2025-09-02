from rest_framework import serializers
from django.db.models import Avg
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
    size_details = serializers.SerializerMethodField()
    color_details = serializers.SerializerMethodField()
    final_price = serializers.ReadOnlyField()
    final_compare_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    def get_size_details(self, obj):
        if obj.size:
            return {
                'id': obj.size.id,
                'name': obj.size.name,
                'type': obj.size.type
            }
        return None
    
    def get_color_details(self, obj):
        if obj.color:
            return {
                'id': obj.color.id,
                'name': obj.color.name,
                'hex_code': obj.color.hex_code
            }
        return None
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'size', 'color', 'price', 'compare_price',
            'inventory_quantity', 'low_stock_threshold', 'is_active',
            'weight', 'image', 'created_at', 'updated_at', 'size_details',
            'color_details', 'final_price', 'final_compare_price',
            'is_in_stock', 'is_low_stock'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True}
        }


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
    category_details = serializers.SerializerMethodField()
    brand_details = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'sku', 'category',
            'brand', 'gender', 'price', 'compare_price', 'status', 'is_featured',
            'is_digital', 'requires_shipping', 'inventory_quantity', 'track_inventory',
            'low_stock_threshold', 'allow_backorder', 'created_at', 'updated_at',
            'category_details', 'brand_details', 'primary_image', 'variants',
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
            return round(reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'], 1)
        return 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.filter(is_approved=True).count()
    
    def get_category_details(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug
            }
        return None
    
    def get_brand_details(self, obj):
        if obj.brand:
            return {
                'id': obj.brand.id,
                'name': obj.brand.name,
                'slug': obj.brand.slug
            }
        return None
    

    



class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para productos.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
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
            'category', 'brand', 'gender', 'price', 'compare_price', 'cost_price',
            'track_inventory', 'inventory_quantity', 'low_stock_threshold',
            'allow_backorder', 'status', 'is_featured', 'is_digital',
            'requires_shipping', 'weight', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at', 'images', 'variants',
            'reviews', 'category_details', 'brand_details',
            'discount_percentage', 'margin_percentage', 'is_in_stock',
            'is_low_stock', 'average_rating', 'total_reviews'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at']
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'], 1)
        return 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    """
    Serializer para escribir variantes (crear/actualizar).
    Permite el campo 'id' para actualizaciones.
    """
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'size', 'color', 'inventory_quantity', 
            'low_stock_threshold', 'is_active', 'weight'
        ]
        # No incluir 'id' en read_only_fields para permitir actualizaciones


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar productos.
    """
    images = ProductImageSerializer(many=True, required=False)
    variants = ProductVariantWriteSerializer(many=True, required=False)
    
    def is_valid(self, raise_exception=False):
        print("🔍 ProductCreateUpdateSerializer.is_valid - data:", self.initial_data)
        is_valid = super().is_valid(raise_exception=raise_exception)
        if not is_valid:
            print("❌ Validation errors:", self.errors)
        else:
            print("✅ Validation successful")
        return is_valid
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'short_description', 'sku', 'category',
            'brand', 'gender', 'price', 'compare_price', 'cost_price', 'track_inventory',
            'inventory_quantity', 'low_stock_threshold', 'allow_backorder',
            'status', 'is_featured', 'is_digital', 'requires_shipping',
            'weight', 'meta_title', 'meta_description', 'images', 'variants'
        ]
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True}
        }
    
    def is_valid(self, raise_exception=False):
        print("🔍 ProductCreateUpdateSerializer.is_valid - data:", self.initial_data)
        result = super().is_valid(raise_exception=raise_exception)
        if not result:
            print("❌ Validation errors:", self.errors)
        return result
    
    def create(self, validated_data):
        print("🔍 ProductCreateUpdateSerializer.create - validated_data:", validated_data)
        print("🔍 Validated data keys:", list(validated_data.keys()))
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        print("🔍 Images data:", images_data)
        print("🔍 Variants data:", variants_data)
        
        # Generar SKU único para el producto si no se proporciona o si ya existe
        if 'sku' not in validated_data or not validated_data['sku']:
            validated_data['sku'] = self.generate_product_sku(validated_data)
        else:
            # Verificar si el SKU ya existe
            if Product.objects.filter(sku=validated_data['sku']).exists():
                validated_data['sku'] = self.generate_product_sku(validated_data)
        
        print("🔍 Creating product with data:", validated_data)
        product = Product.objects.create(**validated_data)
        print("✅ Product created successfully:", product.id)
        
        # Crear imágenes
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        # Crear variantes
        for variant_data in variants_data:
            # Generar SKU automáticamente si no se proporciona
            if 'sku' not in variant_data or not variant_data['sku']:
                variant_data['sku'] = self.generate_variant_sku(product, variant_data)
            
            # Establecer valores por defecto para campos obligatorios
            variant_data.setdefault('inventory_quantity', 0)
            variant_data.setdefault('low_stock_threshold', 5)
            variant_data.setdefault('is_active', True)
            
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def generate_product_sku(self, product_data):
        """
        Genera un SKU único para el producto basado en el nombre y timestamp.
        """
        import time
        from django.utils.text import slugify
        
        # Crear base del SKU desde el nombre
        base_sku = slugify(product_data.get('name', 'product')).upper()[:10]
        
        # Agregar timestamp para hacer único el SKU
        timestamp = str(int(time.time()))[-6:]  # Últimos 6 dígitos del timestamp
        
        sku = f"{base_sku}-{timestamp}"
        
        # Verificar que el SKU sea único
        counter = 1
        original_sku = sku
        while Product.objects.filter(sku=sku).exists():
            sku = f"{original_sku}-{counter}"
            counter += 1
        
        return sku
    
    def generate_variant_sku(self, product, variant_data):
        """
        Genera un SKU único para la variante basado en el producto y los atributos.
        """
        from ecommerce.apps.categories.models import Size, Color
        
        sku_parts = [product.sku]
        
        # Agregar talla si existe
        if variant_data.get('size'):
            try:
                # Manejar tanto objetos como IDs
                if hasattr(variant_data['size'], 'name'):
                    # Es un objeto
                    size_name = variant_data['size'].name
                else:
                    # Es un ID
                    size = Size.objects.get(id=variant_data['size'])
                    size_name = size.name
                sku_parts.append(size_name)
            except (Size.DoesNotExist, AttributeError):
                pass
        
        # Agregar color si existe
        if variant_data.get('color'):
            try:
                # Manejar tanto objetos como IDs
                if hasattr(variant_data['color'], 'name'):
                    # Es un objeto
                    color_name = variant_data['color'].name[:3].upper()
                else:
                    # Es un ID
                    color = Color.objects.get(id=variant_data['color'])
                    color_name = color.name[:3].upper()
                sku_parts.append(color_name)
            except (Color.DoesNotExist, AttributeError):
                pass
        
        # Agregar timestamp para hacer único el SKU
        import time
        sku_parts.append(str(int(time.time()))[-4:])
        
        return '-'.join(sku_parts)
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        
        # Verificar SKU único si se está actualizando
        if 'sku' in validated_data and validated_data['sku']:
            if Product.objects.filter(sku=validated_data['sku']).exclude(id=instance.id).exists():
                validated_data['sku'] = self.generate_product_sku(validated_data)
        
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
            existing_variant_ids = []
            
            for variant_data in variants_data:
                variant_id = variant_data.get('id')
                
                if variant_id:
                    # Actualizar variante existente
                    try:
                        variant = ProductVariant.objects.get(id=variant_id, product=instance)
                        for attr, value in variant_data.items():
                            if attr != 'id':  # No actualizar el ID
                                setattr(variant, attr, value)
                        variant.save()
                        existing_variant_ids.append(variant_id)
                    except ProductVariant.DoesNotExist:
                        # Si la variante no existe, crear una nueva
                        variant_data_copy = variant_data.copy()
                        variant_data_copy.pop('id', None)  # Remover ID para crear nueva
                        
                        # Generar SKU automáticamente si no se proporciona
                        if 'sku' not in variant_data_copy or not variant_data_copy['sku']:
                            variant_data_copy['sku'] = self.generate_variant_sku(instance, variant_data_copy)
                        
                        # Establecer valores por defecto para campos obligatorios
                        variant_data_copy.setdefault('inventory_quantity', 0)
                        variant_data_copy.setdefault('low_stock_threshold', 5)
                        variant_data_copy.setdefault('is_active', True)
                        
                        new_variant = ProductVariant.objects.create(product=instance, **variant_data_copy)
                        existing_variant_ids.append(new_variant.id)
                else:
                    # Crear nueva variante
                    # Generar SKU automáticamente si no se proporciona
                    if 'sku' not in variant_data or not variant_data['sku']:
                        variant_data['sku'] = self.generate_variant_sku(instance, variant_data)
                    
                    # Establecer valores por defecto para campos obligatorios
                    variant_data.setdefault('inventory_quantity', 0)
                    variant_data.setdefault('low_stock_threshold', 5)
                    variant_data.setdefault('is_active', True)
                    
                    new_variant = ProductVariant.objects.create(product=instance, **variant_data)
                    existing_variant_ids.append(new_variant.id)
            
            # Eliminar variantes que ya no están en la lista
            instance.variants.exclude(id__in=existing_variant_ids).delete()
        
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

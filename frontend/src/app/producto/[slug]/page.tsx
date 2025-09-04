"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import { useSizesAndColors } from '@/hooks/useSizesAndColors'
import { Product, ProductVariant } from '@/types'
import { formatPrice, formatPriceWithDiscount } from '@/utils/currency'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ProductReviews from '@/components/product/ProductReviews'
import StarRating from '@/components/ui/StarRating'
import { Button } from '@/components/ui/button'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { products, loadProducts, isLoading: productsLoading } = useProducts()
  const { items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { sizes, colors } = useSizesAndColors()
  
  // Debug logs
  console.log('🔍 Sizes in product detail:', sizes)
  console.log('🔍 Colors in product detail:', colors)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Función para establecer cantidad de manera segura
  const setSafeQuantity = (newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 0) {
      setQuantity(0)
      return
    }
    setQuantity(Math.max(0, newQuantity))
  }

  // Función para manejar el cambio de cantidad de manera segura
  const handleQuantityChange = (newQuantity: number) => {
    const maxInventory = getCurrentInventory()
    
    // Validar que newQuantity sea un número válido
    if (isNaN(newQuantity) || newQuantity < 0) {
      setSafeQuantity(0)
      return
    }
    
    if (maxInventory === 0) {
      setSafeQuantity(0)
      return
    }
    
    // Limitar la cantidad al stock disponible
    const safeQuantity = Math.max(1, Math.min(newQuantity, maxInventory))
    setSafeQuantity(safeQuantity)
  }

  // Actualizar cantidad inicial cuando cambie el inventario
  useEffect(() => {
    if (product) {
      const maxInventory = getCurrentInventory()
      
      // Si no hay stock, establecer cantidad en 0
      if (maxInventory === 0) {
        setSafeQuantity(0)
        return
      }
      
      // Si la cantidad actual excede el stock disponible, ajustarla
      if (quantity > maxInventory) {
        setSafeQuantity(maxInventory)
        return
      }
      
      // Si la cantidad es 0 pero hay stock, establecer en 1
      if (quantity === 0 && maxInventory > 0) {
        setSafeQuantity(1)
        return
      }
    }
  }, [product, selectedSize, selectedColor, quantity])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slug = params.slug as string

  // Cargar productos y encontrar el producto por slug
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setError(null)
        
        // Cargar productos si no están cargados
        if (products.length === 0) {
          await loadProducts()
        }
        
        // Buscar producto por slug
        const foundProduct = products.find(p => p.slug === slug)
        
        if (foundProduct) {
          console.log('🔍 Product found:', foundProduct)
          console.log('🔍 Product variants:', foundProduct.variants)
          
          // Log detallado de cada variante
          if (foundProduct.variants && foundProduct.variants.length > 0) {
            foundProduct.variants.forEach((variant, index) => {
              console.log(`🔍 Variant ${index}:`, {
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                size_details: variant.size_details,
                color_details: variant.color_details,
                inventory_quantity: variant.inventory_quantity
              })
            })
          }
          
          setProduct(foundProduct)
        } else {
          setError('Producto no encontrado')
        }
      } catch (err) {
        console.error('Error loading product:', err)
        setError('Error al cargar el producto')
      }
    }

    if (slug) {
      loadProduct()
    }
  }, [slug, products, loadProducts])



  const getSelectedVariant = (): ProductVariant | null => {
    if (!product || !selectedSize || !selectedColor) return null
    
    return product.variants?.find(variant => 
      variant.size === selectedSize && variant.color === selectedColor
    ) || null
  }

  // Obtener tallas únicas disponibles
  const getAvailableSizes = () => {
    console.log('🔍 getAvailableSizes called')
    if (!product?.variants) {
      console.log('🔍 No product variants, returning empty array')
      return []
    }
    
    console.log('🔍 Product variants for sizes:', product.variants)
    const sizes = new Map()
    product.variants.forEach((variant, index) => {
      console.log(`🔍 Processing variant ${index} for sizes:`, {
        size_details: variant.size_details,
        inventory_quantity: variant.inventory_quantity,
        selectedColor
      })
      
      if (variant.size_details && variant.inventory_quantity > 0) {
        // Si hay un color seleccionado, solo mostrar tallas de ese color
        if (selectedColor) {
          const hasColorVariant = product.variants?.some(v => 
            v.size === variant.size && v.color === selectedColor && v.inventory_quantity > 0
          )
          if (hasColorVariant) {
            sizes.set(variant.size, variant.size_details)
            console.log(`🔍 Added size ${variant.size} to available sizes`)
          }
        } else {
          sizes.set(variant.size, variant.size_details)
          console.log(`🔍 Added size ${variant.size} to available sizes (no color filter)`)
        }
      } else {
        console.log(`🔍 Skipped variant ${index} - no size_details or no inventory`)
      }
    })
    
    const result = Array.from(sizes.values())
    console.log('🔍 Available sizes result:', result)
    return result
  }

  // Obtener colores únicos disponibles
  const getAvailableColors = () => {
    console.log('🔍 getAvailableColors called')
    if (!product?.variants) {
      console.log('🔍 No product variants, returning empty array')
      return []
    }
    
    console.log('🔍 Product variants for colors:', product.variants)
    const colors = new Map()
    product.variants.forEach((variant, index) => {
      console.log(`🔍 Processing variant ${index} for colors:`, {
        color_details: variant.color_details,
        inventory_quantity: variant.inventory_quantity,
        selectedSize
      })
      
      if (variant.color_details && variant.inventory_quantity > 0) {
        // Si hay una talla seleccionada, solo mostrar colores de esa talla
        if (selectedSize) {
          const hasSizeVariant = product.variants?.some(v => 
            v.size === selectedSize && v.color === variant.color && v.inventory_quantity > 0
          )
          if (hasSizeVariant) {
            colors.set(variant.color, variant.color_details)
            console.log(`🔍 Added color ${variant.color} to available colors`)
          }
        } else {
          colors.set(variant.color, variant.color_details)
          console.log(`🔍 Added color ${variant.color} to available colors (no size filter)`)
        }
      } else {
        console.log(`🔍 Skipped variant ${index} - no color_details or no inventory`)
      }
    })
    
    const result = Array.from(colors.values())
    console.log('🔍 Available colors result:', result)
    return result
  }

  // Manejar selección de talla
  const handleSizeSelection = (sizeId: number) => {
    setSelectedSize(sizeId)
    
    // Si hay un color seleccionado, verificar si la combinación existe
    if (selectedColor) {
      const variant = product?.variants?.find(v => 
        v.size === sizeId && v.color === selectedColor && v.inventory_quantity > 0
      )
      if (!variant) {
        // Si la combinación no existe, limpiar la selección de color
        setSelectedColor(null)
      }
    }
  }

  // Manejar selección de color
  const handleColorSelection = (colorId: number) => {
    setSelectedColor(colorId)
    
    // Si hay una talla seleccionada, verificar si la combinación existe
    if (selectedSize) {
      const variant = product?.variants?.find(v => 
        v.size === selectedSize && v.color === colorId && v.inventory_quantity > 0
      )
      if (!variant) {
        // Si la combinación no existe, limpiar la selección de talla
        setSelectedSize(null)
      }
    }
  }

  const getCurrentPrice = () => {
    if (!product) return 0
    
    const variant = getSelectedVariant()
    const price = variant?.price || product.price
    
    // Asegurar que siempre devolvamos un número válido
    return isNaN(price) ? 0 : Math.max(0, price)
  }

  const getCurrentInventory = () => {
    if (!product) return 0
    
    const variant = getSelectedVariant()
    const inventory = variant?.inventory_quantity || product.inventory_quantity
    
    // Asegurar que siempre devolvamos un número válido
    return isNaN(inventory) ? 0 : Math.max(0, inventory)
  }

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Producto no disponible')
      return
    }

    // Validar que la cantidad sea válida
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    // Validar stock disponible
    const availableStock = getCurrentInventory()
    if (availableStock === 0) {
      toast.error('Este producto no tiene stock disponible')
      return
    }

    if (quantity > availableStock) {
      toast.error(`Solo hay ${availableStock} unidades disponibles`)
      return
    }

    // Si el producto tiene variantes, validar selección
    if (product.variants && product.variants.length > 0) {
      if (!selectedSize) {
        toast.error('Por favor selecciona una talla')
        return
      }

      if (!selectedColor) {
        toast.error('Por favor selecciona un color')
        return
      }

      const variant = getSelectedVariant()
      if (!variant) {
        toast.error('Variante no disponible')
        return
      }

      if (variant.inventory_quantity === 0) {
        toast.error('Esta variante no tiene stock disponible')
        return
      }
    }

    setIsLoading(true)
    try {
      const variant = getSelectedVariant()
      addToCart(product, quantity, variant)
      
      const variantText = variant 
        ? ` (${variant.size_details?.name} - ${variant.color_details?.name})`
        : ''
      
      toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} agregada${quantity === 1 ? '' : 's'} al carrito${variantText}`)
    } catch (error) {
      toast.error('Error al agregar al carrito')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!product) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  const handleToggleFavorite = () => {
    if (!product) return

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Eliminado de favoritos')
    } else {
      addToWishlist(product)
      toast.success('Agregado a favoritos')
    }
  }

  const averageRating = product?.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0

  // Estados de carga y error
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-white">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/tienda" className="inline-flex items-center gap-2">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4" />
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o no está disponible.</p>
          <Link href="/tienda" className="inline-flex items-center gap-2">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4" />
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/tienda" className="text-gray-500 hover:text-gray-900 transition-colors">
              Tienda
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square bg-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.image || '/images/placeholder-product.jpg'}
                  alt={product.images[selectedImage]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">📦</span>
                    </div>
                    <p className="text-gray-400">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 border rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary-500 text-sm font-medium">
                  {product.brand_details?.name}
                </span>
                {product.is_featured && (
                  <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Destacado
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={averageRating} showValue={false} />
                  <span className="text-gray-600 text-sm">
                    ({product.reviews.length} {product.reviews.length === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}

              {/* Precio */}
              <div className="flex items-center gap-3 mb-6">
                {product.compare_price && product.compare_price > getCurrentPrice() ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(getCurrentPrice())}
                    </span>
                    <span className="text-gray-500 line-through text-lg">
                      {formatPrice(product.compare_price)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      -{Math.round(((product.compare_price - getCurrentPrice()) / product.compare_price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(getCurrentPrice())}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variantes */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-4">
                {/* Tallas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Talla</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableSizes().map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelection(size.id)}
                        className={`px-4 py-2 border rounded-md font-medium transition-all ${
                          selectedSize === size.id
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-gray-300 text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                    {getAvailableSizes().length === 0 && (
                      <p className="text-gray-500 text-sm">No hay tallas disponibles</p>
                    )}
                  </div>
                </div>

                {/* Colores */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableColors().map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorSelection(color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.id 
                            ? 'border-primary-500 scale-110' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex_code || '#666' }}
                        title={color.name}
                        aria-label={`Seleccionar color ${color.name}`}
                      />
                    ))}
                    {getAvailableColors().length === 0 && (
                      <p className="text-gray-500 text-sm">No hay colores disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">
                    Este producto no tiene variantes disponibles. Se agregará con las especificaciones por defecto.
                  </p>
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md">
                  <button
                    onClick={() => {
                      const newQuantity = quantity - 1
                      if (newQuantity >= 1) {
                        handleQuantityChange(newQuantity)
                      }
                    }}
                    disabled={quantity <= 1 || getCurrentInventory() === 0}
                    title="Disminuir cantidad"
                    aria-label="Disminuir cantidad"
                    className={`p-2 transition-colors ${
                      quantity <= 1 || getCurrentInventory() === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className={`px-4 py-2 font-medium ${
                    getCurrentInventory() === 0 ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {isNaN(quantity) ? 0 : quantity}
                  </span>
                  <button
                    onClick={() => {
                      const newQuantity = quantity + 1
                      const maxInventory = getCurrentInventory()
                      if (newQuantity <= maxInventory && maxInventory > 0) {
                        handleQuantityChange(newQuantity)
                      }
                    }}
                    disabled={quantity >= getCurrentInventory() || getCurrentInventory() === 0}
                    title="Aumentar cantidad"
                    aria-label="Aumentar cantidad"
                    className={`p-2 transition-colors ${
                      quantity >= getCurrentInventory() || getCurrentInventory() === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm ${
                    getCurrentInventory() === 0 
                      ? 'text-red-500' 
                      : getCurrentInventory() <= 5 
                        ? 'text-yellow-500' 
                        : 'text-gray-600'
                  }`}>
                    {getCurrentInventory()} disponibles
                  </span>
                  {getCurrentInventory() === 0 && (
                    <span className="text-xs text-red-500">Sin stock</span>
                  )}
                  {getCurrentInventory() > 0 && getCurrentInventory() <= 5 && (
                    <span className="text-xs text-yellow-500">Pocas unidades</span>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={
                  isLoading || 
                  getCurrentInventory() === 0 ||
                  quantity === 0 ||
                  (product.variants && product.variants.length > 0 && (!selectedSize || !selectedColor))
                }
                variant="black"
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isLoading 
                  ? 'Agregando...' 
                  : getCurrentInventory() === 0 
                    ? 'Sin stock' 
                    : 'Agregar al carrito'
                }
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                <Button 
                  onClick={handleToggleFavorite}
                  variant={isInWishlist(product.id) ? "outline" : "outline"}
                  className="flex-1"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id) ? 'En Favoritos' : 'Favoritos'}
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-gray-900 font-medium">Envío gratis</p>
                  <p className="text-gray-600 text-sm">En compras +$100.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-gray-900 font-medium">Garantía</p>
                  <p className="text-gray-600 text-sm">30 días</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-gray-900 font-medium">Devoluciones</p>
                  <p className="text-gray-600 text-sm">Fáciles y rápidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="mt-16">
          <ProductReviews 
            productId={product.id} 
            productName={product.name} 
          />
        </div>
      </div>
    </div>
  )
}
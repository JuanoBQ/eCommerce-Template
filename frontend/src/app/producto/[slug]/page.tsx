"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { Product, ProductVariant } from '@/types'
import { formatPrice, formatPriceWithDiscount } from '@/utils/currency'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { products, loadProducts, isLoading: productsLoading } = useProducts()
  
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
    if (!product?.variants) return []
    
    const sizes = new Map()
    product.variants.forEach(variant => {
      if (variant.size_details && variant.inventory_quantity > 0) {
        // Si hay un color seleccionado, solo mostrar tallas de ese color
        if (selectedColor) {
          const hasColorVariant = product.variants?.some(v => 
            v.size === variant.size && v.color === selectedColor && v.inventory_quantity > 0
          )
          if (hasColorVariant) {
            sizes.set(variant.size, variant.size_details)
          }
        } else {
          sizes.set(variant.size, variant.size_details)
        }
      }
    })
    
    return Array.from(sizes.values())
  }

  // Obtener colores únicos disponibles
  const getAvailableColors = () => {
    if (!product?.variants) return []
    
    const colors = new Map()
    product.variants.forEach(variant => {
      if (variant.color_details && variant.inventory_quantity > 0) {
        // Si hay una talla seleccionada, solo mostrar colores de esa talla
        if (selectedSize) {
          const hasSizeVariant = product.variants?.some(v => 
            v.size === selectedSize && v.color === variant.color && v.inventory_quantity > 0
          )
          if (hasSizeVariant) {
            colors.set(variant.color, variant.color_details)
          }
        } else {
          colors.set(variant.color, variant.color_details)
        }
      }
    })
    
    return Array.from(colors.values())
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
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
          <p className="text-dark-300 mb-6">{error}</p>
          <Link 
            href="/tienda"
            className="inline-flex items-center gap-2 bg-neon-green text-dark-900 px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
          <p className="text-dark-300 mb-6">El producto que buscas no existe o no está disponible.</p>
          <Link 
            href="/tienda"
            className="inline-flex items-center gap-2 bg-neon-green text-dark-900 px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-dark-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <span className="text-dark-500">/</span>
            <Link href="/tienda" className="text-dark-300 hover:text-white transition-colors">
              Tienda
            </Link>
            <span className="text-dark-500">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.image || '/images/placeholder-product.jpg'}
                  alt={product.images[selectedImage]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-dark-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl text-dark-400">📦</span>
                    </div>
                    <p className="text-dark-400">Sin imagen disponible</p>
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
                    className={`aspect-square bg-dark-800 border rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'border-neon-green' 
                        : 'border-dark-700 hover:border-dark-600'
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
                <span className="text-neon-green text-sm font-medium">
                  {product.brand_details?.name}
                </span>
                {product.is_featured && (
                  <span className="bg-neon-green text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
                    Destacado
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= averageRating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-dark-300 text-sm">
                    ({product.reviews.length} reseñas)
                  </span>
                </div>
              )}

              {/* Precio */}
              <div className="flex items-center gap-3 mb-6">
                {product.compare_price && product.compare_price > getCurrentPrice() ? (
                  <>
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(getCurrentPrice())}
                    </span>
                    <span className="text-dark-400 line-through text-lg">
                      {formatPrice(product.compare_price)}
                    </span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                      -{Math.round(((product.compare_price - getCurrentPrice()) / product.compare_price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(getCurrentPrice())}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
              <p className="text-dark-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variantes */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-4">
                {/* Tallas */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Talla</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableSizes().map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelection(size.id)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          selectedSize === size.id
                            ? 'border-neon-green bg-neon-green text-dark-900'
                            : 'border-dark-600 text-white hover:border-dark-500'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                    {getAvailableSizes().length === 0 && (
                      <p className="text-dark-400 text-sm">No hay tallas disponibles</p>
                    )}
                  </div>
                </div>

                {/* Colores */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableColors().map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorSelection(color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.id 
                            ? 'border-neon-green scale-110' 
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                        style={{ backgroundColor: color.hex_code || '#666' }}
                        title={color.name}
                        aria-label={`Seleccionar color ${color.name}`}
                      />
                    ))}
                    {getAvailableColors().length === 0 && (
                      <p className="text-dark-400 text-sm">No hay colores disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <p className="text-dark-300 text-sm">
                    Este producto no tiene variantes disponibles. Se agregará con las especificaciones por defecto.
                  </p>
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Cantidad</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-lg">
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
                        ? 'text-dark-500 cursor-not-allowed'
                        : 'text-dark-300 hover:text-white'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className={`px-4 py-2 font-medium ${
                    getCurrentInventory() === 0 ? 'text-dark-500' : 'text-white'
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
                        ? 'text-dark-500 cursor-not-allowed'
                        : 'text-dark-300 hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm ${
                    getCurrentInventory() === 0 
                      ? 'text-red-400' 
                      : getCurrentInventory() <= 5 
                        ? 'text-yellow-400' 
                        : 'text-dark-300'
                  }`}>
                    {getCurrentInventory()} disponibles
                  </span>
                  {getCurrentInventory() === 0 && (
                    <span className="text-xs text-red-400">Sin stock</span>
                  )}
                  {getCurrentInventory() > 0 && getCurrentInventory() <= 5 && (
                    <span className="text-xs text-yellow-400">Pocas unidades</span>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  isLoading || 
                  getCurrentInventory() === 0 ||
                  quantity === 0 ||
                  (product.variants && product.variants.length > 0 && (!selectedSize || !selectedColor))
                }
                className="w-full bg-neon-green text-dark-900 py-4 rounded-lg font-semibold text-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isLoading 
                  ? 'Agregando...' 
                  : getCurrentInventory() === 0 
                    ? 'Sin stock' 
                    : 'Agregar al carrito'
                }
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 border border-dark-600 text-white py-3 rounded-lg font-semibold hover:bg-dark-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
                <button className="flex-1 border border-dark-600 text-white py-3 rounded-lg font-semibold hover:bg-dark-800 transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favoritos
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-dark-700">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-neon-green" />
                <div>
                  <p className="text-white font-medium">Envío gratis</p>
                  <p className="text-dark-300 text-sm">En compras +$100.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-neon-green" />
                <div>
                  <p className="text-white font-medium">Garantía</p>
                  <p className="text-dark-300 text-sm">30 días</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-neon-green" />
                <div>
                  <p className="text-white font-medium">Devoluciones</p>
                  <p className="text-dark-300 text-sm">Fáciles y rápidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Reseñas de clientes</h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold">
                        {review.user_details?.first_name} {review.user_details?.last_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-dark-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-dark-300 text-sm">
                          {new Date(review.created_at).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                    {review.is_verified_purchase && (
                      <span className="bg-neon-green text-dark-900 px-2 py-1 rounded text-xs font-semibold">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <h5 className="text-white font-medium mb-2">{review.title}</h5>
                  <p className="text-dark-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
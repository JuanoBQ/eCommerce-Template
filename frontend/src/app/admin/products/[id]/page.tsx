"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Star,
  Calendar,
  Tag,
  Users,
  Truck,
  Weight,
  Globe,
  Palette,
  Ruler
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProduct, deleteProduct } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const productId = params.id as string

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const productData = await getProduct(parseInt(productId))
      setProduct(productData as Product)
    } catch (error) {
      // Error loading product
      toast.error('Error al cargar el producto')
      router.push('/admin/products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      try {
        setIsDeleting(true)
        await deleteProduct(product.id)
        // El alert de éxito se muestra desde el hook useProducts
        router.push('/admin/products')
      } catch (error) {
        // Error deleting product
        toast.error('Error al eliminar el producto')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-primary-500/20 text-primary-600 border-primary-500/30',
      archived: 'bg-red-500/20 text-red-400 border-red-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    
    const labels = {
      published: 'Publicado',
      archived: 'Archivado',
      draft: 'No Publicado'
    }
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || 'No Publicado'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Product Icon Skeleton */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
          </div>

          {/* Main Loading Spinner */}
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Cargando producto</h2>
            <p className="text-gray-600">Obteniendo detalles del producto...</p>
            
            {/* Progress Steps */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="mt-8">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
        <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-gray-900 font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Volver a productos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Detalle del producto</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/products/edit/${product.id}`}
            className="flex items-center px-4 py-2 bg-primary-600 text-gray-900 font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-500 text-gray-900 font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes del Producto</h2>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.image}
                      alt={image.alt_text || product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {image.is_primary && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-gray-900 text-xs font-medium rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600">No hay imágenes disponibles</p>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
            {product.description && product.description.trim() !== '' ? (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay descripción disponible</p>
              </div>
            )}
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Variantes del Producto</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">SKU</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Talla</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Color</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Precio</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Inventario</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {product.variants.map((variant: any) => (
                      <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-mono text-sm">
                          {variant.sku || 'Sin SKU'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-900">
                              {variant.size_details?.name || variant.size || 'Sin talla'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-900">
                              {variant.color_details?.name || variant.color || 'Sin color'}
                            </span>
                            {variant.color_details?.hex_code && (
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.color_details.hex_code }}
                                title={variant.color_details.name}
                                aria-label={`Color: ${variant.color_details.name}`}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 font-semibold">
                            {variant.price ? formatPrice(variant.price) : formatPrice(product.price)}
                          </div>
                          {variant.compare_price && (
                            <div className="text-gray-500 text-sm line-through">
                              {formatPrice(variant.compare_price)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            variant.inventory_quantity === 0
                              ? 'text-red-600'
                              : variant.inventory_quantity <= (variant.low_stock_threshold || 5)
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {variant.inventory_quantity}
                          </span>
                          {variant.inventory_quantity <= (variant.low_stock_threshold || 5) && variant.inventory_quantity > 0 && (
                            <div className="text-xs text-yellow-600">Stock bajo</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            variant.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {variant.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {product.variants.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay variantes disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* Product Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">SKU</p>
                    <p className="text-gray-900 font-medium">{product.sku}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-neon-blue mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Género</p>
                    <p className="text-gray-900 font-medium capitalize">{product.gender}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-neon-purple mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Requiere Envío</p>
                    <p className="text-gray-900 font-medium">
                      {product.requires_shipping ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-neon-pink mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="text-gray-900 font-medium">
                      {product.is_digital ? 'Digital' : 'Físico'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Weight className="w-5 h-5 text-neon-yellow mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Peso</p>
                    <p className="text-gray-900 font-medium">
                      {product.weight ? `${product.weight} kg` : 'No especificado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Destacado</p>
                    <p className="text-gray-900 font-medium">
                      {product.is_featured ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Producto</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Estado</p>
                {getStatusBadge(product.status)}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Categoría</p>
                {product.category_details ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{product.category_details.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.category_details.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.category_details.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    {product.category_details.description && (
                      <p className="text-sm text-gray-600">{product.category_details.description}</p>
                    )}
                    <p className="text-xs text-gray-500">ID: {product.category_details.id}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Sin categoría asignada</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Marca</p>
                {product.brand_details ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{product.brand_details.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.brand_details.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.brand_details.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    {product.brand_details.description && (
                      <p className="text-sm text-gray-600">{product.brand_details.description}</p>
                    )}
                    {product.brand_details.website && (
                      <a
                        href={product.brand_details.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700 underline"
                      >
                        {product.brand_details.website}
                      </a>
                    )}
                    <p className="text-xs text-gray-500">ID: {product.brand_details.id}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Sin marca asignada</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio</span>
                <span className="text-gray-900 font-semibold">
                  {formatPrice(product.price)}
                </span>
              </div>
              
              {product.compare_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio Comparación</span>
                  <span className="text-gray-900 font-semibold">
                    {formatPrice(product.compare_price)}
                  </span>
                </div>
              )}
              
              {product.cost_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio de Costo</span>
                  <span className="text-gray-900 font-semibold">
                    {formatPrice(product.cost_price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad</span>
                <span className={`font-semibold ${product.inventory_quantity === 0 ? 'text-red-400' : 'text-gray-900'}`}>
                  {product.inventory_quantity}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Control de Inventario</span>
                <span className="text-gray-900 font-semibold">
                  {product.track_inventory ? 'Sí' : 'No'}
                </span>
              </div>
              
              {product.track_inventory && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Umbral Bajo</span>
                  <span className="text-gray-900 font-semibold">
                    {product.low_stock_threshold}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Creado</p>
                  <p className="text-gray-900 text-sm">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Actualizado</p>
                  <p className="text-gray-900 text-sm">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {product.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Publicado</p>
                    <p className="text-gray-900 text-sm">
                      {new Date(product.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

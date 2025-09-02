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
  Globe
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types'

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
      setProduct(productData)
    } catch (error) {
      console.error('Error loading product:', error)
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
        toast.success('Producto eliminado exitosamente')
        router.push('/admin/products')
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Error al eliminar el producto')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-red-500/20 text-red-400 border-red-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    
    const labels = {
      published: 'Publicado',
      archived: 'Archivado',
      draft: 'Borrador'
    }
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || 'Borrador'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-dark-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Producto no encontrado</h3>
        <p className="text-dark-400 mb-4">El producto que buscas no existe o ha sido eliminado</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="p-2 text-dark-400 hover:text-white transition-colors"
            title="Volver a productos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-dark-400 mt-1">Detalle del producto</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/products/edit/${product.id}`}
            className="flex items-center px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Imágenes del Producto</h2>
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
                      <span className="absolute top-2 left-2 px-2 py-1 bg-neon-green text-dark-900 text-xs font-medium rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                <p className="text-dark-400">No hay imágenes disponibles</p>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Descripción</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-dark-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Detalles del Producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-neon-green mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">SKU</p>
                    <p className="text-white font-medium">{product.sku}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-neon-blue mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Género</p>
                    <p className="text-white font-medium capitalize">{product.gender}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-neon-purple mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Requiere Envío</p>
                    <p className="text-white font-medium">
                      {product.requires_shipping ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-neon-pink mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Tipo</p>
                    <p className="text-white font-medium">
                      {product.is_digital ? 'Digital' : 'Físico'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Weight className="w-5 h-5 text-neon-yellow mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Peso</p>
                    <p className="text-white font-medium">
                      {product.weight ? `${product.weight} kg` : 'No especificado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Destacado</p>
                    <p className="text-white font-medium">
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
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estado del Producto</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400 mb-2">Estado</p>
                {getStatusBadge(product.status)}
              </div>
              
              <div>
                <p className="text-sm text-dark-400 mb-2">Categoría</p>
                <p className="text-white font-medium">
                  {product.category_details?.name || 'Sin categoría'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-dark-400 mb-2">Marca</p>
                <p className="text-white font-medium">
                  {product.brand_details?.name || 'Sin marca'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Precios</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">Precio</span>
                <span className="text-white font-semibold">
                  ${(product.price / 100).toFixed(2)}
                </span>
              </div>
              
              {product.compare_price && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Precio Comparación</span>
                  <span className="text-white font-semibold">
                    ${(product.compare_price / 100).toFixed(2)}
                  </span>
                </div>
              )}
              
              {product.cost_price && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Precio de Costo</span>
                  <span className="text-white font-semibold">
                    ${(product.cost_price / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Inventario</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">Cantidad</span>
                <span className={`font-semibold ${product.inventory_quantity === 0 ? 'text-red-400' : 'text-white'}`}>
                  {product.inventory_quantity}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-dark-400">Control de Inventario</span>
                <span className="text-white font-semibold">
                  {product.track_inventory ? 'Sí' : 'No'}
                </span>
              </div>
              
              {product.track_inventory && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Umbral Bajo</span>
                  <span className="text-white font-semibold">
                    {product.low_stock_threshold}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fechas</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-dark-400 mr-3" />
                <div>
                  <p className="text-sm text-dark-400">Creado</p>
                  <p className="text-white text-sm">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-dark-400 mr-3" />
                <div>
                  <p className="text-sm text-dark-400">Actualizado</p>
                  <p className="text-white text-sm">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {product.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-dark-400 mr-3" />
                  <div>
                    <p className="text-sm text-dark-400">Publicado</p>
                    <p className="text-white text-sm">
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

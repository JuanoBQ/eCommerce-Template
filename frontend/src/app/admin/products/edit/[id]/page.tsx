"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload,
  Package,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { Size, Color } from '@/hooks/useSizesAndColors'
import { Product, Category, Brand } from '@/types'
import ProductVariants from '@/components/admin/ProductVariants'

interface ProductFormData {
  name: string
  description: string
  short_description: string
  sku: string
  price: number
  compare_price?: number
  cost_price?: number
  category: number | null
  brand: number | null
  gender: 'masculino' | 'femenino' | 'unisex' | ''
  track_inventory: boolean
  inventory_quantity: number
  low_stock_threshold: number
  allow_backorder: boolean
  status: 'published' | 'draft' | 'archived'
  is_featured: boolean
  is_digital: boolean
  requires_shipping: boolean
  weight?: number
  meta_title?: string
  meta_description?: string
  images: File[]
  variants: ProductVariant[]
}

interface ProductVariant {
  id?: number
  size?: number
  color?: number
  size_details?: Size
  color_details?: Color
  inventory_quantity?: number
  image?: File
  image_url?: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { getProduct, updateProduct, categories, brands, sizes, colors, uploadProductImage } = useProducts()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const variantsFunctionsRef = useRef<{
    getVariantsToDelete: () => number[]
    getActiveVariants: () => any[]
    clearVariantsToDelete: () => void
  } | null>(null)

  const productId = params.id as string

  // Función estable para manejar cambios de variantes
  const handleVariantsChange = useCallback((variants: any[]) => {
    setFormData(prev => ({ ...prev, variants }))
  }, [])

  // Función para registrar las funciones de variantes
  const registerVariantsFunctions = useCallback((functions: {
    getVariantsToDelete: () => number[]
    getActiveVariants: () => any[]
    clearVariantsToDelete: () => void
  }) => {
    variantsFunctionsRef.current = functions
  }, [])

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: 0,
    compare_price: 0,
    cost_price: 0,
    category: null,
    brand: null,
    gender: '',
    track_inventory: true,
    inventory_quantity: 0,
    low_stock_threshold: 10,
    allow_backorder: false,
    status: 'draft',
    is_featured: false,
    is_digital: false,
    requires_shipping: true,
    weight: 0,
    meta_title: '',
    meta_description: '',
    images: [],
    variants: []
  })

  // Calcular inventario total automáticamente basado en las variantes
  useEffect(() => {
    const totalInventory = formData.variants.reduce((sum, variant) => {
      return sum + (variant.inventory_quantity || 0)
    }, 0)
    
    setFormData(prev => ({
      ...prev,
      inventory_quantity: totalInventory
    }))
  }, [formData.variants])

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const productData = await getProduct(parseInt(productId)) as Product
      setProduct(productData)
      
      // Transform existing variants to match the expected format
      const existingVariants = (productData.variants || []).map(variant => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        size_details: variant.size_details,
        color_details: variant.color_details,
        inventory_quantity: variant.inventory_quantity || 0,
        image_url: variant.image || undefined
      }))
      
      // Populate form with existing data
      setFormData({
        name: productData.name,
        description: productData.description,
        short_description: productData.short_description || '',
        sku: productData.sku,
        price: productData.price, // Price in COP, no conversion needed
        compare_price: productData.compare_price || 0,
        cost_price: productData.cost_price || 0,
        category: productData.category,
        brand: productData.brand || null,
        gender: (productData.gender as "masculino" | "femenino" | "unisex") || 'unisex',
        track_inventory: productData.track_inventory,
        inventory_quantity: productData.inventory_quantity,
        low_stock_threshold: productData.low_stock_threshold,
        allow_backorder: productData.allow_backorder,
        status: productData.status,
        is_featured: productData.is_featured,
        is_digital: productData.is_digital,
        requires_shipping: productData.requires_shipping,
        weight: productData.weight || 0,
        meta_title: productData.meta_title || '',
        meta_description: productData.meta_description || '',
        images: [],
        variants: existingVariants
      })
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Error al cargar el producto')
      router.push('/admin/products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    // Clear upload progress for removed image
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido'
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (formData.track_inventory && formData.inventory_quantity < 0) {
      newErrors.inventory_quantity = 'El inventario no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setIsSaving(true)

      // Prepare product data for API
      const productData = {
        name: formData.name,
        description: formData.description || formData.short_description,
        short_description: formData.short_description,
        sku: formData.sku,
        price: formData.price,
        compare_price: formData.compare_price || null,
        cost_price: formData.cost_price || null,
        category: formData.category,
        brand: formData.brand || null,
        gender: formData.gender || 'unisex',
        track_inventory: formData.track_inventory,
        inventory_quantity: Math.max(0, formData.inventory_quantity),
        low_stock_threshold: Math.max(0, formData.low_stock_threshold),
        allow_backorder: formData.allow_backorder,
        status: formData.status || 'draft',
        is_featured: formData.is_featured,
        is_digital: formData.is_digital,
        requires_shipping: formData.requires_shipping,
        weight: formData.weight || null,
        meta_title: formData.meta_title || '',
        meta_description: formData.meta_description || '',
        variants: (() => {
          const activeVariants = variantsFunctionsRef.current?.getActiveVariants() || []
          return activeVariants.map(variant => ({
            id: variant.id,
            size: variant.size,
            color: variant.color,
            inventory_quantity: variant.inventory_quantity || 0
          }))
        })(),
        variants_to_delete: variantsFunctionsRef.current?.getVariantsToDelete() || []
      }



      // Update the product
      await updateProduct(parseInt(productId), productData)
      
      // Upload new images if any
      if (formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i]
          try {
            await updateProduct(parseInt(productId), { images: [file] })
          } catch (error) {
            console.error('Error uploading image:', error)
            toast.error(`Error al subir imagen ${i + 1}`)
          }
        }
      }

      // Limpiar variantes marcadas para eliminación
      variantsFunctionsRef.current?.clearVariantsToDelete()
      
      toast.success('Producto actualizado exitosamente')
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      const errorMessage = error.response?.data?.detail || 'Error al actualizar el producto'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-3xl font-bold text-white">Editar Producto</h1>
            <p className="text-dark-400 mt-1">{product.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="flex items-center px-4 py-2 bg-dark-700 text-white font-medium rounded-lg hover:bg-dark-600 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Información Básica</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-dark-600'
                    }`}
                    placeholder="Ej: Camiseta Nike Dri-FIT"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.sku ? 'border-red-500' : 'border-dark-600'
                    }`}
                    placeholder="Ej: CAM-NIKE-001"
                  />
                  {errors.sku && <p className="text-red-400 text-sm mt-1">{errors.sku}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción Corta
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="Descripción breve del producto..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción Completa *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-dark-600'
                  }`}
                  placeholder="Descripción detallada del producto..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Precios</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio de Venta *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-dark-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio de Comparación
                  </label>
                  <input
                    type="number"
                    name="compare_price"
                    value={formData.compare_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio de Costo
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Category and Brand */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Categorización</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-dark-600'
                    }`}
                    title="Seleccionar categoría"
                    aria-label="Seleccionar categoría"
                  >
                    <option value={0}>Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Marca
                  </label>
                  <select
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    title="Seleccionar marca"
                    aria-label="Seleccionar marca"
                  >
                    <option value={0}>Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Género
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    title="Seleccionar género"
                    aria-label="Seleccionar género"
                  >
                    <option value="">Seleccionar género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Inventario</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Cantidad en Inventario
                  </label>
                  <input
                    type="number"
                    name="inventory_quantity"
                    value={formData.inventory_quantity}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.inventory_quantity ? 'border-red-500' : 'border-dark-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.inventory_quantity && <p className="text-red-400 text-sm mt-1">{errors.inventory_quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Umbral de Stock Bajo
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="track_inventory"
                    checked={formData.track_inventory}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Controlar inventario"
                    aria-label="Controlar inventario"
                  />
                  <label className="ml-3 text-sm text-white">Controlar inventario</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allow_backorder"
                    checked={formData.allow_backorder}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Permitir pedidos pendientes"
                    aria-label="Permitir pedidos pendientes"
                  />
                  <label className="ml-3 text-sm text-white">Permitir pedidos pendientes</label>
                </div>
              </div>
            </div>

            {/* Status and Settings */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Estado y Configuración</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    title="Seleccionar estado"
                    aria-label="Seleccionar estado"
                  >
                    <option value="draft">No Publicado</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Producto destacado"
                    aria-label="Producto destacado"
                  />
                  <label className="ml-3 text-sm text-white">Producto destacado</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_digital"
                    checked={formData.is_digital}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Producto digital"
                    aria-label="Producto digital"
                  />
                  <label className="ml-3 text-sm text-white">Producto digital</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requires_shipping"
                    checked={formData.requires_shipping}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Requiere envío"
                    aria-label="Requiere envío"
                  />
                  <label className="ml-3 text-sm text-white">Requiere envío</label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Imágenes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Agregar Imágenes
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neon-green file:text-dark-900 hover:file:bg-neon-green/90"
                    title="Seleccionar imágenes"
                    aria-label="Seleccionar imágenes"
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-white">Imágenes seleccionadas:</p>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded">
                        <span className="text-sm text-white truncate">{image.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Eliminar imagen"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Variants */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Variantes del Producto</h3>
              <ProductVariants
                variants={formData.variants}
                onVariantsChange={handleVariantsChange}
                onRegisterFunctions={registerVariantsFunctions}
                sizes={sizes}
                colors={colors}
                selectedCategory={formData.category || undefined}
              />
            </div>

            {/* SEO */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">SEO</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Meta Título
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="Título para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Meta Descripción
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="Descripción para SEO"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

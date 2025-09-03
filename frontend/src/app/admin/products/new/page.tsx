"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProducts, Size, Color } from '@/hooks/useProducts'
import { Category, Brand } from '@/types'
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

export default function NewProductPage() {
  const router = useRouter()
  const { createProduct, categories, brands, sizes, colors, isLoading, uploadProductImage } = useProducts()
  

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? parseFloat(value) || 0
          : name === 'category' || name === 'brand'
            ? value ? parseInt(value) : null
            : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = 'La descripción corta es requerida'
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

    if (!formData.brand) {
      newErrors.brand = 'La marca es requerida'
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
      // Prepare product data for API
      const productData = {
        name: formData.name,
        description: formData.description || formData.short_description, // Ensure description is not empty
        short_description: formData.short_description,
        sku: formData.sku,
        price: formData.price, // Price in COP, no conversion needed
        compare_price: formData.compare_price || null,
        cost_price: formData.cost_price || null,
        category: formData.category,
        brand: formData.brand || null, // Ensure brand is null if not selected
        gender: formData.gender || 'unisex', // Default to unisex if not selected
        track_inventory: formData.track_inventory,
        inventory_quantity: Math.max(0, formData.inventory_quantity), // Ensure non-negative
        low_stock_threshold: Math.max(0, formData.low_stock_threshold), // Ensure non-negative
        allow_backorder: formData.allow_backorder,
        status: formData.status || 'draft', // Default to draft if not selected
        is_featured: formData.is_featured,
        is_digital: formData.is_digital,
        requires_shipping: formData.requires_shipping,
        weight: formData.weight || null, // Ensure weight is null if not provided
        meta_title: formData.meta_title || '',
        meta_description: formData.meta_description || '',
        variants: formData.variants.map(variant => ({
          size: variant.size || null,
          color: variant.color || null,
          inventory_quantity: variant.inventory_quantity || 0,
          // Las imágenes de variantes se subirán por separado después de crear el producto
          // Los demás campos se generarán automáticamente en el backend
        }))
      }

      // Create the product
      console.log('📦 Datos del producto a enviar:', productData)
      const newProduct = await createProduct(productData) as any
      
      // Upload images if any
      if (formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i]
          try {
            await uploadProductImage(newProduct.id, file, (progress) => {
              setUploadProgress(prev => ({ ...prev, [i]: progress }))
            })
          } catch (error) {
            console.error(`Error uploading image ${i + 1}:`, error)
          }
        }
      }

      // Upload variant images if any
      if (newProduct.variants && formData.variants.length > 0) {
        for (let i = 0; i < formData.variants.length; i++) {
          const variant = formData.variants[i]
          const createdVariant = newProduct.variants[i]
          
          if (variant.image && createdVariant) {
            try {
              await uploadVariantImage(createdVariant.id, variant.image)
              console.log(`✅ Imagen de variante ${i + 1} subida correctamente`)
            } catch (error) {
              console.error(`Error uploading variant image ${i + 1}:`, error)
            }
          }
        }
      }
      
      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      price: formData.price,
      stock: 0,
      attributes: {}
    }
    
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Nuevo Producto</h1>
            <p className="text-dark-400 mt-2">Crea un nuevo producto para tu catálogo</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Información Básica</h3>
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Categoría * {categories.length > 0 && <span className="text-green-400 text-xs">({categories.length} disponibles)</span>}
                  </label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-dark-600'
                    }`}
                    title="Seleccionar categoría"
                    aria-label="Seleccionar categoría del producto"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))
                    ) : (
                      <option disabled>No hay categorías disponibles</option>
                    )}
                  </select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                  {categories.length === 0 && <p className="text-yellow-400 text-sm mt-1">Cargando categorías...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Marca * {brands.length > 0 && <span className="text-green-400 text-xs">({brands.length} disponibles)</span>}
                  </label>
                  <select
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                      errors.brand ? 'border-red-500' : 'border-dark-600'
                    }`}
                    title="Seleccionar marca"
                    aria-label="Seleccionar marca del producto"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.length > 0 ? (
                      brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))
                    ) : (
                      <option disabled>No hay marcas disponibles</option>
                    )}
                  </select>
                  {errors.brand && <p className="text-red-400 text-sm mt-1">{errors.brand}</p>}
                  {brands.length === 0 && <p className="text-yellow-400 text-sm mt-1">Cargando marcas...</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                    aria-label="Seleccionar género del producto"
                  >
                    <option value="">Seleccionar género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción Corta *
                </label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                    errors.short_description ? 'border-red-500' : 'border-dark-600'
                  }`}
                  placeholder="Descripción breve del producto..."
                />
                {errors.short_description && <p className="text-red-400 text-sm mt-1">{errors.short_description}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción Completa *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-dark-600'
                  }`}
                  placeholder="Describe las características y beneficios del producto..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Precio e Inventario</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-dark-600'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio de Comparación
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">$</span>
                    <input
                      type="number"
                      name="compare_price"
                      value={formData.compare_price || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Precio de Costo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">$</span>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Inventario Total
                    <span className="text-xs text-gray-400 ml-2">(Calculado automáticamente)</span>
                  </label>
                  <input
                    type="number"
                    name="inventory_quantity"
                    value={formData.inventory_quantity}
                    readOnly
                    className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-dark-400 cursor-not-allowed"
                    placeholder="0"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Se calcula sumando el stock de todas las variantes
                  </p>
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
                    placeholder="10"
                  />
                </div>

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
                    aria-label="Seleccionar estado del producto"
                  >
                    <option value="draft">No Publicado</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="track_inventory"
                    checked={formData.track_inventory}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Rastrear inventario"
                    aria-label="Rastrear inventario"
                  />
                  <label className="text-sm font-medium text-white">
                    Rastrear inventario
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="allow_backorder"
                    checked={formData.allow_backorder}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Permitir pedidos pendientes"
                    aria-label="Permitir pedidos pendientes"
                  />
                  <label className="text-sm font-medium text-white">
                    Permitir pedidos pendientes
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Producto destacado"
                    aria-label="Producto destacado"
                  />
                  <label className="text-sm font-medium text-white">
                    Producto destacado
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="requires_shipping"
                    checked={formData.requires_shipping}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                    title="Requiere envío"
                    aria-label="Requiere envío"
                  />
                  <label className="text-sm font-medium text-white">
                    Requiere envío
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Imágenes del Producto</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                  <p className="text-dark-400 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Imágenes
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Producto ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {uploadProgress[index] !== undefined && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-white text-sm">
                              {uploadProgress[index]}%
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar imagen"
                          aria-label={`Eliminar imagen ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-900"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar Producto
                    </>
                  )}
                </button>
                
                <Link
                  href="/admin/products"
                  className="w-full flex items-center justify-center px-4 py-3 bg-dark-700 text-white font-medium rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </div>

            {/* Product Variants */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <ProductVariants
                variants={formData.variants}
                sizes={sizes}
                colors={colors}
                onVariantsChange={(variants) => setFormData({ ...formData, variants })}
                selectedCategory={formData.category}
              />
            </div>

            {/* Product Preview */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
              <div className="space-y-4">
                <div className="aspect-square bg-dark-700 rounded-lg flex items-center justify-center">
                  {formData.images.length > 0 ? (
                    <img
                      src={URL.createObjectURL(formData.images[0])}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-dark-400 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-white">
                    {formData.name || 'Nombre del producto'}
                  </h4>
                  <p className="text-neon-green font-semibold">
                    ${formData.price || '0.00'}
                  </p>
                  <p className="text-dark-400 text-sm">
                    Stock: {formData.inventory_quantity || '0'} unidades
                  </p>
                  <p className="text-dark-400 text-sm">
                    SKU: {formData.sku || 'N/A'}
                  </p>
                  <p className="text-dark-400 text-sm">
                    Estado: {formData.status === 'published' ? 'Publicado' : formData.status === 'draft' ? 'No Publicado' : 'Archivado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

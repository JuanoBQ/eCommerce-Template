"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Search, Filter, Ruler, Palette, Package } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSizesAndColors, Size, Color } from '@/hooks/useSizesAndColors'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const { categories, loadCategories, createCategory, updateCategory, deleteCategory } = useCategories()
  const { products } = useProducts()
  const { 
    sizes, 
    colors, 
    createSize, 
    updateSize, 
    deleteSize, 
    createColor, 
    updateColor, 
    deleteColor 
  } = useSizesAndColors()
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'categories' | 'sizes' | 'colors'>('categories')
  
  // Estados para categorías
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0
  })

  // Estados para tallas
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [sizeFormData, setSizeFormData] = useState({
    name: '',
    type: 'clothing' as 'clothing' | 'shoes' | 'accessories',
    sort_order: 0,
    is_active: true
  })

  // Estados para colores
  const [showColorForm, setShowColorForm] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [colorFormData, setColorFormData] = useState({
    name: '',
    hex_code: '#000000',
    is_active: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadCategories()
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [loadCategories])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCategory(categoryFormData)
      setCategoryFormData({ name: '', description: '', is_active: true, sort_order: 0 })
      setShowCreateForm(false)
      toast.success('Categoría creada exitosamente')
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Error al crear categoría')
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      await updateCategory(editingCategory.id, categoryFormData)
      setEditingCategory(null)
      setCategoryFormData({ name: '', description: '', is_active: true, sort_order: 0 })
      toast.success('Categoría actualizada exitosamente')
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Error al actualizar categoría')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return

    try {
      await deleteCategory(id)
      toast.success('Categoría eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar categoría')
    }
  }

  const getProductCount = (categoryId: number) => {
    return products.filter(product => product.category === categoryId).length
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      sort_order: category.sort_order
    })
  }

  // Funciones para tallas
  const handleCreateSize = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSize(sizeFormData)
      setSizeFormData({ name: '', type: 'clothing', sort_order: 0, is_active: true })
      setShowSizeForm(false)
      toast.success('Talla creada exitosamente')
    } catch (error) {
      console.error('Error creating size:', error)
      toast.error('Error al crear talla')
    }
  }

  const handleUpdateSize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSize) return

    try {
      await updateSize(editingSize.id, sizeFormData)
      setEditingSize(null)
      setSizeFormData({ name: '', type: 'clothing', sort_order: 0, is_active: true })
      toast.success('Talla actualizada exitosamente')
    } catch (error) {
      console.error('Error updating size:', error)
      toast.error('Error al actualizar talla')
    }
  }

  const handleDeleteSize = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta talla?')) return

    try {
      await deleteSize(id)
      toast.success('Talla eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting size:', error)
      toast.error('Error al eliminar talla')
    }
  }

  const startEditSize = (size: Size) => {
    setEditingSize(size)
    setSizeFormData({
      name: size.name,
      type: size.type,
      sort_order: size.sort_order,
      is_active: size.is_active
    })
  }

  // Funciones para colores
  const handleCreateColor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createColor(colorFormData)
      setColorFormData({ name: '', hex_code: '#000000', is_active: true })
      setShowColorForm(false)
      toast.success('Color creado exitosamente')
    } catch (error) {
      console.error('Error creating color:', error)
      toast.error('Error al crear color')
    }
  }

  const handleUpdateColor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingColor) return

    try {
      await updateColor(editingColor.id, colorFormData)
      setEditingColor(null)
      setColorFormData({ name: '', hex_code: '#000000', is_active: true })
      toast.success('Color actualizado exitosamente')
    } catch (error) {
      console.error('Error updating color:', error)
      toast.error('Error al actualizar color')
    }
  }

  const handleDeleteColor = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este color?')) return

    try {
      await deleteColor(id)
      toast.success('Color eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting color:', error)
      toast.error('Error al eliminar color')
    }
  }

  const startEditColor = (color: Color) => {
    setEditingColor(color)
    setColorFormData({
      name: color.name,
      hex_code: color.hex_code,
      is_active: color.is_active
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorías y Variantes</h1>
          <p className="text-dark-400 mt-2">Gestiona categorías, tallas y colores de productos</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'categories' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          )}
          {activeTab === 'sizes' && (
            <button
              onClick={() => setShowSizeForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Talla
            </button>
          )}
          {activeTab === 'colors' && (
            <button
              onClick={() => setShowColorForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Color
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'categories'
              ? 'bg-neon-green text-dark-900'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Categorías
        </button>
        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'sizes'
              ? 'bg-neon-green text-dark-900'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <Ruler className="w-4 h-4" />
          Tallas
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'colors'
              ? 'bg-neon-green text-dark-900'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colores
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'categories' ? 'Buscar categorías...' :
              activeTab === 'sizes' ? 'Buscar tallas...' :
              'Buscar colores...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'categories' && (
        <>
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-neon-green/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-dark-400 text-sm mb-3 line-clamp-2">{category.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-dark-400">
                        {getProductCount(category.id)} productos
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {category.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">No se encontraron categorías</p>
              <p className="text-dark-500 text-sm mt-2">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría'}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'sizes' && (
        <>
          {/* Sizes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sizes.filter(size => 
              size.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((size) => (
              <div key={size.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-neon-green/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{size.name}</h3>
                    <p className="text-dark-400 text-sm">
                      {size.type === 'clothing' ? 'Ropa' : size.type === 'shoes' ? 'Calzado' : 'Accesorios'}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 inline-block ${
                      size.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {size.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditSize(size)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-white rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteSize(size.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sizes.filter(size => 
            size.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">No se encontraron tallas</p>
              <p className="text-dark-500 text-sm mt-2">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera talla'}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'colors' && (
        <>
          {/* Colors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colors.filter(color => 
              color.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((color) => (
              <div key={color.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-neon-green/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-dark-600"
                        style={{ backgroundColor: color.hex_code }}
                        title={`Color: ${color.hex_code}`}
                      />
                      <h3 className="text-lg font-semibold text-white">{color.name}</h3>
                    </div>
                    <p className="text-dark-400 text-sm font-mono">{color.hex_code}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 inline-block ${
                      color.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {color.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditColor(color)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-white rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteColor(color.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {colors.filter(color => 
            color.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">No se encontraron colores</p>
              <p className="text-dark-500 text-sm mt-2">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer color'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingCategory) && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-white mb-2">
                  Nombre
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>

              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-white mb-2">
                  Descripción
                </label>
                <textarea
                  id="category-description"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="Descripción de la categoría"
                />
              </div>

              <div>
                <label htmlFor="category-order" className="block text-sm font-medium text-white mb-2">
                  Orden
                </label>
                <input
                  id="category-order"
                  type="number"
                  value={categoryFormData.sort_order}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={categoryFormData.is_active}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-white">
                  Categoría activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCategory(null)
                    setCategoryFormData({ name: '', description: '', is_active: true, sort_order: 0 })
                  }}
                  className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Modal */}
      {(showSizeForm || editingSize) && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSize ? 'Editar Talla' : 'Nueva Talla'}
            </h2>
            
            <form onSubmit={editingSize ? handleUpdateSize : handleCreateSize} className="space-y-4">
              <div>
                <label htmlFor="size-name" className="block text-sm font-medium text-white mb-2">
                  Nombre de la talla
                </label>
                <input
                  id="size-name"
                  type="text"
                  value={sizeFormData.name}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="Ej: S, M, L, XL o 35, 36, 37..."
                  required
                />
              </div>

              <div>
                <label htmlFor="size-type" className="block text-sm font-medium text-white mb-2">
                  Tipo de talla
                </label>
                <select
                  id="size-type"
                  value={sizeFormData.type}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, type: e.target.value as 'clothing' | 'shoes' | 'accessories' })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                >
                  <option value="clothing">Ropa (S, M, L, XL)</option>
                  <option value="shoes">Calzado (35, 36, 37...)</option>
                  <option value="accessories">Accesorios (Talla Única)</option>
                </select>
              </div>

              <div>
                <label htmlFor="size-order" className="block text-sm font-medium text-white mb-2">
                  Orden
                </label>
                <input
                  id="size-order"
                  type="number"
                  value={sizeFormData.sort_order}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="size-active"
                  checked={sizeFormData.is_active}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                />
                <label htmlFor="size-active" className="ml-2 text-sm text-white">
                  Talla activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
                >
                  {editingSize ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSizeForm(false)
                    setEditingSize(null)
                    setSizeFormData({ name: '', type: 'clothing', sort_order: 0, is_active: true })
                  }}
                  className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Modal */}
      {(showColorForm || editingColor) && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingColor ? 'Editar Color' : 'Nuevo Color'}
            </h2>
            
            <form onSubmit={editingColor ? handleUpdateColor : handleCreateColor} className="space-y-4">
              <div>
                <label htmlFor="color-name" className="block text-sm font-medium text-white mb-2">
                  Nombre del color
                </label>
                <input
                  id="color-name"
                  type="text"
                  value={colorFormData.name}
                  onChange={(e) => setColorFormData({ ...colorFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  placeholder="Ej: Negro, Blanco, Rojo..."
                  required
                />
              </div>

              <div>
                <label htmlFor="color-hex" className="block text-sm font-medium text-white mb-2">
                  Código de color (HEX)
                </label>
                <div className="flex gap-3">
                  <input
                    id="color-hex"
                    type="color"
                    value={colorFormData.hex_code}
                    onChange={(e) => setColorFormData({ ...colorFormData, hex_code: e.target.value })}
                    className="w-16 h-10 bg-dark-700 border border-dark-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorFormData.hex_code}
                    onChange={(e) => setColorFormData({ ...colorFormData, hex_code: e.target.value })}
                    className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent font-mono"
                    placeholder="#000000"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="color-active"
                  checked={colorFormData.is_active}
                  onChange={(e) => setColorFormData({ ...colorFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                />
                <label htmlFor="color-active" className="ml-2 text-sm text-white">
                  Color activo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
                >
                  {editingColor ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowColorForm(false)
                    setEditingColor(null)
                    setColorFormData({ name: '', hex_code: '#000000', is_active: true })
                  }}
                  className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
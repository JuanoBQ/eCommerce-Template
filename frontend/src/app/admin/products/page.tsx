"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Star,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'

export default function ProductsPage() {
  const { products, isLoading, loadProducts, deleteProduct, categories, brands } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDeleteProduct = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id)
        toast.success('Producto eliminado exitosamente')
      } catch (error) {
        toast.error('Error al eliminar producto')
      }
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.short_description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || 
                           (product.category_details && product.category_details.name === categoryFilter)
    const matchesBrand = brandFilter === 'all' || 
                        (product.brand_details && product.brand_details.name === brandFilter)
    const matchesGender = genderFilter === 'all' || product.gender === genderFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesGender
  })

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
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Productos</h1>
          <p className="text-dark-400 mt-2">Gestiona tu catálogo de productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Producto
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-white mt-2">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Productos Publicados</p>
              <p className="text-2xl font-bold text-white mt-2">
                {products.filter(p => p.status === 'published').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-neon-blue" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Sin Stock</p>
              <p className="text-2xl font-bold text-white mt-2">
                {products.filter(p => p.inventory_quantity === 0).length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-neon-purple" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatPrice(products.reduce((sum, p) => sum + (p.price * p.inventory_quantity), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-neon-pink" />
          </div>
        </div>
      </div>

      {/* Categorías más populares */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribución por Categorías</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories && Array.isArray(categories) && categories.map((category) => {
            const categoryProducts = products.filter(p => p.category_details?.name === category.name)
            return (
              <div key={category.id} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{category.name}</p>
                    <p className="text-dark-400 text-sm">{categoryProducts.length} productos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon-green font-bold text-lg">{categoryProducts.length}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              title="Filtrar por estado"
              aria-label="Filtrar productos por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
              <option value="draft">Borrador</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              title="Filtrar por categoría"
              aria-label="Filtrar productos por categoría"
            >
              <option value="all">Todas las categorías</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              title="Filtrar por marca"
              aria-label="Filtrar productos por marca"
            >
              <option value="all">Todas las marcas</option>
              {Array.isArray(brands) && brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              title="Filtrar por género"
              aria-label="Filtrar productos por género"
            >
              <option value="all">Todos los géneros</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          
          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || categoryFilter !== 'all' || brandFilter !== 'all' || genderFilter !== 'all') && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setBrandFilter('all')
                  setGenderFilter('all')
                }}
                className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-dark-600 rounded-lg flex items-center justify-center mr-4">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0].image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-dark-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-dark-400 truncate max-w-xs">
                          {product.short_description || product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {product.category_details?.name || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    <span className={product.inventory_quantity === 0 ? 'text-red-400' : 'text-white'}>
                      {product.inventory_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-white">
                        {product.average_rating || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-dark-400 hover:text-white transition-colors"
                        title="Ver producto"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="p-2 text-dark-400 hover:text-neon-green transition-colors"
                        title="Editar producto"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No se encontraron productos</h3>
            <p className="text-dark-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}

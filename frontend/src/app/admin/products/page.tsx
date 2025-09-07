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
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableSkeleton from '@/components/ui/TableSkeleton'
import CardSkeleton from '@/components/ui/CardSkeleton'

export default function ProductsPage() {
  const { products, isLoading, loadProducts, deleteProduct, categories, brands, pagination, stats, goToPage, loadCategoryStats } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [categoryStats, setCategoryStats] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    loadProducts({ page: 1, page_size: 20 }, false, true) // isPublicView=false, isAdminView=true
  }, [loadProducts])

  useEffect(() => {
    const loadStats = async () => {
      if (categories && categories.length > 0) {
        setLoadingStats(true)
        try {
          const stats = await loadCategoryStats()
          setCategoryStats(stats)
        } catch (error) {
          console.error('Error loading category stats:', error)
        } finally {
          setLoadingStats(false)
        }
      }
    }
    loadStats()
  }, [categories, loadCategoryStats])

  const handleDeleteProduct = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id)
        // El alert de éxito se muestra desde el hook useProducts
      } catch (error) {
        toast.error('Error al eliminar producto')
      }
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || 'No Publicado'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <CardSkeleton count={8} showImage={true} showActions={true} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Producto
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.total_products || pagination.count}</p>
            </div>
            <Package className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Productos Publicados</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.published_products || products.filter(p => p.status === 'published').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-primary-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sin Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.out_of_stock || products.filter(p => p.inventory_quantity === 0).length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.inventory_value ? formatPrice(stats.inventory_value) : formatPrice(products.reduce((sum, p) => sum + (p.price * p.inventory_quantity), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Categorías más populares */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
        {loadingStats ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats && categoryStats.length > 0 ? categoryStats.map((category) => (
              <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">{category.name}</p>
                    <p className="text-gray-600 text-sm">{category.productCount} productos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-500 font-bold text-lg">{category.productCount}</p>
                  </div>
                </div>
              </div>
            )) : (
              categories && Array.isArray(categories) && categories.map((category) => (
                <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{category.name}</p>
                      <p className="text-gray-600 text-sm">Cargando...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-500 font-bold text-lg">-</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por estado"
              aria-label="Filtrar productos por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
              <option value="draft">No Publicado</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por categoría"
              aria-label="Filtrar productos por categoría"
            >
              <option value="all">Seleccionar categoría</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por marca"
              aria-label="Filtrar productos por marca"
            >
              <option value="all">Seleccionar marca</option>
              {Array.isArray(brands) && brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              title="Filtrar por género"
              aria-label="Filtrar productos por género"
            >
              <option value="all">Seleccionar género</option>
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
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paginación Minimalista - Entre filtros y tabla */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPage(pagination.current_page - 1, false, true)}
              disabled={pagination.current_page === 1 || isLoading}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-gray-600 px-2">
              {pagination.current_page} de {pagination.total_pages}
            </span>
            <button
              onClick={() => goToPage(pagination.current_page + 1, false, true)}
              disabled={pagination.current_page === pagination.total_pages || isLoading}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {pagination.count} productos
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.short_description || product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {product.sku || 'Sin SKU'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category_details?.name || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={product.inventory_quantity === 0 ? 'text-red-500' : 'text-gray-900'}>
                      {product.inventory_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        0
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                        title="Ver producto"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        title="Editar producto"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}

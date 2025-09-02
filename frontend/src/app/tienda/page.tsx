"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Grid, List, SlidersHorizontal, X } from 'lucide-react'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'
import Dropdown from '@/components/ui/Dropdown'



interface Filters {
  search: string
  category: number | null
  brand: number | null
  minPrice: number | null
  maxPrice: number | null
  sortBy: 'name' | 'price' | 'created_at' | 'popularity'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

function TiendaContent() {
  const { addToCart } = useCart()
  const { products, categories, brands, isLoading: productsLoading, loadProducts } = useProducts()
  const searchParams = useSearchParams()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    category: null,
    brand: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Manejar parámetros de búsqueda de la URL
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam && searchParam !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchParam }))
    }
  }, [searchParams, filters.search])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...products]

    // Filtro de búsqueda
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro de categoría
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Filtro de marca
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand)
    }

    // Filtro de precio
    if (filters.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'popularity':
          aValue = a.is_featured ? 1 : 0
          bValue = b.is_featured ? 1 : 0
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }, [products, filters.search, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder])

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'name',
      sortOrder: 'asc',
      viewMode: filters.viewMode
    })
  }

  // Opciones para los dropdowns
  const categoryOptions = [
    { value: null, label: 'Todas las categorías' },
    ...categories.map(category => ({
      value: category.id,
      label: category.name,
      count: products.filter(p => p.category === category.id).length
    }))
  ]

  const brandOptions = [
    { value: null, label: 'Todas las marcas' },
    ...brands.map(brand => ({
      value: brand.id,
      label: brand.name,
      count: products.filter(p => p.brand === brand.id).length
    }))
  ]

  const sortOptions = [
    { value: 'name-asc', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' },
    { value: 'price-asc', label: 'Precio menor a mayor' },
    { value: 'price-desc', label: 'Precio mayor a menor' },
    { value: 'created_at-desc', label: 'Más recientes' },
    { value: 'popularity-desc', label: 'Más populares' }
  ]



  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header de la tienda */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Tienda <span className="text-neon-green">FitStore</span>
            </h1>
            <p className="text-dark-300 text-lg">
              Encuentra la mejor ropa deportiva y accesorios para tu entrenamiento
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Filtros horizontales */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Filtros</h3>
              <button
                onClick={clearFilters}
                className="text-dark-400 hover:text-white transition-colors text-sm"
              >
                Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Dropdown
                label="Categoría"
                options={categoryOptions}
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value as number | null })}
                placeholder="Todas las categorías"
              />
              
              <Dropdown
                label="Marca"
                options={brandOptions}
                value={filters.brand}
                onChange={(value) => setFilters({ ...filters, brand: value as number | null })}
                placeholder="Todas las marcas"
              />
              
              <Dropdown
                label="Ordenar por"
                options={sortOptions}
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(value) => {
                  const [sortBy, sortOrder] = (value as string).split('-')
                  setFilters({ 
                    ...filters, 
                    sortBy: sortBy as any, 
                    sortOrder: sortOrder as any 
                  })
                }}
                placeholder="Seleccionar orden"
              />
              
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Más filtros
                </button>
              </div>
            </div>

            {/* Filtros adicionales (colapsables) */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-dark-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Precio mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        minPrice: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Precio máximo
                    </label>
                    <input
                      type="number"
                      placeholder="1000000"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        maxPrice: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div>
            {/* Barra de herramientas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-dark-300">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Vista */}
                <div className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-lg p-1">
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: 'grid' })}
                    title="Vista en cuadrícula"
                    aria-label="Vista en cuadrícula"
                    className={`p-2 rounded ${filters.viewMode === 'grid' ? 'bg-neon-green text-dark-900' : 'text-dark-300 hover:text-white'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: 'list' })}
                    title="Vista en lista"
                    aria-label="Vista en lista"
                    className={`p-2 rounded ${filters.viewMode === 'list' ? 'bg-neon-green text-dark-900' : 'text-dark-300 hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de productos */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark-300 text-lg">No se encontraron productos</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                filters.viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 ${
                      filters.viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Imagen del producto */}
                    <div className={`${filters.viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} relative overflow-hidden`}>
                      <img
                        src={product.images?.[0]?.image || '/images/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt_text || product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {product.is_featured && (
                        <div className="absolute top-3 left-3 bg-neon-green text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
                          Destacado
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className={`p-6 ${filters.viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="mb-2">
                        <span className="text-neon-green text-sm font-medium">
                          {product.brand_details?.name}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                        {product.short_description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_price && product.compare_price > product.price && (
                            <span className="text-dark-400 line-through text-sm">
                              {formatPrice(product.compare_price)}
                            </span>
                          )}
                        </div>
                        
                        {product.inventory_quantity <= product.low_stock_threshold && (
                          <span className="text-orange-400 text-xs">
                            ¡Pocas unidades!
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-neon-green text-dark-900 px-4 py-2 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
                        >
                          Agregar al carrito
                        </button>
                        <Link
                          href={`/producto/${product.slug}`}
                          className="px-4 py-2 border border-dark-600 text-white rounded-lg hover:bg-dark-700 transition-colors"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-white">Cargando tienda...</p>
        </div>
      </div>
    }>
      <TiendaContent />
    </Suspense>
  )
}

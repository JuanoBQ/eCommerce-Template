"use client"

import { useState, useEffect, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Grid, List, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import { useStoreFilters } from '@/hooks/useStoreFilters'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'
import Dropdown from '@/components/ui/Dropdown'
import { ProductCard } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { Heart } from 'lucide-react'
import StoreFilters from '@/components/filters/StoreFilters'

// Componente de overlay de carga para la página de la tienda
const StoreLoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm mx-4"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            <div className="absolute inset-0 rounded-full border-2 border-primary-100"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Cargando productos</h3>
            <p className="text-sm text-gray-600">Aplicando filtros y buscando resultados...</p>
          </div>
          <div className="flex space-x-1">
            <motion.div
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)



interface Filters {
  search: string
  category: number | null
  brand: number | null
  gender: 'men' | 'women' | 'unisex' | null
  minPrice: number | null
  maxPrice: number | null
  sortBy: 'name' | 'price' | 'created_at' | 'popularity'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  sale: boolean
}

function TiendaContent() {
  const router = useRouter()
  const {
    products,
    categories,
    brands,
    isLoading: productsLoading,
    loadProducts,
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = useProducts()

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  
  const {
    search,
    filters,
    filterGroups,
    hasActiveFilters,
    activeFiltersCount,
    isLoading: filtersLoading,
    handleSearchChange,
    handleFilterChange,
    handleClearAll,
    applyFiltersToAPI,
    setSearch,
    setFilters
  } = useStoreFilters({
    categories: categories || [],
    brands: brands || [],
    products: products || [],
    loadProducts,
    pagination,
    onFiltersChange: (newFilters) => {
      console.log('🔍 useStoreFilters - onFiltersChange called:', newFilters)
    }
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at' | 'popularity'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  
  // Detectar si viene de navegación para ocultar barra de filtros
  const isFromNavigation = searchParams.get('from_nav') === 'true'

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts({ page: 1, page_size: 20 }, true) // true indica que es vista pública
  }, [loadProducts])

  // Manejar parámetros de búsqueda de la URL
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const genderParamRaw = searchParams.get('gender')
    // Mapear géneros de la base de datos a los del frontend
    const genderParam = genderParamRaw === 'masculino' ? 'men' : 
                       genderParamRaw === 'femenino' ? 'women' : 
                       genderParamRaw === 'unisex' ? 'unisex' : 
                       genderParamRaw as 'men' | 'women' | 'unisex' | null
    const categoryParam = searchParams.get('category')
    const saleParam = searchParams.get('sale') === 'true'
    const clearFiltersParam = searchParams.get('clear_filters')
    
    console.log('🔍 Navegación detectada:', { 
      gender: genderParam, 
      category: categoryParam, 
      clearFilters: clearFiltersParam 
    })
    
    // Si debe limpiar filtros, limpiar búsqueda y resetear filtros existentes
    if (clearFiltersParam === 'true') {
      setSearch('')
      setFilters({}) // Limpiar filtros existentes
    }
    
    // Procesar todos los parámetros de filtro de manera unificada
    let newFilters: any = {}
    let hasFilters = false
    
    // Aplicar filtro de búsqueda si existe
    if (searchParam) {
      setSearch(searchParam)
    }
    
    // Aplicar filtro de género si existe
    if (genderParam) {
      // Mapear género de la URL al estado interno
      const mappedGender = genderParam === 'masculino' ? 'men' : 
                          genderParam === 'femenino' ? 'women' : 
                          genderParam
      newFilters.gender = [mappedGender]
      hasFilters = true
    }
    
    // Aplicar filtro de categoría si existe
    if (categoryParam) {
      let categoryId: number | null = null
      
      // Si es un número, usarlo directamente
      if (!isNaN(Number(categoryParam))) {
        categoryId = Number(categoryParam)
      } else {
        // Si es un string, buscar por slug o nombre
        const foundCategory = categories.find(c => 
          c.slug === categoryParam || 
          c.name.toLowerCase() === categoryParam.toLowerCase()
        )
        if (foundCategory) {
          categoryId = foundCategory.id
        }
      }
      
      if (categoryId) {
        newFilters.category = [categoryId]
        hasFilters = true
      }
    }
    
    // Aplicar filtro de ofertas si existe
    if (saleParam) {
      newFilters.sale = ['sale']
      hasFilters = true
    }
    
    // Procesar otros parámetros de filtros
    const featuredParam = searchParams.get('featured') === 'true'
    const newParam = searchParams.get('new') === 'true'
    const trendingParam = searchParams.get('trending') === 'true'
    
    if (featuredParam) {
      newFilters.featured = ['featured']
      hasFilters = true
    }
    
    if (newParam) {
      newFilters.new = ['new']
      hasFilters = true
    }
    
    if (trendingParam) {
      newFilters.trending = ['trending']
      hasFilters = true
    }
    
    // Aplicar filtros si hay alguno
    if (hasFilters) {
      console.log('🔍 Aplicando filtros:', newFilters)
      setFilters(newFilters)
      applyFiltersToAPI(searchParam || '', newFilters, 1)
    }
  }, [searchParams.get('category'), searchParams.get('gender'), searchParams.get('from_nav'), searchParams.get('clear_filters'), categories])

  // Los productos ya vienen filtrados de la API, solo aplicamos ordenamiento local si es necesario
  const filteredProducts = useMemo(() => {
    // Si no hay ordenamiento específico, usar los productos tal como vienen de la API
    if (sortBy === 'name' && sortOrder === 'asc') {
      return products
    }

    // Aplicar ordenamiento local solo si es necesario
    const sorted = [...products].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
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

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }, [products, sortBy, sortOrder])

  const handleViewDetails = (product: Product) => {
    router.push(`/producto/${product.slug}`)
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const clearFilters = () => {
    handleClearAll()
  }

  // Opciones para el dropdown de ordenamiento
  const sortOptions = [
    { value: 'name-asc', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' },
    { value: 'price-asc', label: 'Precio menor a mayor' },
    { value: 'price-desc', label: 'Precio mayor a menor' },
    { value: 'created_at-desc', label: 'Más recientes' },
    { value: 'popularity-desc', label: 'Más populares' }
  ]



  return (
    <div className="min-h-screen bg-white">
      {/* Header de la tienda */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tienda <span className="text-primary-500">FitStore</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Encuentra la mejor ropa deportiva y accesorios para tu entrenamiento
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros - Siempre mostrar */}
          <div className="lg:w-80 flex-shrink-0">
            <StoreFilters
              filterGroups={filterGroups}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              searchValue={search}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Buscar productos..."
              isMobile={isMobile}
              showSearch={true}
              isLoading={filtersLoading}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Mensaje informativo cuando se viene de navegación */}
            {isFromNavigation && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <p className="text-gray-900 font-medium">
                      {filters.sale?.includes('sale') ? 'Ofertas' : 
                       filters.gender?.includes('men') ? 'Productos para Hombres' : 
                       filters.gender?.includes('women') ? 'Productos para Mujeres' : 
                       filters.gender?.includes('unisex') ? 'Productos Unisex' : 'Productos Filtrados'}
                      {filters.category && filters.category.length > 0 && categories.find(c => filters.category.includes(c.id)) && 
                       ` - ${categories.find(c => filters.category.includes(c.id))?.name}`}
                    </p>
                  </div>
                  <Link 
                    href="/tienda" 
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              </div>
            )}

            {/* Barra de herramientas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  Mostrando {pagination.count} productos (Página {pagination.current_page} de {pagination.total_pages})
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Vista */}
                <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Vista en cuadrícula"
                    aria-label="Vista en cuadrícula"
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Vista en lista"
                    aria-label="Vista en lista"
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de productos */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <Button
                  onClick={clearFilters}
                  variant="primary"
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onToggleWishlist={() => handleWishlistToggle(product)}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))}
                </div>
                <StoreLoadingOverlay isLoading={filtersLoading || productsLoading} />
              </div>
            )}

            {/* Paginación */}
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={(page) => applyFiltersToAPI(search, filters, page)}
              isLoading={productsLoading}
              totalItems={pagination.count}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Store Icon Skeleton */}
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
            <h2 className="text-xl font-semibold text-gray-900">Cargando tienda</h2>
            <p className="text-gray-600">Preparando catálogo de productos...</p>
            
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
    }>
      <TiendaContent />
    </Suspense>
  )
}

"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Grid, List, SlidersHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import { Product } from '@/types'
import { formatPrice } from '@/utils/currency'
import Dropdown from '@/components/ui/Dropdown'
import { ProductCard } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'



interface Filters {
  search: string
  category: number | null
  brand: number | null
  gender: 'men' | 'women' | null
  minPrice: number | null
  maxPrice: number | null
  sortBy: 'name' | 'price' | 'created_at' | 'popularity'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  sale: boolean
}

function TiendaContent() {
  const router = useRouter()
  const { products, categories, brands, isLoading: productsLoading, loadProducts } = useProducts()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const searchParams = useSearchParams()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? categories.find(c => c.slug === searchParams.get('category'))?.id || null : null,
    brand: null,
    gender: (searchParams.get('gender') as 'men' | 'women') || null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid',
    sale: searchParams.get('sale') === 'true'
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Detectar si viene de navegación para ocultar barra de filtros
  const isFromNavigation = searchParams.get('from_nav') === 'true'

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts({}, true) // true indica que es vista pública
  }, [loadProducts])

  // Recargar productos cuando cambie el género (para "Ver Todo")
  useEffect(() => {
    const genderParam = searchParams.get('gender') as 'men' | 'women' | null
    const clearFiltersParam = searchParams.get('clear_filters')
    
    // Si es "Ver Todo" (clear_filters=true), recargar productos
    if (clearFiltersParam === 'true' && genderParam) {
      loadProducts({}, true)
    }
  }, [searchParams.get('gender'), searchParams.get('clear_filters')])

  // Manejar parámetros de búsqueda de la URL
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const genderParam = searchParams.get('gender') as 'men' | 'women' | null
    const categoryParam = searchParams.get('category')
    const saleParam = searchParams.get('sale') === 'true'
    const fromNavParam = searchParams.get('from_nav') // Detectar si viene de navegación
    const clearFiltersParam = searchParams.get('clear_filters') // Detectar si debe limpiar filtros
    
    // Si viene de navegación, resetear todos los filtros primero
    if (fromNavParam === 'true') {
      setFilters({
        search: searchParam || '',
        category: categoryParam ? categories.find(c => c.slug === categoryParam)?.id || null : null,
        brand: null,
        gender: genderParam,
        minPrice: null,
        maxPrice: null,
        sortBy: 'name',
        sortOrder: 'asc',
        viewMode: 'grid',
        sale: saleParam
      })
      return
    }
    
    // Si debe limpiar filtros (Ver Todo), solo mantener género
    if (clearFiltersParam === 'true') {
      setFilters({
        search: '',
        category: null,
        brand: null,
        gender: genderParam,
        minPrice: null,
        maxPrice: null,
        sortBy: 'name',
        sortOrder: 'asc',
        viewMode: 'grid',
        sale: false
      })
      return
    }
    
    const updates: Partial<Filters> = {}
    
    if (searchParam !== filters.search) {
      updates.search = searchParam || ''
    }
    
    if (genderParam !== filters.gender) {
      updates.gender = genderParam
    }
    
    if (categoryParam) {
      const categoryId = categories.find(c => c.slug === categoryParam)?.id || null
      if (categoryId !== filters.category) {
        updates.category = categoryId
      }
    }
    
    if (saleParam !== filters.sale) {
      updates.sale = saleParam
    }
    
    if (Object.keys(updates).length > 0) {
      setFilters(prev => ({ ...prev, ...updates }))
    }
  }, [searchParams, categories, filters.search, filters.gender, filters.category, filters.sale])

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

    // Filtro de género
    if (filters.gender) {
      filtered = filtered.filter(product => {
        // Si el producto tiene campo gender específico, usarlo
        if (product.gender) {
          const productGender = product.gender.toLowerCase()
          
          // Los productos unisex se muestran en ambas categorías
          if (productGender === 'unisex') {
            return true
          }
          
          // Filtrar por género específico
          if (filters.gender === 'men') {
            return productGender === 'masculino' || productGender === 'male' || productGender === 'hombre'
          } else if (filters.gender === 'women') {
            return productGender === 'femenino' || productGender === 'female' || productGender === 'mujer'
          }
        }
        
        // Fallback: buscar por keywords en nombre y descripción
        const genderKeywords = filters.gender === 'men' 
          ? ['hombre', 'masculino', 'men', 'male'] 
          : ['mujer', 'femenino', 'women', 'female']
        
        const searchText = `${product.name} ${product.description} ${product.category_details?.name || ''}`.toLowerCase()
        return genderKeywords.some(keyword => searchText.includes(keyword)) || 
               searchText.includes('unisex') // Incluir productos unisex
      })
    }

    // Filtro de precio
    if (filters.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!)
    }

    // Filtro de ofertas
    if (filters.sale) {
      filtered = filtered.filter(product => 
        product.compare_price && product.compare_price > product.price
      )
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
  }, [products, filters.search, filters.category, filters.brand, filters.gender, filters.minPrice, filters.maxPrice, filters.sale, filters.sortBy, filters.sortOrder])

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
    setFilters({
      search: '',
      category: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'name',
      sortOrder: 'asc',
      viewMode: filters.viewMode,
      gender: null,
      sale: false
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

  const genderOptions = [
    { value: null, label: 'Todos los géneros' },
    { value: 'men', label: 'Hombres' },
    { value: 'women', label: 'Mujeres' }
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
    <div className="min-h-screen bg-white">
      {/* Header de la tienda */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Filtros horizontales - Solo mostrar si no viene de navegación */}
          {!isFromNavigation && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
              >
                Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                label="Género"
                options={genderOptions}
                value={filters.gender}
                onChange={(value) => setFilters({ ...filters, gender: value as 'men' | 'women' | null })}
                placeholder="Todos los géneros"
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
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="w-full"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Más filtros
                </Button>
              </div>
            </div>

            {/* Filtros adicionales (colapsables) */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Contenido principal */}
          <div>
            {/* Mensaje informativo cuando se ocultan filtros */}
            {isFromNavigation && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <p className="text-gray-900 font-medium">
                      {filters.sale ? 'Ofertas' : 
                       filters.gender === 'men' ? 'Productos para Hombres' : 
                       filters.gender === 'women' ? 'Productos para Mujeres' : 'Productos Filtrados'}
                      {filters.category && categories.find(c => c.id === filters.category) && 
                       ` - ${categories.find(c => c.id === filters.category)?.name}`}
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
                  Mostrando {filteredProducts.length} de {products.length} productos
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Vista */}
                <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md p-1">
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: 'grid' })}
                    title="Vista en cuadrícula"
                    aria-label="Vista en cuadrícula"
                    className={`p-2 rounded ${filters.viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: 'list' })}
                    title="Vista en lista"
                    aria-label="Vista en lista"
                    className={`p-2 rounded ${filters.viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
              <div className={`grid gap-6 ${
                filters.viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
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
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    }>
      <TiendaContent />
    </Suspense>
  )
}

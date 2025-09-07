import { useState, useCallback, useMemo } from 'react'
import { FilterGroup, FilterOption } from '@/components/filters/StoreFilters'

export interface StoreFiltersState {
  search: string
  filters: Record<string, (string | number | null)[]>
}

export interface UseStoreFiltersOptions {
  categories: Array<{ id: number; name: string; slug: string }>
  brands: Array<{ id: number; name: string; slug: string }>
  products: Array<{ id: number; category: number; brand: number; gender: string; price: number; compare_price?: number }>
  onFiltersChange?: (filters: StoreFiltersState) => void
  loadProducts?: (params: any, isPublicView: boolean) => Promise<void>
  pagination?: {
    count: number
    current_page: number
    total_pages: number
  }
}

export const useStoreFilters = ({ categories, brands, products, onFiltersChange, loadProducts, pagination }: UseStoreFiltersOptions) => {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, (string | number | null)[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Wrapper para setFilters con logging
  const setFiltersWithLog = useCallback((newFilters: Record<string, (string | number | null)[]>) => {
    console.log('🔍 setFilters llamado:', newFilters)
    setFilters(newFilters)
  }, [])

  // Extraer géneros únicos de los productos
  const availableGenders = useMemo(() => {
    const genderSet = new Set<string>()
    products.forEach(product => {
      if (product.gender) {
        genderSet.add(product.gender)
      }
    })
    return Array.from(genderSet).sort()
  }, [products])

  // Función para formatear el nombre del género
  const formatGenderName = (gender: string) => {
    const genderMap: Record<string, string> = {
      'men': 'Hombres',
      'women': 'Mujeres',
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'unisex': 'Unisex',
      'male': 'Masculino',
      'female': 'Femenino'
    }
    return genderMap[gender.toLowerCase()] || gender.charAt(0).toUpperCase() + gender.slice(1)
  }

  const filterGroups: FilterGroup[] = useMemo(() => {
    console.log('🔍 useStoreFilters - categories:', categories.map(c => ({ name: c.name, productCount: c.productCount })))
    console.log('🔍 useStoreFilters - brands:', brands.map(b => ({ name: b.name, productCount: b.productCount })))
    
    return [
      {
        id: 'category',
        label: 'Categoría',
        type: 'multiple',
        options: categories
          // .filter(cat => (cat.productCount || 0) > 0) // Temporalmente comentado para debug
          .map(cat => ({
            id: `cat-${cat.id}`,
            label: cat.name,
            value: cat.id,
            count: cat.productCount || 0
          }))
      },
      {
        id: 'brand',
        label: 'Marca',
        type: 'multiple',
        options: brands
          // .filter(brand => (brand.productCount || 0) > 0) // Temporalmente comentado para debug
          .map(brand => ({
            id: `brand-${brand.id}`,
            label: brand.name,
            value: brand.id,
            count: brand.productCount || 0
          }))
      },
    {
      id: 'gender',
      label: 'Género',
      type: 'multiple',
      options: availableGenders.map(gender => ({
        id: `gender-${gender}`,
        label: formatGenderName(gender),
        value: gender,
        count: products.filter(p => p.gender === gender).length
      }))
    },
    {
      id: 'priceRange',
      label: 'Rango de Precio',
      type: 'single',
      options: [
        { id: '0-50000', label: 'Hasta $50,000', value: '0-50000' },
        { id: '50000-100000', label: '$50,000 - $100,000', value: '50000-100000' },
        { id: '100000-200000', label: '$100,000 - $200,000', value: '100000-200000' },
        { id: '200000+', label: 'Más de $200,000', value: '200000+' }
      ]
    },
    {
      id: 'sale',
      label: 'Ofertas',
      type: 'single',
      options: [
        { id: 'sale', label: 'Solo ofertas', value: 'sale' }
      ]
    }
    ]
  }, [categories, brands, products])

  // Función para aplicar filtros a la API
  const applyFiltersToAPI = useCallback(async (searchValue: string, currentFilters: Record<string, (string | number | null)[]>, page: number = 1) => {
    if (!loadProducts) return

    console.log('🔍 applyFiltersToAPI called with:', { searchValue, currentFilters, page })
    setIsLoading(true)
    try {
      const apiParams: any = {
        page,
        search: searchValue || undefined,
      }

      // Agregar filtros de categoría
      if (currentFilters.category && currentFilters.category.length > 0) {
        apiParams.category = currentFilters.category.filter(id => id !== null)
      }

      // Agregar filtros de marca
      if (currentFilters.brand && currentFilters.brand.length > 0) {
        apiParams.brand = currentFilters.brand.filter(id => id !== null)
      }

      // Agregar filtros de género
      if (currentFilters.gender && currentFilters.gender.length > 0) {
        // Mapear géneros del frontend al backend
        const mappedGenders = currentFilters.gender
          .filter(gender => gender !== null)
          .map(gender => {
            if (gender === 'men') return 'masculino'
            if (gender === 'women') return 'femenino'
            return gender // unisex se mantiene igual
          })
        apiParams.gender = mappedGenders
      }

      // Agregar filtros de rango de precio
      if (currentFilters.priceRange && currentFilters.priceRange.length > 0) {
        const priceRange = currentFilters.priceRange[0]
        if (priceRange === '0-50000') {
          apiParams.max_price = 50000
        } else if (priceRange === '50000-100000') {
          apiParams.min_price = 50000
          apiParams.max_price = 100000
        } else if (priceRange === '100000-200000') {
          apiParams.min_price = 100000
          apiParams.max_price = 200000
        } else if (priceRange === '200000+') {
          apiParams.min_price = 200000
        }
      }

      // Agregar filtro de ofertas
      if (currentFilters.sale && currentFilters.sale.includes('sale')) {
        apiParams.sale = true
      }

      console.log('🔍 useStoreFilters - API Params:', apiParams)
      console.log('🔍 useStoreFilters - Current Filters:', currentFilters)
      
      await loadProducts(apiParams, true)
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadProducts])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    onFiltersChange?.({ search: value, filters })
    // Aplicar filtros a la API con debounce
    const timeoutId = setTimeout(() => {
      applyFiltersToAPI(value, filters, 1)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [filters, onFiltersChange, applyFiltersToAPI])

  const handleFilterChange = useCallback((groupId: string, values: (string | number | null)[]) => {
    console.log('🔍 handleFilterChange called:', { groupId, values, currentFilters: filters })
    const newFilters = { ...filters, [groupId]: values }
    console.log('🔍 New filters:', newFilters)
    setFilters(newFilters)
    onFiltersChange?.({ search, filters: newFilters })
    // Aplicar filtros a la API inmediatamente para filtros
    console.log('🔍 Calling applyFiltersToAPI with:', { search, newFilters })
    applyFiltersToAPI(search, newFilters, 1)
  }, [search, filters, onFiltersChange, applyFiltersToAPI])

  const handleClearAll = useCallback(() => {
    setSearch('')
    setFilters({})
    onFiltersChange?.({ search: '', filters: {} })
    // Aplicar filtros vacíos a la API
    applyFiltersToAPI('', {}, 1)
  }, [onFiltersChange, applyFiltersToAPI])

  const hasActiveFilters = useMemo(() => {
    return search !== '' || Object.values(filters).some(values => values.length > 0)
  }, [search, filters])

  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    Object.values(filters).forEach(values => {
      count += values.length
    })
    return count
  }, [filters])

  return {
    search,
    filters,
    filterGroups,
    hasActiveFilters,
    activeFiltersCount: getActiveFiltersCount(),
    isLoading,
    handleSearchChange,
    handleFilterChange,
    handleClearAll,
    applyFiltersToAPI,
    setSearch,
    setFilters: setFiltersWithLog
  }
}

export default useStoreFilters

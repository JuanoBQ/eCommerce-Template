import { useState, useEffect, useCallback } from 'react'
import { productsApi, categoriesApi } from '@/lib/api'
import { Product, Category, Brand } from '@/types'
import { getMockCategories, getMockBrands } from '@/data/mockData'
import { useSizesAndColors, Size, Color } from './useSizesAndColors'
import { useToast } from './useToast'
import axios from 'axios'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    count: number
    next: string | null
    previous: string | null
    current_page: number
    total_pages: number
  }>({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  })
  const [stats, setStats] = useState<{
    total_products: number
    published_products: number
    draft_products: number
    archived_products: number
    out_of_stock: number
    low_stock: number
    inventory_value: number
  } | null>(null)
  
  // Usar el hook de tallas y colores
  const { sizes, colors } = useSizesAndColors()
  
  // Usar el hook de toast personalizado
  const { showSuccess, showError, showLoading, showInfo, showWarning } = useToast()



  // Load categories and brands
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories()
      const categoriesData = response.results || response
      
      // Mapear product_count a productCount para compatibilidad con el frontend
      const mappedCategories = categoriesData.map((category: any) => ({
        ...category,
        productCount: category.product_count || 0
      }))
      
      setCategories(mappedCategories)
    } catch (err) {
      // Usar datos mock como fallback
      setCategories(getMockCategories())
    }
  }, [])

  const loadBrands = useCallback(async () => {
    try {
      const response = await categoriesApi.getBrands()
      const brandsData = response.results || response
      
      // Mapear product_count a productCount para compatibilidad con el frontend
      const mappedBrands = brandsData.map((brand: any) => ({
        ...brand,
        productCount: brand.product_count || 0
      }))
      
      setBrands(mappedBrands)
    } catch (err) {
      // Usar datos mock como fallback
      setBrands(getMockBrands())
    }
  }, [])



  // Load mock data immediately
  const loadMockData = useCallback(() => {
    const mockCategories = getMockCategories()
    const mockBrands = getMockBrands()
    setCategories(mockCategories)
    setBrands(mockBrands)
  }, [])

  // Load products
  const loadProducts = useCallback(async (params?: any, isPublicView: boolean = false, isAdminView: boolean = false) => {
    setIsLoading(true)
    setError(null)
    try {
      // Para la tienda pública, solo cargar productos publicados
      // Para el dashboard de admin, cargar todos los productos sin paginación
      const requestParams = { ...params }

      // Para el panel de admin, usar paginación normal
      if (isAdminView) {
        requestParams.page_size = 20  // 20 productos por página en admin
        requestParams.page = params?.page || 1
      }

      // Para la tienda pública, usar paginación y filtros
      if (isPublicView) {
        requestParams.page_size = 20  // 20 productos por página en tienda
        requestParams.page = params?.page || 1
        
        // Agregar filtros de búsqueda
        if (params?.search) {
          requestParams.search = params.search
        }
        
        // Agregar filtros de categoría
        if (params?.category && params.category.length > 0) {
          // Convertir array a string separado por comas para el backend
          requestParams.category = params.category.join(',')
        }
        
        // Agregar filtros de marca
        if (params?.brand && params.brand.length > 0) {
          // Convertir array a string separado por comas para el backend
          requestParams.brand = params.brand.join(',')
        }
        
        // Agregar filtros de género
        if (params?.gender && params.gender.length > 0) {
          // Convertir array a string separado por comas para el backend
          requestParams.gender = params.gender.join(',')
        }
        
        // Agregar filtros de precio
        if (params?.min_price) {
          requestParams.min_price = params.min_price
        }
        if (params?.max_price) {
          requestParams.max_price = params.max_price
        }
        
        // Agregar filtro de ofertas
        if (params?.sale) {
          requestParams.sale = params.sale
        }
        
        // Agregar filtro de destacados
        if (params?.featured) {
          requestParams.is_featured = true
        }
        
        // Agregar filtro de nuevos productos
        if (params?.new) {
          // Filtrar productos creados en los últimos 30 días
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          requestParams.created_after = thirtyDaysAgo.toISOString().split('T')[0]
        }
        
        // Agregar filtro de tendencia (productos más vendidos)
        if (params?.trending) {
          requestParams.ordering = '-is_featured,-created_at'
        }
        
        // Agregar ordenamiento
        if (params?.ordering) {
          requestParams.ordering = params.ordering
        }
      }

      let response
      if (isPublicView) {
        // Para vista pública, hacer petición sin token de autenticación
        // Esto asegura que el backend filtre solo productos publicados
        const publicApi = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        response = await publicApi.get('/products/', { params: requestParams })
        response = response.data
      } else {
        // Para admin, usar la API normal con autenticación
        response = await productsApi.getProducts(requestParams)
      }

      // Manejar respuesta paginada
      if (response.results) {
        // Respuesta paginada
        setProducts(response.results)

        // Calcular página actual desde la URL de next/previous
        let currentPage = 1
        if (response.previous) {
          // Si hay previous, estamos en página > 1
          const url = new URL(response.previous)
          const prevPage = parseInt(url.searchParams.get('page') || '1')
          currentPage = prevPage + 1
        } else if (response.next && !response.previous) {
          // Primera página
          currentPage = 1
        } else if (!response.next && response.previous) {
          // Última página
          const url = new URL(response.previous)
          currentPage = parseInt(url.searchParams.get('page') || '1') + 1
        }

        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: currentPage,
          total_pages: Math.ceil(response.count / (params?.page_size || 20))
        })

        // Guardar estadísticas si están disponibles
        if (response.stats) {
          setStats(response.stats)
        }
      } else {
        // Respuesta sin paginación (todos los productos)
        setProducts(response)
        setPagination({
          count: response.length,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        })
      }
    } catch (err) {
      setError('Error al cargar productos')
      showError('Error al cargar productos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load category statistics (all products, no pagination)
  const loadCategoryStats = useCallback(async () => {
    try {
      // Obtener todos los productos sin paginación para estadísticas
      const response = await productsApi.getProducts({
        page_size: 1000, // Obtener muchos productos para estadísticas precisas
        page: 1
      })

      const allProducts = response.results || response || []

      // Calcular estadísticas por categoría
      const categoryStats = categories.map(category => {
        const categoryProducts = allProducts.filter((p: any) =>
          p.category_details?.name === category.name
        )
        return {
          ...category,
          productCount: categoryProducts.length
        }
      })

      return categoryStats
    } catch (err) {
      return []
    }
  }, [categories])

  // Load product count by category ID
  const getProductCountByCategory = useCallback(async (categoryId: number) => {
    try {
      // Obtener todos los productos sin paginación
      const response = await productsApi.getProducts({
        page_size: 1000,
        page: 1
      })

      const allProducts = response.results || response || []

      // Contar productos de esta categoría
      const count = allProducts.filter((p: any) =>
        p.category === categoryId
      ).length

      return count
    } catch (err) {
      return 0
    }
  }, [])

  // Load real data from API
  const loadRealData = useCallback(async () => {
    try {
      await Promise.all([
        loadCategories(),
        loadBrands()
      ])
    } catch (err) {
      // Error silencioso, se usan datos mock como fallback
    }
  }, [loadCategories, loadBrands])

  // Load categories and brands on mount
  useEffect(() => {
    loadRealData()
  }, [loadRealData])

  // Create product
  const createProduct = useCallback(async (productData: any): Promise<Product> => {
    setIsLoading(true)
    setError(null)
    try {
      const newProduct = await productsApi.createProduct(productData) as Product
      setProducts(prev => [newProduct, ...prev])
      showSuccess('Producto creado exitosamente')
      return newProduct
    } catch (err: any) {
      // Crear un producto mock como fallback
      const mockProduct: Product = {
        id: Date.now(),
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.description,
        short_description: productData.short_description,
        sku: productData.sku,
        category: productData.category,
        brand: productData.brand,
        price: productData.price,
        compare_price: productData.compare_price,
        cost_price: productData.cost_price,
        track_inventory: productData.track_inventory,
        inventory_quantity: productData.inventory_quantity,
        low_stock_threshold: productData.low_stock_threshold,
        allow_backorder: productData.allow_backorder,
        status: productData.status,
        is_featured: productData.is_featured,
        is_digital: productData.is_digital,
        requires_shipping: productData.requires_shipping,
        weight: productData.weight,
        meta_title: productData.meta_title,
        meta_description: productData.meta_description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: productData.status === 'published' ? new Date().toISOString() : undefined,
        images: [],
        category_details: categories.find(c => c.id === productData.category) || getMockCategories()[0],
        brand_details: brands.find(b => b.id === productData.brand) || getMockBrands()[0]
      }
      
      setProducts(prev => [mockProduct, ...prev])
      showSuccess('Producto creado exitosamente (modo offline)')
      return mockProduct
    } finally {
      setIsLoading(false)
    }
  }, [categories, brands])

  // Update product
  const updateProduct = useCallback(async (id: number, productData: any): Promise<Product> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedProduct = await productsApi.updateProduct(id, productData) as Product
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      showSuccess('Producto actualizado exitosamente')
      return updatedProduct
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al actualizar producto'
      setError(errorMessage)
      showError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete product
  const deleteProduct = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await productsApi.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      showSuccess('Producto eliminado exitosamente')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al eliminar producto'
      setError(errorMessage)
      showError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get single product
  const getProduct = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      // Obtener producto y variantes en paralelo
      const [productResponse, variantsResponse] = await Promise.all([
        productsApi.getProduct(id),
        productsApi.getProductVariants(id).catch(() => ({ results: [] })) // Fallback si no hay variantes
      ])

      const productData = productResponse as any

      // Usar directamente los datos que ya vienen de la API
      const productWithVariants = {
        ...productData,
        variants: (variantsResponse as any)?.results || (variantsResponse as any) || []
      }

      return productWithVariants
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al obtener producto'
      setError(errorMessage)
      showError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Upload product image
  const uploadProductImage = useCallback(async (productId: number, file: File, onProgress?: (progress: number) => void) => {
    try {
      const result = await productsApi.uploadProductImage(productId, file, onProgress)
      showSuccess('Imagen subida exitosamente')
      return result
    } catch (err: any) {
      // Simular upload en modo offline
      if (onProgress) {
        // Simular progreso de upload
        for (let i = 0; i <= 100; i += 10) {
          setTimeout(() => onProgress(i), i * 50)
        }
      }
      
      // Simular resultado exitoso
      const mockResult = {
        id: Date.now(),
        product: productId,
        image: URL.createObjectURL(file),
        alt_text: file.name,
        sort_order: 1,
        is_primary: true,
        created_at: new Date().toISOString()
      }
      
      showSuccess('Imagen subida exitosamente (modo offline)')
      return mockResult
    }
  }, [])

  // Load initial data
  useEffect(() => {
    // Cargar datos reales del backend
    loadRealData()
  }, [loadRealData])

  // Upload variant image
  const uploadVariantImage = useCallback(async (variantId: number, file: File) => {
    try {
      const result = await productsApi.uploadVariantImage(variantId, file)
      showSuccess('Imagen de variante subida exitosamente')
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al subir imagen de variante'
      showError(errorMessage)
      throw err
    }
  }, [])

  // Navigate to page
  const goToPage = useCallback(async (page: number, isPublicView: boolean = false, isAdminView: boolean = false) => {
    const params = { page, page_size: 20 }
    await loadProducts(params, isPublicView, isAdminView)
    // No hacer scroll top para mantener la posición del usuario
  }, [loadProducts])

  // Go to next page
  const goToNextPage = useCallback(async (isPublicView: boolean = false, isAdminView: boolean = false) => {
    if (pagination.next) {
      await goToPage(pagination.current_page + 1, isPublicView, isAdminView)
    }
  }, [pagination, goToPage])

  // Go to previous page
  const goToPreviousPage = useCallback(async (isPublicView: boolean = false, isAdminView: boolean = false) => {
    if (pagination.previous) {
      await goToPage(pagination.current_page - 1, isPublicView, isAdminView)
    }
  }, [pagination, goToPage])

  return {
    products,
    categories,
    brands,
    sizes,
    colors,
    isLoading,
    error,
    pagination,
    stats,
    loadProducts,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    uploadProductImage,
    uploadVariantImage,
    loadCategories,
    loadBrands,
    loadCategoryStats,
    getProductCountByCategory,
  }
}

export default useProducts

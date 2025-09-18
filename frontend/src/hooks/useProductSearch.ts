import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'

interface SearchResult {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number
  image?: string
  category: {
    name: string
  }
  brand?: {
    name: string
  }
}

export const useProductSearch = (query: string, delay: number = 300) => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/products/?search=${encodeURIComponent(searchQuery)}&status=published&page_size=8`
      )
      
      if (response.ok) {
        const data = await response.json()
        const products = data.results || []
        
        // Mapear los productos al formato de SearchResult
        const mappedResults = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: parseFloat(product.price),
          compare_price: product.compare_price ? parseFloat(product.compare_price) : undefined,
          image: product.images?.[0]?.image || '/images/placeholder-product.jpg',
          category: {
            name: product.category?.name || 'Sin categoría'
          },
          brand: product.brand ? {
            name: product.brand.name
          } : undefined
        }))
        
        setResults(mappedResults)
      } else {
        throw new Error('Error al buscar productos')
      }
    } catch (err) {
      setError('Error al buscar productos')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [query, searchProducts, delay])

  return {
    results,
    isLoading,
    error,
    searchProducts
  }
}

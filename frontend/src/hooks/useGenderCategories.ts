import { useState, useEffect, useCallback } from 'react'
import { Category } from '@/types'

interface GenderCategory {
  id: number
  name: string
  slug: string
  productCount: number
}

export const useGenderCategories = (gender: 'men' | 'women' | 'unisex') => {
  const [categories, setCategories] = useState<GenderCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadGenderCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log(`Loading categories for gender: ${gender}`)
      
      // Cargar categorías desde la API de categorías
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/categories/`)
      const data = await response.json()
      
      if (response.ok && data.results) {
        // Mapear product_count a productCount y filtrar categorías que tienen productos
        const mappedCategories = data.results.map((category: any) => ({
          ...category,
          productCount: category.product_count || 0
        }))
        
        const categoriesWithProducts = mappedCategories.filter((category: any) => 
          (category.productCount || 0) > 0
        )
        
        console.log(`Found ${categoriesWithProducts.length} categories with products:`, categoriesWithProducts)
        setCategories(categoriesWithProducts)
      } else {
        throw new Error('Error al cargar categorías')
      }
    } catch (err) {
      console.error('Error loading gender categories:', err)
      setError('Error al cargar categorías')
    } finally {
      setIsLoading(false)
    }
  }, [gender])

  useEffect(() => {
    loadGenderCategories()
  }, [loadGenderCategories])

  return {
    categories,
    isLoading,
    error,
    loadGenderCategories
  }
}

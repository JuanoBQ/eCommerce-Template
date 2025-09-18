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
      // Cargar categorías filtradas por género desde el nuevo endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/categories/by_gender/?gender=${gender}`)
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        // Mapear product_count a productCount
        const mappedCategories = data.map((category: any) => ({
          ...category,
          productCount: category.product_count || 0
        }))
        
        setCategories(mappedCategories)
      } else {
        throw new Error('Error al cargar categorías')
      }
    } catch (err) {
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

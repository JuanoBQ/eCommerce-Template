import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from '@/lib/api'
import { Category } from '@/types'
import toast from 'react-hot-toast'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Cargar todos los productos para obtener todas las categorías disponibles
      let allCategories = new Map()
      let nextUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/products/?page_size=100`
      
      // Cargar todas las páginas de productos para obtener todas las categorías
      while (nextUrl) {
        const response = await fetch(nextUrl)
        const data = await response.json()
        
        if (response.ok && data.results) {
          data.results.forEach((product: any) => {
            if (product.category_details) {
              allCategories.set(product.category_details.id, {
                id: product.category_details.id,
                name: product.category_details.name,
                slug: product.category_details.slug
              })
            }
          })
          
          nextUrl = data.next
        } else {
          break
        }
      }
      
      const categoriesArray = Array.from(allCategories.values())
      setCategories(categoriesArray)
    } catch (err) {
      // Error loading categories
      setError('Error al cargar categorías')
      // No mostrar toast de error para evitar spam
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const newCategory = await categoriesApi.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory as Category])
      return newCategory
    } catch (err: any) {
      // Error creating category
      const errorMessage = err.response?.data?.detail || 'Error al crear categoría'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCategory = useCallback(async (id: number, categoryData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedCategory = await categoriesApi.updateCategory(id, categoryData)
      setCategories(prev => prev.map(cat => cat.id === id ? (updatedCategory as Category) : cat))
      return updatedCategory
    } catch (err: any) {
      // Error updating category
      const errorMessage = err.response?.data?.detail || 'Error al actualizar categoría'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteCategory = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await categoriesApi.deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err: any) {
      // Error deleting category
      const errorMessage = err.response?.data?.detail || 'Error al eliminar categoría'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCategory = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const category = await categoriesApi.getCategory(id)
      return category
    } catch (err: any) {
      // Error getting category
      const errorMessage = err.response?.data?.detail || 'Error al obtener categoría'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    isLoading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory
  }
}
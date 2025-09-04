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
      const response = await categoriesApi.getCategories()
      setCategories(response.results || response)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Error al cargar categorías')
      toast.error('Error al cargar categorías')
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
      console.error('Error creating category:', err)
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
      console.error('Error updating category:', err)
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
      console.error('Error deleting category:', err)
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
      console.error('Error getting category:', err)
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
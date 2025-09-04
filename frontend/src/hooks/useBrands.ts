import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  is_active: boolean
  sort_order: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBrands = useCallback(async () => {
    console.log('🔍 Loading brands from API...')
    setIsLoading(true)
    setError(null)
    try {
      const response = await categoriesApi.getBrands()
      console.log('🔍 Brands response:', response)
      setBrands(response.results || response)
    } catch (err) {
      console.error('Error loading brands:', err)
      setError('Error al cargar marcas')
      toast.error('Error al cargar marcas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createBrand = useCallback(async (brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBrand = await categoriesApi.createBrand(brandData)
      setBrands(prev => [...prev, newBrand as Brand])
      toast.success('Marca creada exitosamente')
      return newBrand
    } catch (err: any) {
      console.error('Error creating brand:', err)
      const errorMessage = err.response?.data?.detail || 'Error al crear marca'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updateBrand = useCallback(async (id: number, brandData: Partial<Brand>) => {
    try {
      const updatedBrand = await categoriesApi.updateBrand(id, brandData)
      setBrands(prev => prev.map(brand => 
        brand.id === id ? (updatedBrand as Brand) : brand
      ))
      toast.success('Marca actualizada exitosamente')
      return updatedBrand
    } catch (err: any) {
      console.error('Error updating brand:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar marca'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const deleteBrand = useCallback(async (id: number) => {
    try {
      await categoriesApi.deleteBrand(id)
      setBrands(prev => prev.filter(brand => brand.id !== id))
      toast.success('Marca eliminada exitosamente')
    } catch (err: any) {
      console.error('Error deleting brand:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar marca'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const getBrand = useCallback(async (id: number) => {
    try {
      const brand = await categoriesApi.getBrand(id)
      return brand
    } catch (err: any) {
      console.error('Error getting brand:', err)
      const errorMessage = err.response?.data?.detail || 'Error al obtener marca'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const getActiveBrands = useCallback(() => {
    return brands.filter(brand => brand.is_active)
  }, [brands])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  return {
    brands,
    isLoading,
    error,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getActiveBrands
  }
}

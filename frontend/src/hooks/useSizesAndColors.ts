import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Size {
  id: number
  name: string
  type: 'clothing' | 'shoes' | 'accessories'
  sort_order: number
  is_active: boolean
}

export interface Color {
  id: number
  name: string
  hex_code?: string
  is_active: boolean
}

export const useSizesAndColors = () => {
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos mock para desarrollo
  const mockSizes: Size[] = [
    { id: 1, name: 'XS', type: 'clothing', sort_order: 1, is_active: true },
    { id: 2, name: 'S', type: 'clothing', sort_order: 2, is_active: true },
    { id: 3, name: 'M', type: 'clothing', sort_order: 3, is_active: true },
    { id: 4, name: 'L', type: 'clothing', sort_order: 4, is_active: true },
    { id: 5, name: 'XL', type: 'clothing', sort_order: 5, is_active: true },
    { id: 6, name: '35', type: 'shoes', sort_order: 1, is_active: true },
    { id: 7, name: '36', type: 'shoes', sort_order: 2, is_active: true },
    { id: 8, name: '37', type: 'shoes', sort_order: 3, is_active: true },
    { id: 9, name: '38', type: 'shoes', sort_order: 4, is_active: true },
    { id: 10, name: '39', type: 'shoes', sort_order: 5, is_active: true },
    { id: 11, name: '40', type: 'shoes', sort_order: 6, is_active: true },
    { id: 12, name: '41', type: 'shoes', sort_order: 7, is_active: true },
    { id: 13, name: '42', type: 'shoes', sort_order: 8, is_active: true },
    { id: 14, name: '43', type: 'shoes', sort_order: 9, is_active: true },
    { id: 15, name: '44', type: 'shoes', sort_order: 10, is_active: true },
    { id: 16, name: '45', type: 'shoes', sort_order: 11, is_active: true },
  ]

  const mockColors: Color[] = [
    { id: 1, name: 'Negro', hex_code: '#000000', is_active: true },
    { id: 2, name: 'Blanco', hex_code: '#FFFFFF', is_active: true },
    { id: 3, name: 'Rojo', hex_code: '#FF0000', is_active: true },
    { id: 4, name: 'Azul', hex_code: '#0000FF', is_active: true },
    { id: 5, name: 'Verde', hex_code: '#00FF00', is_active: true },
    { id: 6, name: 'Amarillo', hex_code: '#FFFF00', is_active: true },
    { id: 7, name: 'Rosa', hex_code: '#FFC0CB', is_active: true },
    { id: 8, name: 'Gris', hex_code: '#808080', is_active: true },
    { id: 9, name: 'Marrón', hex_code: '#A52A2A', is_active: true },
    { id: 10, name: 'Naranja', hex_code: '#FFA500', is_active: true },
  ]

  const loadSizes = useCallback(async () => {
    console.log('🔍 Loading sizes from API...')
    setIsLoading(true)
    setError(null)
    try {
      // Cargar todas las tallas de todos los tipos
      const [clothingRes, shoesRes, accessoriesRes] = await Promise.all([
        categoriesApi.getSizes('clothing'),
        categoriesApi.getSizes('shoes'), 
        categoriesApi.getSizes('accessories')
      ])
      
      console.log('🔍 Clothing sizes response:', clothingRes)
      console.log('🔍 Shoes sizes response:', shoesRes)
      console.log('🔍 Accessories sizes response:', accessoriesRes)
      
      const allSizes = [
        ...(clothingRes.results || clothingRes || []),
        ...(shoesRes.results || shoesRes || []),
        ...(accessoriesRes.results || accessoriesRes || [])
      ]
      
      console.log('🔍 All sizes combined:', allSizes)
      setSizes(allSizes)
    } catch (err) {
      console.error('Error loading sizes, using mock data:', err)
      // Usar datos mock como fallback
      setSizes(mockSizes)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadColors = useCallback(async () => {
    console.log('🔍 Loading colors from API...')
    setIsLoading(true)
    setError(null)
    try {
      const response = await categoriesApi.getColors()
      console.log('🔍 Colors response:', response)
      setColors(response.results || response)
    } catch (err) {
      console.error('Error loading colors, using mock data:', err)
      // Usar datos mock como fallback
      setColors(mockColors)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createSize = useCallback(async (sizeData: Omit<Size, 'id'>) => {
    try {
      const newSize = await categoriesApi.createSize(sizeData)
      setSizes(prev => [...prev, newSize as Size])
      toast.success('Talla creada exitosamente')
      return newSize
    } catch (err: any) {
      console.error('Error creating size:', err)
      const errorMessage = err.response?.data?.detail || 'Error al crear talla'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updateSize = useCallback(async (id: number, sizeData: Partial<Size>) => {
    try {
      const updatedSize = await categoriesApi.updateSize(id, sizeData)
      setSizes(prev => prev.map(size => 
        size.id === id ? (updatedSize as Size) : size
      ))
      toast.success('Talla actualizada exitosamente')
      return updatedSize
    } catch (err: any) {
      console.error('Error updating size:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar talla'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const deleteSize = useCallback(async (id: number) => {
    try {
      await categoriesApi.deleteSize(id)
      setSizes(prev => prev.filter(size => size.id !== id))
      toast.success('Talla eliminada exitosamente')
    } catch (err: any) {
      console.error('Error deleting size:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar talla'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const createColor = useCallback(async (colorData: Omit<Color, 'id'>) => {
    try {
      const newColor = await categoriesApi.createColor(colorData)
      setColors(prev => [...prev, newColor as Color])
      toast.success('Color creado exitosamente')
      return newColor
    } catch (err: any) {
      console.error('Error creating color:', err)
      const errorMessage = err.response?.data?.detail || 'Error al crear color'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updateColor = useCallback(async (id: number, colorData: Partial<Color>) => {
    try {
      const updatedColor = await categoriesApi.updateColor(id, colorData)
      setColors(prev => prev.map(color => 
        color.id === id ? (updatedColor as Color) : color
      ))
      toast.success('Color actualizado exitosamente')
      return updatedColor
    } catch (err: any) {
      console.error('Error updating color:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar color'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const deleteColor = useCallback(async (id: number) => {
    try {
      await categoriesApi.deleteColor(id)
      setColors(prev => prev.filter(color => color.id !== id))
      toast.success('Color eliminado exitosamente')
    } catch (err: any) {
      console.error('Error deleting color:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar color'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const getSizesByType = useCallback((type: 'clothing' | 'shoes' | 'accessories') => {
    return sizes.filter(size => size.type === type)
  }, [sizes])

  const getActiveSizes = useCallback(() => {
    return sizes.filter(size => size.is_active)
  }, [sizes])

  const getActiveColors = useCallback(() => {
    return colors.filter(color => color.is_active)
  }, [colors])

  useEffect(() => {
    loadSizes()
    loadColors()
  }, [loadSizes, loadColors])

  return {
    sizes,
    colors,
    isLoading,
    error,
    loadSizes,
    loadColors,
    createSize,
    updateSize,
    deleteSize,
    createColor,
    updateColor,
    deleteColor,
    getSizesByType,
    getActiveSizes,
    getActiveColors
  }
}

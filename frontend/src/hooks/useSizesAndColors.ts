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
  hex_code: string
  is_active: boolean
}

export const useSizesAndColors = () => {
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos mock para desarrollo
  const mockSizes: Size[] = [
    { id: 1, name: 'XS', type: 'letter', sort_order: 1, is_active: true },
    { id: 2, name: 'S', type: 'letter', sort_order: 2, is_active: true },
    { id: 3, name: 'M', type: 'letter', sort_order: 3, is_active: true },
    { id: 4, name: 'L', type: 'letter', sort_order: 4, is_active: true },
    { id: 5, name: 'XL', type: 'letter', sort_order: 5, is_active: true },
    { id: 6, name: '35', type: 'number', sort_order: 1, is_active: true },
    { id: 7, name: '36', type: 'number', sort_order: 2, is_active: true },
    { id: 8, name: '37', type: 'number', sort_order: 3, is_active: true },
    { id: 9, name: '38', type: 'number', sort_order: 4, is_active: true },
    { id: 10, name: '39', type: 'number', sort_order: 5, is_active: true },
    { id: 11, name: '40', type: 'number', sort_order: 6, is_active: true },
    { id: 12, name: '41', type: 'number', sort_order: 7, is_active: true },
    { id: 13, name: '42', type: 'number', sort_order: 8, is_active: true },
    { id: 14, name: '43', type: 'number', sort_order: 9, is_active: true },
    { id: 15, name: '44', type: 'number', sort_order: 10, is_active: true },
    { id: 16, name: '45', type: 'number', sort_order: 11, is_active: true },
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
      const newSize: Size = {
        id: Date.now(), // ID temporal
        ...sizeData
      }
      setSizes(prev => [...prev, newSize])
      return newSize
    } catch (err) {
      console.error('Error creating size:', err)
      toast.error('Error al crear talla')
      throw err
    }
  }, [])

  const updateSize = useCallback(async (id: number, sizeData: Partial<Size>) => {
    try {
      setSizes(prev => prev.map(size => 
        size.id === id ? { ...size, ...sizeData } : size
      ))
    } catch (err) {
      console.error('Error updating size:', err)
      toast.error('Error al actualizar talla')
      throw err
    }
  }, [])

  const deleteSize = useCallback(async (id: number) => {
    try {
      setSizes(prev => prev.filter(size => size.id !== id))
    } catch (err) {
      console.error('Error deleting size:', err)
      toast.error('Error al eliminar talla')
      throw err
    }
  }, [])

  const createColor = useCallback(async (colorData: Omit<Color, 'id'>) => {
    try {
      const newColor: Color = {
        id: Date.now(), // ID temporal
        ...colorData
      }
      setColors(prev => [...prev, newColor])
      return newColor
    } catch (err) {
      console.error('Error creating color:', err)
      toast.error('Error al crear color')
      throw err
    }
  }, [])

  const updateColor = useCallback(async (id: number, colorData: Partial<Color>) => {
    try {
      setColors(prev => prev.map(color => 
        color.id === id ? { ...color, ...colorData } : color
      ))
    } catch (err) {
      console.error('Error updating color:', err)
      toast.error('Error al actualizar color')
      throw err
    }
  }, [])

  const deleteColor = useCallback(async (id: number) => {
    try {
      setColors(prev => prev.filter(color => color.id !== id))
    } catch (err) {
      console.error('Error deleting color:', err)
      toast.error('Error al eliminar color')
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

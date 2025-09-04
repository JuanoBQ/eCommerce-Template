import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Review {
  id: number
  user: number
  user_details: string
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  rating: number
  title: string
  comment: string
}

export const useReviews = (productId?: number) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar reviews de un producto
  const loadReviews = useCallback(async (id?: number) => {
    const targetProductId = id || productId
    if (!targetProductId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get(`/products/${targetProductId}/reviews/`)
      setReviews((response as any).results || response || [])
    } catch (err: any) {
      console.error('Error loading reviews:', err)
      const errorMessage = err.response?.data?.detail || 'Error al cargar las reseñas'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  // Crear nueva review
  const createReview = useCallback(async (reviewData: CreateReviewData) => {
    if (!productId) {
      toast.error('ID del producto requerido')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.post(`/products/${productId}/reviews/`, reviewData)
      
      // Recargar reviews para mostrar la nueva
      await loadReviews()
      
      toast.success('Reseña agregada exitosamente')
      return response
    } catch (err: any) {
      console.error('Error creating review:', err)
      
      // Manejar error específico de reseña duplicada
      if (err.response?.data?.non_field_errors) {
        const duplicateError = err.response.data.non_field_errors.find((error: string) => 
          error.includes('Ya has escrito una reseña')
        )
        if (duplicateError) {
          toast.error(duplicateError)
          setError(duplicateError)
          throw err
        }
      }
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Error al crear la reseña'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [productId, loadReviews])

  // Actualizar review
  const updateReview = useCallback(async (reviewId: number, reviewData: Partial<CreateReviewData>) => {
    if (!productId) {
      toast.error('ID del producto requerido')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.patch(`/products/${productId}/reviews/${reviewId}/`, reviewData)
      
      // Recargar reviews para mostrar los cambios
      await loadReviews()
      
      toast.success('Reseña actualizada exitosamente')
      return response
    } catch (err: any) {
      console.error('Error updating review:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar la reseña'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [productId, loadReviews])

  // Eliminar review
  const deleteReview = useCallback(async (reviewId: number) => {
    if (!productId) {
      toast.error('ID del producto requerido')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await apiClient.delete(`/products/${productId}/reviews/${reviewId}/`)
      
      // Recargar reviews para mostrar los cambios
      await loadReviews()
      
      toast.success('Reseña eliminada exitosamente')
    } catch (err: any) {
      console.error('Error deleting review:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar la reseña'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [productId, loadReviews])

  // Calcular estadísticas de reviews
  const getReviewStats = useCallback(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1
      return acc
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      ratingDistribution
    }
  }, [reviews])

  // Cargar reviews al montar el componente
  useEffect(() => {
    if (productId) {
      loadReviews()
    }
  }, [productId, loadReviews])

  return {
    reviews,
    isLoading,
    error,
    loadReviews,
    createReview,
    updateReview,
    deleteReview,
    getReviewStats
  }
}

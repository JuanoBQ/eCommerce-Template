import { useState, useEffect, useCallback } from 'react'
import { reportsApi } from '@/lib/api'

export interface ClaimMessage {
  id: number
  claim: number
  message_type: 'user_message' | 'admin_response' | 'system_notification'
  content: string
  author: number
  author_name: string
  author_email: string
  created_at: string
  updated_at: string
}

export interface Claim {
  id: number
  user: number
  user_name: string
  user_email: string
  claim_type: 'product_issue' | 'shipping_issue' | 'payment_issue' | 'service_issue' | 'other'
  title: string
  description: string
  status: 'pending' | 'in_review' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  order?: number
  order_number?: string
  product?: number
  product_name?: string
  product_sku?: string
  admin_response?: string
  resolved_by?: number
  resolved_by_name?: string
  resolved_at?: string
  created_at: string
  updated_at: string
  messages?: ClaimMessage[]
}

export interface ClaimCreateData {
  claim_type: 'product_issue' | 'shipping_issue' | 'payment_issue' | 'service_issue' | 'other'
  title: string
  description: string
  order?: number
  product?: number
}

export interface ClaimUpdateData {
  status?: 'pending' | 'in_review' | 'resolved' | 'rejected'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  admin_response?: string
}



export interface ClaimsReport {
  summary: {
    total_claims: number
    pending_claims: number
    in_review_claims: number
    resolved_claims: number
    rejected_claims: number
    avg_resolution_time_hours?: number
  }
  claims_by_type: Array<{
    claim_type: string
    count: number
  }>
  claims_by_priority: Array<{
    priority: string
    count: number
  }>
  recent_claims: Array<{
    id: number
    user_name: string
    title: string
    claim_type: string
    status: string
    priority: string
    created_at: string
  }>
  monthly_claims: Array<{
    month: string
    count: number
  }>
}

export interface ReviewsReport {
  summary: {
    total_reviews: number
    approved_reviews: number
    pending_reviews: number
    average_rating: number
  }
  rating_distribution: Array<{
    rating: number
    count: number
  }>
  top_reviewed_products: Array<{
    id: number
    name: string
    review_count: number
    average_rating: number
  }>
  recent_reviews: Array<{
    id: number
    user_name: string
    product_name: string
    rating: number
    title: string
    created_at: string
  }>
  monthly_reviews: Array<{
    month: string
    count: number
    avg_rating: number
  }>
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar reclamos
  const loadClaims = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Cargando reclamos...')
      const response = await reportsApi.getClaims()
      console.log('📊 Respuesta de la API:', response)
      
      let claimsData = []
      
      if (response) {
        if (Array.isArray(response)) {
          claimsData = response
          console.log('✅ Datos como array directo:', claimsData.length, 'reclamos')
        } else if (response.results && Array.isArray(response.results)) {
          claimsData = response.results
          console.log('✅ Datos en results:', claimsData.length, 'reclamos')
        } else if ((response as any).data && Array.isArray((response as any).data)) {
          claimsData = (response as any).data
          console.log('✅ Datos en data:', claimsData.length, 'reclamos')
        } else {
          console.log('❌ Estructura de datos no reconocida:', Object.keys(response))
        }
      } else {
        console.log('❌ No hay data en la respuesta')
      }
      
      console.log('📋 Claims finales:', claimsData)
      setClaims(claimsData)
    } catch (err: any) {
      console.error('❌ Error loading claims:', err)
      console.error('❌ Error response:', err.response)
      setError(err.response?.data?.detail || 'Error al cargar los reclamos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear reclamo
  const createClaim = useCallback(async (claimData: ClaimCreateData): Promise<Claim> => {
    try {
      setError(null)
      const response = await reportsApi.createClaim(claimData)
      await loadClaims() // Recargar la lista
      return (response as any).data
    } catch (err: any) {
      console.error('Error creating claim:', err)
      const errorMessage = err.response?.data?.detail || 'Error al crear el reclamo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadClaims])

  // Actualizar reclamo
  const updateClaim = useCallback(async (claimId: number, updateData: ClaimUpdateData): Promise<Claim> => {
    try {
      setError(null)
      const response = await reportsApi.updateClaim(claimId, updateData)
      await loadClaims() // Recargar la lista
      return (response as any).data
    } catch (err: any) {
      console.error('Error updating claim:', err)
      const errorMessage = err.response?.data?.detail || 'Error al actualizar el reclamo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadClaims])

  // Eliminar reclamo
  const deleteClaim = useCallback(async (claimId: number): Promise<void> => {
    try {
      setError(null)
      await reportsApi.deleteClaim(claimId)
      await loadClaims() // Recargar la lista
    } catch (err: any) {
      console.error('Error deleting claim:', err)
      const errorMessage = err.response?.data?.detail || 'Error al eliminar el reclamo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadClaims])

  // Obtener reclamo por ID
  const getClaim = useCallback(async (claimId: number): Promise<Claim> => {
    try {
      setError(null)
      const response = await reportsApi.getClaim(claimId)
      return (response as any).data
    } catch (err: any) {
      console.error('Error getting claim:', err)
      const errorMessage = err.response?.data?.detail || 'Error al obtener el reclamo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])



  // Cargar reclamos al montar el componente
  useEffect(() => {
    loadClaims()
  }, [loadClaims])

  return {
    claims,
    loading,
    error,
    loadClaims,
    createClaim,
    updateClaim,
    deleteClaim,
    getClaim
  }
}

export function useClaimsReport() {
  const [report, setReport] = useState<ClaimsReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Loading claims report...')
      const data = await reportsApi.getClaimsReport()
      console.log('🔍 Claims report data:', data)
      setReport(data as ClaimsReport)
    } catch (err: any) {
      console.error('Error loading claims report:', err)
      console.error('Error details:', err.response)
      setError(err.response?.data?.detail || 'Error al cargar el reporte de reclamos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  return {
    report,
    loading,
    error,
    loadReport
  }
}

export function useReviewsReport() {
  const [report, setReport] = useState<ReviewsReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Loading reviews report...')
      const data = await reportsApi.getReviewsReport()
      console.log('🔍 Reviews report data:', data)
      setReport(data as ReviewsReport)
    } catch (err: any) {
      console.error('Error loading reviews report:', err)
      console.error('Error details:', err.response)
      setError(err.response?.data?.detail || 'Error al cargar el reporte de reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  return {
    report,
    loading,
    error,
    loadReport
  }
}

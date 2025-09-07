import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { reportsApi } from '@/lib/api'

export interface ReportData {
  period: string
  revenue: number
  orders: number
  customers: number
  products: number
}

export interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
}

export interface TopCustomer {
  id: number
  name: string
  email: string
  orders: number
  totalSpent: number
}

export interface DashboardReport {
  summary: {
    total_revenue: number
    total_orders: number
    total_customers: number
    total_products: number
    revenue_growth: number
    orders_growth: number
    customers_growth: number
    products_growth: number
  }
  monthly_data: ReportData[]
  top_products: TopProduct[]
  top_customers: TopCustomer[]
}

export function useReports(dateRange: string = '30') {
  const [report, setReport] = useState<DashboardReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando reporte del dashboard...')
      
      // Usar el apiClient configurado
      const data = await apiClient.get(`/reports/dashboard/?days=${dateRange}`)
      console.log('📊 Datos del API:', data)
      console.log('📊 Tipo de datos:', typeof data)
      
      if (!data) {
        throw new Error('No se recibieron datos del servidor')
      }
      
      console.log('📊 Estructura de datos:', {
        summary: data.summary,
        monthly_data: data.monthly_data,
        top_products: data.top_products,
        top_customers: data.top_customers
      })
      setReport(data)
    } catch (err: any) {
      console.error('❌ Error loading dashboard report:', err)
      setError(err.response?.data?.detail || err.message || 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

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

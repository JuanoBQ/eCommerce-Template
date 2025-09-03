import { useState, useEffect, useCallback } from 'react'
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
      const response = await reportsApi.getDashboardData()
      setReport(response.data)
    } catch (err: any) {
      console.error('Error loading dashboard report:', err)
      setError(err.response?.data?.detail || 'Error al cargar el reporte')
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

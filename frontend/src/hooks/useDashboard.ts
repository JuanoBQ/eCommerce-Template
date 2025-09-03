import { useState, useEffect, useCallback } from 'react'
import { useOrders } from './useOrders'
import { useProducts } from './useProducts'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  revenueGrowth: number
  ordersGrowth: number
  productsGrowth: number
  usersGrowth: number
}

export interface ChartData {
  name: string
  value: number
  revenue?: number
  orders?: number
}

export interface RecentActivity {
  id: string
  action: string
  user: string
  time: string
  amount?: string
  type: 'order' | 'product' | 'user' | 'review'
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    usersGrowth: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [categoryData, setCategoryData] = useState<ChartData[]>([])
  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { orders } = useOrders()
  const { products, categories } = useProducts()
  const { user } = useAuth()

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Calcular estadísticas de pedidos
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total_amount || 0)
      }, 0)

      // Calcular estadísticas de productos
      const totalProducts = products.length
      const publishedProducts = products.filter(p => p.status === 'published').length

      // Calcular distribución por categorías
      const categoryStats = categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category.id)
        const percentage = totalProducts > 0 ? (categoryProducts.length / totalProducts) * 100 : 0
        return {
          name: category.name,
          value: Math.round(percentage)
        }
      }).filter(cat => cat.value > 0)

      // Generar datos de ingresos mensuales (últimos 7 meses)
      const monthlyRevenue = generateMonthlyRevenueData(orders)
      
      // Generar actividad reciente
      const activity = generateRecentActivity(orders, products)

      // Calcular crecimiento (simulado por ahora)
      const revenueGrowth = calculateGrowth(totalRevenue, 100000) // Comparar con mes anterior simulado
      const ordersGrowth = calculateGrowth(totalOrders, 1000)
      const productsGrowth = calculateGrowth(totalProducts, 80)
      const usersGrowth = 0 // No tenemos datos de usuarios aún

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: publishedProducts,
        totalUsers: 0, // Se implementará cuando tengamos gestión de usuarios
        revenueGrowth,
        ordersGrowth,
        productsGrowth,
        usersGrowth
      })

      setCategoryData(categoryStats)
      setRevenueData(monthlyRevenue)
      setRecentActivity(activity)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar datos del dashboard')
      toast.error('Error al cargar datos del dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [orders, products, categories])

  const generateMonthlyRevenueData = (orders: any[]): ChartData[] => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']
    const currentMonth = new Date().getMonth()
    
    return months.map((month, index) => {
      // Simular datos históricos para meses anteriores
      const isCurrentMonth = index === currentMonth
      const revenue = isCurrentMonth 
        ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        : Math.floor(Math.random() * 5000) + 1000
      
      const orderCount = isCurrentMonth 
        ? orders.length
        : Math.floor(Math.random() * 50) + 10

      return {
        name: month,
        value: revenue,
        revenue,
        orders: orderCount
      }
    })
  }

  const generateRecentActivity = (orders: any[], products: any[]): RecentActivity[] => {
    const activities: RecentActivity[] = []

    // Actividad de pedidos recientes
    orders.slice(0, 3).forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        action: 'Nuevo pedido',
        user: order.user?.first_name || 'Usuario',
        time: formatTimeAgo(order.created_at),
        amount: `$${order.total_amount?.toLocaleString()}`,
        type: 'order'
      })
    })

    // Actividad de productos recientes
    products.slice(0, 2).forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        action: 'Producto actualizado',
        user: 'Admin',
        time: formatTimeAgo(product.updated_at),
        amount: product.name,
        type: 'product'
      })
    })

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
  }

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100 * 10) / 10
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hora${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''}`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} día${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    stats,
    recentActivity,
    categoryData,
    revenueData,
    isLoading,
    error,
    refreshData: loadDashboardData
  }
}

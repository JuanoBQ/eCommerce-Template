"use client"

import { useState, useEffect } from 'react'
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'

interface ReportData {
  period: string
  revenue: number
  orders: number
  customers: number
  products: number
}

interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
}

interface TopCustomer {
  id: number
  name: string
  email: string
  orders: number
  totalSpent: number
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30')
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])

  useEffect(() => {
    loadReports()
  }, [dateRange])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Datos de ejemplo para gráficos
      const mockReportData: ReportData[] = [
        { period: 'Ene', revenue: 12000, orders: 45, customers: 32, products: 89 },
        { period: 'Feb', revenue: 15000, orders: 52, customers: 38, products: 92 },
        { period: 'Mar', revenue: 18000, orders: 61, customers: 45, products: 95 },
        { period: 'Abr', revenue: 22000, orders: 73, customers: 52, products: 98 },
        { period: 'May', revenue: 25000, orders: 84, customers: 58, products: 101 },
        { period: 'Jun', revenue: 28000, orders: 92, customers: 65, products: 105 },
      ]
      
      const mockTopProducts: TopProduct[] = [
        { id: 1, name: 'Camiseta Nike Dri-FIT', sales: 45, revenue: 1349.55 },
        { id: 2, name: 'Zapatillas Puma RS-X', sales: 32, revenue: 2879.68 },
        { id: 3, name: 'Pantalón Adidas Training', sales: 28, revenue: 1399.72 },
        { id: 4, name: 'Mochila Under Armour', sales: 25, revenue: 999.75 },
        { id: 5, name: 'Gorra New Era', sales: 22, revenue: 659.78 },
      ]
      
      const mockTopCustomers: TopCustomer[] = [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com', orders: 8, totalSpent: 456.50 },
        { id: 2, name: 'María García', email: 'maria@example.com', orders: 6, totalSpent: 389.99 },
        { id: 3, name: 'Carlos López', email: 'carlos@example.com', orders: 5, totalSpent: 298.75 },
        { id: 4, name: 'Ana Martínez', email: 'ana@example.com', orders: 4, totalSpent: 234.50 },
        { id: 5, name: 'Luis Rodríguez', email: 'luis@example.com', orders: 3, totalSpent: 189.99 },
      ]
      
      setReportData(mockReportData)
      setTopProducts(mockTopProducts)
      setTopCustomers(mockTopCustomers)
    } catch (error) {
      toast.error('Error al cargar reportes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Reporte exportado en formato ${format.toUpperCase()}`)
  }

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const currentPeriod = reportData[reportData.length - 1]
  const previousPeriod = reportData[reportData.length - 2]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
          <p className="text-dark-400 mt-2">Análisis y estadísticas de tu negocio</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            title="Seleccionar rango de fechas"
            aria-label="Seleccionar rango de fechas para el reporte"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportReport('pdf')}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${currentPeriod?.revenue.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                {getGrowthPercentage(currentPeriod?.revenue || 0, previousPeriod?.revenue || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  getGrowthPercentage(currentPeriod?.revenue || 0, previousPeriod?.revenue || 0) >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(getGrowthPercentage(currentPeriod?.revenue || 0, previousPeriod?.revenue || 0)).toFixed(1)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Pedidos</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod?.orders || 0}
              </p>
              <div className="flex items-center mt-2">
                {getGrowthPercentage(currentPeriod?.orders || 0, previousPeriod?.orders || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  getGrowthPercentage(currentPeriod?.orders || 0, previousPeriod?.orders || 0) >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(getGrowthPercentage(currentPeriod?.orders || 0, previousPeriod?.orders || 0)).toFixed(1)}%
                </span>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-neon-blue" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Nuevos Clientes</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod?.customers || 0}
              </p>
              <div className="flex items-center mt-2">
                {getGrowthPercentage(currentPeriod?.customers || 0, previousPeriod?.customers || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  getGrowthPercentage(currentPeriod?.customers || 0, previousPeriod?.customers || 0) >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(getGrowthPercentage(currentPeriod?.customers || 0, previousPeriod?.customers || 0)).toFixed(1)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-neon-purple" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Productos Vendidos</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod?.products || 0}
              </p>
              <div className="flex items-center mt-2">
                {getGrowthPercentage(currentPeriod?.products || 0, previousPeriod?.products || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  getGrowthPercentage(currentPeriod?.products || 0, previousPeriod?.products || 0) >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(getGrowthPercentage(currentPeriod?.products || 0, previousPeriod?.products || 0)).toFixed(1)}%
                </span>
              </div>
            </div>
            <Package className="w-8 h-8 text-neon-pink" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Ingresos Mensuales</h3>
            <LineChart className="w-5 h-5 text-neon-green" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00ff88" 
                strokeWidth={3}
                dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pedidos Mensuales</h3>
            <BarChart3 className="w-5 h-5 text-neon-blue" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="orders" fill="#00d4aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center mr-4 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-dark-400 text-sm">{product.sales} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-green font-semibold">${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mejores Clientes</h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center mr-4 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-dark-400 text-sm">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-blue font-semibold">${customer.totalSpent.toFixed(2)}</p>
                  <p className="text-dark-400 text-sm">{customer.orders} pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
